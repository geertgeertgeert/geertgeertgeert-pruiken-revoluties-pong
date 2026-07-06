/* Data for the walkable 3D day-maps: simple primitive geometry, NPC
 * placements and exit portals. Kept deliberately low-poly (boxes and
 * planes only) so it stays light on mid-range phones. */

const WORLD_MAPS = {
  bruiloft: {
    ground: '#2E2013',
    fog: '#1A1210',
    fogDensity: 0.045,
    ambient: '#6B4A2A',
    sun: '#FFC46E',
    sunIntensity: 1.1,
    bounds: { minX: -8.5, maxX: 8.5, minZ: -10.5, maxZ: 9 },
    playerStart: [0, 0, 7],
    structures: [
      // aisle pillars
      { pos: [-4, 0, 4], size: [1, 3.2, 1], color: '#4A3420' },
      { pos: [4, 0, 4], size: [1, 3.2, 1], color: '#4A3420' },
      { pos: [-4, 0, -1], size: [1, 3.2, 1], color: '#4A3420' },
      { pos: [4, 0, -1], size: [1, 3.2, 1], color: '#4A3420' },
      { pos: [-4, 0, -6], size: [1, 3.2, 1], color: '#4A3420' },
      { pos: [4, 0, -6], size: [1, 3.2, 1], color: '#4A3420' },
      // altar arch at the back
      { pos: [-3, 0, -9.5], size: [1, 5, 1], color: '#3D2817' },
      { pos: [3, 0, -9.5], size: [1, 5, 1], color: '#3D2817' },
      { pos: [0, 4.4, -9.5], size: [7, 1, 1], color: '#3D2817' },
    ],
    npcs: [
      { id: 'gifford', sprite: 'giffordHorse', pos: [0, 0, -6], talk: 'day1_1', label: 'Gifford' },
    ],
    exit: { pos: [0, 0, -11], next: 'day2_title', hint: 'Loop naar de poort om verder te gaan' },
  },

  troonzaal: {
    ground: '#241F10',
    fog: '#12141C',
    fogDensity: 0.045,
    ambient: '#5A5230',
    sun: '#E6D28C',
    sunIntensity: 1.0,
    bounds: { minX: -8.5, maxX: 8.5, minZ: -10.5, maxZ: 9 },
    playerStart: [0, 0, 7],
    structures: [
      // hall side walls
      { pos: [-7.5, 0, -1], size: [1, 3, 16], color: '#3A3320' },
      { pos: [7.5, 0, -1], size: [1, 3, 16], color: '#3A3320' },
      // pillars
      { pos: [-4.5, 0, 2], size: [0.8, 3.4, 0.8], color: '#4A4326' },
      { pos: [4.5, 0, 2], size: [0.8, 3.4, 0.8], color: '#4A4326' },
      { pos: [-4.5, 0, -4], size: [0.8, 3.4, 0.8], color: '#4A4326' },
      { pos: [4.5, 0, -4], size: [0.8, 3.4, 0.8], color: '#4A4326' },
      // throne dais
      { pos: [0, 0, -8.5], size: [6, 0.6, 3], color: '#4A4326' },
    ],
    npcs: [
      { id: 'edward', sprite: 'edward', pos: [0, 0.6, -8], talk: 'day2_1', label: 'Koning Edward' },
      { id: 'bottle', sprite: 'bottle', pos: [-2.6, 0, -5], talk: 'day2_2', label: 'Vergiftflesje', scale: 0.6 },
    ],
    exit: { pos: [0, 0, -11], next: 'day3_title', hint: 'Loop naar de poort om verder te gaan' },
  },

  tower: {
    ground: '#12161E',
    fog: '#080A10',
    fogDensity: 0.05,
    ambient: '#2A3A50',
    sun: '#9FC0E6',
    sunIntensity: 0.9,
    bounds: { minX: -8, maxX: 8, minZ: -10, maxZ: 9 },
    playerStart: [0, 0, 7],
    structures: [
      // courtyard walls
      { pos: [-7.5, 0, -2], size: [1, 2.6, 14], color: '#1F2A3A' },
      { pos: [7.5, 0, -2], size: [1, 2.6, 14], color: '#1F2A3A' },
      // the Tower itself
      { pos: [0, 0, -9], size: [4, 7, 4], color: '#1A1A2E' },
      { pos: [-1.6, 7, -9], size: [0.7, 0.7, 0.7], color: '#2A2A3E' },
      { pos: [1.6, 7, -9], size: [0.7, 0.7, 0.7], color: '#2A2A3E' },
      { pos: [0, 7, -7.4], size: [0.7, 0.7, 0.7], color: '#2A2A3E' },
    ],
    npcs: [
      { id: 'crown', sprite: 'crown', pos: [0, 0, -5], talk: 'day3_2', label: 'De kroon', scale: 0.8, finalConversation: true },
    ],
    exit: null,
  },
};
