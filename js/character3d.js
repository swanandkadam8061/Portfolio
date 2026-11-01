/* ===================================================
   js/character3d.js — 3D Character Battlestation & Fashion Editorial Scene
   Swanand Kadam Portfolio — Minimal Luxury Fashion meets Creative Dev
   Self-Contained Three.js Controller (Zero CORS / Zero Network Errors)
   =================================================== */

(function () {
  'use strict';

  let scene, camera, renderer, clock, mixer;
  let characterMesh = null;
  let headBone = null;
  let redRimLight = null;
  let cyberBacklight = null;
  let deskLedStrip = null;
  let mouseUnderglow = null;
  let deskPadEdge = null;
  let cyberParticles = null;
  let kineticSculpture = null;
  let isHovering = false;
  let animationsList = [];

  const container = document.getElementById('characterCanvasContainer');
  const fallbackAvatar = document.getElementById('heroFallbackAvatar');
  const modelStatus = document.getElementById('modelStatusTag');

  if (!container) return;

  function setStatus(text) {
    if (modelStatus) {
      modelStatus.innerHTML = `<span class="status-indicator"></span>${text}`;
    }
  }

  // ---------- 1. Canvas Texture: Sleek Glowing Apple Logo ----------
  function createAppleLogoTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 512, 512);

    // Subtle dark circular vignette behind logo for high contrast on any surface
    const glowGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 220);
    glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
    glowGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.fill();

    // Soft outer glow for the Apple logo
    ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowBlur = 26;

    // Iconic Apple Logo vector path
    const svgPath = 'M 155.1 79.5 c 8.8 -10.7 14.7 -25.5 13.1 -40.5 c -12.7 0.5 -28.1 8.5 -37.2 19.1 c -8 9.3 -15 24.4 -13.1 39.1 c 14.2 1.1 28.5 -7 37.2 -17.7 z M 168.2 88.5 c -20.6 -1.2 -38.2 11.8 -48.1 11.8 c -10 0 -24.4 -11.2 -40.3 -10.9 c -20.8 0.3 -40 12.1 -50.7 30.7 c -21.6 37.4 -5.5 92.7 15.5 123 c 10.3 14.8 22.5 31.2 38.6 30.6 c 15.5 -0.6 21.4 -10 40.1 -10 c 18.8 0 24.1 10 40.4 9.7 c 16.7 -0.3 27.2 -14.9 37.4 -29.8 c 11.8 -17.2 16.7 -33.9 17 -34.8 c -0.4 -0.2 -32.6 -12.5 -32.9 -49.7 c -0.3 -31.1 25.4 -46 26.6 -46.7 c -14.6 -21.4 -37.4 -23.8 -45.4 -24.3 z';

    ctx.save();
    ctx.translate(138, 70);
    ctx.scale(1.18, 1.18);

    // Brilliant silver/white metallic gradient
    const grad = ctx.createLinearGradient(0, 0, 200, 250);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#ffffff');
    grad.addColorStop(0.7, '#e4e4e7');
    grad.addColorStop(1, '#d1d5db');
    ctx.fillStyle = grad;

    if (typeof Path2D !== 'undefined') {
      const path = new Path2D(svgPath);
      ctx.fill(path);
      ctx.fill(path); // Double-pass for crisp opacity
    } else {
      ctx.beginPath();
      ctx.arc(100, 125, 60, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
  }

  // ---------- 2. Realistic Gaming Battlestation Accessories ----------
  function createGamingBattlestation(targetScene) {
    const battlestationGroup = new THREE.Group();
    battlestationGroup.name = 'battlestationEnvironment';

    // A. Gaming Desk Pad (running under keyboard and mouse)
    const padGeo = new THREE.BoxGeometry(6.9, 0.024, 3.3);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x0e0e0e,
      roughness: 0.88,
      metalness: 0.08,
    });
    const deskPad = new THREE.Mesh(padGeo, padMat);
    deskPad.position.set(0.35, 9.02, 3.55);
    deskPad.receiveShadow = true;
    battlestationGroup.add(deskPad);

    // Crimson glowing edge piping on mousepad
    const edgeGeo = new THREE.BoxGeometry(6.94, 0.015, 3.34);
    const edgeMat = new THREE.MeshBasicMaterial({
      color: 0xe50914,
      transparent: true,
      opacity: 0.85,
    });
    deskPadEdge = new THREE.Mesh(edgeGeo, edgeMat);
    deskPadEdge.position.set(0.35, 9.015, 3.55);
    battlestationGroup.add(deskPadEdge);

    // B. Realistic Ergonomic Gaming Mouse
    const mouseGroup = new THREE.Group();
    mouseGroup.name = 'gamingMouse';

    // Sculpted ergonomic mouse shell (Matte stealth black)
    const mouseBodyGeo = new THREE.SphereGeometry(0.36, 22, 16);
    mouseBodyGeo.scale(0.82, 0.52, 1.32);
    const mouseBodyMat = new THREE.MeshStandardMaterial({
      color: 0x151515,
      roughness: 0.32,
      metalness: 0.3,
    });
    const mouseBody = new THREE.Mesh(mouseBodyGeo, mouseBodyMat);
    mouseBody.position.set(0, 0.15, 0);
    mouseBody.castShadow = true;
    mouseGroup.add(mouseBody);

    // Click button separation slit
    const clickSlitGeo = new THREE.BoxGeometry(0.016, 0.08, 0.44);
    const clickSlitMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const clickSlit = new THREE.Mesh(clickSlitGeo, clickSlitMat);
    clickSlit.position.set(0, 0.27, -0.22);
    mouseGroup.add(clickSlit);

    // Metallic Scroll Wheel with glowing crimson ring
    const wheelGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.038, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0xe50914,
      roughness: 0.25,
      metalness: 0.85,
      emissive: 0xe50914,
      emissiveIntensity: 0.7,
    });
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(0, 0.27, -0.2);
    mouseGroup.add(wheel);

    // Subtle Crimson Gaming Logo on palm rest
    const mouseLogoGeo = new THREE.PlaneGeometry(0.11, 0.11);
    mouseLogoGeo.rotateX(-Math.PI / 2.25);
    const mouseLogoMat = new THREE.MeshBasicMaterial({
      color: 0xff2d2d,
      transparent: true,
      opacity: 0.8,
    });
    const mouseLogo = new THREE.Mesh(mouseLogoGeo, mouseLogoMat);
    mouseLogo.position.set(0, 0.265, 0.15);
    mouseGroup.add(mouseLogo);

    // Mouse Ambient RGB Underglow Light
    mouseUnderglow = new THREE.PointLight(0xe50914, 0.75, 1.8);
    mouseUnderglow.position.set(0, 0.08, 0);
    mouseGroup.add(mouseUnderglow);

    // Position mouse right beside keyboard
    mouseGroup.position.set(2.85, 9.06, 3.55);
    mouseGroup.rotation.y = -0.06;
    battlestationGroup.add(mouseGroup);

    // C. Studio Monitor / Gaming Speakers (Flanking the setup)
    const speakerPositions = [-3.45, 3.65];
    speakerPositions.forEach((posX, idx) => {
      const spkGroup = new THREE.Group();
      // Cabinet
      const cabGeo = new THREE.BoxGeometry(0.48, 0.88, 0.52);
      const cabMat = new THREE.MeshStandardMaterial({
        color: 0x121212,
        roughness: 0.45,
        metalness: 0.4,
      });
      const cabinet = new THREE.Mesh(cabGeo, cabMat);
      cabinet.castShadow = true;
      spkGroup.add(cabinet);

      // Woofer driver with crimson ring
      const wooferRingGeo = new THREE.TorusGeometry(0.14, 0.016, 12, 24);
      const wooferRingMat = new THREE.MeshStandardMaterial({
        color: 0xe50914,
        emissive: 0xe50914,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.6,
      });
      const wooferRing = new THREE.Mesh(wooferRingGeo, wooferRingMat);
      wooferRing.position.set(0, -0.1, 0.265);
      spkGroup.add(wooferRing);

      // Tweeter
      const tweeterGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const tweeterMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
      const tweeter = new THREE.Mesh(tweeterGeo, tweeterMat);
      tweeter.position.set(0, 0.22, 0.265);
      spkGroup.add(tweeter);

      // Angle speakers slightly toward character
      spkGroup.position.set(posX, 9.46, 4.25);
      spkGroup.rotation.y = idx === 0 ? 0.32 : -0.32;
      battlestationGroup.add(spkGroup);
    });

    // D. Acoustic Studio Slat Wall Panels (Dark minimalist background)
    const wallGroup = new THREE.Group();
    const slatMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d0d,
      roughness: 0.9,
      metalness: 0.1,
    });
    for (let i = -5; i <= 5; i++) {
      const slatGeo = new THREE.BoxGeometry(0.28, 8.5, 0.08);
      const slat = new THREE.Mesh(slatGeo, slatMat);
      slat.position.set(i * 0.72, 13.0, -3.8);
      wallGroup.add(slat);
    }
    battlestationGroup.add(wallGroup);

    // E. Floating Cyber Dust / Embers Particle System
    const particleCount = 55;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = 8.5 + Math.random() * 8;
      particlePositions[i + 2] = -2.5 + (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xff3344,
      size: 0.09,
      transparent: true,
      opacity: 0.45,
    });
    cyberParticles = new THREE.Points(particleGeo, particleMat);
    battlestationGroup.add(cyberParticles);

    targetScene.add(battlestationGroup);
  }

  // ---------- 3. Fashion-Inspired Elements & Luxury Accessories ----------
  function createFashionElements(targetScene) {
    const fashionGroup = new THREE.Group();
    fashionGroup.name = 'fashionEditorialElements';

    // A. Miniature Runway Figurine 1: Elegant Tailored Suit (Left Desk Stand)
    const suitMannequin = new THREE.Group();
    suitMannequin.name = 'tailoredSuitFigure';

    // Slim trousers (Dark charcoal)
    const legGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.58, 12);
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7, metalness: 0.15 });
    const legL = new THREE.Mesh(legGeo, suitMat); legL.position.set(-0.06, 0.29, 0); suitMannequin.add(legL);
    const legR = new THREE.Mesh(legGeo, suitMat); legR.position.set(0.06, 0.29, 0); suitMannequin.add(legR);

    // Tailored jacket torso with slim lapel cut
    const torsoGeo = new THREE.BoxGeometry(0.24, 0.44, 0.13);
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.55, metalness: 0.2 });
    const torso = new THREE.Mesh(torsoGeo, jacketMat); torso.position.set(0, 0.74, 0); suitMannequin.add(torso);

    // Crimson red pocket square accent
    const pocketSquareGeo = new THREE.BoxGeometry(0.04, 0.02, 0.02);
    const pocketSquareMat = new THREE.MeshBasicMaterial({ color: 0xe50914 });
    const pocketSquare = new THREE.Mesh(pocketSquareGeo, pocketSquareMat);
    pocketSquare.position.set(0.06, 0.85, 0.068);
    suitMannequin.add(pocketSquare);

    // Minimalist chrome mannequin head
    const headGeo = new THREE.SphereGeometry(0.085, 18, 18);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.15 });
    const head = new THREE.Mesh(headGeo, headMat); head.position.set(0, 1.05, 0); suitMannequin.add(head);

    // Pedestal base
    const baseGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.03, 20);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.7, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat); base.position.set(0, 0.015, 0); suitMannequin.add(base);

    suitMannequin.position.set(-3.25, 9.04, 3.2);
    suitMannequin.rotation.y = 0.28;
    fashionGroup.add(suitMannequin);

    // B. Miniature Runway Figurine 2: Modern Dark Streetwear Outfit (Right Desk Stand)
    const streetwearMannequin = new THREE.Group();
    streetwearMannequin.name = 'streetwearFigure';

    // Layered cargo joggers
    const cargoMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.85, metalness: 0.05 });
    const sLegL = new THREE.Mesh(legGeo, cargoMat); sLegL.position.set(-0.065, 0.29, 0); streetwearMannequin.add(sLegL);
    const sLegR = new THREE.Mesh(legGeo, cargoMat); sLegR.position.set(0.065, 0.29, 0); streetwearMannequin.add(sLegR);

    // Oversized dropped-shoulder modern fashion hoodie
    const hoodieGeo = new THREE.BoxGeometry(0.28, 0.46, 0.16);
    const hoodieMat = new THREE.MeshStandardMaterial({ color: 0x131313, roughness: 0.9, metalness: 0.05 });
    const sTorso = new THREE.Mesh(hoodieGeo, hoodieMat); sTorso.position.set(0, 0.74, 0); streetwearMannequin.add(sTorso);

    // Sculpted hoodie collar
    const collarGeo = new THREE.TorusGeometry(0.09, 0.035, 12, 18);
    collarGeo.rotateX(Math.PI / 2);
    const collar = new THREE.Mesh(collarGeo, hoodieMat); collar.position.set(0, 0.96, 0); streetwearMannequin.add(collar);

    // Matte black mannequin head with subtle visor line
    const sHead = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5, roughness: 0.4 }));
    sHead.position.set(0, 1.05, 0); streetwearMannequin.add(sHead);

    const sBase = new THREE.Mesh(baseGeo, baseMat); sBase.position.set(0, 0.015, 0); streetwearMannequin.add(sBase);

    streetwearMannequin.position.set(3.7, 9.04, 3.2);
    streetwearMannequin.rotation.y = -0.28;
    fashionGroup.add(streetwearMannequin);

    // C. Designer High-Top Sneaker (Sculptural Desk Art Object)
    const sneaker = new THREE.Group();
    sneaker.name = 'designerSneaker';

    // Chunky architectural sole
    const soleGeo = new THREE.BoxGeometry(0.18, 0.045, 0.48);
    const soleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.1 });
    const sole = new THREE.Mesh(soleGeo, soleMat); sneaker.add(sole);

    // Layered high-top upper (Stealth black leather)
    const upperGeo = new THREE.BoxGeometry(0.16, 0.16, 0.42);
    const upperMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.65, metalness: 0.25 });
    const upper = new THREE.Mesh(upperGeo, upperMat); upper.position.set(0, 0.1, -0.02); sneaker.add(upper);

    // Crimson red heel loop tab
    const heelTabGeo = new THREE.BoxGeometry(0.03, 0.08, 0.02);
    const heelTabMat = new THREE.MeshBasicMaterial({ color: 0xe50914 });
    const heelTab = new THREE.Mesh(heelTabGeo, heelTabMat); heelTab.position.set(0, 0.17, 0.19); sneaker.add(heelTab);

    sneaker.position.set(-2.55, 9.04, 4.35);
    sneaker.rotation.y = 0.35;
    fashionGroup.add(sneaker);

    // D. Minimalist Luxury Chronograph Watch (Resting on desk pad)
    const watch = new THREE.Group();
    watch.name = 'luxuryWatch';

    const dialGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.022, 24);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0x090909, metalness: 0.88, roughness: 0.18 });
    const dial = new THREE.Mesh(dialGeo, dialMat); watch.add(dial);

    const bezelGeo = new THREE.TorusGeometry(0.13, 0.015, 12, 32);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0xe50914, metalness: 0.92, roughness: 0.12 });
    const bezel = new THREE.Mesh(bezelGeo, bezelMat); bezel.rotation.x = Math.PI / 2; watch.add(bezel);

    const strapGeo = new THREE.BoxGeometry(0.08, 0.015, 0.38);
    const strapMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85 });
    const strap = new THREE.Mesh(strapGeo, strapMat); watch.add(strap);

    watch.position.set(3.35, 9.03, 4.35);
    watch.rotation.y = -0.22;
    fashionGroup.add(watch);

    // E. Designer Minimalist Sunglasses (Folded on desk pad)
    const shades = new THREE.Group();
    shades.name = 'designerSunglasses';

    const lensGeo = new THREE.BoxGeometry(0.14, 0.065, 0.012);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x040404, roughness: 0.08, metalness: 0.95 });
    const lensL = new THREE.Mesh(lensGeo, lensMat); lensL.position.set(-0.085, 0, 0); shades.add(lensL);
    const lensR = new THREE.Mesh(lensGeo, lensMat); lensR.position.set(0.085, 0, 0); shades.add(lensR);

    // Slim wireframe bridge with subtle red accent
    const bridgeGeo = new THREE.BoxGeometry(0.05, 0.01, 0.01);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xe50914, metalness: 0.9, roughness: 0.2 });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat); bridge.position.set(0, 0.015, 0); shades.add(bridge);

    shades.position.set(-1.85, 9.03, 4.45);
    shades.rotation.y = 0.18;
    fashionGroup.add(shades);

    // F. Floating Kinetic Luxury Mobile / Sculpture (Background Ambient Art)
    kineticSculpture = new THREE.Group();
    kineticSculpture.name = 'kineticFashionSculpture';

    const ringGeo = new THREE.TorusGeometry(0.75, 0.018, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 });
    const outerRing = new THREE.Mesh(ringGeo, ringMat);
    kineticSculpture.add(outerRing);

    const innerGeo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x181818,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xe50914,
      emissiveIntensity: 0.35,
    });
    const innerCube = new THREE.Mesh(innerGeo, innerMat);
    innerCube.rotation.set(0.78, 0.78, 0.78);
    kineticSculpture.add(innerCube);

    kineticSculpture.position.set(4.4, 14.2, -1.8);
    fashionGroup.add(kineticSculpture);

    targetScene.add(fashionGroup);
  }

  // ---------- 4. Scene Initialization ----------
  function initThreeScene() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not found');
      if (fallbackAvatar) fallbackAvatar.style.display = 'flex';
      setStatus('3D Engine Offline');
      return;
    }

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 420;

    // 1. Scene
    scene = new THREE.Scene();

    // 2. Camera Setup — Elevated & Framed so character face is the undisputed focal point
    const aspect = width / height;
    camera = new THREE.PerspectiveCamera(21, aspect, 0.1, 1000);
    updateCameraPosition();

    // 3. Renderer with High-Precision Tone Mapping
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      renderer.outputEncoding = THREE.sRGBEncoding;

      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('WebGL init failed:', err);
      if (fallbackAvatar) fallbackAvatar.style.display = 'flex';
      setStatus('WebGL Fallback');
      return;
    }

    clock = new THREE.Clock();

    // 4. Lighting — Cinematic Editorial Lighting (Face Key + Crimson Rim + Cyber Backlight)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.94);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf8f8f8, 1.35);
    keyLight.position.set(-4, 15, 12);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdddddd, 0.7);
    fillLight.position.set(5, 12, 10);
    scene.add(fillLight);

    // Dedicated Face Key Light: Soft, clean illumination highlighting face & gaze
    const faceLight = new THREE.DirectionalLight(0xfffbf7, 0.88);
    faceLight.position.set(0, 14.0, 12);
    scene.add(faceLight);

    // Crimson Red Rim Light (casting scarlet rim from behind)
    redRimLight = new THREE.DirectionalLight(0xe50914, 3.4);
    redRimLight.position.set(5, 14, -8);
    scene.add(redRimLight);

    const redPoint = new THREE.PointLight(0xff2d2d, 1.9, 30);
    redPoint.position.set(-6, 12, -4);
    scene.add(redPoint);

    // Dual-tone Cyber Indigo/Violet Backlight (editorial studio contrast)
    cyberBacklight = new THREE.PointLight(0x6366f1, 2.0, 22);
    cyberBacklight.position.set(4.5, 13.2, -3.5);
    scene.add(cyberBacklight);

    // Desk Rear Crimson LED Strip Light
    deskLedStrip = new THREE.PointLight(0xe50914, 2.0, 10);
    deskLedStrip.position.set(0, 9.2, 5.0);
    scene.add(deskLedStrip);

    // Laptop screen emissive point light
    const screenGlow = new THREE.PointLight(0xffffff, 1.1, 5);
    screenGlow.position.set(0, 9.4, 4.2);
    scene.add(screenGlow);

    // 5. Build Battlestation & Fashion Environment
    createGamingBattlestation(scene);
    createFashionElements(scene);

    // 6. Load Model (Supports Base64 offline memory load + network fallback)
    loadModel();

    // 7. Interactive Mouse Head Tracking
    setupHeadTracking();

    // 8. Responsive Resize
    window.addEventListener('resize', onWindowResize, { passive: true });

    // 9. Animation Loop
    animate();
  }

  function updateCameraPosition() {
    if (!camera) return;
    if (window.innerWidth < 768) {
      camera.fov = 22;
      camera.position.set(0, 13.1, 23.5);
      camera.lookAt(0, 11.1, 2.2);
    } else {
      camera.fov = 21;
      camera.position.set(0, 13.05, 21.8);
      camera.lookAt(0, 11.2, 2.2);
    }
    camera.updateProjectionMatrix();
  }

  function onModelLoaded(gltf) {
    characterMesh = gltf.scene;

    // 1. Proportional Monitor Resizing — Monitor made slightly smaller (0.63x) so face is the prominent focal point
    const monitorLid = characterMesh.getObjectByName('Plane.004');
    const screenLight = characterMesh.getObjectByName('screenlight');
    const monitorStand = characterMesh.getObjectByName('Plane');
    const monitorScale = 0.63;

    if (monitorLid) {
      monitorLid.scale.set(monitorScale, monitorScale, monitorScale);
      monitorLid.position.set(-0.063, 9.04, 4.96);
      monitorLid.rotation.x = 0.09;

      // Add Clearly Visible, Sleek Metallic Glowing Apple Logo on the back of the monitor lid
      const appleTexture = createAppleLogoTexture();
      if (appleTexture) {
        const appleGeo = new THREE.PlaneGeometry(0.72, 0.72);
        const appleMat = new THREE.MeshBasicMaterial({
          map: appleTexture,
          transparent: true,
          opacity: 0.98,
          side: THREE.DoubleSide,
          depthWrite: false, // Prevents z-fighting on lid surface
        });
        const appleMesh = new THREE.Mesh(appleGeo, appleMat);
        // Positioned flush on the back of the lid facing the camera
        appleMesh.position.set(0, 2.05, 0.055);
        appleMesh.rotation.x = -0.131;
        monitorLid.add(appleMesh);
      }
    }

    if (screenLight) {
      screenLight.scale.set(monitorScale, monitorScale, monitorScale);
      screenLight.position.set(-0.053, 9.04, 4.96);
      screenLight.rotation.x = 0.09;
    }

    // 2. Proportional monitor stand reduction (scale down from original 1.578 to 1.10)
    if (monitorStand) {
      monitorStand.scale.set(1.10, 1.10, 1.10);
    }

    // 3. Materials Styling & Clean Dark Aesthetic
    characterMesh.traverse((child) => {
      // Hide ground plane for clean circular backdrop
      if (child.name === 'ground' || child.name.includes('ground') || (child.material && child.material.name.includes('ground'))) {
        child.visible = false;
      }

      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Black hoodie styling
        if (child.name === 'BODY.SHIRT' || child.name.includes('SHIRT') || child.name.includes('Body')) {
          child.material = child.material.clone();
          child.material.color.set('#141414');
          child.material.roughness = 0.85;
          child.material.metalness = 0.05;
        } else if (child.name === 'Pant' || child.name.includes('Pant')) {
          child.material = child.material.clone();
          child.material.color.set('#0d0d0d');
          child.material.roughness = 0.9;
        } else if (child.name === 'screenlight') {
          child.material = child.material.clone();
          child.material.color.set('#ffffff');
          child.material.emissive.set('#ff2d2d');
          child.material.emissiveIntensity = 0.38;
        } else if (child.name === 'Plane.004' || child.name.includes('Plane.004')) {
          // Sleek dark MacBook aluminum matte finish
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.roughness = Math.max(mat.roughness, 0.32);
              mat.metalness = Math.min(mat.metalness, 0.65);
            });
          } else if (child.material) {
            child.material.roughness = Math.max(child.material.roughness, 0.32);
            child.material.metalness = Math.min(child.material.metalness, 0.65);
          }
        } else if (child.material) {
          child.material.roughness = Math.max(child.material.roughness, 0.3);
        }
      }
    });

    // Find head bone (spine.006 in character.glb)
    headBone = characterMesh.getObjectByName('spine.006') ||
               characterMesh.getObjectByName('spine006') ||
               characterMesh.getObjectByName('head') || null;

    // Animation Mixer Setup
    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(characterMesh);
      animationsList = gltf.animations;

      // Start typing animation on laptop
      const typingClip = THREE.AnimationClip.findByName(animationsList, 'typing');
      if (typingClip) {
        const action = mixer.clipAction(typingClip);
        action.play();
        action.timeScale = 1.0;
      }

      // Keyboard key click animations
      const keyClips = ['key1', 'key2', 'key5', 'key6'];
      keyClips.forEach((name) => {
        const clip = THREE.AnimationClip.findByName(animationsList, name);
        if (clip) {
          const action = mixer.clipAction(clip);
          action.play();
          action.timeScale = 1.15;
        }
      });

      // Blinking animation
      const blinkClip = THREE.AnimationClip.findByName(animationsList, 'Blink');
      if (blinkClip) {
        const blinkAction = mixer.clipAction(blinkClip);
        blinkAction.play();
      }
    }

    scene.add(characterMesh);

    // Hide fallback avatar
    if (fallbackAvatar) fallbackAvatar.style.display = 'none';
    setStatus('FASHION EDITORIAL · LEVEL 99 // BATTLESTATION');
  }

  function loadModel() {
    const LoaderClass = THREE.GLTFLoader;
    if (!LoaderClass) {
      console.warn('GLTFLoader not found');
      if (fallbackAvatar) fallbackAvatar.style.display = 'flex';
      setStatus('3D Avatar Ready');
      return;
    }

    const loader = new LoaderClass();
    setStatus('Loading 3D Battlestation...');

    // Method A: In-memory Base64 Data (Zero network requests, Zero CORS issues over file:// or http)
    if (typeof window.CHARACTER_MODEL_BASE64 === 'string' && window.CHARACTER_MODEL_BASE64.length > 1000) {
      try {
        const binString = window.atob(window.CHARACTER_MODEL_BASE64);
        const len = binString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binString.charCodeAt(i);
        }

        loader.parse(
          bytes.buffer,
          '',
          (gltf) => {
            onModelLoaded(gltf);
          },
          (err) => {
            console.warn('Error parsing base64 model:', err);
            loadViaFetch(loader);
          }
        );
        return;
      } catch (e) {
        console.warn('Base64 parse exception, trying fetch:', e);
      }
    }

    // Method B: Standard URL fetch
    loadViaFetch(loader);
  }

  function loadViaFetch(loader) {
    const modelPath = 'assets/models/character.glb';
    loader.load(
      modelPath,
      (gltf) => {
        onModelLoaded(gltf);
      },
      (xhr) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setStatus(`Loading 3D: ${percent}%`);
        }
      },
      (error) => {
        console.warn('GLTFLoader load notice:', error);
        if (fallbackAvatar) fallbackAvatar.style.display = 'flex';
        setStatus('3D Avatar Ready');
      }
    );
  }

  function setupHeadTracking() {
    let mouse = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    // Smooth head turning toward mouse
    setInterval(() => {
      if (headBone && characterMesh) {
        const maxRotY = Math.PI * 0.22;
        const maxRotX = Math.PI * 0.14;

        targetRotation.y = mouse.x * maxRotY;
        targetRotation.x = -mouse.y * maxRotX;

        headBone.rotation.y += (targetRotation.y - headBone.rotation.y) * 0.08;
        headBone.rotation.x += (targetRotation.x - headBone.rotation.x) * 0.08;
      }
    }, 1000 / 60);

    // Hover effect on the 3D stage
    if (container.parentElement) {
      container.parentElement.addEventListener('mouseenter', () => {
        isHovering = true;
        if (redRimLight) redRimLight.intensity = 4.2;
        if (cyberBacklight) cyberBacklight.intensity = 2.5;
      });

      container.parentElement.addEventListener('mouseleave', () => {
        isHovering = false;
        if (redRimLight) redRimLight.intensity = 3.4;
        if (cyberBacklight) cyberBacklight.intensity = 2.0;
      });
    }
  }

  function onWindowResize() {
    if (!renderer || !camera || !container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    updateCameraPosition();
    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock ? clock.getDelta() : 0.016;
    const elapsed = clock ? clock.getElapsedTime() : 0;

    if (mixer) mixer.update(delta);

    // Ambient Gaming Lighting Breathing Animations
    if (mouseUnderglow) {
      mouseUnderglow.intensity = 0.55 + 0.35 * Math.sin(elapsed * 2.6);
    }
    if (deskPadEdge && deskPadEdge.material) {
      deskPadEdge.material.opacity = 0.65 + 0.25 * Math.sin(elapsed * 1.8);
    }
    if (cyberParticles) {
      const positions = cyberParticles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.007;
        if (positions[i] > 16.5) {
          positions[i] = 7.5;
        }
      }
      cyberParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Elegant rotation of kinetic luxury sculpture
    if (kineticSculpture) {
      kineticSculpture.rotation.y = elapsed * 0.35;
      kineticSculpture.rotation.x = Math.sin(elapsed * 0.2) * 0.15;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initThreeScene, 100));
  } else {
    setTimeout(initThreeScene, 100);
  }
})();
