import React from "react";
import { colors } from "../theme";

export const Logo: React.FC<{ size?: number; color?: string }> = ({
  size = 200,
  color = colors.cream,
}) => {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10,32 Q58,14 98,24 L98,118 Q58,128 10,108 Z"
        stroke={color}
        strokeWidth={4}
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M190,32 Q142,14 102,24 L102,118 Q142,128 190,108 Z"
        stroke={color}
        strokeWidth={4}
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M100,20 L100,124"
        stroke={colors.gold}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M100,20 L92,4 L108,4 Z"
        fill={colors.gold}
      />
    </svg>
  );
};
