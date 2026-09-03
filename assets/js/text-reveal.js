function splitTextIntoChars(element) {
  if (!element || element.dataset.charRevealReady === '1') return [];

  const original = element.textContent.replace(/\s+/g, ' ').trim();
  if (!original) return [];

  if (!element.hasAttribute('aria-label')) element.setAttribute('aria-label', original);

  const chars = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest('[aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach(node => {
    const frag = document.createDocumentFragment();
    const tokens = node.nodeValue.split(/(\s+)/);

    tokens.forEach(token => {
      if (!token) return;
      if (/^\s+$/.test(token)) {
        frag.appendChild(document.createTextNode(token));
        return;
      }

      const word = document.createElement('span');
      word.className = 'reveal-word';
      word.setAttribute('aria-hidden', 'true');

      Array.from(token).forEach(letter => {
        const span = document.createElement('span');
        span.className = 'reveal-char';
        span.textContent = letter;
        span.setAttribute('aria-hidden', 'true');
        word.appendChild(span);
        chars.push(span);
      });
      frag.appendChild(word);
    });
    node.replaceWith(frag);
  });

  element.classList.add('char-reveal');
  element.dataset.charRevealReady = '1';
  return chars;
}

// V18 — leaner reveal system.
// 'chars' continua letra por letra (identidade visual), reservado para títulos e
// blocos curtos de alto impacto. 'fade' revela o bloco inteiro em opacity só —
// sem quebrar o texto em centenas de spans — usado nos parágrafos longos, que
// eram o maior custo de DOM/scroll do sistema anterior.
export function initTextReveal({ reduced = false } = {}) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  const charConfigs = [
    // Hero: the scroll itself writes the opening message.
    ['.hero-kicker', { trigger: '.hero-stage', start: 'top top', end: '14% top' }],
    ['.hero-copy h1', { trigger: '.hero-stage', start: '7% top', end: '31% top' }],

    // Holograms: signal and thought arrive in sequence; the caption fades in as a block.
    ['.hud .eyebrow', { start: 'top 91%', end: 'top 72%' }],
    ['.hud h3', { start: 'top 86%', end: 'top 58%' }],

    // The five conceptual words each get their own reading moment.
    ['.statement .word', { start: 'top 88%', end: 'center 48%' }],

    // Section headlines.
    ['.services .section-label', { start: 'top 91%', end: 'top 73%' }],
    ['.services .section-title', { start: 'top 90%', end: 'top 49%' }],
    ['.service h3', { start: 'top 88%', end: 'top 57%' }],

    ['.playground .section-label', { start: 'top 91%', end: 'top 73%' }],
    ['.playground h2', { start: 'top 89%', end: 'top 51%' }],

    ['.about .section-label', { start: 'top 91%', end: 'top 73%' }],
    ['.about h2', { start: 'top 89%', end: 'top 50%' }],
    ['.about-meta span', { start: 'top 88%', end: 'top 64%' }],

    ['.process .section-label', { start: 'top 91%', end: 'top 73%' }],
    ['.process .section-title', { start: 'top 89%', end: 'top 49%' }],
    ['.process .step span', { start: 'top 84%', end: 'top 60%' }],

    ['.cta .section-label', { start: 'top 91%', end: 'top 73%' }],
    ['.cta h2', { start: 'top 89%', end: 'top 48%' }],

    // Quiet signature at the end.
    ['.footer-sub', { start: 'top 94%', end: 'top 72%' }],
  ];

  const fadeConfigs = [
    ['.availability', { trigger: '.hero-stage', start: 'top top', end: '8% top' }],
    ['.hero-copy p', { trigger: '.hero-stage', start: '25% top', end: '46% top' }],
    ['.hud small', { start: 'top 79%', end: 'top 48%' }],
    ['.service p', { start: 'top 84%', end: 'top 49%' }],
    ['.playground-inner > p', { start: 'top 86%', end: 'top 48%' }],
    ['.about p', { start: 'top 86%', end: 'top 49%' }],
    ['.cta-copy', { start: 'top 85%', end: 'top 48%' }],
  ];

  const resolveTrigger = (opts, element) => {
    const trigger = typeof opts.trigger === 'string'
      ? document.querySelector(opts.trigger) || element
      : (opts.trigger || element);
    return trigger;
  };

  charConfigs.forEach(([selector, options]) => {
    document.querySelectorAll(selector).forEach(element => {
      const chars = splitTextIntoChars(element);
      if (!chars.length) return;
      if (reduced) { gsap.set(chars, { opacity: 1 }); return; }

      const trigger = resolveTrigger(options, element);
      const each = chars.length > 1 ? 0.82 / (chars.length - 1) : 0;
      const tween = gsap.to(chars, {
        opacity: 1,
        duration: 0.18,
        stagger: { each, from: 'start' },
        ease: 'none',
        paused: true,
      });

      ScrollTrigger.create({
        trigger,
        start: options.start || 'top 88%',
        end: options.end || 'top 52%',
        scrub: true,
        animation: tween,
        invalidateOnRefresh: true,
      });
    });
  });

  // Fade mode: one opacity tween per element, zero DOM splitting.
  fadeConfigs.forEach(([selector, options]) => {
    document.querySelectorAll(selector).forEach(element => {
      if (element.dataset.fadeRevealReady === '1') return;
      element.dataset.fadeRevealReady = '1';
      element.classList.add('fade-reveal');
      if (reduced) { gsap.set(element, { opacity: 1 }); return; }

      const trigger = resolveTrigger(options, element);
      gsap.set(element, { opacity: 0 });
      const tween = gsap.to(element, { opacity: 1, ease: 'none', paused: true });

      ScrollTrigger.create({
        trigger,
        start: options.start || 'top 88%',
        end: options.end || 'top 52%',
        scrub: true,
        animation: tween,
        invalidateOnRefresh: true,
      });
    });
  });

  requestAnimationFrame(() => ScrollTrigger.refresh());
}
