# A HTML Presentation Framework

A minimal, developer-first presentation framework built with vanilla JavaScript and CSS. It features **Helix-inspired** keybindings, a unique **magnifying lens cursor**, and a "smart" dark mode for technical content.

### [🚀 Try the Demo Slides](https://adishourya.github.io/html_presentation_framework/?slide=0)

---

## ✨ Features

* **Helix/Vim style Bindings:** Navigate and jump to slides using familiar keyboard patterns.
* **Overview Mode:** A grid-based view to see your entire deck at once and jump between topics.
* **Smart Video Inversion:** Automatically inverts videos in Dark Mode to match your theme while maintaining natural color tones.
* **Resource Efficient:** Only the active slide's video plays at any given time to save CPU/GPU memory.
* **Deep Linking:** URL synchronization keeps track of your current slide so you can share specific moments.

---

## ⌨️ Keyboard Shortcuts

This framework uses **Helix/Vim-ish** modal navigation for speed.

### Navigation

| Key | Action |
| --- | --- |
| `l` / `j` / `→` / `↓` | **Next** slide |
| `h` / `k` / `←` / `↑` | **Previous** slide |
| `gg` | Jump to **first** slide |
| `ge` | Jump to **last** slide |
| `[n]gg` | Jump to **slide [n]** (e.g., `5gg` goes to slide 5) |

### Controls

| Key | Action |
| --- | --- |
| `-` | Toggle **Overview Mode** |
| `t` | Toggle **Theme** (Light/Dark) |
| `f` | Toggle **Fullscreen** |

---

## 🛠️ Installation & Customization

1. **Clone the Repo:**
```bash
git clone https://github.com/adishourya/html_presentation_framework.git
```
2. **Edit Content:** Simply add `<section class="slide">` tags inside the `#deck` container in `index.html`.
3. **Theming:** Update your branding colors in the `:root` section of the CSS and headers and footers in `layout.js`


## 🤝 Contributing

Feel free to fork this project!

**Created by [Adi Shourya**](https://github.com/adishourya)**
