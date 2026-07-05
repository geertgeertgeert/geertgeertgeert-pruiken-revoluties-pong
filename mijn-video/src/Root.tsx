import "./index.css";
import { Composition } from "remotion";
import { IntroListLezen } from "./IntroListLezen";
import { ListvraagVanVandaag } from "./ListvraagVanVandaag";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="IntroListLezen"
        component={IntroListLezen}
        durationInFrames={20 * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ListvraagVanVandaag"
        component={ListvraagVanVandaag}
        durationInFrames={5 * 30}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
