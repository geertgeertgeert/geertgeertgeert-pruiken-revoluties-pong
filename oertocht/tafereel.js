/*
 * Oertocht — tafereel
 *
 * Tekent wat de woorden van de speler hebben gedaan: waar iedereen staat, wat
 * er brandt, waar de kano ligt. Het tafereel geeft geen hints; het laat alleen
 * zien wat de groep ook zou zien.
 */
(function (root) {
  'use strict';

  const SKY = {
    ochtend: ['#f2d3b0', '#c9dde0', '#f6e3c4'],
    middag: ['#a9cfe3', '#e3ede6', '#fff6dc'],
    avond: ['#3d2f5c', '#e48b6b', '#ffd08a'],
    nacht: ['#0d1328', '#28305a', '#e9ecf5'],
  };
  const LAND = {
    ochtend: ['#b9c4b0', '#8fa287', '#5f7759', '#3e5240'],
    middag: ['#b4c6b7', '#86a283', '#5a7a55', '#3a523a'],
    avond: ['#8a6f8a', '#6a5571', '#4a3d55', '#2e2639'],
    nacht: ['#2a3150', '#20263f', '#171c30', '#0f1322'],
  };
  const INK = { ochtend: '#1d221c', middag: '#1b201a', avond: '#1a1420', nacht: '#07090f' };

  function rnd(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function Stage(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.v = null;
    this.t0 = performance.now();
    this.still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.raf = 0;
    this.particles = [];
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(canvas);
    this.resize();
    document.addEventListener('visibilitychange', () => this.loop());
  }

  Stage.prototype.resize = function () {
    const r = this.c.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = Math.max(1, r.width); this.H = Math.max(1, r.height);
    this.c.width = Math.round(this.W * dpr); this.c.height = Math.round(this.H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  };

  Stage.prototype.set = function (v) { this.v = v; this.draw(); this.loop(); };

  Stage.prototype.loop = function () {
    cancelAnimationFrame(this.raf);
    if (this.still || document.hidden || !this.v) return;
    const tick = () => { this.draw(); this.raf = requestAnimationFrame(tick); };
    this.raf = requestAnimationFrame(tick);
  };

  Stage.prototype.draw = function () {
    const v = this.v, ctx = this.ctx, W = this.W, H = this.H;
    if (!v || !W) return;
    const time = this.still ? 0 : (performance.now() - this.t0) / 1000;
    const part = v.part;
    const sky = SKY[part], land = LAND[part], ink = INK[part];
    ctx.clearRect(0, 0, W, H);

    // Lucht
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.75);
    g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // Zon of maan: opkomen in het oosten (rechts), ondergaan in het westen (links)
    const sx = { ochtend: 0.84, middag: 0.55, avond: 0.14, nacht: 0.7 }[part] * W;
    const sy = { ochtend: 0.42, middag: 0.16, avond: 0.5, nacht: 0.18 }[part] * H;
    const sr = Math.max(10, H * 0.06);
    const halo = ctx.createRadialGradient(sx, sy, sr * 0.4, sx, sy, sr * 4);
    halo.addColorStop(0, sky[2] + 'cc'); halo.addColorStop(1, sky[2] + '00');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(sx, sy, sr * 4, 0, 7); ctx.fill();
    ctx.fillStyle = sky[2]; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 7); ctx.fill();
    if (part === 'nacht') { ctx.fillStyle = sky[0]; ctx.beginPath(); ctx.arc(sx + sr * 0.45, sy - sr * 0.2, sr * 0.9, 0, 7); ctx.fill(); this.stars(time); }

    // Heuvels in lagen
    this.ridge(0.52, 0.07, 3, land[0], 11);
    this.ridge(0.62, 0.06, 5, land[1], 23);

    const S = this['scene_' + v.scene];
    if (S) S.call(this, v, time, land, ink);

    if (part === 'nacht' || part === 'avond') {
      const vg = ctx.createRadialGradient(W / 2, H * 0.6, H * 0.2, W / 2, H * 0.6, W * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, part === 'nacht' ? 'rgba(0,0,10,.55)' : 'rgba(20,0,30,.25)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    }
  };

  Stage.prototype.stars = function (time) {
    const ctx = this.ctx, r = rnd(7);
    for (let i = 0; i < 60; i++) {
      const x = r() * this.W, y = r() * this.H * 0.45, a = 0.4 + 0.6 * Math.abs(Math.sin(time * 0.7 + i));
      ctx.fillStyle = 'rgba(235,240,255,' + (a * 0.8).toFixed(2) + ')';
      ctx.fillRect(x, y, 1.4, 1.4);
    }
  };

  Stage.prototype.ridge = function (base, amp, waves, color, seed) {
    const ctx = this.ctx, W = this.W, H = this.H, r = rnd(seed);
    const ph = r() * 6, ph2 = r() * 6;
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) {
      const u = x / W;
      const y = H * (base - amp * (0.6 * Math.sin(u * waves + ph) + 0.4 * Math.sin(u * waves * 2.3 + ph2)));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  };

  Stage.prototype.ground = function (y, color, fn) {
    const ctx = this.ctx, W = this.W, H = this.H;
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) ctx.lineTo(x, H * (fn ? fn(x / W) : y));
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  };

  // Een figuur: hoofd, lijf, benen. Tiko is klein, Sela heeft een stok.
  Stage.prototype.person = function (id, x, y, ink, time, opts) {
    const ctx = this.ctx, H = this.H;
    const o = opts || {};
    const s = H * (id === 'tiko' ? 0.11 : 0.15) * (o.scale || 1);
    const walk = o.walk && !this.still ? Math.sin(time * 6 + x) : 0;
    const bob = o.walk && !this.still ? Math.abs(walk) * s * 0.03 : 0;
    ctx.save();
    ctx.translate(x, y - bob);
    ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = 'round';
    // benen
    ctx.lineWidth = Math.max(2, s * 0.09);
    ctx.beginPath(); ctx.moveTo(0, -s * 0.42); ctx.lineTo(-s * 0.1 - walk * s * 0.08, 0); ctx.moveTo(0, -s * 0.42); ctx.lineTo(s * 0.1 + walk * s * 0.08, 0); ctx.stroke();
    // lijf (huid-mantel)
    ctx.beginPath(); ctx.moveTo(-s * 0.16, -s * 0.4); ctx.quadraticCurveTo(0, -s * 0.95, s * 0.16, -s * 0.4); ctx.closePath(); ctx.fill();
    // hoofd
    ctx.beginPath(); ctx.arc(0, -s * 0.9, s * 0.11, 0, 7); ctx.fill();
    if (id === 'sela') { ctx.lineWidth = Math.max(1.5, s * 0.05); ctx.beginPath(); ctx.moveTo(s * 0.22, 0); ctx.lineTo(s * 0.26, -s * 0.8); ctx.stroke(); }
    if (id === 'ura') { ctx.lineWidth = Math.max(1.5, s * 0.04); ctx.beginPath(); ctx.moveTo(-s * 0.25, s * 0.02); ctx.lineTo(-s * 0.12, -s * 1.15); ctx.stroke(); }
    if (id === 'keb') { ctx.lineWidth = Math.max(1.5, s * 0.04); ctx.beginPath(); ctx.arc(s * 0.2, -s * 0.62, s * 0.26, -1.2, 1.2); ctx.stroke(); }
    if (o.torch) {
      ctx.lineWidth = Math.max(1.5, s * 0.05); ctx.beginPath(); ctx.moveTo(s * 0.14, -s * 0.55); ctx.lineTo(s * 0.3, -s * 0.95); ctx.stroke();
      this.flame(s * 0.3, -s * 1.0, s * 0.12, time);
    }
    if (o.ember) { ctx.fillStyle = '#ff8a3c'; ctx.beginPath(); ctx.arc(-s * 0.16, -s * 0.5, s * 0.045 + (this.still ? 0 : Math.sin(time * 5) * s * 0.01), 0, 7); ctx.fill(); }
    ctx.restore();
    if (o.label && this.W > 520) {
      ctx.fillStyle = o.labelColor || 'rgba(255,255,255,.85)';
      ctx.font = '500 ' + Math.max(9, Math.round(H * 0.035)) + 'px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(o.label, x, y + Math.max(12, H * 0.05));
    }
  };

  Stage.prototype.group = function (ids, x, y, ink, time, opts) {
    // ruimte genoeg voor de namen eronder
    const gap = Math.max(this.H * 0.085, this.W > 520 ? 46 : 22);
    ids.forEach((id, i) => this.person(id, x + (i - (ids.length - 1) / 2) * gap, y, ink, time, Object.assign({ label: NAMES[id] }, opts && opts[id] || opts && opts.all || {})));
  };

  Stage.prototype.flame = function (x, y, r, time) {
    const ctx = this.ctx;
    const f = this.still ? 1 : 0.85 + 0.15 * Math.sin(time * 13 + x);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    g.addColorStop(0, 'rgba(255,200,110,.9)'); g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffb347'; ctx.beginPath();
    ctx.moveTo(x - r * 0.6, y + r * 0.6); ctx.quadraticCurveTo(x, y - r * 2.2 * f, x + r * 0.6, y + r * 0.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff1c4'; ctx.beginPath();
    ctx.moveTo(x - r * 0.25, y + r * 0.5); ctx.quadraticCurveTo(x, y - r * 0.9 * f, x + r * 0.25, y + r * 0.5); ctx.closePath(); ctx.fill();
  };

  Stage.prototype.smoke = function (x, y, spread, time, density) {
    const ctx = this.ctx, H = this.H, W = this.W;
    const n = Math.round(18 * density);
    for (let i = 0; i < n; i++) {
      const p = ((time * 0.06 + i / n) % 1);
      const px = x + (i % 5 - 2) * spread * 0.2 + p * W * 0.18;   // de wind blaast de rook naar het oosten
      const py = y - p * H * 0.55;
      const r = H * (0.04 + p * 0.12);
      ctx.fillStyle = 'rgba(110,110,110,' + (0.32 * (1 - p)).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill();
    }
  };

  const NAMES = { ura: 'Ura', keb: 'Keb', sela: 'Sela', tiko: 'Tiko' };

  /* ---------- 1. De rookpluim ---------- */
  Stage.prototype.scene_rook = function (v, time, land, ink) {
    const ctx = this.ctx, W = this.W, H = this.H;
    const hill = (u) => 0.86 - 0.26 * Math.exp(-Math.pow((u - 0.82) / 0.2, 2));
    // dal met riet of zwarte grond
    const front = v.passed ? 0.66 : 0.12 + Math.min(4, v.fireNear) * 0.11;
    this.ground(0.86, land[2]);
    ctx.fillStyle = v.passed ? '#262220' : '#24201c';
    ctx.fillRect(0, H * 0.84, front * W, H * 0.16);
    // riet voor het vuur uit
    ctx.strokeStyle = land[3]; ctx.lineWidth = 1.5;
    for (let x = front * W; x < W * 0.6; x += 5) { ctx.beginPath(); ctx.moveTo(x, H * 0.88); ctx.lineTo(x + 2, H * (0.8 + (x % 3) * 0.01)); ctx.stroke(); }
    // vlammen aan het front
    if (!v.passed) {
      for (let i = 0; i < 7; i++) this.flame(front * W - i * 6, H * (0.84 + (i % 2) * 0.02), H * 0.035, time + i);
      this.smoke(front * W, H * 0.78, W * 0.08, time, 1.2);
    } else {
      for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(255,120,40,' + (0.5 + 0.4 * Math.sin(time * 3 + i)).toFixed(2) + ')'; ctx.fillRect(W * (0.08 + i * 0.12), H * 0.88, 3, 2); }
      this.smoke(W * 0.3, H * 0.86, W * 0.2, time, 0.35);
    }
    // de heuvel waar de groep staat
    this.ground(0, land[3], hill);
    // de rots
    ctx.fillStyle = ink; ctx.beginPath();
    ctx.moveTo(W * 0.9, H * hill(0.9)); ctx.lineTo(W * 0.915, H * (hill(0.9) - 0.13)); ctx.lineTo(W * 0.95, H * (hill(0.95) - 0.1)); ctx.lineTo(W * 0.96, H * hill(0.96)); ctx.closePath(); ctx.fill();
    // de groep; Tiko loopt af naar de rook
    const base = 0.78;
    const others = ['ura', 'keb', 'sela'];
    this.group(others, W * base, H * hill(base), ink, time, { ura: { torch: v.torch }, keb: { ember: v.fire } });
    const tx = base - 0.1 - v.drift * 0.13;
    this.person('tiko', W * tx, H * hill(tx), ink, time, { label: 'Tiko', walk: v.drift > 0 });
  };

  /* ---------- 2. Het spoor ---------- */
  Stage.prototype.scene_spoor = function (v, time, land, ink) {
    const ctx = this.ctx, W = this.W, H = this.H;
    this.ground(0.8, land[2]);
    // berken
    const r = rnd(5);
    for (let i = 0; i < 16; i++) {
      const x = r() * W * 0.62, h = H * (0.35 + r() * 0.25), w = Math.max(3, H * 0.018);
      ctx.fillStyle = '#e9e6dc'; ctx.fillRect(x, H * 0.8 - h, w, h);
      ctx.fillStyle = '#2a2a2a'; for (let k = 0; k < 5; k++) ctx.fillRect(x, H * 0.8 - h + r() * h, w, 2);
      ctx.fillStyle = land[1]; ctx.beginPath(); ctx.arc(x + w / 2, H * 0.8 - h, H * 0.06, 0, 7); ctx.fill();
    }
    // open plek met het hert
    if (v.deer) this.deer(W * 0.18, H * 0.79, ink, time);
    // poel
    ctx.fillStyle = '#5f7a4c'; ctx.beginPath(); ctx.ellipse(W * 0.55, H * 0.9, W * 0.14, H * 0.045, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(W * 0.47, H * 0.89, W * 0.08, 1.5);
    // bron achter de poel
    if (v.bron) { ctx.fillStyle = '#bfe3ef'; ctx.beginPath(); ctx.arc(W * 0.7, H * 0.86, H * 0.012, 0, 7); ctx.fill(); }
    // hazelaars
    ctx.fillStyle = land[3];
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(W * (0.7 + i * 0.045), H * 0.8, H * 0.05, Math.PI, 0); ctx.fill(); }
    // spoor in de modder
    ctx.fillStyle = 'rgba(30,25,20,.55)';
    for (let i = 0; i < 9; i++) { const x = W * (0.5 - i * 0.035), y = H * (0.95 - i * 0.012); ctx.beginPath(); ctx.ellipse(x - 2, y, 2, 3, 0, 0, 7); ctx.ellipse(x + 2, y, 2, 3, 0, 0, 7); ctx.fill(); }
    this.ground(0, land[3], u => 0.97 - 0.02 * Math.sin(u * 9));
    const kebAway = v.deer || v.downwind;
    const ids = kebAway ? ['ura', 'sela', 'tiko'] : ['ura', 'keb', 'sela', 'tiko'];
    this.group(ids, W * 0.84, H * 0.95, ink, time, { keb: { ember: v.fire } });
    if (kebAway) this.person('keb', W * (v.downwind ? 0.08 : 0.3), H * 0.8, ink, time, { label: 'Keb', scale: 0.8, ember: v.fire });
  };

  Stage.prototype.deer = function (x, y, ink, time) {
    const ctx = this.ctx, s = this.H * 0.12;
    const graze = this.still ? 0 : Math.sin(time * 0.8) * 0.5 + 0.5;
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.beginPath(); ctx.ellipse(0, -s * 0.6, s * 0.45, s * 0.18, 0, 0, 7); ctx.fill();
    [-0.32, -0.22, 0.25, 0.35].forEach(dx => { ctx.beginPath(); ctx.moveTo(dx * s, -s * 0.55); ctx.lineTo(dx * s, 0); ctx.stroke(); });
    const hx = -s * 0.5, hy = -s * (0.85 - graze * 0.55);
    ctx.beginPath(); ctx.moveTo(-s * 0.35, -s * 0.65); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(hx - s * 0.06, hy, s * 0.11, s * 0.06, -0.3, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx, hy - s * 0.05); ctx.lineTo(hx + s * 0.08, hy - s * 0.35); ctx.lineTo(hx + s * 0.2, hy - s * 0.42); ctx.moveTo(hx + s * 0.06, hy - s * 0.22); ctx.lineTo(hx - s * 0.06, hy - s * 0.34); ctx.stroke();
    ctx.restore();
  };

  /* ---------- 3. De rivier ---------- */
  Stage.prototype.scene_rivier = function (v, time, land, ink) {
    const ctx = this.ctx, W = this.W, H = this.H;
    this.ground(0.8, land[2]);
    // rivier: westoever links (B), oostoever rechts (A)
    const L = 0.3, R = 0.7;
    ctx.fillStyle = '#6a7f86'; ctx.fillRect(W * L, H * 0.78, W * (R - L), H * 0.22);
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) {
      const y = H * (0.81 + (i % 7) * 0.026), off = ((time * 40 + i * 53) % (W * (R - L)));
      ctx.beginPath(); ctx.moveTo(W * L + off, y); ctx.lineTo(W * L + off + W * 0.03, y); ctx.stroke();
    }
    if (v.ford) {
      ctx.fillStyle = 'rgba(255,255,255,.65)';
      for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(W * (L + 0.02 + i * 0.033), H * 0.785, 2 + (i % 3), 0, 7); ctx.fill(); }
    }
    // oevers
    ctx.fillStyle = land[3]; ctx.fillRect(0, H * 0.86, W * L, H * 0.14); ctx.fillRect(W * R, H * 0.86, W * (1 - R), H * 0.14);
    // riet
    ctx.strokeStyle = land[3]; ctx.lineWidth = 1.5;
    for (let x = W * (R - 0.02); x < W * (R + 0.12); x += 4) { ctx.beginPath(); ctx.moveTo(x, H * 0.88); ctx.lineTo(x - 2, H * (0.74 + (x % 5) * 0.008)); ctx.stroke(); }
    // kano
    if (v.kanoFound) {
      const kx = v.kano === 'A' ? W * (R - 0.04) : W * (L + 0.04);
      ctx.fillStyle = '#5b3b22'; ctx.beginPath(); ctx.ellipse(kx, H * 0.86, W * 0.06, H * 0.018, 0, 0, Math.PI); ctx.fill();
    }
    const A = Object.keys(v.pos).filter(id => v.pos[id] === 'A');
    const B = Object.keys(v.pos).filter(id => v.pos[id] === 'B');
    if (A.length) this.group(A, W * 0.85, H * 0.9, ink, time, { keb: { ember: v.fire } });
    if (B.length) this.group(B, W * 0.15, H * 0.9, ink, time, { keb: { ember: v.fire } });
  };

  /* ---------- 4. De nacht ---------- */
  Stage.prototype.scene_nacht = function (v, time, land, ink) {
    const ctx = this.ctx, W = this.W, H = this.H;
    this.ground(0.8, land[2]);
    // eikenbos links
    const r = rnd(9);
    for (let i = 0; i < 14; i++) {
      const x = r() * W * 0.45, h = H * (0.3 + r() * 0.25);
      ctx.fillStyle = land[3]; ctx.fillRect(x, H * 0.82 - h * 0.5, Math.max(4, H * 0.025), h * 0.5);
      ctx.beginPath(); ctx.arc(x + 4, H * 0.82 - h * 0.55, h * 0.32, 0, 7); ctx.fill();
    }
    this.ground(0, land[3], u => 0.9 - 0.015 * Math.sin(u * 7));
    // ogen in het bos zodra het donker wordt
    if (!v.morning && v.part === 'nacht') {
      const glow = v.campfire ? 0.5 : 1;
      for (let i = 0; i < 4; i++) {
        const x = W * (0.08 + i * 0.09), y = H * (0.78 + (i % 2) * 0.03);
        const blink = this.still ? 1 : (Math.sin(time * 1.3 + i * 2) > -0.9 ? 1 : 0);
        ctx.fillStyle = 'rgba(255,230,120,' + (0.85 * glow * blink).toFixed(2) + ')';
        ctx.fillRect(x, y, 3, 2); ctx.fillRect(x + 7, y, 3, 2);
      }
    }
    // afdak
    if (v.shelter) {
      ctx.fillStyle = '#4b3a2c'; ctx.beginPath(); ctx.moveTo(W * 0.62, H * 0.9); ctx.lineTo(W * 0.72, H * 0.72); ctx.lineTo(W * 0.8, H * 0.9); ctx.closePath(); ctx.fill();
    }
    // vlees in de boom
    if (v.meatHigh) { ctx.strokeStyle = ink; ctx.beginPath(); ctx.moveTo(W * 0.42, H * 0.5); ctx.lineTo(W * 0.42, H * 0.58); ctx.stroke(); ctx.fillStyle = '#6b4a35'; ctx.fillRect(W * 0.41, H * 0.58, W * 0.02, H * 0.04); }
    // vuur
    if (v.campfire) {
      const g = ctx.createRadialGradient(W * 0.55, H * 0.88, 0, W * 0.55, H * 0.88, H * 0.5);
      g.addColorStop(0, 'rgba(255,170,80,.45)'); g.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      this.flame(W * 0.55, H * 0.88, H * 0.04, time);
    }
    const ids = ['ura', 'keb', 'sela', 'tiko'];
    this.group(ids, W * 0.74, H * 0.92, v.campfire ? '#1b120c' : ink, time, { keb: { ember: v.fire } });
  };

  /* ---------- 5. De kust ---------- */
  Stage.prototype.scene_kust = function (v, time, land, ink) {
    const ctx = this.ctx, W = this.W, H = this.H;
    // zee links, strand, duinen rechts
    ctx.fillStyle = '#5e8a8e'; ctx.fillRect(0, H * 0.62, W * 0.45, H * 0.38);
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { const y = H * (0.66 + i * 0.05); const off = this.still ? 0 : Math.sin(time + i) * 6; ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x < W * 0.45; x += 12) ctx.lineTo(x, y + Math.sin(x * 0.05 + time * 2 + i) * 2 + off * 0.1); ctx.stroke(); }
    ctx.fillStyle = '#d7c79e'; ctx.beginPath(); ctx.moveTo(W * 0.38, H); ctx.lineTo(W * 0.45, H * 0.62); ctx.lineTo(W * 0.78, H * 0.7); ctx.lineTo(W, H * 0.7); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    // streep zeewier: de vloedlijn
    ctx.strokeStyle = '#4c5a3a'; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let x = W * 0.47; x < W * 0.76; x += 8) ctx.lineTo(x, H * (0.83 + Math.sin(x) * 0.006));
    ctx.stroke();
    // duinen
    ctx.fillStyle = '#b9a874'; ctx.beginPath(); ctx.moveTo(W * 0.7, H); ctx.quadraticCurveTo(W * 0.85, H * 0.48, W, H * 0.6); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6f7d45'; ctx.lineWidth = 1.2;
    for (let x = W * 0.78; x < W; x += 6) { ctx.beginPath(); ctx.moveTo(x, H * 0.62); ctx.lineTo(x + 3, H * 0.57); ctx.stroke(); }
    // hut volgens de uitkomst van het plan
    if (v.parts) {
      const good = v.parts.hut === 'gelukt';
      const hx = good ? W * 0.93 : W * 0.6, hy = good ? H * 0.64 : H * 0.86;
      ctx.fillStyle = '#4b3a2c'; ctx.beginPath(); ctx.moveTo(hx - H * 0.07, hy); ctx.lineTo(hx, hy - H * 0.12); ctx.lineTo(hx + H * 0.07, hy); ctx.closePath(); ctx.fill();
      if (!good) { ctx.fillStyle = 'rgba(94,138,142,.7)'; ctx.fillRect(hx - H * 0.12, hy - 2, H * 0.24, H * 0.03); }
      if (v.parts.vuur === 'gelukt') this.flame(good ? W * 0.86 : W * 0.66, good ? H * 0.66 : H * 0.88, H * 0.03, time);
    }
    this.group(['ura', 'keb', 'sela', 'tiko'], W * 0.84, H * 0.6, ink, time, { keb: { ember: v.fire } });
  };

  root.Tafereel = Stage;
})(typeof self !== 'undefined' ? self : this);
