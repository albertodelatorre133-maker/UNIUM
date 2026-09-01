import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        // Pantallas de poca altura: móviles pequeños y teléfonos en horizontal.
        corto: { raw: "(max-height: 700px)" },
      },
      colors: {
        // Paleta UNIUM — Black & Gold
        primary: {
          DEFAULT: "#d4af37",
          50: "#fdf9ec",
          100: "#f8efcb",
          200: "#f0dd94",
          300: "#e6c65c",
          400: "#dcb443",
          500: "#d4af37",
          600: "#b18f26",
          700: "#8b6e1e",
          800: "#5f4b16",
          900: "#3a2d0d",
        },
        ink: {
          DEFAULT: "#121414",
          900: "#0b0d0d",
          800: "#121414",
          700: "#1a1d1d",
          600: "#232727",
          500: "#2f3434",
        },
        muted: {
          DEFAULT: "#9aa0a0",
          soft: "#c9cdcd",
          dim: "#6d7373",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Archivo Narrow", "sans-serif"],
        sans: ["var(--font-body)", "Hanken Grotesk", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      opacity: {
        8: "0.08",
        12: "0.12",
        15: "0.15",
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(212,175,55,0.25), 0 18px 50px -24px rgba(212,175,55,0.55)",
        glass: "0 24px 60px -32px rgba(0,0,0,0.9)",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #f0dd94 0%, #d4af37 45%, #8b6e1e 100%)",
        "radial-gold":
          "radial-gradient(circle at 50% 0%, rgba(212,175,55,0.18) 0%, rgba(18,20,20,0) 60%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
