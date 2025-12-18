const slides = Array.from(document.querySelectorAll('.slide'));
const totalSlides = slides.length - 1;
const bgLayer = document.getElementById('bg-layer');
const lens = document.getElementById('lens');
const deck = document.getElementById('deck');

let current = 0;

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
  footerL.textContent = 'Maastricht University';
  slide.appendChild(footerL);

  const headerR = document.createElement('div');
  headerR.className = 'slide-header-right';
  headerR.textContent = 'Topic';
  slide.appendChild(headerR);
});

/* =========================================================
   Slide Logic
   ========================================================= */
function showSlide(index) {
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
  updateURL();
}

// =========================================================
// Figure Numberings
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll('.slide img');

  images.forEach(img => {
    // 1. Handle Dummy Image Generation
    if (img.dataset.dummy) {
      const text = encodeURIComponent(img.dataset.dummy);
      const size = img.dataset.size || "800x500"; // Default size
      img.src = `https://dummyimage.com/${size}/4c566a/eceff4&text=${text}`;
    }

    // 2. Wrap in Figure & Add Numbered Caption (Scientific Style)
    const figure = document.createElement('figure');
    const caption = document.createElement('figcaption');
    caption.textContent = img.alt || "Untitled Figure";

    // Place the figure where the image was, then move image into it
    img.parentNode.insertBefore(figure, img);
    figure.appendChild(img);
    figure.appendChild(caption);
  });
});


/* =========================================================
   Parallax Overview Effect
   ========================================================= */
deck.addEventListener('scroll', () => {
  if (document.body.classList.contains('overview')) {
    bgLayer.style.transition = "none";
    const bgY = deck.scrollTop * 0.2;
    bgLayer.style.backgroundPosition = `0px -${bgY}px`;
  }
});

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
  current = (current + 1) % slides.length;
  showSlide(current);
}

function prev() {
  if (current > 0) {
    current--;
    showSlide(current);
  }
}

document.addEventListener('mousemove', e => {
  lens.style.left = `${e.clientX}px`;
  lens.style.top = `${e.clientY}px`;
});

// keybindings

let keyBuffer = ""; 
let gPrefix = false; // Dedicated flag for the 'g' command
let clearBufferTimer = null;

document.addEventListener('keydown', e => {
  // Ignore if typing in an input
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

  const key = e.key;

  // Clear existing timeout whenever a key is pressed
  clearTimeout(clearBufferTimer);
  
  // Set a 800ms timeout to clear everything if user hesitates
  clearBufferTimer = setTimeout(() => {
    keyBuffer = "";
    gPrefix = false;
  }, 800);

  // 1. Handle Numbers (Buffer)
  if (/[0-9]/.test(key)) {
    keyBuffer += key;
    return;
  }

  // 2. Navigation: Next (l, j, ArrowRight, ArrowDown, Space)
  if (['l', 'j', 'ArrowRight', 'ArrowDown', ' '].includes(key)) {
    next();
    resetVimState();
    return;
  }

  // 3. Navigation: Previous (h, k, ArrowLeft, ArrowUp)
  if (['h', 'k', 'ArrowLeft', 'ArrowUp'].includes(key)) {
    prev();
    resetVimState();
    return;
  }

  // 4. Vim Jump Logic
  if (key === 'g') {
    if (!gPrefix) {
      // First 'g' detected
      gPrefix = true;
    } else {
      // Second 'g' detected -> Execute gg or [n]gg
      if (keyBuffer !== "") {
        const target = parseInt(keyBuffer);
        // Clamp between 0 and totalSlides
        current = Math.min(Math.max(target, 0), totalSlides);
        showSlide(current);
      } else {
        current = 0; // Pure gg
        showSlide(current);
      }
      resetVimState();
    }
    return;
  }

  if (key === 'e' && gPrefix) {
    // ge command
    current = totalSlides;
    showSlide(current);
    resetVimState();
    return;
  }

  // 5. Controls
  if (key === 't') {
    document.body.classList.toggle('dark');
    resetVimState();
  } 
  else if (key === 'f') {
    document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
    resetVimState();
  } 
  else if (key === '-') {
    document.body.classList.toggle('overview');
    if (bgLayer) bgLayer.style.transition = "background-position 0.5s ease";
    resetVimState();
  } else {
    // If any other key is pressed, reset the Vim buffer
    resetVimState();
  }
});

// Helper to keep code clean
function resetVimState() {
  keyBuffer = "";
  gPrefix = false;
  clearTimeout(clearBufferTimer);
}




// overview click to goto slide
slides.forEach((slide, i) => {
  slide.addEventListener('click', () => {
    if (document.body.classList.contains('overview')) {
      current = i;
      document.body.classList.remove('overview');
      showSlide(current);
    }
  });
});

// init keep this at the end
readURL();
showSlide(current);
