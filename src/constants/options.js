// src/constants/options.js

/**
 * Returns the options for sex selection.
 * @param {string} defaultSex - The default sex value ("male" or "female").
 * @returns {Array}
 */
export function getSexOptions(defaultSex) {
  return [
    {
      id: "eid_male",
      value: "male",
      label: "Masculino",
      defaultChecked: defaultSex === "male"
    },
    {
      id: "eid_female",
      value: "female",
      label: "Femenino",
      defaultChecked: defaultSex === "female"
    }
  ];
}

/**
 * Returns the options for hypertension selection.
 * @param {string} defaultHypertension - The default hypertension value.
 * @returns {Array}
 */
export function getHypertensionOptions(defaultHypertension) {
  return [
    {
      id: "eid_ht_normal",
      value: "normal",
      label: "Normal",
      subtext: "(120 mmHg)",
      defaultChecked: defaultHypertension === "normal"
    },
    {
      id: "eid_ht_prehypertension",
      value: "prehypertension",
      label: "Prehypertension",
      subtext: "(120 ~ 139 mmHg)",
      defaultChecked: defaultHypertension === "prehypertension"
    },
    {
      id: "eid_ht_hypertension",
      value: "hypertension",
      label: "Hypertension",
      subtext: "(>= 140 mmHg)",
      defaultChecked: defaultHypertension === "hypertension"
    }
  ];
}

/**
 * Returns the options for camera selection.
 * @param {string} defaultCamera - The default camera value ("user" or "environment").
 * @returns {Array}
 */
export function getCameraOptions(defaultCamera) {
  return [
    {
      id: "eid_camera_front",
      value: "user",
      label: "Frontal",
      defaultChecked: defaultCamera === "user"
    },
    {
      id: "eid_camera_back",
      value: "environment",
      label: "Trasera",
      defaultChecked: defaultCamera === "environment"
    }
  ];
}
