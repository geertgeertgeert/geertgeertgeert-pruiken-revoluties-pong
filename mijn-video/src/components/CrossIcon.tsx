import React from "react";
import { colors } from "../theme";

export const CrossIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 70,
  color = colors.gold,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 70 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12,14 C28,30 42,40 58,56"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M58,15 C43,29 28,41 12,55"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
