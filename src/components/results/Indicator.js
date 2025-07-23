export function Indicator({title, value}) {
  return <div data-testid={`indicator-${title}`} className="indicator-card">
    <h3>{title}</h3>
    <div className="indicator-icon">
      <img id="f_v_activity" src={`images/icon_sp_${value}.svg`} alt="Activity indicator"/>
    </div>
  </div>;
}