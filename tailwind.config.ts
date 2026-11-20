import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"]
      },
      colors: {
        obsidian: {
          950: "#05070c",
          900: "#090d16",
          800: "#101724",
          700: "#182234"
        },
        ink: {
          primary: "#f3f6fb",
          secondary: "#a7b4c8",
          muted: "#6d7d96"
        },
        signal: {
          sky: "#38bdf8",
          amber: "#f59e0b",
          emerald: "#10b981",
          rose: "#ef4444"
        }
      },
      boxShadow: {
        instrument: "0 14px 40px rgba(0, 0, 0, 0.42)"
      }
    }
  },
  plugins: []
};

export default config;
