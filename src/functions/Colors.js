import chroma from 'chroma-js';

export function generateColors(colors, size){
  let newColors = chroma.scale(colors).mode('lab').colors(size);
  console.log(newColors);
  return newColors;
};