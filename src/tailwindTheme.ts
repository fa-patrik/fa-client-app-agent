import preval from "babel-plugin-preval/macro";

interface TailwindTheme {
  colors: {
    primary: Record<string, string>;
    avatarColors: string[];
  };
  screens: Record<string, string>;
}

const theme: TailwindTheme = preval`
const resolveConfig = require("tailwindcss/resolveConfig");
const tailwindConfig = require("../tailwind.config.js");
const tailwindTheme = resolveConfig(tailwindConfig).theme;

//export list of avatar_ hex codes from tailwind.config.js to app
const avatarColors = Object.entries(tailwindTheme.colors).reduce((prev, curr)=>{
  const [key,value] = curr 
  if(key.includes("avatar_")) prev.push(value)
  return prev
},[])

// to limit bundle size we export only what we need
module.exports = {
  colors: {
    primary: tailwindTheme.colors.primary,
    avatarColors: avatarColors
  },
  screens: tailwindTheme.screens,
};
`;

export default theme;
