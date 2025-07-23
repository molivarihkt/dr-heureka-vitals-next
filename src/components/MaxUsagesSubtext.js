import React from "react";
import {MAX_USAGES} from "@/constants";

export const MaxUsagesSubtext = ({ reachedMaxUsages, usages }) => {
  const usagesLeft = MAX_USAGES - usages;
  const oneUsageLeft = usagesLeft === 1;
  return (
    <p className="subtext">{reachedMaxUsages ?
      "Has alcanzado el máximo de usos permitidos."
      : "Te " + (oneUsageLeft ? "queda " : "quedan ") + usagesLeft + (oneUsageLeft ? " uso disponible" : " usos disponibles")
    }</p>
  );
};
