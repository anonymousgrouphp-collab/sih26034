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
        surface: "#FFFFFF",
        saffron: "#FF9933",
        cyan: {
          DEFAULT: "#0284c7",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        success: "#10b981",
        // Official Statutory & Institutional Tokens (Government of India Certified Deep Navy)
        govNavy: {
          DEFAULT: "#1B365D", // Official Indian Sovereign Navy Blue
          light: "#244B7E",
          dark: "#0A2540",
          deep: "#071A2F",
        },
        navy: {
          50: "#f0f4f9",
          100: "#dbe5f1",
          200: "#b8cde3",
          300: "#8bb0d2",
          400: "#5d90bf",
          500: "#3d73a7",
          600: "#2d5a87",
          700: "#24486d",
          800: "#1B365D",
          900: "#0A2540",
        },
        government: {
          navy: "#1B365D",
          saffron: "#FF9933",
          green: "#138808",
          gold: "#D97706",
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
        // Surface and Panel Tokens (Crisp Institutional White & Slate)
        surfaceBg: "#F8FAFC",
        panelBg: "#FFFFFF",
        panelBorder: "#E2E8F0",
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
      spacing: {
        4.5: "1.125rem",
      },
    },
  },
  plugins: [],
};
