import * as THREE from 'three';

const clamp01 = v => Math.max(0, Math.min(1, v));

export function initSpace({ reduced, getIsMobile, bhState }) {
  const canvas = document.getElementById('space-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  const maxPixels = 920000;
  const calcDpr = () => Math.max(.72, Math.min(devicePixelRatio || 1, 1, Math.sqrt(maxPixels / Math.max(1, innerWidth * innerHeight))));
  renderer.setPixelRatio(calcDpr());
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x010207, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .98;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x010207, .0008);
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, .1, 3600);
  camera.position.set(0, 0, 900);
  document.documentElement.dataset.performanceProfile = 'efficient-lite';

  let running = true, rafId = 0, performanceMode = 'normal', lastRender = 0;
  let scrollProgress = 0, scrollVelocity = 0, velocityTarget = 0, lastY = scrollY, lastAt = performance.now(), signalBoost = 0;
  const clock = new THREE.Clock();

  const syncScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const now = performance.now(), y = scrollY, dt = Math.max(16, now - lastAt);
    scrollProgress = clamp01(y / max);
    velocityTarget = Math.min(1.5, Math.abs(y - lastY) / dt * .48);
    lastY = y;
    lastAt = now;
  };
  syncScroll();
  addEventListener('scroll', syncScroll, { passive: true });

  function pointLayer({ count, spreadX, spreadY, zMin, zRange, size, opacity, color, speedMin, speedRange, scrollTravel, velocityTravel, wrapMin, wrapRange, maxSize = 4 }) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - .5) * spreadX;
      pos[i * 3 + 1] = (Math.random() - .5) * spreadY;
      pos[i * 3 + 2] = zMin + Math.random() * zRange;
      speeds[i] = speedMin + Math.random() * speedRange;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uSize: { value: size },
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color(color) },
      uScrollTravel: { value: scrollTravel },
      uVelocityTravel: { value: velocityTravel },
      uWrapMin: { value: wrapMin },
      uWrapRange: { value: wrapRange },
      uMaxSize: { value: maxSize }
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aSpeed;uniform float uTime,uScroll,uVelocity,uSize,uScrollTravel,uVelocityTravel,uWrapMin,uWrapRange,uMaxSize;varying float vVelocity;void main(){vec3 p=position;float travel=uTime*aSpeed+uScroll*uScrollTravel+uVelocity*uVelocityTravel;p.z=uWrapMin+mod(position.z-uWrapMin+travel,uWrapRange);vec4 mv=modelViewMatrix*vec4(p,1.0);float perspective=500.0/max(70.0,-mv.z);gl_PointSize=clamp(uSize*perspective*(1.0+uVelocity*.55),.7,uMaxSize);gl_Position=projectionMatrix*mv;vVelocity=uVelocity;}`,
      fragmentShader: `uniform float uOpacity;uniform vec3 uColor;varying float vVelocity;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);float a=smoothstep(.5,.08,d)*uOpacity*(1.0+vVelocity*.25);gl_FragColor=vec4(uColor,a);}`
    });
    const mesh = new THREE.Points(geo, material);
    scene.add(mesh);
    return { mesh, uniforms };
  }

  const farStars = pointLayer({ count: 620, spreadX: 2600, spreadY: 1500, zMin: -1800, zRange: 2100, size: 1.35, opacity: .68, color: 0xdcecff, speedMin: 2, speedRange: 7, scrollTravel: 470, velocityTravel: 55, wrapMin: -1800, wrapRange: 2300, maxSize: 2.5 });
  const midStars = pointLayer({ count: 310, spreadX: 2200, spreadY: 1300, zMin: -1300, zRange: 1800, size: 1.9, opacity: .8, color: 0xeaf6ff, speedMin: 4, speedRange: 13, scrollTravel: 960, velocityTravel: 130, wrapMin: -1500, wrapRange: 2200, maxSize: 3.8 });
  const nearDust = pointLayer({ count: 105, spreadX: 1750, spreadY: 1050, zMin: -700, zRange: 1200, size: 3.2, opacity: .16, color: 0x63b8ff, speedMin: 6, speedRange: 14, scrollTravel: 1560, velocityTravel: 300, wrapMin: -900, wrapRange: 1650, maxSize: 6.2 });

  const nebula = new THREE.Group();
  scene.add(nebula);
  [0x17345a, 0x293e69, 0x3d244f].forEach((color, col) => {
    const count = col === 2 ? 70 : 100;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -480 + col * 470 + (Math.random() - .5) * 360;
      pos[i * 3 + 1] = (Math.random() - .5) * 1150;
      pos[i * 3 + 2] = -1050 - Math.random() * 520;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    nebula.add(new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 38, transparent: true, opacity: .03, depthWrite: false, blending: THREE.AdditiveBlending })));
  });

  const blackHoleGroup = new THREE.Group();
  blackHoleGroup.position.set(0, -45, 20);
  scene.add(blackHoleGroup);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1 });
  blackHoleGroup.add(new THREE.Mesh(new THREE.SphereGeometry(78, 30, 22), coreMat));

  const diskUniforms = { uTime: { value: 0 }, uOpacity: { value: .9 } };
  const diskMat = new THREE.ShaderMaterial({ uniforms: diskUniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec2 vUv;uniform float uTime;uniform float uOpacity;void main(){vec2 p=vUv-.5;float r=length(p)*2.0;float a=atan(p.y,p.x);float ring=smoothstep(1.0,.30,r)*smoothstep(.20,.50,r);float flow=.58+.42*sin(a*10.0-r*21.0-uTime*1.85);float filament=.72+.28*sin(a*23.0+r*33.0+uTime*.72);vec3 c=mix(vec3(.06,.30,.90),vec3(.88,.97,1.0),flow);gl_FragColor=vec4(c,ring*(.22+.54*flow+.16*filament)*uOpacity);}` });
  const disk = new THREE.Mesh(new THREE.RingGeometry(94, 220, 120, 3), diskMat); disk.rotation.x = 1.18; disk.rotation.z = -.13; blackHoleGroup.add(disk);

  const haloMat = new THREE.MeshBasicMaterial({ color: 0x8bd6ff, transparent: true, opacity: .34, depthWrite: false, blending: THREE.AdditiveBlending });
  blackHoleGroup.add(new THREE.Mesh(new THREE.TorusGeometry(104, 1.6, 8, 72), haloMat));
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x267dff, transparent: true, opacity: .08, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending });
  blackHoleGroup.add(new THREE.Mesh(new THREE.SphereGeometry(118, 24, 18), glowMat));

  const asteroids = [];
  for (let i = 0; i < 3; i++) {
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x313842 : 0x454b53 }));
    mesh.scale.setScalar(10 + Math.random() * 20);
    mesh.position.set((Math.random() - .5) * 1550, (Math.random() - .5) * 900, -1200 - Math.random() * 1200);
    scene.add(mesh);
    asteroids.push({ mesh, speed: 34 + Math.random() * 56, spin: (Math.random() - .5) * .22 });
  }

  function setBhVisual() {
    const p = scrollProgress;
    const retreat = 1 - .80 * Math.pow(p, .72);
    const fade = 1 - .78 * p;
    const opacity = bhState.opacity * fade;
    blackHoleGroup.scale.setScalar(bhState.scale * retreat);
    blackHoleGroup.position.x = bhState.x + 78 * p;
    blackHoleGroup.position.y = bhState.y - 48 * p;
    blackHoleGroup.position.z = bhState.z - 1040 * p;
    coreMat.opacity = opacity;
    diskUniforms.uOpacity.value = opacity;
    haloMat.opacity = (.30 + signalBoost * .12) * opacity;
    glowMat.opacity = (.07 + signalBoost * .035) * opacity;
    blackHoleGroup.visible = opacity > .006;
  }

  function frame(now = performance.now()) {
    if (!running) return;
    const activeMotion = scrollVelocity > .035 || velocityTarget > .035;
    const minFrame = performanceMode === 'game' ? 33 : (activeMotion ? 16 : 24);
    if (now - lastRender < minFrame) { rafId = requestAnimationFrame(frame); return; }
    lastRender = now;

    const dt = Math.min(clock.getDelta(), .04);
    const t = clock.elapsedTime;
    scrollVelocity += (velocityTarget - scrollVelocity) * .18;
    velocityTarget *= .83;
    signalBoost = Math.max(0, signalBoost - dt * 1.7);

    if (!reduced) {
      const sway = .55 + scrollVelocity * .28;
      camera.position.x = Math.sin(t * .15) * 5.5 * sway;
      camera.position.y = Math.cos(t * .12) * 4.2 * sway;
      camera.position.z = 900 + scrollProgress * 104 - scrollVelocity * 12;
      const targetFov = 70 + scrollVelocity * 2.4;
      if (Math.abs(camera.fov - targetFov) > .05) { camera.fov += (targetFov - camera.fov) * .18; camera.updateProjectionMatrix(); }
      camera.lookAt(0, 0, -190 - scrollProgress * 70);

      disk.rotation.z = -.13 + t * .038;
      diskUniforms.uTime.value = t;
      [farStars, midStars, nearDust].forEach(layer => {
        layer.uniforms.uTime.value = t;
        layer.uniforms.uScroll.value = scrollProgress;
        layer.uniforms.uVelocity.value = scrollVelocity;
      });

      nebula.rotation.y = t * .0022;
      nebula.position.x = Math.sin(t * .035) * 8;
      nebula.position.z = -scrollProgress * 210;

      const travelBoost = 1 + scrollVelocity * 1.8;
      asteroids.forEach(a => {
        a.mesh.position.z += a.speed * dt * travelBoost;
        a.mesh.rotation.x += a.spin * dt;
        a.mesh.rotation.y += a.spin * .8 * dt;
        if (a.mesh.position.z > 720) {
          a.mesh.position.z = -1450 - Math.random() * 1200;
          a.mesh.position.x = (Math.random() - .5) * 1550;
          a.mesh.position.y = (Math.random() - .5) * 900;
        }
      });
    }

    setBhVisual();
    renderer.render(scene, camera);
    if (!reduced) rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);

  function resize() {
    syncScroll();
    renderer.setPixelRatio(calcDpr());
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.fov = getIsMobile() ? 70 : 62;
    camera.updateProjectionMatrix();
    if (reduced) { setBhVisual(); renderer.render(scene, camera); }
  }
  function pause() { running = false; cancelAnimationFrame(rafId); }
  function resume() { if (running) return; running = true; clock.getDelta(); rafId = requestAnimationFrame(frame); }
  function setPerformanceMode(mode = 'normal') { performanceMode = mode === 'game' ? 'game' : 'normal'; }
  function pulseSignal(index = 0) { if (reduced) return; signalBoost = Math.max(signalBoost, .55 + Math.min(index, 4) * .06); }

  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); pause(); document.documentElement.classList.add('webgl-fallback'); });
  canvas.addEventListener('webglcontextrestored', () => { document.documentElement.classList.remove('webgl-fallback'); resume(); });

  return { bhState, resize, pause, resume, setPerformanceMode, pulseSignal, renderer, scene, camera };
}
