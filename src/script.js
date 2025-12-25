const slides = Array.from(document.querySelectorAll('.slide'));
const totalSlides = slides.length - 1;
const bgLayer = document.getElementById('bg-layer');
const lens = document.getElementById('lens');
const deck = document.getElementById('deck');

const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
const penBtn = document.getElementById('pen-btn');
const eraserBtn = document.getElementById('eraser-btn');

let current = 0;
let isDrawing = false;
let mode = 'pen';
const slideDrawings = {};

/* =========================================================
   Init Slide UI
   ========================================================= */
slides.forEach((slide, i) => {
  slide.dataset.index = i;

  const footerR = document.createElement('div');
  footerR.className = 'slide-footer-right';
  footerR.textContent = `${i} / ${totalSlides}`;
  slide.appendChild(footerR);

  const footerL = document.createElement('div');
  footerL.className = 'slide-footer-left';
  footerL.textContent = 'University Name';
  slide.appendChild(footerL);
});

/* =========================================================
   Canvas Persistence
   ========================================================= */
function saveCanvasState() {
  slideDrawings[current] = canvas.toDataURL();
}

function loadCanvasState(index) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (slideDrawings[index]) {
    const img = new Image();
    img.onload = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img, 0, 0);
    };
    img.src = slideDrawings[index];
  }
}

function resizeCanvas() {
  const temp = canvas.toDataURL();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0);
  img.src = temp;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* =========================================================
   Slide Logic
   ========================================================= */
function showSlide(index) {
  saveCanvasState();

  slides.forEach((slide, i) => {
    slide.classList.remove('active', 'prev', 'animate');

    slide.querySelectorAll('video').forEach(v => {
      v.pause();
      v.currentTime = 0;
    });

    if (i === index) {
      slide.classList.add('active');
      slide.offsetHeight;
      slide.classList.add('animate');
      slide.querySelector('video')?.play().catch(() => {});
    }

    if (i === index - 1) slide.classList.add('prev');
  });

  // Slide-based parallax
  if (bgLayer && !document.body.classList.contains('overview')) {
    bgLayer.style.transition =
      "background-position 1.2s cubic-bezier(0.22, 1, 0.36, 1)";
    bgLayer.style.backgroundPosition =
      `${index * -40}px ${index * -15}px`;
  }

  current = index;
  loadCanvasState(current);
  updateURL();
}

/* =========================================================
   Drawing Tools
   ========================================================= */
function setTool(newMode) {
  if (mode === newMode && document.body.classList.contains('drawing-mode')) {
    document.body.classList.remove('drawing-mode');
    penBtn.classList.remove('active');
    eraserBtn.classList.remove('active');
  } else {
    document.body.classList.add('drawing-mode');
    mode = newMode;
    penBtn.classList.toggle('active', mode === 'pen');
    eraserBtn.classList.toggle('active', mode === 'eraser');
  }
}

penBtn.onclick = () => setTool('pen');
eraserBtn.onclick = () => setTool('eraser');

canvas.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse') canvas.setPointerCapture(e.pointerId);
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);
  e.preventDefault();
});

canvas.addEventListener('pointermove', e => {
  if (!isDrawing) return;

  const pressure = e.pressure > 0 ? e.pressure * 10 : 3;
  ctx.lineWidth = mode === 'pen' ? pressure : 40;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (mode === 'pen') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#5e81ac';
  } else {
    ctx.globalCompositeOperation = 'destination-out';
  }

  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
  e.preventDefault();
});

canvas.addEventListener('pointerup', e => {
  isDrawing = false;
  ctx.closePath();
  if (e.pointerType !== 'mouse') canvas.releasePointerCapture(e.pointerId);
});

canvas.addEventListener('pointercancel', () => isDrawing = false);

/* =========================================================
   Navigation
   ========================================================= */
function updateURL() {
  const url = new URL(window.location);
  url.searchParams.set('slide', current);
  history.replaceState({}, '', url);
}

function readURL() {
  const s = parseInt(new URL(window.location).searchParams.get('slide'));
  if (!isNaN(s) && s >= 0 && s < slides.length) current = s;
}

function next() {
  showSlide((current + 1) % slides.length);
}

function prev() {
  if (current > 0) showSlide(current - 1);
}

/* =========================================================
   Cursor
   ========================================================= */
document.addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse') {
    lens.style.display = 'block';
    lens.style.left = `${e.clientX}px`;
    lens.style.top = `${e.clientY}px`;
  } else {
    lens.style.display = 'none';
  }
});

/* =========================================================
   Overview Scroll Parallax (RAF)
   ========================================================= */
let scrollY = 0;
let ticking = false;

deck.addEventListener('scroll', () => {
  if (!document.body.classList.contains('overview')) return;

  scrollY = deck.scrollTop;

  if (!ticking) {
    requestAnimationFrame(() => {
      bgLayer.style.backgroundPosition =
        `${-scrollY * 0}px ${-scrollY * 0.3}px`;
      ticking = false;
    });
    ticking = true;
  }
});

/* =========================================================
   Keyboard Bindings (Vim-style)
   ========================================================= */
let keyBuffer = "";
let gPrefix = false;
let clearTimer = null;

function resetVimState() {
  keyBuffer = "";
  gPrefix = false;
  clearTimeout(clearTimer);
}

document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

  const key = e.key.toLowerCase();
  clearTimeout(clearTimer);
  clearTimer = setTimeout(resetVimState, 800);

  if (/[0-9]/.test(key)) {
    keyBuffer += key;
    return;
  }

  if (key === 'g') {
    if (!gPrefix) gPrefix = true;
    else {
      const target = keyBuffer ? parseInt(keyBuffer) : 0;
      showSlide(Math.min(Math.max(target, 0), totalSlides));
      resetVimState();
    }
    return;
  }

  if (gPrefix && key === 'e') {
    showSlide(totalSlides);
    resetVimState();
    return;
  }

  if (['l', 'arrowright', ' '].includes(key)) return next();
  if (['h', 'arrowleft'].includes(key)) return prev();

  if (key === 'c') ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (key === 'p') setTool('pen');
  if (key === 'e') setTool('eraser');
  if (key === 't') document.body.classList.toggle('dark');
  if (key === 'f')
    document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
  if (key === '-') document.body.classList.toggle('overview');
});

/* =========================================================
   UI Buttons
   ========================================================= */
slides.forEach((slide, i) => {
  slide.onclick = () => {
    if (document.body.classList.contains('overview')) {
      document.body.classList.remove('overview');
      showSlide(i);
    }
  };
});

document.getElementById('nav-next').onclick = next;
document.getElementById('nav-prev').onclick = prev;
document.getElementById('theme-toggle').onclick =
  () => document.body.classList.toggle('dark');
document.getElementById('overview-btn').onclick =
  () => document.body.classList.toggle('overview');

/* =========================================================
   Init
   ========================================================= */
readURL();
showSlide(current);
