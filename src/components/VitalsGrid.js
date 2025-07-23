import { Value } from "@/components/Value";
import { fromSINumberToString } from "@/lib/domain-utils";
import { VitalCard } from "@/components/VitalCard";
import React from "react";

export default function VitalsGrid({
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
}) {
  return (
    <div className="vitals-grid">
      <VitalCard
        icon="images/hr.svg"
        alt="Heart rate icon"
        unit="bpm"
        value={<Value id="f_v_hr" isValid={hr_valid} value={last_hr}/>} 
        id={"f_v_hr"}
      >
        <p>Frecuencia<br/>cardíaca</p>
      </VitalCard>
      <VitalCard
        icon="images/hrv.svg"
        alt="Heart rate variability icon"
        unit="ms"
        value={<Value id="f_v_hrv" isValid value={last_hrv}/>} 
        id={"f_v_hrv"}
      >
        <p>HR<br/>variabilidad</p>
      </VitalCard>
      <VitalCard
        icon="images/bp.svg"
        alt="Blood pressure icon"
        unit="mmHg"
        value={<><Value id="f_v_sbp" isValid={bp_valid} value={last_sbp}/><Value id="f_v_dbp" isValid={bp_valid} value={last_dbp}/></>} 
        id={"f_v_bp"}
      >
        <p>Presión<br/>sangre</p>
      </VitalCard>
      <VitalCard
        icon="images/spo2.svg"
        alt="Oxygen saturation icon"
        unit="SpO₂%"
        value={<Value id="f_v_spo2" isValid={spo2_valid} value={last_spo2}/>} 
        id={"f_v_spo2"}
      >
        <p>Oxígeno<br/>sangre</p>
      </VitalCard>
      <VitalCard
        icon="images/rr.svg"
        alt="Respiration rate icon"
        unit="bpm"
        value={<Value id="f_v_rr" isValid={rr_valid} value={last_rr}/>} 
        id={"f_v_rr"}
      >
        <p>Frecuencia<br/>respiratoria</p>
      </VitalCard>
      <VitalCard
        icon="images/si.svg"
        alt="Stress index icon"
        unit={""}
        value={<p id="v_si">{last_si ? fromSINumberToString(last_si) : '--'}</p>} 
        id={"v_si"}
      >
        <p>Índice<br/>stress</p>
      </VitalCard>
    </div>
  );
}
