import React from "react";
import { colors } from "../theme";

export const ClawIcon: React.FC<{
  size?: number;
  color?: string;
  openness?: number;
}> = ({ size = 120, color = colors.gold, openness = 1 }) => {
  const spread = 16 * openness;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60,6 L60,40"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={60} cy={40} r={8} fill="none" stroke={color} strokeWidth={4} />
      <path
        d={`M52,46 C${52 - spread},60 ${52 - spread},78 46,96`}
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M68,46 C${68 + spread},60 ${68 + spread},78 74,96`}
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M60,46 L60,${88 - (1 - openness) * 20}`}
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
