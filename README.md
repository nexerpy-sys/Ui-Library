# Atelier Kinetik — AI-First Design & Motion Registry

A zero-dependency, copy-paste-ready library of production-grade design systems,
typography scales, color palettes, UI micro-interactions and 60fps canvas effects —
engineered to be read by **both** humans in a browser and autonomous AI agents/LLMs
over a single Vercel URL.

**Live showcase:** `/index.html` — an interactive single-page playground ("a pantheon
of eight autonomous cursor agents drafts this page") with a live hero canvas, the Live
Forge, the agent Pantheon, the copy-ready Registry, and the Motion Law easing studio.
On mobile, tap the hamburger (top-right) for the fullscreen kinetic index menu.

## What's inside (v1.6.0)

| Asset | Where | Contents |
| --- | --- | --- |
| LLM context index | `llms.txt` | Orientation for AI context windows — endpoints, conventions, anti-slop checklist |
| Machine manifest | `registry.json` | 60 Google Fonts + css2 URLs · 24 pairings · 3 fluid `clamp()` scales (computed) · 6 WCAG-2.1-audited light/dark token systems · 50–950 hue-locked scales (measured contrast) · 12 named motion laws + springs · **24** micro-interaction snippets (code inline) · 8 templates · 16 FX entries |
| 60fps canvas FX | `registry/fx/01..16-*.html` | Self-contained, DPR-capped, adaptive-quality, reduced-motion-safe hero backgrounds — **zero dependencies** |
| Section templates | `registry/templates/01..08-*.html` | 8 drop-in, standalone sections (hero, bento, pricing, feature split, stats, testimonials, CTA, FAQ) — Kinetik tokens inline, Google Fonts only |
| Interactive showcase | `index.html` | The human playground; embeds the same spec served at `/llms.txt` |

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

- Grow FX to a full WebGL/three.js tier (heavy bundles permitted — deps are welcome).
- Expand pairings to 60 and systems to 12 with full 50–950 coverage per system hue.
- Ship the WebGL/three.js FX tier (heavy bundles permitted) and a GSAP motion-pack track.
- Split `index.html`'s remaining inline payload (base64 artwork → CDN).
- Replace CDN Tailwind with build-time atomic output.
