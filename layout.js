const slides = Array.from(document.querySelectorAll('.slide'));
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
    s.classList.remove('active', 'prev');
    if (i === index) s.classList.add('active');
    if (i === index - 1) s.classList.add('prev');
  });
  updateURL();
}

function next() {
  if (current < slides.length - 1) {
    current++;
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

/* --- Keyboard --- */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') next();
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'f') toggleFullscreen();
  if (e.key === '-') toggleOverview();
  if (e.key === 'Escape') toggleOverview();
});

/* --- Init --- */
readURL();
showSlide(current);
