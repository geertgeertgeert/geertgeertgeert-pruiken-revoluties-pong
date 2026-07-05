import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { colors, fontFamily } from "./theme";
import { fadeUp } from "./animations";
import { BookPattern } from "./components/BookPattern";
import { StatBar } from "./components/StatBar";
import { Logo } from "./components/Logo";

export const CijfersDieJeOvertuigenSchema = z.object({
  stat1: z.object({ percentage: z.number(), label: z.string() }),
  stat2: z.object({ percentage: z.number(), label: z.string() }),
  stat3: z.object({ percentage: z.number(), label: z.string() }),
  bron: z.string(),
});

type Props = z.infer<typeof CijfersDieJeOvertuigenSchema>;

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
          fontSize: 76,
          color: colors.cream,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        Cijfers die je{" "}
        <span style={{ fontStyle: "italic", fontWeight: 400 }}>
          overtuigen
        </span>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC<{ bron: string }> = ({ bron }) => {
  const frame = useCurrentFrame();
  const logo = fadeUp(frame, 0, 20);
  const text = fadeUp(frame, 14, 24);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", gap: 22 }}
    >
      <div style={{ opacity: logo.opacity, translate: logo.translate }}>
        <Logo size={90} />
      </div>
      <div
        style={{
          opacity: text.opacity * 0.7,
          translate: text.translate,
          fontFamily,
          fontWeight: 400,
          fontSize: 26,
          color: colors.cream,
          textAlign: "center",
          padding: "0 100px",
        }}
      >
        Bron: {bron}
      </div>
    </AbsoluteFill>
  );
};

export const CijfersDieJeOvertuigen: React.FC<Props> = ({
  stat1,
  stat2,
  stat3,
  bron,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.navy }}>
      <BookPattern />
      <Sequence  durationInFrames={2 * fps} layout="none">
        <IntroScene />
      </Sequence>
      <Sequence from={2 * fps} durationInFrames={5 * fps} layout="none">
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <StatBar percentage={stat1.percentage} label={stat1.label} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={7 * fps} durationInFrames={5 * fps} layout="none">
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <StatBar percentage={stat2.percentage} label={stat2.label} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={12 * fps} durationInFrames={5 * fps} layout="none">
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <StatBar percentage={stat3.percentage} label={stat3.label} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={17 * fps} durationInFrames={3 * fps} layout="none">
        <OutroScene bron={bron} />
      </Sequence>
    </AbsoluteFill>
  );
};
