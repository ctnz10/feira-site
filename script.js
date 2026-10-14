// Puglia — efeitos visuais e interatividade
document.documentElement.classList.add('js-ready');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cursorGlow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (event) => {
  if (!cursorGlow || event.pointerType === 'touch') return;
  cursorGlow.style.opacity = '1';
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}));

// Partículas leves no fundo. Reduzidas automaticamente em telas menores.
const canvas = document.getElementById('particles');
const ctx = canvas?.getContext('2d');
let particles = [];
let width = 0, height = 0, dpr = 1;
function resizeCanvas() {
  if (!canvas || !ctx) return;
  dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  width = window.innerWidth; height = window.innerHeight;
  canvas.width = width * dpr; canvas.height = height * dpr;
  canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(65, Math.floor(width / 19));
  particles = Array.from({length: count}, () => ({
    x: Math.random() * width, y: Math.random() * height,
    r: Math.random() * 1.5 + .3, vx: (Math.random() - .5) * .22,
    vy: (Math.random() - .5) * .22, a: Math.random() * .55 + .15
  }));
}
function drawParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(125,243,220,${p.a})`; ctx.fill();
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j], dx = p.x - q.x, dy = p.y - q.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 100) {
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(125,243,220,${(1 - dist / 100) * .075})`;
        ctx.lineWidth = .6; ctx.stroke();
      }
    }
  }
  if (!prefersReducedMotion) requestAnimationFrame(drawParticles);
}
resizeCanvas();
if (prefersReducedMotion) {
  // Desenha apenas um quadro quando o visitante prefere movimento reduzido.
  drawParticles();
} else {
  drawParticles();
}
window.addEventListener('resize', resizeCanvas);

// Animações GSAP: se a biblioteca não carregar, o site continua utilizável.
function startAnimations() {
  if (!window.gsap || prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    const title = document.querySelector('.hero-title .title-line');
    if (title) title.style.clipPath = 'none';
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  gsap.to('.hero-title .title-line', {clipPath:'inset(0 0% 0 0)', duration:1.2, ease:'power4.out', delay:.25});
  gsap.from('.hero-content .reveal', {y:24, opacity:0, duration:.85, stagger:.12, ease:'power3.out', delay:.45, clearProps:'transform'});
  gsap.to('.hero-image', {scale:1, duration:2.2, ease:'power2.out'});
  gsap.to('.orb-one', {rotation:360, duration:70, repeat:-1, ease:'none', transformOrigin:'center'});
  gsap.to('.orb-two', {rotation:-360, duration:100, repeat:-1, ease:'none', transformOrigin:'center'});
  gsap.utils.toArray('.reveal').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.fromTo(el, {y:28, opacity:0}, {
      y:0, opacity:1, duration:.85, ease:'power3.out',
      scrollTrigger:{trigger:el, start:'top 88%', once:true},
      clearProps:'transform'
    });
  });
  gsap.utils.toArray('.place-card').forEach((card) => {
    gsap.from(card, {y:35, opacity:0, duration:.8, ease:'power2.out',
      scrollTrigger:{trigger:card, start:'top 88%', once:true}});
  });
  gsap.to('.culture-image', {yPercent:-8, ease:'none', scrollTrigger:{
    trigger:'.culture', start:'top bottom', end:'bottom top', scrub:true
  }});
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startAnimations);
else startAnimations();

// Vídeo: esconde a capa quando o arquivo real começar a tocar.
const video = document.getElementById('groupVideo');
const placeholder = document.getElementById('videoPlaceholder');
video?.addEventListener('playing', () => placeholder?.classList.add('hidden'));
video?.addEventListener('pause', () => {
  if (video.currentTime === 0) placeholder?.classList.remove('hidden');
});
placeholder?.addEventListener('click', () => {
  if (video?.readyState >= 2) video.play().catch(() => {});
  else {
    placeholder.querySelector('small').textContent = 'Coloque o arquivo do vídeo em video/puglia.mp4 e atualize a página.';
  }
});
