// Sculpted guide miniatures. A single renderer is shared by the active card.
(() => {
  const T = window.THREE;
  const styles = {
    ari:  { skin: 0xf0c6ad, hair: 0x332922, top: 0xf1efea, cut: 'part', outfit: 'tie' },
    noah: { skin: 0xc38b65, hair: 0x392723, top: 0x292935, cut: 'quiff', outfit: 'vest' },
    mika: { skin: 0xf1cdaf, hair: 0xd6bf94, top: 0xe3d4b6, cut: 'fringe', outfit: 'rollneck' },
    ravi: { skin: 0xf4cdbf, hair: 0xe0cda6, top: 0xf3e7e1, cut: 'bob', outfit: 'plaid' },
    zara: { skin: 0xe5bda3, hair: 0x876646, top: 0xf7eee1, cut: 'waves', outfit: 'knit' },
    leo:  { skin: 0xe3c4b8, hair: 0x24212a, top: 0x565461, cut: 'waves', outfit: 'knit' }
  };
  let renderer, scene, camera, figure, current;
  const models = new Map();
  const materials = new Map();
  const sphere = new T.SphereGeometry(1, 32, 24);

  function material(color) {
    if (!materials.has(color)) materials.set(color, new T.MeshStandardMaterial({ color, roughness: .65 }));
    return materials.get(color);
  }

  function sculpt(style) {
    const group = new T.Group();
    function oval(x,y,z,w,h,d,color,angle=0) {
      const mesh = new T.Mesh(sphere,material(color));
      mesh.position.set(x,y,z);
      mesh.scale.set(w,h,d);
      mesh.rotation.z = angle;
      group.add(mesh);
      return mesh;
    }
    const {skin,hair,top,cut,outfit} = style;
    // A continuous turned profile gives the chin, shoulders and collar soft edges.
    function form(profile, depth, color, z = 0) {
      const curve = new T.SplineCurve(profile.map(([y,r]) => new T.Vector2(r,y)));
      const mesh = new T.Mesh(new T.LatheGeometry(curve.getPoints(64),64), material(color));
      mesh.scale.z = depth;
      mesh.position.z = z;
      group.add(mesh);
    }
    function panel(points, color) {
      const shape = new T.Shape(points.map(([x,y]) => new T.Vector2(x,y)));
      const mesh = new T.Mesh(new T.ExtrudeGeometry(shape, {
        depth: .006, bevelEnabled: true, bevelSegments: 2, bevelSize: .005, bevelThickness: .003
      }), material(color));
      mesh.position.z = .238;
      group.add(mesh);
    }
    form([[-.25,.32],[.03,.37],[.23,.44],[.32,.41],[.40,.26],[.44,.13]],.52,top);
    form([[.39,.14],[.50,.099],[.65,.105],[.72,.12]],.87,skin);
    for (const side of [-1,1]) {
      oval(side*.402,.025,-.02,.105,.33,.125,outfit==='vest'?skin:top,side*.18);
    }
    if(outfit==='tie' || outfit==='vest'){
      const shirt = outfit==='tie';
      panel([[-.125,.416],[.125,.416],[0,.18]],shirt?0xe4e3e1:skin);
      if(shirt){
        panel([[-.036,.367],[.036,.367],[.017,.309],[.042,.076],[0,.025],[-.042,.076],[-.017,.309]],0x292731);
        for(const side of [-1,1]) panel([[0,.37],[side*.105,.433],[side*.154,.387],[side*.076,.30]],0xf7f4ee);
      }else{
        for(let i=0;i<3;i++) oval(0,.15-i*.11,.225,.014,.014,.008,0x827571);
      }
    }else if(outfit==='rollneck'){
      form([[.37,.17],[.41,.177],[.51,.151],[.53,.136]],.92,top);
    }else{
      oval(0,.406,.036,.225,.085,.125,skin);
      oval(0,.35,.071,.29,.049,.127,outfit==='plaid'?0x954353:top,-.06);
    }
    for (const piece of group.children) piece.position.y += .075;
    for (const side of [-1,1]) oval(side*.286,.98,0,.048,.078,.046,skin);
    form([[.627,.012],[.665,.106],[.745,.196],[.88,.276],[1.01,.303],
      [1.17,.301],[1.29,.25],[1.36,.14],[1.38,.006]],.85,skin,.018);
    for(const side of [-1,1]) {
      oval(side*.123,1.008,.253,.073,.036,.026,0xfff4e9,side*.07);
      oval(side*.122,1.012,.279,.029,.031,.014,0x51413b);
      oval(side*.122,1.014,.29,.015,.021,.006,0x211e23);
      oval(side*.122-.008,1.025,.297,.007,.007,.004,0xffffff);
      oval(side*.13,1.049,.262,.075,.009,.012,hair,side*.08);
      oval(side*.13,1.099,.249,.066,.013,.014,hair,side*.10);
    }
    oval(0,.949,.265,.030,.053,.032,skin);
    oval(0,.847,.236,.063,.015,.018,0xb77172);
    oval(0,.832,.229,.052,.014,.015,0xd48e89);
    // Sweep one continuous hair shell from the crown to a shaped hairline.
    // The front sweeps across the forehead while the sides follow the jaw.
    const vertices = [], indices = [];
    const columns = 96, rings = 44;
    for(let row=0;row<=rings;row++){
      const t=row/rings;
      for(let col=0;col<=columns;col++){
        const angle=col/columns*Math.PI*2-Math.PI;
        const side=Math.sin(angle), front=Math.cos(angle);
        const fringe = cut==='fringe' ? .065 : 0;
        const opening=T.MathUtils.smoothstep(front,.34,.88);
        const backLength={part:.63,quiff:.56,fringe:.66,bob:.79,waves:1.10}[cut];
        const sweep=.061*Math.sin(2.7*angle+.55);
        const length=T.MathUtils.lerp(backLength,.273+fringe+sweep,opening);
        const lift=cut==='quiff' ? .056*(1-t)*Math.max(0, front) : 0;
        const y=1.431-t*length+lift;
        const crown=Math.sqrt(Math.max(.0001,1-Math.pow(Math.max(0,(y-lift-1.10)/.331),2)));
        const curl=cut==='waves' ? .018*Math.sin(12*t+3*angle)*t : 0;
        const groove=.005*Math.cos(27*angle+3*t)*crown;
        const radius=(.324+groove+curl)*crown;
        const taper=1-.09*Math.pow(t,8);
        vertices.push(side*radius*taper,y,front*(radius*.88+.012)*taper+.009);
        if(row<rings && col<columns){
          const i=row*(columns+1)+col, j=i+columns+1;
          indices.push(i,j,i+1,i+1,j,j+1);
        }
      }
    }
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const hairFinish=material(hair).clone();
    hairFinish.side=T.DoubleSide;
    group.add(new T.Mesh(geometry,hairFinish));
    return group;
  }
  function render(name,angle) {
    if(!renderer){
      renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
      renderer.setSize(180,230,false);
      scene=new T.Scene();
      scene.add(new T.HemisphereLight(0xfff7e8,0x948a99,1.55));
      const key=new T.DirectionalLight(0xffede2,2.0);
      key.position.set(-3,5,4);scene.add(key);
      const rim=new T.DirectionalLight(0xe3e7ff,1.8);
      rim.position.set(2,2,-2);scene.add(rim);
      camera=new T.OrthographicCamera(-.527,.527,.674,-.674,.1,10);
      camera.position.set(0,.875,4);camera.lookAt(0,.79,0);
    }
    if(!models.has(name)) models.set(name,sculpt(styles[name]));
    if(figure) scene.remove(figure);
    figure=models.get(name);scene.add(figure);figure.rotation.y=angle;
    renderer.render(scene,camera);
    return renderer.domElement;
  }
  function activate(card,angle){
    try {
      const stage=card.querySelector('.guide-doll');
      stage.append(render(stage.dataset.doll,angle));
      current=card;
    } catch { /* The pre-rendered view also works without WebGL. */ }
  }
  function rest(card){
    if(current===card){renderer.domElement.remove();current=null;}
  }
  for(const card of document.querySelectorAll('.portrait-card')){
    card.addEventListener('pointermove',e=>{
      if(e.pointerType==='touch'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      const box=card.getBoundingClientRect();
      activate(card,((e.clientX-box.left)/box.width-.5)*.95);
    });
    card.addEventListener('pointerleave',()=>rest(card));
    card.addEventListener('focus',()=>activate(card,.20));
    card.addEventListener('blur',()=>rest(card));
  }
})();
