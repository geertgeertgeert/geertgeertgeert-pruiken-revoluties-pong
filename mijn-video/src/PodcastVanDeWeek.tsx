import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { colors, fontFamily } from "./theme";
import { fadeUp } from "./animations";
import { BookPattern } from "./components/BookPattern";
import { Logo } from "./components/Logo";

export const PodcastVanDeWeekSchema = z.object({
  podcastNaam: z.string(),
  aflevering: z.string(),
});

type Props = z.infer<typeof PodcastVanDeWeekSchema>;

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
          PODCAST VAN DE WEEK
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
          Geen nieuwe aflevering nodig.
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
        Met zoveel podcasts over onderwijs hoef je niet te wachten op iets
        nieuws.{" "}
        <span style={{ fontStyle: "italic", fontWeight: 400, color: colors.gold }}>
          Herontdek een oude aflevering.
        </span>
      </div>
    </AbsoluteFill>
  );
};

const RevealScene: React.FC<{ podcastNaam: string; aflevering: string }> = ({
  podcastNaam,
  aflevering,
}) => {
  const frame = useCurrentFrame();
  const naam = fadeUp(frame, 0, 26);
  const afl = fadeUp(frame, 20, 24);

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
          {podcastNaam}
        </div>
        <div
          style={{
            opacity: afl.opacity,
            translate: afl.translate,
            fontFamily,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 36,
            color: colors.gold,
            textAlign: "center",
          }}
        >
          {aflevering}
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
        Luister mee.
      </div>
    </AbsoluteFill>
  );
};

export const PodcastVanDeWeek: React.FC<Props> = ({
  podcastNaam,
  aflevering,
}) => {
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
        <RevealScene podcastNaam={podcastNaam} aflevering={aflevering} />
      </Sequence>
      <Sequence from={13 * fps} durationInFrames={2 * fps} layout="none">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
