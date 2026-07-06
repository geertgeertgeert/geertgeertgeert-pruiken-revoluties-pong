/* Narrative content: scene themes and the story graph. */

const SCENES = {
  proloog: {
    mid: '#241E38', edge: '#12101C', bloomColor: 'rgba(200,180,255,0.16)',
    particleColor: '196,182,230',
  },
  bruiloft: {
    mid: '#4A3420', edge: '#1A1A2E', bloomColor: 'rgba(255,196,110,0.22)',
    particleColor: '224,168,90',
  },
  troonzaal: {
    mid: '#3A3320', edge: '#171A2A', bloomColor: 'rgba(230,210,140,0.18)',
    particleColor: '212,198,140',
  },
  tower: {
    mid: '#1F2A3A', edge: '#0C0F18', bloomColor: 'rgba(140,180,230,0.16)',
    particleColor: '150,180,220',
  },
};

const STORY = {
  start: 'intro1',

  nodes: {
    intro1: {
      type: 'narration', scene: 'proloog',
      text: 'In dit koninkrijk leven twee soorten mensen naast elkaar: de Verities, die altijd mens blijven — en de Eðianen, die bij het minste of geringste veranderen in een dier.',
      next: 'intro2',
    },
    intro2: {
      type: 'narration', scene: 'proloog',
      text: 'Aan het hof houdt niemand dat graag hardop toe. Vanavond trouwt Lady Jane Grey met een man die het hof liever verzwijgt dan bespreekt.',
      next: 'transform1',
    },
    transform1: {
      type: 'transform', scene: 'proloog', sprite: 'giffordHorse',
      speaker: '', text: 'Bij het eerste ochtendlicht verstijft Lord Gifford Dudley — en verandert, hoef voor hoef, in een kastanjebruin paard.',
      next: 'day1_title',
    },

    day1_title: { type: 'daytitle', day: 1, next: 'day1_1' },

    day1_1: {
      type: 'dialogue', scene: 'bruiloft', sprite: 'giffordHorse',
      speaker: 'Jane', text: 'Getrouwd met een paard bij daglicht. Als mijn boeken me iets geleerd hebben, is het dit: niemand vertelt je ooit het hele verhaal vooraf.',
      choices: [
        { label: 'Hem toch vertrouwen, ondanks alles.', next: 'day1_2a' },
        { label: 'Op haar hoede blijven.', next: 'day1_2b' },
      ],
    },
    day1_2a: {
      type: 'dialogue', scene: 'bruiloft', sprite: 'giffordHorse',
      speaker: 'Jane', text: 'Een vloek kiest niemand zelf. Ik zal hem naar zijn daden beoordelen, niet naar zijn vorm.',
      next: 'day2_title',
    },
    day1_2b: {
      type: 'dialogue', scene: 'bruiloft', sprite: 'giffordHorse',
      speaker: 'Jane', text: 'Een gearrangeerd huwelijk, een gevloekte bruidegom, en een hof vol messen achter glimlachen. Ik hou mijn boek dicht bij de hand.',
      next: 'day2_title',
    },

    day2_title: { type: 'daytitle', day: 2, next: 'day2_1' },

    day2_1: {
      type: 'dialogue', scene: 'troonzaal', sprite: 'edward',
      speaker: 'Koning Edward', text: 'Elke avond word ik zwakker, Jane. De medicijnmeesters fluisteren over een zwak hart. Ik ruik iets anders in mijn beker.',
      next: 'day2_2',
    },
    day2_2: {
      type: 'dialogue', scene: 'troonzaal', sprite: 'bottle',
      speaker: '', text: 'Op de tafel naast de troon staat een flesje dat er niet hoort te staan — de inhoud gloeit ziekelijk groen.',
      choices: [
        { label: 'Het flesje onderzoeken.', next: 'day2_3a' },
        { label: 'Het laten staan; de koning niet verontrusten.', next: 'day2_3b' },
      ],
    },
    day2_3a: {
      type: 'dialogue', scene: 'troonzaal', sprite: 'edward',
      speaker: 'Jane', text: 'Vergif, Majesteit. Geen ziekte van het hart — een hand die u dat hart wil ontnemen.',
      next: 'day3_title',
    },
    day2_3b: {
      type: 'dialogue', scene: 'troonzaal', sprite: 'edward',
      speaker: 'Jane', text: 'Ik zeg niets — maar mijn boek onthoudt alles. Wie dit flesje daar zette, zal zichzelf verraden.',
      next: 'day3_title',
    },

    day3_title: { type: 'daytitle', day: 3, next: 'day3_1' },

    day3_1: {
      type: 'dialogue', scene: 'tower', sprite: 'tower',
      speaker: '', text: 'De koning is dood. Binnen een dag staat er een kroon op Janes hoofd — en binnen een week de Tower om haar heen.',
      next: 'day3_2',
    },
    day3_2: {
      type: 'dialogue', scene: 'tower', sprite: 'crown',
      speaker: 'Jane', text: 'Een kroon die niemand mij vroeg te dragen, in een toren die niemand mij vroeg te betreden. Maar ik ben hier, en ik kies nog steeds.',
      choices: [
        { label: 'Vechten voor de troon.', next: 'end_fight' },
        { label: 'Vluchten met Gifford, koste wat kost.', next: 'end_flee' },
      ],
    },

    end_fight: {
      type: 'end', scene: 'tower', sprite: 'crown',
      speaker: 'Jane', text: 'Ze namen mijn vrijheid, niet mijn stem. Wat er ook gebeurt — dit verhaal eindigt niet in stilte.',
    },
    end_flee: {
      type: 'end', scene: 'tower', sprite: 'giffordHorse',
      speaker: 'Jane', text: 'Geen troon is het paard waard dat naast me staat. We rijden bij zonsopgang, mens en dier, weg van deze stenen muren.',
    },
  },
};
