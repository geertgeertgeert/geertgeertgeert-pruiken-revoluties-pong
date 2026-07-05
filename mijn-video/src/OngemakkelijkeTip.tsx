import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "./theme";
import { fadeUp } from "./animations";
import { BookPattern } from "./components/BookPattern";
import { Logo } from "./components/Logo";

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const label = fadeUp(frame, 0, 22);
  const text = fadeUp(frame, 20, 26);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: "0 90px" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            opacity: label.opacity,
            translate: label.translate,
            fontFamily,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: 2,
            color: colors.gold,
          }}
        >
          EEN ONGEMAKKELIJKE TIP
        </div>
        <div
          style={{
            opacity: text.opacity,
            translate: text.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 60,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          voor in de klas.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const StatementScene: React.FC = () => {
  const frame = useCurrentFrame();
  const text = fadeUp(frame, 0, 30);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: "0 90px" }}
    >
      <div
        style={{
          opacity: text.opacity,
          translate: text.translate,
          fontFamily,
          fontWeight: 900,
          fontSize: 68,
          color: colors.cream,
          textAlign: "center",
          lineHeight: 1.25,
          maxWidth: 880,
        }}
      >
        Lees nooit voor uit een boek dat je{" "}
        <span style={{ fontStyle: "italic", fontWeight: 400, color: colors.gold }}>
          zelf
        </span>{" "}
        nog niet hebt gelezen.
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = fadeUp(frame, 0, 20);
  const text = fadeUp(frame, 16, 24);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
      <div style={{ opacity: logo.opacity, translate: logo.translate }}>
        <Logo size={110} />
      </div>
      <div
        style={{
          opacity: text.opacity,
          translate: text.translate,
          fontFamily,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 38,
          color: colors.gold,
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        Meer ongemakkelijke tips? Volg @list.lezen.
      </div>
    </AbsoluteFill>
  );
};

export const OngemakkelijkeTip: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.navy }}>
      <BookPattern />
      <Sequence  durationInFrames={5 * fps} layout="none">
        <HookScene />
      </Sequence>
      <Sequence from={5 * fps} durationInFrames={10 * fps} layout="none">
        <StatementScene />
      </Sequence>
      <Sequence from={15 * fps} durationInFrames={10 * fps} layout="none">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
