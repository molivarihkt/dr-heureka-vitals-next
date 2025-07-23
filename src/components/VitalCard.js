import React from 'react';

/**
 * VitalCard component for displaying a vital sign card.
 *
 * @param {React.ReactNode} children - The label content (should be a <p> or any node).
 * @param {string} icon - Path to the icon image (relative to public/images/).
 * @param {string} alt - Alt text for the icon.
 * @param {string} unit - Unit label (e.g., 'bpm', 'mmHg').
 * @param {React.ReactNode} value - The value(s) to display (can be a Value component or custom node).
 * @param {string} [id] - Optional id for the value element.
 */
export function VitalCard({ children, icon, alt, unit, value, id }) {
  return (
    <div className="vital-card">
      <div className="vital-content">
        <div className="vital-label">
          {children}
        </div>
        <div className="vital-value" id={id}>
          {value}
        </div>
        <div className="vital-icon">
          <img src={icon} alt={alt} />
          <p className="unit">{unit}</p>
        </div>
      </div>
    </div>
  );
}
