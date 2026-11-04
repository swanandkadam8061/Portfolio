/* Lightweight conversational 3D guide: self-contained Three.js scene and accessible controls. */
(() => {
  'use strict';
  const root = document.getElementById('guideAssistant');
  if (!root) return;
  const stage = document.getElementById('guideStage');
  const canvas = document.getElementById('guideCanvas');
  const handle = document.getElementById('guideAssistantHandle');
  const message = document.getElementById('guideMessage');
  const speaker = document.getElementById('guideSpeaker');
  const choices = document.getElementById('guideChoices');
  const destination = document.getElementById('guideDestination');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer, scene, camera, figure, head, torso, leftArm, rightArm, leftLeg, rightLeg, skinMaterial, hairMaterial, tieMaterial, lapelMaterial;
  const eyeGroups = [];
  let frame = 0, animationPaused = true, draggingFigure = false, startX = 0, startY = 0, rotationY = 0, rotationX = 0;
  let activeGuide = 0, dismissed = false, pointerOffset = null, waveUntil = 0;
  const sectionGuides = {
    projects: { name: 'NOAH · PROJECT GUIDE', section: 'projects', text: 'Absolutely! Here are a few projects Swanand has built, with the ideas and details behind each one.' },
    about: { name: 'ARI · YOUR GUIDE', section: 'about', text: 'Swanand is a developer who enjoys turning thoughtful ideas into clean, useful digital experiences. Let’s start with his story.' },
    skills: { name: 'RAVI · SKILLS GUIDE', section: 'skills', text: 'Let’s take a look at the tools and technologies Swanand uses to bring his projects to life.' },
    explore: { name: 'ZARA · YOUR GUIDE', section: 'journey', text: 'Great choice. We can explore the portfolio together. Here’s where Swanand’s journey began.' }
  };
  const palette = [0x25282d, 0x34383e, 0x4a2027, 0x20344b, 0x43232d, 0x55504c];
  const skinPalette = [0xc99579, 0xe0b49a, 0x9b6349, 0xc99579, 0xb57d62, 0xe4c2a0];
  const hairPalette = [0x211d1b, 0x33241f, 0x171412, 0x24201c, 0x30221f, 0x4a4139];
  const tiePalette = [0xe50914, 0x9e2330, 0xe50914, 0x9d2633, 0xc13a45, 0xe0d8ce];

  function makeFigure() {
    if (!window.THREE || !canvas) return;
    const THREE = window.THREE;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
    camera.position.set(0, 1.45, 4.72);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x171216, 1.35));
    const key = new THREE.DirectionalLight(0xffeee4, 2.8); key.position.set(-2.5, 4, 4); key.castShadow = true;
    const shadowResolution = window.innerWidth < 700 ? 256 : 512;
    key.shadow.mapSize.set(shadowResolution,shadowResolution); key.shadow.camera.near=.1; key.shadow.camera.far=9;
    key.shadow.camera.left=-2.5; key.shadow.camera.right=2.5; key.shadow.camera.top=3.4; key.shadow.camera.bottom=-.3;
    key.shadow.bias=-.00025; key.shadow.radius=4; scene.add(key);
    const fill = new THREE.PointLight(0xaecaff, .75, 6); fill.position.set(2.4,2.5,3.2); scene.add(fill);
    const rim = new THREE.PointLight(0xe50914, 2.25, 6); rim.position.set(1.6, 2.2, -1.5); scene.add(rim);
    figure = new THREE.Group(); scene.add(figure);
    skinMaterial = new THREE.MeshPhysicalMaterial({ color: skinPalette[activeGuide], roughness: .61, metalness: 0, clearcoat: .08, clearcoatRoughness: .7 });
    const suit = new THREE.MeshStandardMaterial({ color: palette[activeGuide], roughness: .68, metalness: .035 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0xe7e5e2, roughness: .82 });
    tieMaterial = new THREE.MeshStandardMaterial({ color: tiePalette[activeGuide], roughness: .4, metalness: .14 });
    hairMaterial = new THREE.MeshStandardMaterial({ color: hairPalette[activeGuide], roughness: .62 });
    const shoe = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .4, metalness: .2 });
    const sphere = (r, mat, pos, scale = [1,1,1]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), mat); m.position.set(...pos); m.scale.set(...scale); figure.add(m); return m; };
    const faceSphere = (parent,r,mat,pos,scale=[1,1,1]) => { const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,24),mat); m.position.set(pos[0],pos[1]-1.94,pos[2]); m.scale.set(...scale); parent.add(m); return m; };
    const box = (size, mat, pos, bevel = 0) => { const geo = bevel && THREE.RoundedBoxGeometry ? new THREE.RoundedBoxGeometry(...size, 4, bevel) : new THREE.BoxGeometry(...size); const m = new THREE.Mesh(geo, mat); m.position.set(...pos); figure.add(m); return m; };
    // A softly beveled, tailored silhouette with shaped shoulders and a tapered waist.
    const jacketShape = new THREE.Shape();
    jacketShape.moveTo(-.24,.39); jacketShape.lineTo(.24,.39); jacketShape.lineTo(.34,.27); jacketShape.lineTo(.27,-.39); jacketShape.lineTo(-.27,-.39); jacketShape.lineTo(-.34,.27); jacketShape.closePath();
    const jacketGeo = new THREE.ExtrudeGeometry(jacketShape,{depth:.38,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.018,bevelThickness:.018});
    jacketGeo.translate(0,1.13,-.19);
    torso = new THREE.Mesh(jacketGeo,suit); torso.position.set(0,0,0); figure.add(torso);
    box([.23,.67,.035], shirt, [0,1.16,.206], .025);
    const lapelGeo = new THREE.BufferGeometry();
    const lapelShape = new THREE.Shape(); lapelShape.moveTo(0,.27); lapelShape.lineTo(.17,.12); lapelShape.lineTo(.01,-.14); lapelShape.lineTo(-.055,.02); lapelShape.closePath();
    lapelMaterial = new THREE.MeshStandardMaterial({ color: 0x383838, roughness: .55, side: THREE.DoubleSide });
    for (const side of [-1,1]) { const mesh = new THREE.Mesh(new THREE.ShapeGeometry(lapelShape), lapelMaterial); mesh.position.set(side*.02,1.31,.225); mesh.rotation.y=side*.13; mesh.scale.x=side; figure.add(mesh); }
    const tieKnot = new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.09,8), tieMaterial); tieKnot.position.set(0,1.43,.24); figure.add(tieKnot);
    const tieBody = new THREE.Mesh(new THREE.ConeGeometry(.052,.39,4), tieMaterial); tieBody.position.set(0,1.19,.245); tieBody.rotation.x=Math.PI; figure.add(tieBody);
    // A unified head rig keeps the face, ears and groomed hair moving naturally together.
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.105,.12,.19,20), skinMaterial); neck.position.set(0,1.62,0); figure.add(neck);
    head = new THREE.Group(); head.position.set(0,1.94,.015); figure.add(head);
    faceSphere(head,.27,skinMaterial,[0,1.94,.015],[.86,1.12,.83]);
    // Neat tapered hair cap, side locks and a soft swept fringe.
    faceSphere(head,.245,hairMaterial,[0,2.105,-.006],[.93,.59,.91]);
    faceSphere(head,.065,hairMaterial,[-.04,2.23,.035],[1.6,.62,1.2]);
    faceSphere(head,.085,hairMaterial,[.14,2.16,.04],[1.05,.62,.8]);
    for (const side of [-1,1]) faceSphere(head,.052,skinMaterial,[side*.226,1.94,.005],[.52,.95,.7]);
    const eyeWhite = new THREE.MeshStandardMaterial({color:0xf4eee8,roughness:.3});
    const iris = new THREE.MeshStandardMaterial({color:0x34251f,roughness:.28});
    const brow = new THREE.MeshStandardMaterial({color:hairPalette[activeGuide],roughness:.8});
    const smile = new THREE.MeshStandardMaterial({color:0x75483e,roughness:.72});
    const eyeGlint = new THREE.MeshBasicMaterial({color:0xffffff});
    for (const side of [-1,1]) {
      faceSphere(head,.034,brow,[side*.09,2.05,.234],[1.35,.34,.42]);
      const eye = new THREE.Group(); eye.position.set(side*.09,2.005-1.94,.232); head.add(eye);
      const white = new THREE.Mesh(new THREE.SphereGeometry(.028,20,16),eyeWhite); white.scale.set(1,.6,.48); eye.add(white);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(.015,16,12),iris); pupil.position.z=.02; pupil.scale.set(.82,1,.42); eye.add(pupil);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(.005,10,8),eyeGlint); glint.position.set(.004,.006,.027); eye.add(glint);
      eyeGroups.push(eye);
    }
    faceSphere(head,.032,skinMaterial,[0,1.93,.25],[.72,1.05,.68]);
    faceSphere(head,.025,smile,[0,1.855,.239],[.88,.19,.35]);
    // Independent limb pivots allow a relaxed idle and a small welcoming wave.
    function limbGroup(pos, length, radius, mat) { const pivot=new THREE.Group(); pivot.position.set(...pos); figure.add(pivot); const limb=new THREE.Mesh(new THREE.CapsuleGeometry(radius,length,4,10),mat); limb.position.y=-length*.42; pivot.add(limb); return pivot; }
    leftArm=limbGroup([-.39,1.42,0],.62,.105,suit); rightArm=limbGroup([.39,1.42,0],.62,.105,suit);
    for (const arm of [leftArm,rightArm]) { const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.078,.082,.1,12),shirt); cuff.position.y=-.56; arm.add(cuff); const hand=new THREE.Mesh(new THREE.SphereGeometry(.085,16,12),skinMaterial); hand.position.y=-.66; arm.add(hand); }
    leftLeg=limbGroup([-.18,.72,0],.55,.12,suit); rightLeg=limbGroup([.18,.72,0],.55,.12,suit);
    for (const leg of [leftLeg,rightLeg]) { const foot=new THREE.Mesh(new THREE.BoxGeometry(.22,.12,.38),shoe); foot.position.set(0,-.32,.09); leg.add(foot); }
    const floor=new THREE.Mesh(new THREE.CircleGeometry(.58,40),new THREE.MeshBasicMaterial({color:0xe50914,transparent:true,opacity:.1})); floor.rotation.x=-Math.PI/2; floor.position.y=.06; floor.scale.set(1,.46,1); figure.add(floor);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(.43,.008,8,48),new THREE.MeshBasicMaterial({color:0xe50914,transparent:true,opacity:.35})); halo.rotation.x=Math.PI/2; halo.position.y=.075; halo.scale.set(1,.48,1); figure.add(halo);
    const pin=new THREE.Mesh(new THREE.SphereGeometry(.025,12,10),new THREE.MeshStandardMaterial({color:0xe50914,metalness:.35,roughness:.35,emissive:0x350006})); pin.position.set(-.19,1.21,.211); figure.add(pin);
    figure.position.y=-.12;
    figure.traverse((part)=>{ if(part.isMesh){part.castShadow=true;part.receiveShadow=true;} });
    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize',resize,{passive:true});
    if (reducedMotion) renderer.render(scene,camera);
  }
  function resize() { if (!renderer || !stage) return; const w=Math.max(stage.clientWidth,1),h=Math.max(stage.clientHeight,1); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  function render() { if (!renderer || !scene || animationPaused) return; frame=requestAnimationFrame(render); const t=performance.now()*.001; const blink=Math.max(0,1-Math.abs((t%4.1)-3.82)/.09); figure.position.y=-.12+Math.sin(t*1.35)*.026; figure.rotation.y=rotationY+Math.sin(t*.48)*.035; figure.rotation.x=rotationX+Math.sin(t*.65)*.012; figure.rotation.z=Math.sin(t*.72)*.009; head.rotation.y=Math.sin(t*.58)*.055; head.rotation.x=Math.sin(t*.9)*.018; eyeGroups.forEach((eye)=>{eye.scale.y=1-blink*.84;}); leftArm.rotation.z=.065+Math.sin(t*.95)*.025; rightArm.rotation.z=performance.now()<waveUntil ? -.76+Math.sin(t*11)*.13 : -.06+Math.sin(t*.95+1)*.025; leftLeg.rotation.x=Math.sin(t*.95)*.012; rightLeg.rotation.x=-Math.sin(t*.95)*.012; renderer.render(scene,camera); }
  function resumeAnimation() { animationPaused=false; if (!reducedMotion && !frame) frame=requestAnimationFrame(render); else if(renderer) renderer.render(scene,camera); }
  function pauseAnimation() { animationPaused=true; if(frame) cancelAnimationFrame(frame); frame=0; }
  function changeGuide(name, index) { activeGuide=index%palette.length; speaker.textContent=name; if (torso) { torso.material.color.setHex(palette[activeGuide]); torso.material.needsUpdate=true; } if(skinMaterial)skinMaterial.color.setHex(skinPalette[activeGuide]); if(hairMaterial)hairMaterial.color.setHex(hairPalette[activeGuide]); if(tieMaterial)tieMaterial.color.setHex(tiePalette[activeGuide]); if(lapelMaterial)lapelMaterial.color.setHex(activeGuide===1?0x202124:0x383838); waveUntil=performance.now()+900; root.classList.add('is-talking'); setTimeout(()=>root.classList.remove('is-talking'),650); }
  function speak(text) { message.textContent=text; waveUntil=performance.now()+900; if (reducedMotion && renderer) renderer.render(scene,camera); }

  makeFigure();
  root.setAttribute('aria-hidden','false');
  window.setTimeout(()=>{ if (!dismissed) { root.classList.add('is-visible','is-speaking'); document.body.classList.add('guide-assistant-open'); waveUntil=performance.now()+1000; resumeAnimation(); } }, Math.max(650, document.readyState==='complete'?650:1100));
  window.setTimeout(()=>root.classList.remove('is-speaking'),5200);

  choices.addEventListener('click',(event)=>{
    const button=event.target.closest('[data-guide-action]'); if(!button) return;
    const action=button.dataset.guideAction, item=sectionGuides[action];
    const names={projects:'NOAH · PROJECT GUIDE',about:'ARI · YOUR GUIDE',skills:'RAVI · SKILLS GUIDE',explore:'ZARA · YOUR GUIDE'};
    changeGuide(names[action],{projects:1,about:0,skills:3,explore:2}[action]);
    speak(item.text); destination.href=`#${item.section}`; destination.hidden=false;
    choices.querySelectorAll('button').forEach((b)=>{b.disabled=true;});
    window.setTimeout(()=>choices.querySelectorAll('button').forEach((b)=>{b.disabled=false;}),900);
  });
  document.querySelectorAll('.guide-link').forEach((link,index)=>link.addEventListener('click',()=>{
    const names=['ARI · YOUR GUIDE','NOAH · PROJECT GUIDE','MIKA · CONTACT GUIDE','RAVI · SKILLS GUIDE','ZARA · JOURNEY GUIDE','LEO · YOUR GUIDE'];
    changeGuide(names[index]||'YOUR PORTFOLIO GUIDE',index);
    speak(link.dataset.guideMessage||'Let’s explore this part of the portfolio together.');
  }));
  destination.addEventListener('click',()=>{ dismissed=true; root.classList.remove('is-visible','is-speaking'); document.body.classList.remove('guide-assistant-open'); root.classList.add('is-dismissed'); pauseAnimation(); });
  document.getElementById('guideMinimize').addEventListener('click',()=>{root.classList.remove('is-speaking');root.classList.toggle('is-minimized');if(root.classList.contains('is-minimized')){document.body.classList.remove('guide-assistant-open');pauseAnimation();}else{document.body.classList.add('guide-assistant-open');resumeAnimation();}});
  document.getElementById('guideDismiss').addEventListener('click',()=>{dismissed=true;root.classList.remove('is-visible','is-speaking','is-minimized');document.body.classList.remove('guide-assistant-open');root.classList.add('is-dismissed');pauseAnimation();});
  document.getElementById('guideReopen').addEventListener('click',()=>{dismissed=false;root.classList.remove('is-dismissed','is-minimized');root.classList.add('is-visible');document.body.classList.add('guide-assistant-open');resumeAnimation();});
  stage.addEventListener('pointerdown',(e)=>{draggingFigure=true;startX=e.clientX;startY=e.clientY;stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',(e)=>{if(!draggingFigure)return;rotationY+=(e.clientX-startX)*.012;rotationX=Math.max(-.18,Math.min(.18,rotationX+(e.clientY-startY)*.006));startX=e.clientX;startY=e.clientY;if(reducedMotion&&renderer)renderer.render(scene,camera);});
  stage.addEventListener('pointerup',()=>{draggingFigure=false;}); stage.addEventListener('pointercancel',()=>{draggingFigure=false;});
  stage.addEventListener('keydown',(e)=>{if(e.key==='ArrowLeft')rotationY-=.22;if(e.key==='ArrowRight')rotationY+=.22;if(reducedMotion&&renderer)renderer.render(scene,camera);});
  // Drag the panel by its header; keep at least part of the panel in the viewport.
  handle.addEventListener('pointerdown',(e)=>{if(e.target.closest('button'))return;pointerOffset={x:e.clientX-root.offsetLeft,y:e.clientY-root.offsetTop};handle.setPointerCapture(e.pointerId);root.classList.add('is-dragging');});
  handle.addEventListener('pointermove',(e)=>{if(!pointerOffset)return;const x=Math.max(8,Math.min(innerWidth-root.offsetWidth-8,e.clientX-pointerOffset.x));const y=Math.max(8,Math.min(innerHeight-root.offsetHeight-8,e.clientY-pointerOffset.y));root.style.left=`${x}px`;root.style.top=`${y}px`;root.style.bottom='auto';});
  const stopDrag=()=>{pointerOffset=null;root.classList.remove('is-dragging');};handle.addEventListener('pointerup',stopDrag);handle.addEventListener('pointercancel',stopDrag);
  document.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&root.classList.contains('is-visible')){root.classList.remove('is-visible','is-speaking');root.classList.add('is-minimized');document.body.classList.remove('guide-assistant-open');pauseAnimation();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAnimation();else if(root.classList.contains('is-visible')&&!root.classList.contains('is-minimized'))resumeAnimation();});
})();
