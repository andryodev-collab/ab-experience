import { reduced, getIsMobile, mobileQuery } from './config.js';
import { initAudio } from './audio.js';
import { initIntro } from './intro.js';
import { initMotion } from './motion.js';
import { initJourney } from './journey.js';
import { initUI } from './ui.js';
import { initTextReveal } from './text-reveal.js';

const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
const bhState={scale:.66,x:getIsMobile()?0:175,y:getIsMobile()?-45:-18,z:20,opacity:.52,refOpacity:.08};
let space=null,gameLoaded=false;
function staticFallback(){document.documentElement.classList.add('app-fallback');document.getElementById('intro')?.remove();const hero=document.getElementById('heroCopy');if(hero)hero.style.opacity='1';const header=document.getElementById('siteHeader');if(header){header.style.opacity='1';header.classList.add('visible');}}
if(!gsap||!ScrollTrigger){staticFallback();throw new Error('AB: animation runtime unavailable');}
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ignoreMobileResize:true});
initAudio();
initTextReveal({reduced});
initIntro({bhState,reduced});
initMotion({bhState,reduced,getIsMobile,onWordSignal:i=>space?.pulseSignal?.(i)});
if(!reduced)initJourney({getIsMobile});
initUI({reduced});
document.documentElement.dataset.appReady='ui';

import('./space.js').then(({initSpace})=>{space=initSpace({reduced,getIsMobile,bhState});document.documentElement.dataset.appReady='full';}).catch(err=>{console.warn('AB WebGL fallback',err);document.documentElement.classList.add('webgl-fallback');});

let resizeRAF=0,lastW=innerWidth,lastH=innerHeight;
addEventListener('resize',()=>{cancelAnimationFrame(resizeRAF);resizeRAF=requestAnimationFrame(()=>{const dw=Math.abs(innerWidth-lastW),dh=Math.abs(innerHeight-lastH);space?.resize?.();if(dw>8||dh>120)ScrollTrigger.refresh();lastW=innerWidth;lastH=innerHeight;});},{passive:true});
mobileQuery.addEventListener?.('change',()=>requestAnimationFrame(()=>ScrollTrigger.refresh()));
document.addEventListener('visibilitychange',()=>{document.hidden?space?.pause?.():space?.resume?.();});

const playground=document.querySelector('.playground');
if(playground){
  const loadGame=async()=>{if(gameLoaded)return;gameLoaded=true;const {initGame}=await import('./game.js');initGame({onActivity:on=>space?.setPerformanceMode?.(on?'game':'normal')});};
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();loadGame();}},{rootMargin:'650px 0px'});observer.observe(playground);}else setTimeout(loadGame,1600);
}
setTimeout(()=>{if(!document.documentElement.dataset.appReady)staticFallback();},5200);
