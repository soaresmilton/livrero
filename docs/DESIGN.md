---
name: Livrero Design System
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede8'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#434842'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#747872'
  outline-variant: '#c4c8c0'
  surface-tint: '#516351'
  primary: '#4f604f'
  on-primary: '#ffffff'
  primary-container: '#677966'
  on-primary-container: '#f7fff2'
  inverse-primary: '#b8ccb6'
  secondary: '#974730'
  on-secondary: '#ffffff'
  secondary-container: '#fe997c'
  on-secondary-container: '#772f1a'
  tertiary: '#72545b'
  on-tertiary: '#ffffff'
  tertiary-container: '#8c6c73'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e8d1'
  primary-fixed-dim: '#b8ccb6'
  on-primary-fixed: '#0f1f11'
  on-primary-fixed-variant: '#3a4b3a'
  secondary-fixed: '#ffdbd1'
  secondary-fixed-dim: '#ffb5a0'
  on-secondary-fixed: '#3b0900'
  on-secondary-fixed-variant: '#79301b'
  tertiary-fixed: '#ffd9e0'
  tertiary-fixed-dim: '#e3bdc5'
  on-tertiary-fixed: '#2b151b'
  on-tertiary-fixed-variant: '#5b3f46'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 48px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system is built on the concept of a "Digital Sanctuary." It targets bibliophiles who seek a focused, calm environment to organize their reading life. The aesthetic blends **Minimalism** with **Modern Editorial** influences, prioritizing high-quality typography and generous negative space to reduce cognitive load.

The emotional response should be one of "quiet productivity"—evoking the feeling of a well-lit reading nook. The interface uses a "Quiet UI" approach, where structural elements recede to allow book cover art and literary content to remain the focal point.

## Colors
The palette is rooted in organic, earth-toned pigments that provide high legibility without the harshness of pure white or vibrant neon.

- **Primary (Sage Green):** Used for primary actions, success states, and active navigation indicators. It is desaturated to maintain a calming presence.
- **Secondary (Terracotta):** Reserved for highlights, notifications, or "In Progress" reading states. It provides a warm contrast to the sage.
- **Neutral (Warm Paper):** The foundation of the light mode. This #F5F2ED base reduces eye strain during long cataloging sessions.
- **Dark Mode Surface:** Uses a deep #121212 charcoal. In dark mode, the Sage and Terracotta colors should be desaturated by 15% to maintain a harmonious contrast ratio against the dark background.

## Typography
This design system employs a pairing of **Source Serif 4** and **Hanken Grotesk**. 

- **Source Serif 4** provides an authoritative, literary backbone for headlines and page titles. It should be used with slightly tighter letter-spacing for large display sizes to maintain a modern editorial feel.
- **Hanken Grotesk** is used for all functional UI elements, body text, and metadata. Its high x-height and contemporary geometry ensure that book titles and author names remain legible at small sizes.

Avoid all-caps styling except for very short labels (e.g., "PAGE 12 of 300").

## Layout & Spacing
The layout follows a **Fluid Grid** model with an emphasis on "Airy" margins. 

- **Desktop:** A 12-column grid with a maximum width of 1280px. Gutters are kept wide (24px) to prevent the UI from feeling cramped.
- **Mobile:** A 4-column grid with 20px side margins. 
- **Rhythm:** All spacing must be a multiple of 8px. Use `stack-lg` (48px) to separate major sections, such as "Currently Reading" from "Your Collections," to ensure clear visual distinction without the need for heavy dividers.

## Elevation & Depth
The design system uses **Tonal Layering** combined with **Ambient Shadows** to create a tactile, paper-like feel.

- **Level 0 (Base):** The #F5F2ED background.
- **Level 1 (Cards/Surfaces):** Pure white (#FFFFFF) in light mode with a very soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.04)`.
- **Borders:** Instead of heavy shadows, use 1px solid borders in a slightly darker shade of the background (e.g., #E8E4DE) to define boundaries.
- **Dark Mode Depth:** Shadows are replaced by subtle border strokes (#2A2A2A) and slight shifts in surface luminosity.

## Shapes
The shape language is **Rounded (Level 2)**. 

Standard components (inputs, small cards) use a 0.5rem (8px) radius. Larger containers or featured book cards use `rounded-lg` (16px) to appear softer and more approachable. Circular treatments are reserved exclusively for avatars and floating action buttons (FAB) for adding new books.

## Components
- **Book Cards:** The core component. Features a vertical aspect ratio for the cover image. Text metadata should be left-aligned below the image using `label-md` for the title and `caption` for the author.
- **Buttons:** Primary buttons use the Sage Green background with white text. They should have 0.5rem roundedness and no shadow, using a slight scale-down effect (0.98) on click for tactility.
- **Input Fields:** Use a subtle "inset" look or a simple bottom-border style to mimic traditional stationery. Backgrounds should be 2% darker than the base surface.
- **Chips/Tags:** Used for genres or "To Read" status. These use a desaturated version of the primary color with 1rem (pill-shaped) roundedness and `caption` typography.
- **Reading Progress Bar:** A thin 4px bar using the Secondary (Terracotta) color to show completion percentage, placed at the very bottom of a book card.