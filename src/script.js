const slides = Array.from(document.querySelectorAll('.slide'));
const totalSlides = slides.length - 1;

const bgLayer = document.getElementById('bg-layer');
const lens = document.getElementById('lens');

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
      slide.offsetHeight; // reflow
      slide.classList.add('animate');

      const video = slide.querySelector('video');
      if (video) video.play().catch(() => {});
    }

    if (i === index - 1) slide.classList.add('prev');
  });

  if (bgLayer) {
    bgLayer.style.backgroundPosition = `${index * -40}px ${index * -15}px`;
  }

  updateURL();
}





/* =========================================================
   Navigation Helpers
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

/* =========================================================
   Events
   ========================================================= */
document.addEventListener('mousemove', e => {
  lens.style.left = `${e.clientX}px`;
  lens.style.top = `${e.clientY}px`;
});

document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

  if (e.key === 't') document.body.classList.toggle('dark');
  if (e.key === 'f')
    document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();

  if (e.key === '-') document.body.classList.toggle('overview');
  if (e.key === 'l' || e.key === 'ArrowRight' || e.key === ' ') next();
  if (e.key === 'h' || e.key === 'ArrowLeft') prev();

  if (e.key === 'g') {
    if (this.lastG && Date.now() - this.lastG < 300) {
      current = 0;
      showSlide(current);
    }
    this.lastG = Date.now();
  }
});

/* Overview click */
slides.forEach((slide, i) => {
  slide.addEventListener('click', () => {
    if (document.body.classList.contains('overview')) {
      current = i;
      document.body.classList.remove('overview');
      showSlide(current);
    }
  });
});


/* =========================================================
   Start
   ========================================================= */
readURL();
showSlide(current);
