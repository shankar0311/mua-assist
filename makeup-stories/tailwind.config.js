/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./index.js"],
  theme: {
    extend: {
      colors: {
        "tertiary-fixed": "#e6dad7",
        "outline": "#6e5c5d", // Hardened contrast color from #948082
        "on-tertiary": "#ffffff",
        "background": "#fdfbf7",
        "on-primary-container": "#4a0b18",
        "on-secondary-fixed-variant": "#4d4142",
        "tertiary": "#6e5d5e",
        "on-surface": "#1a1516",
        "on-secondary": "#ffffff",
        "on-surface-variant": "#594d4e",
        "secondary": "#6b5d5e",
        "on-background": "#1a1516",
        "primary-fixed-dim": "#e2aba2",
        "tertiary-container": "#ebd9d7",
        "on-secondary-fixed": "#211a1b",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#3a0510",
        "surface-tint": "#8e2b43",
        "surface-variant": "#ebdce0",
        "on-primary-fixed-variant": "#71182c",
        "surface-container": "#f4ede8",
        "error": "#ba1a1a",
        "surface-container-high": "#ebe0db",
        "secondary-fixed": "#f4ebea",
        "primary-fixed": "#f5dcd8",
        "outline-variant": "#e6dad7",
        "surface-container-lowest": "#ffffff",
        "on-secondary-container": "#6e5c5d",
        "on-error-container": "#93000a",
        "tertiary-fixed-dim": "#d9cbbf",
        "surface-container-highest": "#e0d1cb",
        "secondary-fixed-dim": "#dccbc9",
        "inverse-primary": "#e2aba2",
        "surface-container-low": "#f9f6f3",
        "surface-dim": "#d9cbbf",
        "surface-bright": "#fdfbf7",
        "on-tertiary-fixed-variant": "#4b3c3c",
        "inverse-surface": "#312e2f",
        "primary-container": "#d99a91",
        "primary": "#8e2b43",
        "on-tertiary-container": "#453232",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "secondary-container": "#ebdcd9",
        "inverse-on-surface": "#f5f0f0",
        "on-tertiary-fixed": "#1d1515",
        "surface": "#fdfbf7"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "gutter": "32px",
        "section-gap": "120px",
        "content-max-width": "1440px",
        "margin-desktop": "80px",
        "margin-mobile": "24px"
      },
      fontFamily: {
        "serif": ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        "sans": ["Montserrat", "Inter", "system-ui", "sans-serif"],
        "display": ["Cinzel", "serif"],
        "headline-md": ["Cormorant Garamond"],
        "display-lg-mobile": ["Cinzel"],
        "headline-xl": ["Cinzel"],
        "body-md": ["Montserrat"],
        "body-lg": ["Montserrat"],
        "label-caps": ["Montserrat"],
        "display-lg": ["Cinzel"]
      },
      fontSize: {
        "headline-md": ["32px", { "lineHeight": "1.3", "fontWeight": "500" }],
        "display-lg-mobile": ["48px", { "lineHeight": "1.2", "fontWeight": "700" }],
        "headline-xl": ["60px", { "lineHeight": "1.2", "fontWeight": "600" }],
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "1.8", "letterSpacing": "0.01em", "fontWeight": "300" }],
        "label-caps": ["12px", { "lineHeight": "1.0", "letterSpacing": "0.2em", "fontWeight": "600" }],
        "display-lg": ["84px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
