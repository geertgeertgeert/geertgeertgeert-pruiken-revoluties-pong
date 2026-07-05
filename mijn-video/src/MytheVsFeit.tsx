import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "./theme";
import { fadeUp } from "./animations";
import { BookPattern } from "./components/BookPattern";

const rounds = [
  {
    mythe: "Kinderen lezen niet voor zichzelf.",
    feit: "Met een vaste leesroutine doen de meeste kinderen dat al binnen een paar weken wél.",
  },
  {
    mythe: "Stil lezen is verloren lestijd.",
    feit: "20 minuten per dag bouwt een heel schooljaar leeskilometers op.",
  },
  {
    mythe: "Voorlezen door de leerkracht is voldoende.",
    feit: "Zelf lezen traint doorzettingsvermogen op een andere manier dan luisteren.",
  },
];

const Round: React.FC<{ mythe: string; feit: string }> = ({ mythe, feit }) => {
  const frame = useCurrentFrame();
  const mytheLabel = fadeUp(frame, 0, 18);
  const mytheText = fadeUp(frame, 8, 22);
  const divider = interpolate(frame, [40, 66], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const feitLabel = fadeUp(frame, 66, 18);
  const feitText = fadeUp(frame, 76, 22);

  return (
    <AbsoluteFill style={{ padding: "0 90px" }}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          top: 0,
          height: "50%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              opacity: mytheLabel.opacity * 0.7,
              translate: mytheLabel.translate,
              fontFamily,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 32,
              letterSpacing: 2,
              color: colors.cream,
            }}
          >
            MYTHE
          </div>
          <div
            style={{
              opacity: mytheText.opacity,
              translate: mytheText.translate,
              fontFamily,
              fontWeight: 600,
              fontSize: 50,
              color: colors.cream,
              textAlign: "center",
              lineHeight: 1.25,
              maxWidth: 820,
            }}
          >
            {mythe}
          </div>
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          translate: "-50% -50%",
          width: interpolate(divider, [0, 1], [0, 900]),
          height: 3,
          background: colors.gold,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          top: "50%",
          height: "50%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              opacity: feitLabel.opacity,
              translate: feitLabel.translate,
              fontFamily,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 32,
              letterSpacing: 2,
              color: colors.gold,
            }}
          >
            FEIT
          </div>
          <div
            style={{
              opacity: feitText.opacity,
              translate: feitText.translate,
              fontFamily,
              fontWeight: 900,
              fontSize: 50,
              color: colors.cream,
              textAlign: "center",
              lineHeight: 1.25,
              maxWidth: 820,
            }}
          >
            {feit}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MytheVsFeit: React.FC = () => {
  const { fps } = useVideoConfig();
  const roundDuration = Math.floor((20 * fps) / rounds.length);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.navy }}>
      <BookPattern />
      {rounds.map((round, i) => (
        <Sequence
          key={round.mythe}
          from={i * roundDuration}
          durationInFrames={roundDuration}
          layout="none"
        >
          <Round mythe={round.mythe} feit={round.feit} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
