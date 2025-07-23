export function Options({options, name, column}) {
  return <div className={column ? "options-column" : "options"}>
    {options.map(option => {
      return (
        <div className="option" key={option.id}>
          <input id={option.id} className="form-check-input" value={option.value} type="radio" name={name}
            defaultChecked={option.defaultChecked}/>
          <label htmlFor={option.id}>
            <span className="checkbox-circle"></span>
            {option.subtext ? (
              <div>
                {option.label}
                <span className="subtext ml">{option.subtext}</span>
              </div>
            ) : (
              option.label
            )}
          </label>
        </div>
      );
    })}
  </div>;
}