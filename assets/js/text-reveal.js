const SELECTORS = [
  '.hero-kicker', '.hero-copy h1', '.hero-copy p',
  '.hud .eyebrow', '.hud h3', '.hud small',
  '.statement .word',
  '.services .section-label', '.services .section-title', '.service h3', '.service p',
  '.playground .section-label', '.playground h2', '.playground-inner > p',
  '.about .section-label', '.about h2', '.about p', '.about-meta span',
  '.process .section-label', '.process .section-title', '.process .step span',
  '.cta .section-label', '.cta h2', '.cta-copy', '.footer-sub'
];

function presetFor(element, mobile) {
  const isWord = element.matches('.statement .word');
  const isTitle = element.matches('h1,h2,.section-title');
  const isMeta = element.matches('.section-label,.hero-kicker,.about-meta span,.footer-sub,.hud .eyebrow');

  if (mobile) {
    if (isWord) return { from:{opacity:0,scale:.92}, to:{opacity:1,scale:1,duration:.72,ease:'power3.out'} };
    if (isTitle) return { from:{opacity:0,y:18}, to:{opacity:1,y:0,duration:.74,ease:'power3.out'} };
    return { from:{opacity:0,y:10}, to:{opacity:1,y:0,duration:.58,ease:'power2.out'} };
  }

  if (isWord) return { from:{opacity:0,scale:.72,rotationX:38,z:-110}, to:{opacity:1,scale:1,rotationX:0,z:0,duration:1.02,ease:'expo.out'} };
  if (isTitle) return { from:{opacity:0,y:34,rotationX:11,scale:.985}, to:{opacity:1,y:0,rotationX:0,scale:1,duration:.92,ease:'power4.out'} };
  if (isMeta) return { from:{opacity:0,y:10}, to:{opacity:1,y:0,duration:.56,ease:'power2.out'} };
  return { from:{opacity:0,y:18}, to:{opacity:1,y:0,duration:.72,ease:'power3.out'} };
}

export function initTextReveal({ reduced = false } = {}) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  const elements = SELECTORS.flatMap(selector => Array.from(document.querySelectorAll(selector)));
  const unique = [...new Set(elements)];

  if (reduced) {
    gsap.set(unique, { opacity:1, x:0, y:0, scale:1, rotationX:0, rotationY:0, clearProps:'transform' });
    return;
  }

  const mobile = matchMedia('(max-width:980px), (pointer:coarse)').matches;

  unique.forEach((element, index) => {
    if (element.closest('.hero-copy')) return;
    const { from, to } = presetFor(element, mobile);
    gsap.set(element, { ...from, transformPerspective: mobile ? 800 : 1200, transformOrigin:'50% 60%' });

    ScrollTrigger.create({
      trigger: element,
      start: mobile ? 'top 89%' : 'top 88%',
      once: true,
      onEnter: () => gsap.to(element, { ...to, overwrite:true, clearProps:'willChange' })
    });
  });

  const heroItems = gsap.utils.toArray('.hero-kicker,.hero-copy h1,.hero-copy p');
  gsap.set(heroItems, { opacity:0, y: mobile ? 10 : 18 });
  gsap.timeline({ delay:.05 })
    .to(heroItems, { opacity:1, y:0, duration:mobile?.7:.85, stagger:mobile?.12:.16, ease:'power3.out' });
}
