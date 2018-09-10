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
export function shuffleArray(array) {
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