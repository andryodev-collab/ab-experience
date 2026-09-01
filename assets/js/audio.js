export function initAudio() {
  const ambientAudio = document.getElementById('ambientAudio');
  const soundToggle = document.getElementById('soundToggle');
  const soundLabel = document.getElementById('soundLabel');
  if (!ambientAudio || !soundToggle) return { setSound(){} };
  let soundOn = false, fadeRAF = 0;
  ambientAudio.volume = 0;
  function ensureSource(){ if(!ambientAudio.src){ ambientAudio.src=ambientAudio.dataset.src; ambientAudio.load(); } }
  function fadeTo(target,duration){ cancelAnimationFrame(fadeRAF); const start=performance.now(),from=ambientAudio.volume; const tick=now=>{const k=Math.min(1,(now-start)/duration); ambientAudio.volume=from+(target-from)*k; if(k<1)fadeRAF=requestAnimationFrame(tick); else if(target===0)ambientAudio.pause();}; fadeRAF=requestAnimationFrame(tick); }
  function setSound(on){
    soundOn=Boolean(on); soundToggle.classList.toggle('on',soundOn); soundToggle.setAttribute('aria-pressed',String(soundOn));
    soundToggle.setAttribute('aria-label',soundOn?'Desativar trilha ambiente':'Ativar trilha ambiente'); if(soundLabel)soundLabel.textContent=soundOn?'SOM ON':'SOM OFF';
    if(soundOn){ ensureSource(); ambientAudio.play()?.catch?.(()=>setSound(false)); fadeTo(.32,900); } else fadeTo(0,450);
  }
  soundToggle.addEventListener('click',()=>setSound(!soundOn));
  document.addEventListener('visibilitychange',()=>{ if(document.hidden&&soundOn) ambientAudio.pause(); else if(!document.hidden&&soundOn) ambientAudio.play()?.catch?.(()=>{}); });
  return { setSound };
}
