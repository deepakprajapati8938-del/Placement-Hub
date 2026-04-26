# upgradeui.md — Aurora Glassmorphism Theme Upgrade Guide
> Modes: Light + Dark
> Style: Aurora + Glassmorphism

---

## Step 1 — Global CSS tokens

Create or update your `globals.css` / `index.css`:

```css
/* ── Dark Mode (default) ── */
:root {
  --bg-base:              #07071a;
  --bg-surface:           rgba(255, 255, 255, 0.05);
  --bg-surface-hover:     rgba(255, 255, 255, 0.08);
  --bg-surface-strong:    rgba(255, 255, 255, 0.12);

  --aurora-purple:        rgba(139, 92, 246, 0.18);
  --aurora-teal:          rgba(45, 212, 191, 0.14);
  --aurora-blue:          rgba(96, 165, 250, 0.12);
  --aurora-pink:          rgba(244, 114, 182, 0.10);

  --glass-border:         rgba(255, 255, 255, 0.10);
  --glass-border-purple:  rgba(139, 92, 246, 0.30);
  --glass-border-teal:    rgba(45, 212, 191, 0.28);
  --glass-border-blue:    rgba(96, 165, 250, 0.25);
  --glass-border-pink:    rgba(244, 114, 182, 0.25);

  --glass-blur:           blur(16px);

  --text-primary:         rgba(255, 255, 255, 0.90);
  --text-secondary:       rgba(255, 255, 255, 0.50);
  --text-muted:           rgba(255, 255, 255, 0.30);

  --accent-purple:        #c4b5fd;
  --accent-teal:          #5eead4;
  --accent-blue:          #93c5fd;
  --accent-pink:          #f9a8d4;
  --accent-purple-strong: #8b5cf6;
  --accent-teal-strong:   #2dd4bf;
  --accent-blue-strong:   #60a5fa;
}

/* ── Light Mode ── */
[data-theme="light"],
.light {
  --bg-base:              #f0f0fa;
  --bg-surface:           rgba(255, 255, 255, 0.55);
  --bg-surface-hover:     rgba(255, 255, 255, 0.70);
  --bg-surface-strong:    rgba(255, 255, 255, 0.85);

  --aurora-purple:        rgba(167, 139, 250, 0.22);
  --aurora-teal:          rgba(94, 234, 212, 0.20);
  --aurora-blue:          rgba(147, 197, 253, 0.18);
  --aurora-pink:          rgba(249, 168, 212, 0.16);

  --glass-border:         rgba(255, 255, 255, 0.85);
  --glass-border-purple:  rgba(139, 92, 246, 0.18);
  --glass-border-teal:    rgba(20, 184, 166, 0.20);
  --glass-border-blue:    rgba(59, 130, 246, 0.18);
  --glass-border-pink:    rgba(236, 72, 153, 0.18);

  --glass-blur:           blur(16px);

  --text-primary:         rgba(30, 20, 60, 0.85);
  --text-secondary:       rgba(30, 20, 60, 0.50);
  --text-muted:           rgba(30, 20, 60, 0.30);

  --accent-purple:        #5b21b6;
  --accent-teal:          #0f766e;
  --accent-blue:          #1d4ed8;
  --accent-pink:          #be185d;
  --accent-purple-strong: #7c3aed;
  --accent-teal-strong:   #0d9488;
  --accent-blue-strong:   #2563eb;
}
```

---

## Step 2 — Aurora background wrapper

```css
.aurora-bg {
  position: relative;
  background: var(--bg-base);
  overflow: hidden;
  min-height: 100vh;
}

/* Orb 1 — purple, top left */
.aurora-bg::before {
  content: "";
  position: absolute;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: var(--aurora-purple);
  top: -150px; left: -100px;
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}

/* Orb 2 — teal, bottom right */
.aurora-bg::after {
  content: "";
  position: absolute;
  width: 420px; height: 420px;
  border-radius: 50%;
  background: var(--aurora-teal);
  bottom: -100px; right: -80px;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

/* Orb 3 — blue, center (add via extra div) */
.aurora-orb-blue {
  position: absolute;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: var(--aurora-blue);
  top: 40%; left: 42%;
  filter: blur(70px);
  pointer-events: none;
  z-index: 0;
}

/* Orb 4 — pink, top right (optional) */
.aurora-orb-pink {
  position: absolute;
  width: 220px; height: 220px;
  border-radius: 50%;
  background: var(--aurora-pink);
  top: 8%; right: 12%;
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

/* All direct children sit above orbs */
.aurora-bg > * {
  position: relative;
  z-index: 1;
}
```

HTML structure:
```html
<div class="aurora-bg">
  <div class="aurora-orb-blue"></div>
  <div class="aurora-orb-pink"></div>
  <!-- your content here -->
</div>
```

---

## Step 3 — Glass card component

```css
.glass-card {
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 1.25rem;
  color: var(--text-primary);
}

/* Colored variants */
.glass-card--purple {
  border-color: var(--glass-border-purple);
  box-shadow: inset 0 0 24px rgba(139, 92, 246, 0.05);
}

.glass-card--teal {
  border-color: var(--glass-border-teal);
  box-shadow: inset 0 0 24px rgba(45, 212, 191, 0.05);
}

.glass-card--blue {
  border-color: var(--glass-border-blue);
  box-shadow: inset 0 0 24px rgba(96, 165, 250, 0.05);
}

.glass-card--pink {
  border-color: var(--glass-border-pink);
  box-shadow: inset 0 0 24px rgba(244, 114, 182, 0.05);
}

/* Hover state */
.glass-card:hover {
  background: var(--bg-surface-hover);
  transition: background 0.2s ease;
}
```

