import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { colors, fontFamily } from "./theme";
import { fadeUp } from "./animations";
import { BookPattern } from "./components/BookPattern";
import { Logo } from "./components/Logo";

export const InstagramAanbevelingSchema = z.object({
  handle: z.string(),
  reden: z.string(),
});

type Props = z.infer<typeof InstagramAanbevelingSchema>;

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
          EEN ONONTDEKT PROFIEL
        </div>
        <div
          style={{
            opacity: text.opacity,
            translate: text.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 58,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.25,
          }}
        >
          Verdient meer volgers dan het nu heeft.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const RevealScene: React.FC<{ handle: string; reden: string }> = ({
  handle,
  reden,
}) => {
  const frame = useCurrentFrame();
  const handleFade = fadeUp(frame, 0, 26);
  const redenFade = fadeUp(frame, 20, 24);

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
            opacity: handleFade.opacity,
            translate: handleFade.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 68,
            color: colors.cream,
          }}
        >
          {handle}
        </div>
        <div
          style={{
            opacity: redenFade.opacity,
            translate: redenFade.translate,
            fontFamily,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 40,
            color: colors.gold,
            textAlign: "center",
          }}
        >
          {reden}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = fadeUp(frame, 0, 18);
  const text = fadeUp(frame, 14, 22);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 22 }}>
      <div style={{ opacity: logo.opacity, translate: logo.translate }}>
        <Logo size={90} />
      </div>
      <div
        style={{
          opacity: text.opacity,
          translate: text.translate,
          fontFamily,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 36,
          color: colors.gold,
        }}
      >
        Volg ze.
      </div>
    </AbsoluteFill>
  );
};

export const InstagramAanbeveling: React.FC<Props> = ({ handle, reden }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.navy }}>
      <BookPattern />
      <Sequence  durationInFrames={3.5 * fps} layout="none">
        <HookScene />
      </Sequence>
      <Sequence from={3.5 * fps} durationInFrames={4.5 * fps} layout="none">
        <RevealScene handle={handle} reden={reden} />
      </Sequence>
      <Sequence from={8 * fps} durationInFrames={4 * fps} layout="none">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
