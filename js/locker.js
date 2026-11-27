/* ===================================================
   js/locker.js — the 3D locker around the character
   Builds the steel shell, swinging door, shelf gear and
   stickers, and handles tapping objects to open sections.
   character3d.js owns the renderer, camera and loop.
   Everything here is original geometry and lettering.
   =================================================== */

window.PortfolioLocker = (() => {
  'use strict';

  const HALF = 4.35;                 // half width of the opening
  const BACK = -2.0, FRONT = 6.35;   // depth
  const FLOOR = 7.25, TOP = 16.2;    // height
  const DOOR_W = 2.75;

  function build(scene, renderer) {
    const T = window.THREE;
    const root = new T.Group();
    root.name = 'locker';
    scene.add(root);

    const targets = [];   // tappable groups
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- materials ----------
    // A tiny studio of soft panels, used only for reflections on the locker steel
    let envMap = null;
    try {
      const pmrem = new T.PMREMGenerator(renderer);
      const studio = new T.Scene();
      studio.background = new T.Color(0x050506);
      [[0xffffff, 0, 9, 4, 10, 2], [0xff2e3a, -9, 1, -2, 1.5, 8], [0x9a9a9a, 9, 2, 3, 2, 8]].forEach(([c, x, y, z, w, h]) => {
        const panel = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: c, side: T.DoubleSide }));
        panel.position.set(x, y, z);
        panel.lookAt(0, 0, 0);
        studio.add(panel);
      });
      envMap = pmrem.fromScene(studio, 0.04).texture;
      pmrem.dispose();
    } catch (e) { /* reflections are optional */ }

    const std = (color, roughness = 0.6, metalness = 0.2, extra = {}) =>
      new T.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    const steel = std(0x34343a, 0.46, 0.62, { envMap, envMapIntensity: 0.9 });
    const steelDark = std(0x1c1c20, 0.55, 0.55, { envMap, envMapIntensity: 0.7 });
    const black = std(0x0b0b0d, 0.7, 0.2);
    const white = std(0xe9e6e1, 0.65, 0.05);
    const red = std(0xd9111f, 0.4, 0.25);
    const wood = std(0xb9b3a9, 0.7, 0.05);

    function add(geometry, material, x, y, z, parent = root) {
      const mesh = new T.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    const box = (w, h, d, material, x, y, z, parent) => add(new T.BoxGeometry(w, h, d), material, x, y, z, parent);
    const cyl = (r1, r2, h, material, x, y, z, parent, seg = 24) => add(new T.CylinderGeometry(r1, r2, h, seg), material, x, y, z, parent);

    function canvasTexture(w, h, draw) {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      const texture = new T.CanvasTexture(canvas);
      texture.colorSpace = T.SRGBColorSpace;
      texture.anisotropy = 4;
      const paint = () => { ctx.clearRect(0, 0, w, h); draw(ctx, w, h); texture.needsUpdate = true; };
      paint();
      if (document.fonts && document.fonts.load) {
        Promise.all([document.fonts.load('600 40px "Mona Sans"'), document.fonts.load('700 40px "Caveat"')])
          .then(() => { paint(); api.dirty = true; }, () => {});
      }
      return texture;
    }
    function decal(w, h, px, py, draw, parent, x, y, z, glow = 0.16) {
      const map = canvasTexture(px, py, draw);
      const material = new T.MeshStandardMaterial({
        map, transparent: true, alphaTest: 0.05, roughness: 0.8, metalness: 0,
        emissive: 0xffffff, emissiveMap: map, emissiveIntensity: glow
      });
      const mesh = new T.Mesh(new T.PlaneGeometry(w, h), material);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    }
    function rounded(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    const SANS = '"Mona Sans", Arial, sans-serif';
    const HAND = '"Caveat", cursive';
    function text(ctx, value, x, y, size, color, family = SANS, weight = 600) {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${size}px ${family}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value, x, y);
    }

    // A named, tappable object. `target` is the id of the section or card it opens.
    function hotspot(name, label, target, parent = root) {
      const group = new T.Group();
      group.name = name;
      group.userData = { label, target, lift: 0 };
      parent.add(group);
      targets.push(group);
      return group;
    }

    // ---------- shell ----------
    const depth = FRONT - BACK, midZ = (FRONT + BACK) / 2, height = TOP - FLOOR, midY = (TOP + FLOOR) / 2;
    box(HALF * 2 + 0.2, height, 0.12, steelDark, 0, midY, BACK);
    [-1, 1].forEach((side) => {
      box(0.18, height, depth, steel, side * (HALF + 0.09), midY, midZ);
      box(0.3, height + 0.2, 0.2, steel, side * (HALF + 0.12), midY, FRONT);   // front post
    });
    box(HALF * 2 + 0.5, 0.34, 0.24, steel, 0, TOP, FRONT);                      // top rail
    box(HALF * 2 + 0.2, 0.14, depth, steelDark, 0, TOP + 0.1, midZ);            // roof
    box(HALF * 2 + 0.5, 1.5, 0.14, steel, 0, FLOOR + 0.78, FRONT + 0.06);       // kick panel under the desk
    for (let i = 0; i < 4; i++) box(2.5, 0.075, 0.05, black, 0, FLOOR + 0.42 + i * 0.25, FRONT + 0.15);
    // red pin-stripe on the lip and rivets on the frame
    box(HALF * 2 + 0.5, 0.05, 0.03, std(0xff2e3a, 0.4, 0.2, { emissive: 0xff2e3a, emissiveIntensity: 0.55 }), 0, FLOOR + 1.52, FRONT + 0.14);
    [-1, 1].forEach((side) => [8.0, 10.4, 12.8, 15.2].forEach((y) => {
      cyl(0.055, 0.055, 0.04, white, side * (HALF + 0.12), y, FRONT + 0.11, root, 12).rotation.x = Math.PI / 2;
    }));
    // pressed ribs on the back wall
    [-2.9, -1.45, 0, 1.45, 2.9].forEach((x) => box(0.07, height - 0.4, 0.05, steel, x, midY, BACK + 0.09));
    // top shelf
    box(HALF * 2, 0.13, 2.5, steel, 0, 14.98, -0.75);
    box(HALF * 2, 0.07, 0.06, white, 0, 14.98, 0.52);

    // ---------- lamp ----------
    const tubeMat = new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3e6, emissiveIntensity: 1.5 });
    box(2.5, 0.12, 0.16, tubeMat, 0, TOP - 0.28, 3.4);
    box(2.8, 0.1, 0.34, black, 0, TOP - 0.17, 3.4);
    const lamp = new T.SpotLight(0xfff1e4, 95, 24, 1.05, 0.75, 2);
    lamp.position.set(-0.6, TOP - 0.45, 5.2);
    lamp.target.position.set(0, 9.4, 0.6);
    if (renderer.shadowMap.enabled) {
      lamp.castShadow = true;
      lamp.shadow.mapSize.set(1024, 1024);
      lamp.shadow.bias = -0.0015;
      lamp.shadow.radius = 4;
    }
    root.add(lamp, lamp.target);
    const redWash = new T.PointLight(0xff1f2e, 26, 9, 2);
    redWash.position.set(0, 12.6, -1.35);
    root.add(redWash);

    // ---------- back wall: poster and notes ----------
    const poster = hotspot('poster', 'Anime, movies and series', 'interest-anime');
    decal(1.75, 2.35, 350, 470, (c, w, h) => {
      c.fillStyle = '#ece8e2'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#0c0c0e'; c.fillRect(16, 16, w - 32, h - 32);
      c.save(); c.beginPath(); c.rect(16, 16, w - 32, h - 32); c.clip();
      c.translate(w / 2, h * 0.4);
      c.strokeStyle = 'rgba(236,232,226,.55)';
      for (let i = 0; i < 40; i++) {            // speed lines
        c.rotate(Math.PI / 20); c.lineWidth = i % 3 ? 2 : 5;
        c.beginPath(); c.moveTo(104 + (i % 4) * 9, 0); c.lineTo(320, 0); c.stroke();
      }
      c.fillStyle = '#d9111f'; c.beginPath(); c.arc(0, 0, 86, 0, Math.PI * 2); c.fill();
      c.restore();
      text(c, 'NEXT', w / 2, h - 108, 62, '#ece8e2');
      text(c, 'EPISODE', w / 2, h - 52, 48, '#ece8e2');
    }, poster, -3.0, 12.85, BACK + 0.14, 0.2);

    const note = hotspot('notes', 'Sticky notes: about me', 'about');
    const stickyNote = (lines, bg, ink, x, y, tilt) => {
      const mesh = decal(1.22, 1.12, 244, 224, (c, w, h) => {
        c.fillStyle = bg; c.fillRect(0, 10, w, h - 10);
        c.fillStyle = 'rgba(190,190,190,.75)'; c.fillRect(w / 2 - 40, 0, 80, 30);
        lines.forEach((line, i) => text(c, line, w / 2, 88 + i * 62, 56, ink, HAND, 700));
      }, note, x, y, BACK + 0.15 + (tilt > 0 ? 0.01 : 0), 0.18);
      mesh.rotation.z = tilt;
    };
    stickyNote(['Learning', 'as I go.'], '#efebe4', '#111113', 2.75, 13.45, -0.09);
    stickyNote(['Creating', 'as I learn.'], '#d9111f', '#ffffff', 3.35, 12.35, 0.08);

    // ---------- top shelf gear ----------
    const shelfY = 15.05;
    const books = hotspot('books', 'Books: my learning journey', 'journey');
    [['PYTHON', 0xd9111f, '#fff', 0.2, 1.5], ['C', 0xe9e6e1, '#111', 0.17, 1.36], ['WEB DEV', 0x232327, '#fff', 0.2, 1.46]].reduce((y, [label, color, ink, h, w], i) => {
      const x = -3.2 + (i % 2) * 0.07;
      box(w, h, 0.8, std(color, 0.7, 0.05), x, y + h / 2, 0, books);
      decal(w * 0.8, h * 0.85, 256, 44, (c, cw, ch) => text(c, label, cw / 2, ch / 2, 34, ink), books, x, y + h / 2, 0.41, 0.25);
      return y + h;
    }, shelfY);

    const cap = hotspot('cap', 'Cap: fashion and streetwear', 'interest-fashion');
    const dome = add(new T.SphereGeometry(0.46, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), std(0x55555e, 0.75, 0.1), -1.65, shelfY, 0, cap);
    dome.scale.y = 0.88;
    cyl(0.4, 0.4, 0.05, red, -1.65, shelfY + 0.05, 0.3, cap).scale.set(1, 1, 0.85);
    add(new T.SphereGeometry(0.06, 12, 10), red, -1.65, shelfY + 0.42, 0, cap);

    const pad = hotspot('controller', 'Controller: gaming', 'interest-gaming');
    const shell = std(0xdedbd5, 0.4, 0.15);
    const padBody = add(new T.SphereGeometry(0.5, 28, 18), shell, 1.65, shelfY + 0.4, 0.15, pad);
    padBody.scale.set(1.15, 0.55, 0.38);
    [-1, 1].forEach((s) => {
      const grip = add(new T.CapsuleGeometry(0.19, 0.34, 6, 16), shell, 1.65 + s * 0.48, shelfY + 0.26, 0.15, pad);
      grip.rotation.z = s * 0.42;
      grip.scale.z = 0.8;
    });
    [[-0.24, 0.02], [0.14, -0.1]].forEach(([dx, dy]) => cyl(0.085, 0.1, 0.1, black, 1.65 + dx, shelfY + 0.4 + dy, 0.37, pad).rotation.x = Math.PI / 2);
    [[0.3, 0.12], [0.43, 0.02], [0.3, -0.07]].forEach(([dx, dy], i) => add(new T.SphereGeometry(0.048, 12, 10), i === 1 ? red : black, 1.65 + dx, shelfY + 0.4 + dy, 0.35, pad));
    box(0.22, 0.065, 0.06, black, 1.28, shelfY + 0.52, 0.34, pad);
    box(0.065, 0.22, 0.06, black, 1.28, shelfY + 0.52, 0.34, pad);

    const clap = hotspot('clapper', 'Clapperboard: movies and series', 'interest-movies');
    box(1.05, 0.68, 0.1, black, 3.2, shelfY + 0.35, 0.1, clap);
    const stripes = (c, w, h) => {
      c.fillStyle = '#0c0c0e'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ece8e2';
      for (let x = -h; x < w; x += 56) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 28, h); c.lineTo(x + 28 + h, 0); c.lineTo(x + h, 0); c.fill(); }
    };
    decal(1.05, 0.16, 256, 40, stripes, clap, 3.2, shelfY + 0.6, 0.16, 0.2);
    const arm = decal(1.05, 0.16, 256, 40, stripes, clap, 3.17, shelfY + 0.83, 0.16, 0.2);
    arm.rotation.z = 0.2;
    decal(0.9, 0.36, 256, 104, (c, w, h) => {
      text(c, 'SCENE 01', w / 2, 30, 36, '#ece8e2');
      text(c, 'one more episode', w / 2, 76, 38, '#ff5a63', HAND, 700);
    }, clap, 3.2, shelfY + 0.25, 0.17, 0.35);

    // ---------- sport and training ----------
    const cricket = hotspot('cricket', 'Bat and ball: cricket', 'interest-sports');
    const bat = new T.Group();
    box(0.46, 2.15, 0.17, wood, 0, 1.08, 0, bat);
    box(0.12, 2.0, 0.1, std(0xa9a296, 0.7, 0.05), 0, 1.08, -0.1, bat);
    cyl(0.085, 0.085, 1.0, black, 0, 2.62, 0, bat);
    cyl(0.1, 0.1, 0.1, red, 0, 3.14, 0, bat);
    box(0.47, 0.17, 0.18, red, 0, 1.55, 0, bat);
    bat.position.set(-3.82, 9.02, 2.35);
    bat.rotation.z = -0.1;
    bat.rotation.y = 0.25;
    cricket.add(bat);
    add(new T.SphereGeometry(0.22, 24, 18), red, -3.2, 9.24, 2.75, cricket);
    add(new T.TorusGeometry(0.222, 0.009, 8, 32), white, -3.2, 9.24, 2.75, cricket).rotation.set(1.2, 0.4, 0);

    const lifting = hotspot('dumbbell', 'Dumbbell: strength training', 'interest-strength');
    const bell = new T.Group();
    cyl(0.07, 0.07, 1.15, std(0xb9b9c0, 0.25, 0.9, { envMap }), 0, 0, 0, bell).rotation.z = Math.PI / 2;
    [-1, 1].forEach((s) => {
      cyl(0.3, 0.3, 0.17, steel, s * 0.48, 0, 0, bell, 6).rotation.z = Math.PI / 2;
      cyl(0.23, 0.23, 0.12, black, s * 0.63, 0, 0, bell, 6).rotation.z = Math.PI / 2;
      cyl(0.31, 0.31, 0.03, red, s * 0.38, 0, 0, bell, 6).rotation.z = Math.PI / 2;
    });
    bell.position.set(3.3, 9.3, 2.45);
    bell.rotation.y = -0.38;
    lifting.add(bell);

    const phones = hotspot('headphones', 'Headphones: gaming', 'interest-gaming');
    cyl(0.07, 0.07, 0.35, white, 3.05, 11.35, BACK + 0.28, phones, 12).rotation.x = Math.PI / 2;
    add(new T.TorusGeometry(0.55, 0.085, 14, 40, Math.PI), black, 3.05, 10.82, BACK + 0.4, phones);
    [-1, 1].forEach((s) => {
      cyl(0.3, 0.3, 0.24, black, 3.05 + s * 0.55, 10.66, BACK + 0.4, phones).rotation.z = Math.PI / 2;
      cyl(0.19, 0.19, 0.05, red, 3.05 + s * 0.69, 10.66, BACK + 0.4, phones).rotation.z = Math.PI / 2;
    });

    // ---------- door ----------
    const door = new T.Group();
    door.position.set(HALF + 0.18, 0, FRONT + 0.08);
    root.add(door);
    const doorH = height + 0.1;
    box(DOOR_W, doorH, 0.12, steel, -DOOR_W / 2, midY, 0, door);
    [-0.04, -DOOR_W + 0.04].forEach((x) => box(0.09, doorH, 0.18, steel, x, midY, -0.05, door));
    [TOP - 0.02, FLOOR + 0.02].forEach((y) => box(DOOR_W, 0.09, 0.18, steel, -DOOR_W / 2, y, -0.05, door));
    for (let i = 0; i < 5; i++) box(1.65, 0.11, 0.07, black, -DOOR_W / 2, 8.15 + i * 0.3, -0.09, door);
    box(0.16, 0.7, 0.14, white, -DOOR_W + 0.28, 11.3, -0.12, door);
    box(0.09, 0.28, 0.12, red, -DOOR_W + 0.28, 11.3, -0.2, door);
    [8.4, 11.8, 15.1].forEach((y) => cyl(0.1, 0.1, 0.55, steelDark, 0, y, -0.02, door, 12));

    // die-cut stickers on the inside of the door. Lettering only, no brand marks.
    function sticker(parent, w, h, x, y, tilt, bg, draw) {
      const mesh = decal(w, h, Math.round(w * 220), Math.round(h * 220), (c, cw, ch) => {
        c.fillStyle = '#f4f1ec'; rounded(c, 0, 0, cw, ch, 34); c.fill();
        c.fillStyle = bg; rounded(c, 11, 11, cw - 22, ch - 22, 25); c.fill();
        draw(c, cw, ch);
      }, parent, x * 0.887, y, -0.075, 0.14);
      mesh.scale.setScalar(0.9);
      mesh.rotation.set(0, Math.PI, tilt);
      return mesh;
    }
    const nameTag = hotspot('nametag', 'Name sticker: about me', 'about', door);
    sticker(nameTag, 2.2, 1.05, -1.55, 14.85, -0.07, '#0c0c0e', (c, w, h) => {
      text(c, 'SWANAND', w / 2, h * 0.4, 78, '#f4f1ec');
      text(c, 'student & builder', w / 2, h * 0.73, 52, '#ff5a63', HAND, 700);
    });
    const skillStickers = hotspot('stickers', 'Stickers: my technical skills', 'skills', door);
    [
      ['Py', 'Python', -2.22, 13.52, 0.1, '#d9111f', '#fff'],
      ['JS', 'JavaScript', -0.93, 13.38, -0.12, '#f4f1ec', '#0c0c0e'],
      ['</>', 'HTML & CSS', -2.05, 12.3, -0.07, '#0c0c0e', '#fff'],
      ['{ }', 'Node.js', -0.86, 12.12, 0.13, '#26262b', '#fff']
    ].forEach(([mark, label, x, y, tilt, bg, ink]) => sticker(skillStickers, 1.08, 1.04, x, y, tilt, bg, (c, w, h) => {
      text(c, mark, w / 2, h * 0.42, 92, ink);
      text(c, label, w / 2, h * 0.76, 34, ink, SANS, 500);
    }));
    sticker(skillStickers, 2.15, 0.6, -1.55, 10.4, 0.05, '#d9111f', (c, w, h) => text(c, 'OPEN SOURCE', w / 2, h / 2, 54, '#fff'));

    // ---------- state ----------
    const OPEN_WIDE = 2.7, OPEN_NARROW = 1.9;
    let openAngle = OPEN_WIDE;
    let doorAngle = reduceMotion ? OPEN_WIDE : 0.35;
    let opening = reduceMotion;
    let lampOn = true;
    let hovered = null;
    door.rotation.y = doorAngle;

    const raycaster = new T.Raycaster();
    const pointer = new T.Vector2();

    const api = {
      dirty: false,
      // framing numbers for the camera, chosen by the shape of the stage
      frame(aspect) {
        const wide = aspect > 1.02;
        openAngle = wide ? OPEN_WIDE : OPEN_NARROW;
        if (opening) { doorAngle = openAngle; door.rotation.y = doorAngle; }
        return wide ? { centre: 1.3, width: 14.45, height: 9.75 } : { centre: 0.12, width: 9.75, height: 9.75 };
      },
      open() { opening = true; },
      setLamp(on) {
        lampOn = on;
        lamp.intensity = on ? 95 : 6;
        tubeMat.emissiveIntensity = on ? 1.5 : 0.04;
        redWash.intensity = on ? 26 : 48;
      },
      get lampOn() { return lampOn; },
      // x, y in normalised device coordinates
      pick(x, y, camera) {
        pointer.set(x, y);
        raycaster.setFromCamera(pointer, camera);
        for (const hit of raycaster.intersectObjects(scene.children, true)) {
          if (!hit.object.visible || hit.object.isPoints) continue;
          let node = hit.object;
          while (node && !targets.includes(node)) node = node.parent;
          return node || null;   // the first solid thing wins, so nothing is picked through the character
        }
        return null;
      },
      hover(group) { hovered = group; },
      update(delta) {
        const ease = 1 - Math.exp(-delta * 3.2);
        if (opening) {
          doorAngle += (openAngle - doorAngle) * (reduceMotion ? 1 : ease);
          door.rotation.y = doorAngle;
        }
        targets.forEach((group) => {
          const goal = group === hovered ? 1 : 0;
          group.userData.lift += (goal - group.userData.lift) * (reduceMotion ? 1 : Math.min(1, delta * 12));
          if (!group.userData.home) group.userData.home = group.position.clone();
          // door items rise away from the door face, shelf items hop upwards
          const onDoor = group.parent === door;
          group.position.y = group.userData.home.y + (onDoor ? 0 : group.userData.lift * 0.14);
          group.position.z = group.userData.home.z - (onDoor ? group.userData.lift * 0.12 : 0);
        });
      }
    };
    return api;
  }

  return { build };
})();
