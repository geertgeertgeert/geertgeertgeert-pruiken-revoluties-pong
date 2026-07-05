import React from "react";
import { colors } from "../theme";

export const QuestionMark: React.FC<{ size?: number; color?: string }> = ({
  size = 90,
  color = colors.gold,
}) => {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 90 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14,34 C10,15 24,4 44,5 C64,6 78,17 74,35 C71,49 54,52 49,64 C46,71 46,76 46,80"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="45" cy="104" r="8" fill={color} />
    </svg>
  );
};
