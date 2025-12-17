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

    if (i === index) {
      s.classList.add('active');
      s.offsetHeight; // force reflow
      s.classList.add('animate');
    }

    if (i === index - 1) {
      s.classList.add('prev');
    }

    const footer = s.querySelector('.slide-footer');
    if (footer) {
      footer.textContent = `${i + 1} / ${slides.length}`;
    }
  });

  updateURL();
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
document.addEventListener('keydown', e => {
  if (e.key === 't') toggleTheme(); // toggle theme
  if (e.key === 'ArrowRight' ||e.key=="ArrowDown" || e.key == "l" || e.key === 'j') next();
  if (e.key === 'ArrowLeft' || e.key=="ArrowUp" || e.key == "h" || e.key == "k") prev();
  if (e.key === 'f') toggleFullscreen();
  if (e.key === '-') toggleOverview();
});

/* --- Init --- */
readURL();
showSlide(current);
