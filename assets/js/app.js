/*
 * app.js — de kapstok tekenen en bedienen.
 *
 * Alle tekst van bezoekers wordt met textContent in de pagina gezet, nooit met
 * innerHTML: de kapstok is openbaar, dus invoer van derden mag geen opmaak of
 * code kunnen injecteren.
 */
(function () {
  'use strict';

  var cfg = window.KAPSTOK_CONFIG || {};
  var store = window.KapstokStore;
  var AANTAL_HAKEN = 6;
  var VERVERS_MS = 10000;

  var staat = {
    haken: [],
    zinnen: [],
    gekozen: 1,
    bewerkt: null,      // id van de zin die open staat in de bewerkstand
    bezig: false,
    qrPerHaak: false,
  };

  /* ------------------------------------------------------------ hulpmiddel */

  function $(kiezer) { return document.querySelector(kiezer); }

  // Bouwt een element. Tekst gaat altijd via textContent.
  function el(naam, eigenschappen, kinderen) {
    var n = document.createElement(naam);
    Object.keys(eigenschappen || {}).forEach(function (k) {
      var v = eigenschappen[k];
      if (v == null || v === false) return;
      if (k === 'tekst') n.textContent = v;
      else if (k === 'klasse') n.className = v;
      else if (k === 'bij') Object.keys(v).forEach(function (e) { n.addEventListener(e, v[e]); });
      else n.setAttribute(k, v === true ? '' : String(v));
    });
    (kinderen || []).forEach(function (kind) {
      if (kind == null || kind === false) return;
      n.appendChild(typeof kind === 'string' ? document.createTextNode(kind) : kind);
    });
    return n;
  }

  function haakNaam(id) {
    var h = staat.haken.find(function (x) { return Number(x.id) === Number(id); });
    return (h && h.naam) || 'Haakje ' + id;
  }

  function zinnenVan(id, metVerborgen) {
    return staat.zinnen.filter(function (z) {
      return Number(z.haak_id) === Number(id) && (metVerborgen || !z.verborgen);
    });
  }

  function meervoud(n, enkel, meer) {
    return n + ' ' + (n === 1 ? enkel : meer);
  }

  function kort(tekst, lengte) {
    tekst = String(tekst).replace(/\s+/g, ' ').trim();
    return tekst.length > lengte ? tekst.slice(0, lengte - 1).trimEnd() + '…' : tekst;
  }

  function datum(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  var meldingTijd = null;
  function zegt(bericht, soort) {
    var m = $('#melding');
    m.textContent = bericht;
    m.hidden = !bericht;
    if (soort) m.setAttribute('data-soort', soort); else m.removeAttribute('data-soort');
    clearTimeout(meldingTijd);
    if (bericht && soort !== 'fout') {
      meldingTijd = setTimeout(function () { m.hidden = true; m.textContent = ''; }, 6000);
    }
  }

  function foutTekst(e) {
    return (e && e.message) || 'Er ging iets mis. Probeer het nog eens.';
  }

  /* ------------------------------------------------------- de kapstok zelf */

  var ARM_SVG =
    '<path d="M2 11h20c6 0 9-2.5 9-8" fill="none" stroke="currentColor" ' +
    'stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="31" cy="2.6" r="3.4" fill="currentColor"/>';

  function bouwHaken() {
    var kapstok = $('#kapstok');
    kapstok.querySelectorAll('.haak').forEach(function (n) { n.remove(); });

    for (var i = 0; i < AANTAL_HAKEN; i++) {
      var id = i + 1;
      var zijde = i % 2 === 0 ? 'links' : 'rechts';
      var knop = el('button', {
        type: 'button',
        klasse: 'haak',
        role: 'tab',
        id: 'haak-knop-' + id,
        'data-haak': id,
        'data-zijde': zijde,
        'aria-controls': 'paneel',
        'aria-selected': 'false',
        style: '--i:' + i,
        bij: {
          click: (function (n) { return function () { kies(n); }; })(id),
          keydown: haakToets,
        },
      }, [
        (function () {
          var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          s.setAttribute('class', 'haak__arm');
          s.setAttribute('viewBox', '0 0 40 30');
          s.setAttribute('aria-hidden', 'true');
          s.innerHTML = ARM_SVG;
          return s;
        })(),
        el('span', { klasse: 'haak__kaart', id: 'haak-kaart-' + id }),
      ]);
      kapstok.appendChild(knop);
    }
  }

  function haakToets(e) {
    var richtingen = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key === 'Home') { e.preventDefault(); return kies(1, true); }
    if (e.key === 'End') { e.preventDefault(); return kies(AANTAL_HAKEN, true); }
    var stap = richtingen[e.key];
    if (!stap) return;
    e.preventDefault();
    var volgende = ((staat.gekozen - 1 + stap + AANTAL_HAKEN) % AANTAL_HAKEN) + 1;
    kies(volgende, true);
  }

  function tekenHaken() {
    for (var id = 1; id <= AANTAL_HAKEN; id++) {
      var knop = document.getElementById('haak-knop-' + id);
      var kaart = document.getElementById('haak-kaart-' + id);
      if (!knop || !kaart) continue;

      var zichtbaar = zinnenVan(id, false);
      var gekozen = Number(staat.gekozen) === id;
      knop.setAttribute('aria-selected', gekozen ? 'true' : 'false');
      knop.tabIndex = gekozen ? 0 : -1;
      knop.setAttribute(
        'aria-label',
        haakNaam(id) + ', ' + meervoud(zichtbaar.length, 'zin', 'zinnen')
      );

      kaart.textContent = '';
      kaart.appendChild(el('span', { klasse: 'haak__naam', tekst: haakNaam(id) }));
      kaart.appendChild(el('span', {
        klasse: 'haak__teller',
        tekst: zichtbaar.length ? meervoud(zichtbaar.length, 'zin', 'zinnen') : 'nog leeg',
      }));

      if (zichtbaar.length) {
        var lijst = el('ul', { klasse: 'haak__mini', 'aria-hidden': 'true' });
        lijst.appendChild(el('li', { tekst: kort(zichtbaar[zichtbaar.length - 1].tekst, 24) }));
        kaart.appendChild(lijst);
      }
    }
  }

  /* --------------------------------------------------------------- paneel */

  function tekenPaneel() {
    var id = staat.gekozen;
    var zichtbaar = zinnenVan(id, false);
    var archief = store.isBeheerder ? zinnenVan(id, true).filter(function (z) { return z.verborgen; }) : [];

    $('#paneel-kop').textContent = haakNaam(id);
    $('#paneel-teller').textContent =
      zichtbaar.length ? meervoud(zichtbaar.length, 'zin of woord', 'zinnen en woorden') : 'nog niets opgehangen';

    var lijf = $('#paneel-lijf');
    lijf.textContent = '';

    if (!zichtbaar.length) {
      lijf.appendChild(el('p', {
        klasse: 'leeg',
        tekst: 'Aan dit haakje hangt nog niets. Wees de eerste.',
      }));
    } else {
      var lijst = el('ul', { klasse: 'zin-lijst' });
      zichtbaar.forEach(function (z) { lijst.appendChild(zinRegel(z)); });
      lijf.appendChild(lijst);
    }

    lijf.appendChild(toevoegVorm(id));

    if (archief.length) {
      var blok = el('div', { klasse: 'beheer-blok' }, [
        el('h3', { tekst: 'Weggehaald aan dit haakje' }),
        el('p', { tekst: 'Alleen jij ziet dit. Je kunt een zin terugzetten of definitief verwijderen.' }),
      ]);
      var al = el('ul', { klasse: 'zin-lijst' });
      archief.forEach(function (z) { al.appendChild(zinRegel(z)); });
      blok.appendChild(al);
      lijf.appendChild(blok);
    }
  }

  function zinRegel(z) {
    if (staat.bewerkt === z.id) return bewerkRegel(z);

    var acties = el('span', { klasse: 'zin__acties' });

    if (!z.verborgen) {
      acties.appendChild(el('button', {
        type: 'button', klasse: 'knop knop--klein',
        'aria-label': 'Tekst bewerken: ' + kort(z.tekst, 40),
        tekst: 'Bewerken',
        bij: { click: function () { staat.bewerkt = z.id; tekenPaneel(); richtOp('bewerk-veld'); } },
      }));
    }

    if (store.isBeheerder) {
      if (z.verborgen) {
        acties.appendChild(el('button', {
          type: 'button', klasse: 'knop knop--klein', tekst: 'Terugzetten',
          bij: { click: function () { doe(function () { return store.verberg(z.id, false); }, 'Teruggezet aan de kapstok.'); } },
        }));
        acties.appendChild(el('button', {
          type: 'button', klasse: 'knop knop--klein', tekst: 'Definitief weg',
          bij: {
            click: function () {
              if (!confirm('Deze zin definitief verwijderen? Dit kan niet ongedaan worden gemaakt.\n\n' + z.tekst)) return;
              doe(function () { return store.verwijderDefinitief(z.id); }, 'Definitief verwijderd.');
            },
          },
        }));
      } else {
        acties.appendChild(el('button', {
          type: 'button', klasse: 'knop knop--klein knop--accent', tekst: 'Weghalen',
          bij: { click: function () { doe(function () { return store.verberg(z.id, true); }, 'Weggehaald. Je kunt hem hieronder terugzetten.'); } },
        }));
      }
    }

    var meta = 'Opgehangen ' + datum(z.aangemaakt_op);
    if (z.bewerkingen) meta += ' · ' + meervoud(z.bewerkingen, 'keer bijgeschaafd', 'keer bijgeschaafd');
    if (z.verborgen) meta = 'Weggehaald · ' + meta.toLowerCase();

    return el('li', { klasse: 'zin', 'data-verborgen': z.verborgen ? 'true' : 'false' }, [
      el('p', { klasse: 'zin__tekst' }, [
        document.createTextNode(z.tekst),
        el('span', { klasse: 'zin__meta', tekst: meta }),
      ]),
      acties,
    ]);
  }

  function bewerkRegel(z) {
    var veld = el('textarea', {
      id: 'bewerk-veld',
      maxlength: store.maxTekens,
      'aria-label': 'Tekst van deze zin',
    });
    veld.value = z.tekst;

    var teller = el('span', { klasse: 'teller' });
    function werkTellerBij() {
      var over = store.maxTekens - veld.value.length;
      teller.textContent = over + ' tekens over';
      teller.setAttribute('data-vol', over <= 20 ? 'true' : 'false');
    }
    veld.addEventListener('input', werkTellerBij);
    werkTellerBij();

    function opslaan() {
      var nieuw = veld.value;
      doe(function () { return store.bewerk(z.id, nieuw); }, 'Bijgewerkt. Dank je.', function () {
        staat.bewerkt = null;
      });
    }

    veld.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { staat.bewerkt = null; tekenPaneel(); }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); opslaan(); }
    });

    return el('li', { klasse: 'zin' }, [
      el('div', { klasse: 'zin__vorm' }, [
        veld,
        el('div', { klasse: 'toevoegen__rij' }, [
          teller,
          el('span', { klasse: 'zin__acties' }, [
            el('button', { type: 'button', klasse: 'knop knop--vol', tekst: 'Opslaan', bij: { click: opslaan } }),
            el('button', {
              type: 'button', klasse: 'knop', tekst: 'Annuleren',
              bij: { click: function () { staat.bewerkt = null; tekenPaneel(); } },
            }),
          ]),
        ]),
        el('p', {
          klasse: 'teller',
          tekst: 'Je past de bestaande tekst aan. Verwijderen kan alleen de beheerder.',
        }),
      ]),
    ]);
  }

  function toevoegVorm(haakId) {
    var veld = el('textarea', {
      id: 'toevoeg-veld',
      maxlength: store.maxTekens,
      placeholder: 'Typ een zin of een woord…',
      'aria-label': 'Nieuwe zin voor ' + haakNaam(haakId),
    });

    var teller = el('span', { klasse: 'teller' });
    function werkTellerBij() {
      var over = store.maxTekens - veld.value.length;
      teller.textContent = over + ' tekens over';
      teller.setAttribute('data-vol', over <= 20 ? 'true' : 'false');
    }
    veld.addEventListener('input', werkTellerBij);
    werkTellerBij();

    function versturen(e) {
      if (e) e.preventDefault();
      var tekst = veld.value;
      doe(function () { return store.voegToe(haakId, tekst); }, 'Opgehangen aan ' + haakNaam(haakId) + '.', function () {
        veld.value = '';
      });
    }

    veld.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) versturen(e);
    });

    var vorm = el('form', { klasse: 'toevoegen', bij: { submit: versturen } }, [
      el('h3', { tekst: 'Iets ophangen aan ' + haakNaam(haakId) }),
      veld,
      el('div', { klasse: 'toevoegen__rij' }, [
        teller,
        el('button', { type: 'submit', klasse: 'knop knop--vol', tekst: 'Ophangen' }),
      ]),
    ]);
    return vorm;
  }

  // Zet de cursor in een veld. Na een QR-scan komt de pagina net binnen en kan
  // de browser de focus nog een keer verzetten; daarom een tweede poging.
  function richtOp(id, pogingen) {
    requestAnimationFrame(function () {
      var n = document.getElementById(id);
      if (!n) return;
      n.focus({ preventScroll: true });
      if (n.setSelectionRange) {
        try { n.setSelectionRange(n.value.length, n.value.length); } catch (e) { /* niet elk veld kan dit */ }
      }
      if (document.activeElement !== n && (pogingen || 0) < 2) {
        setTimeout(function () { richtOp(id, (pogingen || 0) + 1); }, 60);
      }
    });
  }

  /* ------------------------------------------------------------ acties uit */

  // Voert een schrijfactie uit, houdt dubbelklikken tegen en vertelt de
  // uitkomst. `naHerstel` draait alleen bij succes, vóór het opnieuw tekenen.
  function doe(actie, geluktBericht, naHerstel) {
    if (staat.bezig) return;
    staat.bezig = true;
    Promise.resolve()
      .then(actie)
      .then(function () {
        if (naHerstel) naHerstel();
        zegt(geluktBericht, 'goed');
        return verversen();
      })
      .catch(function (e) { zegt(foutTekst(e), 'fout'); })
      .then(function () { staat.bezig = false; });
  }

  function kies(id, focus) {
    staat.gekozen = Number(id);
    staat.bewerkt = null;
    tekenHaken();
    tekenPaneel();
    if (focus) {
      var knop = document.getElementById('haak-knop-' + id);
      if (knop) knop.focus();
    }
    if (qrOpen()) tekenQr();
  }

  async function verversen() {
    var data = await store.haal();
    staat.haken = data.haken;
    staat.zinnen = data.zinnen;
    tekenHaken();
    tekenPaneel();
    if (beheerOpen()) tekenBeheer();
  }

  /* ------------------------------------------------------------- QR-code -- */

  function basisAdres() {
    return location.origin + location.pathname;
  }

  function qrAdres() {
    return basisAdres() + (staat.qrPerHaak ? '#haak-' + staat.gekozen + '-toevoegen' : '#toevoegen');
  }

  function qrOpen() { return $('#qr-dialoog').open; }

  function tekenQr() {
    var adres = qrAdres();
    var vlak = $('#qr-vlak');
    $('#qr-adres').textContent = adres;
    $('#qr-heel').setAttribute('aria-pressed', staat.qrPerHaak ? 'false' : 'true');
    $('#qr-haak').setAttribute('aria-pressed', staat.qrPerHaak ? 'true' : 'false');
    $('#qr-haak').textContent = staat.qrPerHaak ? 'Alleen ' + kort(haakNaam(staat.gekozen), 18) : 'Alleen dit haakje';

    try {
      var stijl = getComputedStyle(document.documentElement);
      vlak.innerHTML = window.KapstokQR.svg(adres, {
        marge: 2,
        donker: stijl.getPropertyValue('--qr-donker').trim() || '#000',
        licht: stijl.getPropertyValue('--qr-licht').trim() || '#fff',
        label: 'QR-code naar ' + adres,
      });
    } catch (e) {
      vlak.textContent = '';
      vlak.appendChild(el('p', { klasse: 'leeg', tekst: 'De QR-code kon niet worden gemaakt: ' + foutTekst(e) }));
    }
    vulPrintvlak();
  }

  function vulPrintvlak() {
    var p = $('#print-vlak');
    if (!p) return;
    p.textContent = '';
    p.appendChild(el('h1', { tekst: cfg.titel || document.title }));
    p.appendChild(el('p', {
      tekst: staat.qrPerHaak
        ? 'Scan en hang iets op aan ' + haakNaam(staat.gekozen) + '.'
        : 'Scan en hang een zin of woord aan de kapstok.',
    }));
    var vlak = el('div', { klasse: 'qr-vlak' });
    vlak.innerHTML = $('#qr-vlak').innerHTML;
    p.appendChild(vlak);
    p.appendChild(el('p', { klasse: 'qr-link', tekst: qrAdres() }));
  }

  /* -------------------------------------------------------------- beheer -- */

  function beheerOpen() { return $('#beheer-dialoog').open; }

  function tekenBeheer() {
    var lijf = $('#beheer-lijf');
    lijf.textContent = '';

    if (!store.isAangemeld) return tekenAanmelden(lijf);
    if (!store.isBeheerder) {
      lijf.appendChild(el('p', { tekst: 'Je bent aangemeld, maar dit account staat niet in de lijst met beheerders. Zie README.md, stap 3.' }));
      lijf.appendChild(el('button', {
        type: 'button', klasse: 'knop', tekst: 'Afmelden',
        bij: { click: function () { doe(function () { return store.logUit(); }, 'Afgemeld.'); } },
      }));
      return;
    }

    lijf.appendChild(el('p', {
      tekst: store.modus === 'demo'
        ? 'Je bent beheerder in demomodus. Alles staat alleen in deze browser.'
        : 'Je bent aangemeld als beheerder. Alleen jij kunt zinnen weghalen en haakjes hernoemen.',
    }));

    /* Haakjes hernoemen */
    var blokHaken = el('div', { klasse: 'beheer-blok' }, [
      el('h3', { tekst: 'Namen van de haakjes' }),
      el('p', { tekst: 'Geef elk haakje de naam die bij jullie onderwerp past.' }),
    ]);
    var hakenLijst = el('ul', { klasse: 'beheer-lijst' });
    for (var i = 1; i <= AANTAL_HAKEN; i++) {
      hakenLijst.appendChild(haakRegel(i));
    }
    blokHaken.appendChild(hakenLijst);
    lijf.appendChild(blokHaken);

    /* Archief over alle haakjes */
    var weg = staat.zinnen.filter(function (z) { return z.verborgen; });
    var blokArchief = el('div', { klasse: 'beheer-blok' }, [
      el('h3', { tekst: 'Weggehaalde zinnen' }),
      el('p', {
        tekst: weg.length
          ? 'Deze zinnen staan niet meer aan de kapstok. Bezoekers zien ze niet.'
          : 'Er is nog niets weggehaald.',
      }),
    ]);
    if (weg.length) {
      var wl = el('ul', { klasse: 'zin-lijst' });
      weg.forEach(function (z) {
        wl.appendChild(el('li', { klasse: 'zin', 'data-verborgen': 'true' }, [
          el('p', { klasse: 'zin__tekst' }, [
            document.createTextNode(z.tekst),
            el('span', { klasse: 'zin__meta', tekst: 'was ' + haakNaam(z.haak_id) }),
          ]),
          el('span', { klasse: 'zin__acties' }, [
            el('button', {
              type: 'button', klasse: 'knop knop--klein', tekst: 'Terugzetten',
              bij: { click: function () { doe(function () { return store.verberg(z.id, false); }, 'Teruggezet.'); } },
            }),
            el('button', {
              type: 'button', klasse: 'knop knop--klein', tekst: 'Definitief weg',
              bij: {
                click: function () {
                  if (!confirm('Definitief verwijderen?\n\n' + z.tekst)) return;
                  doe(function () { return store.verwijderDefinitief(z.id); }, 'Definitief verwijderd.');
                },
              },
            }),
          ]),
        ]));
      });
      blokArchief.appendChild(wl);
    }
    lijf.appendChild(blokArchief);

    lijf.appendChild(el('div', { klasse: 'beheer-blok' }, [
      el('button', {
        type: 'button', klasse: 'knop', tekst: 'Afmelden',
        bij: { click: function () { doe(function () { return store.logUit(); }, 'Afgemeld.'); } },
      }),
    ]));
  }

  function haakRegel(id) {
    var veld = el('input', { type: 'text', maxlength: 40, 'aria-label': 'Naam van haakje ' + id });
    veld.value = haakNaam(id);
    function bewaar() {
      if (veld.value.trim() === haakNaam(id)) return;
      doe(function () { return store.hernoemHaak(id, veld.value); }, 'Naam aangepast.');
    }
    veld.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); bewaar(); } });
    return el('li', {}, [
      el('span', { klasse: 'nummer', tekst: String(id) }),
      veld,
      el('button', { type: 'button', klasse: 'knop knop--klein', tekst: 'Opslaan', bij: { click: bewaar } }),
    ]);
  }

  function tekenAanmelden(lijf) {
    if (store.modus === 'demo') {
      lijf.appendChild(el('p', { tekst: 'De kapstok staat in demomodus: er is nog geen database ingesteld, dus alles blijft in deze browser. Je kunt de beheerfuncties wel uitproberen.' }));
      lijf.appendChild(el('button', {
        type: 'button', klasse: 'knop knop--vol', tekst: 'Beheerder worden (demo)',
        bij: { click: function () { doe(function () { return store.vraagInloglink(''); }, 'Je bent nu beheerder in demomodus.', function () { }); } },
      }));
      lijf.appendChild(el('p', { klasse: 'teller', tekst: 'Zie README.md om de kapstok openbaar te zetten met een echte database.' }));
      return;
    }

    var veld = el('input', { type: 'email', id: 'beheer-email', autocomplete: 'email', placeholder: 'jij@voorbeeld.nl', required: true });
    var vorm = el('form', {
      bij: {
        submit: function (e) {
          e.preventDefault();
          var email = veld.value.trim();
          if (!email) return zegt('Vul je e-mailadres in.', 'fout');
          doe(function () { return store.vraagInloglink(email); }, 'Er is een inloglink naar ' + email + ' gestuurd. Open die op dit apparaat.');
        },
      },
    }, [
      el('div', { klasse: 'veld' }, [
        el('label', { for: 'beheer-email', tekst: 'E-mailadres van de beheerder' }),
        veld,
        el('small', { tekst: 'Je krijgt een inloglink. Er is geen wachtwoord.' }),
      ]),
      el('button', { type: 'submit', klasse: 'knop knop--vol', tekst: 'Stuur inloglink' }),
    ]);

    lijf.appendChild(el('p', { tekst: 'Beheer is alleen voor de beheerder van de kapstok. Bezoekers hebben hier niets nodig: zij kunnen gewoon toevoegen en bewerken.' }));
    lijf.appendChild(vorm);
  }

  /* --------------------------------------------------------------- dialoog */

  function openDialoog(kiezer, naOpenen) {
    var d = $(kiezer);
    if (naOpenen) naOpenen();
    if (typeof d.showModal === 'function') d.showModal();
    else d.setAttribute('open', '');
  }

  function wireDialogen() {
    document.querySelectorAll('dialog').forEach(function (d) {
      d.querySelectorAll('[data-sluit]').forEach(function (b) {
        b.addEventListener('click', function () { d.close(); });
      });
      // Klikken op de achtergrond sluit ook.
      d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    });
  }

  /* ------------------------------------------------------------------ hash */

  // Ondersteunde adressen: #toevoegen, #haak-3, #haak-3-toevoegen
  function verwerkHash() {
    var hash = location.hash.replace(/^#/, '');
    if (!hash) return;
    var haak = hash.match(/^haak-([1-6])/);
    if (haak) staat.gekozen = Number(haak[1]);
    var wilToevoegen = /(^|-)toevoegen$/.test(hash);
    tekenHaken();
    tekenPaneel();
    if (wilToevoegen) {
      richtOp('toevoeg-veld');
      var veld = document.getElementById('toevoeg-veld');
      if (veld && veld.scrollIntoView) veld.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  /* ------------------------------------------------------------------ start */

  function toonModus() {
    var p = $('#modus-melding');
    if (store.modus === 'demo') {
      p.textContent =
        'Demomodus: er is nog geen database ingesteld, dus wat je toevoegt blijft alleen in deze browser en is voor anderen niet zichtbaar. Zie README.md om de kapstok openbaar te zetten.';
    } else {
      p.textContent = 'Openbare kapstok: je hoeft niet in te loggen om iets toe te voegen of bij te schaven.';
    }
  }

  async function start() {
    document.title = cfg.titel || document.title;
    $('#titel').textContent = cfg.titel || $('#titel').textContent;
    $('#ondertitel').textContent = cfg.ondertitel || $('#ondertitel').textContent;

    document.body.appendChild(el('div', { id: 'print-vlak' }));

    bouwHaken();
    wireDialogen();
    toonModus();

    $('#knop-qr').addEventListener('click', function () { openDialoog('#qr-dialoog', tekenQr); });
    $('#knop-beheer').addEventListener('click', function () { openDialoog('#beheer-dialoog', tekenBeheer); });
    $('#qr-heel').addEventListener('click', function () { staat.qrPerHaak = false; tekenQr(); });
    $('#qr-haak').addEventListener('click', function () { staat.qrPerHaak = true; tekenQr(); });
    $('#qr-print').addEventListener('click', function () { vulPrintvlak(); window.print(); });
    $('#qr-kopieer').addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(qrAdres());
        zegt('Link gekopieerd.', 'goed');
      } catch (e) {
        zegt('Kopiëren lukte niet. Selecteer de link hiernaast met de hand.', 'fout');
      }
    });

    store.opWijziging(function () { /* schrijfacties verversen zelf */ });

    try {
      await store.init();
      var aangemeld = await store.verwerkAanmeldlink();
      if (aangemeld) {
        zegt(store.isBeheerder
          ? 'Welkom terug. Je bent aangemeld als beheerder.'
          : 'Je bent aangemeld, maar dit account is geen beheerder.', store.isBeheerder ? 'goed' : 'fout');
      }
    } catch (e) {
      zegt(foutTekst(e), 'fout');
    }

    try {
      await verversen();
    } catch (e) {
      zegt(foutTekst(e), 'fout');
      $('#paneel-lijf').textContent = '';
      $('#paneel-lijf').appendChild(el('p', { klasse: 'leeg', tekst: 'De kapstok kon niet worden geladen. ' + foutTekst(e) }));
      return;
    }

    verwerkHash();
    window.addEventListener('hashchange', verwerkHash);

    // Zachtjes bijblijven bij wat anderen ophangen.
    setInterval(function () {
      if (document.visibilityState !== 'visible' || staat.bezig || staat.bewerkt) return;
      verversen().catch(function () { /* stille poging */ });
    }, VERVERS_MS);

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && !staat.bewerkt) {
        verversen().catch(function () {});
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
