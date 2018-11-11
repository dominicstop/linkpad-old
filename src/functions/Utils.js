import chroma from 'chroma-js';

//wrapper func for setstate that returns a promise
export function setStateAsync(that, newState) {
  return new Promise((resolve) => {
      that.setState(newState, () => {
          resolve();
      });
  });
}

//wrapper for timeout that returns a promise
export function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//returns a shuffled an array
export function shuffleArray(array = []) {
  var newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return(newArray);
}

//pick a random item from an array
export function randomElementFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

//when i exceeds max, go back to zero
export function returnToZero(i, max){
  let mod = i % (max + 1);
  return i <= max? i : mod;
}

export function colorShift(color, max){
  console.log(color);
  let hsl = chroma(color).hsl();
  console.log('hsl original');
  console.log(hsl);

  for(let index of hsl){
    
  }
  let sign   = Math.round(Math.random()) * 2 - 1;
  let offset = Math.floor(Math.random() * max);
  hsl[0] += (offset * sign);
  console.log('hsl modif');
  console.log(hsl);
  console.log('\n\n');
  const result = chroma.hsl(hsl[0], hsl[1], hsl[2]).hex();
  alert(result);
  return result;
}

export function plural(string = "", count = 0){
  return string + (count > 1? 's' : '');
}

export function getTimestamp(){
  const dateTime  = new Date().getTime();
  return Math.floor(dateTime / 1000);
}

/** returns undefined when index is invalid */
export function getLast(array) {
  return array[array.length - 1];
}

/** returns undefined when index is invalid */
export function getFirst(array) {
  return array[0];
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export function getLetter(index = 0){
  return alphabet[index];
}