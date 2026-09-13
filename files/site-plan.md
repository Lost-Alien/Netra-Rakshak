# site-plan.md — Netrya Rakshak website: content architecture & build spec

Companion to `design.md`. This file defines *what* goes on the site and how the embedded demo
functions; `design.md` defines *how it looks*. Read both before generating anything.

## 0. Site structure

One primary long-form scrolling page (`/`), plus one secondary page for depth-seekers.
Do not split the primary page into a multi-page nav with 6 separate menu items — that produces
the generic "SaaS site" navigation pattern this project is explicitly avoiding.

- `/` — Home: Hero → Problem → How it works → Live demo → Explainability → Validation/Impact →
  Team → Footer
- `/research` — the full technical plan (renders the existing project markdown plan as a clean
  long-form reading page; reuses body typography only, no new components)

## 1. Section-by-section spec (home page)

### Hero
- Headline is a real clinical fact, not a product tagline. e.g. a stat-led headline such as:
  "1 ophthalmologist per 100,000 rural patients. 90% of the vision loss this causes is
  preventable — if caught early."
- Sub-line: one sentence naming the product and what it does (screens retinal images for
  diabetic retinopathy at the point of care, explains its own reasoning).
- Visual: a real fundus image with its Grad-CAM overlay toggled on, large, right-aligned or
  full-bleed — not a hero illustration or abstract graphic.
- Two CTAs: primary "Try the live demo" (scrolls to demo section), secondary "Read the technical
  plan" (links to `/research`).

### Problem
- Three real, cited stats laid out as an editorial row (see Stat callout component) — NOT three
  icon cards. Suggested three: ophthalmologist-to-population ratio, % of rural fundus images
  that fail quality thresholds in the field, and the population scale (India's diabetes
  prevalence). Cite sources in small type under each (ICMR-INDIAB, NPCB&VI, etc.).

### How it works
- The five-stage pipeline as a single connected horizontal (desktop) / vertical (mobile)
  sequence using the Pipeline stage component: Quality Gate → Segmentation → Hybrid Grading →
  Explainability → Human Review.
- Each stage gets one real, substantive sentence — not a restated title. Example of what NOT to
  write: heading "Quality Gate" followed by subheading "Checks image quality." Instead: heading
  "Quality Gate" followed directly by "Scores every image for focus, illumination, and field of
  view, and either enhances or rejects it with specific recapture feedback before it ever
  reaches the model."

### Live demo (the centerpiece — build this carefully)
**Interaction model**: the visitor picks from a small curated set of real sample images (not a
free-text upload) and sees the actual pipeline output for that image, computed offline by the
MATLAB pipeline and stored as static assets.

- **Sample picker**: 4 thumbnails — this is the one place a card/bordered-item pattern is
  justified (Section 4 of design.md). Recommended set: (1) a borderline-quality image that gets
  the "enhanced" treatment, (2) a Grade 0 (healthy) result, (3) a Grade 2 referable result, (4) a
  Grade 4 severe result. Label each thumbnail with its ground-truth source dataset (e.g. "IDRiD
  sample"), not a fake patient name.
- **Evidence panel**: on selecting a sample, show:
  1. Quality-gate verdict (pass / enhanced / would-reject, with the reason)
  2. The image with a toggle: Original ⇄ Segmentation overlay ⇄ Grad-CAM heatmap (use an
     overlay-toggle or slider, not three separate static images side by side)
  3. ICDR grade, calibrated confidence, and referral flag (amber if referable, green if not —
     the only two places `--amber`/`--green` are used)
  4. The lesion-evidence correlation score, with one sentence explaining what it means
- **Honesty label**: a small, clearly visible caption under the demo: "Results shown are
  pre-computed by our MATLAB pipeline on validated sample images from APTOS/IDRiD. Live upload
  of new images is [available / a planned next step] — see note below." Do not imply real-time
  inference on arbitrary uploads unless it is actually wired up (see Section 3).

### Explainability
- One real annotated example, larger format, walking through: here is what the model attended
  to (Grad-CAM), here is what a human segmented independently (lesion mask), here is the overlap
  score, here is why that lets a doctor decide in under 30 seconds. This is prose + one big
  evidence panel, not another feature grid.

### Validation / Impact
- Stat callouts (large serif numbers) for: sensitivity/specificity targets, quadratic weighted
  kappa if you have a result, and the population-scale numbers from your PPT (with the same
  citations used there). A plain data table (Section 5 component) for the ablation comparison
  (classical-only vs CNN-only vs hybrid) once you have real numbers — do not fabricate numbers
  ahead of having them; use "target" language until you do.

### Team
- Team name and members, plain text, no stock avatar placeholders if photos aren't ready.

### Footer
- Links: GitHub repo, `/research` page, dataset citations, SIH 2026 / PS 26038 / MathWorks line.

## 2. Tech stack recommendation

Keep it static and dependency-light so it's fast, reliable during judging, and free to host:

- **Framework**: plain HTML/CSS/JS, or Astro if you want components without a heavy client
  bundle. Avoid a full SPA framework (Next.js/full React app) unless the team is already fluent
  in it — it adds build complexity you don't need for a mostly-static site.
- **Demo data**: pre-render every sample's outputs offline in MATLAB (segmentation overlay PNGs,
  Grad-CAM overlay PNGs, and a small JSON per sample with grade/confidence/lesion counts/
  correlation score). The frontend just reads these static files — **no backend server required**
  for the default demo, which means nothing can go down mid-pitch.
- **Hosting**: GitHub Pages, Vercel, or Netlify — free, static, reliable.
- **Stretch goal — true live upload**: only attempt this after the static version is solid.
  Requires exporting the trained model to ONNX, standing up a small FastAPI/Flask endpoint on a
  free tier (Render/Railway), and calling it from the frontend. Treat this as clearly separate,
  optional work that must not put the core showcase at risk if it breaks.

## 3. Non-negotiable technical constraints

- Fully responsive — assume judges may open this on a phone.
- No layout-shift-causing lazy loads on the hero; keep initial load fast (this is a static site,
  it should load in well under a second on a normal connection).
- Real `alt` text on every medical image (accessibility, and it's the right thing to do for
  clinical content).
- No autoplaying video or audio anywhere.
- Respect `prefers-reduced-motion` for the overlay-toggle transitions.
