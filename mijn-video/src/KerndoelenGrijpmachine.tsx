import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { colors, fontFamily } from "./theme";
import { fadeUp, easeOut } from "./animations";
import { BookPattern } from "./components/BookPattern";
import { ClawIcon } from "./components/ClawIcon";
import { Logo } from "./components/Logo";

export const KerndoelenGrijpmachineSchema = z.object({
  kerndoel1: z.string(),
  kerndoel2: z.string(),
  boekTitel: z.string(),
});

type Props = z.infer<typeof KerndoelenGrijpmachineSchema>;

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const label = fadeUp(frame, 0, 22);
  const claw = fadeUp(frame, 12, 22);
  const tagline = fadeUp(frame, 40, 24);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: "0 90px" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        <div
          style={{
            opacity: label.opacity,
            translate: label.translate,
            fontFamily,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 32,
            letterSpacing: 2,
            color: colors.gold,
          }}
        >
          KERNDOELEN GRIJPMACHINE
        </div>
        <div style={{ opacity: claw.opacity, translate: claw.translate }}>
          <ClawIcon size={130} />
        </div>
        <div
          style={{
            opacity: tagline.opacity,
            translate: tagline.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 52,
            color: colors.cream,
            textAlign: "center",
          }}
        >
          Grijp. Combineer. Les klaar.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const GrabScene: React.FC<{ number: number; kerndoel: string }> = ({
  number,
  kerndoel,
}) => {
  const frame = useCurrentFrame();
  const clawY = interpolate(frame, [0, 26, 46], [-40, 20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const openness = interpolate(frame, [26, 46], [1, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const label = fadeUp(frame, 0, 20);
  const text = fadeUp(frame, 40, 26);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: "0 90px" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
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
          GRIJP {number}
        </div>
        <div style={{ translate: `0px ${clawY}px` }}>
          <ClawIcon size={110} openness={openness} />
        </div>
        <div
          style={{
            opacity: text.opacity,
            translate: text.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 54,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.25,
          }}
        >
          {kerndoel}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const BookScene: React.FC<{ boekTitel: string }> = ({ boekTitel }) => {
  const frame = useCurrentFrame();
  const plus = fadeUp(frame, 0, 20);
  const label = fadeUp(frame, 14, 22);
  const titel = fadeUp(frame, 34, 26);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: "0 90px" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          maxWidth: 860,
        }}
      >
        <div
          style={{
            opacity: plus.opacity,
            translate: plus.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 70,
            color: colors.gold,
          }}
        >
          +
        </div>
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
          EEN BOEK
        </div>
        <div
          style={{
            opacity: titel.opacity,
            translate: titel.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 54,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.25,
          }}
        >
          {boekTitel}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PayoffScene: React.FC = () => {
  const frame = useCurrentFrame();
  const number = fadeUp(frame, 0, 22);
  const text = fadeUp(frame, 16, 24);
  const logo = fadeUp(frame, 44, 20);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 22 }}>
      <div
        style={{
          opacity: number.opacity,
          translate: number.translate,
          fontFamily,
          fontWeight: 900,
          fontSize: 90,
          color: colors.gold,
        }}
      >
        3x
      </div>
      <div
        style={{
          opacity: text.opacity,
          translate: text.translate,
          fontFamily,
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: 42,
          color: colors.cream,
          textAlign: "center",
          padding: "0 90px",
        }}
      >
        zo effectief in één les.
      </div>
      <div style={{ opacity: logo.opacity, translate: logo.translate, marginTop: 12 }}>
        <Logo size={70} />
      </div>
    </AbsoluteFill>
  );
};

export const KerndoelenGrijpmachine: React.FC<Props> = ({
  kerndoel1,
  kerndoel2,
  boekTitel,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.navy }}>
      <BookPattern />
      <Sequence  durationInFrames={3 * fps} layout="none">
        <IntroScene />
      </Sequence>
      <Sequence from={3 * fps} durationInFrames={5 * fps} layout="none">
        <GrabScene number={1} kerndoel={kerndoel1} />
      </Sequence>
      <Sequence from={8 * fps} durationInFrames={5 * fps} layout="none">
        <GrabScene number={2} kerndoel={kerndoel2} />
      </Sequence>
      <Sequence from={13 * fps} durationInFrames={4 * fps} layout="none">
        <BookScene boekTitel={boekTitel} />
      </Sequence>
      <Sequence from={17 * fps} durationInFrames={3 * fps} layout="none">
        <PayoffScene />
      </Sequence>
    </AbsoluteFill>
  );
};
