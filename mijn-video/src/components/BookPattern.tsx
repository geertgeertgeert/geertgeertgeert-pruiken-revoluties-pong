import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../theme";

export const BookPattern: React.FC<{ opacity?: number }> = ({
  opacity = 0.06,
}) => {
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="book-pattern"
            width={140}
            height={110}
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M20,60 Q40,50 55,55 L55,90 Q40,96 20,86 Z"
              stroke={colors.cream}
              strokeWidth={2.5}
              fill="none"
            />
            <path
              d="M90,60 Q70,50 55,55 L55,90 Q70,96 90,86 Z"
              stroke={colors.cream}
              strokeWidth={2.5}
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#book-pattern)" />
      </svg>
    </AbsoluteFill>
  );
};
