# Makeup Stories by Rajeshwari | Luxury Bridal Portfolio Website

A state-of-the-art, high-fidelity responsive single-page web experience showcasing the luxury bridal and editorial makeup artistry of Rajeshwari, based in Bangalore.

## Features

1. **Luxury Visual Experience:** Elegant editorial presentation based on the brand's Vogue-style PDF catalog.
2. **Curated Design Tokens:** Luxury dark champagne, gold accents (`#735c00`, `#d4af37`), HSL curated colors, glassmorphic panels, and Google Fonts (Playfair Display for display headers, Inter for copy).
3. **Advanced CSS Animations:** Native CSS scroll-driven parallax effects, Ken Burns hero background zooms, and button shimmers.
4. **Resilient JS Fallbacks:** Smooth `IntersectionObserver` scroll-driven fallbacks for older viewports or Firefox.
5. **Interactive Booking Modal:** A premium, multi-step booking client widget simulating event customization, date selection, slot check, and generating a custom Booking ID.
6. **Glam Portfolio Gallery:** Visual gallery with category filtering (All, Bridal, Pre-Wedding, Editorial) and an integrated fullscreen lightbox with keyboard navigation.
7. **Client Love Notes:** Swipeable, animated testimonials carousel.

## Project Structure

- `index.html` — Fully annotated single-page HTML layout with mobile-first and desktop media queries.
- `index.css` — Luxury design tokens, animations, hover effects, and parallax styles.
- `index.js` — Client logic for sliders, galleries, booking modals, and intersection fallbacks.
- `images/` — Custom-generated high-fidelity bridal makeup portrait assets.

## Quick Start (Previewing the Site)

To preview the website locally, run a static web server in this directory:

### Option A: Using Python (Pre-installed)
```bash
python3 -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Option B: Using Node.js
```bash
npx -y serve
```
Then open the local URL in your browser.
