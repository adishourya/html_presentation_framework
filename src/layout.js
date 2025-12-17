// slides
const slides = Array.from(document.querySelectorAll('.slide'));
const totalSlides = slides.length -1;

// headers and footers
// slide numbering
slides.forEach((slide, i) => {
  slide.dataset.index = i ; // 1-based numbering
  const footer = document.createElement('div');
  footer.className = 'slide-footer-right';
  footer.textContent = `${i} / ${totalSlides}`;
  slide.appendChild(footer);
});

// footer left
slides.forEach((slide, i) => {
  const footer = document.createElement('div');
  footer.className = 'slide-footer-left';
  footer.textContent = "Maastricht University";
  slide.appendChild(footer);
});

// header right
slides.forEach((slide, i) => {
  const footer = document.createElement('div');
  footer.className = 'slide-header-right';
  footer.textContent = "Topic";
  slide.appendChild(footer);
});


let current = 0;

/* --- URL sync --- */
function updateURL() {
  const url = new URL(window.location);
  url.searchParams.set('slide', current);
  history.replaceState({}, '', url);
}

function readURL() {
  const url = new URL(window.location);
  const s = parseInt(url.searchParams.get('slide'));
  if (!isNaN(s) && s >= 0 && s < slides.length) {
    current = s;
  }
}

/* --- Slide handling --- */

function showSlide(index) {
  slides.forEach((s, i) => {
    s.classList.remove('active', 'prev', 'animate');

    // 1. Manage Videos: Pause all videos first
    const videos = s.querySelectorAll('video');
    videos.forEach(v => {
      v.pause();
      v.currentTime = 0; // Optional: Reset to beginning
    });

    if (i === index) {
      s.classList.add('active');
      s.offsetHeight; // force reflow
      s.classList.add('animate');

      // 2. Play only the video in the current active slide
      const activeVideo = s.querySelector('video');
      if (activeVideo) {
        activeVideo.play().catch(e => console.log("Auto-play prevented:", e));
      }
    }

    if (i === index - 1) {
      s.classList.add('prev');
    }

    // ... your existing footer code ...
    const footer = s.querySelector('.slide-footer');
    if (footer) {
      footer.textContent = `${i + 1} / ${slides.length}`;
    }


    
  });

  updateURL();
  
  // 3. Sync the lens clone after videos are handled
  if (typeof syncLens === 'function') {
    syncLens();
  }
}

function next() {
  if (current < slides.length - 1) {
    current++;
    showSlide(current);
  }
  else if (current == slides.length -1){
    current = 0;
    showSlide(current);
  }
}

function prev() {
  if (current > 0) {
    current--;
    showSlide(current);
  }
}


slides.forEach((slide, i) => {
  slide.addEventListener('click', () => {
    if (document.body.classList.contains('overview')) {
      current = i;
      document.body.classList.remove('overview');
      showSlide(current);
    }
  });
});


/* --- Fullscreen --- */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

/* --- Overview mode --- */
function toggleOverview() {
  document.body.classList.toggle('overview');
}


function toggleTheme() {
  document.body.classList.toggle('dark');
}


/* --- Keyboard --- */
/* --- Vim/Helix Bindings --- */
let keyBuffer = "";
let bufferTimeout;

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  const key = e.key;

  // 1. Instant shortcuts
  if (key === 't') toggleTheme();
  if (key === 'f') toggleFullscreen();
  if (key === '-') toggleOverview();
  
  // Navigation
  if (key === 'ArrowRight' || key === ' ' || key === 'l') next();
  if (key === 'ArrowLeft' ||  key === 'h') prev();

  // 2. Buffer logic for sequences
  // We only care about numbers and letters g, e
  if (/[\dge]/.test(key)) {
    keyBuffer += key;
    
    clearTimeout(bufferTimeout);
    bufferTimeout = setTimeout(() => { keyBuffer = ""; }, 1500); // 1.5s window
  }

  // Check for [n]gg (Goto slide n or first slide)
  if (keyBuffer.endsWith('gg')) {
    const match = keyBuffer.match(/(\d+)gg$/);
    if (match) {
      const n = parseInt(match[1]);
      // Helix/Vim users usually expect 1-based jumping (1gg = first slide)
      if (n >= 0 && n < slides.length) current = n; 
      if (n>=slides.length-1) current=slides.length -1;
    } else {
      current = 0; // Plain 'gg'
    }
    showSlide(current);
    keyBuffer = "";
  } 

  // Check for ge (Goto last slide)
  else if (keyBuffer.endsWith('ge')) {
    current = slides.length - 1;
    showSlide(current);
    keyBuffer = "";
  }
});


// cursor 

const lens = document.getElementById('lens');
const lensContent = document.getElementById('lens-content');
const deck = document.getElementById('deck');
const magnification = 1.2; // Change this to 2.0 for bigger zoom

function updateLensContent() {
  lensContent.innerHTML = '';
  
  // Only clone the CURRENT slide for the lens
  const activeSlide = slides[current];
  if (activeSlide) {
    const clone = activeSlide.cloneNode(true);
    lensContent.appendChild(clone);
    
    // Play the video in the clone if it exists
    const clonedVideo = lensContent.querySelector('video');
    if (clonedVideo) {
      clonedVideo.play();
    }
  }
}
document.addEventListener('mousemove', (e) => {
  const x = e.clientX;
  const y = e.clientY;

  // 1. Move the lens
  lens.style.left = `${x}px`;
  lens.style.top = `${y}px`;

  // 2. Align and Zoom the content
  // We offset the content so that the point (x,y) stays in the center of the 150px circle
  const lensCircleRadius = 75; // Half of 150px
  
  const targetX = -((x * magnification) - lensCircleRadius);
  const targetY = -((y * magnification) - lensCircleRadius);

  lensContent.style.transform = `translate(${targetX}px, ${targetY}px) scale(${magnification})`;
});

// Update the lens whenever you change slides
// Call this inside your existing showSlide() function
function syncLens() {
  updateLensContent();
}

// Initial Setup
updateLensContent();

const originalShowSlide = showSlide;
showSlide = function(index) {
  originalShowSlide(index);
  syncLens(); 
};




/* --- Init --- */
readURL();
showSlide(current);
