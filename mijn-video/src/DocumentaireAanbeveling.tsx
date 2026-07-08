import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { colors, fontFamily } from "./theme";
import { fadeUp } from "./animations";
import { BookPattern } from "./components/BookPattern";
import { Logo } from "./components/Logo";

export const DocumentaireAanbevelingSchema = z.object({
  titel: z.string(),
});

type Props = z.infer<typeof DocumentaireAanbevelingSchema>;

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
          DOCUMENTAIRE-TIP
        </div>
        <div
          style={{
            opacity: text.opacity,
            translate: text.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 64,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          Even niet scrollen.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const BodyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const text = fadeUp(frame, 0, 28);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: "0 90px" }}
    >
      <div
        style={{
          opacity: text.opacity,
          translate: text.translate,
          fontFamily,
          fontWeight: 600,
          fontSize: 52,
          color: colors.cream,
          textAlign: "center",
          lineHeight: 1.35,
          maxWidth: 860,
        }}
      >
        Documentaires{" "}
        <span style={{ fontStyle: "italic", fontWeight: 400, color: colors.gold }}>
          vertragen
        </span>{" "}
        en zoomen uit — precies wat de snelheid van social media ons soms
        laat vergeten.
      </div>
    </AbsoluteFill>
  );
};

const RevealScene: React.FC<{ titel: string }> = ({ titel }) => {
  const frame = useCurrentFrame();
  const text = fadeUp(frame, 0, 28);

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
          fontSize: 66,
          color: colors.cream,
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: 860,
        }}
      >
        {titel}
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
        <Logo size={100} />
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
        }}
      >
        Kijk deze week.
      </div>
    </AbsoluteFill>
  );
};

export const DocumentaireAanbeveling: React.FC<Props> = ({ titel }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.navy }}>
      <BookPattern />
      <Sequence  durationInFrames={4 * fps} layout="none">
        <HookScene />
      </Sequence>
      <Sequence from={4 * fps} durationInFrames={5 * fps} layout="none">
        <BodyScene />
      </Sequence>
      <Sequence from={9 * fps} durationInFrames={4 * fps} layout="none">
        <RevealScene titel={titel} />
      </Sequence>
      <Sequence from={13 * fps} durationInFrames={2 * fps} layout="none">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
