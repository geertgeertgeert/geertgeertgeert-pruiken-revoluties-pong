/* Main game engine: state machine, scene rendering, transitions. */

(() => {
  const bgLayer = document.getElementById('bg-layer');
  const fgLayer = document.getElementById('fg-layer');
  const bloom = document.getElementById('bloom');
  const spriteCanvas = document.getElementById('sprite-canvas');
  const dialoguePanel = document.getElementById('dialogue-panel');
  const speakerEl = document.getElementById('speaker-name');
  const textEl = document.getElementById('dialogue-text');
  const choicesPanel = document.getElementById('choices-panel');
  const dayTransition = document.getElementById('day-transition');
  const dayTitle = document.getElementById('day-title');
  const fadeOverlay = document.getElementById('fade-overlay');
  const particlesCanvas = document.getElementById('particles-canvas');
  const hudIcon = document.getElementById('hud-icon');
  const hudDay = document.getElementById('hud-day');

  Particles.init(particlesCanvas);
  Sprites.draw(hudIcon, 'giffordHorse', 1, 1);

  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  let typewriterTimer = null;
  let advancing = false;
  let currentFullText = '';

  function applyScene(sceneKey) {
    const s = SCENES[sceneKey];
    if (!s) return;
    bgLayer.style.setProperty('--scene-mid', s.mid);
    bgLayer.style.setProperty('--scene-edge', s.edge);
    bloom.style.setProperty('--bloom-color', s.bloomColor);
    Particles.setColor(s.particleColor);
  }

  function typewriter(el, text, speed = 18) {
    clearTimeout(typewriterTimer);
    el.textContent = '';
    currentFullText = text;
    let i = 0;
    advancing = true;
    (function step() {
      el.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        typewriterTimer = setTimeout(step, speed);
      } else {
        advancing = false;
      }
    })();
  }

  function renderChoices(choices, onPick) {
    choicesPanel.innerHTML = '';
    if (!choices || !choices.length) return;
    choices.forEach((c) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = c.label;
      btn.addEventListener('click', () => onPick(c.next));
      choicesPanel.appendChild(btn);
    });
  }

  function playSceneTransition(cb) {
    fadeOverlay.classList.add('active');
    setTimeout(() => {
      cb();
      fadeOverlay.classList.remove('active');
      [bgLayer, spriteCanvas, fgLayer].forEach((el) => {
        el.classList.remove('scene-zoom');
        // eslint-disable-next-line no-unused-expressions
        el.offsetWidth; // reflow to restart animation
        el.classList.add('scene-zoom');
      });
    }, 300);
  }

  function showDayTitle(day, next) {
    dayTitle.classList.remove('animate-in');
    dayTitle.textContent = `DAG ${ROMAN[day] || day}`;
    hudDay.textContent = ROMAN[day] || String(day);
    dayTransition.classList.add('visible');
    // restart CSS animation
    void dayTitle.offsetWidth;
    dayTitle.classList.add('animate-in');

    const advanceFromTitle = () => {
      dayTransition.classList.remove('visible');
      window.removeEventListener('click', advanceFromTitle);
      window.removeEventListener('keydown', keyHandler);
      playSceneTransition(() => goTo(next));
    };
    const keyHandler = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') advanceFromTitle();
    };
    setTimeout(() => {
      window.addEventListener('click', advanceFromTitle, { once: true });
      window.addEventListener('keydown', keyHandler);
    }, 900);
  }

  function playTransformation(node) {
    applyScene(node.scene);
    spriteCanvas.classList.add('revealing');
    Sprites.draw(spriteCanvas, node.sprite, 3, 0);
    speakerEl.textContent = node.speaker || '';
    textEl.className = 'narration';
    typewriter(textEl, node.text, 22);
    choicesPanel.innerHTML = '';

    let ratio = 0;
    const duration = 1400;
    const startTime = performance.now();
    Particles.burst(30);

    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      ratio = t;
      Sprites.draw(spriteCanvas, node.sprite, 3, ratio);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        spriteCanvas.classList.remove('revealing');
        Particles.burst(15);
      }
    }
    requestAnimationFrame(frame);

    advanceOnInput(() => goTo(node.next));
  }

  let pendingAdvance = null;
  function advanceOnInput(fn) {
    pendingAdvance = fn;
  }
  function clearAdvance() {
    pendingAdvance = null;
  }

  function renderNode(node) {
    clearAdvance();
    applyScene(node.scene);

    if (node.sprite) {
      Sprites.draw(spriteCanvas, node.sprite, 3, 1);
      spriteCanvas.style.display = '';
    } else {
      spriteCanvas.style.display = 'none';
    }

    speakerEl.textContent = node.speaker || '';
    textEl.className = node.speaker ? '' : 'narration';
    typewriter(textEl, node.text);

    if (node.type === 'end') {
      choicesPanel.innerHTML = '';
      setTimeout(() => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = 'Opnieuw beginnen';
        btn.addEventListener('click', () => playSceneTransition(() => goTo(STORY.start)));
        choicesPanel.appendChild(btn);
      }, 400);
      return;
    }

    if (node.choices && node.choices.length) {
      choicesPanel.innerHTML = '';
      const revealChoices = () => renderChoices(node.choices, (next) => playSceneTransition(() => goTo(next)));
      // Wait for typewriter before showing choices.
      const check = setInterval(() => {
        if (!advancing) {
          clearInterval(check);
          revealChoices();
        }
      }, 60);
    } else if (node.next) {
      choicesPanel.innerHTML = '';
      advanceOnInput(() => playSceneTransition(() => goTo(node.next)));
    }
  }

  function goTo(id) {
    const node = STORY.nodes[id];
    if (!node) return;

    if (node.type === 'daytitle') {
      choicesPanel.innerHTML = '';
      textEl.textContent = '';
      speakerEl.textContent = '';
      showDayTitle(node.day, node.next);
      return;
    }

    if (node.type === 'transform') {
      playTransformation(node);
      return;
    }

    renderNode(node);
  }

  function onAdvance() {
    if (advancing) {
      // fast-forward the typewriter
      clearTimeout(typewriterTimer);
      textEl.textContent = currentFullText;
      advancing = false;
      return;
    }
    if (pendingAdvance) {
      const fn = pendingAdvance;
      pendingAdvance = null;
      fn();
    }
  }

  document.getElementById('dialogue-panel').addEventListener('click', onAdvance);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') onAdvance();
  });

  goTo(STORY.start);
})();