---

## Step 4 — Glass navbar

```css
.glass-nav {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}
```

---

## Step 5 — Buttons

```css
/* Primary */
.btn-aurora {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--glass-border-purple);
  background: rgba(139, 92, 246, 0.20);
  color: var(--accent-purple);
  transition: background 0.2s ease, transform 0.1s ease;
}

.btn-aurora:hover  { background: rgba(139, 92, 246, 0.30); }
.btn-aurora:active { transform: scale(0.98); }

/* Ghost */
.btn-aurora-ghost {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-aurora-ghost:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}
```

---

## Step 6 — Pills and badges

```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.pill--purple { background: rgba(139, 92, 246, 0.12); border: 1px solid var(--glass-border-purple); color: var(--accent-purple); }
.pill--teal   { background: rgba(45, 212, 191, 0.10); border: 1px solid var(--glass-border-teal);   color: var(--accent-teal);   }
.pill--blue   { background: rgba(96, 165, 250, 0.10); border: 1px solid var(--glass-border-blue);   color: var(--accent-blue);   }
.pill--pink   { background: rgba(244,114,182, 0.10);  border: 1px solid var(--glass-border-pink);   color: var(--accent-pink);   }

/* Live dot */
.dot-live {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent-teal-strong);
  animation: pulse-dot 1.8s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1;    }
  50%       { opacity: 0.35; }
}
```

---

## Step 7 — Progress bars

```css
.progress-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.light .progress-track {
  background: rgba(30, 20, 60, 0.08);
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.progress-fill--purple { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
.progress-fill--teal   { background: linear-gradient(90deg, #0d9488, #5eead4); }
.progress-fill--blue   { background: linear-gradient(90deg, #2563eb, #93c5fd); }
.progress-fill--pink   { background: linear-gradient(90deg, #be185d, #f9a8d4); }
```

---

## Step 8 — Avatar circles

```css
.avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  flex-shrink: 0;
}

.avatar--purple { background: rgba(139, 92, 246, 0.18); border: 1px solid var(--glass-border-purple); color: var(--accent-purple); }
.avatar--teal   { background: rgba(45, 212, 191, 0.15); border: 1px solid var(--glass-border-teal);   color: var(--accent-teal);   }
.avatar--blue   { background: rgba(96, 165, 250, 0.15); border: 1px solid var(--glass-border-blue);   color: var(--accent-blue);   }
```

---

## Step 9 — Inputs

```css
.glass-input {
  width: 100%;
  padding: 0.6rem 0.9rem;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  color: var(--text-primary);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.glass-input::placeholder { color: var(--text-muted); }

.glass-input:focus {
  border-color: var(--glass-border-purple);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
}
```

---

## Step 10 — Dividers

```css
.glass-divider {
  height: 1px;
  background: var(--glass-border);
  margin: 0.75rem 0;
  border: none;
}
```

---

## Step 11 — Toggle light / dark mode

### React
```jsx
// ThemeToggle.jsx
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('light', !dark)
  }, [dark])

  return (
    <button className="btn-aurora-ghost" onClick={() => setDark(!dark)}>
      {dark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
```

### Vanilla JS
```js
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('light')
})
```

---

## Step 12 — Tailwind config (if using Tailwind)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aurora: {
          purple: 'rgba(139, 92, 246, <alpha-value>)',
          teal:   'rgba(45, 212, 191, <alpha-value>)',
          blue:   'rgba(96, 165, 250, <alpha-value>)',
          pink:   'rgba(244, 114, 182, <alpha-value>)',
        }
      },
      backdropBlur: {
        glass: '16px',
      },
      backgroundColor: {
        'glass':       'rgba(255, 255, 255, 0.05)',
        'glass-light': 'rgba(255, 255, 255, 0.55)',
      }
    }
  }
}
```

---

## Quick reference — color palette

| Name          | Dark accent | Light accent |
|---------------|-------------|--------------|
| Purple        | `#c4b5fd`   | `#5b21b6`    |
| Teal          | `#5eead4`   | `#0f766e`    |
| Blue          | `#93c5fd`   | `#1d4ed8`    |
| Pink          | `#f9a8d4`   | `#be185d`    |
| Purple strong | `#8b5cf6`   | `#7c3aed`    |
| Teal strong   | `#2dd4bf`   | `#0d9488`    |
| Blue strong   | `#60a5fa`   | `#2563eb`    |

---

## Important notes

- `backdrop-filter: blur()` requires the parent to **not** have `overflow: hidden` or it won't render in some browsers. Apply overflow on a wrapper one level above.
- On Safari, always include `-webkit-backdrop-filter` alongside `backdrop-filter`.
- Keep aurora orb `filter: blur()` values large (60px–90px). Smaller values look like stains, not atmosphere.
- Use `#07071a` for dark base, not pure `#000000` — pure black kills the aurora glow effect.
- Glass cards need a semi-transparent background to reveal the aurora beneath. Never use fully opaque background on `.glass-card`.