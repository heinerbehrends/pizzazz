import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      breakpoints: {
        md: "501px",
      },
      tokens: {
        colors: {
          letter: { value: "#EA8433" },
          yellow: { value: "FFF" },
          green: { value: "ddd" },
          border: { value: "#CED4DA" },
          text: { value: "#7A828A" },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",
});
