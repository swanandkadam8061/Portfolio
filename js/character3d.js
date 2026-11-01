/* ===================================================
   js/character3d.js — 3D Doll Character Model Controller
   Merged from Portfolio-Website Three.js System
   Fully Self-Contained (Zero CORS / Zero Network Errors)
   =================================================== */

(function () {
  'use strict';

  let scene, camera, renderer, clock, mixer;
  let characterMesh = null;
  let headBone = null;
  let redRimLight = null;
  let isHovering = false;
  let animationsList = [];

  const container = document.getElementById('characterCanvasContainer');
  const fallbackAvatar = document.getElementById('heroFallbackAvatar');
  const modelStatus = document.getElementById('modelStatusTag');

  if (!container) return;

  function setStatus(text) {
    if (modelStatus) {
      modelStatus.textContent = text;
    }
  }

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

    // 2. Camera Setup
    const aspect = width / height;
    camera = new THREE.PerspectiveCamera(19, aspect, 0.1, 1000);
    // Position framed on developer's chest, head (y=11.5) and laptop (y=9.1, z=3.5)
    updateCameraPosition();

    // 3. Renderer with Alpha Transparency
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.outputEncoding = THREE.sRGBEncoding;

      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('WebGL init failed:', err);
      if (fallbackAvatar) fallbackAvatar.style.display = 'flex';
      setStatus('WebGL Fallback');
      return;
    }

    clock = new THREE.Clock();

    // 4. Lighting — Cinematic Monochromatic with Crimson Red Rim
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key light (soft neutral white from front-left)
    const keyLight = new THREE.DirectionalLight(0xf5f5f5, 1.3);
    keyLight.position.set(-4, 15, 12);
    scene.add(keyLight);

    // Fill light (neutral soft grey from front-right)
    const fillLight = new THREE.DirectionalLight(0xcccccc, 0.7);
    fillLight.position.set(5, 12, 10);
    scene.add(fillLight);

    // Subtle Crimson Red Rim Light (casting scarlet rim from behind)
    redRimLight = new THREE.DirectionalLight(0xe50914, 2.8);
    redRimLight.position.set(5, 14, -8);
    scene.add(redRimLight);

    // Secondary subtle red point light
    const redPoint = new THREE.PointLight(0xff2d2d, 1.8, 30);
    redPoint.position.set(-6, 12, -4);
    scene.add(redPoint);

    // Laptop screen emissive point light
    const screenGlow = new THREE.PointLight(0xffffff, 1.2, 5);
    screenGlow.position.set(0, 9.4, 4.2);
    scene.add(screenGlow);

    // 5. Load Model (Supports Base64 offline memory load + network fallback)
    loadModel();

    // 6. Interactive Mouse Head Tracking
    setupHeadTracking();

    // 7. Responsive Resize
    window.addEventListener('resize', onWindowResize, { passive: true });

    // 8. Animation Loop
    animate();
  }

  function updateCameraPosition() {
    if (!camera) return;
    if (window.innerWidth < 768) {
      camera.fov = 22;
      camera.position.set(0, 12.8, 24);
      camera.lookAt(0, 10.2, 2);
    } else {
      camera.fov = 19;
      camera.position.set(0, 12.6, 21.5);
      camera.lookAt(0, 10.4, 2.5);
    }
    camera.updateProjectionMatrix();
  }

  function onModelLoaded(gltf) {
    characterMesh = gltf.scene;

    // Apply dark hoodie styling and hide ground plane
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
          child.material.emissiveIntensity = 0.35;
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
    setStatus('✦ 3D Character Active');
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
    setStatus('Loading 3D Doll...');

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
        if (redRimLight) redRimLight.intensity = 3.8;
      });

      container.parentElement.addEventListener('mouseleave', () => {
        isHovering = false;
        if (redRimLight) redRimLight.intensity = 2.8;
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
    if (mixer) mixer.update(delta);

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
