import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { onIdle, getPerformanceProfile, getIsCoarse } from './config.js';

const NEBULA_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_3IGyEAMtkETJhiYfzuXBixjGMkT/hf_20260830_023357_ed6bfe00-c383-49f8-97c2-eee8d4bb22b8.png';
const BLACK_HOLE_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_3IGyEAMtkETJhiYfzuXBixjGMkT/hf_20260830_023247_6502d28c-59b4-4f13-93a9-4f963fa43c03.png';

export function initSpace({ reduced, getIsMobile, bhState }) {
  const isMobile = getIsMobile();
  const isCoarse = getIsCoarse();
  const profile = getPerformanceProfile();
  const quality = profile==='high'
    ? {maxDpr:1.55,maxPixels:3200000,stars:2900,dust:580,nebulaCols:6,nebulaPoints:440,asteroids:6,bloom:.33,sphereW:64,sphereH:48,ring:240,torus:160}
    : profile==='balanced'
      ? {maxDpr:1.35,maxPixels:2100000,stars:2100,dust:420,nebulaCols:5,nebulaPoints:340,asteroids:4,bloom:.26,sphereW:56,sphereH:40,ring:208,torus:144}
      : {maxDpr:1.2,maxPixels:1350000,stars:1400,dust:280,nebulaCols:3,nebulaPoints:250,asteroids:3,bloom:.19,sphereW:48,sphereH:32,ring:176,torus:128};
  document.documentElement.dataset.performanceProfile=profile;
  const calcDpr=()=>Math.max(.82,Math.min(devicePixelRatio,quality.maxDpr,Math.sqrt(quality.maxPixels/Math.max(1,innerWidth*innerHeight))));
  const canvas = document.getElementById('space-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: profile==='high'&&!isCoarse, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(calcDpr());
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x010207, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .92;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x010207, .00078);
  const camera = new THREE.PerspectiveCamera(isMobile ? 70 : 62, innerWidth / innerHeight, .1, 3600);
  camera.position.set(0, 0, 900);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), quality.bloom, .62, .86);
  composer.addPass(bloom);

  const clock = new THREE.Clock();
  const mouse = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  let running = true, rafId = 0, performanceMode = 'normal', lastRender = 0, signalBoost = 0;
  let scrollProgress = 0, scrollVelocity = 0, scrollVelocityTarget = 0, lastScrollY = scrollY, lastScrollAt = performance.now();
  const baseBloom = quality.bloom;
  const clamp01=v=>Math.max(0,Math.min(1,v));
  const syncScroll=()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    const now=performance.now(), y=scrollY, dt=Math.max(16,now-lastScrollAt), dy=y-lastScrollY;
    scrollProgress=clamp01(y/max);
    scrollVelocityTarget=Math.min(1.35,Math.abs(dy)/dt*.42);
    lastScrollY=y; lastScrollAt=now;
  };
  syncScroll();
  addEventListener('scroll',syncScroll,{passive:true});
  if(!isCoarse){
    addEventListener('pointermove', e => {
      mouse.x = (e.clientX / innerWidth - .5) * 2;
      mouse.y = (e.clientY / innerHeight - .5) * 2;
    }, { passive: true });
  }

  const starsGeo=new THREE.BufferGeometry();
  const starCount=quality.stars,starPos=new Float32Array(starCount*3),starSpeed=new Float32Array(starCount),starPhase=new Float32Array(starCount),starTint=new Float32Array(starCount);
  for(let i=0;i<starCount;i++){starPos[i*3]=(Math.random()-.5)*2500;starPos[i*3+1]=(Math.random()-.5)*1450;starPos[i*3+2]=-1700+Math.random()*2450;starSpeed[i]=5+Math.random()*19;starPhase[i]=Math.random()*Math.PI*2;starTint[i]=Math.random();}
  starsGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));starsGeo.setAttribute('aSpeed',new THREE.BufferAttribute(starSpeed,1));starsGeo.setAttribute('aPhase',new THREE.BufferAttribute(starPhase,1));starsGeo.setAttribute('aTint',new THREE.BufferAttribute(starTint,1));
  const starUniforms={uTime:{value:0},uSize:{value:isCoarse?1.75:2.1},uScroll:{value:0},uVelocity:{value:0}};
  // Twinkle (per-star phase) and color temperature (aTint: cold blue-white to warm white) for a more physically real starfield.
  const stars=new THREE.Points(starsGeo,new THREE.ShaderMaterial({uniforms:starUniforms,transparent:true,depthWrite:false,
    vertexShader:`attribute float aSpeed;attribute float aPhase;attribute float aTint;uniform float uTime;uniform float uSize;uniform float uScroll;uniform float uVelocity;varying float vTwinkle;varying float vTint;void main(){vec3 p=position;float travel=uTime*aSpeed+uScroll*1180.0+uVelocity*150.0;p.z=-1700.0+mod(position.z+1700.0+travel,2550.0);vTwinkle=.72+.28*sin(uTime*(1.3+aTint*1.4)+aPhase);vTint=aTint;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=clamp(uSize*vTwinkle*(520.0/max(80.0,-mv.z)),.65,3.2);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying float vTwinkle;varying float vTint;void main(){vec2 p=gl_PointCoord-.5;float a=smoothstep(.5,.12,length(p))*.82*vTwinkle;vec3 cold=vec3(.72,.85,1.0);vec3 warm=vec3(1.0,.92,.82);vec3 col=mix(cold,warm,smoothstep(.55,1.0,vTint));gl_FragColor=vec4(col,a);}`
  }));scene.add(stars);

  const dustGeo=new THREE.BufferGeometry(),dustCount=quality.dust,dustPos=new Float32Array(dustCount*3),dustSpeed=new Float32Array(dustCount);
  for(let i=0;i<dustCount;i++){dustPos[i*3]=(Math.random()-.5)*1900;dustPos[i*3+1]=(Math.random()-.5)*1080;dustPos[i*3+2]=-950+Math.random()*1800;dustSpeed[i]=2+Math.random()*8;}
  dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));dustGeo.setAttribute('aSpeed',new THREE.BufferAttribute(dustSpeed,1));
  const dustUniforms={uTime:{value:0},uSize:{value:isCoarse?2.2:2.65},uScroll:{value:0},uVelocity:{value:0}};
  const dust=new THREE.Points(dustGeo,new THREE.ShaderMaterial({uniforms:dustUniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`attribute float aSpeed;uniform float uTime;uniform float uSize;uniform float uScroll;uniform float uVelocity;void main(){vec3 p=position;float travel=uTime*aSpeed+uScroll*760.0+uVelocity*110.0;p.z=-950.0+mod(position.z+950.0+travel,1800.0);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=clamp(uSize*(500.0/max(90.0,-mv.z)),.7,4.2);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`void main(){float a=smoothstep(.5,.08,length(gl_PointCoord-.5))*.14;gl_FragColor=vec4(.40,.71,1.0,a);}`
  }));scene.add(dust);

  // Nebula clouds merged into a single geometry (one draw call instead of one per column).
  const nebulaGroup = new THREE.Group(); scene.add(nebulaGroup);
  {
    const cols = quality.nebulaCols, perCol = quality.nebulaPoints, total = cols * perCol;
    const pos = new Float32Array(total * 3), col = new Float32Array(total * 3);
    const palette = [0x14335b, 0x28527a, 0x4a3153, 0x5b3a2e, 0x233c63, 0x315d72].map(c => new THREE.Color(c));
    let idx = 0;
    for (let c = 0; c < cols; c++) {
      const baseX = -520 + c * 205 + Math.random() * 70, tint = palette[c % palette.length];
      for (let i = 0; i < perCol; i++, idx++) {
        const y = -560 + Math.random() * 1120, t = (y + 560) / 1120;
        pos[idx * 3] = baseX + (Math.random() - .5) * (90 + 150 * (1 - t));
        pos[idx * 3 + 1] = y + (Math.random() - .5) * 80;
        pos[idx * 3 + 2] = -820 - Math.random() * 620;
        col[idx * 3] = tint.r; col[idx * 3 + 1] = tint.g; col[idx * 3 + 2] = tint.b;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const cloud = new THREE.Points(g, new THREE.PointsMaterial({ vertexColors: true, size: 30, transparent: true, opacity: .038, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    nebulaGroup.add(cloud);
  }

  let nebulaPlane = null;
  const texLoader = new THREE.TextureLoader();
  texLoader.setCrossOrigin('anonymous');
  onIdle(() => texLoader.load(NEBULA_URL, tex => {
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: .20, depthWrite: false, fog: false, toneMapped: false });
    nebulaPlane = new THREE.Mesh(new THREE.PlaneGeometry(2500, 1406), mat); nebulaPlane.position.set(0, 10, -1650); scene.add(nebulaPlane);
  }, undefined, () => {}));

  const blackHoleGroup = new THREE.Group(); blackHoleGroup.position.set(isMobile ? 0 : 175, isMobile ? -45 : -18, 20); scene.add(blackHoleGroup);
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1, metalness: 0, transparent: true, opacity: 1 });
  const core = new THREE.Mesh(new THREE.SphereGeometry(isMobile ? 82 : 108, quality.sphereW, quality.sphereH), coreMat); blackHoleGroup.add(core);

  const diskUniforms = { uTime: { value: 0 }, uOpacity: { value: 1 } };
  const diskMat = new THREE.ShaderMaterial({
    uniforms: diskUniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; varying vec3 vPos; void main(){vUv=uv;vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec2 vUv; uniform float uTime; uniform float uOpacity; float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} void main(){vec2 p=vUv-.5; float r=length(p)*2.0; float a=atan(p.y,p.x); float ring=smoothstep(1.0,.25,r)*smoothstep(.18,.48,r); float flow=.52+.48*sin(a*12.0-r*25.0-uTime*2.35); float fil=.55+.45*sin(a*31.0+r*45.0+uTime*1.15); float grain=hash(floor((p+uTime*.002)*240.0)); float hot=pow(max(0.0,1.0-abs(r-.48)*3.7),3.0); float doppler=.62+.5*cos(a-1.05); float alpha=ring*(.20+.52*flow+.22*fil+.08*grain)*uOpacity*doppler; vec3 cold=vec3(.08,.35,.95),white=vec3(.92,.98,1.0); vec3 color=mix(cold,white,clamp(hot*1.5+flow*.22+doppler*.18,0.0,1.0)); gl_FragColor=vec4(color,alpha);}`
  });
  const disk = new THREE.Mesh(new THREE.RingGeometry(isMobile ? 100 : 132, isMobile ? 245 : 310, quality.ring, 4), diskMat); disk.rotation.x = 1.18; disk.rotation.z = -.13; blackHoleGroup.add(disk);

  const lensMat = new THREE.ShaderMaterial({ uniforms: { uOpacity: { value: 1 } }, transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending, vertexShader: `varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`, fragmentShader: `varying vec3 vN;varying vec3 vV;uniform float uOpacity;void main(){float f=pow(1.-max(dot(vN,vV),0.),3.2);vec3 c=mix(vec3(.05,.20,.75),vec3(.62,.88,1.),f);gl_FragColor=vec4(c,f*.28*uOpacity);}` });
  const lens = new THREE.Mesh(new THREE.SphereGeometry(isMobile ? 108 : 138, quality.sphereW, quality.sphereH), lensMat); blackHoleGroup.add(lens);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x8bd6ff, transparent: true, opacity: .28, depthWrite: false, blending: THREE.AdditiveBlending });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(isMobile ? 112 : 145, 1.5, 12, quality.torus), haloMat); blackHoleGroup.add(halo);

  let bhRefPlane = null;
  texLoader.load(BLACK_HOLE_URL, tex => {
    tex.colorSpace = THREE.SRGBColorSpace;
    const uniforms = { uTex: { value: tex }, uTime: { value: 0 }, uOpacity: { value: .34 }, uMouse: { value: new THREE.Vector2() } };
    const mat = new THREE.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, toneMapped: false,
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `varying vec2 vUv;uniform sampler2D uTex;uniform float uTime;uniform float uOpacity;uniform vec2 uMouse;void main(){vec2 p=vUv-.5;float r=length(p);float ang=atan(p.y,p.x);float bend=(1.-smoothstep(.05,.66,r))*.018;ang+=bend*sin(uTime*.55+r*18.);mat2 rot=mat2(cos(ang-atan(p.y,p.x)),-sin(ang-atan(p.y,p.x)),sin(ang-atan(p.y,p.x)),cos(ang-atan(p.y,p.x)));vec2 uv=.5+rot*p;uv+=uMouse*.006*(1.-smoothstep(.15,.7,r));vec4 c=texture2D(uTex,uv);float vign=smoothstep(.78,.22,r);gl_FragColor=vec4(c.rgb,c.a*vign*uOpacity);}`
    });
    bhRefPlane = new THREE.Mesh(new THREE.PlaneGeometry(isMobile ? 620 : 820, isMobile ? 349 : 461), mat); bhRefPlane.position.z = -105; blackHoleGroup.add(bhRefPlane);
  }, undefined, () => {});

  scene.add(new THREE.AmbientLight(0x7caeff, .22));
  const keyLight = new THREE.PointLight(0x8fd5ff, 30, 1300, 1.8); keyLight.position.set(-280, 180, 360); scene.add(keyLight);

  const asteroids = [];
  function makeAsteroid(i) {
    let geo = new THREE.IcosahedronGeometry(1, 3).toNonIndexed(); const pos = geo.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v); const n = Math.sin(x * 5.7 + i * 2.1) * .11 + Math.sin(y * 8.2 + z * 4.1) * .07 + Math.sin((x + y + z) * 12.3) * .035; const s = 1 + n;
      pos.setXYZ(v, x * s, y * s, z * s);
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: i % 2 ? 0x3a414a : 0x4b4f56, roughness: .93, metalness: .12, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat); const size = (isMobile ? 9 : 12) + Math.random() * (isMobile ? 18 : 34); mesh.scale.setScalar(size);
    mesh.position.set((Math.random() - .5) * 1800, (Math.random() - .5) * 920, -1400 - Math.random() * 1400); mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); scene.add(mesh);
    asteroids.push({ mesh, speed: 35 + Math.random() * 62, rx: (Math.random() - .5) * .22, ry: (Math.random() - .5) * .28, rz: (Math.random() - .5) * .18 });
  }
  for (let i = 0; i < quality.asteroids; i++) makeAsteroid(i);

  function setBhVisual() {
    // O buraco negro continua presente durante toda a viagem, mas recua com o progresso global da página.
    const p=scrollProgress, retreat=1-.78*Math.pow(p,.72), fade=1-.76*p;
    const visualOpacity=bhState.opacity*fade;
    blackHoleGroup.scale.setScalar(bhState.scale*retreat);
    blackHoleGroup.position.x=bhState.x+(isMobile?72:215)*p;
    blackHoleGroup.position.y=bhState.y-(isMobile?42:82)*p;
    blackHoleGroup.position.z=bhState.z-960*p;
    coreMat.opacity=visualOpacity; diskUniforms.uOpacity.value=visualOpacity; lensMat.uniforms.uOpacity.value=visualOpacity; haloMat.opacity=.28*visualOpacity;
    if(bhRefPlane)bhRefPlane.material.uniforms.uOpacity.value=bhState.refOpacity*visualOpacity;
    blackHoleGroup.visible=visualOpacity>.008;
  }

  function frame(now = performance.now()) {
    if (!running) return;
    if (performanceMode === 'game' && now - lastRender < 32) { rafId = requestAnimationFrame(frame); return; }
    lastRender = now;
    const dt = Math.min(clock.getDelta(), .034), t = clock.elapsedTime;
    scrollVelocity+=(scrollVelocityTarget-scrollVelocity)*.16;
    scrollVelocityTarget*=.86;
    if(isMobile){
      target.x=Math.sin(t*.18)*.12; target.y=Math.cos(t*.14)*.08;
    }else{
      target.x += (mouse.x - target.x) * .035; target.y += (mouse.y - target.y) * .035;
    }
    if (!reduced) {
      camera.position.x = target.x * (isMobile ? 10 : 24); camera.position.y = -target.y * (isMobile ? 8 : 17); camera.position.z=900+scrollProgress*90; camera.lookAt(0,0,-180-scrollProgress*50);
      blackHoleGroup.rotation.y = target.x * .11; blackHoleGroup.rotation.x = -target.y * .065;
      disk.rotation.z = -.13 + t * .045; diskUniforms.uTime.value = t;
      if (bhRefPlane) { bhRefPlane.rotation.y = target.x * .055; bhRefPlane.rotation.x = -target.y * .035; bhRefPlane.material.uniforms.uTime.value = t; bhRefPlane.material.uniforms.uMouse.value.set(target.x, target.y); }
      if (nebulaPlane) { nebulaPlane.position.x = target.x * -26 + Math.sin(t * .035) * 12; nebulaPlane.position.y = 10 + target.y * 16 + Math.cos(t * .028) * 9; nebulaPlane.position.z=-1650-scrollProgress*260; nebulaPlane.rotation.z = Math.sin(t * .018) * .0025; }
      nebulaGroup.rotation.y = t * .004 + target.x * .035; nebulaGroup.position.y = -target.y * 18; nebulaGroup.position.z=-scrollProgress*180;
      starUniforms.uTime.value=t; starUniforms.uScroll.value=scrollProgress; starUniforms.uVelocity.value=scrollVelocity;
      dustUniforms.uTime.value=t; dustUniforms.uScroll.value=scrollProgress; dustUniforms.uVelocity.value=scrollVelocity;
      const travelBoost=1+scrollVelocity*1.65;
      asteroids.forEach(a => { a.mesh.position.z += a.speed * dt*travelBoost; a.mesh.rotation.x += a.rx * dt; a.mesh.rotation.y += a.ry * dt; a.mesh.rotation.z += a.rz * dt; if (a.mesh.position.z > 760) { a.mesh.position.z = -1500 - Math.random() * 1500; a.mesh.position.x = (Math.random() - .5) * 1900; a.mesh.position.y = (Math.random() - .5) * 980; } });
      signalBoost = Math.max(0, signalBoost - dt * 1.7); bloom.strength = baseBloom + signalBoost * .16; nebulaGroup.scale.setScalar(1 + signalBoost * .018);
    }
    setBhVisual(); composer.render(); if(!reduced) rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  function resize() {
    syncScroll();
    const mobile=getIsMobile(); renderer.setPixelRatio(calcDpr()); renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.fov=mobile?70:62; camera.updateProjectionMatrix(); if(reduced){setBhVisual();composer.render();}
  }
  function pause() { running = false; cancelAnimationFrame(rafId); }
  function resume() { if (running) return; running = true; clock.getDelta(); rafId = requestAnimationFrame(frame); }
  function setPerformanceMode(mode='normal'){performanceMode=mode==='game'?'game':'normal';}
  function pulseSignal(index=0){if(reduced)return;signalBoost=Math.max(signalBoost,.65+Math.min(index,4)*.07);}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();pause();document.documentElement.classList.add('webgl-fallback');});
  canvas.addEventListener('webglcontextrestored',()=>{document.documentElement.classList.remove('webgl-fallback');resume();});

  return { bhState, resize, pause, resume, setPerformanceMode, pulseSignal, renderer, scene, camera };
}
