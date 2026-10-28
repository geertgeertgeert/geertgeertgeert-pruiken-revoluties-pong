// Draai met: node oertocht/test.js
const assert = require('assert');
const O = require('./engine.js');

function play(lines, at) {
  const G = at ? O.startAt(at) : O.newGame();
  const out = [];
  for (const l of lines) { const e = O.turn(G, l); if (e) out.push(e.out.map(o => o.text).join(' ')); }
  return { G, text: out.join('\n') };
}
const cmds = (t, sc) => O.parse(t, O.SCENES[sc]).sentences.flatMap(s => s.cmds);
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok', name); };

t('zinnen uit het hoofdstuk', () => {
  const r = play(['Ga niet naar de rook, dat is gevaarlijk, het is een fabriek.', 'Loop naar het vuur en pak het.', 'Kijk eerst goed om je heen.']);
  assert.match(r.text, /fabriek/);
  assert.match(r.text, /blote handen/);
  assert.ok(!r.G.over, 'groep overleeft de eerste fouten');
});
t('woordvolgorde: "Daarna vaart Ura terug"', () => {
  const c = cmds('Daarna vaart Ura terug.', 'rivier')[0];
  assert.deepStrictEqual(c.actors, ['ura']);
  assert.ok(c.mods.has('back'));
});
t('namen met "en"', () => assert.deepStrictEqual(cmds('Dan varen Ura en Sela naar de overkant.', 'rivier')[0].actors, ['ura', 'sela']));
t('"behalve"', () => assert.deepStrictEqual(cmds('Iedereen behalve Tiko loopt naar het noorden.', 'rook')[0].actors, ['ura', 'keb', 'sela']));
t('verwijswoord naar het hoofdding', () => assert.ok(cmds('Keb vlecht een fuik van wilgentenen en zet hem in de kreek.', 'kust')[1].objs.includes('fuik')));
t('rivier met de kano', () => {
  const r = play(['Zoek in het riet.', 'Ura en Sela varen met de kano naar de overkant. Daarna vaart Ura terug.', 'Ura en Tiko varen naar de overkant. Ura vaart terug en haalt Keb.'], 'rivier');
  assert.strictEqual(r.G.sceneId, 'nacht');
});
t('kano met z\'n vieren slaat om', () => assert.match(play(['Zoek in het riet.', 'Iedereen in de kano en vaar naar de overkant.'], 'rivier').text, /kantelt/));
t('nacht met wacht en afspraak', () => {
  const r = play(['Keb, sprokkel hout en maak een vuur.', 'Keb en Ura houden om de beurt de wacht. Als de wolven komen, maak dan lawaai. Hang het vlees hoog in een boom.'], 'nacht');
  assert.match(r.text, /Zoals afgesproken/);
});
t('hele tocht is te winnen', () => {
  const r = play(['Keb, klim op de rots en kijk naar het dal.', 'Ura, sluip voorzichtig naar de zijkant van de brand en pak een brandende tak.',
    'Keb, droog de tondelzwam bij de brandende tak en stop daarna gloeiende kooltjes in de tondel.', 'Loop met de hele groep naar het noorden, om de brand heen.',
    'Keb, volg het spoor stil naar het noorden.', 'Keb, sluip om het hert heen naar de oostkant.', 'Keb, schiet het hert met je boog.', 'Trek verder naar het westen.',
    'Zoek in het riet.', 'Ura en Sela varen met de kano naar de overkant. Daarna vaart Ura terug. Dan varen Ura en Tiko naar de overkant. Ura vaart terug en haalt Keb.',
    'Keb, sprokkel hout en maak een vuur. Sela, bouw een afdak met de huiden.', 'Keb en Ura houden om de beurt de wacht en leggen hout op het vuur. Hang het vlees hoog in een boom.',
    'Loop naar het westen, langs de rivier.',
    'Bouw de hut achter de duinen. Sela haalt zoet water uit de kom. Keb vlecht een fuik van wilgentenen en zet hem in de kreek. Tiko verzamelt schelpen op het strand. Ura sprokkelt drijfhout en maakt een vuur.']);
  assert.strictEqual(r.G.over && r.G.over.type, 'win');
});
t('vaag plan aan de kust mislukt', () => assert.strictEqual(play(['Bouw een hut, haal water en maak een vuur.'], 'kust').G.over.type, 'lose'));
t('geen crash op willekeurige invoer', () => {
  const w = 'Ura Keb je het daar als dan en of niet stil pak loop vaar maak hout vuur kano hert , . ? fabriek'.split(' ');
  for (let g = 0; g < 100; g++) {
    const G = O.startAt(O.SCENE_ORDER[g % 5]);
    for (let k = 0; k < 8 && !G.over; k++) O.turn(G, Array.from({ length: 1 + (g * 7 + k) % 12 }, (_, i) => w[(g * 31 + k * 7 + i * 13) % w.length]).join(' '));
  }
});
console.log(n + ' tests geslaagd');
