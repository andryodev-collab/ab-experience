export function initIntro({ bhState, reduced }) {
  const { gsap, ScrollTrigger } = window;
  const intro=document.getElementById('intro'), hero=document.getElementById('heroCopy');
  if(!intro||!gsap){ intro?.remove(); if(hero)hero.style.opacity='1'; return; }

  let done=false, tl=null;
  const removeScrollListener=()=>removeEventListener('scroll',onScroll);
  const finish=()=>{
    if(done)return;
    done=true;
    removeScrollListener();
    intro.style.display='none';
    gsap.to('#journeyCore',{opacity:.78,scale:1,duration:.7,ease:'expo.out',overwrite:true});
  };
  const skipForScroll=()=>{
    if(done)return;
    done=true;
    removeScrollListener();
    tl?.kill();
    gsap.killTweensOf([intro,'#heroCopy',bhState]);
    gsap.set(intro,{opacity:0,display:'none'});
    gsap.set(hero,{opacity:1,y:0});
    Object.assign(bhState,{scale:1,opacity:1,refOpacity:.34});
    gsap.set('#journeyCore',{opacity:.72,scale:1});
    ScrollTrigger?.update?.();
  };
  function onScroll(){ if(scrollY>10)skipForScroll(); }

  if(reduced){
    intro.style.display='none';
    Object.assign(bhState,{scale:1,opacity:1,refOpacity:.34});
    if(hero)hero.style.opacity='1';
    gsap.set('#journeyCore',{opacity:.45,scale:1,x:innerWidth*.8,y:innerHeight*.28});
    return;
  }

  // A intro nunca bloqueia o scroll. Se o visitante rolar, ela cede imediatamente à página.
  addEventListener('scroll',onScroll,{passive:true});
  bhState.scale=.66;bhState.opacity=.52;bhState.refOpacity=.08;
  gsap.set('#journeyCore',{opacity:0,x:innerWidth*.5,y:innerHeight*.5,scale:.42});
  tl=gsap.timeline({defaults:{ease:'power2.out'}})
    .to('.intro-min-dot',{opacity:1,scale:1,duration:.72,ease:'expo.out'},.1)
    .to('.intro-min-mark',{opacity:1,y:0,filter:'blur(0px)',duration:.8,ease:'expo.out'},.42)
    .to('.intro-min-name',{opacity:.72,y:0,duration:.5},.82)
    .to('.intro-min-role',{opacity:.34,y:0,duration:.5},.98)
    .to('.intro-min-wave',{opacity:.32,scale:1,duration:1,ease:'expo.out'},1.08)
    .to('.intro-min-wave',{opacity:0,scale:2.5,duration:1,ease:'power2.out'},1.56)
    .to('.intro-min-center',{opacity:0,scale:.985,filter:'blur(4px)',duration:.65,ease:'power2.inOut'},2.25)
    .to('#intro',{opacity:0,duration:.68,ease:'power2.inOut',onComplete:finish},2.42)
    .to(bhState,{scale:1,opacity:1,refOpacity:.34,duration:1.15,ease:'power2.out'},2.34)
    .to('#heroCopy',{opacity:1,duration:.45,ease:'none'},2.74);
}
