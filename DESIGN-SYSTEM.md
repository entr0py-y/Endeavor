# Nothing UI Design System - SweepX Implementation

## Color Palette

```
Primary Colors:
├─ Black:  #000000 (rgb(0, 0, 0))           - Backgrounds, primary surface
├─ White:  #FFFFFF (rgb(255, 255, 255))     - Text, borders, UI elements
└─ Red:    #FF0000 (rgb(255, 0, 0))         - Accents, highlights, interactive states

Transparency Layers:
├─ white/80  - rgba(255, 255, 255, 0.8)  - Primary text
├─ white/60  - rgba(255, 255, 255, 0.6)  - Secondary text
├─ white/40  - rgba(255, 255, 255, 0.4)  - Tertiary text, placeholders
├─ white/15  - rgba(255, 255, 255, 0.15) - Borders
├─ white/10  - rgba(255, 255, 255, 0.1)  - Subtle dividers
└─ white/5   - rgba(255, 255, 255, 0.05) - Background variations
```

## Typography

```
Font Family: 'NothingFont', system-ui, -apple-system, sans-serif

Size Scale:
├─ 5xl - 3rem (48px)    - Hero text, large numbers
├─ 4xl - 2.25rem (36px) - Page headings
├─ 3xl - 1.875rem (30px)- Section headings
├─ 2xl - 1.5rem (24px)  - Card headings
├─ xl  - 1.25rem (20px) - Subheadings
├─ lg  - 1.125rem (18px)- Large body
├─ base- 1rem (16px)    - Body text
├─ sm  - 0.875rem (14px)- Small text
└─ xs  - 0.75rem (12px) - Tiny text, labels

Special Classes:
├─ .dot-matrix        - Letter spacing: 0.1em
├─ tracking-wider     - Letter spacing: 0.05em
└─ tracking-wide      - Letter spacing: 0.025em
```

## Spacing System

```
Scale (Tailwind units):
├─ 1  - 0.25rem (4px)
├─ 2  - 0.5rem (8px)
├─ 3  - 0.75rem (12px)
├─ 4  - 1rem (16px)
├─ 6  - 1.5rem (24px)
├─ 8  - 2rem (32px)
├─ 12 - 3rem (48px)     ← Card padding
├─ 16 - 4rem (64px)
└─ 24 - 6rem (96px)

Component Spacing:
├─ Card padding:    3rem (48px)
├─ Card margins:    3rem (48px)
├─ Section spacing: 4rem (64px)
└─ Page padding:    1.5rem (24px) mobile, 3rem (48px) desktop
```

## Component Styles

### Card
```css
.nothing-card {
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 3rem;
  margin: 3rem;
  transition: border-color 0.3s ease;
}

.nothing-card:hover {
  border-color: rgba(255, 0, 0, 0.5);
}
```

### Button
```css
.nothing-button {
  background: transparent;
  border: 1px solid #FFFFFF;
  color: #FFFFFF;
  padding: 0.75rem 2rem;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.nothing-button:hover {
  border-color: #FF0000;
  color: #FF0000;
}

.nothing-button-primary {
  background: #FF0000;
  border-color: #FF0000;
  color: #000000;
}

.nothing-button-primary:hover {
  background: #FFFFFF;
  border-color: #FFFFFF;
  color: #000000;
}
```

### Input
```css
.nothing-input {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #FFFFFF;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.nothing-input:focus {
  border-color: #FF0000;
}

.nothing-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}
```

## Grid System

```
Desktop (≥768px):
├─ Max 3 cards per row
├─ Gap: 2rem (32px)
└─ Container: max-w-7xl (1280px)

Tablet (≥640px, <768px):
├─ Max 2 cards per row
├─ Gap: 1.5rem (24px)
└─ Container: max-w-4xl (896px)

Mobile (<640px):
├─ 1 card per row
├─ Gap: 1rem (16px)
└─ Container: full width with padding
```

## Animation Guidelines

```
Timing Functions:
├─ Ease Out - Default for entrances
├─ Ease In  - Exits
└─ Cubic Bezier - Custom smooth transitions

Durations:
├─ Fast    - 0.15s - Micro-interactions
├─ Normal  - 0.3s  - Hover states, transitions
├─ Slow    - 0.6s  - Page transitions, fades
└─ Slower  - 1s    - Special effects

Principles:
├─ Subtle over flashy
├─ Intentional, not random
├─ Smooth, natural feel
└─ Performance-optimized
```

## Layout Patterns

### Header
```
Height: auto
Padding: 1.5rem vertical
Border: 1px solid rgba(255, 255, 255, 0.15) bottom
Position: sticky top
Background: #000000
Z-index: 40
```

### Footer
```
Margin-top: 6rem (96px)
Padding: 3rem vertical
Border: 1px solid rgba(255, 255, 255, 0.15) top
Grid: 3 columns on desktop, 1 on mobile
```

### Modal
```
Background: rgba(0, 0, 0, 0.9)
Position: fixed, full screen
Z-index: 50
Card: max-width 32rem (512px)
Animation: fade in + scale up
```

## Cursor Glow Effect

```
Desktop Only:
├─ Position: fixed, follows mouse
├─ Size: 40px × 40px
├─ Color: radial gradient (red to transparent)
├─ Filter: blur(15px)
├─ Animation: spring (damping: 30, stiffness: 200)
└─ Z-index: 50
```

## Responsive Breakpoints

```
sm:  640px  - Small tablets, large phones
md:  768px  - Tablets
lg:  1024px - Small laptops
xl:  1280px - Desktops
2xl: 1536px - Large desktops
```

## Accessibility

```
Focus States:
├─ Visible outline on keyboard navigation
├─ Red (#FF0000) focus ring
└─ 2px offset

Text Contrast:
├─ White on black: WCAG AAA compliant
├─ Red on black: Sufficient for accents
└─ Minimum size: 14px for body text

Interactive Elements:
├─ Minimum touch target: 44×44px
├─ Clear hover states
└─ Loading indicators for async actions
```

## Best Practices

1. **Spacing**: Always use multiples of 4px (0.25rem)
2. **Borders**: Keep thin (1px), use opacity for variation
3. **Text**: Uppercase for buttons/labels, normal case for content
4. **Colors**: Only use the 3 core colors (black/white/red)
5. **Animation**: Subtle, smooth, intentional
6. **Layout**: Generous whitespace, clear hierarchy
7. **Typography**: Consistent use of dot-matrix class for UI elements
8. **Interactions**: Immediate visual feedback, no lag
9. **Responsiveness**: Mobile-first approach
10. **Performance**: Optimize images, lazy load where possible

## Human Touch Principles

✓ Natural language in all UI text
✓ Warm, conversational tone
✓ Clear, helpful error messages
✓ Thoughtful empty states
✓ Contextual help where needed
✓ Celebrate user achievements
✓ Guide, don't dictate
✓ Respect user's time and attention

---

This design system ensures the SweepX interface maintains the Nothing UI aesthetic while remaining accessible, responsive, and human-centered.
