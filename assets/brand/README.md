# NIRIKSHAK — Brand & Logo Suite (निरीक्षक)

**Product:** NIRIKSHAK — Legal Metrology Inspection Workstation (SIH26034)
**Status:** Team-lead review — 4 original mark concepts + custom wordmark, all hand-built vector
**Date:** 13 September 2026

---

## 1. Design Positioning

> **Instrument, not crest.** The site masthead already carries the State Emblem of India — sovereign
> authority is represented there. The NIRIKSHAK mark is the *instrument of inspection*: it says how
> the work is seen, never who authorizes it. The Emblem says *who*; NIRIKSHAK says *how*.

The identity fuses the three meanings of the name (nirīkṣak — inspector/observer):
**observing** (the inspector's gaze, computer vision, OCR) · **measuring** (legal metrology:
weights, font heights, tolerances) · **sovereign trust** (evidence integrity, human-in-the-loop).

The mood takes *warmth only* from the reference image that inspired this exercise (soft pastel
aurora, circular emblem, Indian cultural resonance) — every mark below is an original composition;
nothing structural (chariot, script lettering, ring-as-container) was copied.

## 2. The Four Mark Concepts

| # | File | Name | Story |
|---|------|------|-------|
| A | `svg/nirikshak-mark-tula-netra.svg` | **Tula Netra** (Eye of the Scales) | An eye whose straight upper lid is a balance beam; two pans hang from its ends and the iris hangs from its centre like a plumb bob. Fairness (tula), vision (netra) and measurement (plumb) in one silhouette. |
| B | `svg/nirikshak-mark-drishti-chakra.svg` | **Drishti Chakra** (Seeing Wheel) | A measuring dial with 24 graduation ticks encircles an Ashoka-chakra spoke rhythm whose void hub forms a lens around a saffron pupil. Statutory India + optical inspection. Best favicon/app-icon geometry. |
| C | `svg/nirikshak-mark-mudra-seal.svg` | **Mudra Seal** (Verified Weight Seal) | A government-style double-ring seal holding the standard verification weight stamped with a compliance check. **Placement:** dossiers, Form-1 PDFs, certificate footers — an officer-seal metaphor, not a masthead crest (it would compete with the State Emblem's job). |
| D | `svg/nirikshak-mark-level-eye.svg` | **Level Eye** (Instrument) | A spirit level read as an eye: the true line of the standard is the lower lid, the calm arc of the gaze above, and the verification iris resting *exactly within tolerance*. Two primitives, the strongest 16-px mathematics. |

## 3. Wordmark

- `svg/nirikshak-wordmark.svg` — custom monoline geometric capitals, hand-drawn as SVG paths
  (no webfont; renders identically offline in Mode B). **NIR** in sovereign navy `#0A192F`,
  **IKSHAK** in active indigo `#1E3A8A`, and the second **I** carries the signature
  *seeing-tittle*: an emerald iris ring with a saffron pupil floating above the stem.
- `svg/nirikshak-wordmark-duo.svg` — binocular variant: both I letters carry iris rings
  (two eyes, one gaze).
- `svg/nirikshak-wordmark-onDark.svg` — white/soft-indigo for dark surfaces.

## 4. Lockups, Icon, Banners

| File | Use |
|------|-----|
| `svg/nirikshak-logo-horizontal.svg` (+ `-onDark`) | Primary lockup — headers, README, documents |
| `svg/nirikshak-logo-stacked.svg` | Centered splash, login, presentation title slides |
| `svg/nirikshak-icon.svg` | App icon / favicon (legible 16 px → 1024 px) |
| `svg/nirikshak-banner-hero.svg` | README hero — Tula Netra in a fine broken ring over the aurora pastels, four verdict dots (PASS · REVIEW · FAIL · UNABLE_TO_VERIFY) |
| `svg/nirikshak-banner-hero-dark.svg` | Dark-mode hero (`#071526` masthead navy) |

`png/` holds pre-exported rasters (banner 1600×640, marks 928–1024 px, wordmark 1500 px,
lockup 1224 px, icon 1024 px). `brand-sheet.html` is the one-page visual review of the whole suite.

## 5. Palette (canonical tokens)

| Role | Hex |
|------|-----|
| Sovereign navy (structure) | `#0A192F` (deep masthead `#071526` for dark surfaces) |
| Active indigo (IKSHAK, spokes) | `#1E3A8A` |
| India saffron (pupil, tittle dot, register dots) | `#FF9933` |
| Verification emerald (iris rings, check) | `#059669` / bright `#10B981`, `#34D399` on dark |
| Slate neutrals (taglines, ticks) | `#334155` `#64748B` `#94A3B8` |
| Aurora pastels (banners only) | `#FFE1B3` `#F7C9DE` `#DCCEF8` `#BFE8DE` |

Verdict colors always follow the product tokens: PASS `#059669` · REVIEW `#D97706` ·
FAIL `#DC2626` · UNABLE `#64748B`.

## 6. Usage Rules

1. **State Emblem coexistence:** never redraw, enclose, merge with, or substitute the Emblem.
   Masthead order stays: State Emblem → NIRIKSHAK wordmark → descriptor.
2. **Clear space:** keep ≥ ¼ of mark height on all sides; never place the aurora behind dense UI.
3. **Saffron discipline:** saffron appears only as pupils, tittle dots and register dots —
   never as thin strokes or text (contrast).
4. **The seal is a stamp,** not a logo: use Concept C on evidentiary documents, not in navigation.
5. **No tinting, gradients-on-letterforms, shadows, or rotation of the marks.**
   The beam never tilts — level is the point.
6. Claim-safe tagline pool: *"The inspector's augmented eye."* · *"Every label inspected.
   Every judgment human."* · *"Precision assists. The officer decides."*
   Never imply autonomous enforcement authority.

## 7. Avoid-List

Shields, gavels, Lady Justice, scales-of-justice clipart, magnifying glasses over documents,
police-badge crests/stars/ribbons, detective clipart, globes, brain-circuit AI heads, padlocks,
all-seeing-eye pyramids, lashes/eyebrows on the eye, chakra-mimicking spoke counts, tricolor flag
replication, statutory citations inside the mark, and anything echoing the Saarthi reference
(chariots, brush-script logotypes).

## 8. Provenance

All assets are 100% original, hand-composed SVG (no AI-raster generation, no stock, no clipart)
created for this repository on 13 Sep 2026. Concept directions were explored with an AI design
agent; final geometry, letterforms and palette mapping were hand-authored against the canonical
tokens in `VISUAL_IDENTITY_GUIDE.md` and `09_UI_UX_BLUEPRINT.md`. License: Apache-2.0 (project).
