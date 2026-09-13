/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NOTE: never name a color `base` — it collides with Tailwind's
        // `text-base` font-size utility (23 usages in src) and hijacks it
        // into a color utility. The page canvas uses #0b1320 directly
        // (surfaceBg below now carries the same value).
        surface: "#132238",
        saffron: "#e5a93c",
        // NOTE: assigning a single string to `cyan` would replace Tailwind's
        // entire default cyan scale (cyan-50…950), silently killing every
        // `cyan-<shade>` utility used across src. Keep the full scale and
        // pin the brand accent as DEFAULT (#38bdf8, WCAG focus-ring color).
        cyan: {
          DEFAULT: "#38bdf8",
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        success: "#138A4B",
        // Official Statutory & Institutional Tokens (09_UI_UX_BLUEPRINT.md)
        govNavy: {
          DEFAULT: "#1B365D", // Ashoka Deep Navy
          light: "#2E5B9A",
          dark: "#0F2038",
        },
        navy: {
          50: "#eef3f8",
          100: "#dce6f0",
          200: "#bacddd",
          300: "#8da9c1",
          400: "#5e83a6",
          500: "#3d6387",
          600: "#294f73",
          700: "#1B365D",
          800: "#162d4d",
          900: "#102238",
        },
        government: {
          navy: "#1B365D",
          saffron: "#E87817",
          green: "#138A4B",
        },
        // 4-State Epistemic Compliance Tokens
        verdictPass: {
          DEFAULT: "#059669", // Emerald 600
          light: "#ECFDF5",   // Emerald 50 tint
          dark: "#047857",
        },
        verdictFail: {
          DEFAULT: "#DC2626", // Rose 600
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
        // Surface and Panel Tokens
        surfaceBg: "#0b1320",
        panelBg: "#132238",
      },
      fontFamily: {
        sans: ['"Inter"', '"Roboto"', '"Plus Jakarta Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "Fira Code", "Courier New", "monospace"],
      },
      boxShadow: {
        workstation: "0 1px 3px rgba(15,35,55,.10), 0 4px 12px rgba(15,35,55,.06)",
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "2xs": "0 1px 1px 0 rgba(0, 0, 0, 0.05)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
