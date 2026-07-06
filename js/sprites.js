/* ---------------------------------------------------------------------
 * Pixel-art sprite definitions.
 *
 * Each sprite is authored as a low-res grid (color code per cell, per
 * row) and rendered onto a small offscreen canvas at 2x, giving an
 * effective ~32x48 pixel-art canvas that is then scaled up in the DOM
 * with image-rendering: pixelated for the chunky HD-2D look.
 * ------------------------------------------------------------------- */

const Sprites = (() => {

  function makeGrid(w, h, fill = '.') {
    return Array.from({ length: h }, () => Array(w).fill(fill));
  }

  function rect(grid, x, y, w, h, ch) {
    for (let j = y; j < y + h; j++) {
      if (!grid[j]) continue;
      for (let i = x; i < x + w; i++) {
        if (i >= 0 && i < grid[0].length) grid[j][i] = ch;
      }
    }
  }

  // Diamond-ish taper, used for hair/robe silhouettes.
  function taper(grid, cx, y, wStart, wEnd, rows, ch) {
    for (let r = 0; r < rows; r++) {
      const w = Math.round(wStart + (wEnd - wStart) * (r / Math.max(1, rows - 1)));
      rect(grid, cx - Math.floor(w / 2), y + r, w, 1, ch);
    }
  }

  function buildJane() {
    const W = 16, H = 24;
    const g = makeGrid(W, H);
    // hair crown
    taper(g, 8, 2, 6, 10, 5, 'h');
    // face
    rect(g, 5, 5, 6, 4, 's');
    // hair sides framing face
    rect(g, 3, 5, 2, 5, 'h');
    rect(g, 11, 5, 2, 5, 'h');
    // hair highlight streak
    rect(g, 6, 3, 2, 2, 'H');
    // neck
    rect(g, 6, 9, 4, 1, 's');
    // dress body (taper wider toward hem)
    taper(g, 8, 10, 8, 13, 12, 'd');
    // dress fold highlight
    rect(g, 7, 14, 2, 6, 'D');
    // arm holding book
    rect(g, 10, 11, 3, 4, 's');
    // book
    rect(g, 10, 13, 4, 4, 'b');
    rect(g, 11, 14, 2, 2, 'p');
    // hem shadow
    rect(g, 3, 21, 10, 2, 'k');
    return {
      grid: g,
      legend: {
        '.': null,
        h: '#8C2F1E',
        H: '#B4593F',
        s: '#E8C4A0',
        d: '#2C3E66',
        D: '#3E5488',
        b: '#5C3A21',
        p: '#EDE4D3',
        k: 'rgba(0,0,0,0.35)',
      },
    };
  }

  function buildGiffordHorse() {
    const W = 20, H = 20;
    const g = makeGrid(W, H);
    // body
    rect(g, 4, 8, 12, 6, 'b');
    // chest/rump shading
    rect(g, 4, 8, 2, 6, 'k2');
    rect(g, 14, 8, 2, 6, 'k2');
    // neck + head
    rect(g, 14, 3, 4, 6, 'b');
    rect(g, 16, 2, 4, 4, 'b');
    // muzzle
    rect(g, 19, 4, 2, 2, 'k2');
    // mane
    rect(g, 13, 2, 2, 7, 'm');
    rect(g, 15, 1, 2, 2, 'm');
    // ear
    rect(g, 17, 0, 2, 2, 'b');
    // legs
    rect(g, 5, 14, 2, 6, 'b');
    rect(g, 9, 14, 2, 6, 'b');
    rect(g, 12, 14, 2, 6, 'b');
    rect(g, 15, 14, 2, 6, 'b');
    // hooves
    rect(g, 5, 19, 2, 1, 'k');
    rect(g, 9, 19, 2, 1, 'k');
    rect(g, 12, 19, 2, 1, 'k');
    rect(g, 15, 19, 2, 1, 'k');
    // tail
    rect(g, 2, 8, 2, 8, 'm');
    // highlight
    rect(g, 6, 9, 3, 2, 'H');
    return {
      grid: g,
      legend: {
        '.': null,
        b: '#6B3A1F',
        H: '#8B5230',
        k2: '#4A2814',
        m: '#3A2210',
        k: 'rgba(0,0,0,0.4)',
      },
    };
  }

  function buildEdward() {
    const W = 16, H = 24;
    const g = makeGrid(W, H);
    // crown
    rect(g, 5, 1, 6, 2, 'c');
    rect(g, 5, 0, 1, 1, 'c');
    rect(g, 8, 0, 1, 1, 'c');
    rect(g, 10, 0, 1, 1, 'c');
    rect(g, 7, 1, 1, 1, 'j');
    // hair
    rect(g, 4, 3, 8, 2, 'y');
    // face (pale)
    rect(g, 5, 4, 6, 5, 's');
    // neck
    rect(g, 6, 9, 4, 1, 's');
    // robe
    taper(g, 8, 10, 8, 14, 12, 'r');
    rect(g, 6, 12, 2, 8, 'r2');
    rect(g, 8, 13, 2, 6, 'r3');
    // fur trim
    rect(g, 3, 21, 10, 2, 'f');
    return {
      grid: g,
      legend: {
        '.': null,
        c: '#D4AF37',
        j: '#8B1E3F',
        y: '#C9B37E',
        s: '#E8D8C8',
        r: '#5B2333',
        r2: '#7A3049',
        r3: '#4A1C29',
        f: '#EDE4D3',
      },
    };
  }

  function buildBottle() {
    const W = 10, H = 16;
    const g = makeGrid(W, H);
    rect(g, 4, 0, 2, 3, 'c');   // cork
    rect(g, 3, 3, 4, 2, 'g');   // neck
    rect(g, 2, 5, 6, 8, 'g');   // body
    rect(g, 3, 7, 4, 5, 'l');   // liquid
    rect(g, 3, 7, 4, 1, 'H');   // liquid surface glow
    rect(g, 2, 13, 6, 1, 'k');  // base shadow
    return {
      grid: g,
      legend: {
        '.': null,
        c: '#5C3A21',
        g: 'rgba(74,107,74,0.55)',
        l: '#7FBF3F',
        H: '#B6E86B',
        k: 'rgba(0,0,0,0.4)',
      },
    };
  }

  function buildCrown() {
    const W = 16, H = 10;
    const g = makeGrid(W, H);
    rect(g, 2, 5, 12, 4, 'c');
    rect(g, 2, 1, 2, 4, 'c');
    rect(g, 7, 0, 2, 5, 'c');
    rect(g, 12, 1, 2, 4, 'c');
    rect(g, 7, 6, 2, 2, 'j');
    return {
      grid: g,
      legend: { '.': null, c: '#D4AF37', j: '#8B1E3F' },
    };
  }

  function buildTower() {
    const W = 24, H = 40;
    const g = makeGrid(W, H);
    rect(g, 4, 6, 16, 34, 't');
    rect(g, 2, 0, 6, 8, 't');
    rect(g, 16, 0, 6, 8, 't');
    rect(g, 8, 10, 2, 3, 'w');
    rect(g, 14, 10, 2, 3, 'w');
    rect(g, 10, 20, 4, 6, 'w');
    rect(g, 4, 0, 2, 2, 't2');
    rect(g, 8, 0, 2, 2, 't2');
    rect(g, 12, 0, 2, 2, 't2');
    rect(g, 16, 0, 2, 2, 't2');
    rect(g, 20, 0, 2, 2, 't2');
    return {
      grid: g,
      legend: { '.': null, t: '#1A1A2E', t2: '#2A2A3E', w: 'rgba(255,214,120,0.35)' },
    };
  }

  const DEFS = {
    jane: buildJane(),
    giffordHorse: buildGiffordHorse(),
    edward: buildEdward(),
    bottle: buildBottle(),
    crown: buildCrown(),
    tower: buildTower(),
  };

  // Draw a sprite (by name) centered onto the given canvas element,
  // at `cell` device pixels per authored grid-cell (before CSS scaling).
  function draw(canvas, name, cell = 2, revealRatio = 1) {
    const def = DEFS[name];
    if (!def) return;
    const { grid, legend } = def;
    const w = grid[0].length, h = grid.length;
    canvas.width = w * cell;
    canvas.height = h * cell;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const revealFromRow = Math.floor(h * (1 - revealRatio));
    for (let y = 0; y < h; y++) {
      if (y < revealFromRow) continue; // not yet revealed (bottom-up reveal)
      for (let x = 0; x < w; x++) {
        const color = legend[grid[y][x]];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }

  return { draw, DEFS };
})();
