---
name: Invertis Academic Feedback
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424754'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#0059c7'
  primary: '#0057c2'
  on-primary: '#ffffff'
  primary-container: '#266fe6'
  on-primary-container: '#fefcff'
  inverse-primary: '#afc6ff'
  secondary: '#9f4212'
  on-secondary: '#ffffff'
  secondary-container: '#fd8955'
  on-secondary-container: '#6e2600'
  tertiary: '#0155c6'
  on-tertiary: '#ffffff'
  tertiary-container: '#336fe1'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001943'
  on-primary-fixed-variant: '#004299'
  secondary-fixed: '#ffdbcd'
  secondary-fixed-dim: '#ffb597'
  on-secondary-fixed: '#360f00'
  on-secondary-fixed-variant: '#7d2d00'
  tertiary-fixed: '#d9e2ff'
  tertiary-fixed-dim: '#b0c6ff'
  on-tertiary-fixed: '#001945'
  on-tertiary-fixed-variant: '#00429c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is engineered for an institutional environment, prioritizing clarity, trust, and structural integrity. It adopts a **Corporate / Modern** style that balances the vibrancy of the Invertis brand with the sobriety required for academic data collection.

The aesthetic is defined by crisp lines, generous whitespace, and a high-fidelity color application that ensures the University’s blue and orange are utilized for action and emphasis without overwhelming the user during long-form data entry. The goal is to evoke a sense of professional accountability and ease of use for students, faculty, and administrators alike.

## Colors

This design system uses a palette rooted in the University’s official identity. 

- **Primary Blue (#3B7EF5):** Used for primary actions, header navigation, and active states. It represents the authority and stability of the institution.
- **Secondary Orange (#EF7E4B):** Used sparingly for highlights, secondary call-to-actions, and notification badges to draw attention without creating visual fatigue.
- **Accent Blue (#2364D5):** A deeper shade for hover states and heavy-duty text elements to ensure WCAG accessibility compliance.
- **Neutral Backgrounds:** A light gray (#F8FAFC) is used for the application canvas to reduce glare, while pure white (#FFFFFF) is reserved for cards and form containers to create clear structural separation.

## Typography

The typography strategy leverages **Montserrat** for display and headings to maintain brand continuity and a modern, energetic feel. **Inter** is utilized for all functional text, including form fields and data visualizations, due to its superior legibility and neutral character in dense layouts.

Hierarchy is strictly enforced through weight and scale. For mobile devices, `headline-lg` should scale down to `24px` to prevent text wrapping on smaller viewports. All labels for form fields and navigation are set in Inter Medium to ensure clarity even at smaller sizes.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The design system follows an 8pt grid system (defined by a 4px base unit) to ensure vertical rhythm across all components.

- **Desktop:** Max-width container of 1280px with 48px side margins. Gutters are fixed at 24px to provide ample breathing room between data cards.
- **Mobile:** Fluid width with 16px side margins. Data visualization charts should be allowed to scroll horizontally if they exceed the viewport width.
- **Sectioning:** Content is grouped into logical cards with `spacing-md` padding to prevent density overload in complex feedback forms.

## Elevation & Depth

This design system employs **Tonal Layers** supplemented by **Ambient Shadows**. This approach ensures that the UI feels organized and hierarchical without the visual clutter of heavy skeuomorphism.

- **Base Layer:** The light neutral background (#F8FAFC) serves as the canvas.
- **Card Layer:** White surfaces (#FFFFFF) are raised using a soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.05)). This distinguishes the interactive "workspace" from the background.
- **Floating Elements:** Modals and dropdowns use a more pronounced shadow (0px 10px 30px rgba(0, 0, 0, 0.12)) to indicate a change in the z-index and focus the user's attention.
- **Interactivity:** Buttons do not use shadows by default but gain a subtle lift on hover to provide tactile feedback.

## Shapes

The shape language is **Soft (0.25rem)**, reflecting a professional and institutional character. Sharp corners are avoided to make the interface feel modern and accessible, while excessive roundedness is avoided to maintain a serious, academic tone.

- **Standard Components:** Input fields, buttons, and checkboxes use a 4px (0.25rem) radius.
- **Large Containers:** Cards and data containers use `rounded-lg` (8px) to create a clear container-child relationship.
- **Status Pills:** Tags and status indicators use a full pill shape (999px) to differentiate them from interactive buttons.

## Components

### Buttons
Primary buttons use the Invertis Blue (#3B7EF5) with white text. Secondary buttons use an outline of the primary color. Feedback-specific "Submit" actions can utilize a high-contrast treatment to ensure visibility at the end of long forms.

### Structured Forms
Inputs use a light border (1px solid #E2E8F0) that thickens and changes to Invertis Blue on focus. Error states are clearly marked with #EF4444 and assistive text. Group related feedback questions into logical "Fieldsets" within cards.

### Data Visualization
For analytics, use a palette that starts with Invertis Blue and scales through monochromatic shades, using Invertis Orange only for "Warning" or "Negative" feedback trends. Charts should use minimal grid lines and focus on data points.

### Cards
Cards are the primary organizational unit. Every card should have a clear header with Montserrat Bold typography and a consistent internal padding of 24px.

### Progress Indicators
Since feedback systems can be long, a stepped progress bar at the top of the viewport is mandatory, using the primary blue to indicate completion level.