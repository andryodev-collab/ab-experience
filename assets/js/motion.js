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
    gsap.to(header,{opacity:next?1:0,duration:.2,overwrite:true});
  };
  addEventListener('scroll',syncHeader,{passive:true});
  syncHeader();

  gsap.to('#heroCopy',{opacity:.05,y:-42,scale:.975,ease:'none',scrollTrigger:{trigger:'.hero-stage',start:'48% top',end:'bottom top',scrub:true}});
  gsap.to(bhState,{scale:.76,refOpacity:.22,ease:'none',scrollTrigger:{trigger:'.hero-stage',start:'20% top',end:'bottom top',scrub:true}});

  huds.forEach((card,i)=>{
    const coarse=getIsMobile();
    const direction=i%2===0?-1:1;
    const bar=card.querySelector('.bar');
    gsap.set(card,coarse
      ? {opacity:0,y:44,x:0,z:0,scale:.93,rotationX:0,rotationY:0,transformPerspective:1000}
      : {opacity:0,y:48,x:direction*18,z:-110,scale:.95,rotationY:direction*-3,transformPerspective:1200}
    );
    gsap.set(bar,{opacity:0,scaleX:0,transformOrigin:'left center'});

    const tl=gsap.timeline({scrollTrigger:{trigger:card,start:coarse?'top 90%':'top 92%',end:coarse?'bottom 12%':'bottom 8%',scrub:true,invalidateOnRefresh:true}});
    if(coarse){
      tl.to(card,{opacity:1,y:0,x:0,z:0,scale:1,rotationX:0,rotationY:0,duration:.34,ease:'power2.out'},0)
        .to(bar,{opacity:.68,scaleX:1,duration:.20},.36)
        .to(card,{opacity:.24,y:-24,scale:.965,duration:.24,ease:'power2.in'},.88);
    }else{
      tl.to(card,{opacity:1,y:0,x:0,z:70+i*18,scale:1,rotationY:direction*2,duration:.38,ease:'power2.out'},0)
        .to(bar,{opacity:.65,scaleX:1,duration:.18},.22)
        .to(card,{opacity:.12,y:-42,x:direction*-12,z:-150,scale:.96,rotationY:direction*-2,duration:.34,ease:'power2.in'},.66);
    }
  });

  gsap.utils.toArray('.word').forEach((el,i)=>{
    gsap.set(el,{opacity:1,y:0,scale:1,filter:'none'});
    gsap.to(el,{opacity:.14,ease:'none',scrollTrigger:{trigger:el,start:'center 34%',end:'bottom 8%',scrub:true}});
    ScrollTrigger.create({trigger:el,start:'top 64%',end:'bottom 36%',onEnter:()=>onWordSignal?.(i),onEnterBack:()=>onWordSignal?.(i)});
  });

  gsap.utils.toArray('.service').forEach(el=>{
    gsap.fromTo(el,{opacity:1,y:18},{opacity:1,y:0,ease:'none',scrollTrigger:{trigger:el,start:'top 92%',end:'top 66%',scrub:true}});
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
      steps.forEach(step=>gsap.to(step,{'--step-light':1,color:'#fff',ease:'none',scrollTrigger:{trigger:step,start:'top 76%',end:'top 54%',scrub:true}}));
    });
  }

  ScrollTrigger.create({trigger:'.hud-layer',start:'top 85%',end:'bottom 15%',onEnter:()=>hudLayer?.classList.add('is-active'),onEnterBack:()=>hudLayer?.classList.add('is-active'),onLeave:()=>hudLayer?.classList.remove('is-active'),onLeaveBack:()=>hudLayer?.classList.remove('is-active')});
}
