
Below is a **very minimal, beginner-friendly presentation framework**.

You will have **three files**:

* `index.html` → **you only write content here**
* `layout.css` → all styling (cards, shadows, layouts)
* `layout.js` → slide navigation + layout switching

No build step. No tooling. Just open `index.html` in a browser.

---

## 1️⃣ `index.html` (your content only)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Minimal Slides</title>

  <!-- Pico.css for sane defaults -->
  <link rel="stylesheet" href="https://unpkg.com/@picocss/pico@latest/css/pico.min.css">
  <link rel="stylesheet" href="layout.css" />
</head>
<body>

<main id="deck">

  <!-- Fullscreen / Title slide -->
  <section class="slide center">
    <h1>My Presentation</h1>
    <p>A minimal card-based framework</p>
  </section>

  <!-- Two column layout -->
  <section class="slide two-col">
    <div>
      <h2>Left Column</h2>
      <ul>
        <li>Point one</li>
        <li>Point two</li>
        <li>Point three</li>
      </ul>
    </div>
    <div>
      <h2>Right Column</h2>
      <p>
        This is a simple two-column layout.
      </p>
    </div>
  </section>

  <!-- Centered / Keynote-style -->
  <section class="slide keynote">
    <h2>Big Idea</h2>
    <p>Centered, calm, and focused.</p>
  </section>

</main>

<script src="layout.js"></script>
</body>
</html>
```

---

## 2️⃣ `layout.css` (cards + layouts)

```css
/* --- Global --- */
body {
  background: #f4f4f5;
  margin: 0;
  overflow: hidden;
}

#deck {
  height: 100vh;
  width: 100vw;
  position: relative;
}

/* --- Slide Card --- */
.slide {
  position: absolute;
  inset: 5vh 5vw;
  padding: 3rem;

  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);

  opacity: 0;
  transform: translateX(40px);
  transition: all 0.4s ease;
}

.slide.active {
  opacity: 1;
  transform: translateX(0);
  z-index: 2;
}

.slide.prev {
  opacity: 0;
  transform: translateX(-40px);
}

/* --- Layouts --- */
.slide.center,
.slide.keynote {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.slide.keynote h2 {
  font-size: 3rem;
}

.slide.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

/* --- Overview Mode --- */
body.overview {
  overflow: auto;
}

body.overview .slide {
  position: static;
  opacity: 1;
  transform: none;
  width: 45vw;
  height: 45vh;
  margin: 2vh auto;
}
```

---

## 3️⃣ `layout.js` (slide navigation)

```javascript
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
});

/* --- Init --- */
readURL();
showSlide(current);
```

---

## ✨ How you use it

* Add a new slide → add a new `<section class="slide ...">`
* Choose a layout by class:

  * `center`
  * `two-col`
  * `keynote`
* Navigate with **← → or Space**

---

## 🧠 Why this fits your goals

* **Card-based** (rounded corners + shadows)
* **Minimal CSS** (Pico.css handles ugly defaults)
* **No JS complexity** (≈ 30 lines)
* **Keynote-like layouts** without magic

If you want next:

* slide transitions
* speaker notes
* code blocks
* dark mode
* PDF export

Tell me which direction you want to evolve this 🚀
