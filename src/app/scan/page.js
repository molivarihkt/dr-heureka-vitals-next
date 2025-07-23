'use client'
import styles from './page.module.css';
import {useCallback, useEffect, useState} from "react";
import Script from "next/script";
import "./../../../public/css/progress.css"
import {Value} from "@/components/Value";
import {fromSINumberToString, incrementUsages, reachedMaxOfUsages} from "@/lib/domain-utils";
import { UserData } from "@/lib/UserData";
import VitalsGrid from "@/components/VitalsGrid";
import { useStartMeasuring } from "@/hooks/useStartMeasuring";
import FaceRect from "@/components/FaceRect";

const your_auth_url = "wss://hcs-va.faceheart.com:9443/wasm/v2";
const FPS = 30;
const MAX_MEASURING_SECOND = 50;

export default function Scan() {
  const [{
    last_hr,
    last_hrv,
    last_sbp,
    last_dbp,
    last_rr,
    last_spo2,
    last_si,
    hr_valid,
    bp_valid,
    rr_valid,
    spo2_valid
  }, setValues] = useState({
    last_hr : -1,
    last_hrv : -1,
    last_sbp : -1,
    last_dbp : -1,
    last_rr : -1,
    last_spo2 : -1,
    last_si : -1,
    hr_valid: true,
    bp_valid: true,
    rr_valid: true,
    spo2_valid: true
  })
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [proc, setProc] = useState(0)
  const [scanningStatus, setScanningStatus] = useState("Loading")
  const [showHint, setShowHint] = useState(false)

  const [maskDimensions, setMaskDimensions] = useState({
    width: "0",
    height: "0",
    imageSrc: "images/live_rect_landscape.svg"
  });

  useStartMeasuring({
    scriptLoaded,
    setProc,
    setScanningStatus,
    setValues,
    setShowHint,
    setMaskDimensions
  });

  return (<div className="container">
    <div className="camera-container" style={{position: "relative"}}>
      <canvas id="live_canvas"></canvas>

      <div style={{position: "absolute"}}>
        <FaceRect maskDimensions={maskDimensions} />
        {scriptLoaded && proc > 1 && <ProgressIndicator proc={proc} />}
      </div>


      {scanningStatus && <div className="scanning-status" id="scanning_status">{scanningStatus}</div>}

      {showHint && <div className="scan-hint" id="scan_p_hint">
        <p>Coloque su cara dentro del contorno ovalado y permanezca quieto durante el proceso de medición.</p>
      </div>}
    </div>

    <VitalsGrid
      last_hr={last_hr}
      last_hrv={last_hrv}
      last_sbp={last_sbp}
      last_dbp={last_dbp}
      last_rr={last_rr}
      last_spo2={last_spo2}
      last_si={last_si}
      hr_valid={hr_valid}
      bp_valid={bp_valid}
      rr_valid={rr_valid}
      spo2_valid={spo2_valid}
    />
    <Script src="js/fhvitals/fhvitals_sdk.js" strategy="afterInteractive" onReady={() => {
      setScriptLoaded(true)
      setScanningStatus("")
    }}/>
  </div>);
}

function ProgressIndicator({ proc }) {
  return (
    <div className="progress-container" id="progress_scan">
      <div className="progress green">
        <span className="progress-left">
          <span id="progress_left" className="progress-bar"></span>
        </span>
        <span className="progress-right">
          <span id="progress_right" className="progress-bar"></span>
        </span>
        <div className="progress-value" id="progress_value">{parseInt(proc) + '%'}
        </div>
      </div>
    </div>
  );
}
