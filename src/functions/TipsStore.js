import store from 'react-native-simple-store';
import _ from 'lodash';

const DEBUG = false;
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
      if (DEBUG) console.log('\nReading tips from storage...');
      _tipsData = await store.get(KEY);
    }
    //if stil empty after init with value from stotage
    if(_tipsData == null){
      try {
        //fetch from server
        if (DEBUG) console.log('Getting Tips from server...');
        let new_tips = await fetchTipsData();
        //assign to variable
        _tipsData = new_tips;
        //write tips to storage
        if (DEBUG) console.log('Writting fetched tips to storage...');
        for(let tip in _tipsData){
          await store.push(KEY, _tipsData[tip]);
        }
      } catch(error) {
        //some error occured
        if (DEBUG) console.log('Tips Error: ' + error);
        reject(error);
      }
    }
    //resolve tips data
    resolve(_tipsData);
  });
}

refreshTipsData = () => {
  return new Promise(async (resolve, reject) => {
    if (DEBUG) console.log('\nRefreshing Tips...');
    try {
      //fetch modules from server
      if (DEBUG) console.log('Fetching tips from server...');
      let new_tips = await fetchTipsData();
      //delete previous tips stored
      if (DEBUG) console.log('Deleting previous stored tips...');
      await store.delete(KEY);
      //update global var
      _tipsData = new_tips;
      //write to storage
      if (DEBUG) console.log('Writing tips to storage');
      for(let tip in _tipsData){
        await store.push(KEY, _tipsData[tip]);
      }
    } catch(error) {
      //some error occured
      if (DEBUG) console.log('Refresh Tips Failed: ' + error);
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