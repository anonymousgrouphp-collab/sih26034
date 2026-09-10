/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Government & Institutional Tokens
        govNavy: {
          DEFAULT: "#1B365D",
          light: "#2E5B9A",
          dark: "#0F2038",
        },
        // 4-State Epistemic Compliance Tokens
        verdictPass: {
          DEFAULT: "#059669", // Emerald 600
          light: "#ECFDF5",   // Emerald 50 tint
          dark: "#047857",
        },
        verdictFail: {
          DEFAULT: "#DC2626", // Rose/Crimson 600
          light: "#FEF2F2",   // Rose 50 tint
          dark: "#B91C1C",
        },
        verdictReview: {
          DEFAULT: "#D97706", // Amber 600
          light: "#FFFBEB",   // Amber 50 tint
          dark: "#B45309",
        },
        verdictUnable: {
          DEFAULT: "#475569", // Slate 600
          light: "#F1F5F9",   // Slate 100 tint
          dark: "#334155",
        },
        // Surface and Board Tokens
        surfaceBg: "#F8FAFC",
        panelBg: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
