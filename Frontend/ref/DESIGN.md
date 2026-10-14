---
name: Vault
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
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.03em
  numeric-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.02em
  numeric-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
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

## Brand & Style

The design system embodies institutional precision, financial clarity, and deliberate restraint. Built for discerning individuals managing complex cash flows, liquidity, and personal balance sheets, it projects absolute stability and architectural calm. 

The aesthetic is anchored in a precision-engineered hybrid of modern corporate minimalism and technical dashboard utility:
- **Tone:** Unflappable, bank-grade, discreet, highly analytical.
- **Visual Stance:** Zero decorative gradients, no cartoonish illustrations, and no gratuitous rounded pill buttons. Spatial decisions are calculated, borders are structural, and typographic alignment mirrors ledger-level rigor.
- **Tactility:** Crisp flat surfaces, structural hairlines, and clear visual hierarchy driven by value contrast and typography rather than blurred elevations.

## Colors

The palette is engineered to present financial data with high legibility and unambiguous intent.

### Roles & Semantic Application
- **Primary (`#0D9488` - Deep Emerald Teal):** Primary actions, positive growth metrics, inflows, interest accruals, active balance highlights.
- **Secondary (`#0F172A` - Slate Navy):** Structural elements, heavy display type, interactive selection states in light mode; serves as the tonal base in dark mode.
- **Tertiary (`#F43F5E` - Rose Coral):** Debit outlays, downward balance adjustments, negative deltas, critical alerts, friction gates.
- **Neutral (`#64748B` - Slate):** Secondary labels, metadata, inactive icons, hairline dividers.

### Theme Execution
- **Pristine Light Mode:**
  - Base canvas: `#F8FAFC` (Slate-50)
  - Surface cards: `#FFFFFF` (Pure White)
  - Structural Hairlines: `#E2E8F0` (Slate-200)
  - Text Primary: `#0F172A` (Slate-900)
  - Text Secondary: `#64748B` (Slate-500)
- **Rich Obsidian Dark Mode:**
  - Base canvas: `#020617` (Obsidian / Slate-950)
  - Surface cards: `#0B1120` (Deep Vault Tint)
  - Structural Hairlines: `#1E293B` (Slate-800)
  - Text Primary: `#F8FAFC` (Slate-50)
  - Text Secondary: `#94A3B8` (Slate-400)

## Typography

Typography prioritizes density, geometric cohesion, and data alignment.

- **Interface Primary (`Geist`):** Delivers clean optical kerning, neutral proportions, and high readability in both narrative text and tight data matrices. All body text leverages tabular lining figures (`font-variant-numeric: tabular-nums`) by default.
- **Financial Ledger & Data (`JetBrains Mono`):** Applied to monetary figures, exchange rates, account identifiers, transaction hashes, timestamps, and compact status badges. Fixed widths ensure vertical alignment across dense tables and transaction streams.
- **Hierarchical Discipline:** Display styles are kept sharp and tight. All labels under 14px default to monospaced uppercase tracking for rapid optical parsing.

## Layout & Spacing

A disciplined, modular grid system designed to support complex dashboards without visual clutter.

### Grid Architecture
- **Desktop (≥ 1280px):** 12-column fluid grid locked to a max width of `1440px`. Column gutter is `1.5rem` (`24px`), with outer canvas padding of `2rem` (`32px`).
- **Tablet (768px - 1279px):** 8-column layout with `1.5rem` gutters and `1.5rem` margins. Side panels collapse into contextual slide-overs or tabbed stacks.
- **Mobile (< 768px):** 4-column layout with `1rem` (`16px`) gutters and margins. Tables convert to grouped card rows.

### Rhythmic Discipline
Layout spacing uses an exact 8-point system (scaled with 4-point micro-increments via `space-xs`). Dashboards favor clean, equal cell heights, strict edge-to-edge container rules, and vertical stacking that groups related metrics into cohesive financial modules.

## Elevation & Depth

This design system deliberately rejects heavy, diffuse drop-shadows and neomorphic extrusion in favor of **Tonal Hairline Layering**.

