import { whatsappUrl } from './config.js';
export function initUI({ reduced }) {
  const { gsap, ScrollTrigger }=window;
  const ctaButton=document.getElementById('ctaButton'); if(ctaButton)ctaButton.href=whatsappUrl();

  const ctaTransmission=document.getElementById('ctaTransmission');
  if(ctaTransmission&&ctaButton){
    const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
    if(fine&&!reduced){
      const qx=gsap.quickTo(ctaButton,'x',{duration:.4,ease:'power3.out'}),qy=gsap.quickTo(ctaButton,'y',{duration:.4,ease:'power3.out'}),qrx=gsap.quickTo(ctaButton,'rotationX',{duration:.4,ease:'power3.out'}),qry=gsap.quickTo(ctaButton,'rotationY',{duration:.4,ease:'power3.out'});
      ctaTransmission.addEventListener('pointermove',e=>{const r=ctaTransmission.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/r.width,y=(e.clientY-r.top-r.height/2)/r.height;qx(x*24);qy(y*24);qrx(-y*9);qry(x*9);},{passive:true});
      ctaTransmission.addEventListener('pointerleave',()=>{qx(0);qy(0);qrx(0);qry(0);});
    }
    ScrollTrigger.create({trigger:'.cta',start:'top 72%',onEnter:()=>gsap.fromTo('.cta-signal',{scale:.2,opacity:0},{scale:1,opacity:.68,duration:1.1,ease:'expo.out'}),onEnterBack:()=>gsap.fromTo('.cta-signal',{scale:.2,opacity:0},{scale:1,opacity:.68,duration:1.1,ease:'expo.out'})});
  }

  const menuToggle=document.getElementById('menuToggle'),mainNav=document.getElementById('mainNav');
  const setMenu=open=>{
    if(!menuToggle||!mainNav)return;
    mainNav.classList.toggle('open',open);menuToggle.classList.toggle('open',open);
    menuToggle.setAttribute('aria-expanded',String(open));
    menuToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  };
  menuToggle?.addEventListener('click',()=>setMenu(!mainNav.classList.contains('open')));
  mainNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&mainNav?.classList.contains('open')){setMenu(false);menuToggle?.focus();}});

  gsap.from('.cta-line',{scaleX:0,opacity:0,scrollTrigger:{trigger:'.cta',start:'top 82%',end:'center 58%',scrub:true}});

  const observe=(el,className)=>{if(!el)return;if(!('IntersectionObserver'in window)){el.classList.add(className);return;}const io=new IntersectionObserver(es=>es.forEach(e=>el.classList.toggle(className,e.isIntersecting)),{rootMargin:'180px 0px'});io.observe(el);};
  observe(document.querySelector('.cta-transmission'),'is-active');
  document.addEventListener('ab:signal-captured',()=>{const core=document.getElementById('journeyCore');if(!core)return;core.classList.add('signal-captured');setTimeout(()=>core.classList.remove('signal-captured'),1200);});

  // Service cards: cursor-following glow + a hint of magnetic tilt (fine pointer only).
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  document.querySelectorAll('.service').forEach(card=>{
    if(fine&&!reduced){
      const qrx=gsap.quickTo(card,'rotationX',{duration:.5,ease:'power3.out'}),qry=gsap.quickTo(card,'rotationY',{duration:.5,ease:'power3.out'});
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
        card.style.setProperty('--mx',(x*100).toFixed(1)+'%');card.style.setProperty('--my',(y*100).toFixed(1)+'%');
        qrx((.5-y)*4);qry((x-.5)*4);
      },{passive:true});
      card.addEventListener('pointerleave',()=>{qrx(0);qry(0);});
    }
  });

  // Scroll progress — the visible readout of how far into the trajectory the visitor is.
  const bar=document.getElementById('scrollProgressBar');
  if(bar){
    let raf=0;
    const sync=()=>{raf=0;const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);bar.style.width=(Math.min(1,scrollY/max)*100).toFixed(2)+'%';};
    const onScroll=()=>{if(!raf)raf=requestAnimationFrame(sync);};
    addEventListener('scroll',onScroll,{passive:true});
    addEventListener('resize',onScroll,{passive:true});
    sync();
  }
}
