import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../theme";
import { easeOut, fadeUp } from "../animations";

export const StatBar: React.FC<{ percentage: number; label: string }> = ({
  percentage,
  label,
}) => {
  const frame = useCurrentFrame();
  const number = fadeUp(frame, 0, 20);
  const fill = interpolate(frame, [10, 60], [0, percentage], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const labelFade = fadeUp(frame, 30, 24);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        width: 780,
      }}
    >
      <div
        style={{
          opacity: number.opacity,
          translate: number.translate,
          fontFamily,
          fontWeight: 900,
          fontSize: 84,
          color: colors.cream,
        }}
      >
        {Math.round(fill)}%
      </div>
      <div
        style={{
          width: "100%",
          height: 18,
          borderRadius: 9,
          background: "rgba(245, 230, 196, 0.15)",
        }}
      >
        <div
          style={{
            width: `${fill}%`,
            height: "100%",
            borderRadius: 9,
            background: colors.gold,
          }}
        />
      </div>
      <div
        style={{
          opacity: labelFade.opacity,
          translate: labelFade.translate,
          fontFamily,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 36,
          color: colors.cream,
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
};
