---
name: SpendWise
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#b90538'
  on-tertiary: '#ffffff'
  tertiary-container: '#dc2c4f'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  numeric-xl:
    fontFamily: Geist Mono
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.03em
  numeric-lg:
    fontFamily: Geist Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.02em
  numeric-md:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Geist Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---
## Design Reference

The application's UI was designed in Google Stitch.

Stitch prototype:
[<YOUR_STITCH_LINK>](https://stitch.withgoogle.com/u/2/preview/12301236566679336730?node-id=ff8e2faa5af449998509944cfa61e94d&raw=1&pli=1)

Use this prototype as the visual reference when implementing UI.

`DESIGN.md` is the authoritative source for design tokens,
colors, typography, spacing, borders, radius, and other design-system rules.

> **Reconciliation note (2026-09-30).** The prose below was corrected to match the
> Stitch export in `ref/code.html`, which is the artefact the design was actually
> generated from. The export contradicted the earlier prose on six tokens —
> primary colour, dark canvas, dark card, numeral typeface, card radius and the
> desktop breakpoint — and in every case the export agreed with `docs/PRD.md`
> and `docs/design_system.md` rather than with the prose. `ref/` is read-only
> reference material and is never modified.


## Brand & Style

The design system embodies institutional precision, financial clarity, and deliberate restraint. Built for discerning individuals managing complex cash flows, liquidity, and personal balance sheets, it projects absolute stability and architectural calm. 

The aesthetic is anchored in a precision-engineered hybrid of modern corporate minimalism and technical dashboard utility:
- **Tone:** Unflappable, bank-grade, discreet, highly analytical.
- **Visual Stance:** Zero decorative gradients, no cartoonish illustrations, and no gratuitous rounded pill buttons. Spatial decisions are calculated, borders are structural, and typographic alignment mirrors ledger-level rigor.
- **Tactility:** Crisp flat surfaces, structural hairlines, and clear visual hierarchy driven by value contrast and typography rather than blurred elevations.

## Colors

The palette is engineered to present financial data with high legibility and unambiguous intent.

### Roles & Semantic Application
- **Primary (`#00685F` - Deep Emerald Teal):** Primary actions, positive growth metrics, inflows, interest accruals, active balance highlights. The UI references this through the Tailwind `teal` ramp — `teal-700` (`#0F766E`) is the primary action fill, `teal-800` (`#115E59`) is its hover, `teal-600` (`#0D9488`) is the accent stroke, and `teal-50` (`#F0FDFA`) is the subtle selected/tinted surface.
- **Secondary (`#0F172A` - Slate Navy):** Structural elements, heavy display type, interactive selection states in light mode; serves as the tonal base in dark mode.
- **Tertiary (`#F43F5E` - Rose Coral):** Debit outlays, downward balance adjustments, negative deltas, critical alerts, friction gates. Signed spend amounts render in `rose-600` (`#E11D48`); destructive confirmations use the solid `rose-500` (`#F43F5E`).
- **Neutral (`#64748B` - Slate):** Secondary labels, metadata, inactive icons, hairline dividers.
- **Positional accents:** `emerald-600` (`#059669`) inflow and positive variance · `amber-500`/`amber-600` (`#D97706`) near-limit warning · `indigo-500` (`#6366F1`) technology & cloud category tags.

### Theme Execution
- **Pristine Light Mode:**
  - Base canvas: `#F8FAFC` (Slate-50)
  - Surface cards: `#FFFFFF` (Pure White)
  - Structural Hairlines: `#E2E8F0` (Slate-200)
  - Text Primary: `#0F172A` (Slate-900)
  - Text Secondary: `#64748B` (Slate-500)
- **Rich Obsidian Dark Mode:**
  - Base canvas: `#0B121E` (Deep Slate)
  - Surface cards: `#111A2C` (Deep Ink Tint)
  - Elevated panels: `#0D1524`, with a `#1E2C44` structural hairline
  - Input / chip surfaces: `#162033`, with a `#27354D` hairline
  - Row hover: `#1A253B`
  - Structural Hairlines: `#1E293B` (Slate-800)
  - Text Primary: `#F8FAFC` (Slate-50)
  - Text Secondary: `#C7D2E0`-to-`#94A3B8` (three muted steps: `#CBD5E1`, `#94A3B8`, `#64748B`)
  - Tinted dark surfaces: teal `bg #072522` / border `#0F4B44` · rose `bg #23111B` / border `#4C1D29`

### Implementation Rule — Semantic Tokens, Not Palette Overrides

Dark mode is **not** implemented by overriding raw palette classes (e.g. `.dark .bg-slate-50 { ... !important }`). Such overrides silently break any newly added class. Instead every colour above is exposed as a CSS custom property inside the Tailwind `@theme` block, the `.dark` class redefines those properties, and components consume semantic utilities only (`bg-surface`, `bg-card`, `border-hairline`, `text-fg`, `text-fg-muted`, `bg-brand`, `text-positive`, `text-negative`). Consequence: a new component is correct in both themes with no theme-specific code.

## Typography

Typography prioritizes density, geometric cohesion, and data alignment.

- **Interface Primary (`Geist`):** Delivers clean optical kerning, neutral proportions, and high readability in both narrative text and tight data matrices. All body text leverages tabular lining figures (`font-variant-numeric: tabular-nums`) by default.
- **Financial Ledger & Data (`Geist Mono`):** Applied to monetary figures, account identifiers, transaction hashes, timestamps, and compact status badges. Fixed widths ensure vertical alignment across dense tables and transaction streams. Every numeric style resolves to `font-family: 'Geist Mono', monospace` with `font-variant-numeric: tabular-nums lining-nums`.
- **Hierarchical Discipline:** Display styles are kept sharp and tight. All labels under 14px default to monospaced uppercase tracking for rapid optical parsing.
- **Iconography:** **Material Symbols Outlined** (variable font, `FILL 0`/`1` axis) — not Lucide. Navigation and status icons use `FILL 1` when active, `FILL 0` when idle. Loaded as a webfont; no icon package is installed.

## Layout & Spacing

A disciplined, modular grid system designed to support complex dashboards without visual clutter.

### Grid Architecture
- **Desktop (≥ 1024px):** 12-column fluid grid locked to a max width of `1440px`. Column gutter is `1.5rem` (`24px`), with outer canvas padding of `2rem` (`32px`). Metric strips collapse to 4 columns at the `lg` breakpoint (`1024px`).
- **Tablet (768px - 1023px):** 8-column layout with `1.5rem` gutters and `1.5rem` margins. Metric strips render as 2 columns; side panels collapse into contextual slide-overs or tabbed stacks.
- **Mobile (< 768px):** 4-column layout with `1rem` (`16px`) gutters and margins. Tables convert to grouped card rows.

### Rhythmic Discipline
Layout spacing uses an exact 8-point system (scaled with 4-point micro-increments via `space-xs`). Dashboards favor clean, equal cell heights, strict edge-to-edge container rules, and vertical stacking that groups related metrics into cohesive financial modules.

## Elevation & Depth

This design system deliberately rejects heavy, diffuse drop-shadows and neomorphic extrusion in favor of **Tonal Hairline Layering**.

- **Structural Borders:** Hierarchy is established through continuous 1px hairline rules (`slate-200` in light mode, `slate-800` in dark mode). Surfaces do not cast diffuse light; they sit atop one another like machined plates.
- **Surface Layering:**
  - *Tier 0 (Canvas):* Light `#F8F9FF` / Dark `#0B121E`
  - *Tier 1 (Cards, Modules, Sidebars):* Light `#FFFFFF` / Dark `#111A2C`
  - *Tier 2 (Popovers, Tooltips, Menus):* Light `#FFFFFF` / Dark `#1E293B`, paired with an ultra-subtle, sharp drop shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.08)` (Light) or `0 4px 16px -2px rgba(0, 0, 0, 0.5)` (Dark).
- **Z-Index Modality:** Active flyouts and command palettes introduce a calibrated slate backdrop overlay (`rgba(15, 23, 42, 0.4)` / `rgba(2, 6, 23, 0.75)`) with an absolute minimal 2px backdrop blur (`backdrop-blur-sm`).

## Shapes

The geometric approach follows a crisp, architectural logic. Sharp enough to feel solid and engineered, with micro-radii to prevent harsh display aliasing.

- **Base Radius (0.25rem / 4px):** Applied to status chips, inline code markers, and micro-badges. `rounded-md` (6px) is the slightly roomier badge used for budget state pills.
- **Tile Radius (0.5rem / 8px):** Applied to the small square category icon containers (32px and 36px variants) inside ledger rows and budget cards.
- **Container Radius (0.75rem / 12px):** Applied to panels, form inputs, selects, secondary cards and category sub-cards (`rounded-xl`).
- **Card Radius (1rem / 16px):** The structural default for metric cards, ledger cards, budget cards and modal dialogues (`rounded-2xl`).
- **Shell Radius (1rem / 16px):** Reserved for global viewport frames and primary system overlays.
- **Pill Radius Exception:** `rounded-full` is used deliberately for filter chips, avatars, micro-dots and the segmented spend bar — pill geometry is a data affordance here, not decoration. It is never used for primary action buttons.

## Components

### Buttons
- **Primary:** Solid `#0F766E` (Teal 700) with `#FFFFFF` text. Hover state shifts to `#115E59` (Teal 800). Active state applies a 0.99 transform scale. Compact padding (`0.5rem 1rem`), font weight 500. Selected filter chips use the same solid fill.
- **Secondary:** Flat white/slate-900 background with a 1px border (`#E2E8F0` / `#1E293B`). Hover triggers a subtle background shift (`#F1F5F9` / `#1A253B`).
- **Text Link:** Brand-tinted text with no chrome — `text-teal-700 hover:text-teal-800` in light, `text-teal-300` in dark — used for "Set Limits", "View All" and other inline navigation affordances.
- **Destructive:** Bordered or subtle fill using `#F43F5E` at 10% opacity, text `#F43F5E`. Solid `#F43F5E` reserved exclusively for permanent destructive confirmation.

