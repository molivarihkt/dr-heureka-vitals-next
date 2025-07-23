import React from "react";
import styles from "./number-input.module.css";

export function NumberInput({ id, name, defaultValue, ...props }) {
  return (
    <input
      className={styles["number-input"]}
      type="number"
      id={id}
      name={name}
      defaultValue={defaultValue}
      {...props}
    />
  );
}
