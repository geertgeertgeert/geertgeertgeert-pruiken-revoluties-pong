import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fontFamily } from "./theme";
import { fadeUp } from "./animations";
import { BookPattern } from "./components/BookPattern";

const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const DeLeestimer: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashoffset = CIRCUMFERENCE * progress;
  const question = fadeUp(frame, 24, 26);
  const math = fadeUp(frame, 110, 26);

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
          gap: 40,
          padding: "0 90px",
        }}
      >
        <svg width={240} height={240} viewBox="0 0 240 240">
          <circle
            cx={120}
            cy={120}
            r={RADIUS}
            fill="none"
            stroke={colors.cream}
            strokeOpacity={0.18}
            strokeWidth={9}
          />
          <circle
            cx={120}
            cy={120}
            r={RADIUS}
            fill="none"
            stroke={colors.gold}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
            transform="rotate(-90 120 120)"
          />
          <text
            x={120}
            y={132}
            textAnchor="middle"
            fill={colors.cream}
            fontFamily={fontFamily}
            fontWeight={900}
            fontSize={54}
          >
            20
          </text>
        </svg>
        <div
          style={{
            opacity: question.opacity,
            translate: question.translate,
            fontFamily,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 42,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: 820,
          }}
        >
          20 minuten naar het plafond staren, of 20 minuten lezen?
        </div>
        <div
          style={{
            opacity: math.opacity,
            translate: math.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 36,
            color: colors.gold,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          20 min × 5 schooldagen × 40 schoolweken
          <br />= 4000 minuten leestijd.
        </div>
      </div>
    </AbsoluteFill>
  );
};
