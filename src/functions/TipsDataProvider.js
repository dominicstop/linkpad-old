import store from 'react-native-simple-store';
import _ from 'lodash';

const URL = 'https://linkpad-pharmacy-reviewer.firebaseapp.com/getalltips';
const KEY = 'tips';

let _tipsData = null;

fetchTipsData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let results = await fetch(URL);
      let json    = await results.json();
      resolve(json);
    } catch(error) {
      reject(error);
    }
  });
}

getTips = () => {
  return new Promise(async (resolve, reject) => {
    //has not been set, init with storage
    if(_tipsData == null){
      //get modules from storage
      _tipsData = await store.get(KEY);
    }
    //if stil empty after init with value from stotage
    if(_tipsData == null){
      try {
        //fetch from server
        let new_tips = await fetchTipsData();
        //assign to variable
        _tipsData = new_tips;
        //write tips to storage
        for(let tip in _tipsData){
          await store.push(KEY, _tipsData[tip]);
        }
      } catch(error) {
        //some error occured
        reject(error);
      }
    }
    //resolve tips data
    resolve(_tipsData);
  });
}

refreshTipsData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      //fetch modules from server
      let new_tips = await fetchTipsData();
      //delete previous tips stored
      await store.delete(KEY);
      //write tips to storage
      _tipsData = new_tips;
      //write to storage
      for(let tip in _tipsData){
        await store.push(KEY, _tipsData[tip]);
      }
    } catch(error) {
      //some error occured
      reject(error);
    }
    resolve(_tipsData);
  });
}

export default {
  fetchTipsData,
  getTips,
  refreshTipsData,
}