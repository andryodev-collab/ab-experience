const CONFIGS = [
  ['.hero-kicker', { trigger: '.hero-stage', start: 'top top', end: '14% top', eager: true }],
  ['.hero-copy h1', { trigger: '.hero-stage', start: '7% top', end: '31% top', eager: true }],
  ['.hero-copy p', { trigger: '.hero-stage', start: '25% top', end: '46% top', eager: true }],
  ['.hud .eyebrow', { start: 'top 91%', end: 'top 72%' }],
  ['.hud h3', { start: 'top 86%', end: 'top 58%' }],
  ['.hud small', { start: 'top 79%', end: 'top 48%' }],
  ['.statement .word', { start: 'top 88%', end: 'center 48%' }],
  ['.services .section-label', { start: 'top 91%', end: 'top 73%' }],
  ['.services .section-title', { start: 'top 90%', end: 'top 49%' }],
  ['.service h3', { start: 'top 88%', end: 'top 57%' }],
  ['.service p', { start: 'top 84%', end: 'top 49%' }],
  ['.playground .section-label', { start: 'top 91%', end: 'top 73%' }],
  ['.playground h2', { start: 'top 89%', end: 'top 51%' }],
  ['.playground-inner > p', { start: 'top 86%', end: 'top 48%' }],
  ['.about .section-label', { start: 'top 91%', end: 'top 73%' }],
  ['.about h2', { start: 'top 89%', end: 'top 50%' }],
  ['.about p', { start: 'top 86%', end: 'top 49%' }],
  ['.about-meta span', { start: 'top 88%', end: 'top 64%' }],
  ['.process .section-label', { start: 'top 91%', end: 'top 73%' }],
  ['.process .section-title', { start: 'top 89%', end: 'top 49%' }],
  ['.process .step span', { start: 'top 84%', end: 'top 60%' }],
  ['.cta .section-label', { start: 'top 91%', end: 'top 73%' }],
  ['.cta h2', { start: 'top 89%', end: 'top 48%' }],
  ['.cta-copy', { start: 'top 85%', end: 'top 48%' }],
  ['.footer-sub', { start: 'top 94%', end: 'top 72%' }],
];

function splitTextIntoChars(element) {
  if (!element || element.dataset.charRevealState === 'active' || element.dataset.charRevealState === 'done') return [];

  const label = element.textContent.replace(/\s+/g, ' ').trim();
  if (!label) return [];

  element.__charRevealHTML = element.innerHTML;
  element.__charRevealHadLabel = element.hasAttribute('aria-label');
  if (!element.__charRevealHadLabel) element.setAttribute('aria-label', label);

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest('[aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  const chars = [];
  nodes.forEach(node => {
    const frag = document.createDocumentFragment();
    node.nodeValue.split(/(\s+)/).forEach(token => {
      if (!token) return;
      if (/^\s+$/.test(token)) {
        frag.appendChild(document.createTextNode(token));
        return;
      }
      const word = document.createElement('span');
      word.className = 'reveal-word';
      word.setAttribute('aria-hidden', 'true');
      word.style.whiteSpace = 'nowrap';
      Array.from(token).forEach(letter => {
        const span = document.createElement('span');
        span.className = 'reveal-char';
        span.textContent = letter;
        span.setAttribute('aria-hidden', 'true');
        span.style.opacity = '0';
        word.appendChild(span);
        chars.push(span);
      });
      frag.appendChild(word);
    });
    node.replaceWith(frag);
  });

  element.classList.add('char-reveal');
  element.dataset.charRevealState = 'active';
  return chars;
}

function freezeElement(element, tween, trigger) {
  if (!element || element.dataset.charRevealState === 'done') return;
  trigger?.kill(false);
  tween?.kill();
  if (typeof element.__charRevealHTML === 'string') element.innerHTML = element.__charRevealHTML;
  if (!element.__charRevealHadLabel) element.removeAttribute('aria-label');
  element.classList.remove('char-reveal');
  element.dataset.charRevealState = 'done';
  delete element.__charRevealHTML;
  delete element.__charRevealHadLabel;
}

function activateElement(gsap, ScrollTrigger, element, options) {
  if (!element || element.dataset.charRevealState) return;

  const rect = element.getBoundingClientRect();
  if (rect.bottom < -40) {
    element.dataset.charRevealState = 'done';
    return;
  }

  const chars = splitTextIntoChars(element);
  if (!chars.length) return;

  const triggerElement = typeof options.trigger === 'string'
    ? document.querySelector(options.trigger) || element
    : (options.trigger || element);

  const each = chars.length > 1 ? 0.82 / (chars.length - 1) : 0;
  const tween = gsap.to(chars, {
    opacity: 1,
    duration: 0.16,
    stagger: { each, from: 'start' },
    ease: 'none',
    paused: true,
  });

  let st;
  st = ScrollTrigger.create({
    trigger: triggerElement,
    start: options.start || 'top 88%',
    end: options.end || 'top 52%',
    scrub: true,
    animation: tween,
    onLeave: () => freezeElement(element, tween, st),
  });
}

export function initTextReveal({ reduced = false } = {}) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || reduced) return;

  const pending = [];
  CONFIGS.forEach(([selector, options]) => {
    document.querySelectorAll(selector).forEach(element => pending.push({ element, options }));
  });

  const eager = pending.filter(item => item.options.eager);
  eager.forEach(item => activateElement(gsap, ScrollTrigger, item.element, item.options));

  const deferred = pending.filter(item => !item.options.eager);
  if (!deferred.length) return;

  if (!('IntersectionObserver' in window)) {
    deferred.forEach(item => activateElement(gsap, ScrollTrigger, item.element, item.options));
    return;
  }

  const optionMap = new WeakMap(deferred.map(item => [item.element, item.options]));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      activateElement(gsap, ScrollTrigger, entry.target, optionMap.get(entry.target) || {});
    });
  }, { rootMargin: '18% 0px 38% 0px', threshold: 0 });

  deferred.forEach(item => observer.observe(item.element));
}
