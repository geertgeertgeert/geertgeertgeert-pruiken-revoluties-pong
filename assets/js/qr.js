/*
 * qr.js — minimale QR-encoder (byte-modus, foutcorrectieniveau M, versie 1-20).
 *
 * Geen externe afhankelijkheden en geen CDN: de kapstok moet ook werken op een
 * afgeschermd netwerk of vanaf een USB-stick. Levert een modulematrix plus een
 * SVG-renderer.
 *
 * Gebruik:
 *   const m = KapstokQR.matrix("https://...");   // {size, modules: Uint8Array}
 *   el.innerHTML = KapstokQR.svg("https://...", {marge: 2});
 */
(function (root) {
  'use strict';

  // Foutcorrectiecodewoorden per blok en aantal blokken, niveau M, versie 1-20.
  var ECC_PER_BLOK = [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26];
  var AANTAL_BLOKKEN = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16];
  var MAX_VERSIE = 20;

  /* ---------------------------------------------------------------- Galois */

  var EXP = new Uint8Array(512);
  var LOG = new Uint8Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d; // primitief polynoom x^8+x^4+x^3+x^2+1
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();

  function gfMaal(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  // Generatorpolynoom van graad `graad`, coëfficiënten hoog naar laag zonder de leidende 1.
  function generator(graad) {
    var poly = new Uint8Array(graad);
    poly[graad - 1] = 1;
    for (var i = 0; i < graad; i++) {
      var factor = EXP[i];
      for (var j = 0; j < graad; j++) {
        poly[j] = gfMaal(poly[j], factor);
        if (j + 1 < graad) poly[j] ^= poly[j + 1];
      }
    }
    return poly;
  }

  function foutcorrectie(data, graad) {
    var gen = generator(graad);
    var rest = new Uint8Array(graad);
    for (var i = 0; i < data.length; i++) {
      var factor = data[i] ^ rest[0];
      rest.copyWithin(0, 1);
      rest[graad - 1] = 0;
      for (var j = 0; j < graad; j++) rest[j] ^= gfMaal(gen[j], factor);
    }
    return rest;
  }

  /* ------------------------------------------------------------- capaciteit */

  // Aantal modules dat voor data en foutcorrectie beschikbaar is (ruwe bits).
  function ruweDatamodules(versie) {
    var res = (16 * versie + 128) * versie + 64;
    if (versie >= 2) {
      var n = Math.floor(versie / 7) + 2;
      res -= (25 * n - 10) * n - 55;
      if (versie >= 7) res -= 36;
    }
    return res;
  }

  function totaalCodewoorden(versie) {
    return Math.floor(ruweDatamodules(versie) / 8);
  }

  function datacodewoorden(versie) {
    return totaalCodewoorden(versie) - ECC_PER_BLOK[versie - 1] * AANTAL_BLOKKEN[versie - 1];
  }

  function tellerBits(versie) {
    return versie <= 9 ? 8 : 16;
  }

  function uitlijningsposities(versie) {
    if (versie === 1) return [];
    var aantal = Math.floor(versie / 7) + 2;
    var stap = Math.ceil((versie * 4 + 4) / (aantal * 2 - 2)) * 2;
    var res = [6];
    for (var pos = 4 * versie + 17 - 7; res.length < aantal; pos -= stap) res.splice(1, 0, pos);
    return res;
  }

  /* ------------------------------------------------------------------ bits */

  function Bits() {
    this.bits = [];
  }
  Bits.prototype.push = function (waarde, lengte) {
    for (var i = lengte - 1; i >= 0; i--) this.bits.push((waarde >>> i) & 1);
  };

  function naarUtf8(tekst) {
    if (typeof TextEncoder === 'function') return new TextEncoder().encode(tekst);
    var uit = [];
    for (var i = 0; i < tekst.length; i++) {
      var c = tekst.charCodeAt(i);
      if (c < 0x80) uit.push(c);
      else if (c < 0x800) uit.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      else uit.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
    return new Uint8Array(uit);
  }

  function kiesVersie(aantalBytes) {
    for (var v = 1; v <= MAX_VERSIE; v++) {
      var beschikbaar = datacodewoorden(v) * 8;
      if (4 + tellerBits(v) + aantalBytes * 8 <= beschikbaar) return v;
    }
    return null;
  }

  function codewoorden(bytes, versie) {
    var capaciteit = datacodewoorden(versie);
    var bb = new Bits();
    bb.push(0b0100, 4); // byte-modus
    bb.push(bytes.length, tellerBits(versie));
    for (var i = 0; i < bytes.length; i++) bb.push(bytes[i], 8);

    var bits = bb.bits;
    var maxBits = capaciteit * 8;
    for (var t = 0; t < 4 && bits.length < maxBits; t++) bits.push(0); // afsluiter
    while (bits.length % 8 !== 0) bits.push(0);

    var cw = new Uint8Array(capaciteit);
    for (var b = 0; b < bits.length / 8; b++) {
      var byte = 0;
      for (var k = 0; k < 8; k++) byte = (byte << 1) | bits[b * 8 + k];
      cw[b] = byte;
    }
    var vulling = [0xec, 0x11];
    for (var p = bits.length / 8, q = 0; p < capaciteit; p++, q++) cw[p] = vulling[q % 2];
    return cw;
  }

  // Verdeel over blokken, bereken foutcorrectie en vlecht alles ineen.
  function vlecht(cw, versie) {
    var blokken = AANTAL_BLOKKEN[versie - 1];
    var eccLengte = ECC_PER_BLOK[versie - 1];
    var totaal = totaalCodewoorden(versie);
    var korteBlokken = blokken - (totaal % blokken);
    var korteLengte = Math.floor(totaal / blokken) - eccLengte;

    var dataBlokken = [];
    var eccBlokken = [];
    for (var i = 0, offset = 0; i < blokken; i++) {
      var lengte = korteLengte + (i < korteBlokken ? 0 : 1);
      var data = cw.subarray(offset, offset + lengte);
      offset += lengte;
      dataBlokken.push(data);
      eccBlokken.push(foutcorrectie(data, eccLengte));
    }

    var uit = new Uint8Array(totaal);
    var n = 0;
    for (var k = 0; k <= korteLengte; k++) {
      for (var b = 0; b < blokken; b++) {
        if (k < dataBlokken[b].length) uit[n++] = dataBlokken[b][k];
      }
    }
    for (var e = 0; e < eccLengte; e++) {
      for (var c = 0; c < blokken; c++) uit[n++] = eccBlokken[c][e];
    }
    return uit;
  }

  /* ---------------------------------------------------------------- matrix */

  function Raster(grootte) {
    this.grootte = grootte;
    this.modules = new Uint8Array(grootte * grootte);
    this.bezet = new Uint8Array(grootte * grootte); // functiepatronen: niet overschrijven
  }
  Raster.prototype.zet = function (x, y, donker, functie) {
    this.modules[y * this.grootte + x] = donker ? 1 : 0;
    if (functie) this.bezet[y * this.grootte + x] = 1;
  };
  Raster.prototype.lees = function (x, y) {
    return this.modules[y * this.grootte + x];
  };

  function zoekpatronen(raster) {
    var g = raster.grootte;
    var hoeken = [[0, 0], [g - 7, 0], [0, g - 7]];
    hoeken.forEach(function (hoek) {
      for (var dy = -1; dy <= 7; dy++) {
        for (var dx = -1; dx <= 7; dx++) {
          var x = hoek[0] + dx, y = hoek[1] + dy;
          if (x < 0 || y < 0 || x >= g || y >= g) continue;
          var ax = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
          raster.zet(x, y, ax !== 2 && ax <= 3, true);
        }
      }
    });
  }

  function uitlijningspatronen(raster, versie) {
    var pos = uitlijningsposities(versie);
    var laatste = pos.length - 1;
    for (var i = 0; i <= laatste; i++) {
      for (var j = 0; j <= laatste; j++) {
        // De drie hoeken zijn al door de zoekpatronen bezet.
        if ((i === 0 && j === 0) || (i === 0 && j === laatste) || (i === laatste && j === 0)) continue;
        for (var dy = -2; dy <= 2; dy++) {
          for (var dx = -2; dx <= 2; dx++) {
            var ax = Math.max(Math.abs(dx), Math.abs(dy));
            raster.zet(pos[j] + dx, pos[i] + dy, ax !== 1, true);
          }
        }
      }
    }
  }

  function timing(raster) {
    var g = raster.grootte;
    for (var i = 8; i < g - 8; i++) {
      var donker = i % 2 === 0;
      raster.zet(i, 6, donker, true);
      raster.zet(6, i, donker, true);
    }
  }

  function reserveerFormaat(raster) {
    var g = raster.grootte;
    for (var i = 0; i <= 8; i++) {
      if (i !== 6) raster.zet(i, 8, false, true);
      if (i !== 6) raster.zet(8, i, false, true);
    }
    for (var j = 0; j < 8; j++) {
      raster.zet(g - 1 - j, 8, false, true);
      raster.zet(8, g - 1 - j, false, true);
    }
    raster.zet(8, g - 8, true, true); // vaste donkere module
  }

  function versieInfo(raster, versie) {
    if (versie < 7) return;
    var rest = versie;
    for (var i = 0; i < 12; i++) rest = (rest << 1) ^ ((rest >>> 11) * 0x1f25);
    var bits = ((versie << 12) | rest) & 0x3ffff;
    var g = raster.grootte;
    for (var k = 0; k < 18; k++) {
      var bit = ((bits >>> k) & 1) === 1;
      var a = Math.floor(k / 3);
      var b = (k % 3) + g - 8 - 3;
      raster.zet(a, b, bit, true);
      raster.zet(b, a, bit, true);
    }
  }

  function formaatInfo(raster, masker) {
    var data = (0b00 << 3) | masker; // 0b00 = foutcorrectieniveau M
    var rest = data;
    for (var i = 0; i < 10; i++) rest = (rest << 1) ^ ((rest >>> 9) * 0x537);
    var bits = ((data << 10) | rest) ^ 0x5412;
    var g = raster.grootte;
    for (var k = 0; k <= 5; k++) raster.zet(8, k, ((bits >>> k) & 1) === 1, true);
    raster.zet(8, 7, ((bits >>> 6) & 1) === 1, true);
    raster.zet(8, 8, ((bits >>> 7) & 1) === 1, true);
    raster.zet(7, 8, ((bits >>> 8) & 1) === 1, true);
    for (var m = 9; m < 15; m++) raster.zet(14 - m, 8, ((bits >>> m) & 1) === 1, true);
    for (var n = 0; n < 8; n++) raster.zet(g - 1 - n, 8, ((bits >>> n) & 1) === 1, true);
    for (var p = 8; p < 15; p++) raster.zet(8, g - 15 + p, ((bits >>> p) & 1) === 1, true);
  }

  function plaatsData(raster, data) {
    var g = raster.grootte;
    var i = 0;
    for (var rechts = g - 1; rechts >= 1; rechts -= 2) {
      if (rechts === 6) rechts = 5; // timingkolom overslaan
      for (var tel = 0; tel < g; tel++) {
        for (var kol = 0; kol < 2; kol++) {
          var x = rechts - kol;
          var opwaarts = ((rechts + 1) & 2) === 0;
          var y = opwaarts ? g - 1 - tel : tel;
          if (raster.bezet[y * g + x]) continue;
          var bit = i < data.length * 8 ? (data[i >>> 3] >>> (7 - (i & 7))) & 1 : 0;
          raster.zet(x, y, bit === 1, false);
          i++;
        }
      }
    }
  }

  function maskerBit(masker, x, y) {
    switch (masker) {
      case 0: return (x + y) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
      case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
      case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
      default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    }
  }

  function pasMaskerToe(raster, masker) {
    var g = raster.grootte;
    for (var y = 0; y < g; y++) {
      for (var x = 0; x < g; x++) {
        if (raster.bezet[y * g + x]) continue;
        if (maskerBit(masker, x, y)) raster.modules[y * g + x] ^= 1;
      }
    }
  }

  function strafpunten(raster) {
    var g = raster.grootte;
    var straf = 0;
    var i, j, k;

    // Regel 1: reeksen van vijf of meer gelijke modules.
    for (i = 0; i < g; i++) {
      for (var richting = 0; richting < 2; richting++) {
        var vorige = -1, lengte = 0;
        for (j = 0; j < g; j++) {
          var waarde = richting === 0 ? raster.lees(j, i) : raster.lees(i, j);
          if (waarde === vorige) {
            lengte++;
            if (lengte === 5) straf += 3;
            else if (lengte > 5) straf += 1;
          } else {
            vorige = waarde;
            lengte = 1;
          }
        }
      }
    }

    // Regel 2: gelijkgekleurde blokken van 2x2.
    for (i = 0; i < g - 1; i++) {
      for (j = 0; j < g - 1; j++) {
        var v = raster.lees(j, i);
        if (v === raster.lees(j + 1, i) && v === raster.lees(j, i + 1) && v === raster.lees(j + 1, i + 1)) {
          straf += 3;
        }
      }
    }

    // Regel 3: patroon 1:1:3:1:1 met vier lichte modules ernaast.
    var patroon = [1, 0, 1, 1, 1, 0, 1];
    function zoek(lees) {
      var aantal = 0;
      for (var a = 0; a + 6 < g; a++) {
        var raak = true;
        for (var b = 0; b < 7; b++) {
          if (lees(a + b) !== patroon[b]) { raak = false; break; }
        }
        if (!raak) continue;
        var voor = true, na = true;
        for (var c = 1; c <= 4; c++) {
          if (a - c < 0 || lees(a - c) !== 0) { voor = false; break; }
        }
        for (var d = 1; d <= 4; d++) {
          if (a + 6 + d >= g || lees(a + 6 + d) !== 0) { na = false; break; }
        }
        // Zowel links als rechts vier lichte modules levert twee treffers.
        if (voor) aantal++;
        if (na) aantal++;
      }
      return aantal;
    }
    for (i = 0; i < g; i++) {
      (function (rij) {
        straf += 40 * zoek(function (x) { return raster.lees(x, rij); });
        straf += 40 * zoek(function (y) { return raster.lees(rij, y); });
      })(i);
    }

    // Regel 4: afwijking van een 50/50-verdeling licht/donker.
    var donker = 0;
    for (k = 0; k < raster.modules.length; k++) donker += raster.modules[k];
    var percentage = (donker * 100) / raster.modules.length;
    straf += Math.floor(Math.abs(percentage - 50) / 5) * 10;
    return straf;
  }

  function matrix(tekst) {
    var bytes = naarUtf8(String(tekst));
    var versie = kiesVersie(bytes.length);
    if (!versie) throw new Error('Tekst te lang voor een QR-code van versie 1-' + MAX_VERSIE);

    var data = vlecht(codewoorden(bytes, versie), versie);
    var grootte = versie * 4 + 17;

    var beste = null, besteStraf = Infinity;
    for (var masker = 0; masker < 8; masker++) {
      var raster = new Raster(grootte);
      zoekpatronen(raster);
      uitlijningspatronen(raster, versie);
      timing(raster);
      reserveerFormaat(raster);
      versieInfo(raster, versie);
      plaatsData(raster, data);
      formaatInfo(raster, masker);
      pasMaskerToe(raster, masker);
      var straf = strafpunten(raster);
      if (straf < besteStraf) {
        besteStraf = straf;
        beste = raster;
      }
    }
    return { size: grootte, versie: versie, modules: beste.modules };
  }

  /* ------------------------------------------------------------------- svg */

  function veiligAttribuut(waarde) {
    return String(waarde).replace(/[&<>"']/g, function (t) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[t];
    });
  }

  function svg(tekst, opties) {
    opties = opties || {};
    var marge = opties.marge == null ? 2 : opties.marge;
    var m = matrix(tekst);
    var totaal = m.size + marge * 2;
    var pad = '';
    for (var y = 0; y < m.size; y++) {
      var x = 0;
      while (x < m.size) {
        if (!m.modules[y * m.size + x]) { x++; continue; }
        var breedte = 0;
        while (x + breedte < m.size && m.modules[y * m.size + x + breedte]) breedte++;
        pad += 'M' + (x + marge) + ' ' + (y + marge) + 'h' + breedte + 'v1h-' + breedte + 'z';
        x += breedte;
      }
    }
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + totaal + ' ' + totaal + '" ' +
      'shape-rendering="crispEdges" role="img" aria-label="' +
      veiligAttribuut(opties.label || 'QR-code') + '">' +
      '<rect width="' + totaal + '" height="' + totaal + '" fill="' +
      veiligAttribuut(opties.licht || '#ffffff') + '"/>' +
      '<path d="' + pad + '" fill="' + veiligAttribuut(opties.donker || '#000000') + '"/>' +
      '</svg>'
    );
  }

  root.KapstokQR = { matrix: matrix, svg: svg, MAX_VERSIE: MAX_VERSIE };
})(typeof globalThis !== 'undefined' ? globalThis : this);