### Badges & Category Tags
- Monospaced typography (`label-sm`).
- Bordered container with 1px hairline rule and 8% background tint matching the semantic tone:
  - *Inflow / Verified:* Text `#0D9488`, Border `#0D9488`/30, Background `#0D9488`/08.
  - *Expense / Overdue:* Text `#F43F5E`, Border `#F43F5E`/30, Background `#F43F5E`/08.
  - *Pending / Neutral:* Text `#64748B`, Border `#64748B`/30, Background `#64748B`/08.

### Data Tables & Transaction Rows
- Strict single-pixel dividers between rows (`border-b border-slate-200 dark:border-slate-800`).
- Header columns use `label-md` tracking in muted slate.
- Numerical values, currencies, and counter-party routing codes utilize `numeric-md` with strict right-alignment.
- Row hover triggers an immediate, un-animated shift to `#F1F5F9` (Light) or `#1A253B` (Dark).

### Input Fields
- Base height: `36px` for dense utility.
- 1px border using `#E2E8F0` / `#27354D`.
- Inactive background is pure `#FFFFFF` (Light) or `#162033` (Dark).
- Focus state: Zero heavy glow rings. Replaced by a sharp 1px primary accent stroke (`#0D9488`) paired with a 1px matching box-shadow outline.
- Monospaced numerical inputs align right with fixed prefix/suffix currency symbols.
- Vertical padding `0.625rem` (`py-2.5`) yields a 36–38px control height, matching the dense cadence of the ledger.

