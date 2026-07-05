import "./index.css";
import { Composition } from "remotion";
import { SchrijverVanDeMaand } from "./SchrijverVanDeMaand";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SchrijverVanDeMaand"
      component={SchrijverVanDeMaand}
      durationInFrames={600}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
