/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors")
module.exports = {
  purge: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      basic: ["GowunDodum-Regular"],
      title: ["Cafe24Ohsquareair"],
      cute: ["TTCrownMychewR"],
      cardBasic: ["MaruBuri-Regular"],
      cardCute: ["KOTRAHOPE"],
      cardCool: ["YeolrinMyeongjo-Medium"],
      cardHand: ["InkLipquid"],
    },
    extend: {
      colors: {
        main: "var(--color-main)",
        point: "var(--color-point)",
        sub: "var(--color-sub)",
        shadow: "var(--color-shadow)",
        rose: colors.rose,
      },
    },
  },
  darkMode: "class",
  plugins: [],
}
