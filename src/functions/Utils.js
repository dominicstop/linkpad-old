
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