- **Structural Borders:** Hierarchy is established through continuous 1px hairline rules (`slate-200` in light mode, `slate-800` in dark mode). Surfaces do not cast diffuse light; they sit atop one another like machined plates.
- **Surface Layering:**
  - *Tier 0 (Canvas):* Light `#F8FAFC` / Dark `#020617`
  - *Tier 1 (Cards, Modules, Sidebars):* Light `#FFFFFF` / Dark `#0B1120`
  - *Tier 2 (Popovers, Tooltips, Menus):* Light `#FFFFFF` / Dark `#1E293B`, paired with an ultra-subtle, sharp drop shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.08)` (Light) or `0 4px 16px -2px rgba(0, 0, 0, 0.5)` (Dark).
- **Z-Index Modality:** Active flyouts and command palettes introduce a calibrated slate backdrop overlay (`rgba(15, 23, 42, 0.4)` / `rgba(2, 6, 23, 0.75)`) with an absolute minimal 2px backdrop blur (`backdrop-blur-sm`).

## Shapes

The geometric approach follows a crisp, architectural logic. Sharp enough to feel solid and engineered, with micro-radii to prevent harsh display aliasing.

- **Base Radius (0.25rem / 4px):** Applied to form inputs, utility buttons, inline code markers, status chips, and category tags.
- **Container Radius (0.5rem / 8px):** Applied to modular panels, transaction tables, modal dialogues, and metric cards.
- **Outer Shell Radius (0.75rem / 12px):** Reserved solely for global viewport frames and primary system overlays.
- **Pill Radius Exception:** Excluded from structural containers; strictly reserved for small circular icon-only indicators or badge micro-dots.

## Components

### Buttons
- **Primary:** Solid `#0D9488` with `#FFFFFF` text. Hover state shifts to `#0F766E`. Active state applies a 0.99 transform scale. Compact padding (`0.5rem 1rem`), font weight 500.
- **Secondary:** Flat white/slate-900 background with a 1px border (`#E2E8F0` / `#1E293B`). Hover triggers a subtle background shift (`#F1F5F9` / `#1E293B`).
- **Destructive:** Bordered or subtle fill using `#F43F5E` at 10% opacity, text `#F43F5E`. Solid `#F43F5E` reserved exclusively for permanent destructive confirmation.

### Badges & Category Tags
- Monospaced typography (`label-sm`).
- Bordered container with 1px hairline rule and 6% background tint matching the semantic tone:
  - *Inflow / Verified:* Text `#0D9488`, Border `#0D9488`/30, Background `#0D9488`/08.
  - *Expense / Overdue:* Text `#F43F5E`, Border `#F43F5E`/30, Background `#F43F5E`/08.
  - *Pending / Neutral:* Text `#64748B`, Border `#64748B`/30, Background `#64748B`/08.

### Data Tables & Transaction Rows
- Strict single-pixel dividers between rows (`border-b border-slate-200 dark:border-slate-800`).
- Header columns use `label-md` tracking in muted slate.
- Numerical values, currencies, and counter-party routing codes utilize `numeric-md` with strict right-alignment.
- Row hover triggers an immediate, un-animated shift to `#F1F5F9` (Light) or `#1E293B`/50 (Dark).

### Input Fields
- Base height: `36px` for dense utility.
- 1px border using `#E2E8F0` / `#334155`.
- Inactive background is pure `#FFFFFF` (Light) or `#0B1120` (Dark).
- Focus state: Zero heavy glow rings. Replaced by a sharp 1px primary accent stroke (`#0D9488`) paired with a 1px matching box-shadow outline.
- Monospaced numerical inputs align right with fixed prefix/suffix currency symbols.

### Cards & Metrics
- Enclosed by a uniform 1px slate hairline.
- Divided into structural zones: Header (Metric Label + Trend Chip), Core Value (`numeric-xl`), and Sub-ledger Delta (comparison against previous interval).
- No floating cards; all cards align cleanly to adjacent grid borders.