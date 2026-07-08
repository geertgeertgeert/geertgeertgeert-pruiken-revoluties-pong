import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { colors, fontFamily } from "./theme";
import { fadeUp } from "./animations";
import { BookPattern } from "./components/BookPattern";
import { Logo } from "./components/Logo";

export const GeheimePlekVoorBoekenSchema = z.object({
  plekNaam: z.string(),
});

type Props = z.infer<typeof GeheimePlekVoorBoekenSchema>;

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const label = fadeUp(frame, 0, 22);
  const text = fadeUp(frame, 18, 26);

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
          EEN GEHEIME PLEK
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
          Voor duurzame, goedkope boeken.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const AnecdoteLine: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const fade = fadeUp(frame, 0, 28);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: "0 90px" }}
    >
      <div
        style={{
          opacity: fade.opacity,
          translate: fade.translate,
          fontFamily,
          fontWeight: 600,
          fontSize: 50,
          color: colors.cream,
          textAlign: "center",
          lineHeight: 1.35,
          maxWidth: 860,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const RevealScene: React.FC<{ plekNaam: string }> = ({ plekNaam }) => {
  const frame = useCurrentFrame();
  const label = fadeUp(frame, 0, 22);
  const naam = fadeUp(frame, 16, 26);

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
            fontSize: 32,
            letterSpacing: 2,
            color: colors.gold,
          }}
        >
          DE PLEK
        </div>
        <div
          style={{
            opacity: naam.opacity,
            translate: naam.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 62,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {plekNaam}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = fadeUp(frame, 0, 22);
  const title = fadeUp(frame, 18, 26);
  const cta = fadeUp(frame, 42, 24);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 24 }}>
      <div style={{ opacity: logo.opacity, translate: logo.translate }}>
        <Logo size={100} />
      </div>
      <div
        style={{
          opacity: title.opacity,
          translate: title.translate,
          fontFamily,
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: 46,
          color: colors.cream,
        }}
      >
        Een boek voor jou.
      </div>
      <div
        style={{
          opacity: cta.opacity,
          translate: cta.translate,
          fontFamily,
          fontWeight: 400,
          fontSize: 32,
          color: colors.gold,
          textAlign: "center",
        }}
      >
        Deel jouw eigen geheime plek.
      </div>
    </AbsoluteFill>
  );
};

export const GeheimePlekVoorBoeken: React.FC<Props> = ({ plekNaam }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.navy }}>
      <BookPattern />
      <Sequence  durationInFrames={3 * fps} layout="none">
        <HookScene />
      </Sequence>
      <Sequence from={3 * fps} durationInFrames={5 * fps} layout="none">
        <AnecdoteLine text="Aan het einde van het schooljaar kocht ik hier een stapel boeken voor een tientje." />
      </Sequence>
      <Sequence from={8 * fps} durationInFrames={5 * fps} layout="none">
        <AnecdoteLine text="Zo kon elk kind de zomer in met een boek dat speciaal voor hen was uitgekozen." />
      </Sequence>
      <Sequence from={13 * fps} durationInFrames={5 * fps} layout="none">
        <RevealScene plekNaam={plekNaam} />
      </Sequence>
      <Sequence from={18 * fps} durationInFrames={4 * fps} layout="none">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
