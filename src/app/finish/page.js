'use client'
import {useEffect, useState} from "react";
import {Value} from "@/components/Value";
import {copyToClipboardText, fromSINumberToString} from "@/lib/domain-utils";
import {Chart as ChartJS, Filler, Legend, LineElement, PointElement, RadialLinearScale, Tooltip,} from 'chart.js';
import {VitalsRadar} from "@/components/results/VitalsRadar";
import {Indicator} from "@/components/results/Indicator";
import {usePushWithQuery} from "@/hooks/usePushWithQuery";
import { VitalCard } from "@/components/VitalCard";
import VitalsGrid from "@/components/VitalsGrid";
import Toast from "@/components/Toast";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function Finish() {
  const push = usePushWithQuery();
  const [{
    last_hr, last_hrv, last_sbp, last_dbp, last_rr, last_spo2, last_si, hr_valid, bp_valid, rr_valid, spo2_valid
  }, setValues] = useState({
    last_hr: -1,
    last_hrv: -1,
    last_sbp: -1,
    last_dbp: -1,
    last_rr: -1,
    last_spo2: -1,
    last_si: -1,
    hr_valid: true,
    bp_valid: true,
    rr_valid: true,
    spo2_valid: true
  })
  const [radarValues, setRadarValues] = useState({
    activity: 2,
    equilibrium: 1,
    health: 3,
    metabolism: 1,
    relaxation: 4,
    sleep: 5
  });
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const result = JSON.parse(sessionStorage.getItem("result"));
    if (!result) {
      return
      // push("/scan");
    }

    setValues({
      last_hr: result.hr,
      last_hrv: result.hrv_indices.SDNNI,
      last_sbp: result.sbp,
      last_dbp: result.dbp,
      last_rr: result.rr,
      last_spo2: result.spo2,
      last_si: result.si,
      hr_valid: (result.signal_quality.hr_hrv > 0.7),
      bp_valid: (result.signal_quality.bp > 0.6),
      rr_valid: (result.signal_quality.resp > 0.7),
      spo2_valid: (result.signal_quality.spo2 > 0.9)
    });
    setRadarValues({
      activity: result.activity,
      equilibrium: result.equilibrium,
      health: result.health,
      metabolism: result.metabolism,
      relaxation: result.relaxation,
      sleep: result.sleep
    })
  }, []);

  const radarData = [radarValues.activity, radarValues.sleep, radarValues.equilibrium, radarValues.metabolism, radarValues.health, radarValues.relaxation];

  return (<div className="container">
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

    <div className="results-container">
      <div className="chart-container">
        <VitalsRadar data={radarData}/>
      </div>


      <div className="health-indicators">
        <Indicator title="Actividad" value={radarValues.activity}/>
        <Indicator title="Sueño" value={radarValues.sleep}/>
        <Indicator title="Equilibrio" value={radarValues.equilibrium}/>
        <Indicator title="Metabolismo" value={radarValues.metabolism}/>
        <Indicator title="Salud" value={radarValues.health}/>
        <Indicator title="Relajación" value={radarValues.relaxation}/>
      </div>
    </div>

    <div className="action-buttons">
      <button onClick={() => push("/basic_info")} type="button" className="btn-primary" id="f_eid_btn_home">Finalizar</button>
      <button title="Copy to clipboard" className="btn-secondary" style={{width: "fit-content", height: "fit-content"}} onClick={() => {
        navigator.clipboard.writeText(copyToClipboardText(
          {last_hr, last_hrv, last_rr, last_sbp, last_dbp, last_spo2, last_si, radarValues}
        ))
        setShowToast(true);
      }}>
        <img className="copy-button-img" width={25} src="images/copy.svg" alt="Copy to clipboard icon"/>
      </button>
    </div>
    <Toast show={showToast} onClose={() => setShowToast(false)} message="¡Copiado exitosamente!"/>
  </div>);
}