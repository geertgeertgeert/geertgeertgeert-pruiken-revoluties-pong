/*
 * store.js — de datalaag van de kapstok.
 *
 * Twee modi, achter dezelfde functies:
 *
 *   'supabase' — er staat een URL en anon key in config.js. De kapstok is dan
 *                openbaar: iedereen kan zonder account lezen, toevoegen en de
 *                tekst bewerken. Beheerders melden zich aan met een inloglink
 *                per e-mail.
 *   'demo'     — geen instellingen ingevuld. Alles wordt in de eigen browser
 *                bewaard (localStorage), zodat de tool meteen te proberen is.
 *
 * Geen externe bibliotheken: de Supabase-API wordt met fetch aangesproken.
 */
(function (root) {
  'use strict';

  var cfg = root.KAPSTOK_CONFIG || {};
  var SESSIE_SLEUTEL = 'kapstok.sessie';
  var DEMO_SLEUTEL = 'kapstok.demo';
  var STANDAARD_HAKEN = [1, 2, 3, 4, 5, 6].map(function (id) {
    return { id: id, naam: 'Haakje ' + id };
  });

  var modus = cfg.supabaseUrl && cfg.supabaseAnonKey ? 'supabase' : 'demo';
  var sessie = null;
  var beheerder = false;
  var demoBeheerder = false;
  var luisteraars = [];

  /* ------------------------------------------------------------- hulpmiddel */

  function Fout(bericht, oorzaak) {
    var e = new Error(bericht);
    e.naam = 'KapstokFout';
    e.oorzaak = oorzaak;
    return e;
  }

  function lokaalLees(sleutel, standaard) {
    try {
      var ruw = localStorage.getItem(sleutel);
      return ruw ? JSON.parse(ruw) : standaard;
    } catch (e) {
      return standaard;
    }
  }

  function lokaalSchrijf(sleutel, waarde) {
    try {
      localStorage.setItem(sleutel, JSON.stringify(waarde));
      return true;
    } catch (e) {
      return false;
    }
  }

  function meld() {
    luisteraars.forEach(function (cb) {
      try { cb(); } catch (e) { /* een kapotte luisteraar mag de rest niet breken */ }
    });
  }

  /* ------------------------------------------------------------ demo-opslag */

  function demoLees() {
    var d = lokaalLees(DEMO_SLEUTEL, null);
    if (!d || !Array.isArray(d.haken) || !Array.isArray(d.zinnen)) {
      d = { haken: STANDAARD_HAKEN.map(function (h) { return { id: h.id, naam: h.naam }; }), zinnen: [] };
    }
    return d;
  }

  function demoSchrijf(d) {
    if (!lokaalSchrijf(DEMO_SLEUTEL, d)) {
      throw Fout('Deze browser bewaart niets (privémodus?). In demomodus gaat je invoer daardoor verloren.');
    }
    meld();
  }

  function nieuwId() {
    if (root.crypto && root.crypto.randomUUID) return root.crypto.randomUUID();
    return 'z-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  /* ----------------------------------------------------------- supabase api */

  function bewaarSessie(s) {
    sessie = s;
    if (s) lokaalSchrijf(SESSIE_SLEUTEL, s);
    else { try { localStorage.removeItem(SESSIE_SLEUTEL); } catch (e) {} }
  }

  function token() {
    return (sessie && sessie.access_token) || cfg.supabaseAnonKey;
  }

  async function vernieuwSessie() {
    if (!sessie || !sessie.refresh_token) return false;
    var r = await fetch(cfg.supabaseUrl + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { apikey: cfg.supabaseAnonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: sessie.refresh_token }),
    });
    if (!r.ok) { bewaarSessie(null); beheerder = false; return false; }
    var data = await r.json();
    bewaarSessie({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      verloopt_op: Date.now() + (data.expires_in || 3600) * 1000,
    });
    return true;
  }

  async function rest(pad, opties, tweedePoging) {
    opties = opties || {};
    var koppen = {
      apikey: cfg.supabaseAnonKey,
      Authorization: 'Bearer ' + token(),
    };
    if (opties.body) koppen['Content-Type'] = 'application/json';
    Object.keys(opties.koppen || {}).forEach(function (k) { koppen[k] = opties.koppen[k]; });

    var antwoord;
    try {
      antwoord = await fetch(cfg.supabaseUrl + '/rest/v1/' + pad, {
        method: opties.method || 'GET',
        headers: koppen,
        body: opties.body ? JSON.stringify(opties.body) : undefined,
      });
    } catch (e) {
      throw Fout('Geen verbinding met de database. Controleer je internetverbinding.', e);
    }

    if (antwoord.status === 401 && sessie && !tweedePoging) {
      if (await vernieuwSessie()) return rest(pad, opties, true);
    }
    if (!antwoord.ok) {
      var uitleg = '';
      try { uitleg = (await antwoord.json()).message || ''; } catch (e) {}
      if (antwoord.status === 401 || antwoord.status === 403) {
        throw Fout(uitleg || 'Daar heb je geen rechten voor.');
      }
      throw Fout(uitleg || 'De database gaf een fout (' + antwoord.status + ').');
    }
    if (antwoord.status === 204) return null;
    var tekst = await antwoord.text();
    return tekst ? JSON.parse(tekst) : null;
  }

  function rpc(naam, argumenten) {
    return rest('rpc/' + naam, { method: 'POST', body: argumenten || {} });
  }

  async function controleerBeheerder() {
    if (!sessie) { beheerder = false; return false; }
    try {
      var rijen = await rest('beheerders?select=gebruiker_id&limit=1');
      beheerder = Array.isArray(rijen) && rijen.length > 0;
    } catch (e) {
      beheerder = false;
    }
    return beheerder;
  }

  /* ------------------------------------------------------------------- api */

  var store = {
    get modus() { return modus; },
    get isBeheerder() { return modus === 'demo' ? demoBeheerder : beheerder; },
    get isAangemeld() { return modus === 'demo' ? demoBeheerder : !!sessie; },
    maxTekens: cfg.maxTekens || 280,

    async init() {
      if (modus === 'demo') return;
      var opgeslagen = lokaalLees(SESSIE_SLEUTEL, null);
      if (opgeslagen && opgeslagen.access_token) {
        sessie = opgeslagen;
        if (opgeslagen.verloopt_op && opgeslagen.verloopt_op < Date.now() + 60000) {
          await vernieuwSessie();
        }
        await controleerBeheerder();
      }
    },

    // Haalt de inloggegevens uit een aanmeldlink (#access_token=...) en ruimt
    // de adresbalk op. Geeft true terug als er een aanmelding is verwerkt.
    async verwerkAanmeldlink() {
      if (modus !== 'supabase') return false;
      var hash = root.location.hash.replace(/^#/, '');
      if (hash.indexOf('access_token=') === -1) {
        if (hash.indexOf('error_description=') !== -1) {
          var p = new URLSearchParams(hash);
          schoonAdresbalk();
          throw Fout(p.get('error_description') || 'De inloglink werkte niet.');
        }
        return false;
      }
      var params = new URLSearchParams(hash);
      bewaarSessie({
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        verloopt_op: Date.now() + (Number(params.get('expires_in')) || 3600) * 1000,
      });
      schoonAdresbalk();
      await controleerBeheerder();
      return true;
    },

    async vraagInloglink(email) {
      if (modus === 'demo') {
        demoBeheerder = true;
        meld();
        return { demo: true };
      }
      var doel = root.location.origin + root.location.pathname;
      var r = await fetch(
        cfg.supabaseUrl + '/auth/v1/otp?redirect_to=' + encodeURIComponent(doel),
        {
          method: 'POST',
          headers: { apikey: cfg.supabaseAnonKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, create_user: false }),
        }
      );
      if (!r.ok) {
        var uitleg = '';
        try {
          var body = await r.json();
          uitleg = body.msg || body.message || body.error_description || '';
        } catch (e) { /* geen leesbaar antwoord */ }
        throw Fout(uitleg || 'Versturen van de inloglink mislukte. Is dit e-mailadres bekend als beheerder?');
      }
      return { demo: false };
    },

    async logUit() {
      if (modus === 'demo') { demoBeheerder = false; meld(); return; }
      if (sessie) {
        try {
          await fetch(cfg.supabaseUrl + '/auth/v1/logout', {
            method: 'POST',
            headers: { apikey: cfg.supabaseAnonKey, Authorization: 'Bearer ' + token() },
          });
        } catch (e) { /* uitloggen mag nooit blijven hangen */ }
      }
      bewaarSessie(null);
      beheerder = false;
      meld();
    },

    /* ------------------------------------------------------------- lezen */

    async haal() {
      if (modus === 'demo') {
        var d = demoLees();
        return {
          haken: d.haken.slice().sort(function (a, b) { return a.id - b.id; }),
          zinnen: d.zinnen.filter(function (z) { return demoBeheerder || !z.verborgen; }),
        };
      }
      var uitkomst = await Promise.all([
        rest('haken?select=id,naam&order=id.asc'),
        rest('zinnen?select=id,haak_id,tekst,verborgen,aangemaakt_op,bijgewerkt_op,bewerkingen&order=aangemaakt_op.asc'),
      ]);
      var haken = uitkomst[0] && uitkomst[0].length ? uitkomst[0] : STANDAARD_HAKEN;
      return { haken: haken, zinnen: uitkomst[1] || [] };
    },

    /* --------------------------------------------------- iedereen mag dit */

    async voegToe(haakId, tekst) {
      tekst = String(tekst).trim();
      if (!tekst) throw Fout('Er staat nog geen tekst in het vakje.');
      if (tekst.length > store.maxTekens) {
        throw Fout('Dat is te lang: hou het bij maximaal ' + store.maxTekens + ' tekens.');
      }
      if (modus === 'demo') {
        var d = demoLees();
        d.zinnen.push({
          id: nieuwId(), haak_id: Number(haakId), tekst: tekst, verborgen: false,
          aangemaakt_op: new Date().toISOString(), bijgewerkt_op: new Date().toISOString(),
          bewerkingen: 0,
        });
        demoSchrijf(d);
        return;
      }
      await rest('zinnen', {
        method: 'POST',
        body: { haak_id: Number(haakId), tekst: tekst },
        koppen: { Prefer: 'return=minimal' },
      });
      meld();
    },

    async bewerk(id, tekst) {
      tekst = String(tekst).trim();
      if (!tekst) throw Fout('Een zin mag niet leeg zijn. Laat de oude tekst staan of vraag de beheerder hem weg te halen.');
      if (tekst.length > store.maxTekens) {
        throw Fout('Dat is te lang: hou het bij maximaal ' + store.maxTekens + ' tekens.');
      }
      if (modus === 'demo') {
        var d = demoLees();
        var z = d.zinnen.find(function (x) { return x.id === id; });
        if (!z) throw Fout('Deze zin bestaat niet meer.');
        if (z.tekst !== tekst) {
          z.tekst = tekst;
          z.bijgewerkt_op = new Date().toISOString();
          z.bewerkingen = (z.bewerkingen || 0) + 1;
        }
        demoSchrijf(d);
        return;
      }
      await rest('zinnen?id=eq.' + encodeURIComponent(id), {
        method: 'PATCH',
        body: { tekst: tekst },
        koppen: { Prefer: 'return=minimal' },
      });
      meld();
    },

    /* ------------------------------------------------- alleen de beheerder */

    async verberg(id, verborgen) {
      if (!store.isBeheerder) throw Fout('Alleen de beheerder kan zinnen weghalen.');
      if (modus === 'demo') {
        var d = demoLees();
        var z = d.zinnen.find(function (x) { return x.id === id; });
        if (z) z.verborgen = !!verborgen;
        demoSchrijf(d);
        return;
      }
      await rpc('verberg_zin', { p_id: id, p_verborgen: !!verborgen });
      meld();
    },

    async verwijderDefinitief(id) {
      if (!store.isBeheerder) throw Fout('Alleen de beheerder kan zinnen definitief verwijderen.');
      if (modus === 'demo') {
        var d = demoLees();
        d.zinnen = d.zinnen.filter(function (x) { return x.id !== id; });
        demoSchrijf(d);
        return;
      }
      await rpc('verwijder_zin_definitief', { p_id: id });
      meld();
    },

    async hernoemHaak(id, naam) {
      if (!store.isBeheerder) throw Fout('Alleen de beheerder kan een haakje hernoemen.');
      naam = String(naam).trim();
      if (!naam || naam.length > 40) throw Fout('Een haaknaam is 1 tot 40 tekens lang.');
      if (modus === 'demo') {
        var d = demoLees();
        var h = d.haken.find(function (x) { return x.id === Number(id); });
        if (h) h.naam = naam;
        demoSchrijf(d);
        return;
      }
      await rpc('hernoem_haak', { p_id: Number(id), p_naam: naam });
      meld();
    },

    /* ----------------------------------------------------------- wijziging */

    opWijziging(cb) {
      luisteraars.push(cb);
      return function () {
        luisteraars = luisteraars.filter(function (x) { return x !== cb; });
      };
    },

    melding: meld,
  };

  function schoonAdresbalk() {
    try {
      root.history.replaceState(null, '', root.location.pathname + root.location.search);
    } catch (e) {
      root.location.hash = '';
    }
  }

  root.KapstokStore = store;
})(typeof globalThis !== 'undefined' ? globalThis : this);
