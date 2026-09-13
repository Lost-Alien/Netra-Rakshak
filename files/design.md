# design.md — Netrya Rakshak website design system

**Read this file first. Adhere strictly to these tokens and constraints. Do not invent a new
layout style, do not add unrequested decorative elements, and do not deviate from this palette,
type system, or component list.**

## 0. Design intent (read before anything else)

This is a clinical screening tool for a government-adjacent rural healthcare deployment (SIH
2026 / MathWorks PS 26038), not a consumer SaaS product. The visual reference point is a
**well-designed medical/clinical or public-health site** — restrained, high-contrast, editorial,
evidence-led — not an "AI startup" landing page. If a design decision would look at home on a
generic AI-wrapper SaaS landing page, it is wrong for this project.

Concretely: prefer the visual register of a medical journal or a well-typeset research report
over the visual register of a Y Combinator startup homepage.

## 1. Color palette — exactly these colors, nothing else

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#12314F` | Primary text, headings, nav |
| `--teal` | `#0F6F6A` | Primary accent — links, primary buttons, active states |
| `--paper` | `#FFFFFF` | Primary background |
| `--paper-alt` | `#F4F1EA` | Alternating section background (used for rhythm INSTEAD of borders) |
| `--gray` | `#5B6472` | Secondary/body text on paper |
| `--gray-line` | `#DDD8CC` | The ONLY border/divider color, used sparingly (see Section 4) |
| `--amber` | `#C1652F` | Reserved EXCLUSIVELY for referable-DR / alert indicators. Never decorative. |
| `--green` | `#3F7D5C` | Reserved EXCLUSIVELY for "no referral needed" / healthy indicators. Never decorative. |

Banned: purple, magenta, neon blue, any gradient with more than 2 stops, any gradient used
purely decoratively (glows, blobs, ambient background washes). Gradients are allowed only as a
subtle 2-stop shift within the same hue for a single CTA button background — nothing else.

## 2. Typography — exactly two families

- **Headings**: a serif with editorial authority — `Source Serif 4` or `Lora`. Weights: 400, 600.
- **Body / UI / data**: a clean humanist sans — `Inter` or `IBM Plex Sans`. Weights: 400, 500, 600.
- Do not introduce a third font for "accent" text, monospace numbers, or badges — reuse the two above.
- Modular scale, base 18px body / 1.25 ratio: 18 → 22.5 → 28 → 35 → 44 → 55px.
- Headings are set in the serif at 600 weight, sentence case (not Title Case, not ALL CAPS).
- Line length: cap body text at ~65-75 characters per line.

## 3. Spacing & layout philosophy

- Base unit: 8px. All spacing is a multiple of it.
- Vertical rhythm between major sections: 96px mobile / 140px desktop. This is the PRIMARY tool
  for separating sections — not borders, not background-color card blocks around every element.
- Layout is **asymmetric and editorial**, not a centered-column-of-symmetric-cards template.
  Vary section layout: some full-bleed image + text side-by-side, some centered narrow text,
  some full-width data displays. No two consecutive sections should use an identical grid.
- Max content width 1200px for text-heavy sections; images/diagrams may run wider.

## 4. The anti-slop rules (non-negotiable)

- **Do not overuse cards.** A card (bordered/shadowed box) is justified only for the sample-image
  picker in the demo, where distinguishing separate clickable items is the actual function. Do
  NOT wrap stats, pipeline stages, or paragraphs in cards "for visual interest."
- **Do not put decorative borders between every section.** Use whitespace and `--paper-alt`
  background alternation instead. `--gray-line` may be used for exactly one purpose: thin
  hairlines inside the demo/data UI (e.g., separating a table's rows), never as a full-width
  section divider.
- **No redundant subheadings.** Never write a heading and then a subheading that just restates
  it ("How It Works" / "See how our system works"). Every heading is followed directly by
  substantive content.
- **No generic AI-slop visual tropes**: no purple/blue ambient gradients, no floating abstract
  3D blobs or glass orbs, no glowing neural-network stock graphics, no stock photos of diverse
  people smiling at laptops, no fake "Trusted by" logo bars, no autoplaying hero carousels, no
  emoji used as functional icons.
- **Use real pipeline output as imagery, not stock/decorative graphics.** The hero image, the
  "how it works" section, and the demo are illustrated with actual fundus images, actual
  segmentation overlays, and actual Grad-CAM heatmaps this project produced — never abstract
  AI-themed decoration standing in for the real thing. This is both more honest and instantly
  reads as less generic than any stock visual could.
- **No 3x2 icon-in-a-circle feature grid** for the five pipeline modules. They are five
  sequential, dependent stages — present them as a sequence (see Section 5, Pipeline component),
  not as a set of interchangeable "features."
- Motion: minimal and purposeful only (e.g., a before/after overlay toggle in the demo, a smooth
  scroll anchor). No parallax, no looping background animation, no decorative micro-interactions
  that don't serve a real function.

## 5. Component vocabulary — use only these, do not invent others

1. **Stat callout** — a large serif number + one-line label underneath, no icon, no card, no
   border. Used for real metrics (sensitivity target, population figures) with a small citation
   in `--gray` beneath.
2. **Pipeline stage** — used exactly five times, one per module, in a single connected sequence
   (numbered, connected by a thin line or arrow — reuse the visual language of the pipeline
   diagram already built for this project). Each stage: number, short title, one substantive
   sentence. Not a card grid.
3. **Evidence panel** — an image display with an overlay-toggle or before/after slider (original
   → enhanced → segmented → Grad-CAM). This is the core visual unit of the demo section.
4. **Data table** — for the ablation/benchmark numbers, a plain, well-typeset table with
   `--gray-line` row hairlines. Not a "pricing table"-style bordered card set.
5. **Primary button** — solid `--teal` fill, white text, no gradient, no shadow, no icon unless
   functionally necessary (e.g., an upload icon on the demo CTA).

## 6. Tone of voice (for whoever writes the copy)

Direct, specific, evidence-led. Lead with a real number or a real clinical fact, not a
mission-statement adjective ("revolutionary," "seamless," "empowering"). Avoid marketing
superlatives entirely — this reads as a credible engineering/clinical project, not a pitch deck
for a consumer app.
