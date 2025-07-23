/**
 * @class UserData
 * @classdesc Represents the user data stored in localStorage under the "data" key.
 * @param {Object} params
 * @param {number} params.height - User's height in cm
 * @param {number} params.weight - User's weight in kg
 * @param {number} params.sex - 1 for male, 0 for female
 * @param {number} params.age - User's age in years
 * @param {string} params.bp_mode - Blood pressure mode (e.g., "ternary")
 * @param {string} params.bp_group - Blood pressure group (e.g., "normal", "prehypertension", "hypertension")
 * @param {string} params.facing_mode - Camera facing mode ("user" or "environment")
 */
export class UserData {
  constructor({ height, weight, sex, age, bp_mode, bp_group, facing_mode }) {
    /** @type {number} */
    this.height = height;
    /** @type {number} */
    this.weight = weight;
    /** @type {number} */
    this.sex = sex;
    /** @type {number} */
    this.age = age;
    /** @type {string} */
    this.bp_mode = bp_mode;
    /** @type {string} */
    this.bp_group = bp_group;
    /** @type {string} */
    this.facing_mode = facing_mode;
  }

  /**
   * Serialize the UserData instance to JSON string for storage.
   * @returns {string}
   */
  toJSON() {
    return JSON.stringify({
      height: this.height,
      weight: this.weight,
      sex: this.sex,
      age: this.age,
      bp_mode: this.bp_mode,
      bp_group: this.bp_group,
      facing_mode: this.facing_mode
    });
  }

  /**
   * Create a UserData instance from a JSON string or object.
   * @param {string|Object} data
   * @returns {UserData}
   */
  static from(data) {
    let obj = data;
    if (typeof data === 'string') {
      obj = JSON.parse(data);
    }
    return new UserData(obj);
  }

  /**
   * Get the string representation of the sex value.
   * @returns {"male"|"female"}
   */
  getSexString() {
    return this.sex === 1 ? "male" : "female";
  }

  /**
   * Get the numeric representation for a given sex string.
   * @param {"male"|"female"} sexStr
   * @returns {number}
   */
  static sexToNumber(sexStr) {
    return sexStr === "male" ? 1 : 0;
  }

  /**
   * Convert UserData instance to the defaultValues object for useState in basic_info page.
   * @returns {Object} Default values for the form.
   */
  toDefaultValue() {
    return {
      sex: this.getSexString(),
      height: this.height ?? USERDATA_DEFAULTS.height,
      weight: this.weight ?? USERDATA_DEFAULTS.weight,
      birthYear: this.age ? new Date().getFullYear() - this.age : USERDATA_DEFAULTS.birthYear,
      hypertension: this.bp_group ?? USERDATA_DEFAULTS.hypertension,
      camera: this.facing_mode ?? USERDATA_DEFAULTS.camera
    };
  }
}

/**
 * Default values for the user data form.
 */
const USERDATA_DEFAULTS = {
  sex: "male",
  height: 0,
  weight: 0,
  birthYear: 0,
  hypertension: "normal",
  camera: "user"
};
export { USERDATA_DEFAULTS };
