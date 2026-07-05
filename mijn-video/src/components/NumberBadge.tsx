import React from "react";
import { colors, fontFamily } from "../theme";

export const NumberBadge: React.FC<{ number: number; size?: number }> = ({
  number,
  size = 110,
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 110 110">
      <circle
        cx={55}
        cy={55}
        r={50}
        fill="none"
        stroke={colors.gold}
        strokeWidth={4}
      />
      <text
        x={55}
        y={72}
        textAnchor="middle"
        fill={colors.cream}
        fontFamily={fontFamily}
        fontWeight={900}
        fontSize={48}
      >
        {number}
      </text>
    </svg>
  );
};
