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
const slideDrawings = {}; // Stores drawing data URLs per slide index

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
   Canvas Drawing Persistence Logic
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
  // Save before resize because resizing clears canvas
  const tempState = canvas.toDataURL();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0);
  img.src = tempState;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* =========================================================
   Slide Logic
   ========================================================= */
function showSlide(index) {
  // Save current slide's drawing before moving to the next
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
      const video = slide.querySelector('video');
      if (video) video.play().catch(() => {});
    }
    if (i === index - 1) slide.classList.add('prev');
  });

  if (bgLayer && !document.body.classList.contains('overview')) {
    bgLayer.style.transition = "background-position 1.2s cubic-bezier(0.22, 1, 0.36, 1)";
    bgLayer.style.backgroundPosition = `${index * -40}px ${index * -15}px`;
  }
  
  current = index;
  // Load the drawing for the new slide
  loadCanvasState(current);
  updateURL();
}

/* =========================================================
   Drawing Tools UI & Logic
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

penBtn.addEventListener('click', () => setTool('pen'));
eraserBtn.addEventListener('click', () => setTool('eraser'));

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  ctx.lineWidth = mode === 'pen' ? 3 : 30;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (mode === 'pen') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#5e81ac'; // Your Blue Pen
  } else {
    ctx.globalCompositeOperation = 'destination-out';
  }
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => { isDrawing = false; ctx.closePath(); });
canvas.addEventListener('mouseout', () => { isDrawing = false; });

/* =========================================================
   Navigation & Events
   ========================================================= */
function updateURL() {
  const url = new URL(window.location);
  url.searchParams.set('slide', current);
  history.replaceState({}, '', url);
}

function readURL() {
  const url = new URL(window.location);
  const s = parseInt(url.searchParams.get('slide'));
  if (!isNaN(s) && s >= 0 && s < slides.length) current = s;
}

function next() {
  const nextIdx = (current + 1) % slides.length;
  showSlide(nextIdx);
}

function prev() {
  if (current > 0) {
    showSlide(current - 1);
  }
}

document.addEventListener('mousemove', e => {
  lens.style.left = `${e.clientX}px`;
  lens.style.top = `${e.clientY}px`;
});

// Figure Numbering Helper
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.slide img').forEach(img => {
    if (img.dataset.dummy) {
      const text = encodeURIComponent(img.dataset.dummy);
      const size = img.dataset.size || "800x500";
      img.src = `https://dummyimage.com/${size}/4c566a/eceff4&text=${text}`;
    }
    const figure = document.createElement('figure');
    const caption = document.createElement('figcaption');
    caption.textContent = img.alt || "Untitled Figure";
    img.parentNode.insertBefore(figure, img);
    figure.appendChild(img);
    figure.appendChild(caption);
  });
});

/* =========================================================
   Keyboard Bindings (Vim-style)
   ========================================================= */
let keyBuffer = ""; 
let gPrefix = false;
let clearBufferTimer = null;

function resetVimState() {
  keyBuffer = "";
  gPrefix = false;
  clearTimeout(clearBufferTimer);
}

document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
  
  const key = e.key.toLowerCase();
  clearTimeout(clearBufferTimer);
  clearBufferTimer = setTimeout(resetVimState, 800);

  if (/[0-9]/.test(key)) {
    keyBuffer += key;
    return;
  }

  if (['l', 'arrowright', ' '].includes(key)) { next(); resetVimState(); return; }
  if (['h', 'arrowleft'].includes(key)) { prev(); resetVimState(); return; }
  if (key === 'c') { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
  if (key == "p") {setTool('pen');}
  if (key == "e") {setTool('eraser');}

  if (key === 'g') {
    if (!gPrefix) { gPrefix = true; } 
    else {
      const target = keyBuffer !== "" ? parseInt(keyBuffer) : 0;
      showSlide(Math.min(Math.max(target, 0), totalSlides));
      resetVimState();
    }
    return;
  }

  if (key === 't') document.body.classList.toggle('dark');
  if (key === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  if (key === '-') document.body.classList.toggle('overview');
});

/* =========================================================
   UI Button Listeners
   ========================================================= */
slides.forEach((slide, i) => {
  slide.addEventListener('click', () => {
    if (document.body.classList.contains('overview')) {
      document.body.classList.remove('overview');
      showSlide(i);
    }
  });
});

document.getElementById('nav-next').onclick = next;
document.getElementById('nav-prev').onclick = prev;
document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('dark');
document.getElementById('overview-btn').onclick = () => document.body.classList.toggle('overview');

// Init
readURL();
showSlide(current);
