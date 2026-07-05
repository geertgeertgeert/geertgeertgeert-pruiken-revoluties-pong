import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import { colors, fontFamily } from "./theme";
import { fadeUp } from "./animations";
import { BookPattern } from "./components/BookPattern";

export const QuoteVanEenLeerlingSchema = z.object({
  quote: z.string(),
  attributie: z.string(),
});

type Props = z.infer<typeof QuoteVanEenLeerlingSchema>;

export const QuoteVanEenLeerling: React.FC<Props> = ({ quote, attributie }) => {
  const frame = useCurrentFrame();
  const mark = fadeUp(frame, 0, 20);
  const text = fadeUp(frame, 12, 28);
  const attr = fadeUp(frame, 50, 22);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.navy,
        justifyContent: "center",
        alignItems: "center",
        padding: "0 100px",
      }}
    >
      <BookPattern />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          maxWidth: 860,
        }}
      >
        <div
          style={{
            opacity: mark.opacity,
            translate: mark.translate,
            fontFamily,
            fontWeight: 900,
            fontSize: 100,
            lineHeight: 0.5,
            color: colors.gold,
          }}
        >
          "
        </div>
        <div
          style={{
            opacity: text.opacity,
            translate: text.translate,
            fontFamily,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 58,
            color: colors.cream,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {quote}
        </div>
        <div
          style={{
            opacity: attr.opacity,
            translate: attr.translate,
            fontFamily,
            fontWeight: 400,
            fontSize: 32,
            color: colors.gold,
            textAlign: "center",
          }}
        >
          — {attributie}
        </div>
      </div>
    </AbsoluteFill>
  );
};
