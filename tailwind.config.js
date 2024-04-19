export default {
  content: [
    // "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto"],
      },
      backgroundColor:{
        primary: "#008ffb",
        primaryHover: "#0190f3",
      }
      
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake", "bumblebee", "emerald", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua"],
  },
};
