import "./index.css";
import { Composition } from "remotion";
import { IntroListLezen } from "./IntroListLezen";
import {
  ListvraagVanVandaag,
  ListvraagVanVandaagSchema,
} from "./ListvraagVanVandaag";
import { DrieSignalen } from "./DrieSignalen";
import { MytheVsFeit } from "./MytheVsFeit";
import { DeLeestimer } from "./DeLeestimer";
import { OngemakkelijkeTip } from "./OngemakkelijkeTip";
import {
  QuoteVanEenLeerling,
  QuoteVanEenLeerlingSchema,
} from "./QuoteVanEenLeerling";
import {
  CijfersDieJeOvertuigen,
  CijfersDieJeOvertuigenSchema,
} from "./CijfersDieJeOvertuigen";
import { TerugNaarSchool } from "./TerugNaarSchool";

const PORTRAIT = { width: 1080, height: 1920, fps: 30 };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="IntroListLezen"
        component={IntroListLezen}
        durationInFrames={20 * PORTRAIT.fps}
        {...PORTRAIT}
      />
      <Composition
        id="ListvraagVanVandaag"
        component={ListvraagVanVandaag}
        durationInFrames={6 * PORTRAIT.fps}
        {...PORTRAIT}
        schema={ListvraagVanVandaagSchema}
        defaultProps={{
          vraag: "Wat doe je met een kind dat nooit uitleest?",
        }}
      />
      <Composition
        id="DrieSignalen"
        component={DrieSignalen}
        durationInFrames={15 * PORTRAIT.fps}
        {...PORTRAIT}
      />
      <Composition
        id="MytheVsFeit"
        component={MytheVsFeit}
        durationInFrames={20 * PORTRAIT.fps}
        {...PORTRAIT}
      />
      <Composition
        id="DeLeestimer"
        component={DeLeestimer}
        durationInFrames={8 * PORTRAIT.fps}
        {...PORTRAIT}
      />
      <Composition
        id="OngemakkelijkeTip"
        component={OngemakkelijkeTip}
        durationInFrames={25 * PORTRAIT.fps}
        {...PORTRAIT}
      />
      <Composition
        id="QuoteVanEenLeerling"
        component={QuoteVanEenLeerling}
        durationInFrames={10 * PORTRAIT.fps}
        {...PORTRAIT}
        schema={QuoteVanEenLeerlingSchema}
        defaultProps={{
          quote: "Nu al voorbij?",
          attributie: "leerling, groep 5",
        }}
      />
      <Composition
        id="CijfersDieJeOvertuigen"
        component={CijfersDieJeOvertuigen}
        durationInFrames={20 * PORTRAIT.fps}
        {...PORTRAIT}
        schema={CijfersDieJeOvertuigenSchema}
        defaultProps={{
          stat1: {
            percentage: 80,
            label: "van de klassen leest merkbaar rustiger na een vaste dagelijkse routine",
          },
          stat2: {
            percentage: 65,
            label: "van de leerlingen kiest binnen een week zelfstandig een passend boek",
          },
          stat3: {
            percentage: 90,
            label: "van de leerkrachten wil de aanpak volgend jaar voortzetten",
          },
          bron: "voorbeeldcijfers — vervang door je eigen (bron)onderzoek",
        }}
      />
      <Composition
        id="TerugNaarSchool"
        component={TerugNaarSchool}
        durationInFrames={15 * PORTRAIT.fps}
        {...PORTRAIT}
      />
    </>
  );
};
