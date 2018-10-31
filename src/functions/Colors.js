import chroma from 'chroma-js';

export const RED = [
  '#FF5252',
  '#EF5350',
  '#F44336',
  '#E53935',
  '#D32F2F',
  '#C62828',
  '#B71C1C',
  '#D50000',
];

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

export const PURPLE = [
  '#BA68C8',
  '#AB47BC',
  '#9C27B0',
  '#8E24AA',
  '#7B1FA2',
  '#6A1B9A',
  '#4A148C',
  '#E040FB',
  '#D500F9',
  '#AA00FF',
];

export const COLORS = [RED, PINK, PURPLE];

export function generateColors(colors, size){
  let newColors = chroma.scale(colors).mode('lab').colors(size);
  console.log(newColors);
  return newColors;
};