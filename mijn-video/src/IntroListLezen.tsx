import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fontFamily } from "./theme";
import { Logo } from "./components/Logo";
import { QuestionMark } from "./components/QuestionMark";
import { BookPattern } from "./components/BookPattern";

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const fadeUp = (frame: number, from: number, durationInFrames = 24) => {
  const opacity = interpolate(frame, [from, from + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const y = interpolate(frame, [from, from + durationInFrames], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  return { opacity, translate: `0px ${y}px` };
};

const Wordmark: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <div
    style={{
      fontFamily,
      fontSize: size,
      fontWeight: 900,
      color: colors.cream,
      lineHeight: 1,
      textAlign: "center",
    }}
  >
    List
    <span style={{ fontStyle: "italic", fontWeight: 400, color: colors.gold }}>
      {" "}
      lezen
    </span>
  </div>
);

const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = fadeUp(frame, 0, 30);
  const word = fadeUp(frame, 18, 30);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: 36,
      }}
    >
      <div style={{ opacity: logo.opacity, translate: logo.translate }}>
        <Logo size={190} />
      </div>
      <div style={{ opacity: word.opacity, translate: word.translate }}>
        <Wordmark />
      </div>
    </AbsoluteFill>
  );
};

const WhatIsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const q = fadeUp(frame, 0, 24);
  const heading = fadeUp(frame, 12, 28);
  const body = fadeUp(frame, 45, 30);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          maxWidth: 900,
        }}
      >
        <div style={{ opacity: q.opacity, translate: q.translate }}>
          <QuestionMark size={80} />
        </div>
        <div
          style={{
            opacity: heading.opacity,
            translate: heading.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 88,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Wat is List?
        </div>
        <div
          style={{
            opacity: body.opacity,
            translate: body.translate,
            fontFamily,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 46,
            color: colors.gold,
            textAlign: "center",
            lineHeight: 1.35,
          }}
        >
          Een schoolbrede aanpak om stil lezen structureel en effectief in te
          richten.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const expectations = [
  "Praktische leeslijsten voor elke klas",
  "Tips om stil lezen goed te organiseren",
  "Inspiratie uit de klaspraktijk",
];

const ExpectScene: React.FC = () => {
  const frame = useCurrentFrame();
  const heading = fadeUp(frame, 0, 24);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 90px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 44,
          maxWidth: 900,
        }}
      >
        <div
          style={{
            opacity: heading.opacity,
            translate: heading.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 76,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Wat kun je{" "}
          <span style={{ fontStyle: "italic", fontWeight: 400 }}>
            verwachten
          </span>
          ?
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
          }}
        >
          {expectations.map((line, i) => {
            const item = fadeUp(frame, 40 + i * 26, 26);
            return (
              <div
                key={line}
                style={{
                  opacity: item.opacity,
                  translate: item.translate,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: colors.gold,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontFamily,
                    fontWeight: 400,
                    fontSize: 44,
                    color: colors.cream,
                    textAlign: "center",
                  }}
                >
                  {line}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = fadeUp(frame, 0, 24);
  const handle = fadeUp(frame, 20, 28);
  const cta = fadeUp(frame, 45, 28);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: 30,
      }}
    >
      <div style={{ opacity: logo.opacity, translate: logo.translate }}>
        <Logo size={140} />
      </div>
      <div
        style={{
          opacity: handle.opacity,
          translate: handle.translate,
          fontFamily,
          fontWeight: 900,
          fontSize: 60,
          color: colors.cream,
        }}
      >
        @list.lezen
      </div>
      <div
        style={{
          opacity: cta.opacity,
          translate: cta.translate,
          fontFamily,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 38,
          color: colors.gold,
        }}
      >
        Volg mee.
      </div>
    </AbsoluteFill>
  );
};

export const IntroListLezen: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.navy }}>
      <BookPattern />
      <Sequence  durationInFrames={3 * fps} layout="none">
        <OpeningScene />
      </Sequence>
      <Sequence from={3 * fps} durationInFrames={6 * fps} layout="none">
        <WhatIsScene />
      </Sequence>
      <Sequence from={9 * fps} durationInFrames={8 * fps} layout="none">
        <ExpectScene />
      </Sequence>
      <Sequence from={17 * fps} durationInFrames={3 * fps} layout="none">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
