export function initJourney({ getIsMobile }) {
  const { gsap, ScrollTrigger } = window;
  const core=document.getElementById('journeyCore'), label=document.getElementById('journeyLabel');
  if(!core||!gsap||!ScrollTrigger)return;

  const stops=[
    {el:'#inicio',d:[.50,.50],m:[.50,.50],mode:'origin',label:'ORIGIN / AB'},
    {el:'.hud-layer',d:[.82,.29],m:[.78,.25],mode:'gravity',label:'GRAVITY / 01'},
    {el:'.statement',d:[.12,.58],m:[.14,.58],mode:'signal',label:'SIGNAL / 02'},
    {el:'.services',d:[.89,.30],m:[.86,.30],mode:'signal',label:'SYSTEM / 03'},
    {el:'.playground',d:[.09,.46],m:[.13,.46],mode:'play',label:'PLAY / 04'},
    {el:'.about',d:[.88,.36],m:[.84,.36],mode:'human',label:'HUMAN / 05'},
    {el:'.process',d:[.16,.64],m:[.18,.64],mode:'signal',label:'PROCESS / 06'},
    {el:'.cta',d:[.50,.70],m:[.50,.68],mode:'launch',label:'TRANSMIT / 07'}
  ];
  let nodes=[];
  const clamp=v=>Math.max(0,Math.min(1,v));
  const build=()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    nodes=stops.map((s,i)=>{
      const el=document.querySelector(s.el);
      const y=i===0?0:clamp(((el?.offsetTop||0)+(el?.offsetHeight||0)*.5-innerHeight*.5)/max);
      const pos=getIsMobile()?s.m:s.d;
      return {...s,p:y,x:pos[0],yPos:pos[1]};
    }).sort((a,b)=>a.p-b.p);
  };
  build();

  let currentMode='';
  const update=p=>{
    if(!nodes.length)return;
    let i=0;
    while(i<nodes.length-2&&p>nodes[i+1].p)i++;
    const a=nodes[i],b=nodes[Math.min(i+1,nodes.length-1)];
    const span=Math.max(.0001,b.p-a.p),t=clamp((p-a.p)/span),ease=t*t*(3-2*t);
    const x=(a.x+(b.x-a.x)*ease)*innerWidth;
    const y=(a.yPos+(b.yPos-a.yPos)*ease)*innerHeight;
    gsap.set(core,{x,y});
    const mode=t>.52?b:a;
    if(mode.label!==currentMode){currentMode=mode.label;core.dataset.mode=mode.mode;label.textContent=mode.label;}
  };

  ScrollTrigger.create({
    start:0,end:'max',scrub:true,
    onRefresh:self=>{build();update(self.progress);},
    onUpdate:self=>update(self.progress)
  });
  update(clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));

  gsap.to(core,{scale:1.55,opacity:1,scrollTrigger:{trigger:'.cta',start:'top 75%',end:'45% center',scrub:true}});
  gsap.to(core,{scale:.05,opacity:0,scrollTrigger:{trigger:'.cta',start:'52% center',end:'82% center',scrub:true}});
}
