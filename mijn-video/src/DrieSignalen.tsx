import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "./theme";
import { fadeUp } from "./animations";
import { BookPattern } from "./components/BookPattern";
import { CrossIcon } from "./components/CrossIcon";
import { Logo } from "./components/Logo";

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const heading = fadeUp(frame, 0, 24);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: "0 80px" }}
    >
      <div
        style={{
          opacity: heading.opacity,
          translate: heading.translate,
          fontFamily,
          fontWeight: 900,
          fontSize: 78,
          color: colors.cream,
          textAlign: "center",
          lineHeight: 1.15,
        }}
      >
        3 signalen dat je{" "}
        <span style={{ fontStyle: "italic", fontWeight: 400 }}>
          leesbeleid
        </span>{" "}
        niet werkt
      </div>
    </AbsoluteFill>
  );
};

const SignalScene: React.FC<{ number: number; text: string }> = ({
  number,
  text,
}) => {
  const frame = useCurrentFrame();
  const icon = fadeUp(frame, 0, 20);
  const label = fadeUp(frame, 10, 24);
  const body = fadeUp(frame, 26, 26);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: "0 90px" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          maxWidth: 860,
        }}
      >
        <div style={{ opacity: icon.opacity, translate: icon.translate }}>
          <CrossIcon size={68} />
        </div>
        <div
          style={{
            opacity: label.opacity,
            translate: label.translate,
            fontFamily,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 38,
            color: colors.gold,
          }}
        >
          Signaal {number}
        </div>
        <div
          style={{
            opacity: body.opacity,
            translate: body.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 64,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = fadeUp(frame, 0, 20);
  const text = fadeUp(frame, 16, 24);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: 26,
      }}
    >
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
          fontSize: 42,
          color: colors.gold,
          textAlign: "center",
        }}
      >
        Stop met "stil lezen".
        <br />
        Begin met{" "}
        <span style={{ fontStyle: "normal", fontWeight: 900, color: colors.cream }}>
          List
        </span>
        .
      </div>
    </AbsoluteFill>
  );
};

export const DrieSignalen: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.navy }}>
      <BookPattern />
      <Sequence  durationInFrames={2 * fps} layout="none">
        <IntroScene />
      </Sequence>
      <Sequence from={2 * fps} durationInFrames={4 * fps} layout="none">
        <SignalScene number={1} text="Onrust tijdens stil lezen" />
      </Sequence>
      <Sequence from={6 * fps} durationInFrames={4 * fps} layout="none">
        <SignalScene number={2} text="Kinderen wisselen steeds van boek" />
      </Sequence>
      <Sequence from={10 * fps} durationInFrames={3 * fps} layout="none">
        <SignalScene number={3} text="Geen zichtbare opbrengst" />
      </Sequence>
      <Sequence from={13 * fps} durationInFrames={2 * fps} layout="none">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
