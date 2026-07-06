/* Lightweight Three.js overworld: WASD movement, billboard sprites,
 * proximity-based interaction with NPCs and exit portals. */

const World = (() => {
  let renderer, scene, camera, clock;
  let canvas;
  let player, playerBounds;
  let npcEntities = [];
  let exitEntity = null;
  let talkedTo = new Set();
  let onInteract = () => {};
  let onNearbyChange = () => {};
  let nearby = null;
  let movementEnabled = false;
  let running = false;

  const keys = Object.create(null);
  const KEY_MAP = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
  };
  const SPEED = 4.6;
  const INTERACT_RADIUS = 1.9;

  function init(canvasEl, callbacks) {
    canvas = canvasEl;
    onInteract = callbacks.onInteract || onInteract;
    onNearbyChange = callbacks.onNearbyChange || onNearbyChange;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 60);
    clock = new THREE.Clock();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('keydown', (e) => {
      if (KEY_MAP[e.code]) keys[KEY_MAP[e.code]] = true;
      if (e.code === 'Space' || e.code === 'KeyE') triggerInteract();
    });
    window.addEventListener('keyup', (e) => {
      if (KEY_MAP[e.code]) keys[KEY_MAP[e.code]] = false;
    });

    running = true;
    requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && running) {
        clock.getDelta(); // drop the huge delta accumulated while hidden
        requestAnimationFrame(loop);
      }
    });
  }

  function makeSpriteTexture(spriteName) {
    const c = document.createElement('canvas');
    Sprites.draw(c, spriteName, 3, 1);
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return { texture: tex, aspect: c.width / c.height };
  }

  function makeBillboard(spriteName, height = 2.2) {
    const { texture, aspect } = makeSpriteTexture(spriteName);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(height * aspect, height, 1);
    return sprite;
  }

  function clearScene() {
    if (scene) {
      scene.traverse((obj) => {
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
        if (obj.geometry) obj.geometry.dispose();
      });
    }
    npcEntities = [];
    exitEntity = null;
    talkedTo = new Set();
    nearby = null;
  }

  function buildStructure(def) {
    const geo = new THREE.BoxGeometry(def.size[0], def.size[1], def.size[2]);
    const mat = new THREE.MeshLambertMaterial({ color: def.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(def.pos[0], def.pos[1] + def.size[1] / 2, def.pos[2]);
    return mesh;
  }

  function enterMap(mapDef) {
    clearScene();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(mapDef.fog);
    scene.fog = new THREE.FogExp2(mapDef.fog, mapDef.fogDensity);

    scene.add(new THREE.AmbientLight(mapDef.ambient, 0.9));
    const sun = new THREE.DirectionalLight(mapDef.sun, mapDef.sunIntensity);
    sun.position.set(5, 10, 6);
    scene.add(sun);

    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshLambertMaterial({ color: mapDef.ground });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    mapDef.structures.forEach((s) => scene.add(buildStructure(s)));

    mapDef.npcs.forEach((npc) => {
      const height = 2.2 * (npc.scale || 1);
      const sprite = makeBillboard(npc.sprite, height);
      sprite.position.set(npc.pos[0], npc.pos[1] + height / 2, npc.pos[2]);
      sprite.userData = {
        type: 'npc', id: npc.id, talk: npc.talk, label: npc.label,
        finalConversation: !!npc.finalConversation,
      };
      scene.add(sprite);
      npcEntities.push(sprite);
    });

    if (mapDef.exit) {
      const ringGeo = new THREE.RingGeometry(0.9, 1.2, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: '#C9A227', transparent: true, opacity: 0.35, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(mapDef.exit.pos[0], 0.05, mapDef.exit.pos[2]);
      ring.userData = { type: 'exit', next: mapDef.exit.next, hint: mapDef.exit.hint };
      scene.add(ring);
      exitEntity = ring;
    }

    const { texture, aspect } = makeSpriteTexture('jane');
    const playerMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    player = new THREE.Sprite(playerMat);
    const pHeight = 2.2;
    player.scale.set(pHeight * aspect, pHeight, 1);
    player.position.set(mapDef.playerStart[0], pHeight / 2, mapDef.playerStart[2]);
    scene.add(player);

    playerBounds = mapDef.bounds;
    movementEnabled = true;

    camera.position.set(player.position.x, player.position.y + 6.5, player.position.z + 8.5);
    camera.lookAt(player.position.x, player.position.y + 0.6, player.position.z);
    renderer.render(scene, camera); // draw one frame now, even if movement gets paused right after
  }

  function setMovementEnabled(v) {
    movementEnabled = v;
    if (!v) { keys.up = keys.down = keys.left = keys.right = false; }
  }

  function markTalked(id) {
    talkedTo.add(id);
  }

  function exitReady() {
    return npcEntities.every((n) => talkedTo.has(n.userData.id));
  }

  function update(dt) {
    if (!scene || !player) return;

    if (movementEnabled) {
      let dx = 0, dz = 0;
      if (keys.up) dz -= 1;
      if (keys.down) dz += 1;
      if (keys.left) dx -= 1;
      if (keys.right) dx += 1;
      if (dx || dz) {
        const len = Math.hypot(dx, dz);
        dx /= len; dz /= len;
        player.position.x += dx * SPEED * dt;
        player.position.z += dz * SPEED * dt;
        player.position.x = Math.min(playerBounds.maxX, Math.max(playerBounds.minX, player.position.x));
        player.position.z = Math.min(playerBounds.maxZ, Math.max(playerBounds.minZ, player.position.z));
        if (dx !== 0) player.scale.x = Math.abs(player.scale.x) * Math.sign(dx);
      }
      const bob = Math.sin(performance.now() / 160) * 0.05 * (dx || dz ? 1 : 0);
      player.position.y = 1.1 + bob;

      // proximity check: NPCs first, then exit portal
      let found = null;
      for (const npc of npcEntities) {
        const d = Math.hypot(player.position.x - npc.position.x, player.position.z - npc.position.z);
        if (d < INTERACT_RADIUS) { found = npc.userData; break; }
      }
      if (!found && exitEntity && exitReady()) {
        const d = Math.hypot(player.position.x - exitEntity.position.x, player.position.z - exitEntity.position.z);
        if (d < INTERACT_RADIUS + 0.4) found = exitEntity.userData;
      }
      if (found !== nearby) {
        nearby = found;
        onNearbyChange(nearby);
      }

      if (exitEntity) {
        exitEntity.material.opacity = exitReady() ? 0.55 + Math.sin(performance.now() / 300) * 0.15 : 0.12;
      }
    }

    const camTargetX = player.position.x;
    const camTargetZ = player.position.z + 8.5;
    camera.position.x += (camTargetX - camera.position.x) * Math.min(1, dt * 4);
    camera.position.z += (camTargetZ - camera.position.z) * Math.min(1, dt * 4);
    camera.position.y = player.position.y + 6.5;
    camera.lookAt(player.position.x, player.position.y + 0.6, player.position.z);
  }

  function loop() {
    if (document.hidden) return; // pause; resumed by visibilitychange
    requestAnimationFrame(loop);
    if (!movementEnabled || !scene) return; // frozen: last rendered frame is enough
    const dt = Math.min(0.05, clock.getDelta());
    update(dt);
    renderer.render(scene, camera);
  }

  function getPlayerPosition() {
    return player ? { x: player.position.x, z: player.position.z } : null;
  }

  function setDirKey(dir, pressed) {
    keys[dir] = pressed;
  }

  function triggerInteract() {
    if (movementEnabled && nearby) onInteract(nearby);
  }

  return {
    init, enterMap, setMovementEnabled, markTalked, getPlayerPosition,
    setDirKey, triggerInteract,
  };
})();
