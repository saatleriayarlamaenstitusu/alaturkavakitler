module.exports = {
  node:'jit',
  important: true,
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-color": "var(--primary)"
            },
      backgroundImage:{
        "ust-pattern": "url('../../public/Icons/topbgtext.svg')",
      
      },


    },
  },
  plugins: [],
}
