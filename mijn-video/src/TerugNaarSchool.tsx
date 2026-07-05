import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "./theme";
import { fadeUp } from "./animations";
import { BookPattern } from "./components/BookPattern";
import { Logo } from "./components/Logo";

const LineScene: React.FC<{
  line1: string;
  line2: string;
  size?: number;
}> = ({ line1, line2, size = 80 }) => {
  const frame = useCurrentFrame();
  const first = fadeUp(frame, 0, 22);
  const second = fadeUp(frame, 16, 22);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: "0 80px" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            opacity: first.opacity,
            translate: first.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: size,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          {line1}
        </div>
        <div
          style={{
            opacity: second.opacity,
            translate: second.translate,
            fontFamily,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: size * 0.8,
            color: colors.gold,
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          {line2}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PreviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const label = fadeUp(frame, 0, 20);
  const body = fadeUp(frame, 14, 26);

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
          DEZE MAAND OP @LIST.LEZEN
        </div>
        <div
          style={{
            opacity: body.opacity,
            translate: body.translate,
            fontFamily,
            fontWeight: 600,
            fontSize: 52,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          Praktische tips, leeslijsten en inspiratie voor elke klas.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = fadeUp(frame, 0, 22);
  const handle = fadeUp(frame, 18, 26);
  const cta = fadeUp(frame, 40, 24);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
      <div style={{ opacity: logo.opacity, translate: logo.translate }}>
        <Logo size={120} />
      </div>
      <div
        style={{
          opacity: handle.opacity,
          translate: handle.translate,
          fontFamily,
          fontWeight: 900,
          fontSize: 54,
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
          fontSize: 34,
          color: colors.gold,
        }}
      >
        Volg mee.
      </div>
    </AbsoluteFill>
  );
};

export const TerugNaarSchool: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.navy }}>
      <BookPattern />
      <Sequence  durationInFrames={3 * fps} layout="none">
        <LineScene line1="Nieuw schooljaar." line2="" />
      </Sequence>
      <Sequence from={3 * fps} durationInFrames={3 * fps} layout="none">
        <LineScene line1="Nieuwe leesroutine." line2="" />
      </Sequence>
      <Sequence from={6 * fps} durationInFrames={6 * fps} layout="none">
        <PreviewScene />
      </Sequence>
      <Sequence from={12 * fps} durationInFrames={3 * fps} layout="none">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
