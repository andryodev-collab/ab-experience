export const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const reduced = reducedQuery.matches;
export const mobileQuery = window.matchMedia('(max-width: 980px), (pointer: coarse)');
export const coarseQuery = window.matchMedia('(hover: none), (pointer: coarse)');
export const getIsMobile = () => mobileQuery.matches;
export const getIsCoarse = () => coarseQuery.matches;

export function getPerformanceProfile(){
  const coarse=getIsCoarse();
  const memory=Number(navigator.deviceMemory||4);
  const cores=Number(navigator.hardwareConcurrency||4);
  if(coarse || memory<=4 || cores<=4) return 'efficient';
  if(memory<=8 || cores<=8) return 'balanced';
  return 'high';
}

export const CONTACT = {
  whatsapp: '5521981507521',
  message: 'Olá Andryo, vi a experiência AB e gostaria de conversar sobre um projeto.'
};
export function whatsappUrl(){return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.message)}`;}
export function onIdle(callback, timeout = 1400) {
  if ('requestIdleCallback' in window) return requestIdleCallback(callback, { timeout });
  return setTimeout(callback, Math.min(timeout, 700));
}
