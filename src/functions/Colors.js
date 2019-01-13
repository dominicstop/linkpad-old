import chroma from 'chroma-js';

export const RED = {
  '100' :'#FF5252',
  '200' :'#EF5350',
  '300' :'#F44336',
  '400' :'#E53935',
  '500' :'#D32F2F',
  '600' :'#C62828',
  '700' :'#B71C1C',
  '800' :'#D50000',
};

export const PINK = [
  '#EC407A',
  '#FF4081',
  '#E91E63',
  '#F50057',
  '#D81B60',
  '#C51162',
  '#C2185B',
  '#AD1457',
  '#880E4F',
];

export const VIOLET = {
  '100'  :'#BA68C8',
  '200'  :'#AB47BC',
  '300'  :'#9C27B0',
  '400'  :'#8E24AA',
  '500'  :'#7B1FA2',
  '600'  :'#6A1B9A',
  '700'  :'#4A148C',
  '800'  :'#E040FB',
  '900'  :'#D500F9',
  'A700' :'#AA00FF',
};

export const PURPLE = {
  '100'  :'#D1C4E9',
  '200'  :'#B39DDB',
  '300'  :'#9575CD',
  '400'  :'#7E57C2',
  '500'  :'#673AB7',
  '600'  :'#5E35B1',
  '700'  :'#512DA8',
  '800'  :'#4527A0',
  '900'  :'#311B92',
  '1000' :'#190b5b',
  '1100' :'#0f0442',
  '1200' :'#0e0333',
  '1300' :'#090126',
  'A700' :'#6200EA',
};

export const COLORS = [RED, PINK, PURPLE];

export function generateColors(colors, size){
  let newColors = chroma.scale(colors).mode('lab').colors(size);
  console.log(newColors);
  return newColors;
};