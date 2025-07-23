import React from "react";

export default function FaceRect({ maskDimensions }) {
  const imageSrc = maskDimensions.isHorizontal
    ? "images/live_rect_landscape.svg"
    : "images/live_rect_portrait.svg";

  if (maskDimensions.width > "0" || maskDimensions.height > "0") {
    return (
      <img
        src={imageSrc}
        alt="Camera frame"
        id="live_rect"
        style={{
          width: maskDimensions.width > "0" ? maskDimensions.width : 'auto',
          height: maskDimensions.height > "0" ? maskDimensions.height : 'auto'
        }}
      />
    );
  }
  return null;
}
