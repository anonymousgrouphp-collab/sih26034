/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 50:"#eef3f8",100:"#dce6f0",200:"#bacddd",300:"#8da9c1",400:"#5e83a6",500:"#3d6387",600:"#294f73",700:"#1B365D",800:"#162d4d",900:"#102238" },
        government: { navy:"#1B365D", saffron:"#E87817", green:"#138A4B" }
      },
      boxShadow: { workstation:"0 1px 3px rgba(15,35,55,.10), 0 4px 12px rgba(15,35,55,.06)" }
    }
  },
  plugins: []
};