const CONFIGS = [
  ['.hero-kicker', { trigger: '.hero-stage', start: 'top top', end: '12% top' }],
  ['.hero-copy h1', { trigger: '.hero-stage', start: '5% top', end: '27% top' }],
  ['.hero-copy p', { trigger: '.hero-stage', start: '22% top', end: '42% top' }],
  ['.hud .eyebrow', { start: 'top 92%', end: 'top 76%' }],
  ['.hud h3', { start: 'top 88%', end: 'top 64%' }],
  ['.hud small', { start: 'top 82%', end: 'top 58%' }],
  ['.statement .word', { start: 'top 90%', end: 'center 52%' }],
  ['.services .section-label', { start: 'top 92%', end: 'top 76%' }],
  ['.services .section-title', { start: 'top 90%', end: 'top 58%' }],
  ['.service h3', { start: 'top 90%', end: 'top 68%' }],
  ['.service p', { start: 'top 86%', end: 'top 62%' }],
  ['.playground .section-label', { start: 'top 92%', end: 'top 76%' }],
  ['.playground h2', { start: 'top 90%', end: 'top 60%' }],
  ['.playground-inner > p', { start: 'top 86%', end: 'top 62%' }],
  ['.about .section-label', { start: 'top 92%', end: 'top 76%' }],
  ['.about h2', { start: 'top 90%', end: 'top 60%' }],
  ['.about p', { start: 'top 86%', end: 'top 62%' }],
  ['.about-meta span', { start: 'top 90%', end: 'top 70%' }],
  ['.process .section-label', { start: 'top 92%', end: 'top 76%' }],
  ['.process .section-title', { start: 'top 90%', end: 'top 60%' }],
  ['.process .step span', { start: 'top 86%', end: 'top 66%' }],
  ['.cta .section-label', { start: 'top 92%', end: 'top 76%' }],
  ['.cta h2', { start: 'top 90%', end: 'top 58%' }],
  ['.cta-copy', { start: 'top 86%', end: 'top 62%' }],
  ['.footer-sub', { start: 'top 94%', end: 'top 78%' }],
];

export function initTextReveal({ reduced = false } = {}) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  CONFIGS.forEach(([selector, options]) => {
    document.querySelectorAll(selector).forEach(element => {
      if (reduced) {
        gsap.set(element, { opacity: 1 });
        return;
      }

      const trigger = typeof options.trigger === 'string'
        ? document.querySelector(options.trigger) || element
        : (options.trigger || element);

      gsap.fromTo(element,
        { opacity: 0.08 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: options.start,
            end: options.end,
            scrub: true,
          }
        }
      );
    });
  });
}
