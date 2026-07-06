/* Floating dust-mote particle system for the diorama background. */

const Particles = (() => {
  let canvas, ctx, particles = [];
  let color = '212,168,90'; // amber default, as "r,g,b"
  let running = false;
  let burstUntil = 0;
  const COUNT = 32;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeParticle(y) {
    return {
      x: Math.random() * canvas.width,
      y: y !== undefined ? y : Math.random() * canvas.height,
      r: 0.8 + Math.random() * 2.2,
      speed: 6 + Math.random() * 14,
      drift: (Math.random() - 0.5) * 8,
      baseOpacity: 0.15 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    particles = Array.from({ length: COUNT }, () => makeParticle());
    running = true;
    requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && running) requestAnimationFrame(loop);
    });
  }

  function setColor(rgbString) {
    color = rgbString;
  }

  function burst(n = 20) {
    for (let i = 0; i < n; i++) {
      particles.push(makeParticle(canvas.height * (0.4 + Math.random() * 0.3)));
    }
    if (particles.length > COUNT + 40) particles.splice(0, particles.length - (COUNT + 40));
  }

  let last = performance.now();
  function loop(now) {
    if (document.hidden) { running = true; return; } // stop rAF loop while hidden
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.y -= p.speed * dt;
      p.x += Math.sin(now / 1000 + p.phase) * 0.15;
      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
      const pulse = 0.6 + 0.4 * Math.sin(now / 900 + p.phase);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${color}, ${(p.baseOpacity * pulse).toFixed(3)})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }

  return { init, setColor, burst };
})();
