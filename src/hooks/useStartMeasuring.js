import { useEffect } from "react";
import { reachedMaxOfUsages, incrementUsages } from "@/lib/domain-utils";
import { UserData } from "@/lib/UserData";
import { usePushWithQuery } from "@/hooks/usePushWithQuery";

const FPS = 30;
const MAX_MEASURING_SECOND = 50;

export function useStartMeasuring({
  scriptLoaded,
  setProc,
  setScanningStatus,
  setValues,
  setShowHint,
  setMaskDimensions
}) {
  const push = usePushWithQuery();
  useEffect(() => {
    if (!scriptLoaded) {
      return;
    }
    if (reachedMaxOfUsages()) {
      alert("Ha alcanzado el número máximo de escaneos permitidos. Por favor, contacte con el soporte para más ayuda.");
      push("/basic_info");
      return;
    }

    const OnResult = (result) => {
      let proc = result.frame_id * 100 / ((MAX_MEASURING_SECOND) * FPS);
      setProc(proc)
      if ('scanning_status' in result && result.scanning_status !== "") {
        setScanningStatus(result.scanning_status);
      }
      else {
        setScanningStatus("")
        setValues({
          last_hr:          result.hr,
          last_hrv:         result.hrv_indices.SDNNI,
          last_sbp:         result.sbp,
          last_dbp:         result.dbp,
          last_rr:          result.rr,
          last_spo2:        result.spo2,
          last_si:          result.si,
          hr_valid:    (result.signal_quality.hr_hrv > 0.7),
          bp_valid:    (result.signal_quality.bp > 0.6),
          rr_valid:    (result.signal_quality.resp > 0.7),
          spo2_valid:  (result.signal_quality.spo2 > 0.9)
        });
      }
      if (proc >= 100) {
        sessionStorage.setItem("result", JSON.stringify(result));
        FHVitalsSDK.stopMeasuring()
          .then(() => FHVitalsSDK.stopPreview())
          .then(() => {
            incrementUsages()
            push("/finish")
          })
      }
    }

    const OnEvent = (event) => {
      if (event.state === '_camera_ready_') {
        const user = UserData.from(localStorage.getItem("data"));
        FHVitalsSDK.startMeasuring(user)
          .then(result => {
            if (result.error !== "ERROR_NONE") {
              alert(`start measuring failed, reason=${result.error}`);
              push("/basic_info");
            } else {
              setShowHint(false);
            }
          })
      } else if (event.state === '_camera_rsp_second_') {
        setShowHint(prevShowHint => !prevShowHint);
      } else if (event.state === '_canvas_size_change_') {
        setMaskDimensions({
          width: event.w,
          height: event.h,
          isHorizontal: event.w > event.h
        });
      } else if (event.state === '_connection_close_') {
        FHVitalsSDK.stopMeasuring()
          .then(() => FHVitalsSDK.stopPreview())
          .then(() => {
            push("/basic_info");
          })
      }
    }

    FHVitalsSDK.init({
      on_result: OnResult,
      on_event: OnEvent,
      config: {
        camera_prepare_second: 5,
        assets_folder_path: "js/fhvitals",
        auth_url: "wss://hcs-va.faceheart.com:9443/wasm/v2"
      }
    }).then(result => {
      if (result.error !== "ERROR_NONE") {
        push("/basic_info");
      }
      const user = UserData.from(localStorage.getItem('data'));
      return FHVitalsSDK.startPreview("live_canvas", user.facing_mode);
    })
  }, [scriptLoaded]);
}
