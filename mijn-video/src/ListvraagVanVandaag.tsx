import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { colors, fontFamily } from "./theme";
import { fadeUp } from "./animations";
import { BookPattern } from "./components/BookPattern";
import { QuestionMark } from "./components/QuestionMark";

export const ListvraagVanVandaagSchema = z.object({
  vraag: z.string(),
});

type Props = z.infer<typeof ListvraagVanVandaagSchema>;

const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, 40], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [20, 60], [0, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          padding: "0 100px",
        }}
      >
        <div
          style={{
            opacity,
            scale,
            fontFamily,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 72,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          Listvraag van vandaag
        </div>
        <div
          style={{
            width: lineWidth,
            height: 4,
            borderRadius: 2,
            background: colors.gold,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const QuestionCard: React.FC<{ vraag: string }> = ({ vraag }) => {
  const frame = useCurrentFrame();
  const icon = fadeUp(frame, 0, 20);
  const text = fadeUp(frame, 14, 26);

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
          gap: 32,
          maxWidth: 880,
        }}
      >
        <div style={{ opacity: icon.opacity, translate: icon.translate }}>
          <QuestionMark size={64} />
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
            lineHeight: 1.25,
          }}
        >
          {vraag}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ListvraagVanVandaag: React.FC<Props> = ({ vraag }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.navy }}>
      <BookPattern />
      <Sequence  durationInFrames={60} layout="none">
        <TitleCard />
      </Sequence>
      <Sequence from={60} durationInFrames={120} layout="none">
        <QuestionCard vraag={vraag} />
      </Sequence>
    </AbsoluteFill>
  );
};
