import {MAX_USAGES} from "@/constants";

export const fromSINumberToString = (si_number) => {
  if (si_number < 0) {
    return "---";
  } else if (si_number < 50) {
    return "Low";
  } else if (si_number < 200) {
    return "Normal";
  } else if (si_number < 350) {
    return "Mild";
  } else if (si_number < 500) {
    return "High";
  } else {
    return "Very High";
  }
}

export function copyToClipboardText({last_hr, last_hrv, last_rr, last_sbp, last_dbp, last_spo2, last_si, radarValues}) {
  return `
Resultado de toma de signos vitales - ${new Date().toLocaleString()}
Frecuencia cardíaca: ${last_hr} bpm
Variabilidad del ritmo cardíaco: ${last_hrv} ms
Frecuencia respiratoria: ${last_rr} rpm
Presión en sangre: ${last_sbp}/${last_dbp} mmHg
Oxígeno en sangre: ${last_spo2} SpO%
Índice de stress: ${fromSINumberToString(last_si)} 

Indicadores de bienestar
Actividad: ${radarValues.activity}/5
Sueño: ${radarValues.sleep}/5
Equilibrio: ${radarValues.equilibrium}/5
Metabolismo: ${radarValues.metabolism}/5
Salud: ${radarValues.health}/5
Relajación: ${radarValues.relaxation}/5
      `;
}

export function reachedMaxOfUsages() {
  const usages = parseInt(localStorage.getItem("usages") || "0");
  return usages >= MAX_USAGES;
}

export function incrementUsages() {
  const usages = parseInt(localStorage.getItem("usages") || "0") + 1;
  localStorage.setItem("usages", usages.toString());
}

export function getUsages() {
  return parseInt(localStorage.getItem("usages") || "0");
}