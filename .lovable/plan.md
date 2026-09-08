# Ocean Wonders — Build Plan

A tablet-first React kids app (ages 4–8) built on the existing TanStack Start stack. Mock auth, local progress in localStorage, and stand-in creature illustrations generated up front.

## Scope

- Splash → Onboarding (4) → Login → Register → Globe → 5 Ocean Dive Scenes → Creature Modal → Matching Game (per ocean).
- All 5 oceans fully populated (5 creatures each = 25 creatures).
- Mock auth: form UI validates, "account" saved to localStorage; no backend.
- Progress ("My Discoveries", badges, matches) in localStorage keyed by nickname.

## Design system

- Tailwind v4 tokens in `src/styles.css`: ocean-blue, deep-navy, coral, sunshine, seafoam, bubble-white, sandy-beige. Gradients as CSS vars.
- Fonts via `<link>` in `__root.tsx`: Fredoka (display) + Nunito (body).
- Global utility classes: `.bubble-btn` (pill, bounce), `.card-rounded`, `.glow-outline`, tinted shadows.
- Animation via Framer Motion (`bun add framer-motion`): idle bob, wiggle on tap, spring modal, page transitions. Bubbles = CSS keyframes.
- Confetti via `canvas-confetti`.
- Drag & drop via `@dnd-kit/core` (touch-friendly, generous hitboxes).

## Assets

Up-front generation with `imagegen--generate_image` (fast tier):
- 1 hero mascot (baby sea turtle) — reused on splash/onboarding/register.
- 5 avatar icons (turtle, dolphin, seahorse, octopus, clownfish, crab) — transparent PNG.
- 5 ocean background illustrations (Pacific reef, Atlantic kelp, Indian turquoise, Arctic ice, Southern iceberg).
- 25 creatures × 2 variants (full-color + silhouette), transparent PNG, consistent 512×512 framing so silhouette→color melt aligns.
- 1 globe illustration (starfield with glowing ocean zones).

All saved under `src/assets/` and imported directly (small enough set; skip lovable-assets CDN unless size becomes an issue).

## Data model

`src/data/oceans.ts` — single source of truth:
```ts
type Creature = { id, name, funFact, colorImg, silhouetteImg };
type Ocean = { id, name, tagline, accent, iconCreatureId, bgImg, creatures: Creature[] };
export const OCEANS: Ocean[] = [...5 oceans...];
```

`src/lib/progress.ts` — localStorage helpers: `getProfile()`, `saveProfile()`, `addDiscovery(id)`, `getDiscoveries()`, `unlockBadge(oceanId)`.

## Routes (TanStack file-based)

- `index.tsx` — Splash (auto-advance 2.5s or tap).
- `onboarding.tsx` — 4-slide swiper with dot pagination + Skip.
- `login.tsx`, `register.tsx` — sandy-beige card forms, mock validation.
- `globe.tsx` — main hub (auth-gated via localStorage check → redirect to /login if no profile).
- `ocean.$id.tsx` — Dive Scene for one ocean (5 creatures, parallax bubbles, tap → modal).
- `ocean.$id.game.tsx` — Matching Game for that ocean.

Each route gets its own `head()` with unique title/description/og.

## Components

- `SplashScreen`, `OnboardingSlide`, `AuthCard`, `AvatarPicker`
- `Globe` (CSS-3D rotating sphere with 5 positioned ocean buttons)
- `OceanScene` (parallax layers, bubble emitter, creature slots)
- `CreatureSprite` (idle bob, tap handler, glow)
- `CreatureModal` (spring-in, fun-fact bubble, add-to-discoveries star)
- `MatchingGameBoard` + `DraggableSilhouette` + `DropTarget` (@dnd-kit)
- `Confetti`, `ProgressBadge`, `BubbleButton`, `BackBubble`, `BubbleField` (bg animation)

## Interaction & UX rules baked in

- Tap targets ≥ 48px; drop hitboxes generous (snap when within ~60px).
- No failure states: wrong drop = spring back + mascot hint; after 2 misses, correct target pulses.
- Nickname personalization pulled from profile on Globe & completion screens.
- Back nav = bubble arrow, top-left, on every non-hub screen.

## Technical

- Install: `framer-motion`, `@dnd-kit/core`, `@dnd-kit/utilities`, `canvas-confetti`, `@types/canvas-confetti`.
- Update `src/routes/__root.tsx`: add Google Fonts `<link>` (Fredoka + Nunito), keep shell.
- Update `src/styles.css`: add color tokens, font families, keyframes (bob, wiggle, bubble-rise, sonar-ping), utility classes.
- Replace placeholder `src/routes/index.tsx` with SplashScreen.
- No backend, no Lovable Cloud enabled.

## Deliverable order (single build pass)

1. Install deps + design tokens + fonts.
2. Generate all art assets in parallel.
3. Data file + progress helpers.
4. Shared components (BubbleButton, BubbleField, BackBubble, Confetti).
5. Route screens in order: splash → onboarding → auth → globe → dive scene → modal → matching game.
6. Wire route guards, verify build, smoke-test in preview with Playwright screenshots of each screen.

## Out of scope (call out to user)

- Real audio (structured for later wiring only).
- Real backend/cloud sync of progress across devices.
- Parent settings panel beyond profile bubble stub.
