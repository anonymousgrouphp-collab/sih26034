/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'scan-vertical': {
          '0%, 100%': { transform: 'translateY(-2px)' },
          '50%': { transform: 'translateY(2px)' },
        }
      },
      animation: {
        'scan-vertical': 'scan-vertical 1.5s ease-in-out infinite',
      },
      colors: {
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
        govNavy: {
          DEFAULT: "#1B365D",
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
        verdictPass: {
          DEFAULT: "#059669",
          light: "#ECFDF5",
          dark: "#047857",
        },
        verdictFail: {
          DEFAULT: "#DC2626",
          light: "#FEF2F2",
          dark: "#B91C1C",
        },
        verdictReview: {
          DEFAULT: "#D97706",
          light: "#FFFBEB",
          dark: "#B45309",
        },
        verdictUnable: {
          DEFAULT: "#475569",
          light: "#F1F5F9",
          dark: "#334155",
        },
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
