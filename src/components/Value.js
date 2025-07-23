export function Value({id, isValid, value}) {
  return <p id={id} className={isValid ? "text-success" : "text-dark"}>{value > 0 ? Math.round(value) : "--"}</p>;
}