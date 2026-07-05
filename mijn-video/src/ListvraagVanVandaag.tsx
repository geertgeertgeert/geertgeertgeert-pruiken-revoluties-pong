import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { colors, fontFamily } from "./theme";
import { BookPattern } from "./components/BookPattern";

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

export const ListvraagVanVandaag: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const scale = interpolate(frame, [0, 40], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const lineWidth = interpolate(frame, [20, 60], [0, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.navy,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <BookPattern />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          padding: "0 100px",
        }}
      >
        <div
          style={{
            opacity,
            scale,
            fontFamily,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 72,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          Listvraag van vandaag
        </div>
        <div
          style={{
            width: lineWidth,
            height: 4,
            borderRadius: 2,
            background: colors.gold,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
