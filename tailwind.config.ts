import { type Config } from "tailwindcss";



export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {},
    fontFamily: {

    },
  },
  daisyui: {
    themes: [],
  },
  plugins: [require("daisyui")],
};