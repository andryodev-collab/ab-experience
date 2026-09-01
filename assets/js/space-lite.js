import * as THREE from 'three';

const clamp01 = v => Math.max(0, Math.min(1, v));

export function initSpace({ reduced, getIsMobile, bhState }) {
  const canvas = document.getElementById('space-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  const maxPixels = 900000;
  const calcDpr = () => Math.max(.72, Math.min(devicePixelRatio || 1, 1, Math.sqrt(maxPixels / Math.max(1, innerWidth * innerHeight))));
  renderer.setPixelRatio(calcDpr());
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x010207, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .96;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x010207, .00082);
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, .1, 3400);
  camera.position.set(0, 0, 900);
  document.documentElement.dataset.performanceProfile = 'efficient-lite';

  let running = true, rafId = 0, performanceMode = 'normal', lastRender = 0, scrollProgress = 0, scrollVelocity = 0, velocityTarget = 0, lastY = scrollY, lastAt = performance.now(), signalBoost = 0;
  const clock = new THREE.Clock();
  const syncScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const now = performance.now(), y = scrollY, dt = Math.max(16, now - lastAt);
    scrollProgress = clamp01(y / max);
    velocityTarget = Math.min(1.25, Math.abs(y - lastY) / dt * .42);
    lastY = y; lastAt = now;
  };
  syncScroll();
  addEventListener('scroll', syncScroll, { passive: true });

  function points(count, spreadX, spreadY, zMin, zRange, size, opacity, color, speedMin, speedRange) {
    const geo = new THREE.BufferGeometry(), pos = new Float32Array(count * 3), speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - .5) * spreadX; pos[i * 3 + 1] = (Math.random() - .5) * spreadY; pos[i * 3 + 2] = zMin + Math.random() * zRange; speeds[i] = speedMin + Math.random() * speedRange;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    const uniforms = { uTime: { value: 0 }, uScroll: { value: 0 }, uVelocity: { value: 0 }, uSize: { value: size }, uOpacity: { value: opacity }, uColor: { value: new THREE.Color(color) } };
    const material = new THREE.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aSpeed;uniform float uTime;uniform float uScroll;uniform float uVelocity;uniform float uSize;void main(){vec3 p=position;float travel=uTime*aSpeed+uScroll*980.0+uVelocity*130.0;p.z=-1600.0+mod(position.z+1600.0+travel,2400.0);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=clamp(uSize*(480.0/max(90.0,-mv.z)),.7,3.4);gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `uniform float uOpacity;uniform vec3 uColor;void main(){float a=smoothstep(.5,.1,length(gl_PointCoord-.5))*uOpacity;gl_FragColor=vec4(uColor,a);}` });
    const mesh = new THREE.Points(geo, material); scene.add(mesh); return { mesh, uniforms };
  }

  const stars = points(900, 2400, 1400, -1600, 2350, 1.8, .78, 0xddeeff, 4, 16);
  const dust = points(150, 1850, 1050, -950, 1700, 2.4, .12, 0x63b8ff, 2, 6);

  const nebula = new THREE.Group(); scene.add(nebula);
  [0x17345a, 0x293e69].forEach((color, col) => {
    const count = 120, geo = new THREE.BufferGeometry(), pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { pos[i * 3] = -360 + col * 600 + (Math.random() - .5) * 300; pos[i * 3 + 1] = (Math.random() - .5) * 1100; pos[i * 3 + 2] = -950 - Math.random() * 450; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    nebula.add(new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 34, transparent: true, opacity: .035, depthWrite: false, blending: THREE.AdditiveBlending })));
  });

  const blackHoleGroup = new THREE.Group(); blackHoleGroup.position.set(0, -45, 20); scene.add(blackHoleGroup);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1 });
  blackHoleGroup.add(new THREE.Mesh(new THREE.SphereGeometry(78, 30, 22), coreMat));

  const diskUniforms = { uTime: { value: 0 }, uOpacity: { value: .9 } };
  const diskMat = new THREE.ShaderMaterial({ uniforms: diskUniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec2 vUv;uniform float uTime;uniform float uOpacity;void main(){vec2 p=vUv-.5;float r=length(p)*2.0;float a=atan(p.y,p.x);float ring=smoothstep(1.0,.30,r)*smoothstep(.20,.50,r);float flow=.6+.4*sin(a*9.0-r*20.0-uTime*1.8);vec3 c=mix(vec3(.08,.34,.92),vec3(.85,.96,1.0),flow);gl_FragColor=vec4(c,ring*(.28+.58*flow)*uOpacity);}` });
  const disk = new THREE.Mesh(new THREE.RingGeometry(94, 218, 116, 3), diskMat); disk.rotation.x = 1.18; disk.rotation.z = -.13; blackHoleGroup.add(disk);

  const haloMat = new THREE.MeshBasicMaterial({ color: 0x8bd6ff, transparent: true, opacity: .34, depthWrite: false, blending: THREE.AdditiveBlending });
  blackHoleGroup.add(new THREE.Mesh(new THREE.TorusGeometry(104, 1.6, 8, 72), haloMat));
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x267dff, transparent: true, opacity: .08, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending });
  blackHoleGroup.add(new THREE.Mesh(new THREE.SphereGeometry(118, 24, 18), glowMat));

  const asteroids = [];
  for (let i = 0; i < 2; i++) {
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: i ? 0x313842 : 0x454b53 }));
    mesh.scale.setScalar(12 + Math.random() * 18); mesh.position.set((Math.random() - .5) * 1500, (Math.random() - .5) * 850, -1200 - Math.random() * 1000); scene.add(mesh);
    asteroids.push({ mesh, speed: 34 + Math.random() * 48, spin: (Math.random() - .5) * .22 });
  }

  function setBhVisual() {
    const p = scrollProgress, retreat = 1 - .78 * Math.pow(p, .72), fade = 1 - .76 * p, opacity = bhState.opacity * fade;
    blackHoleGroup.scale.setScalar(bhState.scale * retreat); blackHoleGroup.position.x = bhState.x + 72 * p; blackHoleGroup.position.y = bhState.y - 42 * p; blackHoleGroup.position.z = bhState.z - 960 * p;
    coreMat.opacity = opacity; diskUniforms.uOpacity.value = opacity; haloMat.opacity = (.30 + signalBoost * .12) * opacity; glowMat.opacity = (.07 + signalBoost * .035) * opacity; blackHoleGroup.visible = opacity > .008;
  }

  function frame(now = performance.now()) {
    if (!running) return;
    const minFrame = performanceMode === 'game' ? 32 : 22;
    if (now - lastRender < minFrame) { rafId = requestAnimationFrame(frame); return; }
    lastRender = now;
    const dt = Math.min(clock.getDelta(), .04), t = clock.elapsedTime;
    scrollVelocity += (velocityTarget - scrollVelocity) * .18; velocityTarget *= .84; signalBoost = Math.max(0, signalBoost - dt * 1.7);
    if (!reduced) {
      camera.position.x = Math.sin(t * .16) * 5; camera.position.y = Math.cos(t * .13) * 4; camera.position.z = 900 + scrollProgress * 88; camera.lookAt(0, 0, -180 - scrollProgress * 50);
      disk.rotation.z = -.13 + t * .038; diskUniforms.uTime.value = t;
      stars.uniforms.uTime.value = t; stars.uniforms.uScroll.value = scrollProgress; stars.uniforms.uVelocity.value = scrollVelocity;
      dust.uniforms.uTime.value = t; dust.uniforms.uScroll.value = scrollProgress; dust.uniforms.uVelocity.value = scrollVelocity;
      nebula.rotation.y = t * .0025; nebula.position.z = -scrollProgress * 160;
      const travelBoost = 1 + scrollVelocity * 1.4;
      asteroids.forEach(a => { a.mesh.position.z += a.speed * dt * travelBoost; a.mesh.rotation.x += a.spin * dt; a.mesh.rotation.y += a.spin * .8 * dt; if (a.mesh.position.z > 700) { a.mesh.position.z = -1400 - Math.random() * 1100; a.mesh.position.x = (Math.random() - .5) * 1500; a.mesh.position.y = (Math.random() - .5) * 850; } });
    }
    setBhVisual(); renderer.render(scene, camera); if (!reduced) rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  function resize() { syncScroll(); renderer.setPixelRatio(calcDpr()); renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.fov = getIsMobile() ? 70 : 62; camera.updateProjectionMatrix(); if (reduced) { setBhVisual(); renderer.render(scene, camera); } }
  function pause() { running = false; cancelAnimationFrame(rafId); }
  function resume() { if (running) return; running = true; clock.getDelta(); rafId = requestAnimationFrame(frame); }
  function setPerformanceMode(mode = 'normal') { performanceMode = mode === 'game' ? 'game' : 'normal'; }
  function pulseSignal(index = 0) { if (reduced) return; signalBoost = Math.max(signalBoost, .55 + Math.min(index, 4) * .06); }
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); pause(); document.documentElement.classList.add('webgl-fallback'); });
  canvas.addEventListener('webglcontextrestored', () => { document.documentElement.classList.remove('webgl-fallback'); resume(); });
  return { bhState, resize, pause, resume, setPerformanceMode, pulseSignal, renderer, scene, camera };
}
