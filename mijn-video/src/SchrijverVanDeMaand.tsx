import { useMemo } from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
const serifFont = 'Georgia, "Times New Roman", serif';
const sansFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

const INK = "#15110d";
const INK_DEEP = "#0a0805";
const CREAM = "#f5ecdb";
const CREAM_DIM = "rgba(245, 236, 219, 0.62)";
const GOLD = "#d8ac66";
const GOLD_DIM = "rgba(216, 172, 102, 0.35)";

const NAME = "Hans Hagen";
const HANDLE = "@list lezen";

// ---------- Background ----------

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const driftA = interpolate(frame, [0, durationInFrames], [0, 60]);
  const driftB = interpolate(frame, [0, durationInFrames], [0, -80]);
  const grain = interpolate(Math.sin(frame / 9), [-1, 1], [0.985, 1]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 50% 8%, ${INK} 0%, ${INK_DEEP} 55%, #050403 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          top: -320 + driftA * 0.4,
          left: -260 + driftA,
          background: `radial-gradient(circle, ${GOLD_DIM} 0%, rgba(216,172,102,0) 70%)`,
          filter: "blur(10px)",
          transform: `scale(${grain})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          borderRadius: "50%",
          bottom: -300 + driftB * 0.3,
          right: -220 + driftB * -1,
          background:
            "radial-gradient(circle, rgba(245,236,219,0.06) 0%, rgba(245,236,219,0) 70%)",
          filter: "blur(6px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          fontFamily: serifFont,
          fontSize: 640,
          color: "rgba(245, 236, 219, 0.035)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 40,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        &rdquo;
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 260px 90px rgba(0,0,0,0.55)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Brand intro ----------

const BrandIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const exitStart = durationInFrames - 25;
  const exit = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;
  const scale = interpolate(enter, [0, 1], [0.85, 1]);

  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: `2px solid ${GOLD}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: serifFont,
            fontSize: 34,
            color: GOLD,
          }}
        >
          &rdquo;
        </div>
        <div
          style={{
            fontFamily: sansFont,
            fontSize: 40,
            letterSpacing: 6,
            color: CREAM,
            textTransform: "uppercase",
          }}
        >
          {HANDLE}
        </div>
        <div
          style={{
            fontFamily: sansFont,
            fontSize: 22,
            letterSpacing: 4,
            color: CREAM_DIM,
            textTransform: "uppercase",
          }}
        >
          presenteert
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Title ----------

const TitleReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const exitStart = durationInFrames - 20;
  const exit = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;
  const y = interpolate(enter, [0, 1], [50, 0]);

  const pillEnter = spring({
    frame: frame - 14,
    fps,
    config: { damping: 12, stiffness: 160 },
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          opacity,
          transform: `translateY(${y}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          padding: "0 70px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: sansFont,
            fontSize: 30,
            letterSpacing: 8,
            color: CREAM_DIM,
            textTransform: "uppercase",
          }}
        >
          Schrijver van de maand
        </div>
        <div
          style={{
            transform: `scale(${pillEnter})`,
            fontFamily: serifFont,
            fontSize: 78,
            color: GOLD,
            border: `2px solid ${GOLD}`,
            borderRadius: 100,
            padding: "14px 56px",
          }}
        >
          Juli
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Teaser ----------

const Teaser: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const exitStart = durationInFrames - 18;
  const exit = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;

  const dotCount = Math.floor((frame / 12) % 4);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          opacity,
          textAlign: "center",
          padding: "0 90px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            fontFamily: serifFont,
            fontStyle: "italic",
            fontSize: 48,
            lineHeight: 1.35,
            color: CREAM,
          }}
        >
          Deze maand stellen we een bijzondere schrijver aan je voor
        </div>
        <div
          style={{
            fontFamily: sansFont,
            fontSize: 30,
            letterSpacing: 4,
            color: GOLD,
            height: 40,
          }}
        >
          {".".repeat(dotCount)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Name reveal, letter by letter ----------

const LETTER_SPACING_FRAMES = 15;

const NameReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const letters = useMemo(() => NAME.split(""), []);

  const headerOpacity = spring({ frame, fps, config: { damping: 200 } });
  const exitStart = durationInFrames - 20;
  const exit = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let letterIndex = -1;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          opacity: headerOpacity * exit,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 46,
          padding: "0 60px",
        }}
      >
        <div
          style={{
            fontFamily: sansFont,
            fontSize: 26,
            letterSpacing: 8,
            color: CREAM_DIM,
            textTransform: "uppercase",
          }}
        >
          Ontmoet
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            fontFamily: serifFont,
            fontSize: 96,
            color: CREAM,
          }}
        >
          {letters.map((char, i) => {
            if (char === " ") {
              return <div key={i} style={{ width: 34 }} />;
            }
            letterIndex += 1;
            const delay = letterIndex * LETTER_SPACING_FRAMES;
            const localFrame = frame - delay;

            const placeholderOpacity = interpolate(
              localFrame,
              [-6, 0],
              [1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            const letterSpring = spring({
              frame: localFrame,
              fps,
              config: { damping: 11, stiffness: 180, mass: 0.7 },
            });
            const letterOpacity = interpolate(letterSpring, [0, 1], [0, 1]);
            const letterScale = interpolate(letterSpring, [0, 1], [0.4, 1]);
            const letterBlur = interpolate(
              localFrame,
              [0, 16],
              [16, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            const letterY = interpolate(letterSpring, [0, 1], [36, 0]);

            return (
              <div
                key={i}
                style={{ position: "relative", width: 70, textAlign: "center" }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: placeholderOpacity,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    paddingBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 6,
                      borderRadius: 3,
                      background: GOLD,
                    }}
                  />
                </div>
                <div
                  style={{
                    opacity: letterOpacity,
                    transform: `translateY(${letterY}px) scale(${letterScale})`,
                    filter: `blur(${letterBlur}px)`,
                  }}
                >
                  {char}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Outro ----------

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const exitStart = durationInFrames - 22;
  const exit = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;

  const lineWidth = interpolate(
    spring({ frame: frame - 8, fps, config: { damping: 200 } }),
    [0, 1],
    [0, 260],
  );

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          opacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          padding: "0 60px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: serifFont,
            fontSize: 88,
            color: CREAM,
          }}
        >
          {NAME}
        </div>
        <div
          style={{
            width: lineWidth,
            height: 2,
            background: GOLD,
          }}
        />
        <div
          style={{
            fontFamily: sansFont,
            fontSize: 26,
            letterSpacing: 5,
            color: GOLD,
            textTransform: "uppercase",
          }}
        >
          Schrijver van de maand &middot; Juli
        </div>
        <div
          style={{
            marginTop: 40,
            fontFamily: sansFont,
            fontSize: 30,
            color: CREAM_DIM,
          }}
        >
          Volg {HANDLE} voor het volledige interview
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Root composition ----------

export const SchrijverVanDeMaand: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Background />

      <Sequence from={0} durationInFrames={90}>
        <BrandIntro />
      </Sequence>

      <Sequence from={75} durationInFrames={135}>
        <TitleReveal />
      </Sequence>

      <Sequence from={195} durationInFrames={105}>
        <Teaser />
      </Sequence>

      <Sequence from={270} durationInFrames={240}>
        <NameReveal />
      </Sequence>

      <Sequence from={510} durationInFrames={90}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
