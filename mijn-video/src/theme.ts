import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const fontFamily = "Fraunces";

export const fontsLoaded = Promise.all([
  loadFont({
    family: fontFamily,
    url: staticFile("fonts/Fraunces-normal.woff2"),
    weight: "400",
    style: "normal",
  }),
  loadFont({
    family: fontFamily,
    url: staticFile("fonts/Fraunces-normal.woff2"),
    weight: "600",
    style: "normal",
  }),
  loadFont({
    family: fontFamily,
    url: staticFile("fonts/Fraunces-normal.woff2"),
    weight: "900",
    style: "normal",
  }),
  loadFont({
    family: fontFamily,
    url: staticFile("fonts/Fraunces-italic.woff2"),
    weight: "400",
    style: "italic",
  }),
  loadFont({
    family: fontFamily,
    url: staticFile("fonts/Fraunces-italic.woff2"),
    weight: "600",
    style: "italic",
  }),
]);

export const colors = {
  navy: "#1E3A5F",
  navyDark: "#152941",
  gold: "#F2C94C",
  cream: "#F5E6C4",
};
