/*
 * Oertocht — taal-engine
 *
 * De groep voert uit wat er staat, niet wat er bedoeld wordt. Alles is
 * regelgebaseerd en deterministisch: er gaat geen tekst naar een server en er
 * zit geen taalmodel in. Dezelfde zin geeft in dezelfde situatie altijd
 * hetzelfde gedrag, zodat een klas kan vergelijken en herschrijven.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Oertocht = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* De groep                                                             */
  /* ------------------------------------------------------------------ */

  const PARTY = ['ura', 'keb', 'sela', 'tiko'];
  const PEOPLE = {
    ura: { name: 'Ura', role: 'jaagster', trait: 'Snel en sterk. Ongeduldig. Draagt een speer.' },
    keb: { name: 'Keb', role: 'spoorzoeker', trait: 'Ziet alles. Doet alles langzaam en precies. Draagt pijl en boog.' },
    sela: { name: 'Sela', role: 'de oudste', trait: 'Kent planten en water. Loopt langzaam. Kan niet zwemmen.' },
    tiko: { name: 'Tiko', role: 'kind, 9 jaar', trait: 'Nieuwsgierig en klein. Raakt in paniek als hij alleen is.' },
  };
  const PARTS = ['ochtend', 'middag', 'avond'];
  const DEADLINE_DAY = 14;
  const MAX_HP = 3;

  /* ------------------------------------------------------------------ */
  /* Woordenschat                                                         */
  /* ------------------------------------------------------------------ */

  const VERB = Object.create(null);
  function V(lemma, list) { list.split(' ').forEach(f => { VERB[f] = lemma; }); }
  V('kijk', 'kijk kijkt kijken bekijk bekijkt bekijken tuur tuurt turen speur speurt speuren observeer observeert observeren onderzoek onderzoekt onderzoeken inspecteer inspecteert inspecteren check checkt checken');
  V('zoek', 'zoek zoekt zoeken doorzoek doorzoekt doorzoeken');
  V('klim', 'klim klimt klimmen beklim beklimt beklimmen');
  V('verken', 'verken verkent verkennen');
  V('luister', 'luister luistert luisteren');
  V('ruik', 'ruik ruikt ruiken snuif snuift snuiven');
  V('voel', 'voel voelt voelen raak raakt raken betast betasten test testen peil peilt peilen meet meten druk drukt drukken');
  V('loop', 'loop loopt lopen ga gaat gaan wandel wandelt wandelen trek trekt trekken kom komt komen beweeg beweegt bewegen stap stapt stappen reis reist reizen vertrek vertrekt vertrekken keer keert keren daal daalt dalen');
  V('volg', 'volg volgt volgen');
  V('ren', 'ren rent rennen');
  V('sluip', 'sluip sluipt sluipen kruip kruipt kruipen besluip besluipt besluipen');
  V('vlucht', 'vlucht vluchten');
  V('wacht', 'wacht wachten blijf blijft blijven sta staan');
  V('rust', 'rust rusten slaap slaapt slapen lig liggen zit zitten');
  V('pak', 'pak pakt pakken neem neemt nemen grijp grijpt grijpen raap raapt rapen haal haalt halen til tilt tillen leen leent lenen');
  V('draag', 'draag draagt dragen sjouw sjouwt sjouwen');
  V('verzamel', 'verzamel verzamelt verzamelen pluk plukt plukken sprokkel sprokkelt sprokkelen graaf graaft graven oogst oogsten');
  V('jaag', 'jaag jaagt jagen schiet schieten gooi gooit gooien werp werpt werpen dood doodt doden vang vangt vangen mik mikt mikken');
  V('vis', 'vis vist vissen');
  V('plaats', 'zet zetten plaats plaatst plaatsen leg legt leggen hang hangt hangen stop stopt stoppen');
  V('drink', 'drink drinkt drinken');
  V('eet', 'eet eten');
  V('vul', 'vul vult vullen schep schept scheppen');
  V('maak', 'maak maakt maken bouw bouwt bouwen vlecht vlechten richt richten');
  V('droog', 'droog drogen');
  V('kook', 'kook kookt koken rooster roostert roosteren bak bakt bakken braad braadt braden');
  V('oversteek', 'oversteken waad waadt waden zwem zwemt zwemmen vaar vaart varen peddel peddelt peddelen roei roeit roeien');
  V('help', 'help helpt helpen ondersteun ondersteunt ondersteunen');
  V('verstop', 'verstop verstopt verstoppen schuil schuilt schuilen buk bukt bukken duik duikt duiken');
  V('bewaak', 'bewaak bewaakt bewaken waak waakt waken');
  V('blus', 'blus blust blussen doof dooft doven');
  V('lawaai', 'roep roept roepen schreeuw schreeuwt schreeuwen brul brult brullen joel joelt joelen fluit fluiten klap klapt klappen zwaai zwaait zwaaien');
  V('stook', 'stook stookt stoken blaas blaast blazen');
  V('geef', 'geef geeft geven');
  V('verzorg', 'verzorg verzorgt verzorgen verbind verbindt verbinden koel koelt koelen');
  V('duw', 'duw duwt duwen');
  V('uitgaan', 'uitgaan uitgaat doven');
  V('sla', 'sla slaat slaan');

  // Woorden die werkwoord kunnen zijn maar ook iets anders.
  const AMBIG = { eten: 'obj:voedsel', vis: 'obj:vis', vlucht: '', droog: 'mod:dry', stop: '', wacht: '', rust: '', trek: '', dood: '', test: '', druk: '', blaas: '', zit: '', lig: '', sta: '', kom: '', komt: '', komen: '', staan: '', liggen: '', zitten: '', vang: '' };
  const NEEDS_OBJ = new Set(['pak', 'draag', 'jaag', 'verzamel', 'droog', 'help', 'geef', 'plaats', 'verzorg', 'maak']);

  const ACTOR_WORD = {
    ura: 'ura', jaagster: 'ura', jager: 'ura',
    keb: 'keb', spoorzoeker: 'keb',
    sela: 'sela', oma: 'sela', oudste: 'sela', grootmoeder: 'sela',
    tiko: 'tiko', kind: 'tiko', jongen: 'tiko', kleintje: 'tiko',
  };
  const GROUP_WORD = {
    iedereen: PARTY, allemaal: PARTY, allen: PARTY, jullie: PARTY, groep: PARTY, we: PARTY, wij: PARTY,
    jagers: ['ura', 'keb'], volwassenen: ['ura', 'keb', 'sela'], groten: ['ura', 'keb', 'sela'],
  };

  const OBJ_GLOBAL = [
    ['speer', ['speer', 'speren', 'speertje']],
    ['boog', ['boog', 'pijl', 'pijlen', 'pijl en boog']],
    ['vuursteen', ['vuursteen', 'vuurstenen', 'vonksteen', 'silex']],
    ['pyriet', ['pyriet', 'zwavelkies', 'markasiet']],
    ['tondel', ['tondel', 'tondelzwam', 'zwam', 'tonderzwam', 'tondelzwammen', 'tondeldoos']],
    ['berkenbast', ['berkenbast', 'berkenschors', 'bast', 'schors']],
    ['huid', ['huid', 'huiden', 'vel', 'vellen', 'vacht', 'vachten']],
    ['mand', ['mand', 'manden', 'draagmand']],
    ['waterzak', ['waterzak', 'waterzakken', 'waterblaas', 'zak']],
    ['voedsel', ['voedsel', 'proviand', 'voorraad', 'vlees', 'noten', 'gedroogd vlees', 'het vlees']],
    ['hout', ['hout', 'takken', 'takjes', 'brandhout', 'sprokkelhout', 'stokken', 'droog hout', 'dood hout', 'droge takken', 'dode takken', 'drijfhout', 'wrakhout']],
    ['stok', ['stok', 'tak', 'lange tak', 'lange stok']],
    ['fakkel', ['fakkel', 'toorts', 'brandende tak', 'brandende stok', 'brandende takken', 'smeulende tak', 'brandend hout', 'brandende stokken']],
    ['kooltjes', ['kooltjes', 'kolen', 'gloed', 'sintels', 'houtskool', 'gloeiende kooltjes', 'gloeiende kolen', 'gloeiende houtskool', 'hete kooltjes', 'gloeiend hout']],
    ['vuur', ['vuur', 'vuurtje', 'vlammen', 'vlam', 'kampvuur']],
    ['water', ['water']],
    ['wind', ['wind']],
    ['vis', ['vis', 'vissen', 'visjes']],
    ['vonk', ['vonk', 'vonken', 'vonkjes']],
    ['lawaai', ['lawaai', 'herrie', 'kabaal', 'geluid', 'veel lawaai', 'veel geluid']],
    ['rivier', ['rivier']],
  ];

  const MOD = {
    stil: 'stealth', stilletjes: 'stealth', zacht: 'stealth', zachtjes: 'stealth', geruisloos: 'stealth', gebukt: 'stealth',
    onopvallend: 'stealth', ongezien: 'stealth', sluipend: 'stealth', muisstil: 'stealth', heimelijk: 'stealth', laag: 'stealth',
    voorzichtig: 'careful', behoedzaam: 'careful', langzaam: 'careful', kalm: 'careful', omzichtig: 'careful', rustig: 'careful',
    snel: 'fast', vlug: 'fast', hard: 'fast', rennend: 'fast', meteen: 'fast', direct: 'fast', haastig: 'fast', gauw: 'fast', onmiddellijk: 'fast', snelste: 'fast',
    samen: 'together', elkaar: 'together', vast: 'together',
    hoog: 'high', omhoog: 'high', boven: 'high', hoger: 'high', bovenop: 'high',
    terug: 'back', omheen: 'around', rond: 'around', langs: 'along', omweg: 'around',
    zijkant: 'side', opzij: 'side', achterkant: 'behind',
    droge: 'dry', nat: 'wet', natte: 'wet', zoet: 'fresh', zoete: 'fresh',
    verder: 'onward', rechtdoor: 'onward', vooruit: 'onward',
    dichterbij: 'close', dichtbij: 'close', dicht: 'close',
    beurt: 'rotate', afwisselen: 'rotate', aflossen: 'rotate', wisselen: 'rotate', wissel: 'rotate',
    weg: 'away',
  };
  const DIR = {
    noord: 'noord', noorden: 'noord', noordelijk: 'noord', noordwaarts: 'noord', noordkant: 'noord',
    zuid: 'zuid', zuiden: 'zuid', zuidelijk: 'zuid', zuidwaarts: 'zuid', zuidkant: 'zuid',
    oost: 'oost', oosten: 'oost', oostelijk: 'oost', oostwaarts: 'oost', oostkant: 'oost',
    west: 'west', westen: 'west', westelijk: 'west', westwaarts: 'west', westkant: 'west',
    links: 'links', rechts: 'rechts',
    stroomafwaarts: 'stroomaf', stroomopwaarts: 'stroomop',
  };
  const MOD_PHRASES = [
    ['tegen de wind in', 'windAgainst'], ['tegen de wind', 'windAgainst'], ['wind in het gezicht', 'windAgainst'],
    ['wind in je gezicht', 'windAgainst'], ['wind in hun gezicht', 'windAgainst'], ['wind van voren', 'windAgainst'],
    ['benedenwinds', 'windAgainst'], ['onderwinds', 'windAgainst'], ['onder de wind', 'windAgainst'],
    ['met de wind mee', 'windWith'], ['wind in de rug', 'windWith'], ['wind in je rug', 'windWith'], ['bovenwinds', 'windWith'],
    ['waar de zon ondergaat', 'dir:west'], ['waar de zon onder gaat', 'dir:west'], ['naar de ondergaande zon', 'dir:west'],
    ['waar de zon opkomt', 'dir:oost'], ['waar de zon op komt', 'dir:oost'],
    ['hand in hand', 'together'], ['bij elkaar', 'together'], ['achter elkaar', 'together'], ['in een rij', 'together'],
    ["met z'n allen", 'together'], ['met zijn allen', 'together'],
    ['stap voor stap', 'careful'],
    ['om de beurt', 'rotate'], ['wissel elkaar af', 'rotate'], ['los elkaar af', 'rotate'],
    ['boven het water', 'high'], ['boven je hoofd', 'high'], ['boven hun hoofd', 'high'], ['boven zijn hoofd', 'high'],
    ['boven haar hoofd', 'high'], ['op je hoofd', 'high'], ['op het hoofd', 'high'], ['op hun hoofd', 'high'],
    ['op de schouders', 'high'], ['op je schouders', 'high'], ['op zijn schouders', 'high'], ['op haar schouders', 'high'],
    ['zonder geluid', 'stealth'], ['zonder lawaai', 'stealth'], ['zonder te praten', 'stealth'], ['geen geluid', 'stealth'],
    ['geen lawaai', 'stealth'], ['wees stil', 'stealth'], ['doe stil', 'stealth'], ['wees zacht', 'stealth'],
    ['van opzij', 'side'], ['aan de zijkant', 'side'], ['de zijkant', 'side'], ['aan de kant', 'side'],
    ['achter de vlammen', 'behind'], ['achter het vuur', 'behind'],
    ['van de andere kant', 'opposite'], ['aan de andere kant', 'opposite'],
  ];

  const ANACH = new Set(('fabriek fabrieken auto autos auto\'s brandweer telefoon mobiel gsm smartphone lucifer lucifers aansteker ' +
    'geweer geweren pistool winkel supermarkt geld euro euros kaart landkaart plattegrond kompas horloge klok minuut minuten ' +
    'uur uren seconde seconden kilometer kilometers km meter meters plastic fles flessen flesje zaklamp lamp politie dokter ' +
    'ziekenhuis pleister pleisters medicijn medicijnen pil pillen fiets trein bus vliegtuig motor computer internet google ' +
    'chatgpt ai robot app tv televisie foto camera gps wifi pan ijzer metaal staal schaar pen papier school sms oven ' +
    'magnetron kachel verwarming rookmelder barbecue bbq benzine glas sigaret kraan kraanwater zwembad zwemvest reddingsvest ' +
    'ambulance 112 brug bruggen boot touwladder zakmes rugzak slaapzak tentstok hamer spijker spijkers wiel kar karren').split(' '));
  const VAGUE = new Set(['daar', 'daarheen', 'ginds', 'ginder', 'ding', 'dingen', 'iets', 'ergens', 'dinges', 'zoiets', 'dingetje', 'spul']);
  const PRON = new Set(['het', 'dat', 'dit', 'die', 'hem', 'ze', 'deze', 'zij']);
  const NEG = new Set(['niet', 'nooit', 'geen']);
  const COND = new Set(['als', 'wanneer', 'zodra', 'indien', 'mocht']);
  const SEP = new Set(['en', 'daarna', 'dan', 'vervolgens', 'erna', 'maar', 'of', 'want', 'omdat', 'zodat', 'daarom', 'toen', 'nadat']);
  const FN = new Set(('de het een naar met van in op aan bij uit om voor achter over onder tussen tot door te je jij hij zij ze ' +
    'we wij hun zijn haar mijn onze ons die dat dit er is ben bent was waren moet moeten mag mogen kan kunnen kun zal zullen ' +
    'wil willen laat laten wordt worden heel erg zo ook nog al even nu goed oke ok alsjeblieft alstublieft graag hallo hoi ' +
    'jouw jullie z\'n zich zelf elk elke ieder iedere alle beide twee drie vier een paar wat welke wie waar hoe waarom ' +
    'mee af heen neer los toe tegen zonder sneller niets niks niemand andere ander deze dus ja nee doe doen wees bovendien ' +
    'hier daar weer beetje stuk eens dichter eind kant plek plaats richting hele heel goed eerst').split(' '));

  /* ------------------------------------------------------------------ */
  /* Tokens                                                               */
  /* ------------------------------------------------------------------ */

  function fold(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’‘`´]/g, "'");
  }

  function tokenize(text) {
    const out = [];
    const re = /([A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:['’-][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*)|([.,!?;:\n])|([ \t\r]+)|(.)/g;
    let m;
    while ((m = re.exec(text))) {
      if (m[1]) out.push({ raw: m[1], n: fold(m[1]), type: 'w', c: 'unk' });
      else if (m[2]) out.push({ raw: m[2], n: m[2], type: 'p', c: 'p' });
      else if (m[3]) out.push({ raw: m[3], n: ' ', type: 's', c: 's' });
      else out.push({ raw: m[4], n: m[4], type: 'o', c: 'p' });
    }
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Parser                                                               */
  /* ------------------------------------------------------------------ */

  function buildPhrases(sceneObjs) {
    const map = new Map();
    for (const [id, words] of OBJ_GLOBAL) map.set(id, words.slice());
    for (const [id, words] of (sceneObjs || [])) map.set(id, (map.get(id) || []).concat(words));
    const list = [];
    for (const [id, words] of map) for (const w of words) list.push({ id, ph: fold(w).split(' ') });
    list.sort((a, b) => b.ph.length - a.ph.length);
    return list;
  }

  function findSeq(n, used, ph, from) {
    outer: for (let j = from || 0; j + ph.length <= n.length; j++) {
      for (let k = 0; k < ph.length; k++) if (used[j + k] || n[j + k] !== ph[k]) continue outer;
      return j;
    }
    return -1;
  }

  function parse(text, scene) {
    const toks = tokenize(text);
    const phrases = buildPhrases(scene && scene.objects);
    const triggers = (scene && scene.triggers) || [];
    const out = { toks, sentences: [], rules: [] };

    const sents = [];
    let cur = [];
    toks.forEach((t, i) => {
      if (t.type === 'p' && /[.!?;:\n]/.test(t.n)) { sents.push({ idx: cur, end: t.n }); cur = []; }
      else cur.push(i);
    });
    if (cur.length) sents.push({ idx: cur, end: '' });

    for (const s of sents) {
      const idx = s.idx.filter(i => toks[i].type === 'w' || (toks[i].type === 'p' && toks[i].n === ','));
      if (!idx.some(i => toks[i].type === 'w')) continue;
      const sent = { question: s.end === '?', cmds: [], rules: [], raw: idx.filter(i => toks[i].type === 'w').map(i => toks[i].raw).join(' ') };
      const state = { lastObj: null, lastActors: null };

      // Voorwaarde: "als ..., (dan) ..." of "... als ..."
      const words = idx.filter(i => toks[i].type === 'w');
      const ci = words.findIndex(i => COND.has(toks[i].n));
      if (ci >= 0) {
        toks[words[ci]].c = 'link';
        const pos = idx.indexOf(words[ci]);
        let condIdx, consIdx;
        if (ci === 0 || (ci === 1 && ['en', 'maar', 'dan'].includes(toks[words[0]].n))) {
          let end = -1;
          for (let k = pos + 1; k < idx.length; k++) {
            const t = toks[idx[k]];
            if (t.n === ',' || t.n === 'dan') { end = k; break; }
          }
          if (end < 0) {
            for (let k = pos + 1; k < idx.length; k++) if (VERB[toks[idx[k]].n]) { end = k + 1; break; }
          }
          if (end < 0) end = idx.length;
          condIdx = idx.slice(pos + 1, end);
          consIdx = idx.slice(end).filter(i => !(toks[i].n === ','));
          while (consIdx.length && toks[consIdx[0]].n === 'dan') { toks[consIdx[0]].c = 'link'; consIdx.shift(); }
        } else {
          let end = idx.length;
          for (let k = pos + 1; k < idx.length; k++) if (toks[idx[k]].n === ',') { end = k; break; }
          condIdx = idx.slice(pos + 1, end);
          consIdx = idx.slice(0, pos).concat(idx.slice(end + 1));
        }
        const condWords = condIdx.filter(i => toks[i].type === 'w');
        condWords.forEach(i => { toks[i].c = 'cond'; });
        const cn = condWords.map(i => toks[i].n);
        let trig = null;
        for (const tr of triggers) if (tr.words.some(w => cn.includes(w))) { trig = tr; break; }
        if (!trig && cn.some(w => ['gevaar', 'gevaarlijk', 'eng', 'mis', 'misgaat', 'fout'].includes(w))) trig = { id: 'gevaar', fuzzy: true };
        const cmds = parseClauses(consIdx, toks, phrases, state);
        const rule = {
          cond: condWords.map(i => toks[i].raw).join(' '),
          trigger: trig ? trig.id : null,
          fuzzy: !!(trig && trig.fuzzy),
          cmds,
        };
        sent.rules.push(rule);
        out.rules.push(rule);
      } else {
        sent.cmds = parseClauses(idx, toks, phrases, state);
      }
      out.sentences.push(sent);
    }
    return out;
  }

  function parseClauses(idx, toks, phrases, state) {
    // Opsplitsen in deelzinnen.
    const segs = [];
    let cur = [];
    let flag = null;
    let sep = 'start';
    const push = (nextFlag, nextSep) => { if (cur.length) segs.push({ idx: cur, flag, sep }); cur = []; flag = nextFlag || null; sep = nextSep || sep; };
    for (let k = 0; k < idx.length; k++) {
      const i = idx[k];
      const t = toks[i];
      if (t.n === ',') { push(flag === 'reason' ? 'reason' : null, ','); continue; }
      if (t.type === 'w' && SEP.has(t.n)) {
        t.c = 'link';
        if (t.n === 'of') { push('alt'); continue; }
        if (['want', 'omdat', 'zodat', 'daarom'].includes(t.n)) { push('reason'); continue; }
        // "stop daarna ..." of "ga dan naar ...": niet splitsen als er alleen een werkwoord staat
        if (t.n !== 'en' && cur.length === 1 && VERB[toks[cur[0]].n]) continue;
        if (!cur.length && sep !== 'start' && t.n !== 'en') { sep = t.n; continue; }
        push(flag === 'reason' ? 'reason' : null, t.n === 'en' ? 'en' : (cur.length || sep !== 'start') ? t.n : 'start');
        continue;
      }
      // "om ... te <werkwoord>" wordt een eigen opdracht
      if (t.type === 'w' && t.n === 'om') {
        let teAt = -1;
        for (let q = k + 1; q < idx.length && toks[idx[q]].n !== ','; q++) {
          if (toks[idx[q]].n === 'te' && idx[q + 1] !== undefined && VERB[toks[idx[q + 1]].n]) { teAt = q; break; }
          if (toks[idx[q]].n === 'heen') break;
        }
        if (teAt >= 0) {
          t.c = 'link';
          toks[idx[teAt]].c = 'fn';
          push('purpose');
          for (let q = k + 1; q < idx.length && toks[idx[q]].n !== ','; q++) if (q !== teAt) cur.push(idx[q]);
          // werkwoord achteraan zetten is niet nodig: de deelzin heeft één werkwoord
          let q = k + 1;
          while (q < idx.length && toks[idx[q]].n !== ',') q++;
          k = q - 1;
          continue;
        }
      }
      cur.push(i);
    }
    push();

    const cmds = segs.map(s => parseSeg(s.idx, toks, phrases, state, s.flag, s.sep));

    // Samenvoegen: losse namen gaan naar de volgende opdracht, losse dingen naar de vorige.
    const merged = [];
    let carryActors = null;
    for (const c of cmds) {
      if (!c.verb && c.actors && !c.objs.length && !c.statementish) {
        carryActors = (carryActors || []).concat(c.actors);
        continue;
      }
      if (carryActors) { c.actors = uniq(carryActors.concat(c.actors || [])); carryActors = null; }
      if (!c.verb && !c.anach.length && (c.objs.length || c.mods.size || c.dir || c.persons.length) && merged.length && merged[merged.length - 1].verb && c.flag !== 'reason') {
        const p = merged[merged.length - 1];
        // "varen Ura en Sela": de tweede naam hoort bij de eerste
        if (c.actors && toks[c.idx[0]].c === 'actor' && p.actors) p.actors = uniq(p.actors.concat(c.actors));
        p.objs = uniq(p.objs.concat(c.objs));
        p.persons = uniq(p.persons.concat(c.persons));
        c.mods.forEach(m => p.mods.add(m));
        if (c.dir) p.dir = c.dir;
        p.idx = p.idx.concat(c.idx);
        continue;
      }
      merged.push(c);
    }
    // "Keb houdt de wacht en daarna Ura": een losse naam achteraan hoort bij de vorige opdracht
    if (carryActors && merged.length && merged[merged.length - 1].verb) {
      const p = merged[merged.length - 1];
      p.actors = uniq((p.actors || []).concat(carryActors));
      if (p.verb === 'bewaak') p.mods.add('rotate');
    }
    // Wie in de vorige deelzin werd genoemd, doet ook de volgende (binnen één zin).
    let last = null;
    for (const c of merged) {
      if (c.verb && !c.actors && !c.you && last) c.actors = last.slice();
      if (c.actors) last = c.actors;
      c.statement = !c.verb;
      c.raw = c.idx.filter(i => toks[i].type === 'w').map(i => toks[i].raw).join(' ');
    }
    return merged;
  }

  function uniq(a) { return Array.from(new Set(a)); }

  function isFinite(w) {
    return (/t$/.test(w) && VERB[w.slice(0, -1)] !== undefined) || (/en$/.test(w) && VERB[w] !== undefined && !(w in AMBIG));
  }

  function parseSeg(idx, toks, phrases, state, flag, sep) {
    const n = idx.map(i => toks[i].n);
    const used = n.map(() => false);
    const c = {
      idx, flag, verb: null, verbAt: -1, move: false, actors: null, persons: [], objs: [], mods: new Set(), dir: null,
      neg: false, vague: [], anach: [], you: false, alt: flag === 'alt', reason: flag === 'reason', purpose: flag === 'purpose',
    };
    const mark = (j, cls) => { used[j] = true; toks[idx[j]].c = cls; };

    // 1. Vaste uitdrukkingen voor manier en richting
    for (const [ph, m] of MOD_PHRASES) {
      const p = fold(ph).split(' ');
      let at = findSeq(n, used, p);
      while (at >= 0) {
        for (let k = 0; k < p.length; k++) mark(at + k, 'mod');
        if (m.startsWith('dir:')) c.dir = m.slice(4); else c.mods.add(m);
        at = findSeq(n, used, p, at + p.length);
      }
    }
    // "om ... heen"
    const om = n.indexOf('om'), heen = n.indexOf('heen');
    if (om >= 0 && heen > om && !used[om] && !used[heen]) {
      const between = n.slice(om + 1, heen);
      if (between.length === 2 && between[0] === 'je' && between[1] === 'heen') { /* kijk om je heen */ }
      mark(om, 'mod'); mark(heen, 'mod');
      if (between.join(' ') === 'je' || between.join(' ') === 'zich' || between.join(' ') === 'hen') c.lookAround = true;
      else c.mods.add('around');
    }

    // 2. Dingen en plekken (langste eerst)
    for (const { id, ph } of phrases) {
      let at = findSeq(n, used, ph);
      while (at >= 0) {
        for (let k = 0; k < ph.length; k++) mark(at + k, 'obj');
        if (!c.objs.includes(id)) c.objs.push(id);
        at = findSeq(n, used, ph, at + ph.length);
      }
    }

    // 3. Losse woorden
    const verbs = [];
    const actorsBefore = [];
    const names = [];
    let exclude = false;
    const negAt = [];
    const prons = [];
    n.forEach((w, j) => {
      if (used[j]) return;
      if (ANACH.has(w)) { mark(j, 'anach'); c.anach.push(toks[idx[j]].raw); return; }
      if (w === 'behalve' || w === 'zonder') { mark(j, 'link'); exclude = true; return; }
      if (ACTOR_WORD[w]) { mark(j, 'actor'); names.push({ id: ACTOR_WORD[w], j, ex: exclude }); return; }
      if (GROUP_WORD[w] && !(w === 'jullie' && j > 0 && !VERB[n[j + 1]] && names.length)) { mark(j, 'actor'); names.push({ group: GROUP_WORD[w], j }); return; }
      if (w === 'droog' && !(['de', 'het', 'een', 'onze', 'jullie', 'je', 'zijn', 'haar'].includes(n[j + 1]))) { mark(j, 'mod'); c.mods.add('dry'); return; }
      if (VERB[w] || /^ste(e)?k(t|en)?$/.test(w) || /^hou(d|dt|den)?$/.test(w) || w === 'vasthouden' || /^val(t|len)?$/.test(w)) { verbs.push({ w, j }); toks[idx[j]].c = 'verb'; used[j] = true; return; }
      if (DIR[w]) { mark(j, 'mod'); c.dir = DIR[w]; return; }
      if (MOD[w]) { mark(j, ['seq'].includes(MOD[w]) ? 'link' : 'mod'); c.mods.add(MOD[w]); return; }
      if (NEG.has(w)) { mark(j, 'neg'); negAt.push(j); return; }
      if (VAGUE.has(w)) { mark(j, 'vague'); c.vague.push(toks[idx[j]].raw); return; }
      if (PRON.has(w)) { prons.push(j); return; }
      if (w === 'eerst') { mark(j, 'link'); return; }
      if (FN.has(w)) { mark(j, 'fn'); return; }
    });

    // Werkwoord kiezen
    const has = (w) => n.includes(w);
    let chosen = null;
    const real = verbs.filter(v => !(v.w in AMBIG));
    const pool = real.length ? real : verbs;
    verbs.forEach(v => {
      if (real.length && v.w in AMBIG) {
        const to = AMBIG[v.w];
        if (to.startsWith('obj:')) { toks[idx[v.j]].c = 'obj'; if (!c.objs.includes(to.slice(4))) c.objs.push(to.slice(4)); }
        else if (to.startsWith('mod:')) { toks[idx[v.j]].c = 'mod'; c.mods.add(to.slice(4)); }
        else toks[idx[v.j]].c = 'fn';
      }
    });
    const lemmaOf = (w) => {
      if (/^ste(e)?k(t|en)?$/.test(w)) return has('over') ? 'oversteek' : has('aan') ? 'aansteek' : 'jaag';
      if (/^hou(d|dt|den)?$/.test(w) || w === 'vasthouden') {
        if (has('wacht')) return 'bewaak';
        if (has('vast') || w === 'vasthouden') return 'help';
        if (has('brandend') || (has('aan') && c.objs.includes('vuur'))) return 'stook';
        if (c.mods.has('high')) return 'draag';
        return 'wacht';
      }
      if (/^val(t|len)?$/.test(w)) return has('aan') ? 'jaag' : null;
      if (VERB[w] === 'sla') return c.objs.some(o => ['vonk', 'vuursteen', 'pyriet'].includes(o)) ? 'maak' : 'jaag';
      return VERB[w];
    };
    const lemmas = pool.map(v => ({ v, l: lemmaOf(v.w) })).filter(x => x.l);
    const goForms = new Set(['ga', 'gaat', 'gaan']);
    let main = lemmas.find(x => !(x.l === 'loop' && goForms.has(x.v.w)));
    if (main && lemmas.some(x => x.l === 'loop' && goForms.has(x.v.w))) c.move = true;
    if (!main) main = lemmas[0];
    if (main) {
      chosen = main.l;
      c.verbAt = main.v.j;
      // overige werkwoorden in dezelfde deelzin worden als hulpwerkwoord getoond
      verbs.forEach(v => { if (v !== main.v && toks[idx[v.j]].c === 'verb' && !(real.length && v.w in AMBIG)) toks[idx[v.j]].c = 'verb2'; });
    } else {
      verbs.forEach(v => { toks[idx[v.j]].c = 'fn'; });
    }
    if (chosen === 'wacht' && has('wacht') && verbs.some(v => /^hou/.test(v.w))) chosen = 'bewaak';
    if ((chosen === 'loop' || chosen === 'ren') && c.mods.has('away')) chosen = 'vlucht';
    if (chosen === 'plaats' && n.some(w => /^stop/.test(w)) && !has('in')) chosen = 'wacht';
    if (chosen === 'pak' && has('mee')) c.mods.add('carry');
    if (chosen === 'maak' && has('op') && n.some(w => /^zet/.test(w))) chosen = 'maak';
    if (chosen === 'maak' && c.objs.includes('vonk')) c.light = true;
    if ((chosen === 'maak' || !chosen) && c.objs.includes('lawaai') && !c.neg && !negAt.length) chosen = 'lawaai';
    if (chosen === 'aansteek') { chosen = 'maak'; c.light = true; if (!c.objs.length) c.objs.push('vuur'); }
    if (chosen === 'uitgaan') { chosen = c.neg || negAt.length ? 'stook' : 'blus'; negAt.length = 0; }
    if (c.lookAround && !chosen) chosen = 'kijk';
    if (!chosen && c.mods.has('stealth') && !c.objs.length && n.some(w => w === 'wees' || w === 'doe' || w === 'geen' || w === 'zonder')) chosen = 'stil';
    if (chosen === 'kijk' && c.lookAround) c.objs = c.objs.filter(o => o !== 'omgeving');
    c.verb = chosen;
    if (has('zwem') || has('zwemmen') || has('zwemt')) c.swim = true;
    if (c.verb === 'oversteek' && (has('vaar') || has('varen') || has('vaart') || n.some(w => /^peddel|^roei/.test(w)))) c.paddle = true;
    if (has('klim') || has('klimmen') || has('klimt')) c.mods.add('high');

    // Ontkenning: "niet te snel" verandert de manier, niet de handeling.
    for (const j of negAt) {
      let q = j + 1;
      while (q < n.length && (n[q] === 'te' || n[q] === 'zo' || n[q] === 'al')) q++;
      if (MOD[n[q]] === 'fast') { c.mods.delete('fast'); c.mods.add('careful'); continue; }
      if (n[j] === 'geen' && MOD[n[q]] === 'stealth') continue;
      c.neg = true;
    }

    // Wie? Namen voor het werkwoord zijn de doeners, namen erna zijn het onderwerp van de handeling.
    const auxAt = n.findIndex(w => ['moet', 'moeten', 'mag', 'mogen', 'kan', 'kunnen', 'laat', 'laten'].includes(w));
    let actors = [];
    const excluded = [];
    const inverted = c.verbAt >= 0 && sep !== 'en' && sep !== ',' && isFinite(n[c.verbAt]) && n.slice(0, c.verbAt).every(w => ['daarna', 'dan', 'eerst', 'nu', 'vervolgens', 'erna', 'toen', 'daar', 'hier', 'meteen'].includes(w));
    for (const nm of names) {
      if (nm.group) { actors = actors.concat(nm.group); continue; }
      if (nm.ex) { excluded.push(nm.id); continue; }
      if (inverted && (nm.j === c.verbAt + 1 || (nm.j === c.verbAt + 3 && n[c.verbAt + 2] === 'en' && names.some(m => m.j === c.verbAt + 1)))) { actors.push(nm.id); continue; }
      const before = c.verbAt < 0 || nm.j < c.verbAt;
      const afterAux = auxAt >= 0 && nm.j > auxAt && c.verbAt > auxAt && !(['laat', 'laten'].includes(n[auxAt]) && nm.j === auxAt + 1);
      const imperativeObj = c.verbAt === 0 || (c.verbAt >= 0 && nm.j > c.verbAt);
      if (before && !afterAux) actors.push(nm.id);
      else if (imperativeObj || afterAux) {
        // "Pak jij de speer, Ura": naam aan het eind na een komma-loze opdracht telt als aanspreken
        if (nm.j === n.length - 1 && !c.objs.length && !['help', 'pak', 'draag', 'geef', 'volg', 'verzorg'].includes(c.verb)) actors.push(nm.id);
        else c.persons.push(nm.id);
      } else actors.push(nm.id);
    }
    if (excluded.length && !actors.length) actors = PARTY.slice();
    actors = uniq(actors).filter(a => !excluded.includes(a));
    c.actors = actors.length ? actors : null;
    if (!c.actors && (n[0] === 'je' || n[0] === 'jij' || ((n[1] === 'je' || n[1] === 'jij') && (VERB[n[0]] || ['moet', 'kan', 'mag', 'wil'].includes(n[0]))))) {
      c.you = true;
      const j = n[0] === 'je' || n[0] === 'jij' ? 0 : 1;
      toks[idx[j]].c = 'vague';
    }

    // Verwijswoorden: "pak de tak en gooi hem" verwijst naar de tak.
    for (const j of prons) {
      const w = n[j];
      const next = n[j + 1];
      const nextIsThing = next && (toks[idx[j + 1]].c === 'obj' || toks[idx[j + 1]].c === 'mod');
      if ((w === 'het' || w === 'de' || w === 'die' || w === 'dat' || w === 'deze' || w === 'dit') && nextIsThing) { mark(j, 'fn'); continue; }
      if (c.verb && state.lastObj && j === c.verbAt + 1 && ['hem', 'het', 'ze', 'die', 'dat'].includes(w) && !c.objs.includes(state.lastObj)) {
        mark(j, 'obj'); c.objs.unshift(state.lastObj); c.resolved = true; continue;
      }
      if (c.verb && NEEDS_OBJ.has(c.verb) && !c.objs.length && !c.persons.length) {
        if (state.lastObj) { mark(j, 'obj'); c.objs.push(state.lastObj); c.resolved = true; }
        else { mark(j, 'vague'); c.vague.push(toks[idx[j]].raw); }
      } else mark(j, 'fn');
    }
    // Het eerste ding in een deelzin is meestal waar het om gaat: "een fuik van wilgentenen"
    if (c.objs.length) state.lastObj = c.objs[0];
    c.statementish = !c.verb && !c.actors;
    return c;
  }

  /* ------------------------------------------------------------------ */
  /* Vertelhulp                                                           */
  /* ------------------------------------------------------------------ */

  function who(ids) {
    if (!ids || !ids.length) return 'Niemand';
    if (ids.length === 4) return 'De hele groep';
    const n = ids.map(i => PEOPLE[i].name);
    return n.length === 1 ? n[0] : n.slice(0, -1).join(', ') + ' en ' + n[n.length - 1];
  }
  const vb = (ids, sg, pl) => (ids.length === 1 || ids.length === 4 ? sg : pl);
  const sv = (ids, sg, pl, rest) => who(ids) + ' ' + vb(ids, sg, pl) + (rest ? ' ' + rest : '');
  const them = (ids) => (ids.length === 1 ? (ids[0] === 'ura' || ids[0] === 'sela' ? 'ze' : 'hij') : 'ze');
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /* ------------------------------------------------------------------ */
  /* Spelstaat                                                            */
  /* ------------------------------------------------------------------ */

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function newGame() {
    const G = {
      v: 1, t: 0, food: 6, water: 2, fire: false, torch: -1, tinderWet: true,
      hp: { ura: 3, keb: 3, sela: 3, tiko: 3 }, sick: [], tired: false,
      sceneIdx: 0, sceneId: SCENE_ORDER[0], ss: null, over: null, checkpoint: null,
      stats: { turns: 0, anach: {}, vague: {}, statements: 0, rules: 0, rulesFired: 0, questions: 0 },
      log: [],
    };
    enterScene(G, null);
    return G;
  }

  function enterScene(G, x) {
    const sc = SCENES[G.sceneId];
    G.ss = sc.init(G);
    G.ss.rules = [];
    G.ss.turns = 0;
    const cp = clone(Object.assign({}, G, { log: [], checkpoint: null }));
    G.checkpoint = cp;
    if (x) x.out.push({ k: 'scene', id: G.sceneId, title: sc.title, text: sc.intro(G) });
  }

  function day(G) { return Math.floor(G.t / 3) + 1; }
  function part(G) { return PARTS[G.t % 3]; }

  function fx(x, label, kind) { x.fx.push({ label, kind: kind || 'neutral' }); }
  function say(x, text, k) { x.out.push({ k: k || 'act', text }); }

  function food(G, n, x, why) {
    const before = G.food;
    G.food = Math.max(0, G.food + n);
    const d = G.food - before;
    if (d) fx(x, (d > 0 ? '+' : '−') + Math.abs(d) + ' voedsel' + (why ? ' (' + why + ')' : ''), d > 0 ? 'good' : 'bad');
  }
  function hurt(G, id, n, x, why) {
    // Hooguit één punt schade per persoon per beurt: frictie, geen afstraffing.
    if (n < 0) {
      x.hurtTurn = x.hurtTurn || {};
      if (x.hurtTurn[id]) return;
      x.hurtTurn[id] = true;
      n = -1;
    }
    const before = G.hp[id];
    G.hp[id] = Math.max(0, Math.min(MAX_HP, G.hp[id] + n));
    const d = G.hp[id] - before;
    if (d) fx(x, PEOPLE[id].name + ' ' + (d > 0 ? '+' : '−') + Math.abs(d) + (why ? ' · ' + why : ''), d > 0 ? 'good' : 'bad');
  }
  function setFire(G, on, x, why) {
    if (G.fire === on) return;
    G.fire = on;
    fx(x, on ? 'vuur meegenomen' : 'vuur gedoofd' + (why ? ' · ' + why : ''), on ? 'good' : 'bad');
  }

  function advance(G, n, x) {
    for (let k = 0; k < n; k++) {
      G.t++;
      if (G.torch >= 0 && G.t > G.torch) {
        G.torch = -1;
        say(x, 'De brandende tak is opgebrand. Er blijft een zwart stompje over.', 'info');
      }
      if (G.t % 3 === 0) newDay(G, x);
      if (G.over) return;
    }
  }

  function newDay(G, x) {
    if (G.food > 0) {
      food(G, -1, x, 'eten');
    } else {
      say(x, 'Er is niets meer te eten. Iedereen gaat met honger slapen.', 'info');
      PARTY.forEach(id => hurt(G, id, -1, x, 'honger'));
    }
    if (G.sick.length) {
      G.sick.forEach(id => {
        say(x, PEOPLE[id].name + ' heeft de hele nacht buikpijn en moet steeds de struiken in.', 'info');
        hurt(G, id, -1, x, 'buikpijn');
      });
      G.sick = [];
    }
    if (G.tired) {
      say(x, 'Niemand heeft geslapen. Iedereen sleept met zijn voeten.', 'info');
      PARTY.forEach(id => hurt(G, id, -1, x, 'moe'));
      G.tired = false;
    }
    say(x, 'Dag ' + day(G) + ' begint.', 'day');
    checkOver(G, x);
    if (!G.over && day(G) > DEADLINE_DAY) {
      G.over = {
        type: 'lose',
        title: 'Te laat',
        text: 'De ganzen trekken al naar het zuiden. Het seizoen aan de kust is voorbij voordat jullie er zijn. De groep keert om naar het winterkamp.',
      };
    }
  }

  function checkOver(G, x) {
    if (G.over) return;
    const down = PARTY.filter(id => G.hp[id] <= 0);
    if (down.length === PARTY.length) {
      G.over = { type: 'lose', title: 'Terug naar het winterkamp', text: 'Niemand kan nog verder. Gewond en uitgeput strompelt de groep terug naar het winterkamp. De tocht is mislukt, dit keer.' };
      return;
    }
    if (down.length) {
      G.over = {
        type: 'lose',
        title: 'Terug naar het winterkamp',
        text: who(down) + ' ' + vb(down, 'kan', 'kunnen') + ' niet meer verder. De groep laat niemand achter. Ze dragen ' + (down.length === 1 ? them(down) === 'ze' ? 'haar' : 'hem' : 'hen') + ' terug naar het winterkamp. De tocht is mislukt, dit keer.',
      };
    }
  }

  function rule(x, id) {
    const r = x.ss.rules.find(r => r.trigger === id) || (id !== 'gevaar' && x.ss.rules.find(r => r.trigger === 'gevaar'));
    if (r) { x.G.stats.rulesFired++; x.flags.ruleFired = true; }
    return r || null;
  }
  function ruleDoes(r, verbs) { return r && r.cmds.some(c => verbs.includes(c.verb) || (c.mods.has('back') && verbs.includes('terug'))); }

  /* ------------------------------------------------------------------ */
  /* Algemeen gedrag (als een plek zelf niets met de opdracht doet)       */
  /* ------------------------------------------------------------------ */

  function generic(c, x) {
    const G = x.G, a = x.actors, sc = x.scene, o = c.objs[0];
    const senses = sc.senses || {};
    const lookup = (table, key) => (table && table[key] ? (typeof table[key] === 'function' ? table[key](x, c) : table[key]) : null);
    if (c.neg) {
      say(x, sv(a, 'doet', 'doen', 'het dus niet.') + ' ' + sv(a, 'blijft', 'blijven', 'staan waar ' + them(a) + ' ' + vb(a, 'staat', 'staan') + '.'));
      return true;
    }
    switch (c.verb) {
      case 'kijk': case 'zoek': case 'verken': case 'klim': {
        const t = o ? lookup(sc.look, o) : lookup(senses, 'kijk');
        if (t) say(x, cap(t.replace(/\{a\}/g, who(a)).replace(/\{v:([^|]+)\|([^}]+)\}/g, (_, s, p) => vb(a, s, p))));
        else if (o) say(x, sv(a, 'kijkt', 'kijken', 'ernaar. Er is niets bijzonders aan te zien.'));
        else say(x, sv(a, 'kijkt', 'kijken', 'om zich heen.'));
        return true;
      }
      case 'luister': case 'ruik': case 'voel': {
        const table = { luister: sc.listen, ruik: sc.smell, voel: sc.feel }[c.verb];
        let t = o ? lookup(table, o) : null;
        if (!t) t = lookup(senses, c.verb);
        if (!t && o === 'wind') t = lookup(senses, 'voel');
        if (t) say(x, cap(t.replace(/\{a\}/g, who(a)).replace(/\{v:([^|]+)\|([^}]+)\}/g, (_, s, p) => vb(a, s, p))));
        else say(x, sv(a, c.verb === 'luister' ? 'luistert' : c.verb === 'ruik' ? 'snuift' : 'voelt', c.verb === 'luister' ? 'luisteren' : c.verb === 'ruik' ? 'snuiven' : 'voelen', 'Niets bijzonders.'));
        return true;
      }
      case 'wacht': case 'stil':
        say(x, sv(a, 'wacht', 'wachten', c.mods.has('stealth') || c.verb === 'stil' ? 'zonder een geluid te maken.' : '.').replace(' .', '.'));
        return true;
      case 'rust': {
        say(x, sv(a, 'gaat', 'gaan', 'zitten en ' + vb(a, 'rust', 'rusten') + ' uit.'));
        if (!x.ss.rested) {
          x.ss.rested = true;
          a.forEach(id => { if (G.hp[id] < MAX_HP) hurt(G, id, 1, x, 'uitgerust'); });
        }
        return true;
      }
      case 'eet': {
        if (G.food <= 0) { say(x, sv(a, 'kijkt', 'kijken', 'in de mand. Die is leeg.')); return true; }
        say(x, sv(a, 'eet', 'eten', 'van de voorraad.'));
        food(G, -1, x, 'extra maaltijd');
        a.forEach(id => { if (G.hp[id] < MAX_HP) hurt(G, id, 1, x, 'gegeten'); });
        return true;
      }
      case 'drink': {
        if (sc.water) return sc.water(c, x, 'drink');
        if (G.water > 0) { say(x, sv(a, 'drinkt', 'drinken', 'uit de waterzak.')); G.water--; fx(x, '−1 water', 'bad'); }
        else say(x, sv(a, 'pakt', 'pakken', 'de waterzak. Hij is leeg.'));
        return true;
      }
      case 'vul':
        if (sc.water) return sc.water(c, x, 'vul');
        say(x, sv(a, 'zoekt', 'zoeken', 'water. Hier is niets om de zak mee te vullen.'));
        return true;
      case 'pak': case 'draag': {
        if (!o && !c.persons.length) {
          say(x, sv(a, 'steekt', 'steken', 'de handen uit en ' + vb(a, 'kijkt', 'kijken') + ' je aan. Wat moet ' + them(a) + ' pakken?'));
          x.flags.missingObj = true;
          return true;
        }
        if (c.persons.length) {
          say(x, sv(a, 'pakt', 'pakken', who(c.persons) + ' bij de arm.') + ' Verder gebeurt er niets.');
          return true;
        }
        if (['speer', 'boog', 'vuursteen', 'pyriet', 'tondel', 'huid', 'mand', 'waterzak', 'voedsel'].includes(o)) {
          say(x, sv(a, 'heeft', 'hebben', 'de ' + nameOf(o) + ' al bij zich.'));
          return true;
        }
        if (o === 'vuur') {
          say(x, sv(a, 'kijkt', 'kijken', 'naar ' + (a.length === 1 ? 'de eigen' : 'hun') + ' lege handen. Er is hier geen vuur.'));
          return true;
        }
        if (o === 'berkenbast') return gatherBark(c, x);
        if (o === 'hout') { x.ss.wood = true; say(x, sv(a, 'raapt', 'rapen', 'een armvol dode takken op.')); return true; }
        say(x, sv(a, 'zoekt', 'zoeken', 'naar de ' + nameOf(o) + ', maar ' + vb(a, 'vindt', 'vinden') + ' hier niets.'));
        return true;
      }
      case 'jaag':
        say(x, sv(a, 'houdt', 'houden', 'de wapens klaar en ' + vb(a, 'kijkt', 'kijken') + ' om zich heen. Er is hier niets om op te jagen.'));
        return true;
      case 'vis':
        say(x, sv(a, 'zoekt', 'zoeken', 'een plek om te vissen. Er is hier geen water met vis.'));
        return true;
      case 'maak':
        return makeGeneric(c, x);
      case 'droog':
        return dryTinder(c, x);
      case 'plaats':
        if (o === 'kooltjes' || (c.objs.includes('kooltjes') && c.objs.includes('tondel'))) return emberToTinder(c, x);
        say(x, sv(a, 'legt', 'leggen', (o ? 'de ' + nameOf(o) : 'iets') + ' neer en ' + vb(a, 'kijkt', 'kijken') + ' je aan.'));
        return true;
      case 'loop': case 'ren': case 'sluip': case 'volg':
        if (c.mods.has('back')) { say(x, sv(a, 'loopt', 'lopen', 'een stuk terug, de kant op waar jullie vandaan kwamen. Daar is niets.') + ' ' + sv(a, 'komt', 'komen', 'weer terug.')); return true; }
        say(x, sv(a, 'pakt', 'pakken', 'de spullen op, ' + vb(a, 'loopt', 'lopen') + ' een paar stappen en ' + vb(a, 'blijft', 'blijven') + ' dan staan.') + ' Waarheen?');
        x.flags.noDirection = true;
        return true;
      case 'vlucht':
        say(x, sv(a, 'rent', 'rennen', 'weg, terug de kant op waar jullie vandaan kwamen. Na een tijdje ' + vb(a, 'stopt', 'stoppen') + ' ' + them(a) + ', buiten adem. Er was niets.'));
        return true;
      case 'lawaai':
        say(x, sv(a, 'maakt', 'maken', 'lawaai. Een paar vogels vliegen op.'));
        return true;
      case 'verstop':
        say(x, sv(a, 'duikt', 'duiken', 'weg in het hoge gras en ' + vb(a, 'wacht', 'wachten') + '.'));
        return true;
      case 'help':
        if (c.persons.length) say(x, sv(a, 'gaat', 'gaan', 'naast ' + who(c.persons) + ' staan. Waarmee helpen?'));
        else say(x, sv(a, 'kijkt', 'kijken', 'rond. Wie moet geholpen worden?'));
        return true;
      case 'bewaak':
        say(x, sv(a, 'houdt', 'houden', 'de wacht. Er gebeurt niets.'));
        return true;
      case 'oversteek':
        say(x, sv(a, 'kijkt', 'kijken', 'om zich heen. Hier is niets om over te steken.'));
        return true;
      case 'kook':
        if (!x.ss.campfire) { say(x, sv(a, 'zoekt', 'zoeken', 'een vuur om op te koken. Er is er geen.')); return true; }
        if (G.food <= 0) { say(x, 'Er is niets om te koken.'); return true; }
        say(x, sv(a, 'roostert', 'roosteren', 'vlees boven het vuur. Het ruikt goed.'));
        a.forEach(id => { if (G.hp[id] < MAX_HP) hurt(G, id, 1, x, 'warm eten'); });
        food(G, -1, x, 'gekookt');
        return true;
      case 'verzamel':
        if (o === 'hout') { x.ss.wood = true; say(x, sv(a, 'sprokkelt', 'sprokkelen', 'een armvol takken.')); return true; }
        if (o === 'berkenbast') return gatherBark(c, x);
        say(x, sv(a, 'zoekt', 'zoeken', 'naar ' + (o ? 'de ' + nameOf(o) : 'iets') + ', maar ' + vb(a, 'vindt', 'vinden') + ' hier niets.'));
        return true;
      case 'stook':
        if (x.ss.campfire) { x.ss.keepFire = true; say(x, sv(a, 'legt', 'leggen', 'hout op het vuur.')); }
        else say(x, sv(a, 'blaast', 'blazen', 'in de lucht. Er is hier geen vuur om op te stoken.'));
        return true;
      case 'blus':
        if (x.ss.campfire) { x.ss.campfire = false; say(x, sv(a, 'dooft', 'doven', 'het vuur met zand.')); }
        else say(x, 'Er is niets om te blussen.');
        return true;
      case 'verzorg': {
        const t = c.persons.length ? c.persons : a;
        const hurtOnes = t.filter(id => G.hp[id] < MAX_HP);
        if (!hurtOnes.length) { say(x, sv(a, 'kijkt', 'kijken', 'iedereen na. Niemand is gewond.')); return true; }
        if (x.ss.cared) { say(x, sv(a, 'doet', 'doen', 'wat ' + them(a) + ' ' + vb(a, 'kan', 'kunnen') + '. Meer helpt nu niet.')); return true; }
        x.ss.cared = true;
        say(x, sv(a, 'verzorgt', 'verzorgen', who(hurtOnes) + ' met koel water en mos.'));
        hurtOnes.forEach(id => hurt(G, id, 1, x, 'verzorgd'));
        return true;
      }
      case 'geef':
        say(x, sv(a, 'geeft', 'geven', (o ? 'de ' + nameOf(o) : 'iets') + ' door. Daarna ' + vb(a, 'wacht', 'wachten') + ' ' + them(a) + '.'));
        return true;
      case 'duw':
        say(x, sv(a, 'duwt', 'duwen', 'ergens tegen. Er beweegt niets.'));
        return true;
    }
    return false;
  }

  const NAMES = {
    speer: 'speer', boog: 'boog', vuursteen: 'vuursteen', pyriet: 'pyriet', tondel: 'tondelzwam', berkenbast: 'berkenbast',
    huid: 'huiden', mand: 'mand', waterzak: 'waterzak', voedsel: 'voorraad', hout: 'takken', stok: 'stok', fakkel: 'brandende tak',
    kooltjes: 'kooltjes', vuur: 'vuur', water: 'water', wind: 'wind', vis: 'vis',
  };
  function nameOf(id) { return NAMES[id] || (SCENE_NAMES[id]) || id; }
  const SCENE_NAMES = {};

  /* ---- Vuur: aanhoudende kooltjes, vonken, tondel ---------------------- */

  function heatSource(x) {
    return x.ss.atFire || x.ss.campfire || x.G.torch >= 0;
  }

  function dryTinder(c, x) {
    const G = x.G, a = x.actors;
    if (!c.objs.includes('tondel') && !c.objs.includes('berkenbast')) {
      say(x, sv(a, 'kijkt', 'kijken', 'je aan. Wat moet er gedroogd worden?'));
      x.flags.missingObj = true;
      return true;
    }
    if (!G.tinderWet) { say(x, 'De tondelzwam is al droog.'); return true; }
    if (heatSource(x)) {
      G.tinderWet = false;
      say(x, sv(a, 'houdt', 'houden', 'de tondelzwam bij de hitte. Hij wordt bruin en droog en begint zacht te smeulen.'));
      fx(x, 'tondel droog', 'good');
      return true;
    }
    if (x.scene.sun) {
      G.tinderWet = false;
      say(x, sv(a, 'legt', 'leggen', 'de tondelzwam op een warme steen in de zon. Na lange tijd is hij droog.'));
      fx(x, 'tondel droog', 'good');
      x.extraTime = (x.extraTime || 0) + 1;
      return true;
    }
    say(x, sv(a, 'wrijft', 'wrijven', 'de tondelzwam tegen ' + (a.length === 1 ? 'de eigen' : 'hun') + ' huid. Hij blijft vochtig. Zonder zon of vuur droogt hij niet.'));
    return true;
  }

  function emberToTinder(c, x) {
    const G = x.G, a = x.actors;
    if (G.fire) { say(x, 'In de tondelzwam gloeien de kooltjes al.'); return true; }
    if (!heatSource(x)) { say(x, sv(a, 'zoekt', 'zoeken', 'gloeiende kooltjes. Hier gloeit niets.')); return true; }
    if (G.tinderWet) {
      say(x, sv(a, 'legt', 'leggen', 'gloeiende kooltjes in de tondelzwam. Ze sissen en worden zwart. De zwam is te nat.'));
      return true;
    }
    say(x, sv(a, 'legt', 'leggen', 'gloeiende kooltjes in de droge tondelzwam en ' + vb(a, 'blaast', 'blazen') + ' zacht. De zwam gaat smeulen. Zo kan het vuur mee.'));
    setFire(G, true, x);
    return true;
  }

  function gatherBark(c, x) {
    const a = x.actors;
    if (!x.scene.birch) { say(x, sv(a, 'zoekt', 'zoeken', 'berken. Hier staan er geen.')); return true; }
    x.ss.bark = true;
    say(x, sv(a, 'trekt', 'trekken', 'repen witte bast van een berk. De bast is vettig en ruikt naar teer.'));
    return true;
  }

  function makeGeneric(c, x) {
    const a = x.actors;
    if (c.objs.includes('vuur') || c.light || c.objs.includes('kooltjes')) return makeFire(c, x);
    if (x.scene.make) { const r = x.scene.make(c, x); if (r) return r; }
    const o = c.objs[0];
    if (!o) { say(x, sv(a, 'kijkt', 'kijken', 'je aan. Wat moet er gemaakt worden?')); x.flags.missingObj = true; return true; }
    say(x, sv(a, 'begint', 'beginnen', 'aan de ' + nameOf(o) + ', maar ' + vb(a, 'weet', 'weten') + ' niet waar ' + them(a) + ' moet' + (a.length === 1 ? '' : 'en') + ' beginnen.'));
    return true;
  }

  function makeFire(c, x) {
    const G = x.G, ss = x.ss, a = x.actors;
    const wood = ss.wood || c.objs.includes('hout') || c.objs.includes('stok');
    const bark = ss.bark || c.objs.includes('berkenbast');
    if (ss.campfire) { say(x, 'Er brandt al een vuur.'); return true; }
    if (x.scene.noFireHere) { say(x, x.scene.noFireHere); return true; }
    // Met meegedragen kooltjes of een brandende tak
    if (G.fire || G.torch >= 0) {
      const src = G.fire ? 'de smeulende tondelzwam' : 'de brandende tak';
      if (!wood) {
        say(x, sv(a, 'blaast', 'blazen', 'op ' + src + '. Er komt een vlammetje, en dat dooft weer. Er is niets om te branden.'));
        return true;
      }
      ss.campfire = true;
      say(x, sv(a, 'legt', 'leggen', 'takjes op ' + src + ' en ' + vb(a, 'blaast', 'blazen') + '. Het vuur slaat aan.'));
      fx(x, 'kampvuur', 'good');
      return true;
    }
    // Met vonken
    if (!G.tinderWet || bark) {
      if (!wood) {
        say(x, sv(a, 'slaat', 'slaan', 'de vuursteen tegen het pyriet. Vonken vallen op ' + (bark ? 'de berkenbast' : 'de tondel') + '. Er komt een vlammetje, en dan is het op. Er is niets om te branden.'));
        return true;
      }
      ss.campfire = true;
      say(x, sv(a, 'slaat', 'slaan', 'de vuursteen tegen het pyriet. Een vonk valt op ' + (bark ? 'de berkenbast' : 'de droge tondel') + '. Er komt rook, dan een vlammetje. Het hout vat vlam.'));
      fx(x, 'kampvuur', 'good');
      return true;
    }
    say(x, sv(a, 'slaat', 'slaan', 'de vuursteen tegen het pyriet. Vonken spatten op de tondel. Die is nat. Er gebeurt niets.'));
    return true;
  }

  /* ------------------------------------------------------------------ */
  /* De plekken                                                           */
  /* ------------------------------------------------------------------ */

  const SCENE_ORDER = ['rook', 'spoor', 'rivier', 'nacht', 'kust'];

  const SCENES = {};

  /* ---- 1. De rookpluim ------------------------------------------------ */

  SCENES.rook = {
    title: 'De rookpluim',
    place: 'Rookheuvel',
    objects: [
      ['rook', ['rook', 'rookpluim', 'pluim', 'rookwolk', 'rookwolken']],
      ['rots', ['rots', 'rotsen', 'grote steen', 'rotsblok', 'uitkijkpunt', 'top']],
      ['heuvel', ['heuvel', 'heuvels', 'heuvelrug', 'heuveltop', 'kam']],
      ['dal', ['dal', 'vallei', 'laagte']],
      ['riet', ['riet', 'rietveld']],
      ['brand', ['brand', 'bosbrand', 'rietbrand', 'hitte']],
      ['zwart', ['zwarte grond', 'verbrande grond', 'verbrand gebied', 'zwart gebied', 'afgebrande grond', 'as']],
      ['moeras', ['moeras', 'veen']],
      ['winterkamp', ['winterkamp', 'kamp']],
    ],
    triggers: [
      { id: 'vuur', words: ['vuur', 'vlammen', 'vlam', 'hitte', 'heet', 'warm', 'brand', 'rook', 'dichtbij', 'dichterbij', 'brandt'] },
      { id: 'tiko', words: ['tiko', 'kind'] },
    ],
    init: () => ({ known: false, fireNear: 0, forbid: false, drift: 0, curious: false, atFire: false, passed: false }),
    intro: (G) =>
      'Jullie staan op de heuvelrug boven het winterkamp. Achter de volgende heuvel, in het westen, stijgt een dikke grijze rookpluim op. Hij drijft langzaam jullie kant op.\n' +
      'Vannacht heeft het geregend. Het vuur in de draagschelp is uitgegaan en de tondelzwam is nat.\n' +
      'De kust ligt in het westen. Precies daar is de rook.',
    senses: {
      kijk: (x) => '{a} {v:tuurt|turen} naar de rook. Van hier zie je alleen de grijze pluim boven de heuvel. Wat eronder is, zie je niet. Rechts van het pad steekt een grote rots boven het gras uit.',
      luister: () => 'Uit de verte komt een zacht geknetter. Geen stemmen. Een zwerm vogels vliegt laag weg van de rook.',
      ruik: () => 'Het ruikt naar verbrand riet en nat gras. Geen geur van vlees of vet.',
      voel: () => '{a} {v:houdt|houden} een natte vinger omhoog. De wind komt uit het westen, van de rook naar jullie toe.',
    },
    look: {
      rook: (x) => x.ss.known ? 'De rook komt van het brandende riet in het dal.' : '{a} {v:kijkt|kijken} naar de pluim. Hij is grijs en breed, niet zwart. Hij wordt steeds breder.',
      rots: () => 'Een grote, grijze rots. Wie erop staat, kan ver kijken.',
      heuvel: () => 'Een lage heuvel met gras en hier en daar een rots.',
      winterkamp: () => 'Beneden ligt het winterkamp, verlaten. Jullie gaan niet terug.',
      dal: (x) => x.ss.passed ? 'Het dal is zwart. Hier en daar gloeit het nog.' : x.ss.known ? 'In het dal brandt het riet. De vlammen kruipen met de wind mee jullie kant op.' : '{a} {v:kijkt|kijken} naar de heuvel. Het dal erachter is van hier niet te zien.',
      riet: (x) => x.ss.known ? 'Het riet in het dal brandt.' : 'Van hier zie je geen riet. Alleen de rook.',
      brand: (x) => x.ss.known ? 'Een strook brandend riet, breder dan het winterkamp.' : '{a} {v:ziet|zien} alleen rook. Wat er brandt, is van hier niet te zien.',
      zwart: (x) => x.ss.passed ? 'Zwarte, warme grond. Hier en daar gloeit het nog.' : x.ss.known ? 'Achter de vlammen ligt zwarte grond. Om daar te komen, moet je langs het vuur.' : 'Van hier is dat niet te zien.',
    },
    handle(c, x) {
      const G = x.G, ss = x.ss, a = x.actors;
      const o = c.objs;
      const fireObj = o.includes('vuur') || o.includes('brand') || o.includes('rook') || o.includes('dal') || o.includes('riet');
      const careful = c.mods.has('careful') || c.mods.has('stealth') || c.mods.has('side') || c.mods.has('behind') || c.verb === 'sluip';

      // Wie Tiko noemt, haalt hem terug.
      if (ss.drift > 0 && (c.persons.includes('tiko') || (c.actors && c.actors.length === 1 && c.actors[0] === 'tiko' && (c.mods.has('back') || c.verb === 'wacht')))) {
        if (['pak', 'draag', 'loop', 'help', 'volg', 'lawaai'].includes(c.verb) || c.mods.has('back') || c.verb === 'wacht') {
          ss.drift = 0; ss.curious = false;
          if (c.verb === 'lawaai') say(x, sv(a, 'roept', 'roepen', 'Tiko. Hij draait zich om en klimt terug de heuvel op.'));
          else if (c.actors && c.actors[0] === 'tiko') say(x, 'Tiko blijft staan en komt terug naar de groep.');
          else say(x, sv(a, 'rent', 'rennen', 'de heuvel af, pakt Tiko bij zijn arm en ' + vb(a, 'neemt', 'nemen') + ' hem mee terug.'));
          return true;
        }
      }

      if (c.neg && (c.verb === 'loop' || c.verb === 'ren' || c.verb === 'volg' || c.verb === 'sluip') && fireObj) {
        ss.forbid = true;
        say(x, sv(a, 'blijft', 'blijven', 'staan.') + ' Niemand loopt richting de rook.');
        return true;
      }
      if (c.neg) return false;

      // Hoog kijken
      if (['klim', 'kijk', 'verken', 'loop'].includes(c.verb) && (o.includes('rots') || (o.includes('heuvel') && c.mods.has('high')) || c.verb === 'klim' && !fireObj)) {
        if (a.includes('sela') && a.length > 1) say(x, 'Sela blijft onder aan de rots staan. Klimmen gaat haar te langzaam.');
        const up = a.filter(id => id !== 'sela' || a.length === 1);
        ss.known = true;
        say(x, sv(up, 'klimt', 'klimmen', 'op de rots.') + ' Nu zie je het dal achter de heuvel. Een brede strook riet staat in brand. De vlammen kruipen langzaam deze kant op, met de wind mee. Achter de vlammen ligt zwarte, rokende grond. Naar het noorden loopt de heuvelrug verder. Daar brandt niets.');
        return true;
      }

      // Naar het vuur toe (verkennen, of lopen)
      const routing = c.dir || c.mods.has('around') || c.mods.has('onward') || o.includes('zwart') || o.includes('moeras') || o.includes('winterkamp');
      const towardFire = !routing && ((['loop', 'ren', 'sluip', 'verken', 'volg'].includes(c.verb) && fireObj) || (c.verb === 'kijk' && c.move && fireObj));
      if (towardFire) {
        approachFire(c, x, a, careful);
        return true;
      }

      // Vuur pakken
      if (c.verb === 'pak' || c.verb === 'draag') {
        if (o.includes('fakkel') || o.includes('kooltjes') || (o.includes('stok') && fireObj)) {
          if (!ss.atFire && !ss.passed) { if (!approachFire(c, x, a, careful, true)) return true; }
          const g = a.length === 4 ? ['ura'] : a.slice(0, 1);
          if (o.includes('kooltjes')) {
            ss.atFire = true;
            emberToTinder(c, Object.assign({}, x, { actors: g }));
            return true;
          }
          G.torch = G.t + 2;
          say(x, (a.length === 4 ? 'Ura is het snelst. ' : '') + sv(g, 'pakt', 'pakken', 'een smeulende tak bij het koude eind en ' + vb(g, 'neemt', 'nemen') + ' hem mee. Hij brandt nog.'));
          fx(x, 'brandende tak', 'good');
          ss.atFire = true;
          return true;
        }
        if (o.includes('vuur') || o.includes('brand') || (o.includes('rook'))) {
          if (!ss.atFire && !ss.passed) { if (!approachFire(c, x, a, careful, true)) return true; }
          say(x, sv(a, 'grijpt', 'grijpen', 'met blote handen in de vlammen en ' + vb(a, 'trekt', 'trekken') + ' ze meteen terug. Vuur kun je niet vastpakken.'));
          a.forEach(id => hurt(G, id, -1, x, 'brandwonden'));
          x.flags.bad = true;
          return true;
        }
      }
      if (c.verb === 'droog' || (c.verb === 'plaats' && o.includes('kooltjes')) || (c.verb === 'maak' && o.includes('tondel'))) {
        if (!ss.atFire && !ss.passed && G.torch < 0) {
          say(x, sv(a, 'kijkt', 'kijken', 'naar de natte zwam. Hier is geen vuur of zon om hem aan te drogen.'));
          return true;
        }
        if (c.verb === 'droog') return dryTinder(c, x);
        return emberToTinder(c, x);
      }

      // Verder trekken
      if (['loop', 'ren', 'volg', 'sluip'].includes(c.verb) && (c.dir || c.mods.has('around') || c.mods.has('onward') || o.includes('zwart') || o.includes('heuvel') || o.includes('moeras') || o.includes('winterkamp'))) {
        const all = a.length === 4;
        if (!all) {
          say(x, sv(a, 'loopt', 'lopen', 'een stuk vooruit.') + ' De anderen blijven staan. ' + sv(a, 'komt', 'komen', 'weer terug.'));
          x.flags.actorMatters = true;
          return true;
        }
        if (c.dir === 'oost' || o.includes('winterkamp') || c.mods.has('back')) {
          say(x, 'De groep loopt terug naar het winterkamp. Daar is niets veranderd. Ze klimmen weer de heuvel op.');
          x.extraTime = (x.extraTime || 0) + 1;
          return true;
        }
        if (c.dir === 'zuid' || o.includes('moeras')) {
          say(x, 'Naar het zuiden wordt de grond nat en zompig. Ze zakken tot hun knieën weg in het veen en keren om.');
          x.extraTime = (x.extraTime || 0) + 1;
          return true;
        }
        if (c.dir === 'noord' || c.mods.has('around') || (c.dir === 'rechts')) {
          say(x, 'De groep loopt over de heuvelrug naar het noorden, met een grote boog om de brand heen. Aan de andere kant dalen ze af naar het westen.');
          exit(x, c, 1);
          return true;
        }
        // west, rechtdoor, verder, links
        if (ss.passed) {
          say(x, 'De groep loopt over de zwarte, warme grond naar het westen. Hier en daar smeult nog wat. Hun voeten worden grijs van de as.');
          exit(x, c, 0);
          return true;
        }
        if (c.dir === 'links') { say(x, 'Links? De groep kijkt naar het pad en weer naar jou. Links van wat?'); x.flags.vagueDir = true; return true; }
        approachFire(c, x, a, careful, false, true);
        return true;
      }
      return false;
    },
    onAnach(c, x, word) {
      const ss = x.ss;
      if (!ss.curious) {
        ss.curious = true;
        say(x, 'Bij het woord ‘' + word + '’ kijkt Tiko op. Wat is dat? Hij wil het zien.');
        return true;
      }
      return false;
    },
    afterTurn(x) {
      const G = x.G, ss = x.ss;
      // Tiko gaat zijn eigen gang als niemand iets zegt, of als hij nieuwsgierig is gemaakt.
      if (!ss.passed && (ss.drift > 0 || x.flags.executed === 0 || ss.curious)) {
        if (ss.curious && ss.drift === 0 && ss.forbid && x.flags.executed > 0) {
          say(x, 'Terwijl de anderen stil staan, glipt Tiko weg, de heuvel af, naar de rook.', 'act');
          ss.drift = 1;
        } else if (ss.drift === 0 && !ss.forbid) {
          say(x, 'Niemand weet wat jij wil. Tiko loopt alvast een stukje de heuvel af, naar de rook. Daar is het warm.', 'act');
          ss.drift = 1;
        } else if (ss.drift === 0 && ss.curious) {
          say(x, 'Tiko loopt de heuvel af, naar de rook. Hij wil weten wat het is.', 'act');
          ss.drift = 1;
        } else if (ss.drift === 1) {
          say(x, 'Tiko is al halverwege de heuvel. Hij kijkt nog één keer om.', 'act');
          ss.drift = 2;
        } else if (ss.drift === 2) {
          say(x, 'Tiko staat aan de rand van het brandende riet. De hitte slaat in zijn gezicht. Ura rent naar beneden en sleept hem terug.', 'act');
          hurt(G, 'tiko', -1, x, 'verschroeid');
          ss.drift = 0; ss.curious = false; ss.known = true;
        }
      }
      if (ss.atFire && !x.flags.exited) say(x, ss.atFireCalm ? 'Daarna komen ze terug bij de groep.' : 'Hoestend klimmen ze terug de heuvel op.', 'act');
      ss.atFire = false; ss.atFireCalm = false;
      // Het vuur komt dichterbij.
      ss.fireNear++;
      if (!ss.passed) {
        if (ss.fireNear === 2) say(x, 'De rook wordt dikker. Je hoort het riet knetteren.', 'info');
        if (ss.fireNear === 3) say(x, 'Het wordt warm in je gezicht. De vlammen moeten vlak achter de heuvel zijn.', 'info');
        if (ss.fireNear >= 4) {
          const r = rule(x, 'vuur');
          if (r) say(x, 'Het vuur bereikt de voet van de heuvel. Zoals je hebt afgesproken, rent iedereen meteen de kale rots op. De vlammen trekken langs en doven tegen de stenen.', 'act');
          else {
            say(x, 'Het vuur bereikt de voet van de heuvel. Iedereen rent de kale rots op. De vlammen trekken langs en doven tegen de stenen.' + (ss.lostBasket ? '' : ' In de haast is Sela de mand met noten kwijtgeraakt.'), 'act');
            if (!ss.lostBasket) { ss.lostBasket = true; food(G, -1, x, 'mand kwijt'); }
          }
          if (ss.drift > 0) { say(x, 'Ura sleurt Tiko mee naar boven.', 'act'); ss.drift = 0; ss.curious = false; }
          ss.passed = true; ss.known = true;
          say(x, 'Waar het riet was, ligt nu zwarte grond. Hier en daar gloeit het nog.', 'info');
        }
      }
    },
    exitText: 'Jullie dalen af naar het westen. Het land wordt lager en natter: berken, elzen, overal kleine beekjes.',
  };

  function approachFire(c, x, a, careful, forGrab, asExit) {
    const G = x.G, ss = x.ss;
    const r = rule(x, 'vuur');
    const going = a;
    if (ss.passed) {
      if (!ss.atFire) say(x, sv(going, 'loopt', 'lopen', 'de heuvel af naar de zwarte grond. Hier en daar smeult nog wat.'));
      ss.atFire = true; ss.atFireCalm = true;
      return true;
    }
    if (r && !careful) {
      say(x, sv(going, 'loopt', 'lopen', 'de heuvel af, naar de rook.') + ' Zodra de hitte voelbaar wordt, ' + vb(going, 'keert', 'keren') + ' ' + them(going) + ' om, zoals je had afgesproken.' + (r.fuzzy ? ' Pas toen het al heet was, wist ' + who(going.slice(0, 1)) + ' wat jij ‘gevaarlijk’ noemde.' : ''));
      ss.known = true;
      say(x, 'Van dichtbij zag ' + who(going.slice(0, 1)) + ' het: een strook brandend riet, die met de wind mee jullie kant op kruipt.');
      if (r.fuzzy) going.forEach(id => hurt(G, id, -1, x, 'hitte'));
      return false;
    }
    if (careful && going.length <= 2) {
      ss.known = true; ss.atFire = true; ss.atFireCalm = true;
      say(x, sv(going, 'loopt', 'lopen', 'voorzichtig de heuvel af, met een boog naar de zijkant.') + ' Van dichtbij zie je het: een strook brandend riet. De vlammen kruipen met de wind mee jullie kant op. Achter de vlammen ligt zwarte grond. Aan de rand smeulen takken.');
      return true;
    }
    // Recht op de vlammen af
    ss.known = true;
    if (ss.atFire) return true;
    ss.atFire = true;
    say(x, sv(going, 'loopt', 'lopen', (c.mods.has('fast') ? 'snel ' : '') + 'de heuvel af, recht op de rook af.') + ' De hitte slaat in ' + (going.length === 1 ? 'het' : 'hun') + ' gezicht, de rook prikt in de ogen. Daar brandt een strook riet, en het vuur kruipt ' + (going.length === 1 ? 'die' : 'hun') + ' kant op.');
    if (c.mods.has('fast') || asExit) {
      say(x, going.length >= 3 ? 'Iedereen hoest en rent terug naar boven.' : sv(going, 'rent', 'rennen', 'hoestend terug naar boven.'));
      going.forEach(id => hurt(G, id, -1, x, 'rook en hitte'));
      ss.atFire = false;
    }
    if (going.includes('sela') && !ss.lostBasket) {
      ss.lostBasket = true;
      say(x, 'Sela struikelt in de rook en laat de mand met noten vallen.');
      food(G, -1, x, 'mand gevallen');
    }
    x.flags.bad = true;
    return true;
  }

  /* ---- 2. Het spoor ---------------------------------------------------- */

  SCENES.spoor = {
    title: 'Het spoor bij de poel',
    place: 'Hertenpoel',
    objects: [
      ['afdruk', ['afdruk', 'afdrukken', 'pootafdruk', 'pootafdrukken', 'hoefafdruk', 'hoefafdrukken', 'spoor', 'sporen', 'prent', 'prenten', 'voetstappen', 'voetafdruk', 'voetafdrukken', 'hoeven', 'modder']],
      ['randen', ['rand', 'randen', 'kant van de afdruk']],
      ['keutels', ['keutels', 'keutel', 'poep', 'mest', 'uitwerpselen', 'drol', 'drollen', 'hoopje']],
      ['poel', ['poel', 'vijver', 'plas', 'meertje', 'groen water', 'stilstaand water']],
      ['bron', ['bron', 'bronnetje', 'beekje', 'stromend water', 'helder water', 'beek', 'stenen', 'glinstering']],
      ['hazelaar', ['hazelaar', 'hazelaars', 'struik', 'struiken', 'hazelnoten', 'nootjes', 'noot', 'noten']],
      ['berken', ['berk', 'berken', 'bos', 'bomen', 'boom']],
      ['hert', ['hert', 'herten', 'hinde', 'dier', 'edelhert', 'ree', 'reebok', 'prooi', 'gewei']],
      ['openplek', ['open plek', 'plek', 'gras']],
      ['rivier', ['rivier']],
    ],
    birch: true,
    triggers: [
      { id: 'hert', words: ['hert', 'dier', 'kop', 'opkijkt', 'kijkt', 'schrikt', 'snuift', 'ruikt', 'oren', 'hoort', 'ziet', 'beweegt'] },
    ],
    init: () => ({ found: false, alert: 0, gone: false, downwind: false, hunted: false, bron: false, nuts: 0, tries: 0 }),
    intro: () =>
      'Het pad daalt tussen witte berken naar een poel. Het water is groen en staat stil.\n' +
      'In de modder aan de rand zie je afdrukken.',
    senses: {
      kijk: (x) => {
        x.ss.seenAround = true;
        return 'Berken, een groene poel, modder met afdrukken. Aan de overkant van de poel staan struiken vol bruine nootjes. Achter de poel, tussen een paar stenen, glinstert iets.';
      },
      luister: (x) => x.ss.found && !x.ss.gone && !x.ss.hunted ? 'Tussen de berken scheurt iets gras af. Kauwen. Dan weer stil.' : 'Een specht. De wind in de berken. Verder niets.',
      ruik: () => 'Modder, rottend blad. En een scherpe geur, een beetje zoals natte vacht.',
      voel: () => '{a} {v:houdt|houden} een natte vinger omhoog. De wind komt uit het westen.',
    },
    look: {
      afdruk: () => 'Twee halve maantjes naast elkaar, met de punten naar voren. Er zijn er veel, achter elkaar. Ze wijzen naar het noorden, de berken in.',
      randen: () => '{a} {v:kijkt|kijken} naar de randen van een afdruk. Ze zijn scherp.',
      keutels: () => 'Een hoopje donkere keutels. Ze glanzen.',
      poel: () => 'Groen water. Er drijven blaadjes en schuim op. Muggen dansen erboven.',
      bron: (x) => { x.ss.bron = true; return 'Tussen de stenen achter de poel borrelt een bronnetje. Het water is helder en koud.'; },
      hazelaar: () => 'Hazelaars. De takken hangen vol rijpe nootjes.',
      hert: (x) => x.ss.found && !x.ss.gone && !x.ss.hunted ? 'Het hert graast op de open plek tussen de berken.' : '{a} {v:kijkt|kijken} rond. Er is geen hert te zien. Alleen het spoor.',
      berken: () => 'Witte berken met loslatende bast.',
    },
    feel: {
      afdruk: () => '{a} {v:drukt|drukken} met een vinger op de rand van een afdruk. Er brokkelt niets af. Onderin trekt langzaam helder water de afdruk in.',
      randen: () => 'De randen zijn scherp. Als {a} erop {v:drukt|drukken}, brokkelt er niets af. Onderin trekt langzaam helder water de afdruk in.',
      keutels: () => 'De keutels zijn zacht en nog lauw.',
      water: () => 'Het water in de poel is lauw en slijmerig.',
      poel: () => 'Het water in de poel is lauw en slijmerig.',
      wind: () => 'De wind komt uit het westen.',
    },
    smell: {
      keutels: () => 'Ze ruiken sterk. Vers.',
      poel: () => 'Het water ruikt muf.',
      afdruk: () => 'De modder ruikt naar ijzer en blad.',
    },
    listen: {},
    water(c, x, mode) {
      const G = x.G, ss = x.ss, a = x.actors;
      const fromBron = c.objs.includes('bron') || c.mods.has('fresh');
      if (fromBron) {
        ss.bron = true;
        if (mode === 'vul' || c.objs.includes('waterzak')) { G.water = 3; say(x, sv(a, 'vult', 'vullen', 'de waterzak bij het bronnetje achter de poel. Het water is koud en helder.')); fx(x, 'water vol', 'good'); }
        else say(x, sv(a, 'drinkt', 'drinken', 'bij het bronnetje. Het water is koud en helder.'));
        return true;
      }
      if (mode === 'vul' || c.objs.includes('waterzak')) {
        G.water = 3;
        say(x, sv(a, 'vult', 'vullen', 'de waterzak in de poel. Het water is groen en er drijven blaadjes in.'));
        fx(x, 'water vol', 'neutral');
        ss.badWater = true;
        return true;
      }
      say(x, sv(a, 'knielt', 'knielen', 'bij de poel en ' + vb(a, 'drinkt', 'drinken') + '. Het water smaakt naar modder.'));
      a.forEach(id => { if (!G.sick.includes(id)) G.sick.push(id); });
      return true;
    },
    handle(c, x) {
      const G = x.G, ss = x.ss, a = x.actors, o = c.objs;
      if (c.neg) return false;
      const stealth = c.mods.has('stealth') || c.verb === 'sluip' || c.mods.has('careful');
      const noisy = (party) => party.includes('tiko') || party.includes('sela') || party.length > 2 || c.mods.has('fast') || c.verb === 'ren';
      const deerHere = ss.found && !ss.gone && !ss.hunted;

      // Water: drinken uit de waterzak gaat via de zak
      if (c.verb === 'drink' && o.includes('waterzak')) {
        if (G.water > 0) {
          G.water--; fx(x, '−1 water', 'bad');
          say(x, sv(a, 'drinkt', 'drinken', 'uit de waterzak.'));
          if (ss.badWater) a.forEach(id => { if (!G.sick.includes(id)) G.sick.push(id); });
        } else say(x, sv(a, 'pakt', 'pakken', 'de waterzak. Hij is leeg.'));
        return true;
      }
      if (c.verb === 'zoek' && (o.includes('water') || o.includes('bron'))) {
        ss.bron = true;
        say(x, sv(a, 'zoekt', 'zoeken', 'rond de poel.') + ' Achter de poel, tussen een paar stenen, borrelt een bronnetje. Het water is helder en koud.');
        return true;
      }

      // Noten
      if (c.verb === 'verzamel' || (c.verb === 'pak' && o.includes('hazelaar'))) {
        if (o.includes('hazelaar') || o.includes('voedsel')) {
          if (ss.nuts >= 2) { say(x, sv(a, 'zoekt', 'zoeken', 'tussen de struiken. Alle rijpe noten zijn al geplukt.')); return true; }
          ss.nuts++;
          say(x, sv(a, 'loopt', 'lopen', 'om de poel heen en ' + vb(a, 'plukt', 'plukken') + ' een mand vol hazelnoten.'));
          food(G, 1, x, 'hazelnoten');
          return true;
        }
      }

      // Het spoor volgen of het hert opzoeken
      const followTrack = (c.verb === 'volg' && (o.includes('afdruk') || o.includes('hert') || !o.length)) ||
        (['loop', 'sluip', 'ren'].includes(c.verb) && (o.includes('afdruk') || o.includes('hert') || o.includes('berken') || o.includes('openplek') || c.dir === 'noord'));
      if (followTrack && !(c.verb === 'loop' && c.dir === 'west')) {
        if (ss.gone) { say(x, sv(a, 'volgt', 'volgen', 'het spoor de berken in. Het spoor wordt steeds vager. Het hert komt niet meer terug.')); return true; }
        if (ss.hunted) { say(x, 'Het spoor leidt naar de open plek, waar jullie het hert hebben gevonden.'); return true; }
        if (deerHere && (c.mods.has('around') || c.dir === 'oost' || c.mods.has('windAgainst') || c.mods.has('opposite'))) {
          if (noisy(a)) return scare(x, a, 'Takken kraken onder hun voeten.');
          ss.downwind = true;
          say(x, sv(a, 'sluipt', 'sluipen', 'in een grote boog om de open plek heen, tot ' + them(a) + ' aan de oostkant ' + vb(a, 'staat', 'staan') + '. Nu waait de wind van het hert naar ' + (a.length === 1 ? (them(a) === 'ze' ? 'haar' : 'hem') : 'hen') + ' toe.'));
          return true;
        }
        if (deerHere) {
          if (noisy(a)) return scare(x, a, 'Er kraakt een tak.');
          say(x, 'Het hert staat nog steeds op de open plek. ' + sv(a, 'zit', 'zitten', 'stil achter de berken, veertig stappen ervandaan.'));
          return true;
        }
        if (noisy(a) || !stealth) return scare(x, a, 'Na honderd stappen kraakt er een tak onder iemands voet.');
        ss.found = true;
        say(x, sv(a, 'sluipt', 'sluipen', 'langs het spoor de berken in.') + ' Op een open plek staat een hert te grazen, zo’n veertig stappen verderop. Het heeft ' + (a.length === 1 ? (them(a) === 'ze' ? 'haar' : 'hem') : 'hen') + ' niet gezien. De wind komt van links.');
        return true;
      }

      // Jagen
      if (c.verb === 'jaag' && (o.includes('hert') || !o.length || o.includes('speer') || o.includes('boog'))) {
        if (ss.hunted) { say(x, 'Het hert is al gevangen.'); return true; }
        if (ss.gone) { say(x, sv(a, 'houdt', 'houden', 'de wapens klaar. Er is geen hert meer.')); return true; }
        if (!ss.found) {
          say(x, sv(a, 'houdt', 'houden', 'de wapens klaar en ' + vb(a, 'kijkt', 'kijken') + ' om zich heen. Welk hert? Er is hier alleen een spoor.'));
          x.flags.missingObj = true;
          return true;
        }
        if (noisy(a)) {
          x.flags.actorMatters = a.length > 2 || !c.actors;
          return scare(x, a, (a.length > 2 ? 'Met z’n ' + (a.length === 4 ? 'vieren' : 'drieën') + ' stappen ze tussen de berken door. ' : '') + 'Er kraakt een tak.');
        }
        const ranged = o.includes('boog') || (!o.includes('speer') && a.includes('keb'));
        const shooter = ranged ? (a.includes('keb') ? ['keb'] : a.slice(0, 1)) : (a.includes('ura') ? ['ura'] : a.slice(0, 1));
        if (c.mods.has('windWith') || c.dir === 'west') return scare(x, a, 'De wind blaast hun geur recht naar het dier.', true);
        if (!ss.downwind && !c.mods.has('windAgainst')) {
          const r = rule(x, 'hert');
          if (r && ruleDoes(r, ['wacht', 'stil', 'verstop', 'rust'])) {
            say(x, 'Het hert tilt zijn kop op en snuift. Zoals je zei, ' + vb(a, 'bevriest', 'bevriezen') + ' ' + who(a).toLowerCase().replace('de hele groep', 'iedereen') + '. Na een tijdje graast het hert weer verder.');
          } else {
            ss.tries++;
            say(x, sv(a, 'komt', 'komen', 'overeind om te ' + (ranged ? 'schieten' : 'werpen') + '. Het hert tilt zijn kop op en snuift. Het draait zijn oren jullie kant op. Dan springt het weg.'));
            if (ss.tries >= 2) { ss.gone = true; say(x, 'Het hert verdwijnt tussen de berken. Dit keer komt het niet terug.', 'info'); }
            else { ss.found = false; say(x, 'Het spoor loopt verder het bos in.', 'info'); }
            x.flags.bad = true;
            return true;
          }
        }
        if (!ranged && !(c.mods.has('close') || (stealth && ss.downwind && c.mods.has('close')))) {
          ss.tries++;
          say(x, sv(shooter, 'werpt', 'werpen', 'de speer. Veertig stappen is te ver. De speer valt in het gras en het hert rent weg.'));
          if (ss.tries >= 2) { ss.gone = true; say(x, 'Het hert verdwijnt tussen de berken. Dit keer komt het niet terug.', 'info'); }
          else ss.found = false;
          x.flags.bad = true;
          return true;
        }
        ss.hunted = true;
        if (ranged) say(x, sv(shooter, 'spant', 'spannen', 'de boog, ' + vb(shooter, 'wacht', 'wachten') + ' en ' + vb(shooter, 'schiet', 'schieten') + '. De pijl raakt. Het hert zakt door zijn poten.'));
        else say(x, sv(shooter, 'sluipt', 'sluipen', 'tot vlakbij en ' + vb(shooter, 'werpt', 'werpen') + ' de speer. Raak. Het hert zakt door zijn poten.'));
        say(x, 'Ze snijden het vlees los en wikkelen het in een huid. Sela bedankt het dier, zoals altijd.');
        food(G, 4, x, 'hertenvlees');
        x.flags.good = true;
        return true;
      }

      // Verder trekken naar de rivier
      if (['loop', 'volg', 'ren', 'sluip'].includes(c.verb) && (c.dir === 'west' || c.mods.has('onward') || o.includes('rivier'))) {
        if (a.length < 4) { say(x, sv(a, 'loopt', 'lopen', 'een stuk vooruit.') + ' De anderen blijven bij de poel. ' + sv(a, 'komt', 'komen', 'terug.')); x.flags.actorMatters = true; return true; }
        say(x, 'De groep laat de poel achter zich en loopt verder naar het westen.');
        exit(x, c, 0);
        return true;
      }
      return false;
    },
    exitText: 'Jullie volgen een beek die naar het westen stroomt. Hij wordt steeds breder.',
  };

  function scare(x, a, cause, wind) {
    const ss = x.ss;
    ss.tries++;
    ss.found = false;
    say(x, cause + ' Voor ' + (a.length === 1 ? (them(a) === 'ze' ? 'haar' : 'hem') : 'hen') + ' springt een groot hert op en verdwijnt tussen de berken.' + (wind ? '' : ''));
    if (ss.tries >= 2) { ss.gone = true; say(x, 'Dit keer komt het hert niet terug.', 'info'); }
    x.flags.bad = true;
    return true;
  }

  /* ---- 3. De rivier ---------------------------------------------------- */

  SCENES.rivier = {
    title: 'De grote rivier',
    place: 'Grote rivier',
    objects: [
      ['rivier', ['rivier', 'stroom', 'rivierwater']],
      ['overkant', ['overkant', 'andere kant', 'andere oever', 'overzijde']],
      ['oever', ['oever', 'kant']],
      ['riet', ['riet', 'rietkraag', 'rietveld', 'stengels']],
      ['kano', ['kano', 'boot', 'bootje', 'boomstamkano', 'boomstam', 'uitgeholde boomstam', 'kanootje', 'kano\'s']],
      ['peddel', ['peddel', 'roeispaan']],
      ['ford', ['ondiepe plek', 'ondiep', 'ondiepe stuk', 'doorwaadbare plaats', 'wit water', 'witte water', 'schuim', 'stroomversnelling', 'stenen', 'rimpelingen', 'wad']],
      ['diepte', ['diepte', 'hoe diep']],
      ['vlot', ['vlot']],
    ],
    triggers: [
      { id: 'diep', words: ['diep', 'dieper', 'knie', 'knieen', 'middel', 'heup', 'buik', 'borst', 'te', 'stroom', 'sterk', 'trekt', 'valt', 'glijdt', 'uitglijdt'] },
      { id: 'tiko', words: ['tiko', 'kind', 'alleen', 'bang', 'huilt'] },
    ],
    init: () => ({ pos: { ura: 'A', keb: 'A', sela: 'A', tiko: 'A' }, kano: 'A', kanoFound: false, ford: false, atFord: false, boarded: null, lastOcc: null }),
    intro: () =>
      'De beek komt uit in een grote rivier. Het water is bruin en stroomt snel. De overkant is ver weg. Langs de oever groeit hoog riet.\n' +
      'Jullie moeten naar de overkant.',
    senses: {
      kijk: () => 'De rivier is breed. Het water draait in kolken. Stroomopwaarts, ver weg, lijkt het water wit te schuimen.',
      luister: () => 'Het water ruist. In het riet vlakbij klotst water tegen iets hols: tok, tok, tok.',
      ruik: () => 'Natte klei en vis.',
      voel: () => '{a} {v:steekt|steken} een hand in het water. IJskoud. De stroom trekt aan de vingers.',
    },
    look: {
      rivier: () => 'Bruin water, snel en breed. Takken drijven voorbij en verdwijnen in een kolk.',
      overkant: () => 'De andere oever is ver weg. Je ziet riet en een paar wilgen.',
      riet: (x) => revealKano(x),
      kano: (x) => x.ss.kanoFound ? 'Een uitgeholde boomstam, zo lang als drie mensen. Er ligt één peddel in. Er is plek voor twee mensen.' : '{a} {v:kijkt|kijken} langs de oever. Een boot zie je niet.',
      ford: (x) => { x.ss.ford = true; return 'Een eind stroomopwaarts wordt de rivier breder. Daar schuimt het water wit over stenen. Je ziet de stenen door het water heen.'; },
    },
    feel: {
      water: () => 'IJskoud. De stroom trekt aan de vingers.',
      rivier: () => 'IJskoud. De stroom trekt aan de vingers.',
      diepte: (x) => depthTest(x),
    },
    water(c, x, mode) {
      const G = x.G, a = x.actors;
      if (mode === 'vul' || c.objs.includes('waterzak')) { G.water = 3; say(x, sv(a, 'vult', 'vullen', 'de waterzak in de rivier. Het water is koud en een beetje bruin, maar het stroomt.')); fx(x, 'water vol', 'good'); return true; }
      say(x, sv(a, 'drinkt', 'drinken', 'uit de rivier. Koud en een beetje zanderig.'));
      return true;
    },
    handle(c, x) {
      const G = x.G, ss = x.ss, o = c.objs;
      let a = x.actors;
      if (c.neg) return false;

      if (o.includes('kano') && !ss.kanoFound && c.verb !== 'zoek' && c.verb !== 'kijk') {
        say(x, sv(a, 'kijkt', 'kijken', 'om zich heen. Welke kano? Niemand ziet een boot.'));
        x.flags.missingObj = true;
        return true;
      }
      // Iets hoog houden geldt voor de oversteek die nog komt
      if ((c.verb === 'draag' || c.verb === 'pak' || c.verb === 'wacht') && c.mods.has('high') && (o.includes('tondel') || o.includes('voedsel') || o.includes('mand') || o.includes('vuur') || o.includes('kooltjes'))) {
        ss.high = true;
        say(x, sv(a, 'houdt', 'houden', 'de ' + nameOf(o.find(i => ['tondel', 'voedsel', 'mand', 'vuur', 'kooltjes'].includes(i))) + ' hoog.'));
        return true;
      }
      // "haal Keb" met de kano
      if (c.verb === 'pak' && c.persons.length && ss.kanoFound) {
        const paddler = c.actors ? a.filter(id => ss.pos[id] === ss.kano) : (ss.lastOcc || []).filter(id => id !== 'tiko' && ss.pos[id] === ss.kano).slice(0, 1);
        if (!paddler.length) { say(x, 'Wie moet ' + who(c.persons) + ' halen? Niemand staat bij de kano.'); x.flags.actorMatters = true; return true; }
        for (const p of c.persons) {
          if (ss.pos[p] === ss.pos[paddler[0]]) {
            if (ss.kano === ss.pos[p]) { if (!trip(x, uniq(paddler.concat([p])), c, 'over')) return true; }
            else say(x, PEOPLE[p].name + ' staat al aan dezelfde kant.');
            continue;
          }
          if (!trip(x, paddler, c, 'heen')) return true;
          if (!trip(x, uniq(paddler.concat([p])), c, 'terug')) return true;
        }
        return true;
      }

      if ((c.verb === 'zoek' || c.verb === 'kijk' || c.verb === 'verken') && (o.includes('riet') || o.includes('kano') && !ss.kanoFound)) {
        say(x, cap(sv(a, 'zoekt', 'zoeken', 'tussen het riet.')) + ' ' + revealKano(x));
        return true;
      }
      if ((c.verb === 'zoek' || c.verb === 'kijk' || c.verb === 'loop' || c.verb === 'verken' || c.verb === 'volg') && (o.includes('ford') || c.dir === 'stroomop')) {
        ss.ford = true;
        if (c.verb === 'loop' || c.verb === 'volg' || c.verb === 'verken' || c.move) {
          if (a.length === 4 || (a.every(id => ss.pos[id] === 'A') && a.length === PARTY.filter(id => ss.pos[id] === 'A').length)) ss.atFord = true;
          say(x, sv(a, 'loopt', 'lopen', 'langs de oever stroomopwaarts.') + ' Daar wordt de rivier breder. Het water schuimt wit over stenen; je ziet de bodem.' + (ss.atFord ? '' : ' De anderen zijn bij het riet gebleven.'));
        } else say(x, 'Stroomopwaarts wordt de rivier breder. Daar schuimt het water wit over stenen.');
        return true;
      }
      if (c.verb === 'voel' && (o.includes('diepte') || o.includes('stok') || (o.includes('water') || o.includes('rivier')) && o.includes('stok'))) {
        say(x, depthTest(x));
        return true;
      }
      if (c.verb === 'maak' && o.includes('vlot')) {
        say(x, sv(a, 'sleept', 'slepen', 'takken naar de oever en ' + vb(a, 'probeert', 'proberen') + ' ze aan elkaar te binden. Zonder touw valt het vlot steeds uit elkaar. De middag gaat voorbij.'));
        x.extraTime = (x.extraTime || 0) + 1;
        return true;
      }

      // In de kano stappen
      const kanoCmd = ss.kanoFound && (o.includes('kano') || c.paddle || o.includes('peddel') || (ss.boarded && (c.verb === 'oversteek' || c.verb === 'loop' && (o.includes('overkant') || c.mods.has('back')))));
      if (kanoCmd && (c.verb === 'loop' || c.verb === 'pak' || c.verb === 'duw' || c.verb === 'oversteek' || c.verb === 'help' || c.verb === 'draag')) {
        const explicit = !!c.actors;
        if (!explicit) a = c.mods.has('back') && ss.lastOcc ? ss.lastOcc.slice() : PARTY.filter(id => ss.pos[id] === ss.kano);
        // haal X: heen en weer
        if (c.verb === 'pak' && c.persons.length) {
          const paddler = explicit ? a : (ss.lastOcc && ss.lastOcc.filter(id => id !== 'tiko').slice(0, 1)) || [];
          for (const p of c.persons) {
            if (ss.pos[p] === ss.kano) { say(x, PEOPLE[p].name + ' staat al bij de kano.'); continue; }
            if (!trip(x, paddler, c, 'heen')) return true;
            if (!trip(x, uniq(paddler.concat([p])), c, 'terug')) return true;
          }
          return true;
        }
        if (c.verb === 'loop' && !c.mods.has('back') && !o.includes('overkant') && !c.dir) {
          // alleen instappen
          const here = a.filter(id => ss.pos[id] === ss.kano);
          if (!here.length) { say(x, who(a) + ' ' + vb(a, 'staat', 'staan') + ' aan de andere kant dan de kano.'); return true; }
          if (here.length > 2) {
            say(x, sv(here, 'stapt', 'stappen', 'in de kano.') + ' Hij zakt diep weg. Water stroomt over de rand en de kano loopt vol. Iedereen klautert hijgend weer op de kant.');
            here.forEach(id => hurt(G, id, -1, x, 'nat en koud'));
            if (G.fire && !c.mods.has('high')) setFire(G, false, x, 'nat');
            x.flags.bad = true; x.flags.actorMatters = !explicit;
            return true;
          }
          ss.boarded = here;
          say(x, sv(here, 'stapt', 'stappen', 'in de kano.') + (here.includes('tiko') && here.length === 1 ? ' Hij kan de zware peddel nauwelijks optillen.' : ''));
          return true;
        }
        const occ = ss.boarded && !explicit ? ss.boarded : a;
        ss.boarded = null;
        const ok = trip(x, occ, c, c.mods.has('back') ? 'terug' : 'over');
        if (!ok && !explicit) x.flags.actorMatters = true;
        return true;
      }

      // Door het water
      if (c.verb === 'oversteek' || ((c.verb === 'loop' || c.verb === 'ren') && (o.includes('rivier') || o.includes('water') || o.includes('overkant')))) {
        const atFord = ss.atFord || o.includes('ford') || c.dir === 'stroomop';
        if (o.includes('ford') || c.dir === 'stroomop') { ss.ford = true; }
        const going = a.filter(id => ss.pos[id] === 'A');
        if (!going.length) { say(x, sv(a, 'staat', 'staan', 'al aan de overkant.')); return true; }
        if (c.swim) return swim(x, going, c);
        if (atFord) return wadeFord(x, going, c);
        return wadeDeep(x, going, c);
      }
      return false;
    },
    afterTurn(x) {
      const ss = x.ss;
      if (PARTY.every(id => ss.pos[id] === 'B') && !x.flags.exited) {
        say(x, 'Iedereen staat aan de overkant. Ze kijken nog één keer naar het bruine water.', 'act');
        exit(x, null, 0);
      }
    },
    exitText: 'Aan de overkant volgen jullie de rivier stroomafwaarts, tot de zon laag staat.',
    legTo: 'evening',
  };

  function revealKano(x) {
    if (x.ss.kanoFound) return 'Tussen het riet ligt de kano.';
    x.ss.kanoFound = true;
    return 'Tussen het riet ligt een kano: een uitgeholde boomstam, zo lang als drie mensen. Er ligt één peddel in. Er is plek voor twee mensen. In de zijkant zijn drie strepen gekerfd.';
  }

  function depthTest(x) {
    x.ss.depthKnown = true;
    return 'Keb steekt een lange tak in het water. Hij raakt de bodem niet, ook niet als zijn arm tot de schouder onder water is.';
  }

  function wadeDeep(x, going, c) {
    const G = x.G;
    const r = rule(x, 'diep');
    const weak = going.filter(id => id === 'sela' || id === 'tiko');
    if (r && ruleDoes(r, ['loop', 'terug', 'wacht', 'vlucht'])) {
      say(x, sv(going, 'stapt', 'stappen', 'het water in.') + ' Na een paar stappen staat het water boven de knieën. Zoals je hebt afgesproken, ' + vb(going, 'keert', 'keren') + ' ' + them(going) + ' meteen om.');
      return true;
    }
    if (!weak.length) {
      say(x, sv(going, 'stapt', 'stappen', 'het water in.') + ' Na vier stappen staat het water tot het middel. De stroom trekt ' + (going.length === 1 ? (them(going) === 'ze' ? 'haar' : 'hem') : 'hen') + ' bijna onderuit. ' + sv(going, 'keert', 'keren', 'om en ' + vb(going, 'klautert', 'klauteren') + ' rillend op de kant.'));
      going.forEach(id => hurt(G, id, -1, x, 'koud water'));
      x.flags.bad = true;
      return true;
    }
    const victim = weak.includes('sela') ? 'sela' : 'tiko';
    const saver = going.find(id => id === 'ura' || id === 'keb') || (x.ss.pos.ura === 'A' ? 'ura' : 'keb');
    say(x, sv(going, 'stapt', 'stappen', 'het water in.') + ' Het wordt meteen diep. ' + PEOPLE[victim].name + ' verliest de bodem onder de voeten en de stroom neemt ' + (victim === 'sela' ? 'haar' : 'hem') + ' mee. ' + PEOPLE[saver].name + ' springt erachteraan en sleept ' + (victim === 'sela' ? 'haar' : 'hem') + ' terug naar de kant.');
    hurt(G, victim, -1, x, 'bijna verdronken');
    hurt(G, saver, -1, x, 'koud water');
    say(x, 'Een pakje gedroogd vlees drijft weg.');
    food(G, -1, x, 'weggedreven');
    if (G.fire && !c.mods.has('high') && !x.ss.high) { say(x, 'De tondelzwam is doorweekt.'); setFire(G, false, x, 'nat'); G.tinderWet = true; }
    x.flags.bad = true;
    return true;
  }

  function swim(x, going, c) {
    const G = x.G, ss = x.ss;
    const out = [];
    if (going.includes('sela')) out.push('Sela schudt haar hoofd en blijft op de oever staan. Zwemmen kan ze niet.');
    const swimmers = going.filter(id => id !== 'sela');
    if (!swimmers.length) { say(x, out.join(' ')); return true; }
    if (swimmers.includes('tiko')) {
      out.push('Tiko springt het water in. De stroom is te sterk voor hem. ' + (swimmers.includes('ura') ? 'Ura' : 'Keb') + ' haalt hem net op tijd terug naar de kant.');
      hurt(G, 'tiko', -1, x, 'bijna verdronken');
    }
    const adults = swimmers.filter(id => id !== 'tiko');
    if (adults.length) {
      if (adults.length && swimmers.includes('tiko')) out.push(sv(adults, 'blijft', 'blijven', 'bij Tiko.'));
      else {
        adults.forEach(id => { ss.pos[id] = 'B'; });
        out.push(sv(adults, 'zwemt', 'zwemmen', 'naar de overkant. Het duurt lang en het water is ijskoud. Hijgend ' + vb(adults, 'kruipt', 'kruipen') + ' ' + them(adults) + ' op de andere oever.'));
        adults.forEach(id => hurt(G, id, -1, x, 'ijskoud'));
        if (G.fire && !c.mods.has('high')) { setFire(G, false, x, 'nat'); G.tinderWet = true; }
        checkTikoAlone(x);
      }
    }
    say(x, out.join(' '));
    return true;
  }

  function wadeFord(x, going, c) {
    const G = x.G, ss = x.ss;
    ss.atFord = true;
    const together = c.mods.has('together') || c.verb === 'help' || c.persons.length;
    let text = sv(going, 'loopt', 'lopen', 'naar de plek waar het water wit schuimt en ' + vb(going, 'stapt', 'stappen') + ' het water in. Het water komt tot de knieën, soms tot de heupen.');
    if (going.includes('tiko') && !together) {
      text += ' Halverwege glijdt Tiko uit op een gladde steen. ' + (going.includes('keb') ? 'Keb' : going.find(id => id !== 'tiko') ? PEOPLE[going.find(id => id !== 'tiko')].name : 'Niemand') + ' grijpt hem net op tijd.';
      hurt(G, 'tiko', -1, x, 'uitgegleden');
    } else if (going.includes('sela') && !together) {
      text += ' Sela gaat langzaam. Het water trekt aan haar benen, maar ze houdt stand.';
    } else if (together) {
      text += ' Ze houden elkaar vast. Niemand glijdt uit.';
    }
    if (G.fire && !c.mods.has('high') && !ss.high) {
      text += ' Water spat over de tondelzwam. Het vuur sist en dooft.';
      setFire(G, false, x, 'nat');
      G.tinderWet = true;
    } else if (G.fire) text += ' De smeulende tondelzwam blijft hoog en droog.';
    going.forEach(id => { ss.pos[id] = 'B'; });
    say(x, text);
    checkTikoAlone(x);
    return true;
  }

  function trip(x, occIn, c, mode) {
    const G = x.G, ss = x.ss;
    const from = ss.kano;
    const to = from === 'A' ? 'B' : 'A';
    const wrong = occIn.filter(id => ss.pos[id] !== from);
    const occ = occIn.filter(id => ss.pos[id] === from);
    if (wrong.length) say(x, sv(wrong, 'staat', 'staan', 'aan de andere kant van de rivier dan de kano.'));
    if (!occ.length) return false;
    if (occ.length > 2) {
      say(x, sv(occ, 'stapt', 'stappen', 'in de kano.') + ' Met ' + occ.length + ' mensen ligt hij diep. Halverwege loopt er water over de rand. De kano kantelt. Iedereen spartelt terug naar de kant waar ' + them(occ) + ' vandaan kwamen.');
      occ.forEach(id => hurt(G, id, -1, x, 'omgeslagen'));
      food(G, -1, x, 'weggedreven');
      if (G.fire) { setFire(G, false, x, 'nat'); G.tinderWet = true; }
      x.flags.bad = true;
      return false;
    }
    if (occ.length === 1 && occ[0] === 'tiko') {
      say(x, 'Tiko krijgt de zware kano niet van zijn plek. De peddel is langer dan hij.');
      return false;
    }
    occ.forEach(id => { ss.pos[id] = to; });
    ss.kano = to;
    ss.lastOcc = occ.slice();
    const dest = to === 'B' ? 'naar de overkant' : 'terug naar de oever waar jullie begonnen';
    say(x, sv(occ, 'peddelt', 'peddelen', dest + '.') + (occ.length === 2 ? '' : ''));
    checkTikoAlone(x);
    return true;
  }

  function checkTikoAlone(x) {
    const ss = x.ss;
    const side = ss.pos.tiko;
    const with_ = PARTY.filter(id => id !== 'tiko' && ss.pos[id] === side);
    if (!with_.length && !ss.tikoPanicked) {
      ss.tikoPanicked = true;
      say(x, 'Tiko staat alleen op de oever. Hij begint te roepen en rent het riet in. Het duurt lang voordat iemand hem weer kalm krijgt.');
      x.extraTime = (x.extraTime || 0) + 1;
      x.flags.bad = true;
    } else if (with_.length) ss.tikoPanicked = false;
  }

  /* ---- 4. De nacht ---------------------------------------------------- */

  SCENES.nacht = {
    timeless: true,
    title: 'De nacht bij het bos',
    place: 'Eikenbos',
    birch: true,
    objects: [
      ['bos', ['bos', 'eikenbos', 'eiken', 'eik', 'bosrand']],
      ['wolf', ['wolf', 'wolven', 'roedel', 'ogen', 'gehuil']],
      ['hut', ['hut', 'hutje', 'schuilplaats', 'afdak', 'tent', 'onderdak', 'beschutting', 'slaapplek', 'kamp']],
      ['boom', ['boom', 'bomen', 'tak van een boom', 'hoge tak', 'boomtak']],
      ['berken', ['berk', 'berken']],
      ['steen', ['stenen', 'steen', 'keien']],
    ],
    triggers: [
      { id: 'wolf', words: ['wolf', 'wolven', 'ogen', 'dier', 'dieren', 'iets', 'iemand', 'geluid', 'gehuil', 'huilen', 'komen', 'komt', 'dichtbij', 'dichterbij', 'aanvallen', 'sluipen'] },
      { id: 'vuurzwak', words: ['vuur', 'uit', 'zwak', 'kleiner', 'dooft', 'uitgaat'] },
    ],
    init: () => ({ left: 2, campfire: false, wood: false, bark: false, shelter: false, watch: [], rotate: false, keepFire: false, meatHigh: false, night: false, morning: false }),
    intro: (G) =>
      'De zon zakt. Jullie staan aan de rand van een donker eikenbos. Diep in het bos huilt een wolf. Daarna nog een.\n' +
      'Jullie hebben tijd voor twee opdrachten. Daarna is het donker.' + (G.food > 0 ? '' : '\nDe mand is leeg.'),
    senses: {
      kijk: () => 'Oude, dikke eiken. Aan de bosrand staan een paar berken met witte, loslatende bast. Onder de bomen ligt veel dood hout.',
      luister: () => 'Wolven, ver weg. Steeds weer. Dan is het even stil.',
      ruik: () => 'Vochtig blad en paddenstoelen.',
      voel: () => 'De wind is gaan liggen. Het wordt snel koud.',
    },
    look: {
      wolf: () => 'Je ziet ze niet. Je hoort ze alleen.',
      boom: () => 'Een oude eik met een dikke tak, hoog boven de grond.',
      berken: () => 'Berken met witte bast die in repen loslaat.',
      bos: () => 'Donker en dicht. Onder de eiken ligt dood hout.',
    },
    handle(c, x) {
      const G = x.G, ss = x.ss, a = x.actors, o = c.objs;
      if (ss.morning) {
        if (['loop', 'volg', 'ren'].includes(c.verb) && (c.dir === 'west' || c.dir === 'stroomaf' || c.mods.has('onward') || o.includes('zee') || o.includes('rivier'))) {
          if (a.length < 4) { say(x, sv(a, 'loopt', 'lopen', 'een stuk vooruit en ' + vb(a, 'wacht', 'wachten') + ' dan op de anderen.')); x.flags.actorMatters = true; return true; }
          say(x, 'De groep pakt de spullen en volgt de rivier naar het westen.');
          exit(x, c, 0);
          return true;
        }
        return false;
      }
      if (c.neg && !(c.verb === 'stook' || c.verb === 'blus')) return false;
      if (c.verb === 'verzamel' && (o.includes('hout') || !o.length)) {
        ss.wood = true;
        say(x, sv(a, 'sprokkelt', 'sprokkelen', 'dood hout onder de eiken. Een flinke stapel.'));
        return true;
      }
      if ((c.verb === 'pak' || c.verb === 'verzamel') && o.includes('berkenbast')) return gatherBark(c, x);
      if (c.verb === 'maak' && o.includes('hut')) {
        ss.shelter = true;
        say(x, sv(a, 'zet', 'zetten', 'takken schuin tegen een omgevallen boom en ' + vb(a, 'legt', 'leggen') + ' de huiden eroverheen. Een laag afdak, net groot genoeg voor vier.'));
        return true;
      }
      if (c.verb === 'bewaak' || (c.verb === 'wacht' && c.mods.has('rotate'))) {
        if (!c.actors) {
          ss.watch = PARTY.slice(); ss.allWatch = true;
          say(x, 'Iedereen gaat bij de rand van het kamp zitten om de wacht te houden.');
          x.flags.actorMatters = true;
          return true;
        }
        ss.watch = uniq(ss.watch.concat(a));
        if (c.mods.has('rotate') || ss.watch.length > 1 && ss.watchClauses >= 1) ss.rotate = true;
        ss.watchClauses = (ss.watchClauses || 0) + 1;
        say(x, sv(a, 'neemt', 'nemen', 'de eerste wacht op zich.').replace('de eerste wacht', ss.watchClauses > 1 ? 'de volgende wacht' : 'de wacht'));
        return true;
      }
      if (c.verb === 'plaats' || c.verb === 'pak' || c.verb === 'draag') {
        if (o.includes('voedsel') && (o.includes('boom') || c.mods.has('high'))) {
          ss.meatHigh = true;
          say(x, sv(a, 'bindt', 'binden', 'het vlees in een huid en ' + vb(a, 'hangt', 'hangen') + ' het hoog aan de tak van een eik.'));
          return true;
        }
        if (o.includes('hout') && ss.campfire) { ss.keepFire = true; say(x, sv(a, 'legt', 'leggen', 'hout op het vuur. Het brandt hoog op.')); return true; }
      }
      if (c.verb === 'stook' || (c.neg && c.verb === 'blus')) {
        if (!ss.campfire) { say(x, sv(a, 'kijkt', 'kijken', 'naar de plek voor het vuur. Er brandt niets.')); return true; }
        ss.keepFire = true;
        ss.keepers = a;
        say(x, sv(a, 'legt', 'leggen', 'een stapel hout klaar naast het vuur, om het de hele nacht te voeden.'));
        return true;
      }
      if (c.verb === 'rust') { ss.sleepNow = true; say(x, sv(a, 'legt', 'leggen', 'zich te slapen.')); return true; }
      return false;
    },
    afterTurn(x) {
      const ss = x.ss;
      if (ss.morning) return;
      ss.left--;
      if (ss.left > 0 && !ss.sleepNow) {
        say(x, 'De zon raakt de boomtoppen. Nog één opdracht, dan is het donker.', 'info');
        return;
      }
      resolveNight(x);
    },
    exitText: 'Twee dagen lang volgen jullie de rivier. Het land wordt vlakker, de lucht wijder. De wind ruikt naar zout.',
    noTimeWhenMorning: true,
  };

  function resolveNight(x) {
    const G = x.G, ss = x.ss;
    x.noTime = true;
    const lines = [];
    lines.push(ss.campfire ? 'Het wordt donker. Het vuur werpt een kring van licht tussen de bomen.' : 'Het wordt donker. Zonder vuur is het stikdonker en koud.');
    if (!ss.shelter && !ss.campfire) {
      lines.push('Zonder vuur en zonder afdak liggen ze rillend tegen elkaar aan.');
      hurt(G, 'sela', -1, x, 'koud'); hurt(G, 'tiko', -1, x, 'koud');
    }
    // Wacht
    let awake = false, watcher = null;
    if (ss.allWatch) {
      awake = true; watcher = ['keb'];
      lines.push('Niemand slaapt. Iedereen houdt de wacht.');
      G.tired = true;
    } else if (ss.watch.length) {
      const w = ss.watch.filter(id => id !== 'tiko');
      if (ss.watch.length === 1 && ss.watch[0] === 'tiko') lines.push('Tiko houdt de wacht. Na een paar tellen valt hij in slaap.');
      else if (ss.rotate && w.length >= 2) { awake = true; watcher = w; lines.push(who(w) + ' houden om de beurt de wacht. Steeds is er iemand wakker.'); }
      else if (w.length) { lines.push(who(w.slice(0, 1)) + ' houdt de wacht. Halverwege de nacht vallen ' + (w[0] === 'ura' || w[0] === 'sela' ? 'haar' : 'zijn') + ' ogen dicht.'); }
    } else lines.push('Niemand houdt de wacht. Iedereen slaapt.');
    // Vuur
    let fireLasts = false;
    if (ss.campfire) {
      if (ss.keepFire && (awake || (ss.keepers && ss.keepers.some(id => ss.watch.includes(id))))) { fireLasts = true; lines.push('Elke keer als de vlammen kleiner worden, legt de wacht er hout op.'); }
      else if (ss.keepFire && !awake) lines.push('Het hout ligt klaar naast het vuur. Maar wie slaapt, legt niets op. Na middernacht zakt het vuur in.');
      else if (awake && rule(x, 'vuurzwak')) { fireLasts = true; lines.push('Als het vuur kleiner wordt, legt de wacht er hout op, zoals je zei.'); }
      else if (awake) lines.push('De wacht kijkt hoe het vuur kleiner wordt. Niemand heeft gezegd dat er hout op moet. Na middernacht dooft het.');
      else lines.push('Na middernacht dooft het vuur.');
    }
    // Wolven
    lines.push('Diep in de nacht kraken takken. Tussen de bomen glimmen ogen.');
    const r = rule(x, 'wolf');
    const scareVerbs = ['lawaai', 'jaag', 'maak', 'stook', 'pak', 'vlucht', 'verstop', 'loop'];
    const meat = G.food > 0;
    if (fireLasts) {
      lines.push('Net buiten het licht van het vuur blijven de ogen staan. Dichterbij komen ze niet. Tegen de ochtend zijn ze weg.');
    } else if (awake && r && ruleDoes(r, scareVerbs)) {
      const act = r.cmds.find(c => scareVerbs.includes(c.verb));
      const what = act.verb === 'lawaai' ? 'maakt de wacht zoveel mogelijk lawaai' : act.verb === 'jaag' ? 'gooit de wacht stenen naar de ogen' : act.verb === 'vlucht' ? 'rent de wacht weg. De wolven schrikken van de beweging' : act.verb === 'verstop' ? 'duikt de wacht weg. De wolven sluipen langs' : 'doet de wacht wat je zei';
      lines.push('Zoals afgesproken ' + what + '. De ogen verdwijnen in het donker.');
      if (act.verb === 'verstop' && meat && !ss.meatHigh) { lines.push('Als het licht wordt, is het vlees weg.'); food(G, -Math.min(3, G.food), x, 'wolven'); }
    } else if (awake) {
      lines.push(who(watcher.slice(0, 1)) + ' ziet de ogen. Wat moet ' + (watcher[0] === 'ura' || watcher[0] === 'sela' ? 'ze' : 'hij') + ' doen? Niemand heeft het gezegd. ' + (watcher[0] === 'ura' || watcher[0] === 'sela' ? 'Ze' : 'Hij') + ' blijft stokstijf zitten.');
      wolvesTake(x, lines, meat);
    } else {
      wolvesTake(x, lines, meat);
    }
    lines.push('Dan wordt het licht.');
    say(x, lines.join(' '));
    // naar de volgende ochtend
    const toMorning = 3 - (G.t % 3);
    advance(G, toMorning, x);
    ss.morning = true;
    ss.campfire = false;
    if (!G.over) say(x, 'Het is ochtend. De wind komt van de zee en ruikt naar zout. De kust ligt in het westen, waar de rivier naartoe stroomt.', 'info');
  }

  function wolvesTake(x, lines, meat) {
    const G = x.G, ss = x.ss;
    if (!meat) { lines.push('De wolven snuffelen aan de lege mand en verdwijnen weer.'); return; }
    if (ss.meatHigh) { lines.push('De wolven springen naar het vlees in de boom. Het hangt te hoog. Na een tijdje geven ze het op.'); return; }
    lines.push('De wolven sluipen het kamp in. Als het licht wordt, zijn de huiden kapot en is het vlees weg.');
    food(G, -Math.min(3, G.food), x, 'wolven');
    x.flags.bad = true;
  }

  /* ---- 5. De kust ----------------------------------------------------- */

  SCENES.kust = {
    title: 'De kust',
    place: 'Kust',
    birch: false,
    sun: true,
    objects: [
      ['hut', ['hut', 'hutten', 'hutje', 'schuilplaats', 'afdak', 'tent', 'onderdak', 'beschutting', 'zomerkamp', 'kamp', 'woning']],
      ['duin', ['duin', 'duinen', 'duintop', 'helm', 'achter de duinen', 'achter het duin', 'tussen de duinen']],
      ['strand', ['strand', 'zand', 'vloedlijn', 'waterlijn']],
      ['kwelder', ['kwelder', 'kwelders', 'gras']],
      ['kreek', ['kreek', 'kreken', 'geul', 'geulen', 'priel']],
      ['zee', ['zee', 'branding', 'golven', 'zeewater', 'zout water', 'golf']],
      ['kom', ['kom', 'duinmeer', 'zoet water', 'zoetwater', 'plas', 'meertje', 'duinmeertje', 'riet']],
      ['schelpen', ['schelpen', 'schelp', 'mosselen', 'mossel', 'kokkels', 'kokkel', 'schelpdieren', 'oesters', 'krabben', 'krab', 'garnalen', 'wadpieren']],
      ['fuik', ['fuik', 'fuiken', 'visfuik', 'aalfuik']],
      ['aal', ['aal', 'palingen', 'paling', 'alen']],
      ['zeehond', ['zeehond', 'zeehonden', 'rob', 'robben']],
      ['wier', ['wier', 'zeewier']],
      ['tenen', ['wilgentenen', 'tenen', 'twijgen', 'takjes', 'wilgen', 'wilg']],
      ['meeuw', ['meeuw', 'meeuwen', 'vogels', 'eieren']],
    ],
    triggers: [
      { id: 'vloed', words: ['vloed', 'water', 'stijgt', 'hoog', 'zee', 'nat'] },
      { id: 'storm', words: ['storm', 'wind', 'regen', 'onweer'] },
    ],
    init: () => ({ planned: false }),
    intro: () =>
      'De lucht wordt wijd. Jullie zien de zee. Voor jullie ligt een brede kwelder met kreken, daarachter een strand vol schelpen en een rij duinen. Het is eb.\n' +
      'Hier wil de groep de hele zomer blijven.\n' +
      'Dit is je laatste opdracht: het plan voor het zomerkamp. Je mag eerst nog kijken, luisteren en ruiken. Zodra je een plan geeft, gaat iedereen aan het werk. Dan kun je niets meer zeggen.',
    senses: {
      kijk: () => 'Het zand is nat tot ver landinwaarts. Op het strand ligt een lange streep zeewier, vlak voor de duinen. In de kreek zwemmen visjes; ergens kronkelt een aal. Achter de duinen, in een kom, staat water tussen het riet. Overal ligt drijfhout.',
      luister: () => 'Meeuwen. De branding, ver weg. Ergens blaft een zeehond.',
      ruik: () => 'Zout, wier en vis.',
      voel: () => 'De wind komt van zee. Het zand is koel en nat.',
    },
    look: {
      zee: () => 'Grijsgroen water. Ver weg breken golven. Het water staat laag.',
      strand: () => 'Breed en nat. Een streep zeewier ligt tot vlak voor de duinen.',
      wier: () => 'Een lange streep zeewier en schelpen, hoog op het strand, vlak voor de duinen.',
      duin: () => 'Zandheuvels met helmgras. Daarachter ligt een beschutte kom.',
      kom: () => 'Een kom tussen de duinen. Er staat water tussen het riet.',
      kreek: () => 'Een kronkelende geul in de kwelder. Visjes, en een aal die zich onder een pol gras verstopt.',
      kwelder: () => 'Gras en kreken. Het gras is nat en er ligt slib op.',
    },
    smell: { kom: () => 'Het water in de kom ruikt naar riet, niet naar zout.', zee: () => 'Zout.' },
    feel: { kom: () => 'Het water in de kom is zoet.', zee: () => 'Zout op de lippen.', water: () => 'Welk water? Er is zeewater, het water in de kreek en het water in de kom.' },
    handle(c, x) {
      const sensing = ['kijk', 'luister', 'ruik', 'voel', 'wacht', 'zoek', 'verken'];
      if (sensing.includes(c.verb)) return false;
      if (c.verb === 'drink' && c.objs.includes('kom')) { say(x, sv(x.actors, 'drinkt', 'drinken', 'uit de kom. Het water is zoet.')); return true; }
      x.planCmds.push(Object.assign({}, c, { actorsFinal: x.actors.slice() }));
      return true;
    },
    afterTurn(x) {
      if (x.planCmds.length) evaluatePlan(x);
    },
  };

  function evaluatePlan(x) {
    const G = x.G;
    const cmds = x.planCmds;
    const tasks = { ura: [], keb: [], sela: [], tiko: [] };
    const res = {};
    const loc = (c) => c.objs.includes('duin') ? 'duin' : c.objs.includes('kom') || c.mods.has('fresh') ? 'kom' : c.objs.includes('kreek') ? 'kreek' : c.objs.includes('zee') ? 'zee' : c.objs.includes('strand') ? 'strand' : c.objs.includes('kwelder') ? 'kwelder' : c.mods.has('high') ? 'duin' : null;
    let shelter = null, water = null, fuikMade = false, fuikSet = null, foodGot = [], fireMade = null, woodGot = false, idle = [];
    let allCount = 0;
    const lines = [];
    for (const c of cmds) {
      const a = c.actorsFinal;
      if (!c.actors) allCount++;
      a.forEach(id => tasks[id].push(c.verb));
      if ((c.verb === 'maak' || c.verb === 'plaats') && c.objs.includes('hut')) shelter = { at: loc(c) || 'strand', a };
      else if ((c.verb === 'drink' || c.verb === 'vul') || ((c.verb === 'pak' || c.verb === 'draag') && (c.objs.includes('water') || c.objs.includes('waterzak') || c.objs.includes('kom')))) water = { at: loc(c) || 'zee', a };
      else if (c.verb === 'maak' && c.objs.includes('fuik')) fuikMade = true;
      else if ((c.verb === 'plaats' || c.verb === 'vis') && c.objs.includes('fuik')) fuikSet = { at: loc(c) || 'strand', a, made: fuikMade };
      else if (c.verb === 'vis') foodGot.push({ k: 'vis', at: loc(c) || 'zee', a });
      else if (c.verb === 'verzamel' || ((c.verb === 'pak') && (c.objs.includes('schelpen') || c.objs.includes('meeuw')))) {
        if (c.objs.includes('hout') || c.objs.includes('tenen')) woodGot = woodGot || c.objs.includes('hout');
        if (c.objs.includes('schelpen') || c.objs.includes('wier') || c.objs.includes('meeuw')) foodGot.push({ k: 'schelpen', a });
        if (c.objs.includes('hout')) woodGot = true;
      } else if (c.verb === 'jaag' && (c.objs.includes('zeehond') || c.objs.includes('aal') || c.objs.includes('meeuw'))) foodGot.push({ k: 'jacht', a, stealth: c.mods.has('stealth') || c.mods.has('careful'), what: c.objs.includes('zeehond') ? 'zeehond' : c.objs.includes('aal') ? 'aal' : 'vogels' });
      else if (c.verb === 'maak' && (c.objs.includes('vuur') || c.light)) fireMade = { a, wood: c.objs.includes('hout') };
      if (c.verb === 'plaats' && c.objs.includes('fuik') && c.verbAt >= 0 && !fuikMade) { /* fuik nog niet gemaakt */ }
    }
    // Volgorde: een fuik die nog niet gemaakt is, kan niet geplaatst worden
    PARTY.forEach(id => { if (!tasks[id].length) idle.push(id); });

    // Hut
    if (!shelter) {
      lines.push('Niemand bouwt een hut. ’s Nachts slapen ze onder de blote hemel, in de wind van zee.');
      hurt(G, 'sela', -1, x, 'koud');
      res.hut = 'mislukt';
    } else if (shelter.at === 'duin' || shelter.at === 'kom') {
      lines.push(sv(shelter.a, 'bouwt', 'bouwen', 'de hut ' + (shelter.at === 'duin' ? 'achter het duin' : 'in de kom tussen de duinen') + ', uit de wind. ’s Nachts blijft het droog.'));
      res.hut = 'gelukt';
    } else {
      lines.push(sv(shelter.a, 'bouwt', 'bouwen', 'de hut ' + (shelter.at === 'strand' ? 'op het brede strand, precies waar ze staan' : 'op de kwelder') + '. Midden in de nacht staat er water in de hut. De vloed! Bij daglicht zien ze het: de streep zeewier ligt achter hun hut.'));
      res.hut = 'mislukt';
    }
    // Water
    if (!water) {
      lines.push(G.water > 0 ? 'Niemand haalt water. Ze drinken de waterzak leeg. Morgen is er niets meer.' : 'Niemand haalt water. ’s Avonds heeft iedereen dorst.');
      res.water = G.water > 0 ? 'half' : 'mislukt';
    } else if (water.at === 'kom') {
      lines.push(sv(water.a, 'haalt', 'halen', 'water uit de kom achter de duinen. Het is zoet.'));
      res.water = 'gelukt';
    } else if (water.at === 'kreek') {
      lines.push(sv(water.a, 'haalt', 'halen', 'water uit de kreek. Het is brak: half zout, half zoet. Je kunt het drinken, maar lekker is anders.'));
      res.water = 'half';
    } else {
      lines.push(sv(water.a, 'vult', 'vullen', 'de waterzak in de zee, het dichtstbijzijnde water. Wie ervan drinkt, wordt misselijk: het is zout.'));
      water.a.forEach(id => hurt(G, id, -1, x, 'zout water'));
      res.water = 'mislukt';
    }
    // Eten
    const foodLines = [];
    let foodOk = false;
    if (fuikSet) {
      if (!fuikSet.made) foodLines.push(sv(fuikSet.a, 'zoekt', 'zoeken', 'in de bagage naar een fuik. Die is er niet. Niemand heeft er een gemaakt.'));
      else if (fuikSet.at === 'kreek') { foodLines.push('De fuik staat in de kreek. De volgende ochtend zitten er drie palingen in.'); foodOk = true; }
      else foodLines.push(sv(fuikSet.a, 'zet', 'zetten', 'de fuik ' + (fuikSet.at === 'zee' ? 'in de branding' : 'op het strand') + '. De golven nemen hem mee.'));
    } else if (fuikMade) foodLines.push('Er ligt een mooie fuik klaar. Niemand zet hem in het water.');
    for (const f of foodGot) {
      if (f.k === 'schelpen') { foodLines.push(sv(f.a, 'zoekt', 'zoeken', 'bij eb schelpen en mosselen. Een volle mand.')); foodOk = true; }
      else if (f.k === 'vis') foodLines.push(f.at === 'kreek' ? sv(f.a, 'vangt', 'vangen', 'met de hand een paar visjes in de kreek.') : sv(f.a, 'vist', 'vissen', 'in de branding. De golven zijn te wild. Niets.'));
      else if (f.k === 'jacht') {
        if (f.what === 'zeehond' && (f.a.includes('tiko') || f.a.length > 2 || !f.stealth)) foodLines.push('De zeehonden zien ' + (f.a.length > 1 ? 'ze' : who(f.a)) + ' aankomen en glijden het water in.');
        else { foodLines.push(sv(f.a, 'komt', 'komen', 'terug met ' + (f.what === 'zeehond' ? 'een zeehond. Vlees en vet voor weken' : f.what === 'aal' ? 'een paar palingen' : 'een handvol meeuweneieren') + '.')); foodOk = true; }
      }
    }
    if (!foodLines.length) foodLines.push('Niemand zoekt eten. De voorraad slinkt.');
    lines.push(foodLines.join(' '));
    res.eten = foodOk ? 'gelukt' : 'mislukt';
    // Vuur
    if (!fireMade) { lines.push('Niemand maakt vuur. De avond is koud en het eten blijft rauw.'); res.vuur = 'mislukt'; }
    else {
      const wood = fireMade.wood || woodGot;
      const canSpark = !G.tinderWet;
      if (!wood) { lines.push(sv(fireMade.a, 'probeert', 'proberen', 'een vuur te maken. Maar niemand heeft hout gehaald. Het vlammetje dooft.')); res.vuur = 'mislukt'; }
      else if (G.fire || canSpark) { lines.push(sv(fireMade.a, 'maakt', 'maken', 'een vuur van drijfhout. Het knettert en ruikt naar zout.')); res.vuur = 'gelukt'; }
      else {
        // de zon heeft de tondel inmiddels gedroogd
        lines.push(sv(fireMade.a, 'legt', 'leggen', 'de tondelzwam in de zon tot hij droog is, en ' + vb(fireMade.a, 'slaat', 'slaan') + ' dan vonken met vuursteen en pyriet. Na lang proberen brandt het drijfhout.'));
        res.vuur = 'gelukt';
      }
    }
    if (idle.length) {
      x.flags.idle = true;
      const idleText = {
        ura: 'Ura kreeg geen taak. Ze loopt de hele dag het strand op en neer.',
        keb: 'Keb kreeg geen taak. Hij zit op een duin en kijkt naar de zee.',
        sela: 'Sela kreeg geen taak. Ze wacht tot iemand haar iets vraagt.',
        tiko: 'Tiko kreeg geen taak. Hij speelt de hele dag in de branding.',
      };
      lines.push(idle.map(id => idleText[id]).join(' '));
    }
    if (allCount >= 2) lines.push('Bijna alles doen ze met z’n vieren, één ding tegelijk. Pas laat in de avond is alles klaar.');
    say(x, lines.join('\n'));
    const ok = Object.values(res).filter(v => v === 'gelukt').length;
    G.over = {
      type: ok === 4 ? 'win' : ok >= 2 ? 'half' : 'lose',
      title: ok === 4 ? 'Het zomerkamp staat' : ok >= 2 ? 'Een wankel zomerkamp' : 'Een zware zomer',
      text: ok === 4 ? 'De groep heeft een droge hut, zoet water, eten en vuur. Ze kunnen de hele zomer aan de kust blijven.' : ok >= 2 ? 'De groep blijft aan de kust, maar niet alles gaat zoals jij bedoelde.' : 'De groep heeft het zwaar aan de kust. Weinig van het plan werkte zoals jij bedoelde.',
      parts: res,
      final: true,
    };
    x.noTime = true;
  }

  /* ------------------------------------------------------------------ */
  /* Verder trekken                                                       */
  /* ------------------------------------------------------------------ */

  function exit(x, c, detour) {
    const G = x.G;
    const sc = x.scene;
    x.flags.exited = true;
    const fast = c && c.mods.has('fast');
    const slow = c && (c.mods.has('careful') && !c.mods.has('stealth'));
    let cost = 3;
    if (fast) cost = 2;
    if (slow) cost = 5;
    cost += detour || 0;
    const leg = [sc.exitText];
    if (fast) leg.push('Ze lopen snel. Sela en Tiko hebben moeite om bij te blijven.');
    if (slow) leg.push('Ze nemen de tijd en rusten vaak.');
    say(x, leg.join(' '), 'leg');
    if (sc.legTo === 'evening') {
      // naar de avond van dezelfde of de volgende dag
      let n = 1;
      while ((G.t + n) % 3 !== 2) n++;
      if (n < 2) n += 3;
      advance(G, n, x);
    } else advance(G, cost, x);
    if (fast) { hurt(G, 'sela', -1, x, 'moe'); hurt(G, 'tiko', -1, x, 'moe'); }
    if (slow) PARTY.forEach(id => { if (G.hp[id] < MAX_HP) hurt(G, id, 1, x, 'uitgerust'); });
    checkOver(G, x);
    x.noTime = true;
    if (G.over) return;
    G.sceneIdx++;
    G.sceneId = SCENE_ORDER[G.sceneIdx];
    enterScene(G, x);
  }

  /* ------------------------------------------------------------------ */
  /* Een beurt                                                            */
  /* ------------------------------------------------------------------ */

  function turn(G, text) {
    if (G.over) return null;
    const scene = SCENES[G.sceneId];
    const parsed = parse(text, scene);
    const x = { G, ss: G.ss, scene, out: [], fx: [], flags: { executed: 0 }, planCmds: [], actors: null };
    const when = 'Dag ' + day(G) + ' · ' + part(G);
    G.stats.turns++;
    G.ss.turns++;

    // Afspraken (als ... dan ...)
    for (const r of parsed.rules) {
      G.stats.rules++;
      if (!r.trigger) {
        say(x, 'De groep onthoudt je afspraak, maar weet niet wanneer ‘' + r.cond + '’ is.', 'rule');
        x.flags.ruleUnknown = r.cond;
      } else {
        G.ss.rules.push(r);
        x.flags.executed++;
        say(x, 'Afspraak: als ' + r.cond + ', dan ' + (r.cmds.map(c => c.raw).join(', ') || '…') + '.', 'rule');
        if (!r.cmds.some(c => c.verb)) x.flags.ruleEmpty = true;
      }
    }

    let stop = false;
    for (const s of parsed.sentences) {
      if (stop) break;
      if (s.question) {
        G.stats.questions++;
        say(x, 'Ura kijkt je aan en haalt haar schouders op. Deze groep antwoordt met wat ze doen, niet met woorden.');
        x.flags.question = true;
        continue;
      }
      let skipAlt = false;
      for (let k = 0; k < s.cmds.length; k++) {
        const c = s.cmds[k];
        if (G.over || x.flags.exited) { stop = true; break; }
        if (c.anach.length) {
          c.anach.forEach(w => { G.stats.anach[w.toLowerCase()] = (G.stats.anach[w.toLowerCase()] || 0) + 1; });
          const w = c.anach[0];
          if (!(scene.onAnach && scene.onAnach(c, x, w))) {
            const who1 = PEOPLE[PARTY[(G.stats.turns + k) % 3]].name;
            say(x, 'Bij het woord ‘' + w + '’ fronst ' + who1 + '. Dat woord kent niemand hier.');
          }
          x.flags.anach = true;
        }
        if (c.vague.length) c.vague.forEach(w => { G.stats.vague[w.toLowerCase()] = (G.stats.vague[w.toLowerCase()] || 0) + 1; });
        if (c.statement) {
          if (!c.anach.length) { G.stats.statements++; x.flags.statement = x.flags.statement || c.raw; }
          continue;
        }
        if (c.reason) { G.stats.statements++; x.flags.reason = c.raw; continue; }
        if (c.you) {
          say(x, 'Je zegt ‘je’. Wie bedoel je? Ze kijken elkaar aan. Niemand voelt zich aangesproken.');
          x.flags.you = true;
          continue;
        }
        if (s.cmds[k + 1] && s.cmds[k + 1].alt) {
          say(x, 'De groep aarzelt: ‘' + c.raw + '’ of ‘' + s.cmds[k + 1].raw + '’? Ze doen geen van beide.');
          x.flags.alt = true;
          k++;
          continue;
        }
        x.actors = c.actors ? c.actors.slice() : PARTY.slice();
        if (!c.actors) x.flags.implicitAll = (x.flags.implicitAll || 0) + 1;
        if (c.vague.length && !c.objs.length && !c.dir && NEEDS_OBJ.has(c.verb)) {
          say(x, sv(x.actors, 'kijkt', 'kijken', 'om zich heen. ‘' + c.vague[0] + '’? Wat bedoel je?'));
          x.flags.vague = c.vague[0];
          continue;
        }
        if (c.vague.length && ['loop', 'ren', 'sluip'].includes(c.verb) && !c.objs.length && !c.dir) {
          say(x, sv(x.actors, 'kijkt', 'kijken', 'je aan. ‘' + c.vague[0] + '’? Welke kant bedoel je?'));
          x.flags.vague = c.vague[0];
          continue;
        }
        const handled = (scene.handle && scene.handle(c, x)) || generic(c, x);
        if (handled) { x.flags.executed++; (x.done = x.done || []).push(c.verb + (c.objs.length ? ':' + c.objs[0] : '')); }
      }
    }
    if (!x.flags.executed && !x.out.some(o => o.k === 'act') && scene !== SCENES.kust) {
      if (!parsed.sentences.length) say(x, 'De groep wacht.');
      else if (!x.flags.question && !x.flags.you && !x.flags.alt) say(x, 'De groep kijkt je aan. Niemand weet wat hij moet doen.');
    }
    if (x.done && x.done.every(d => d === 'kijk')) x.flags.lookOnly = true;
    if (scene.afterTurn && !x.flags.exited && !G.over) scene.afterTurn(x);
    if (!x.noTime && !scene.timeless && !G.over && !x.flags.exited) advance(G, 1 + (x.extraTime || 0), x);
    if (scene.timeless && x.extraTime && !G.over) x.ss.left = Math.max(0, x.ss.left - x.extraTime);
    checkOver(G, x);

    const entry = {
      n: G.stats.turns,
      when,
      input: text,
      tokens: parsed.toks.map(t => ({ raw: t.raw, c: t.c })),
      out: x.out,
      fx: x.fx,
      spiegel: spiegel(parsed, x),
      scene: scene.title,
    };
    G.log.push(entry);
    return entry;
  }

  /* ------------------------------------------------------------------ */
  /* Spiegel: vragen over taal, nooit antwoorden                          */
  /* ------------------------------------------------------------------ */

  function spiegel(parsed, x) {
    const q = [];
    const f = x.flags;
    const add = (s) => { if (q.length < 2 && !q.includes(s)) q.push(s); };
    const anach = parsed.sentences.flatMap(s => s.cmds.flatMap(c => c.anach)).concat(parsed.rules.flatMap(r => r.cmds.flatMap(c => c.anach)));
    if (anach.length) add('‘' + anach[0] + '’ bestond nog niet. Welk woord uit hun eigen wereld bedoel je?');
    if (f.you) add('Je schreef ‘je’. Wie van de vier moest het doen?');
    if (f.vague) add('Je schreef ‘' + f.vague + '’. Wat of waar bedoelde je precies?');
    if (f.ruleUnknown) add('Je schreef ‘als ' + f.ruleUnknown + '’. Waaraan kan de groep zien dat het zover is?');
    if (f.reason) add('‘' + f.reason + '’ is een reden. Wat moest de groep met die reden dóen?');
    if (f.statement) add('‘' + f.statement + '’ is geen opdracht. Wat moest er gebeuren?');
    if (f.question) add('Je stelde een vraag. Welke opdracht helpt je het antwoord zelf te zien?');
    if (f.alt) add('Je gaf twee keuzes. Wie kiest er nu?');
    if (f.missingObj) add('Er stond wel wat ze moesten doen, maar niet waarmee of met wat. Welk woord ontbrak?');
    if (f.noDirection) add('Waarheen? Welk woord vertelt de groep de richting?');
    if (f.actorMatters || (f.implicitAll && f.bad)) add('Je noemde niemand, dus deed iedereen mee. Was dat de bedoeling?');
    if (f.vagueDir) add('Links of rechts van wat? Hoe zeg je een richting die niet afhangt van waar iemand staat?');
    if (f.ruleEmpty) add('Je afspraak zegt wanneer, maar niet wat ze dan moeten doen.');
    if (!f.executed && !q.length && x.scene !== SCENES.kust) add('Geen enkel woord werd een handeling. Met welk woord begint een opdracht?');
    if (x.G.over && x.G.over.parts) {
      const P = x.G.over.parts;
      if (P.hut !== 'gelukt') add('Waar moest de hut komen? Stond die plek in je plan?');
      if (P.water !== 'gelukt') add('Welk water bedoelde je? Hoe weet de groep welk water jij bedoelt?');
      if (P.eten !== 'gelukt') add('Wie moest voor eten zorgen, waarmee en waar?');
      if (P.vuur !== 'gelukt') add('Wat is er allemaal nodig voor een vuur? Stond dat in je plan?');
      if (x.flags.idle) add('Wie kreeg geen taak? Hoe had je dat kunnen zien aan je eigen plan?');
      if (!q.length) add('Alles werkte. Welke zin in je plan was het preciest?');
      return q;
    }
    if (f.lookOnly && !q.length && x.scene !== SCENES.kust) add('De groep heeft gekeken. En daarna? Wat moesten ze met wat ze zagen?');
    if (f.bad && !q.length) add('Wat gebeurde er anders dan je bedoelde? Welk woord in je opdracht zorgde daarvoor?');
    if (f.ruleFired && !q.length) add('Je afspraak werd gebruikt. Wat zou er gebeurd zijn zonder?');
    if (f.good && !q.length) add('Dit werkte. Welk woord maakte het verschil?');
    return q;
  }

  /* ------------------------------------------------------------------ */
  /* Opnieuw beginnen op deze plek                                        */
  /* ------------------------------------------------------------------ */

  function restartScene(G) {
    if (!G.checkpoint) return G;
    const log = G.log;
    const stats = G.stats;
    const cp = clone(G.checkpoint);
    const N = Object.assign(cp, { log, stats, checkpoint: G.checkpoint, over: null });
    N.log.push({ n: 0, restart: true, when: 'Dag ' + day(N) + ' · ' + part(N), scene: SCENES[N.sceneId].title, input: '', tokens: [], out: [{ k: 'scene', id: N.sceneId, title: SCENES[N.sceneId].title, text: SCENES[N.sceneId].intro(N) }], fx: [], spiegel: [] });
    return N;
  }

  function startAt(id) {
    const G = newGame();
    const i = SCENE_ORDER.indexOf(id);
    if (i <= 0) return G;
    // Een redelijke uitgangssituatie voor een losse les
    const t = { spoor: 4, rivier: 10, nacht: 17, kust: 24 }[id];
    G.t = t; G.sceneIdx = i; G.sceneId = id;
    G.food = { spoor: 5, rivier: 7, nacht: 6, kust: 4 }[id];
    G.water = 2;
    G.tinderWet = id === 'spoor';
    G.fire = id === 'nacht' || id === 'kust' ? false : false;
    const x = { G, out: [], fx: [], flags: {} };
    enterScene(G, x);
    G.log.push({ n: 0, restart: true, when: 'Dag ' + day(G) + ' · ' + part(G), scene: SCENES[id].title, input: '', tokens: [], out: x.out, fx: [], spiegel: [] });
    return G;
  }

  function status(G) {
    return {
      day: day(G), part: part(G), deadline: DEADLINE_DAY, food: G.food, water: G.water, fire: G.fire, torch: G.torch >= 0,
      tinderWet: G.tinderWet, hp: Object.assign({}, G.hp), scene: G.sceneId, sceneIdx: G.sceneIdx, title: SCENES[G.sceneId].title,
      intro: SCENES[G.sceneId].intro(G), over: G.over,
    };
  }

  function report(G) {
    const lines = [];
    lines.push('OERTOCHT — logboek');
    lines.push('');
    for (const e of G.log) {
      if (e.restart) { lines.push('— Opnieuw begonnen: ' + e.scene + ' —'); lines.push(''); continue; }
      lines.push('[' + e.n + '] ' + e.scene + ' · ' + e.when);
      lines.push('Opdracht: ' + e.input.replace(/\n/g, ' / '));
      for (const o of e.out) if (o.k !== 'scene') lines.push('  ' + o.text.replace(/\n/g, ' '));
      if (e.fx.length) lines.push('  (' + e.fx.map(f => f.label).join(', ') + ')');
      if (e.spiegel.length) lines.push('  Spiegel: ' + e.spiegel.join(' | '));
      lines.push('');
    }
    const an = Object.keys(G.stats.anach);
    lines.push('Beurten: ' + G.stats.turns);
    lines.push('Woorden die de groep niet kende: ' + (an.length ? an.join(', ') : 'geen'));
    lines.push('Vage woorden: ' + (Object.keys(G.stats.vague).join(', ') || 'geen'));
    lines.push('Afspraken (als … dan …): ' + G.stats.rules + ', waarvan ' + G.stats.rulesFired + ' gebruikt');
    if (G.over) lines.push('Einde: ' + G.over.title + '. ' + G.over.text);
    return lines.join('\n');
  }

  return {
    PARTY, PEOPLE, SCENES, SCENE_ORDER, DEADLINE_DAY, MAX_HP,
    newGame, startAt, turn, parse, status, restartScene, report,
    _internal: { tokenize, fold },
  };
});
