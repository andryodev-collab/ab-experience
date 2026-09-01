export function initMotion({ bhState, reduced, getIsMobile, onWordSignal }) {
  const { gsap, ScrollTrigger }=window;
  const header=document.getElementById('siteHeader');
  const hudLayer=document.getElementById('hudLayer');
  const huds=gsap.utils.toArray('.hud');

  if(reduced){
    header?.classList.add('visible');
    gsap.set(header,{opacity:1});
    gsap.set('#heroCopy',{opacity:1,y:0});
    gsap.set(huds,{opacity:1,scale:1,x:0,y:0,z:0,rotationX:0,rotationY:0,filter:'none'});
    gsap.set('.hud .bar',{opacity:1,scaleX:1});
    gsap.set('.word,.service',{opacity:1,y:0,scale:1,filter:'none'});
    const p=document.querySelector('.timeline-progress');
    if(p)gsap.set(p,getIsMobile()?{scaleY:1}:{scaleX:1});
    gsap.set('.process .step',{'--step-light':1,color:'#fff'});
    return;
  }

  let headerVisible=null;
  const syncHeader=()=>{
    const next=scrollY>innerHeight*.35;
    if(next===headerVisible)return;
    headerVisible=next;
    header?.classList.toggle('visible',next);
    gsap.to(header,{opacity:next?1:0,duration:.22,overwrite:true});
  };
  addEventListener('scroll',syncHeader,{passive:true});
  syncHeader();

  gsap.to('#heroCopy',{opacity:.08,y:-26,scale:.988,ease:'none',scrollTrigger:{trigger:'.hero-stage',start:'58% top',end:'bottom top',scrub:true}});
  gsap.to(bhState,{scale:.74,refOpacity:.2,ease:'none',scrollTrigger:{trigger:'.hero-stage',start:'24% top',end:'bottom top',scrub:true}});

  huds.forEach((card,i)=>{
    const mobile=getIsMobile();
    const direction=i%2===0?-1:1;
    const bar=card.querySelector('.bar');
    gsap.set(card,mobile
      ? {opacity:0,y:28,scale:.94,rotationX:0,rotationY:0,transformPerspective:900}
      : {opacity:0,y:42,x:direction*24,z:-150,scale:.92,rotationY:direction*-7,rotationX:3,transformPerspective:1200}
    );
    gsap.set(bar,{opacity:0,scaleX:0,transformOrigin:'left center'});

    ScrollTrigger.create({
      trigger:card,
      start:mobile?'top 88%':'top 90%',
      once:true,
      onEnter:()=>{
        const tl=gsap.timeline();
        tl.to(card,mobile
          ? {opacity:1,y:0,scale:1,duration:.72,ease:'power4.out'}
          : {opacity:1,y:0,x:0,z:48+i*10,scale:1,rotationY:direction*1.8,rotationX:0,duration:.92,ease:'expo.out'})
          .to(bar,{opacity:.72,scaleX:1,duration:.34,ease:'power2.out'},mobile?-.28:-.46);
      }
    });
  });

  gsap.utils.toArray('.word').forEach((el,i)=>{
    ScrollTrigger.create({trigger:el,start:'top 64%',end:'bottom 36%',onEnter:()=>onWordSignal?.(i),onEnterBack:()=>onWordSignal?.(i)});
  });

  gsap.utils.toArray('.service').forEach((el,i)=>{
    gsap.set(el,{opacity:0,y:getIsMobile()?18:26,scale:.99});
    ScrollTrigger.create({
      trigger:el,
      start:'top 90%',
      once:true,
      onEnter:()=>gsap.to(el,{opacity:1,y:0,scale:1,duration:.68+i*.03,ease:'power3.out',overwrite:true})
    });
  });

  const process=document.querySelector('.process'),progress=document.querySelector('.timeline-progress'),beacon=document.querySelector('.timeline-beacon'),steps=gsap.utils.toArray('.process .step');
  if(process&&progress&&steps.length){
    const mm=gsap.matchMedia();
    mm.add({'vertical':'(max-width: 980px), (pointer: coarse)','horizontal':'(min-width: 981px) and (pointer: fine)'},ctx=>{
      const vertical=ctx.conditions.vertical;
      gsap.set(progress,vertical?{scaleY:0,scaleX:1,transformOrigin:'top center'}:{scaleX:0,scaleY:1,transformOrigin:'left center'});
      if(beacon)gsap.set(beacon,vertical?{top:0,left:'50%'}:{left:0,top:'50%'});
      gsap.to(progress,{[vertical?'scaleY':'scaleX']:1,ease:'none',scrollTrigger:{trigger:process,start:'top 76%',end:'bottom 30%',scrub:true}});
      if(beacon)gsap.to(beacon,{...(vertical?{top:'100%'}:{left:'100%'}),ease:'none',scrollTrigger:{trigger:process,start:'top 76%',end:'bottom 30%',scrub:true}});
      steps.forEach(step=>ScrollTrigger.create({
        trigger:step,
        start:'top 72%',
        once:true,
        onEnter:()=>gsap.to(step,{'--step-light':1,color:'#fff',duration:.38,ease:'power2.out'})
      }));
    });
  }

  ScrollTrigger.create({trigger:'.hud-layer',start:'top 85%',end:'bottom 15%',onEnter:()=>hudLayer?.classList.add('is-active'),onEnterBack:()=>hudLayer?.classList.add('is-active'),onLeave:()=>hudLayer?.classList.remove('is-active'),onLeaveBack:()=>hudLayer?.classList.remove('is-active')});
}
