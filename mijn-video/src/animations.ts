import { Easing, interpolate } from "remotion";

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

export const fadeUp = (
  frame: number,
  from: number,
  durationInFrames = 24,
) => {
  const opacity = interpolate(frame, [from, from + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const y = interpolate(frame, [from, from + durationInFrames], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  return { opacity, translate: `0px ${y}px` };
};
