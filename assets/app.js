(function () {
      "use strict";

      /* ==============================================================
         1. SHARED SINGLE-rAF TICKER & ADAPTIVE QUALITY ENGINE
         ============================================================== */
      const subs = new Set();
      let raf = 0;
      let lastT = 0;
      let ema = 16.7;
      let slowFrames = 0;
      const isLowMem = typeof navigator !== "undefined" && navigator.deviceMemory && navigator.deviceMemory <= 2;
      const isSmallTouch = window.innerWidth < 768 && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

      const ticker = {
        quality: isLowMem ? 0 : isSmallTouch ? 1 : 2,
        fps: 60,
        onQuality: new Set(),
        add(fn) {
          subs.add(fn);
          if (!raf && !document.hidden) raf = requestAnimationFrame(loop);
          return () => subs.delete(fn);
        },
      };

      function loop(now) {
        raf = requestAnimationFrame(loop);
        const raw = lastT ? now - lastT : 16.7;
        lastT = now;
        if (raw > 0 && raw < 200) {
          ema += (raw - ema) * 0.06;
          ticker.fps = Math.min(120, Math.round(1000 / ema));
          slowFrames = ema > 26 ? slowFrames + 1 : Math.max(0, slowFrames - 2);
          if (slowFrames > 75 && ticker.quality > 0) {
            ticker.quality -= 1;
            slowFrames = 0;
            ema = 16.7;
            ticker.onQuality.forEach((fn) => fn(ticker.quality));
          }
        }
        const dt = Math.min(Math.max(raw, 1), 34);
        subs.forEach((fn) => fn(dt, now));
      }

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else if (!raf && subs.size) {
          lastT = 0;
          raf = requestAnimationFrame(loop);
        }
      });

      /* ==============================================================
         2. TOAST & CLIPBOARD UTILITY (SANDBOX SAFE)
         ============================================================== */
      const toastEl = document.getElementById("ak-toast");
      let toastTimer = 0;
      function showToast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2000);
      }

      function copyText(text, label) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            () => showToast(`${label} copied`),
            () => fallbackCopy(text, label)
          );
        } else {
          fallbackCopy(text, label);
        }
      }

      function fallbackCopy(text, label) {
        try {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
          showToast(`${label} copied`);
        } catch (_) {
          showToast("Copy unavailable");
        }
      }

      const LLMS_SPEC = `# ATELIER KINETIK — AI-READABLE PRODUCTION DESIGN & MOTION REGISTRY
> Release: 1.6.0 · 2026-11-22 · 60 fonts · 24 pairings · 6 audited token systems · 3 fluid scales · 12 motion laws · 24 micro-interactions · 8 templates · 16 canvas FX
> Purpose: structured, copy-paste-ready design tokens, fluid type, semantic color, motion and 60fps canvas FX for ChatGPT, Claude, Gemini, Manus, Kimi, Qwen, DeepSeek, Emergent — and human engineers.
> Rule: fetch /llms.txt once, then pull ONLY what you need from /registry.json. Do not scrape /index.html for tokens — it is the showcase, not the contract.

## Endpoints
- /index.html    : Interactive human playground (Live Forge, Pantheon, Registry, Explorer, Motion Law). Humans first; agents read this for feel, not data.
- /llms.txt      : This file. Orientation for LLM context windows.
- /registry.json : Machine-readable manifest — every asset, measured audits, snippet code inline. Prefer this for programmatic use.
- /registry/fx/*.html : 16 standalone zero-dependency canvas hero backgrounds (01..16). Iframe, inline, or lift canvas+script.
- /registry/templates/*.html : 8 standalone, drop-in section templates (hero, bento, pricing, feature split, stats bar, testimonials, CTA band, FAQ). Google Fonts only, no JS frameworks.

## Token conventions
--bg · --surface · --elevated · --ink · --muted-ink · --hairline · --hairline-strong · --accent · --accent-hover · --on-accent
Hairlines: rgba inks at 0.10 (default) / 0.22–0.26 (strong) — never solid gray.
Elevation ladder for obsidian-type systems: #070709 → #0D0D12 → #12121A.
All FX & snippets respect prefers-reduced-motion. Keep that path when you copy.

## Typography Foundry (60 Google Fonts, OFL)
Editorial serifs (Fraunces, Instrument Serif, Playfair Display, Bodoni Moda, Italiana, Cinzel, Prata, Marcellus, Tenor Sans, Cormorant Garamond, EB Garamond, Newsreader, Lora, Spectral, Source Serif 4, Alegreya) ·
Poster & display (Syne, Unbounded, Michroma, Anton, Bebas Neue, Six Caps, Abril Fatface, Archivo Black, Alfa Slab One, Ultra, Marcellus SC, Cormorant SC) ·
Grotesk & technical (Inter, Hanken Grotesk, Space Grotesk, Manrope, Archivo, Libre Franklin, Work Sans, IBM Plex Sans, Public Sans, Barlow, Barlow Condensed, Oswald, Chakra Petch, Saira, Saira Condensed, Heebo, Rubik, Outfit, Albert Sans, Sofia Sans) ·
Mono (JetBrains Mono, IBM Plex Mono, Space Mono, Fira Code, Roboto Mono, Red Hat Mono, Spline Sans Mono, DM Mono, Overpass Mono, Anonymous Pro, Cutive Mono, Intel One Mono).
Each entry in registry.json carries css2 URL, weight axes, and best-for notes.

## Fluid clamp() type scale (no breakpoints)
Range 375px → 1440px. Formula: preferred = MIN + (MAX-MIN)*(100vw-375px)/1065, emitted as clamp().
Scales: Kinetik Perfect Fourth (ratio 1.333, display-first) · Editorial Minor Third (1.2, long-form) · Modest Major Third (1.25, product UI).
Steps xs..display with computed minRem/maxRem/css strings live in registry.json → typography.typeScale.scales.
Headline guidance: Kinetik hero uses clamp(2.05rem, 8.4vw, 7.6rem) at line-height 0.93, Syne 800, letter-spacing -0.035em, uppercase.

## 24 studio pairings (display + serif accent + body + mono)
Kinetik Obsidian (flagship) · Mercury Editor · Didone Noir · Brutalist Wire · Roman Archive · Orbital Technical ·
Highway Signage · Slab Press · Ultra Heritage · Didone Gala · Gothic Factory · Heraldic Press · Cormorant Chapter ·
Italienne Vitr · Prata Facet · Newsroom Classic · Georgic Humanist · Tech Brief · Swiss Grid · Falcon Sport ·
Haifa Hardware · Soft Circuit · Helio Paper · Kaiju Deck.
Each pairing ships exact tracking, line-height, and mono-label rules (registry.json → typography.pairings).

## Semantic color systems (measured, WCAG 2.1)
Obsidian (dark, brand, flame #FF3D00) · Paper (light warm, ember #C93300) · Aegean (dark abyssal, cyan #00F0FF) ·
Parchment (light ivory, burnt sienna #A6460E) · Ledger (light cool, deep Aegean #0F4C64) · Meridian (dark umber, gold #E5A93C).
Every system carries ink/bg, muted/bg, accent/bg, onAccent/accent ratios — all computed, all ≥ AA for their intended use (ink/bg is AAA in all six).
50–950 hue-locked HSL ramps for flame, aegean, gold are in registry.json → color.scales (contrast on near-black/near-white per step + recommended text token).
Surface treatments: film grain (SVG feTurbulence @ .045), glass + gradient hairline, ambient mesh radials, obsidian elevation ladder.

## Motion Law — 12 named easings (cubic-bezier)
Kinetic snap (0.16,1,0.3,1) entrances · Celestial drift (0.33,1,0.68,1) text reveals · Velocity whip (0.22,1,0.36,1) magnetic/drawers ·
Obsidian settle (0.5,1,0.89,1) dark surfaces · Editorial ease (0.25,1,0.5,1) cross-fades · Chronos cortege (0.76,0,0.24,1) media handoffs ·
Daedalus rule (0.65,0,0.35,1) hairline exits · Hephaestus overshoot (0.34,1.56,0.64,1) controls · Meridian glide (0.2,0.8,0.2,1) nav chrome ·
Glacier drift (0.4,0,0.2,1) ambient loops · Nova burst (0.34,1.3,0.64,1) micro-feedback · Umbra sink (0.55,0,1,0.45) exits.
Springs (for JS): magnetic 260/16 · drape 180/26 · drawer-eject 320/22. Rule: nothing linear unless it is literally linear vs linear.

## 24 production micro-interactions (registry.json → snippets)
magnetic-button · spotlight-card · masked-rise-headline · stateful-button · smooth-drawer · marquee-zero-cls ·
reveal-on-scroll · tilt-card-3d · conic-border-spin · grain-overlay · glass-hairline-panel · accordion-spring ·
link-underline-sweep · dropdown-spring · tooltip-nudge · toast-action · count-up · typewriter-caret ·
gradient-text-pan · shimmer-load · shake-x · float-soft · ink-ripple · tab-glide.
Each is self-contained (CSS+JS inline), reduced-motion safe, zero layout shift.

## 8 section templates (/registry/templates/, registry.json → templates)
01 hero-masked-rise · 02 bento-grid · 03 pricing-tiers · 04 feature-split · 05 stats-bar · 06 testimonial-grid · 07 cta-band · 08 faq-accordion.
Each is a complete standalone document — fetch it, keep the Kinetik token set (--bg #070709, --ink #F4F2EC, --flame #FF3D00, hairlines at rgba 0.10/0.24), drop into your page.
Templates are patterns, not prisons: retoken accents, keep the pairing discipline.

## 16 hero & ambient 60fps canvas FX (/registry/fx/, vanilla canvas-2d, adaptive quality, DPR-capped)
01 Cosmic Starfield · 02 Mouse-Masked Dot Matrix · 03 Descending Light Beams · 04 3D Dotted Globe · 05 Armillary Sphere ·
06 Nebula Embers · 07 Aurora Ribbons · 08 Horizon Grid · 09 Constellation Cursor · 10 Sine Flow Field · 11 Lattice Bloom ·
12 Orbital Rings · 13 Ink Ripple · 14 Glyph Cascade · 15 Mesh Gradient Drift · 16 Sonar Sweep.
All adaptive (auto-degrade past ~21ms/frame), all DPR≤2, all reduced-motion safe. Dependencies: NONE.
External deps ARE permitted in your own builds (three.js, GSAP) — the FX themselves stay dependency-free so they paste anywhere.

## Anti-slop checklist for agents generating UI
1. Never ship default Tailwind blue/purple — pick Obsidian/Paper/Aegean, or build a ramp from registry.json → color.scales.
2. Fluid clamp() for type, never fixed breakpoint font-sizes (use typography.typeScale output).
3. One Kinetic-snap entrance per view, max; everything else Celestial-drift or static.
4. Hairlines at rgba 10%/24%, never #333. Grain over gradients. Ink #F4F2EC on #070709 is AAA — don't improvise contrast.
5. Pair display+serif+body+mono from the 24 pairings; do not mix more than one display face per view.
6. Ship prefers-reduced-motion fallbacks and keyboard access — the registry's own FX/snippets demonstrate the pattern.
7. CLS = 0: transforms and opacity only for motion; reserve space for media.

## Licensing
Code: MIT. Fonts: SIL OFL via Google Fonts (attribution per font). Kinetik name/mark: reserved, cite as "Atelier Kinetik registry".`;

      /* ==============================================================
         3. POPULATE DYNAMIC DOM BEFORE SWARM SCANS
         ============================================================== */
      const AGENTS = [
        { roman: "I", name: "Prometheus", color: "#FF3D00", epithet: "Fire-bringer", role: "Architect of structure", likes: ["box"], ease: [0.16, 1, 0.3, 1], craft: "Frames every surface with a crosshair and snaps it to the grid.", sigil: "M1 2 H9 L5 9 Z", sigilDot: [4.5, 3.5, 1, 2] },
        { roman: "II", name: "Athena", color: "#F4F2EC", epithet: "Kerning oracle", role: "Typographer", likes: ["text", "rise"], ease: [0.33, 1, 0.68, 1], craft: "Sets each line of type along a caret, one measure at a time.", sigil: "M1 1 V9 M9 1 V9 M5 3 L7 5 L5 7 L3 5 Z" },
        { roman: "III", name: "Daedalus", color: "#B89B6A", epithet: "Labyrinth maker", role: "Vector & hairline master", likes: ["line"], ease: [0.65, 0, 0.35, 1], craft: "Rules the hairlines and dividers with a single pen stroke.", sigil: "M1 9 V1 H9 M4 9 V4 H9 M1 6 H4" },
        { roman: "IV", name: "Hermes", color: "#B4B9C4", epithet: "Velocity courier", role: "Carrier of easing", likes: ["box", "text"], ease: [0.22, 1, 0.36, 1], craft: "Takes whatever is next in the queue and gets there first.", sigil: "M1 9 L4 6 M6 4 L9 1 M5 1 H9" },
        { roman: "V", name: "Chronos", color: "#7D8590", epithet: "Frame keeper", role: "Sequencer of time", likes: ["fade", "rise"], ease: [0.76, 0, 0.24, 1], craft: "Places media and holds the baseline until the headline rises.", sigil: "M2 1 H8 L2 9 H8 Z" },
        { roman: "VI", name: "Iris", color: "#CFCBC2", epithet: "Token messenger", role: "Colour systems", likes: ["fade", "box"], ease: [0.25, 1, 0.5, 1], craft: "Carries semantic colour between light and dark surfaces.", sigil: "M2 1 V9 M2 5 L9 2 M2 5 L9 8" },
        { roman: "VII", name: "Nyx", color: "#6A6E7A", epithet: "Night keeper", role: "Dark surfaces", likes: ["box"], ease: [0.5, 1, 0.89, 1], craft: "Lays down obsidian panels and their quiet borders.", sigil: "M1 5 H9", sigilEclipse: true },
        { roman: "VIII", name: "Hephaestus", color: "#9E7B4F", epithet: "Forge master", role: "Component smith", likes: ["line", "box"], ease: [0.34, 1.56, 0.64, 1], craft: "Hammers buttons, pills and controls into shape.", sigil: "M1 5 V2 H9 V5 M3 8 V5 H7 V8 M1 8 H9" },
      ];
      const VERBS = { box: "FRAME", text: "KERN", line: "RULE", rise: "DRAFT", fade: "PLACE", select: "EXCISE" };
      const ARROW_D = "M2 2 L20 16 L11 17 L6 25 Z M6.5 8.5 L11.5 13 L9.5 15 L7 12.5 Z";
      const curveD = ([a, b, c, d]) => `M0 100 C${a * 100} ${100 - b * 100} ${c * 100} ${100 - d * 100} 100 0`;

      // Editorial Marquee
      const MARQUEE_WORDS = ["Atelier Kinetik", "60 typefaces", "24 micro-interactions", "Zero layout shift", "The agents never rest"];
      const logoSvg = `<svg viewBox="0 0 32 32" class="h-8 w-8 text-[var(--flame)] sm:h-12 sm:w-12 shrink-0" aria-hidden="true"><circle cx="16" cy="16" r="10.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="54 12" transform="rotate(-38 16 16)"/><path d="M16 1.5v7M16 23.5v7M1.5 16h7M23.5 16h7" stroke="currentColor" stroke-width="1.6"/><path d="M10.5 21.5 22 10l-4.2 8.6Z" fill="#FF3D00"/></svg>`;
      const marqueeRow = MARQUEE_WORDS.map((w, i) =>
        `<span class="flex items-center gap-10 pr-10"><span class="${i % 2 ? "f-serif italic text-[var(--ink)]" : "f-display font-extrabold uppercase text-transparent [-webkit-text-stroke:1px_rgba(244,242,236,.45)]"}">${w}</span>${logoSvg}</span>`
      ).join("");
      document.getElementById("marquee-track").innerHTML = marqueeRow + marqueeRow;

      // Pantheon 7 remaining agents + Rule of the house
      const pantheonGrid = document.getElementById("pantheon-grid");
      AGENTS.slice(1).forEach((ag) => {
        const el = document.createElement("article");
        el.setAttribute("data-build", "box");
        el.className = "cell spot agent-card group relative flex min-h-[248px] flex-col justify-between p-6";
        el.style.setProperty("--tint", ag.color);
        const sigilSvg = ag.sigilEclipse
          ? `<circle cx="5" cy="5" r="3.5" fill="none" stroke="#9A9DA6" stroke-width="1"/><path d="M1.5 5 A3.5 3.5 0 0 0 8.5 5 Z" fill="#6A6E7A"/><path d="M1 5 H9" stroke="#F4F2EC" stroke-width="1"/>`
          : `<path d="${ag.sigil}" fill="none" stroke="${ag.color}" stroke-width="1.15" stroke-linecap="square" stroke-linejoin="miter"/>`;
        el.innerHTML = `
          <div class="flex items-start justify-between">
            <span data-build="text" class="f-mono flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              <svg viewBox="0 0 10 10" class="h-3 w-3 shrink-0" aria-hidden="true">${sigilSvg}</svg>
              ${ag.roman} · ${ag.epithet}
            </span>
            <svg viewBox="0 0 28 28" class="agent-cursor-svg h-7 w-7" aria-hidden="true">
              <path d="${ARROW_D}" fill="#121317" fill-rule="evenodd" stroke="#F4F2EC" stroke-width="1.2" stroke-linejoin="miter" />
              <path d="M13.5 19.5 L17 23" stroke="${ag.color}" stroke-width="1.4" />
            </svg>
          </div>
          <div>
            <h3 data-build="text" class="f-display text-2xl font-bold text-[var(--ink)] sm:text-3xl">${ag.name}</h3>
            <p data-build="text" class="mt-2 text-sm leading-relaxed text-[var(--muted)]">${ag.craft}</p>
            <div class="mt-5 flex items-end justify-between">
              <span data-build="text" class="f-mono text-[10px] uppercase tracking-[0.16em]" style="color:${ag.color}">${ag.role}</span>
              <div data-build="fade">
                <svg viewBox="-4 -40 108 150" class="h-12 w-14 overflow-visible" aria-hidden="true">
                  <path d="M0 100H100M0 100V0" stroke="rgba(244,242,236,.14)" fill="none" />
                  <path class="agent-curve-path" d="${curveD(ag.ease)}" fill="none" stroke="${ag.color}" stroke-width="2.2" stroke-linecap="square" />
                </svg>
              </div>
            </div>
          </div>`;
        pantheonGrid.appendChild(el);
      });
      const houseRule = document.createElement("article");
      houseRule.setAttribute("data-build", "box");
      houseRule.className = "cell flex min-h-[248px] flex-col justify-between p-6";
      houseRule.innerHTML = `
        <span data-build="text" class="f-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Rule of the house</span>
        <p data-build="text" class="f-serif text-3xl italic leading-tight text-[var(--ink)]">No agent draws a straight line to anything.</p>`;
      pantheonGrid.appendChild(houseRule);

      // Registry Color Swatches
      const SYSTEMS = [
        ["Obsidian", ["#070709", "#12121A", "#8E8D8A", "#F4F2EC", "#FF3D00"]],
        ["Paper", ["#F4F2EC", "#ECE9E0", "#85847F", "#0E0E10", "#FF3D00"]],
        ["Aegean", ["#06121A", "#0D2430", "#6FA3B8", "#E6F7FF", "#00F0FF"]],
      ];
      const swatchRoot = document.getElementById("swatch-systems");
      SYSTEMS.forEach(([name, hexes]) => {
        const row = document.createElement("div");
        row.setAttribute("data-build", "fade");
        row.className = "flex h-9 overflow-hidden rounded-md border border-[var(--line)]";
        hexes.forEach((h) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.title = `${name} ${h}`;
          btn.setAttribute("aria-label", `Copy ${h}`);
          btn.className = "swatch h-full flex-1";
          btn.style.background = h;
          btn.addEventListener("click", () => copyText(h, h));
          row.appendChild(btn);
        });
        swatchRoot.appendChild(row);
      });

      // Motion Law Curve Cards
      const CURVES = [
        { name: "Kinetic snap", by: "Prometheus", ease: [0.16, 1, 0.3, 1], use: "Structural entrances, modals, masked headlines", color: "#FF3D00" },
        { name: "Celestial drift", by: "Athena", ease: [0.33, 1, 0.68, 1], use: "Text reveals and editorial opacity ramps", color: "#00F0FF" },
        { name: "Velocity whip", by: "Hermes", ease: [0.22, 1, 0.36, 1], use: "Magnetic cursors and fast drawer ejects", color: "#10B981" },
      ];
      const curvesGrid = document.getElementById("curves-grid");
      const racePairs = [];
      CURVES.forEach((c) => {
        const css = `cubic-bezier(${c.ease.join(", ")})`;
        const card = document.createElement("article");
        card.setAttribute("data-build", "box");
        card.className = "cell spot flex flex-col gap-7 p-7";
        card.style.setProperty("--tint", c.color);
        card.innerHTML = `
          <div class="flex items-start justify-between">
            <div>
              <span data-build="text" class="f-mono text-[10px] uppercase tracking-[0.2em]" style="color:${c.color}">${c.by}</span>
              <h3 data-build="text" class="f-display mt-2 text-2xl font-bold text-[var(--ink)]">${c.name}</h3>
            </div>
            <svg data-build="fade" viewBox="-6 -30 112 140" class="h-24 w-24 overflow-visible" aria-hidden="true">
              <path d="M0 100H100M0 100V0" stroke="rgba(244,242,236,.16)" fill="none" />
              <path d="M0 100L100 0" stroke="rgba(244,242,236,.16)" stroke-dasharray="3 4" fill="none" />
              <path d="${curveD(c.ease)}" fill="none" stroke="${c.color}" stroke-width="2.6" stroke-linecap="round" />
            </svg>
          </div>
          <div data-build="fade" class="space-y-2.5">
            <div class="h-1.5 overflow-hidden rounded bg-[var(--line)]"><div class="race-bar h-full rounded" style="background:${c.color}"></div></div>
            <div class="h-1.5 overflow-hidden rounded bg-[var(--line)]"><div class="race-bar h-full rounded bg-[var(--muted)]"></div></div>
            <p class="f-mono flex justify-between pt-0.5 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]"><span>${c.name}</span><span>vs linear</span></p>
          </div>
          <p data-build="text" class="text-sm leading-relaxed text-[var(--muted)]">${c.use}</p>
          <button type="button" data-build="box" class="chip f-mono mt-auto break-all rounded-full px-4 py-3 text-left text-[10px] sm:break-normal sm:text-[11px]">${css}</button>`;
        const bars = card.querySelectorAll(".race-bar");
        racePairs.push({ curved: bars[0], linear: bars[1], css });
        card.querySelector("button").addEventListener("click", () => copyText(css, c.name));
        curvesGrid.appendChild(card);
      });

      function triggerRace() {
        racePairs.forEach(({ curved, linear, css }) => {
          curved.getAnimations().forEach((a) => a.cancel());
          linear.getAnimations().forEach((a) => a.cancel());
          curved.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1400, easing: css, fill: "forwards" });
          linear.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1400, easing: "linear", fill: "forwards" });
        });
      }
      document.getElementById("race-all-btn").addEventListener("click", triggerRace);
      setInterval(() => {
        if (!document.hidden) triggerRace();
      }, 2800);
      setTimeout(triggerRace, 800);

      // Live Forge 3 Looping Plates
      const BARS = [34, 62, 48, 88, 56, 72, 40, 94, 66, 52, 80, 44, 70, 58, 86, 38, 64, 50];
      const FORGE_NAMES = ["Orbital player", "Pricing oracle", "Type specimen"];
      const FORGE_TEMPLATES = [
        () => `
          <div data-build="box" class="stage-card w-full rounded-2xl p-6">
            <p data-build="text" class="f-mono text-[10px] uppercase tracking-[0.2em] text-[var(--flame)]">Now sequencing</p>
            <p data-build="text" class="f-display mt-2 text-2xl font-bold text-[var(--ink)]">Orbital Player</p>
            <div data-build="fade" class="mt-6 flex h-20 items-end gap-[5px]">
              ${BARS.map((h, i) => `<span class="wave-bar flex-1 rounded-sm bg-[var(--ink)]" style="height:${h}%;animation-delay:${(i * -0.13).toFixed(2)}s"></span>`).join("")}
            </div>
            <div data-build="line" class="mt-6 h-[3px] w-full rounded bg-[var(--line-strong)]"><div class="h-full w-2/5 rounded bg-[var(--flame)]"></div></div>
            <div class="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
              <span data-build="box" class="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-full bg-[var(--ink)] text-[var(--bg)]"><svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg></span>
              <span data-build="box" class="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-full border border-[var(--line-strong)] text-[var(--ink)]"><svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></span>
              <span data-build="box" class="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-full border border-[var(--line-strong)] text-[var(--ink)]"><svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg></span>
              <span data-build="text" class="f-mono ml-auto text-[11px] text-[var(--muted)]">01:42 / 04:14</span>
            </div>
          </div>`,
        () => `
          <div data-build="box" class="stage-card w-full rounded-2xl p-6">
            <div class="flex items-center justify-between">
              <p data-build="text" class="f-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">Tier · Olympian</p>
              <span data-build="box" class="f-mono rounded-full bg-[var(--gold)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--bg)]">Most chosen</span>
            </div>
            <p data-build="text" class="f-display mt-5 text-6xl font-extrabold text-[var(--ink)]">$48<span class="f-serif text-2xl font-normal italic text-[var(--muted)]"> / seat</span></p>
            <div data-build="line" class="my-6 h-px w-full bg-[var(--line-strong)]"></div>
            <p data-build="text" class="mb-3 flex items-center gap-3 text-sm text-[var(--ink)]"><span class="h-1.5 w-1.5 rounded-full bg-[var(--flame)]"></span>All 150 registry entries</p>
            <p data-build="text" class="mb-3 flex items-center gap-3 text-sm text-[var(--ink)]"><span class="h-1.5 w-1.5 rounded-full bg-[var(--flame)]"></span>Master AI prompt export</p>
            <p data-build="text" class="mb-3 flex items-center gap-3 text-sm text-[var(--ink)]"><span class="h-1.5 w-1.5 rounded-full bg-[var(--flame)]"></span>Bezier &amp; spring studio</p>
            <span data-build="box" class="mt-4 block rounded-full bg-[var(--flame)] py-3.5 text-center text-sm font-semibold text-white">Claim the tier</span>
          </div>`,
        () => `
          <div data-build="box" class="stage-card w-full rounded-2xl p-6">
            <div class="flex items-end justify-between">
              <p data-build="text" class="f-serif text-[5.2rem] italic leading-[0.8] text-[var(--ink)] sm:text-[7rem]">Ag</p>
              <p data-build="text" class="f-mono pb-2 text-right text-[10px] uppercase leading-relaxed tracking-[0.18em] text-[var(--muted)]">Instrument Serif<br />Italic · 400</p>
            </div>
            <div data-build="line" class="my-6 h-px w-full bg-[var(--line-strong)]"></div>
            <div class="mb-4"><p data-build="text" class="f-mono flex flex-wrap justify-between gap-1 text-[10px] text-[var(--muted)] sm:text-[11px]"><span class="text-[var(--ink)]">Display</span>clamp(2.9rem, 8vw, 7rem)</p><div data-build="line" class="mt-2 h-1 w-full rounded bg-[var(--cyan)]"></div></div>
            <div class="mb-4"><p data-build="text" class="f-mono flex flex-wrap justify-between gap-1 text-[10px] text-[var(--muted)] sm:text-[11px]"><span class="text-[var(--ink)]">Heading</span>clamp(1.9rem, 4vw, 3.2rem)</p><div data-build="line" class="mt-2 h-1 w-3/4 rounded bg-[var(--cyan)]"></div></div>
            <div><p data-build="text" class="f-mono flex flex-wrap justify-between gap-1 text-[10px] text-[var(--muted)] sm:text-[11px]"><span class="text-[var(--ink)]">Body</span>clamp(1rem, 1.1vw, 1.125rem)</p><div data-build="line" class="mt-2 h-1 w-1/2 rounded bg-[var(--cyan)]"></div></div>
          </div>`,
      ];

      const forgeZoneEl = document.getElementById("forge-loop-zone");
      const stageCycleEl = document.getElementById("stage-cycle");
      const stageStateEl = document.getElementById("stage-state");
      let forgeCycle = 0;
      forgeZoneEl.innerHTML = FORGE_TEMPLATES[0]();

      /* ==============================================================
         4. MECHANICAL EPIGRAPHY — 6-PASS BRUTALIST SWARM ENGINE
            (70% Historical Precision Instruments / 30% Brutalist Optics)
         ============================================================== */
      const TAU = Math.PI * 2;
      const TRAIL_MAX = 18;
      const PART_MAX = 20;
      const INK = "#F4F2EC";
      const VERMILION = "#FF3D00";
      const KNOCKOUT = "#070709";
      const IRON = "#121317";
      const STEEL = "#9A9DA6";
      const ASH = "#5C5F68";
      const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
      const rand = (a, b) => a + Math.random() * (b - a);
      const minJerk = (t) => t * t * t * (10 + t * (6 * t - 15));
      const expoOut = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
      const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const SHAPES = { box: "cross", fade: "cross", select: "select", text: "ibeam", line: "pen", rise: "pen" };
      const HOTSPOT = { arrow: [2, 2], cross: [16, 16], ibeam: [16, 16], pen: [2, 2], select: [16, 16] };

      // Pre-compiled Path2D precision instrument geometry (32x32 viewBox)
      const TOOL_PATHS = {
        arrowBody: new Path2D("M2 2 L20 16 L11 17 L6 25 Z M6.5 8.5 L11.5 13 L9.5 15 L7 12.5 Z"),
        arrowTail: new Path2D("M13.5 19.5 L17 23"),
        crossHair: new Path2D("M16 3 V13 M16 19 V29 M3 16 H13 M19 16 H29"),
        crossStadia: new Path2D("M15 9 H17 M15 23 H17 M9 15 V17 M23 15 V17"),
        crossJawNW: new Path2D("M7 11 V7 H11"),
        crossJawNE: new Path2D("M21 7 H25 V11"),
        crossJawSE: new Path2D("M25 21 V25 H21"),
        crossJawSW: new Path2D("M11 25 H7 V21"),
        ibeamStem: new Path2D("M16 5 V27 M13 16 H19"),
        ibeamSerif: new Path2D("M11 4 H21 M13 4 L16 7 L19 4 M11 28 H21 M13 28 L16 25 L19 28"),
        ibeamCore: new Path2D("M16 9 V23"),
        penBody: new Path2D("M2 2 L15 7 L20 14 L14 20 L7 15 Z M11.5 9.5 L13.5 11.5 L11.5 13.5 L9.5 11.5 Z"),
        penFissure: new Path2D("M2 2 L10 10"),
        penCollar: new Path2D("M21 15 L25 19 L19 25 L15 21 Z"),
        selectQuoins: new Path2D("M4 4 H13 V6 H6 V13 H4 Z M28 28 H19 V26 H26 V19 H28 Z"),
        selectCrops: new Path2D("M21 5 H27 V11 M5 21 V27 H11"),
        selectShears: new Path2D("M12 12 L14.5 14.5 M17.5 17.5 L20 20 M20 12 L17.5 14.5 M14.5 17.5 L12 20"),
      };

      // Pre-compile 10x10 Mason's Mark sigil Path2D per agent
      AGENTS.forEach((ag) => {
        ag.sigilPath = new Path2D(ag.sigil);
      });

      class Swarm {
        constructor() {
          this.started = false;
          this.agents = [];
          this.zones = new Map();
          this.queue = [];
          this.flashes = [];
          this.detents = [];
          this.genesis = null;
          // Flat pre-allocated particle pool: [x, y, vx, vy, age, life, isEmber] * PART_MAX
          this.pBuf = new Float32Array(PART_MAX * 7);
          this.pCount = 0;
          this.clock = 0;
          this.gate = 420;
          this.sy = 0;
          this.pointer = { x: -999, y: -999, last: -1e9 };
          this.monoW = 5.8;
        }

        start() {
          if (this.started) return;
          this.started = true;
          if (!document.documentElement.classList.contains("ak-armed")) return;

          const c = (this.canvas = document.createElement("canvas"));
          c.setAttribute("aria-hidden", "true");
          c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:70;pointer-events:none";
          document.body.appendChild(c);
          this.ctx = c.getContext("2d");
          this.resize();
          this.ctx.font = '600 9.5px "JetBrains Mono", ui-monospace, monospace';
          this.monoW = this.ctx.measureText("M").width || 5.8;

          // Mobile uses 5 core agents (I, II, III, IV, VIII); desktop uses all 8
          const pool = window.innerWidth < 768 ? [0, 1, 2, 3, 7] : [0, 1, 2, 3, 4, 5, 6, 7];
          const cx = this.W / 2;
          const cy = window.scrollY + this.H * 0.42;
          pool.forEach((agentIdx, idx) => {
            const def = AGENTS[agentIdx];
            const ang = (idx / pool.length) * TAU;
            this.agents.push({
              def, i: idx, x: cx, y: cy, vx: Math.cos(ang) * 860, vy: Math.sin(ang) * 860,
              hx: 0.1 + ((idx * 0.618034) % 1) * 0.8, hy: 0.14 + ((idx * 0.381966 + 0.2) % 1) * 0.7,
              ph: rand(0, TAU), f1: rand(0.6, 1.35), f2: rand(0.6, 1.35), orbit: ang, dir: idx % 2 ? 1 : -1,
              state: "idle", task: null, shape: "arrow", verb: "", side: idx % 2 ? 1 : -1, rest: 0,
              flipX: false, flipY: false,
              // Pre-allocated ring buffer: [x, y, timestamp] * TRAIL_MAX
              tBuf: new Float32Array(TRAIL_MAX * 3),
              tHead: 0, tLen: 0, lastTx: cx, lastTy: cy,
            });
          });
          this.genesis = { x: cx, y: cy, t: 0, dur: 1200 };

          this.io = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
              const z = this.zones.get(e.target);
              if (z) z.visible = e.isIntersecting;
            }),
            { rootMargin: "0px 0px -8% 0px" }
          );
          document.querySelectorAll("[data-build-zone]").forEach((el) => this.register(el));

          window.addEventListener("resize", () => this.resize(), { passive: true });
          const onPtr = (e) => {
            this.pointer.x = e.clientX;
            this.pointer.y = e.clientY;
            this.pointer.last = this.clock;
          };
          window.addEventListener("pointermove", onPtr, { passive: true });
          window.addEventListener("pointerdown", onPtr, { passive: true });
          ticker.onQuality.add(() => this.resize());
          ticker.add(this.frame);
        }

        resize() {
          if (!this.canvas) return;
          const q = ticker.quality;
          const dpr = Math.min(window.devicePixelRatio || 1, q === 2 ? 2 : q === 1 ? 1.5 : 1);
          this.W = window.innerWidth;
          this.H = window.innerHeight;
          this.dpr = dpr;
          this.canvas.width = Math.round(this.W * dpr);
          this.canvas.height = Math.round(this.H * dpr);
        }

        register(el) {
          const z = {
            el, tasks: [], left: 0, active: false, built: false, visible: false, dissolving: false,
            loop: el.dataset.buildZone === "loop", hold: 3800, startedAt: 0, builtAt: 0, budget: 0,
          };
          this.zones.set(el, z);
          this.scan(z);
          this.io.observe(el);
          return z;
        }

        scan(z) {
          const els = Array.from(z.el.querySelectorAll("[data-build]")).filter((e) => e.closest("[data-build-zone]") === z.el);
          const map = new Map();
          z.tasks = els.map((el) => {
            const t = { el, zone: z, type: el.dataset.build || "box", done: false, claimed: false, dep: null };
            map.set(el, t);
            return t;
          });
          z.tasks.forEach((t) => {
            const p = t.el.parentElement && t.el.parentElement.closest("[data-build]");
            t.dep = (p && map.get(p)) || null;
          });
          z.left = z.tasks.length;
          z.budget = 4200 + z.tasks.length * 360;
        }

        setState(z, state) {
          z.el.dispatchEvent(new CustomEvent("ak:state", { detail: state }));
        }

        activate(z) {
          z.active = true;
          z.startedAt = this.clock;
          this.setState(z, "building");
          z.tasks.forEach((t) => {
            if (t.done) return;
            if (t.el.getBoundingClientRect().bottom < -120) this.finish(t, null);
            else this.queue.push(t);
          });
        }

        release(z) {
          this.queue = this.queue.filter((t) => t.zone !== z);
          this.agents.forEach((a) => {
            if (a.task && a.task.zone === z) {
              a.task = null; a.state = "idle"; a.shape = "arrow"; a.verb = "";
            }
          });
        }

        flush(z) {
          const open = z.tasks.filter((t) => !t.done);
          this.release(z);
          open.forEach((t) => this.finish(t, null));
        }

        unbuild(z) {
          this.release(z);
          z.tasks.forEach((t) => {
            t.el.getAnimations().forEach((an) => an.cancel());
            t.el.removeAttribute("data-built");
            t.el.style.clipPath = "";
            t.el.style.opacity = "";
          });
          z.active = z.built = z.dissolving = false;
        }

        rescan(el) {
          if (!this.canvas) return;
          const z = this.zones.get(el);
          if (!z) return this.register(el);
          this.release(z);
          z.active = z.built = z.dissolving = false;
          this.scan(z);
        }

        replay() {
          if (!this.canvas) return;
          this.zones.forEach((z) => {
            this.unbuild(z);
            this.scan(z);
          });
          const cx = this.W / 2;
          const cy = window.scrollY + this.H * 0.42;
          this.agents.forEach((a, i) => {
            const ang = (i / this.agents.length) * TAU;
            a.x = cx; a.y = cy; a.vx = Math.cos(ang) * 860; a.vy = Math.sin(ang) * 860;
            a.tLen = 0; a.lastTx = cx; a.lastTy = cy;
          });
          this.genesis = { x: cx, y: cy, t: 0, dur: 1200 };
          this.gate = this.clock + 450;
        }

        summon(clientX, clientY) {
          if (!this.canvas) return;
          const x = clientX;
          const y = clientY + this.sy;
          let best = null, bd = Infinity;
          this.agents.forEach((a) => {
            if (a.state !== "idle") return;
            const d = Math.hypot(a.x - x, a.y - y);
            if (d < bd) { bd = d; best = a; }
          });
          this.detents.push({ x, y, t: 0, dur: 260, vermilion: true });
          if (!best) return;
          best.state = "travel";
          best.verb = "LOCK";
          this.route(best, x, y);
        }

        pick(a) {
          const q = this.queue;
          let first = null, seen = 0;
          for (let i = 0; i < q.length && seen < 5; i++) {
            const t = q[i];
            if (t.claimed || (t.dep && !t.dep.done)) continue;
            seen++;
            if (!first) first = t;
            if (a.def.likes.indexOf(t.type) !== -1) return t;
          }
          return first;
        }

        claim(a, t) {
          t.claimed = true;
          const r = t.el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) return this.finish(t, null);
          t.x = r.left; t.y = r.top + this.sy; t.w = r.width; t.h = r.height; t.u = 0;
          t.vert = t.type === "line" && t.h > t.w * 3;
          let sx = t.x, sy = t.y;
          if (t.type === "text") {
            const cs = getComputedStyle(t.el);
            const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3;
            t.lines = Math.max(1, Math.round(t.h / lh));
            t.lh = t.h / t.lines;
            sy = t.y + t.lh / 2;
          } else if (t.type === "line" && !t.vert) sy = t.y + t.h / 2;
          else if (t.type === "line") sx = t.x + t.w / 2;
          else if (t.type === "rise") sy = t.y + t.h;
          a.task = t;
          a.state = "travel";
          a.shape = SHAPES[t.type] || "cross";
          a.verb = VERBS[t.type] || "";
          this.route(a, sx, sy);
        }

        route(a, x, y) {
          const dx = x - a.x, dy = y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          a.side = -a.side;
          const bow = clamp(d * 0.18, 0, 115) * a.side;
          a.p = {
            x0: a.x, y0: a.y,
            x1: a.x + a.vx * 0.09 + dx * 0.22, y1: a.y + a.vy * 0.09 + dy * 0.22,
            x2: x - dx * 0.28 - (dy / d) * bow, y2: y - dy * 0.28 + (dx / d) * bow,
            x3: x, y3: y, t: 0, dur: 150 + 110 * Math.log2(1 + d / 50),
          };
        }

        beginWork(a) {
          const t = a.task;
          const diag = Math.hypot(t.w, t.h);
          a.wt = 0;
          a.wdur =
            t.type === "text" ? clamp(t.lines * (135 + t.w * 0.35), 210, 1200)
            : t.type === "line" ? 180 + clamp(Math.max(t.w, t.h) * 0.22, 0, 360)
            : t.type === "rise" ? 250 + t.w * 0.12
            : t.type === "select" ? 560
            : t.type === "fade" ? 260 + clamp(diag * 0.28, 0, 340)
            : 200 + clamp(diag * 0.35, 0, 440);
          a.state = "work";
          if (t.type === "box" || t.type === "text" || t.type === "line") {
            t.el.style.clipPath = "inset(0 100% 100% 0)";
            t.el.style.opacity = "1";
          }
        }

        work(a, t, u) {
          t.u = u;
          const s = t.el.style;
          if (t.type === "text") {
            const f = Math.min(u * t.lines, t.lines - 1e-4);
            const i = Math.floor(f), p = f - i;
            const x = p * t.w, y0 = i * t.lh, y1 = y0 + t.lh;
            a.x = t.x + x; a.y = t.y + y0 + t.lh / 2;
            s.clipPath = `polygon(0 0,${t.w + 4}px 0,${t.w + 4}px ${y0}px,${x}px ${y0}px,${x}px ${y1}px,0 ${y1}px)`;
          } else if (t.type === "line") {
            const e = inOut(u);
            if (t.vert) { a.x = t.x + t.w / 2; a.y = t.y + t.h * e; s.clipPath = `inset(0 0 ${(1 - e) * 100}% 0)`; }
            else { a.x = t.x + t.w * e; a.y = t.y + t.h / 2; s.clipPath = `inset(0 ${(1 - e) * 100}% 0 0)`; }
          } else if (t.type === "rise") {
            a.x = t.x + t.w * inOut(u); a.y = t.y + t.h;
          } else {
            const e = inOut(u);
            a.x = t.x + t.w * e; a.y = t.y + t.h * e;
            if (t.type === "box") s.clipPath = `inset(0 ${(1 - e) * 100}% ${(1 - e) * 100}% 0)`;
          }
        }

        finish(t, a) {
          if (t.done) return;
          t.done = true;
          const z = t.zone;
          const qi = this.queue.indexOf(t);
          if (qi !== -1) this.queue.splice(qi, 1);
          if (t.type === "select") {
            if (a) this.flashes.push({ x: t.x, y: t.y, w: t.w, h: t.h, t: 0, dur: 400 });
            return this.dissolve(z);
          }
          const el = t.el;
          el.setAttribute("data-built", "");
          el.style.clipPath = "";
          el.style.opacity = "";
          if (t.type === "fade" && a) {
            el.animate([{ opacity: 0, transform: "scale(.975)" }, { opacity: 1, transform: "none" }], { duration: 820, easing: "cubic-bezier(.16,1,.3,1)" });
          }
          el.querySelectorAll(".ak-count").forEach((cEl) => animateCounter(cEl));
          if (a) {
            // 4-Corner Bracket Lock-On Flash (all tiers)
            this.flashes.push({ x: t.x, y: t.y, w: t.w, h: t.h, t: 0, dur: 400 });
            if (ticker.quality === 2) {
              this.detents.push({ x: a.x, y: a.y, t: 0, dur: 200, vermilion: a.def.roman === "I" });
              if (t.type === "box" || t.type === "rise") this.emitMotes(a.x, a.y, a.def.roman === "I" ? 4 : 3);
            }
          }
          z.left--;
          if (z.left <= 0 && !z.built) {
            z.built = true; z.active = false; z.builtAt = this.clock;
            this.setState(z, "built");
          }
        }

        dissolve(z) {
          const n = z.tasks.length;
          z.tasks.forEach((t, i) =>
            t.el.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(10px)" }], {
              duration: 360, delay: (n - 1 - i) * 20, easing: "cubic-bezier(.7,0,.84,0)", fill: "forwards",
            })
          );
          setTimeout(() => {
            if (!this.zones.has(z.el)) return;
            this.unbuild(z);
            this.scan(z);
            this.setState(z, "dissolved");
          }, 400 + n * 20);
        }

        emitMotes(x, y, count) {
          for (let i = 0; i < count && this.pCount < PART_MAX; i++) {
            const base = this.pCount * 7;
            const ang = rand(0, TAU), sp = rand(22, 54);
            this.pBuf[base] = x;
            this.pBuf[base + 1] = y;
            this.pBuf[base + 2] = Math.cos(ang) * sp;
            this.pBuf[base + 3] = Math.sin(ang) * sp;
            this.pBuf[base + 4] = 0;
            this.pBuf[base + 5] = rand(260, 390);
            this.pBuf[base + 6] = i % 3 === 0 ? 1 : 0; // 1:2 ember to ash ratio
            this.pCount++;
          }
        }

        frame = (dt) => {
          this.clock += dt;
          const clock = this.clock;
          const sy = (this.sy = window.scrollY);
          const dts = dt / 1000;
          const open = clock > this.gate;
          const q = ticker.quality;

          if (open) {
            this.zones.forEach((z) => {
              if (z.visible && !z.active && !z.built && !z.dissolving && z.left > 0) this.activate(z);
              else if (z.active && clock - z.startedAt > z.budget) this.flush(z);
              else if (z.loop && z.built && z.visible && !z.dissolving && clock - z.builtAt > z.hold) {
                z.dissolving = true;
                this.setState(z, "dissolving");
                this.queue.push({ el: z.el, zone: z, type: "select", done: false, claimed: false, dep: null });
              }
            });
          }

          const pending = this.queue.length;
          const speed = clamp(1 + pending / 10, 1, 3.4);
          const follow = clock - this.pointer.last < 2600;

          for (let n = 0; n < this.agents.length; n++) {
            const a = this.agents[n];
            if (a.state === "idle" && pending && open) {
              const t = this.pick(a);
              if (t) this.claim(a, t);
            }
            if (a.state === "idle") {
              let tx, ty, k;
              if (follow) {
                const ang = a.orbit + clock * 0.00065 * a.dir;
                const R = 64 + a.i * 14;
                tx = this.pointer.x + Math.cos(ang) * R;
                ty = this.pointer.y + sy + Math.sin(ang) * R * 0.8;
                k = 44;
              } else {
                tx = a.hx * this.W + Math.sin(clock * 0.00038 * a.f1 + a.ph) * 44;
                ty = sy + a.hy * this.H + Math.cos(clock * 0.00046 * a.f2 + a.ph) * 32;
                k = 20;
              }
              const c = 2 * Math.sqrt(k) * 0.84;
              a.vx += ((tx - a.x) * k - a.vx * c) * dts;
              a.vy += ((ty - a.y) * k - a.vy * c) * dts;
              a.x += a.vx * dts;
              a.y += a.vy * dts;
            } else if (a.state === "travel") {
              const p = a.p;
              p.t = Math.min(1, p.t + (dt * speed) / p.dur);
              const e = minJerk(p.t), m = 1 - e;
              const nx = m * m * m * p.x0 + 3 * m * m * e * p.x1 + 3 * m * e * e * p.x2 + e * e * e * p.x3;
              const ny = m * m * m * p.y0 + 3 * m * m * e * p.y1 + 3 * m * e * e * p.y2 + e * e * e * p.y3;
              a.vx = (nx - a.x) / dts; a.vy = (ny - a.y) / dts;
              a.x = nx; a.y = ny;
              if (p.t >= 1) {
                a.vx = a.vy = 0;
                if (a.task) this.beginWork(a);
                else {
                  this.detents.push({ x: a.x, y: a.y, t: 0, dur: 220, vermilion: true });
                  if (q === 2) this.emitMotes(a.x, a.y, 4);
                  a.state = "rest"; a.rest = 600;
                }
              }
            } else if (a.state === "work") {
              a.wt += dt * speed;
              const u = clamp(a.wt / a.wdur, 0, 1);
              this.work(a, a.task, u);
              if (u >= 1) {
                this.finish(a.task, a);
                a.task = null; a.state = "rest"; a.rest = rand(25, 105) / speed;
              }
            } else {
              a.rest -= dt;
              if (a.rest <= 0) { a.state = "idle"; a.shape = "arrow"; a.verb = ""; }
            }

            // Append trajectory sample only when moved >= 6px (zero allocation)
            if (q > 0 && Math.hypot(a.x - a.lastTx, a.y - a.lastTy) >= 6) {
              const cap = q === 2 ? TRAIL_MAX : 9;
              a.tHead = (a.tHead + 1) % cap;
              const o = a.tHead * 3;
              a.tBuf[o] = a.x; a.tBuf[o + 1] = a.y; a.tBuf[o + 2] = clock;
              if (a.tLen < cap) a.tLen++;
              a.lastTx = a.x; a.lastTy = a.y;
            }
          }

          this.draw(dt, sy, clock, q);
        };

        draw(dt, sy, clock, q) {
          const ctx = this.ctx;
          const { W, H, dpr } = this;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, W, H);
          ctx.lineJoin = "miter";
          ctx.miterLimit = 3;

          // ------------------------------------------------------------ PASS 1: SNAP GUIDES & WITNESS SLASHES
          if (q > 0) {
            // Dashed survey rules
            if (q === 2) {
              ctx.setLineDash([2, 4]);
              ctx.lineWidth = 1;
              ctx.strokeStyle = "rgba(255, 61, 0, 0.45)";
              ctx.beginPath();
              for (let n = 0; n < this.agents.length; n++) {
                const a = this.agents[n];
                if (a.state !== "work") continue;
                const t = a.task;
                const x = Math.round(t.x) + 0.5, y = Math.round(t.y - sy) + 0.5;
                if (y > H + 40 || y + t.h < -40) continue;
                const ax = Math.round(a.x) + 0.5, ay = Math.round(a.y - sy) + 0.5;
                if (t.type === "box" || t.type === "fade" || t.type === "select") {
                  ctx.moveTo(0, y); ctx.lineTo(W, y);
                  ctx.moveTo(x, 0); ctx.lineTo(x, H);
                  ctx.moveTo(0, ay); ctx.lineTo(W, ay);
                  ctx.moveTo(ax, 0); ctx.lineTo(ax, H);
                } else if (t.type === "text") {
                  ctx.moveTo(x - 18, ay + t.lh * 0.5); ctx.lineTo(ax + 18, ay + t.lh * 0.5);
                }
              }
              ctx.stroke();
              ctx.setLineDash([]);
            }

            // Solid active drafting bounding rects, witness slashes & span readouts
            ctx.lineWidth = 1;
            for (let n = 0; n < this.agents.length; n++) {
              const a = this.agents[n];
              if (a.state !== "work") continue;
              const t = a.task;
              const x = Math.round(t.x) + 0.5, y = Math.round(t.y - sy) + 0.5;
              if (y > H + 40 || y + t.h < -40) continue;
              const ax = Math.round(a.x) + 0.5, ay = Math.round(a.y - sy) + 0.5;

              if (t.type === "box" || t.type === "fade" || t.type === "select") {
                const w = ax - x, h = ay - y;
                if (q === 2) {
                  ctx.strokeStyle = t.type === "select" ? VERMILION : "rgba(244, 242, 236, 0.58)";
                  if (t.type === "select") ctx.setLineDash([4, 3]);
                  ctx.strokeRect(x, y, w, h);
                  ctx.setLineDash([]);
                  if (t.type === "fade") {
                    ctx.strokeStyle = "rgba(244, 242, 236, 0.22)";
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ax, ay); ctx.moveTo(ax, y); ctx.lineTo(x, ay); ctx.stroke();
                  }
                  // Architectural 45° witness slashes at corners
                  ctx.strokeStyle = INK;
                  ctx.beginPath();
                  ctx.moveTo(x - 2.5, y + 2.5); ctx.lineTo(x + 2.5, y - 2.5);
                  ctx.moveTo(ax - 2.5, y + 2.5); ctx.lineTo(ax + 2.5, y - 2.5);
                  ctx.moveTo(x - 2.5, ay + 2.5); ctx.lineTo(x + 2.5, ay - 2.5);
                  ctx.moveTo(ax - 2.5, ay + 2.5); ctx.lineTo(ax + 2.5, ay - 2.5);
                  ctx.stroke();

                  // Live W×H span readout above top edge
                  if (Math.abs(w) > 48) {
                    const spanTxt = `${Math.abs(Math.round(w))}×${Math.abs(Math.round(h))}`;
                    const tw = spanTxt.length * 5.2 + 8;
                    const sx = Math.round(x + w * 0.5 - tw * 0.5);
                    const syTop = Math.round(Math.min(y, ay) - 16);
                    ctx.fillStyle = "rgba(7, 7, 9, 0.82)";
                    ctx.fillRect(sx, syTop, tw, 13);
                    ctx.fillStyle = STEEL;
                    ctx.font = '400 8.5px "JetBrains Mono", ui-monospace, monospace';
                    ctx.textBaseline = "middle";
                    ctx.fillText(spanTxt, sx + 4, syTop + 7);
                  }
                } else {
                  // Tier 1: local 10px L-brackets only
                  const leg = 10;
                  ctx.strokeStyle = "rgba(244, 242, 236, 0.55)";
                  ctx.beginPath();
                  ctx.moveTo(x, y + leg); ctx.lineTo(x, y); ctx.lineTo(x + leg, y);
                  ctx.moveTo(ax - leg, y); ctx.lineTo(ax, y); ctx.lineTo(ax, y + leg);
                  ctx.moveTo(x, ay - leg); ctx.lineTo(x, ay); ctx.lineTo(x + leg, ay);
                  ctx.moveTo(ax - leg, ay); ctx.lineTo(ax, ay); ctx.lineTo(ax, ay - leg);
                  ctx.stroke();
                }
              } else if (t.type === "line" || t.type === "rise") {
                const bx = t.vert ? ax : x;
                const by = t.type === "rise" ? Math.round(y + t.h) + 0.5 : t.vert ? y : Math.round(y + t.h / 2) + 0.5;
                ctx.strokeStyle = VERMILION;
                ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ax, ay); ctx.stroke();
                ctx.fillStyle = INK;
                ctx.fillRect(bx - 1.5, by - 1.5, 3, 3);
              }
            }
          }

          // ------------------------------------------------------------ PASS 2: 3-BUCKET BATCHED TRAJECTORY TRAILS
          if (q > 0) {
            const cap = q === 2 ? TRAIL_MAX : 9;
            // 3 quantized buckets: [tail, mid, head]
            const buckets = [[], [], []];
            const verniers = [];
            for (let n = 0; n < this.agents.length; n++) {
              const a = this.agents[n];
              if (a.tLen < 2) continue;
              const tMax = a.state === "work" ? 540 : 420;
              for (let k = 0; k < a.tLen - 1; k++) {
                const i0 = (a.tHead - k + cap) % cap;
                const i1 = (a.tHead - k - 1 + cap) % cap;
                const age = clock - a.tBuf[i0 * 3 + 2];
                if (age > tMax) break;
                const ratio = age / tMax;
                const x0 = a.tBuf[i0 * 3], y0 = a.tBuf[i0 * 3 + 1] - sy;
                const x1 = a.tBuf[i1 * 3], y1 = a.tBuf[i1 * 3 + 1] - sy;
                if ((y0 < -60 && y1 < -60) || (y0 > H + 60 && y1 > H + 60)) continue;
                const bIdx = ratio < 0.33 ? 2 : ratio < 0.66 ? 1 : 0;
                if (q === 1 && bIdx === 0) continue;
                buckets[bIdx].push(x0, y0, x1, y1);
                if (q === 2 && bIdx >= 1 && k % 4 === 1) {
                  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
                  const nx = (-dy / len) * 2, ny = (dx / len) * 2;
                  verniers.push(x0 - nx, y0 - ny, x0 + nx, y0 + ny);
                }
              }
            }
            ctx.lineWidth = 1;
            if (buckets[0].length) {
              ctx.setLineDash([2, 4]);
              ctx.strokeStyle = "rgba(244, 242, 236, 0.08)";
              ctx.beginPath();
              for (let i = 0; i < buckets[0].length; i += 4) { ctx.moveTo(buckets[0][i], buckets[0][i + 1]); ctx.lineTo(buckets[0][i + 2], buckets[0][i + 3]); }
              ctx.stroke();
              ctx.setLineDash([]);
            }
            if (buckets[1].length) {
              ctx.strokeStyle = "rgba(244, 242, 236, 0.16)";
              ctx.beginPath();
              for (let i = 0; i < buckets[1].length; i += 4) { ctx.moveTo(buckets[1][i], buckets[1][i + 1]); ctx.lineTo(buckets[1][i + 2], buckets[1][i + 3]); }
              ctx.stroke();
            }
            if (buckets[2].length) {
              ctx.strokeStyle = "rgba(244, 242, 236, 0.34)";
              ctx.beginPath();
              for (let i = 0; i < buckets[2].length; i += 4) { ctx.moveTo(buckets[2][i], buckets[2][i + 1]); ctx.lineTo(buckets[2][i + 2], buckets[2][i + 3]); }
              ctx.stroke();
            }
            if (verniers.length) {
              ctx.strokeStyle = "rgba(244, 242, 236, 0.24)";
              ctx.beginPath();
              for (let i = 0; i < verniers.length; i += 4) { ctx.moveTo(verniers[i], verniers[i + 1]); ctx.lineTo(verniers[i + 2], verniers[i + 3]); }
              ctx.stroke();
            }
          }

          // ------------------------------------------------------------ PASS 3: LOCK-ON FLASHES, DETENTS, GENESIS & MOTES
          // Genesis astrolabe shockwave (clean hairline rings, zero neon blur)
          if (this.genesis) {
            const g = this.genesis;
            g.t += dt;
            const u = g.t / g.dur;
            if (u >= 1) {
              this.genesis = null;
            } else {
              const R = Math.hypot(W, H) * 0.58;
              const e = expoOut(u);
              const gy = g.y - sy;
              ctx.strokeStyle = INK;
              for (let k = 0; k < 3; k++) {
                const uu = clamp(u * 1.25 - k * 0.12, 0, 1);
                ctx.globalAlpha = (1 - uu) * (k === 0 ? 0.55 : 0.28);
                ctx.lineWidth = k === 0 ? 1.2 : 0.8;
                ctx.beginPath();
                ctx.arc(g.x, gy, expoOut(uu) * R * (1 - k * 0.18), 0, TAU);
                ctx.stroke();
              }
              ctx.strokeStyle = VERMILION;
              ctx.globalAlpha = (1 - u) * 0.45;
              ctx.lineWidth = 1;
              ctx.beginPath();
              for (let k = 0; k < 16; k++) {
                const ang = (k / 16) * TAU + e * 0.4;
                ctx.moveTo(g.x + Math.cos(ang) * R * e * 0.22, gy + Math.sin(ang) * R * e * 0.22);
                ctx.lineTo(g.x + Math.cos(ang) * R * e * 0.55, gy + Math.sin(ang) * R * e * 0.55);
              }
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }

          // 4-Corner Bracket Lock-On Flashes (All tiers)
          ctx.lineWidth = 1;
          for (let i = this.flashes.length - 1; i >= 0; i--) {
            const f = this.flashes[i];
            f.t += dt;
            if (f.t >= f.dur) { this.flashes.splice(i, 1); continue; }
            const uClamp = Math.min(1, f.t / 180);
            const pad = 10 * Math.pow(1 - uClamp, 3);
            const isDetent = f.t <= 36;
            ctx.strokeStyle = isDetent ? VERMILION : INK;
            ctx.globalAlpha = isDetent ? 1 : 0.55 * (1 - (f.t - 36) / (f.dur - 36));
            const x0 = Math.round(f.x - pad) + 0.5, y0 = Math.round(f.y - sy - pad) + 0.5;
            const x1 = Math.round(f.x + f.w + pad) + 0.5, y1 = Math.round(f.y - sy + f.h + pad) + 0.5;
            const leg = 8;
            ctx.beginPath();
            ctx.moveTo(x0, y0 + leg); ctx.lineTo(x0, y0); ctx.lineTo(x0 + leg, y0);
            ctx.moveTo(x1 - leg, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + leg);
            ctx.moveTo(x0, y1 - leg); ctx.lineTo(x0, y1); ctx.lineTo(x0 + leg, y1);
            ctx.moveTo(x1 - leg, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, y1 - leg);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;

          // Mechanical diamond detents
          for (let i = this.detents.length - 1; i >= 0; i--) {
            const d = this.detents[i];
            d.t += dt;
            const u = d.t / d.dur;
            if (u >= 1) { this.detents.splice(i, 1); continue; }
            const r = 3 + 11 * (1 - Math.pow(1 - u, 3));
            const dx = Math.round(d.x) + 0.5, dy = Math.round(d.y - sy) + 0.5;
            ctx.strokeStyle = d.vermilion ? VERMILION : INK;
            ctx.globalAlpha = 0.72 * (1 - u);
            ctx.beginPath();
            ctx.moveTo(dx, dy - r); ctx.lineTo(dx + r, dy); ctx.lineTo(dx, dy + r); ctx.lineTo(dx - r, dy);
            ctx.closePath();
            ctx.stroke();
          }
          ctx.globalAlpha = 1;

          // Sparse Ash & Ember Motes (Tier 2 only — 1x1 / 2x2 fillRect)
          if (q === 2 && this.pCount > 0) {
            const drag = Math.pow(0.08, dt / 1000);
            for (let i = this.pCount - 1; i >= 0; i--) {
              const b = i * 7;
              this.pBuf[b + 4] += dt;
              const age = this.pBuf[b + 4], life = this.pBuf[b + 5];
              if (age >= life) {
                this.pCount--;
                if (i < this.pCount) {
                  const last = this.pCount * 7;
                  for (let k = 0; k < 7; k++) this.pBuf[b + k] = this.pBuf[last + k];
                }
                continue;
              }
              this.pBuf[b + 2] *= drag;
              this.pBuf[b + 3] = this.pBuf[b + 3] * drag - 14 * (dt / 1000);
              this.pBuf[b] += this.pBuf[b + 2] * (dt / 1000);
              this.pBuf[b + 1] += this.pBuf[b + 3] * (dt / 1000);
              const frac = age / life;
              ctx.globalAlpha = frac > 0.6 ? (1 - frac) / 0.4 : 0.9;
              ctx.fillStyle = this.pBuf[b + 6] ? VERMILION : INK;
              const sz = this.pBuf[b + 6] ? 2 : 1.5;
              ctx.fillRect(Math.round(this.pBuf[b]), Math.round(this.pBuf[b + 1] - sy), sz, sz);
            }
            ctx.globalAlpha = 1;
          }

          // ------------------------------------------------------------ PASS 4 & 5: BRUTALIST NAMEPLATES & SIGILS (EXACT CACHED WIDTHS + DE-COLLISION)
          if (!this.wCache) this.wCache = new Map();
          const measureCached = (font, str) => {
            const key = font + "|" + str;
            let w = this.wCache.get(key);
            if (w === undefined) {
              ctx.font = font;
              w = ctx.measureText(str).width;
              if (this.wCache.size < 256) this.wCache.set(key, w);
            }
            return w;
          };
          const F_PRE = '500 9.5px "JetBrains Mono", ui-monospace, monospace';
          const F_NAME = '600 9.5px "JetBrains Mono", ui-monospace, monospace';
          const F_VERB = '500 9px "JetBrains Mono", ui-monospace, monospace';
          const placed = [];

          ctx.textBaseline = "middle";
          for (let n = 0; n < this.agents.length; n++) {
            const a = this.agents[n];
            const x = Math.round(a.x), y = Math.round(a.y - sy);
            if (y < -48 || y > H + 48 || x < -48 || x > W + 48) continue;
            const active = a.state === "work" || a.verb === "LOCK";

            // Tier 0: Bare knockout Roman numeral for idle; compact active callsign
            if (q === 0 && !active) {
              ctx.font = '600 8.5px "JetBrains Mono", ui-monospace, monospace';
              ctx.lineWidth = 2.5;
              ctx.strokeStyle = KNOCKOUT;
              ctx.strokeText(a.def.roman, x + 13, y + 14);
              ctx.fillStyle = STEEL;
              ctx.fillText(a.def.roman, x + 13, y + 14);
              continue;
            }
            // Tier 1: Hide idle nameplates on mobile so small screens stay breathable
            if (q === 1 && !active) continue;

            // Compute flip hysteresis for Tier 2
            if (!a.flipX && x > W - 190) a.flipX = true;
            else if (a.flipX && x < W - 215) a.flipX = false;
            if (!a.flipY && y > H - 56) a.flipY = true;
            else if (a.flipY && y < H - 80) a.flipY = false;

            const upperName = a.def.name.toUpperCase();
            const prefix = `${a.def.roman} · `;
            const hasVerb = q === 2 && active && a.verb;
            const wPre = measureCached(F_PRE, prefix);
            const wName = measureCached(F_NAME, upperName);
            const wSep = hasVerb ? measureCached(F_VERB, " // ") : 0;
            const wVerb = hasVerb ? measureCached(F_VERB, a.verb) : 0;

            const plateH = q === 2 ? 20 : 17;
            const plateW = Math.ceil(22 + wPre + wName + wSep + wVerb + 8);
            const C = 4;

            let px, py, ax, ay, ex, ey, sx;
            if (q === 2) {
              const off = a.shape === "cross" || a.shape === "select" ? 11 : 14;
              ax = x + (a.flipX ? -off : off);
              ay = y + (a.flipY ? -off : off);
              ex = ax + (a.flipX ? -8 : 8);
              ey = ay + (a.flipY ? -8 : 8);
              sx = ex + (a.flipX ? -6 : 6);
              px = clamp(a.flipX ? sx - plateW : sx, 4, W - plateW - 4);
              py = clamp(Math.round(ey - plateH * 0.5), 4, H - plateH - 4);
            } else {
              px = clamp(x + 14, 4, W - plateW - 4);
              py = clamp(y + 12, 4, H - plateH - 4);
            }

            // Lightweight vertical de-collision so crowded plates never stack on top of each other
            for (let pass = 0; pass < 3; pass++) {
              let hit = false;
              for (let j = 0; j < placed.length; j++) {
                const r = placed[j];
                if (px < r.x + r.w + 4 && px + plateW + 4 > r.x && py < r.y + r.h + 3 && py + plateH + 3 > r.y) {
                  py = py >= r.y ? r.y + r.h + 3 : r.y - plateH - 3;
                  py = clamp(py, 4, H - plateH - 4);
                  hit = true;
                }
              }
              if (!hit) break;
            }
            placed.push({ x: px, y: py, w: plateW, h: plateH });

            if (q === 2) {
              const targetY = Math.round(py + plateH * 0.5);
              const attachX = a.flipX ? px + plateW : px;
              ctx.fillStyle = active ? VERMILION : INK;
              ctx.fillRect(ax - 1, ay - 1, 2, 2);
              ctx.strokeStyle = active ? INK : ASH;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(ax + 0.5, ay + 0.5);
              ctx.lineTo(ex + 0.5, targetY + 0.5);
              ctx.lineTo(attachX + 0.5, targetY + 0.5);
              ctx.stroke();
            }

            // Chamfered 5-vertex obsidian plate (4px top-right bevel, 0px radius)
            ctx.beginPath();
            ctx.moveTo(px + 0.5, py + 0.5);
            ctx.lineTo(px + plateW - C + 0.5, py + 0.5);
            ctx.lineTo(px + plateW + 0.5, py + C + 0.5);
            ctx.lineTo(px + plateW + 0.5, py + plateH + 0.5);
            ctx.lineTo(px + 0.5, py + plateH + 0.5);
            ctx.closePath();
            ctx.fillStyle = "rgba(7, 7, 9, 0.92)";
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = active ? "rgba(244, 242, 236, 0.42)" : "rgba(244, 242, 236, 0.18)";
            ctx.stroke();

            // 2px Vertical Left Datum Spine (mineral accent idle, #FF3D00 active)
            ctx.fillStyle = active ? VERMILION : a.def.color;
            ctx.fillRect(px, py, 2, plateH);

            // 10x10 Mason's Mark Sigil inside plate
            ctx.save();
            ctx.translate(px + 7.5, py + Math.round((plateH - 10) * 0.5) + 0.5);
            ctx.lineWidth = 1;
            if (a.def.sigilEclipse) {
              ctx.strokeStyle = STEEL;
              ctx.beginPath(); ctx.arc(5, 5, 3.5, 0, TAU); ctx.stroke();
              ctx.fillStyle = a.def.color;
              ctx.beginPath(); ctx.arc(5, 5, 3.5, 0, Math.PI); ctx.fill();
              ctx.strokeStyle = INK;
              ctx.stroke(a.def.sigilPath);
            } else {
              ctx.strokeStyle = active ? INK : a.def.color;
              ctx.stroke(a.def.sigilPath);
              if (a.def.sigilDot) {
                ctx.fillStyle = VERMILION;
                ctx.fillRect(a.def.sigilDot[0], a.def.sigilDot[1], a.def.sigilDot[2], a.def.sigilDot[3]);
              }
            }
            ctx.restore();

            // Inline JetBrains Mono Telemetry (exact cached advances)
            const ty = py + plateH * 0.5 + 0.5;
            let tx = px + 22;
            ctx.font = F_PRE;
            ctx.fillStyle = STEEL;
            ctx.fillText(prefix, tx, ty);
            tx += wPre;

            ctx.font = F_NAME;
            ctx.fillStyle = INK;
            ctx.fillText(upperName, tx, ty);
            tx += wName;

            if (hasVerb) {
              ctx.font = F_VERB;
              ctx.fillStyle = ASH;
              ctx.fillText(" // ", tx, ty);
              tx += wSep;
              ctx.fillStyle = a.state === "work" ? VERMILION : INK;
              ctx.fillText(a.verb, tx, ty);
            }
          }

          // ------------------------------------------------------------ PASS 6: PIXEL-SNAPPED 32x32 PRECISION CURSORS
          const detentOn = ((clock / 250) | 0) % 2 === 0;
          for (let n = 0; n < this.agents.length; n++) {
            const a = this.agents[n];
            const x = Math.round(a.x), y = Math.round(a.y - sy);
            if (y < -40 || y > H + 40 || x < -40 || x > W + 40) continue;
            const active = a.state === "work";
            const tool = a.shape;
            const hs = HOTSPOT[tool] || HOTSPOT.arrow;
            const dx = x - hs[0] + 0.5;
            const dy = y - hs[1] + 0.5;

            ctx.save();
            ctx.translate(dx, dy);

            if (tool === "arrow") {
              // 3-pass Astrolabe Alidade Pierced Spearhead
              ctx.lineWidth = 3; ctx.strokeStyle = KNOCKOUT; ctx.stroke(TOOL_PATHS.arrowBody);
              ctx.fillStyle = IRON; ctx.fill(TOOL_PATHS.arrowBody, "evenodd");
              ctx.lineWidth = 1; ctx.strokeStyle = active ? INK : "#D2D0CA"; ctx.stroke(TOOL_PATHS.arrowBody);
              ctx.lineWidth = 3; ctx.strokeStyle = KNOCKOUT; ctx.stroke(TOOL_PATHS.arrowTail);
              ctx.lineWidth = 1.25; ctx.strokeStyle = active ? VERMILION : a.def.color; ctx.stroke(TOOL_PATHS.arrowTail);
            } else if (tool === "cross") {
              // Theodolite Stadia & Vernier Caliper
              ctx.lineWidth = 3; ctx.strokeStyle = KNOCKOUT;
              ctx.stroke(TOOL_PATHS.crossHair);
              ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(TOOL_PATHS.crossHair);
              ctx.strokeStyle = STEEL; ctx.stroke(TOOL_PATHS.crossStadia);
              const shift = active ? 2 : 0;
              ctx.strokeStyle = active ? INK : STEEL;
              ctx.save(); ctx.translate(shift, shift); ctx.stroke(TOOL_PATHS.crossJawNW); ctx.restore();
              ctx.save(); ctx.translate(-shift, shift); ctx.stroke(TOOL_PATHS.crossJawNE); ctx.restore();
              ctx.save(); ctx.translate(-shift, -shift); ctx.stroke(TOOL_PATHS.crossJawSE); ctx.restore();
              ctx.save(); ctx.translate(shift, -shift); ctx.stroke(TOOL_PATHS.crossJawSW); ctx.restore();
              if (active) { ctx.fillStyle = VERMILION; ctx.fillRect(15.5, 15.5, 1.5, 1.5); }
            } else if (tool === "ibeam") {
              // Chiseled Lapidary Typesetting Caret
              ctx.lineWidth = 3; ctx.strokeStyle = KNOCKOUT;
              ctx.stroke(TOOL_PATHS.ibeamStem); ctx.stroke(TOOL_PATHS.ibeamSerif);
              ctx.lineWidth = 1; ctx.strokeStyle = INK;
              ctx.stroke(TOOL_PATHS.ibeamStem); ctx.stroke(TOOL_PATHS.ibeamSerif);
              if (active && detentOn) {
                ctx.lineWidth = 1.5; ctx.strokeStyle = VERMILION; ctx.stroke(TOOL_PATHS.ibeamCore);
              }
            } else if (tool === "pen") {
              // Kern Swiss Split-Nib Ruling Pen
              ctx.lineWidth = 3; ctx.strokeStyle = KNOCKOUT;
              ctx.stroke(TOOL_PATHS.penBody); ctx.stroke(TOOL_PATHS.penCollar);
              ctx.fillStyle = IRON; ctx.fill(TOOL_PATHS.penBody, "evenodd");
              ctx.fillStyle = a.def.color; ctx.fill(TOOL_PATHS.penCollar);
              ctx.lineWidth = 1; ctx.strokeStyle = INK;
              ctx.stroke(TOOL_PATHS.penBody); ctx.stroke(TOOL_PATHS.penCollar);
              ctx.strokeStyle = active ? VERMILION : STEEL; ctx.stroke(TOOL_PATHS.penFissure);
            } else {
              // Lithographic Quoins & Excision Shears
              ctx.lineWidth = 3; ctx.strokeStyle = KNOCKOUT;
              ctx.stroke(TOOL_PATHS.selectQuoins); ctx.stroke(TOOL_PATHS.selectCrops);
              ctx.fillStyle = INK; ctx.fill(TOOL_PATHS.selectQuoins);
              ctx.lineWidth = 1; ctx.strokeStyle = STEEL; ctx.stroke(TOOL_PATHS.selectCrops);
              ctx.strokeStyle = active ? VERMILION : INK; ctx.stroke(TOOL_PATHS.selectShears);
            }
            ctx.restore();
          }
        }
      }

      const swarm = new Swarm();

      // Animated counters
      function animateCounter(el) {
        const to = parseInt(el.dataset.to, 10) || 0;
        const start = performance.now();
        const dur = 1400;
        function step(now) {
          const t = Math.min(1, (now - start) / dur);
          el.textContent = Math.round(to * expoOut(t));
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }

      // Live Forge cycle listener
      forgeZoneEl.addEventListener("ak:state", (e) => {
        stageStateEl.textContent = e.detail;
        if (e.detail === "dissolved") {
          forgeCycle += 1;
          const idx = forgeCycle % FORGE_TEMPLATES.length;
          stageCycleEl.textContent = `Cycle ${String(forgeCycle + 1).padStart(2, "0")} · ${FORGE_NAMES[idx]}`;
          forgeZoneEl.innerHTML = FORGE_TEMPLATES[idx]();
          requestAnimationFrame(() => swarm.rescan(forgeZoneEl));
        }
      });

      const artboardEl = document.getElementById("live-artboard");
      const coordsEl = document.getElementById("stage-coords");
      artboardEl.addEventListener("pointermove", (e) => {
        const r = artboardEl.getBoundingClientRect();
        coordsEl.textContent = `X ${String(Math.max(0, Math.round(e.clientX - r.left))).padStart(4, "0")} · Y ${String(Math.max(0, Math.round(e.clientY - r.top))).padStart(4, "0")}`;
      }, { passive: true });
      artboardEl.addEventListener("pointerdown", (e) => swarm.summon(e.clientX, e.clientY));

      /* ==============================================================
         5. COSMOS STARFIELD CANVAS
         ============================================================== */
      (function initCosmos() {
        const c = document.getElementById("cosmos-canvas");
        const ctx = c.getContext("2d");
        const HUES = ["#F4F2EC", "#F4F2EC", "#F4F2EC", "#FFD2BF", "#BFEFFF", "#E5A93C"];
        const wrap = (v, m) => ((v % m) + m) % m;
        let W = 0, H = 0, stars = [], links = [], t0 = 0, shoot = null, nextShoot = 4000;
        const ptr = { x: 0, y: 0, tx: 0, ty: 0 };

        const build = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, ticker.quality === 2 ? 2 : 1);
          W = window.innerWidth; H = window.innerHeight;
          c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          const n = Math.round(Math.max(80, Math.min(260, (W * H) / 5600)) * (ticker.quality === 0 ? 0.5 : 1));
          stars = Array.from({ length: n }, () => {
            const z = Math.pow(Math.random(), 2) * 0.9 + 0.1;
            return { x: Math.random() * W, y: Math.random() * H, z, r: 0.6 + z * 1.5, tw: Math.random() * 6.28, sp: 0.0006 + Math.random() * 0.002, hue: HUES[(Math.random() * HUES.length) | 0], px: 0, py: 0 };
          }).sort((a, b) => (a.hue < b.hue ? -1 : 1));
          const near = stars.filter((s) => s.z > 0.45);
          links = [];
          for (let k = 0; k < 6 && near.length > 6; k++) {
            let cur = near[(Math.random() * near.length) | 0];
            const used = new Set([cur]);
            for (let j = 0; j < 4; j++) {
              let best = null, bd = 240 * 240;
              near.forEach((s) => {
                if (used.has(s)) return;
                const d = (s.x - cur.x) ** 2 + (s.y - cur.y) ** 2;
                if (d < bd) { bd = d; best = s; }
              });
              if (!best) break;
              links.push([cur, best, k]);
              used.add(best); cur = best;
            }
          }
        };

        window.addEventListener("pointermove", (e) => {
          ptr.tx = e.clientX / (W || 1) - 0.5;
          ptr.ty = e.clientY / (H || 1) - 0.5;
        }, { passive: true });

        let lastW = window.innerWidth;
        window.addEventListener("resize", () => {
          if (window.innerWidth !== lastW || Math.abs(window.innerHeight - H) > 140) {
            lastW = window.innerWidth; build();
          }
        }, { passive: true });
        ticker.onQuality.add(build);
        build();

        ticker.add((dt, now) => {
          if (!t0) t0 = now;
          const intro = Math.min(1, (now - t0) / 2000);
          const zoom = 0.35 + 0.65 * (1 - Math.pow(2, -10 * intro));
          const sy = window.scrollY;
          ptr.x += (ptr.tx - ptr.x) * 0.05;
          ptr.y += (ptr.ty - ptr.y) * 0.05;
          const cx = W / 2, cy = H * 0.42;
          ctx.clearRect(0, 0, W, H);
          let hue = "";
          for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            const bx = wrap(s.x - ptr.x * s.z * 46, W);
            const by = wrap(s.y - sy * s.z * 0.16 - ptr.y * s.z * 46, H);
            s.px = cx + (bx - cx) * zoom;
            s.py = cy + (by - cy) * zoom;
            if (s.hue !== hue) ctx.fillStyle = hue = s.hue;
            ctx.globalAlpha = (0.25 + 0.75 * s.z) * (0.62 + 0.38 * Math.sin(now * s.sp + s.tw)) * Math.min(1, intro * 3);
            ctx.fillRect(s.px, s.py, s.r, s.r);
          }
          ctx.strokeStyle = "#F4F2EC";
          ctx.lineWidth = 0.6;
          for (let i = 0; i < links.length; i++) {
            const [a, b, k] = links[i];
            if (Math.abs(a.px - b.px) > 320 || Math.abs(a.py - b.py) > 320) continue;
            ctx.globalAlpha = 0.15 * (0.5 + 0.5 * Math.sin(now * 0.00035 + k * 1.7)) * intro;
            ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke();
          }
          nextShoot -= dt;
          if (nextShoot < 0 && !shoot) {
            shoot = { x: Math.random() * W * 0.8, y: Math.random() * H * 0.4, t: 0 };
            nextShoot = 5000 + Math.random() * 7000;
          }
          if (shoot) {
            shoot.t += dt / 900;
            const u = shoot.t, hx = shoot.x + u * 420, hy = shoot.y + u * 170;
            const g = ctx.createLinearGradient(hx, hy, hx - 150, hy - 60);
            g.addColorStop(0, "rgba(244,242,236,.9)");
            g.addColorStop(1, "rgba(244,242,236,0)");
            ctx.globalAlpha = Math.sin(Math.min(1, u) * Math.PI);
            ctx.strokeStyle = g; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - 150, hy - 60); ctx.stroke();
            if (u >= 1) shoot = null;
          }
          ctx.globalAlpha = 1;
        });
      })();

      /* ==============================================================
         6. HERO 3D ARMILLARY SPHERE CANVAS
         ============================================================== */
      (function initArmillary() {
        const c = document.getElementById("armillary-canvas");
        const ctx = c.getContext("2d");
        const SEG = 72;
        const RINGS = [
          { R: 1, a: 1.32, b: -0.35, sp: 0.05, ticks: true },
          { R: 0.9, a: 0.42, b: 0.1, sp: 0.11 },
          { R: 0.76, a: 1.15, b: 0.6, sp: -0.17, flame: true },
          { R: 0.62, a: -0.75, b: 1.1, sp: 0.24 },
          { R: 0.48, a: 1.57, b: 0.25, sp: -0.33 },
        ];
        const GLOBE = Array.from({ length: 140 }, (_, i) => {
          const y = 1 - (i / 139) * 2;
          const r = Math.sqrt(1 - y * y);
          const th = i * 2.39996;
          return [Math.cos(th) * r, y, Math.sin(th) * r];
        });
        let S = 0, visible = true, time = 0;
        const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

        const size = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, ticker.quality === 2 ? 2 : 1.25);
          S = c.clientWidth || 360;
          c.width = c.height = Math.round(S * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        new ResizeObserver(size).observe(c);
        new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(c);
        size();

        window.addEventListener("pointermove", (e) => {
          tilt.tx = e.clientX / window.innerWidth - 0.5;
          tilt.ty = e.clientY / window.innerHeight - 0.5;
        }, { passive: true });

        const p = [0, 0, 0], p2 = [0, 0, 0];
        const project = (x, y, z, a, b, spin, out) => {
          const y1 = y * Math.cos(a) - z * Math.sin(a), z1 = y * Math.sin(a) + z * Math.cos(a);
          const x1 = x * Math.cos(b) - y1 * Math.sin(b), y2 = x * Math.sin(b) + y1 * Math.cos(b);
          const x2 = x1 * Math.cos(spin) + z1 * Math.sin(spin), z2 = -x1 * Math.sin(spin) + z1 * Math.cos(spin);
          const ry = tilt.x * 0.7, rx = 0.3 + tilt.y * 0.5;
          const x3 = x2 * Math.cos(ry) + z2 * Math.sin(ry), z3 = -x2 * Math.sin(ry) + z2 * Math.cos(ry);
          const y3 = y2 * Math.cos(rx) - z3 * Math.sin(rx), z4 = y2 * Math.sin(rx) + z3 * Math.cos(rx);
          const k = 3.2 / (3.2 - z4);
          out[0] = S / 2 + x3 * k * S * 0.4;
          out[1] = S / 2 + y3 * k * S * 0.4;
          out[2] = z4;
        };

        ticker.add((dt) => {
          if (!visible || !S) return;
          time += dt / 1000;
          tilt.x += (tilt.tx - tilt.x) * 0.045;
          tilt.y += (tilt.ty - tilt.y) * 0.045;
          ctx.clearRect(0, 0, S, S);

          const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.22);
          g.addColorStop(0, "rgba(255,61,0,.48)");
          g.addColorStop(1, "rgba(255,61,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, S, S);

          ctx.fillStyle = "#F4F2EC";
          for (let i = 0; i < GLOBE.length; i++) {
            const d = GLOBE[i];
            project(d[0] * 0.26, d[1] * 0.26, d[2] * 0.26, 0, 0, time * 0.4, p);
            ctx.globalAlpha = p[2] > 0 ? 0.9 : 0.22;
            ctx.fillRect(p[0], p[1], 1.4, 1.4);
          }

          ctx.strokeStyle = "#F4F2EC"; ctx.lineWidth = 1; ctx.globalAlpha = 0.35;
          project(0, -1.18, 0, 0, 0, 0, p); project(0, 1.18, 0, 0, 0, 0, p2);
          ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();

          for (let r = 0; r < RINGS.length; r++) {
            const ring = RINGS[r], spin = time * ring.sp;
            ctx.strokeStyle = ring.flame ? "#FF3D00" : "#F4F2EC";
            for (let pass = 0; pass < 2; pass++) {
              ctx.globalAlpha = pass ? (ring.flame ? 0.95 : 0.58) : 0.14;
              ctx.lineWidth = pass ? 1.1 : 1;
              ctx.beginPath();
              for (let i = 0; i < SEG; i++) {
                const t0 = (i / SEG) * TAU, t1 = ((i + 1) / SEG) * TAU;
                project(Math.cos(t0) * ring.R, 0, Math.sin(t0) * ring.R, ring.a, ring.b, spin, p);
                project(Math.cos(t1) * ring.R, 0, Math.sin(t1) * ring.R, ring.a, ring.b, spin, p2);
                if ((p[2] + p2[2] > 0) === !!pass) { ctx.moveTo(p[0], p[1]); ctx.lineTo(p2[0], p2[1]); }
                if (ring.ticks && pass && i % 2 === 0) {
                  project(Math.cos(t0) * (ring.R + (i % 6 ? 0.025 : 0.06)), 0, Math.sin(t0) * (ring.R + (i % 6 ? 0.025 : 0.06)), ring.a, ring.b, spin, p2);
                  ctx.moveTo(p[0], p[1]); ctx.lineTo(p2[0], p2[1]);
                }
              }
              ctx.stroke();
            }
            const col = AGENTS[r].color;
            const th = time * (0.5 + r * 0.13) * (r % 2 ? -1 : 1) + r;
            ctx.fillStyle = ctx.strokeStyle = col;
            ctx.lineWidth = 2; ctx.globalAlpha = 0.8;
            ctx.beginPath();
            for (let k = 0; k <= 10; k++) {
              const tt = th - (r % 2 ? -1 : 1) * k * 0.035;
              project(Math.cos(tt) * ring.R, 0, Math.sin(tt) * ring.R, ring.a, ring.b, spin, p2);
              if (k) ctx.lineTo(p2[0], p2[1]); else ctx.moveTo(p2[0], p2[1]);
            }
            ctx.stroke();
            project(Math.cos(th) * ring.R, 0, Math.sin(th) * ring.R, ring.a, ring.b, spin, p);
            ctx.globalAlpha = 1;
            ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, TAU); ctx.fill();
          }
          ctx.globalAlpha = 1;
        });
      })();

      /* ==============================================================
         7. REGISTRY LIVE 60FPS HERO FX CANVAS (MATRIX / GLOBE / BEAMS)
         ============================================================== */
      (function initHeroFx() {
        const c = document.getElementById("herofx-canvas");
        const ctx = c.getContext("2d");
        let w = 400, h = 265, visible = true, mode = "matrix";
        const ptr = { x: 0.62, y: 0.48 };

        const resize = () => {
          const r = c.getBoundingClientRect();
          w = Math.max(240, r.width); h = Math.max(200, r.height);
          const dpr = Math.min(window.devicePixelRatio || 1, ticker.quality === 2 ? 2 : 1.25);
          c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        new ResizeObserver(resize).observe(c);
        new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(c);
        resize();

        c.addEventListener("pointermove", (e) => {
          const r = c.getBoundingClientRect();
          ptr.x = (e.clientX - r.left) / r.width;
          ptr.y = (e.clientY - r.top) / r.height;
        }, { passive: true });

        document.querySelectorAll("#herofx-tabs button").forEach((btn) => {
          btn.addEventListener("click", () => {
            mode = btn.dataset.fx;
            document.querySelectorAll("#herofx-tabs button").forEach((b) => b.classList.toggle("chip-on", b === btn));
          });
        });

        ticker.add((_, now) => {
          if (!visible) return;
          const t = now * 0.001;
          ctx.fillStyle = "#0d0d12";
          ctx.fillRect(0, 0, w, h);
          const px = ptr.x * w, py = ptr.y * h;

          if (mode === "matrix") {
            const step = ticker.quality === 0 ? 28 : 20;
            for (let y = step * 0.5; y < h; y += step) {
              for (let x = step * 0.5; x < w; x += step) {
                const dist = Math.hypot(x - px, y - py);
                const focus = Math.max(0, 1 - dist / 150);
                const wave = Math.sin(x * 0.025 + y * 0.02 - t * 2.2) * 0.5 + 0.5;
                ctx.fillStyle = focus > 0.3 ? `rgba(255,61,0,${0.25 + focus * 0.75})` : `rgba(244,242,236,${0.1 + wave * 0.14})`;
                ctx.beginPath();
                ctx.arc(x, y, 1 + focus * 2.3 + wave * 0.4, 0, TAU);
                ctx.fill();
              }
            }
          } else if (mode === "beams") {
            const count = ticker.quality === 0 ? 10 : 18;
            for (let i = 0; i < count; i++) {
              const x = ((i + 0.5) / count) * w;
              const speed = 38 + (i % 4) * 22;
              const by = ((t * speed + i * 71) % (h + 120)) - 60;
              const grad = ctx.createLinearGradient(x, by - 60, x, by + 10);
              grad.addColorStop(0, "rgba(0,240,255,0)");
              grad.addColorStop(0.8, i % 3 === 0 ? "rgba(255,61,0,0.75)" : "rgba(0,240,255,0.55)");
              grad.addColorStop(1, "#F4F2EC");
              ctx.strokeStyle = grad; ctx.lineWidth = 1.25;
              ctx.beginPath(); ctx.moveTo(x, by - 60); ctx.lineTo(x, by + 10); ctx.stroke();
            }
          } else {
            const cx = w * 0.65, cy = h * 0.52, rad = Math.min(w, h) * 0.38;
            const pts = ticker.quality === 0 ? 100 : 190;
            const rotY = t * 0.45 + (ptr.x - 0.5) * 1.4, rotX = 0.28 + (ptr.y - 0.5) * 0.7;
            const cosY = Math.cos(rotY), sinY = Math.sin(rotY), cosX = Math.cos(rotX), sinX = Math.sin(rotX);
            for (let i = 0; i < pts; i++) {
              const phi = Math.acos(1 - (2 * (i + 0.5)) / pts);
              const theta = Math.PI * (1 + Math.sqrt(5)) * i;
              const x0 = Math.sin(phi) * Math.cos(theta), y0 = Math.cos(phi), z0 = Math.sin(phi) * Math.sin(theta);
              const x1 = x0 * cosY - z0 * sinY, z1 = x0 * sinY + z0 * cosY;
              const y2 = y0 * cosX - z1 * sinX, z2 = y0 * sinX + z1 * cosX;
              const depth = (z2 + 1.2) / 2.2;
              if (depth < 0.1) continue;
              ctx.fillStyle = i % 11 === 0 ? `rgba(255,61,0,${depth})` : `rgba(244,242,236,${depth * 0.8})`;
              ctx.beginPath();
              ctx.arc(cx + x1 * rad, cy + y2 * rad, 0.9 + depth * 1.5, 0, TAU);
              ctx.fill();
            }
          }
        });
      })();

      /* ==============================================================
         8. MICRO-INTERACTIONS, SPOTLIGHT, PARALLAX & SCROLLING
         ============================================================== */
      // Spotlight hover coordinates
      document.querySelectorAll(".spot").forEach((el) => {
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${e.clientX - r.left}px`);
          el.style.setProperty("--my", `${e.clientY - r.top}px`);
        }, { passive: true });
      });

      // Magnetic spring buttons
      document.querySelectorAll(".magnetic").forEach((wrap) => {
        const strength = parseFloat(wrap.dataset.strength) || 0.32;
        let tx = 0, ty = 0, cx = 0, cy = 0, active = false;
        wrap.addEventListener("pointermove", (e) => {
          const r = wrap.getBoundingClientRect();
          tx = (e.clientX - r.left - r.width / 2) * strength;
          ty = (e.clientY - r.top - r.height / 2) * strength;
          active = true;
        });
        wrap.addEventListener("pointerleave", () => { tx = 0; ty = 0; });
        ticker.add(() => {
          if (!active && Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05) return;
          cx += (tx - cx) * 0.16;
          cy += (ty - cy) * 0.16;
          wrap.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
          if (tx === 0 && ty === 0 && Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05) {
            cx = cy = 0; active = false; wrap.style.transform = "";
          }
        });
      });

      // Scroll parallax (Hero orb, Hero head, Marquee shift, Monolith image)
      const orbWrap = document.getElementById("hero-orb-wrap");
      const headWrap = document.getElementById("hero-head-wrap");
      const marqueeEl = document.getElementById("editorial-marquee");
      const marqueeShift = document.getElementById("marquee-shift");
      const monolithFrame = document.getElementById("monolith-frame");
      const monolithImg = document.getElementById("monolith-img");

      ticker.add(() => {
        const sy = window.scrollY;
        const p = clamp(sy / 900, 0, 1);
        orbWrap.style.transform = `translate3d(0, ${(p * 170).toFixed(1)}px, 0) scale(${(1 - p * 0.13).toFixed(3)})`;
        headWrap.style.transform = `translate3d(0, ${(-p * 62).toFixed(1)}px, 0)`;

        const mr = marqueeEl.getBoundingClientRect();
        if (mr.bottom > 0 && mr.top < window.innerHeight) {
          const mp = clamp((window.innerHeight - mr.top) / (window.innerHeight + mr.height), 0, 1);
          marqueeShift.style.transform = `translate3d(${(4 - mp * 12).toFixed(2)}%, 0, 0)`;
        }
        const fr = monolithFrame.getBoundingClientRect();
        if (fr.bottom > 0 && fr.top < window.innerHeight) {
          const fp = clamp((window.innerHeight - fr.top) / (window.innerHeight + fr.height), 0, 1);
          monolithImg.style.transform = `translate3d(0, ${(-12 + fp * 24).toFixed(2)}%, 0)`;
        }
      });

      // Typography switcher
      const FACES = [
        ["f-display font-extrabold uppercase", "clamp(2.7rem, 8vw, 7.2rem)"],
        ["f-serif italic font-normal", "clamp(3rem, 8.5vw, 7.6rem)"],
        ["f-mono font-medium", "clamp(2rem, 6vw, 5.2rem)"],
      ];
      const specEl = document.getElementById("type-specimen");
      const clampEl = document.getElementById("face-clamp");
      document.querySelectorAll("#face-buttons button").forEach((btn) => {
        const setFace = () => {
          const i = parseInt(btn.dataset.face, 10);
          specEl.className = `${FACES[i][0]} truncate py-3 text-5xl leading-none text-[var(--ink)] sm:text-7xl`;
          clampEl.textContent = FACES[i][1];
          document.querySelectorAll("#face-buttons button").forEach((b) => b.classList.toggle("chip-on", b === btn));
        };
        btn.addEventListener("click", setFace);
        btn.addEventListener("mouseenter", setFace);
      });

      // Magnetic demo button feedback
      document.getElementById("magnetic-demo-btn").addEventListener("click", () => {
        showToast("Spring 260 / 16 · engaged");
      });

      // Smooth section links
      document.querySelectorAll("[data-scroll]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          const target = document.querySelector(el.dataset.scroll);
          if (target) target.scrollIntoView({ behavior: "smooth" });
        });
      });

      // Replay genesis handlers
      function replayGenesis() {
        window.scrollTo({ top: 0, behavior: "instant" });
        swarm.replay();
      }
      document.getElementById("nav-replay-btn").addEventListener("click", replayGenesis);
      document.getElementById("hero-replay-btn").addEventListener("click", replayGenesis);
      document.getElementById("footer-replay-btn").addEventListener("click", replayGenesis);

      // Stylish hamburger — fullscreen kinetic index menu
      const menuToggle = document.getElementById("menu-toggle");
      const siteMenu = document.getElementById("site-menu");
      let menuLastFocus = null;

      function setMenu(open) {
        siteMenu.classList.toggle("open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        siteMenu.setAttribute("aria-hidden", String(!open));
        document.documentElement.classList.toggle("menu-open", open);
        if (open) {
          menuLastFocus = document.activeElement;
          const first = siteMenu.querySelector(".menu-link");
          if (first) first.focus({ preventScroll: true });
        } else if (menuLastFocus && menuLastFocus.focus) {
          menuLastFocus.focus({ preventScroll: true });
        }
      }

      menuToggle.addEventListener("click", () => {
        setMenu(!siteMenu.classList.contains("open"));
      });

      // Close on backdrop click or on any in-menu section link (scroll is handled by the [data-scroll] delegator)
      siteMenu.addEventListener("click", (e) => {
        if (e.target === siteMenu || e.target.classList.contains("menu-bg")) setMenu(false);
        else if (e.target.closest("[data-scroll]")) setMenu(false);
      });

      document.addEventListener("keydown", (e) => {
        const isOpen = siteMenu.classList.contains("open");
        if (e.key === "Escape" && isOpen) {
          setMenu(false);
          return;
        }
        if (e.key === "Tab" && isOpen) {
          const focusables = [menuToggle, ...siteMenu.querySelectorAll("a[href], button")];
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });

      // Never leave the overlay stranded if the viewport crosses into desktop (md+) while open
      const menuMq = window.matchMedia("(min-width: 768px)");
      const onMenuMq = () => { if (menuMq.matches) setMenu(false); };
      if (menuMq.addEventListener) menuMq.addEventListener("change", onMenuMq);
      else if (menuMq.addListener) menuMq.addListener(onMenuMq);

      document.getElementById("menu-copy-llms").addEventListener("click", () => {
        copyText(LLMS_SPEC, "llms.txt");
        setMenu(false);
      });
      document.getElementById("menu-replay").addEventListener("click", () => {
        setMenu(false);
        replayGenesis();
      });

      // Copy llms.txt handlers
      document.getElementById("copy-llms-btn").addEventListener("click", () => copyText(LLMS_SPEC, "llms.txt"));
      document.getElementById("footer-copy-btn").addEventListener("click", () => copyText(LLMS_SPEC, "llms.txt"));

      // Live FPS pill
      const fpsEl = document.getElementById("fps-readout");
      setInterval(() => {
        fpsEl.textContent = `${ticker.fps} fps`;
      }, 650);

      // Boot swarm cleanly once fonts settle
      Promise.race([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        new Promise((r) => setTimeout(r, 900)),
      ]).then(() => {
        setTimeout(() => {
          window.__akStarted = true;
          if (swarm.wCache) swarm.wCache.clear();
          swarm.start();
        }, 140);
      });

      /* ==============================================================
         11. REGISTRY EXPLORER — tabbed live gallery fed by /registry.json
         ============================================================== */
      (function initExplorer() {
        const root = document.getElementById("ak-explorer");
        if (!root) return;

        const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => (
          { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
        ));

        /* ---- Tabs: click + roving tabindex (Arrow/Home/End) ---- */
        const tabs = Array.from(root.querySelectorAll("[data-xr-tab]"));
        const panels = {
          templates: document.getElementById("xr-panel-templates"),
          fx: document.getElementById("xr-panel-fx"),
          motion: document.getElementById("xr-panel-motion"),
          systems: document.getElementById("xr-panel-systems"),
        };
        function activate(name, focusTab) {
          tabs.forEach((t) => {
            const on = t.dataset.xrTab === name;
            t.classList.toggle("is-on", on);
            t.setAttribute("aria-selected", on ? "true" : "false");
            t.tabIndex = on ? 0 : -1;
          });
          Object.keys(panels).forEach((k) => { if (panels[k]) panels[k].hidden = k !== name; });
          if (focusTab) {
            const target = tabs.find((t) => t.dataset.xrTab === name);
            if (target) target.focus();
          }
        }
        tabs.forEach((tab, i) => {
          tab.addEventListener("click", () => activate(tab.dataset.xrTab, false));
          tab.addEventListener("keydown", (event) => {
            let next = null;
            if (event.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
            else if (event.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
            else if (event.key === "Home") next = tabs[0];
            else if (event.key === "End") next = tabs[tabs.length - 1];
            if (next) {
              event.preventDefault();
              activate(next.dataset.xrTab, true);
            }
          });
        });

        /* ---- Copy helpers ---- */
        const fetchImpl = typeof window.fetch === "function" ? window.fetch.bind(window) : null;
        async function copyFromFile(file, label) {
          if (!fetchImpl) { showToast("Clipboard fetch unavailable — open the file"); return; }
          try {
            const res = await fetchImpl(file);
            if (!res.ok) throw new Error("HTTP " + res.status);
            copyText(await res.text(), label);
          } catch (err) {
            showToast("Could not read file — open it instead");
          }
        }
        function wireFileCopyButtons(scope) {
          scope.querySelectorAll("[data-copy-file]").forEach((btn) => {
            btn.addEventListener("click", () => {
              copyFromFile(btn.getAttribute("data-copy-file"), btn.getAttribute("data-copy-label") || "File");
            });
          });
        }
        const frameCard = (item, badge) => `
          <article class="xr-card">
            <div class="xr-frame">
              <iframe loading="lazy" tabindex="-1" title="${esc(item.name)} — live preview" src="${esc(item.file)}"></iframe>
              <a class="xr-veil" href="${esc(item.file)}" target="_blank" rel="noopener" aria-label="Open ${esc(item.name)} as a full page"><span>Open full page ↗</span></a>
            </div>
            <div class="xr-body">
              <div class="xr-line">
                <h3 class="xr-name f-display">${esc(item.name)}</h3>
                ${badge ? `<span class="xr-badge f-mono">${esc(badge)}</span>` : ""}
              </div>
              <p class="xr-best">${esc(item.bestFor || "")}</p>
              <div class="xr-actions">
                <button type="button" class="chip f-mono rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.14em]" data-copy-file="${esc(item.file)}" data-copy-label="${esc(item.name)}">⧉ Copy code</button>
                <a class="chip f-mono rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.14em]" href="${esc(item.file)}" target="_blank" rel="noopener">Open ↗</a>
              </div>
            </div>
          </article>`;

        /* ---- Theme switcher ---- */
        function kebab(key) { return key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()); }
        function systemCss(sys) {
          const lines = [":root {"];
          Object.keys(sys.tokens || {}).forEach((k) => {
            lines.push(`  --${kebab(k)}: ${sys.tokens[k]};`);
          });
          lines.push("}");
          return lines.join("\n");
        }
        function buildSystems(systems) {
          const host = document.getElementById("xr-swatches");
          const preview = document.getElementById("xr-preview");
          const meta = document.getElementById("xr-sys-meta");
          if (!host || !preview || !meta || !systems.length) return;
          let current = systems[0];
          function paint(sys) {
            current = sys;
            const t = sys.tokens || {};
            preview.style.setProperty("--x-bg", t.bg || "#070709");
            preview.style.setProperty("--x-surface", t.surface || "#0d0d12");
            preview.style.setProperty("--x-elevated", t.elevated || "#12121a");
            preview.style.setProperty("--x-ink", t.ink || "#f4f2ec");
            preview.style.setProperty("--x-muted", t.mutedInk || "#8e8d8a");
            preview.style.setProperty("--x-hairline", t.hairlineStrong || t.hairline || "rgba(244,242,236,0.24)");
            preview.style.setProperty("--x-accent", t.accent || "#ff3d00");
            preview.style.setProperty("--x-on-accent", t.onAccent || "#160800");
            host.querySelectorAll(".xr-swatch").forEach((btn) => {
              const on = btn.getAttribute("data-sys") === sys.id;
              btn.classList.toggle("is-on", on);
              btn.setAttribute("aria-pressed", on ? "true" : "false");
            });
            const a = sys.audit || {};
            const fmt = (pair) => (pair && typeof pair.ratio === "number") ? `${pair.ratio.toFixed(2)}:1 ${pair.grade}` : "—";
            meta.innerHTML = `
              <p class="xr-sys-name f-display">${esc(sys.name)} <span class="xr-badge xr-cat f-mono">${esc(sys.mode || "")}</span></p>
              <p class="xr-sys-role">${esc(sys.role || "")}</p>
              <p class="xr-sys-audit f-mono">ink/bg ${fmt(a.inkOnBg)} · muted/bg ${fmt(a.mutedOnBg)} · accent/bg ${fmt(a.accentOnBg)}</p>`;
          }
          host.innerHTML = systems.map((sys) => `
            <button type="button" class="xr-swatch" data-sys="${esc(sys.id)}" aria-pressed="false">
              <span class="xr-triple" aria-hidden="true"><span style="background:${esc(sys.tokens && sys.tokens.bg)}"></span><span style="background:${esc(sys.tokens && sys.tokens.ink)}"></span><span style="background:${esc(sys.tokens && sys.tokens.accent)}"></span></span>
              <span class="xr-swatch-name f-mono">${esc(sys.name)}<span class="xr-swatch-mode">${esc(sys.mode || "")}${sys.audit && sys.audit.inkOnBg ? " · ink/bg " + sys.audit.inkOnBg.grade : ""}</span></span>
            </button>`).join("");
          host.addEventListener("click", (event) => {
            const btn = event.target.closest("[data-sys]");
            if (!btn) return;
            const sys = systems.find((item) => item.id === btn.getAttribute("data-sys"));
            if (sys) paint(sys);
          });
          const cssBtn = document.getElementById("xr-copy-css");
          const jsonBtn = document.getElementById("xr-copy-json");
          if (cssBtn) cssBtn.addEventListener("click", () => copyText(systemCss(current), current.name + " — CSS variables"));
          if (jsonBtn) jsonBtn.addEventListener("click", () => copyText(JSON.stringify(current, null, 2), current.name + " — JSON"));
          paint(current);
        }

        /* ---- Fetch the manifest once, render everything ---- */
        if (!fetchImpl) {
          const err = document.getElementById("xr-error");
          if (err) err.hidden = false;
          return;
        }
        fetchImpl("registry.json")
          .then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); })
          .then((reg) => {
            const tHost = document.getElementById("xr-templates");
            if (tHost) tHost.innerHTML = (reg.templates || []).map((t) => frameCard(t, "template")).join("");
            const fHost = document.getElementById("xr-fx");
            if (fHost) fHost.innerHTML = (reg.fx || []).map((f) => frameCard(f, f.fps ? f.fps + "fps" : "fx")).join("");
            const sHost = document.getElementById("xr-motion");
            if (sHost) {
              sHost.innerHTML = Object.values(reg.snippets || {}).map((s) => `
                <article class="xr-snippet">
                  <div class="xr-line">
                    <h3 class="xr-name f-display">${esc(s.name)}</h3>
                    <span class="xr-badge xr-cat f-mono">${esc(s.category || "interaction")}</span>
                  </div>
                  <p class="xr-best">${esc(s.description || "")}</p>
                  <div class="xr-actions">
                    <button type="button" class="chip f-mono rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.14em]" data-snippet-id="${esc(s.id)}">⧉ Copy code</button>
                    <span class="xr-lang f-mono">${esc(s.language || "html")}</span>
                  </div>
                </article>`).join("");
              sHost.querySelectorAll("[data-snippet-id]").forEach((btn) => {
                btn.addEventListener("click", () => {
                  const snippet = (reg.snippets || {})[btn.getAttribute("data-snippet-id")];
                  if (snippet && snippet.code) copyText(snippet.code, snippet.name);
                });
              });
            }
            buildSystems((reg.color && reg.color.systems) || []);
            wireFileCopyButtons(root);
          })
          .catch(() => {
            const err = document.getElementById("xr-error");
            if (err) err.hidden = false;
          });
      })();

    })();
