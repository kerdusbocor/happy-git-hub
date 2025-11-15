/* FINAL script.js
   - canvas animated shapes (triangle, circle, square, x)
   - preloader (game-loading bar)
   - intro screen
   - carousel with sound, particle burst, auto slide
   - popup/lightbox
   - background music toggle + volume
   - glitch data-text attribute sync
   - rgb border wrapper added programmatically
*/

(() => {
  /* -------------------------
     UTIL / DOM
     ------------------------- */
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

  /* -------------------------
     PRELOADER (simulate asset loading)
     ------------------------- */
  const preloader = $('#preloader');
  const loaderFill = $('#loaderFill');
  const loaderPercent = $('#loaderPercent');

  function runPreloader(doneCb){
    let pct = 0;
    const tick = setInterval(() => {
      pct += Math.round(5 + Math.random()*12);
      if (pct >= 100) pct = 100;
      loaderFill.style.width = pct + '%';
      loaderPercent.textContent = pct + '%';
      if (pct >= 100) {
        clearInterval(tick);
        setTimeout(() => { doneCb(); }, 600);
      }
    }, 230);
  }

  /* -------------------------
     INTRO SCREEN
     ------------------------- */
  const intro = $('#introScreen');
  function hideIntro(){
    intro.classList.add('hidden');
    setTimeout(()=> intro.style.display='none', 900);
  }

  /* -------------------------
     GLITCH: set data-text for pseudo elements
     ------------------------- */
  const mainTitle = $('#mainTitle');
  function syncGlitch() {
    mainTitle.setAttribute('data-text', mainTitle.textContent);
  }
  syncGlitch();

  /* -------------------------
     BACKGROUND MUSIC (toggle + volume)
     ------------------------- */
  const musicToggle = $('#musicToggle');
  const musicVolume = $('#musicVolume');

  // Use an upbeat loop (Mixkit free asset preview) - replace with your file path if offline
  const bgMusic = new Audio("https://assets.mixkit.co/music/preview/mixkit-urban-gaming-1161.mp3");
  bgMusic.loop = true;
  bgMusic.volume = parseFloat(musicVolume.value);
  bgMusic.preload = 'auto';

  let musicPlaying = false;
  musicToggle.addEventListener('click', () => {
    musicPlaying = !musicPlaying;
    if (musicPlaying) {
      bgMusic.play().catch(()=>{}); // may require user gesture
      musicToggle.textContent = '⏸';
      musicToggle.setAttribute('aria-pressed','true');
    } else {
      bgMusic.pause();
      musicToggle.textContent = '▶';
      musicToggle.setAttribute('aria-pressed','false');
    }
  });
  musicVolume.addEventListener('input', () => {
    bgMusic.volume = parseFloat(musicVolume.value);
  });

  /* -------------------------
     CANVAS: floating shapes
     ------------------------- */
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let cw = canvas.width = window.innerWidth;
  let ch = canvas.height = window.innerHeight;

  const colors = ["#00ffc6","#00e5ff","#ff2e63","#ff9f1c","#7c5cff"];
  const shapeTypes = ["triangle","circle","square","x"];
  class Particle {
    constructor(){
      this.reset();
    }
    reset(){
      this.x = Math.random()*cw;
      this.y = Math.random()*ch;
      this.r = 12 + ~~(Math.random()*22);
      this.shape = shapeTypes[~~(Math.random()*shapeTypes.length)];
      this.rot = Math.random()*Math.PI*2;
      this.speed = 0.12 + Math.random()*0.9;
      this.rotSpeed = (Math.random()*0.02)-0.01;
      this.color = colors[~~(Math.random()*colors.length)];
    }
    update(){
      this.y -= this.speed;
      this.rot += this.rotSpeed;
      if (this.y < -this.r) { this.y = ch + this.r; this.x = Math.random()*cw; this.reset(); }
    }
    draw(){
      ctx.save();
      ctx.translate(this.x,this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = this.color;
      const s = this.r;
      if (this.shape === "triangle"){
        ctx.beginPath(); ctx.moveTo(0,-s); ctx.lineTo(s*0.9,s*0.75); ctx.lineTo(-s*0.9,s*0.75); ctx.closePath(); ctx.stroke();
      } else if (this.shape === "circle"){
        ctx.beginPath(); ctx.arc(0,0,s*0.9,0,Math.PI*2); ctx.stroke();
      } else if (this.shape === "square"){
        const side = s*1.4; ctx.beginPath(); ctx.rect(-side/2,-side/2,side,side); ctx.stroke();
      } else {
        const len = s*1.3; ctx.beginPath(); ctx.moveTo(-len/2,-len/2); ctx.lineTo(len/2,len/2); ctx.moveTo(len/2,-len/2); ctx.lineTo(-len/2,len/2); ctx.stroke();
      }
      ctx.restore();
    }
  }
  let particles = [];
  for (let i=0;i<28;i++) particles.push(new Particle());
  let rafId = null;
  function resizeCanvas(){
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  function animateCanvas(){
    rafId = requestAnimationFrame(animateCanvas);
    ctx.clearRect(0,0,cw,ch);
    particles.forEach(p=>{ p.update(); p.draw(); });
  }

  /* -------------------------
     CAROUSEL + LIGHTBOX + PARTICLE BURST + SOUNDS
     ------------------------- */
  function setupCarousel(){
    const slider = $('#photoSlider');
    if (!slider) return;
    const slides = slider.querySelector('.slides');
    const cards = Array.from(slides.querySelectorAll('.card'));
    const prev = slider.querySelector('.prev');
    const next = slider.querySelector('.next');
    let index = 0;

    // Wrap images with rgb border overlays
    cards.forEach(card => {
      const img = card.querySelector('img');
      if (!img) return;
      const wrap = document.createElement('span');
      wrap.className = 'rgb-wrap';
      const border = document.createElement('span');
      border.className = 'rgb-border';
      // move img into wrap
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
      wrap.appendChild(border);
    });

    // slide sound
    const slideSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3");
    slideSound.volume = 0.38;

    function update(){
      slides.style.transform = `translateX(-${index*100}%)`;
    }

    function particleBurst(x,y){
      const canvasBurst = document.createElement('canvas');
      const size = 260;
      canvasBurst.width = size; canvasBurst.height = size;
      canvasBurst.style.position = 'absolute';
      canvasBurst.style.left = (x - size/2) + 'px';
      canvasBurst.style.top = (y - size/2) + 'px';
      canvasBurst.style.pointerEvents = 'none';
      canvasBurst.style.zIndex = 2100;
      document.body.appendChild(canvasBurst);
      const c = canvasBurst.getContext('2d');
      const burst = [];
      for (let i=0;i<26;i++){
        burst.push({
          x:size/2, y:size/2,
          angle: Math.random()*Math.PI*2,
          speed: 2+Math.random()*4,
          r: 3+Math.random()*6,
          color: colors[~~(Math.random()*colors.length)],
          alpha: 1
        });
      }
      function step(){
        c.clearRect(0,0,size,size);
        burst.forEach(p=>{
          p.x += Math.cos(p.angle)*p.speed;
          p.y += Math.sin(p.angle)*p.speed;
          p.alpha -= 0.02;
          c.globalAlpha = Math.max(0,p.alpha);
          c.fillStyle = p.color;
          c.beginPath(); c.arc(p.x,p.y,p.r,0,Math.PI*2); c.fill();
        });
        if (burst.some(b=>b.alpha>0)){
          requestAnimationFrame(step);
        } else {
          try{ document.body.removeChild(canvasBurst); }catch(e){}
        }
      }
      step();
    }

    prev.addEventListener('click', (e)=>{
      const r = slider.getBoundingClientRect();
      particleBurst(r.left + r.width/2, r.top + 60);
      slideSound.currentTime = 0; slideSound.play().catch(()=>{});
      index = (index - 1 + cards.length) % cards.length; update();
    });
    next.addEventListener('click', (e)=>{
      const r = slider.getBoundingClientRect();
      particleBurst(r.left + r.width/2, r.top + 60);
      slideSound.currentTime = 0; slideSound.play().catch(()=>{});
      index = (index + 1) % cards.length; update();
    });

    // Auto slide with pause on hover
    let auto = setInterval(()=> next.click(), 4200);
    slider.addEventListener('mouseenter', ()=> clearInterval(auto));
    slider.addEventListener('mouseleave', ()=> { auto = setInterval(()=> next.click(),4200); });

    // adjust height after images load
    const imgs = slider.querySelectorAll('img');
    function updateHeight(){
      const active = cards[index];
      const img = active.querySelector('img');
      const h = img && img.complete ? img.getBoundingClientRect().height : active.getBoundingClientRect().height;
      if (h>0) slider.style.height = h + 'px';
    }
    imgs.forEach(img => { if (!img.complete) img.addEventListener('load', updateHeight); });
    window.addEventListener('resize', updateHeight);
    update(); updateHeight();

    // Lightbox
    const modal = $('#imageModal');
    const modalImg = $('#modalImage');
    const modalClose = modal.querySelector('.image-modal-close');
    const modalBackdrop = modal.querySelector('.image-modal-backdrop');

    function openModal(src, alt){
      modalImg.src = src; modalImg.alt = alt || 'Photo';
      modal.classList.add('is-visible'); modal.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    }
    function closeModal(){
      modal.classList.remove('is-visible'); modal.setAttribute('aria-hidden','true');
      modalImg.src = ''; document.body.style.overflow = '';
    }
    imgs.forEach(img => img.addEventListener('click', function(){
      openModal(this.src,this.alt);
    }));
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    window.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });

    // make slide change trigger particle+sound programmatically when auto advances
    const origNextClick = next.onclick;
    // already handling sound/particle in next/prev listeners
  }

  /* -------------------------
     SING-ALONG (existing sound / spans)
     ------------------------- */
  function setupSingAlong(){
    // notes array (HBD) same as original; using p1..p4
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const p1 = $('#p1'), p2 = $('#p2'), p3 = $('#p3'), p4 = $('#p4');
    const notes = [
      {f:262,d:.5,t:"Hap",p:p1},{f:262,d:.5,t:"py ",p:p1},{f:294,d:1,t:"Birth",p:p1},{f:262,d:1,t:"day ",p:p1},{f:349,d:1,t:"To ",p:p1},{f:330,d:2,t:"You",p:p1},
      {f:262,d:.5,t:"Hap",p:p2},{f:262,d:.5,t:"py ",p:p2},{f:294,d:1,t:"Birth",p:p2},{f:262,d:1,t:"day ",p:p2},{f:392,d:1,t:"To ",p:p2},{f:349,d:2,t:"You",p:p2},
      {f:262,d:.5,t:"Hap",p:p3},{f:262,d:.5,t:"py ",p:p3},{f:523,d:1,t:"Birth",p:p3},{f:440,d:1,t:"day ",p:p3},{f:349,d:1,t:"To ",p:p3},{f:330,d:3,t:"You",p:p3},
      {f:466,d:.5,t:"Hap",p:p4},{f:466,d:.5,t:"py ",p:p4},{f:440,d:1,t:"Birth",p:p4},{f:349,d:1,t:"day ",p:p4},{f:392,d:1,t:"To ",p:p4},{f:349,d:2,t:"You",p:p4},
    ];
    notes.forEach(n => {
      n.sp = document.createElement('span');
      n.sp.innerHTML = n.t;
      n.p.appendChild(n.sp);
    });
    let speed = $('#inputSpeed').value;
    let flag = false;
    const sounds = [];
    class Sound {
      constructor(freq,dur,i){
        this.stop=true; this.frequency=freq; this.waveform='triangle';
        this.dur=dur; this.speed=this.dur*speed; this.initialGain=.14; this.index=i; this.sp = notes[i].sp;
      }
      cease(){
        this.stop=true;
        this.sp.classList.remove('jump');
        if (this.index < sounds.length-1) sounds[this.index+1].play();
        if (this.index === sounds.length-1) flag = false;
      }
      play(){
        this.osc = audioCtx.createOscillator();
        this.gain = audioCtx.createGain();
        this.gain.gain.value = this.initialGain;
        this.osc.type = this.waveform;
        this.osc.frequency.value = this.frequency;
        this.gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + this.speed);
        this.osc.connect(this.gain); this.gain.connect(audioCtx.destination);
        this.osc.start(audioCtx.currentTime);
        this.sp.classList.add('jump');
        this.stop=false;
        this.osc.stop(audioCtx.currentTime + this.speed);
        this.osc.onended = ()=> this.cease();
      }
    }
    for (let i=0;i<notes.length;i++) sounds.push(new Sound(notes[i].f,notes[i].d,i));
    $('#wishes').addEventListener('click', function(e){
      if (e.target.id !== 'inputSpeed' && !flag){
        // ensure audio context resumed (user gesture)
        audioCtx.resume().catch(()=>{});
        sounds[0].play(); flag = true;
      }
    });
    $('#inputSpeed').addEventListener('input', function(){
      speed = this.value;
      sounds.forEach(s => { s.speed = s.dur*speed; });
    });
  }

  /* -------------------------
     BOOTSTRAP: sequence
     - run preloader
     - start canvas anim
     - show intro then site
     ------------------------- */
  runPreloader(()=> {
    // hide preloader
    preloader.style.display = 'none';

    // start canvas anim
    animateCanvas();

    // show intro for ~2.8s then hide
    setTimeout(() => {
      // reveal intro for 1700ms then hide
      setTimeout(()=> hideIntro(), 1800);
      // start music only when user toggles or interacts
    }, 300);

    // init carousel and other features after small delay
    setTimeout(() => {
      setupCarousel();
      setupSingAlong();
    }, 400);
  });

  // Accessibility: allow keyboard to start music when user presses space or clicks anywhere
  window.addEventListener('click', function onceStart(){
    // allow background audio to be played after gesture if toggle was set true
    window.removeEventListener('click', onceStart);
  });

})();