### Cards & Metrics
- Enclosed by a uniform 1px slate hairline.
- Divided into structural zones: Header (Metric Label + Trend Chip), Core Value (`numeric-xl`), and Sub-ledger Delta (comparison against previous interval).
- No floating cards; all cards align cleanly to adjacent grid borders.

## Budget Health States

Derived value — never stored. Computed in `utils/derived.js#getHealthState` from
`spent / allocated` and rendered by a single `BudgetProgressBar` component.

| Tier | Range | Fill | Card border | Badge |
|---|---|---|---|---|
| **Healthy** | < 70% | `emerald-500` | `border-slate-200` | `emerald` |
| **Warning** | 70% – 89% | `amber-500` | `border-amber-200/80` | `amber-50` + `amber-700` text |
| **Critical** | 90% – 99% | `rose-500` | `border-rose-200` | `rose-50` + `rose-600` text |
| **Locked** | 100% | `slate-700` | `border-slate-200` | `slate-100` + `slate-600` text |

The reference prototype demonstrates the Warning tier at 90% and the Locked tier
at 100% ("Food & Dining" 145,000/160,000, "Housing & Rent" 350,000/350,000).
The sub-70% and 90–99% bands are defined here because the prototype does not
exercise them. Thresholds live in one exported constant so they can be retuned
without touching component code.