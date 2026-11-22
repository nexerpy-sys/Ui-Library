# Atelier Kinetik — AI-First Design & Motion Registry

A zero-dependency, copy-paste-ready library of production-grade design systems,
typography scales, color palettes, UI micro-interactions and 60fps canvas effects —
engineered to be read by **both** humans in a browser and autonomous AI agents/LLMs
over a single Vercel URL.

**Live showcase:** `/index.html` — an interactive single-page playground ("a pantheon
of eight autonomous cursor agents drafts this page") with a live hero canvas, the Live
Forge, the agent Pantheon, the copy-ready Registry, the Registry Explorer, and the
Motion Law easing studio. On mobile, tap the hamburger (top-right) for the fullscreen
kinetic index menu. Assets are split out under `/assets/` — the HTML shell is ~39 KB.

## What's inside (v1.8.0)

| Asset | Where | Contents |
| --- | --- | --- |
| LLM context index | `llms.txt` | Orientation for AI context windows — endpoints, conventions, anti-slop checklist |
| Machine manifest | `registry.json` | 60 Google Fonts + css2 URLs · 24 pairings · 3 fluid `clamp()` scales (computed) · 6 WCAG-2.1-audited light/dark token systems · 50–950 hue-locked scales (measured contrast) · 12 named motion laws + springs · **24** micro-interaction snippets (code inline) · 8 templates · 16 canvas FX · **12 computational motion graphics** (code inline in the manifest; files under `/registry/motion-graphics/`) |
| 60fps canvas FX | `registry/fx/01..16-*.html` | Self-contained, DPR-capped, adaptive-quality, reduced-motion-safe hero backgrounds — **zero dependencies** |
| Section templates | `registry/templates/01..08-*.html` | 8 drop-in, standalone sections (hero, bento, pricing, feature split, stats, testimonials, CTA, FAQ) — Kinetik tokens inline, Google Fonts only |
| Motion graphics | `registry/motion-graphics/01..12-*.html` | 12 flagship computational UI motion graphics — analytical springs, Verlet integration, simplex noise, `getImageData` particle sampling, SVG feGaussianBlur/feColorMatrix metaballs, arc-length path subdivision, raw **WebGL2** refraction (Canvas2D fallback). DPR ≤ 2, 60fps, `prefers-reduced-motion` safe, theme-injectable (`postMessage {type:'ak-theme'}` or `?theme=paper`) |
| Interactive showcase | `index.html` + `assets/` | The human playground; embeds the same spec served at `/llms.txt`. **Registry Explorer** (04): tabbed live gallery — templates, canvas FX, **a live motion-graphics lab** (real in-iframe frame-pacing telemetry — FPS/ms/dropped frames plus a 150-frame frame-time sparkline on a 16.7 ms budget line, spring-driven stage transitions via a semi-implicit Euler integrator, auto-cruise, full keyboard control, inactive iframes/GL contexts destroyed on tab switch), micro-interactions with one-click copy, and a 6-system theme switcher, all rendered from `/registry.json` |
| Static assets | `assets/obsidian-monolith.jpg`, `assets/app.css`, `assets/app.js` | Brand artwork + showcase styles/scripts, extracted from the former 1.29 MB single-file HTML (now ~39 KB shell) |

### Numbers that were measured, not asserted
- All six semantic systems score **AAA on ink/bg** and ≥ AA on muted-ink/accent pairs (see `registry.json → color.systems[].audit`).
- `clamp()` type-scale output is computed from the 375→1440px viewport range (no breakpoints).
- All twelve easings use spec-valid bezier control points (x ∈ [0,1]).

## Using it

- **Humans:** open the site, inspect sections, one-click copy tokens/snippets.
- **AI agents:** fetch `/llms.txt` first, then pull only what you need from `/registry.json`. Every snippet in `snippets{}` is copy-paste ready; every FX in `/registry/fx/` is a standalone file you can iframe, inline, or lift into a build.
- **Everything is static files.** No build step for the library itself.

## Local preview

```bash
python3 -m http.server 8080 --bind 0.0.0.0
# open http://localhost:8080/
```

## Deploy (Vercel)

Static output — point Vercel at the repo root, no build command, output dir `.`
(`index.html` at root). Tailwind is loaded via CDN in v1. `/llms.txt`, `/registry.json`,
`/index.html` and `/registry/fx/*` are served as-is; `registry.json` is
`application/json` by default on Vercel.

## Roadmap

- Extend the WebGL tier (liquid-glass + holographic foil ship as motion graphics; a full three.js/GSAP track is the next mile).
- Expand pairings to 60 and systems to 12 with full 50–950 coverage per system hue.
- Replace CDN Tailwind with build-time atomic output.
