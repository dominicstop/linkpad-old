import store from 'react-native-simple-store';
import _ from 'lodash';

const DEBUG = false;
const URL   = 'https://linkpad-pharmacy-reviewer.firebaseapp.com/getallresources';
const KEY   = 'resources';

let _resourcesData = null;

fetchFromServer = () => {
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

getResources = () => {
  return new Promise(async (resolve, reject) => {
    //has not been set, init with storage
    if(_resourcesData == null){
      //get modules from storage
      if (DEBUG) console.log('\nReading resources from storage...');
      _resourcesData = await store.get(KEY);
    }
    //if stil empty after init with value from stotage
    if(_resourcesData == null){
      try {
        //get new data from server
        if (DEBUG) console.log('Init null. Getting resources from server...');
        let new_resources = await fetchFromServer();
        //assign to global variable for later use
        _resourcesData = new_resources;
        //write resources to storage
        if (DEBUG) console.log('Writting fetched resources to storage...');
        for(let tip in _resourcesData){
          await store.push(KEY, _resourcesData[tip]);
        }
      } catch(error) {
        //some error occured
        if (DEBUG) console.log('Resources Error: ' + error);
        reject(error);
      }
    }
    if (DEBUG) console.log(_resourcesData);
    //resolve tips data
    resolve(_resourcesData);
  });
}

refreshResourcesData = () => {
  return new Promise(async (resolve, reject) => {
    if (DEBUG) console.log('\nRefreshing Resources...');
    try {
      //fetch resources from server
      if (DEBUG) console.log('Fetching resources from server...');
      let new_resources = await fetchFromServer();
      //delete previous resources stored
      if (DEBUG) console.log('Deleting previous stored tips...');
      await store.delete(KEY);
      //update global var
      _resourcesData = new_resources;
      //write to storage
      if (DEBUG) console.log('Writing resources to storage');
      for(let resource in _resourcesData){
        await store.push(KEY, _resourcesData[resource]);
      }
    } catch(error) {
      //some error occured
      if (DEBUG) console.log('Refresh resources Failed: ' + error);
      reject(error);
    }
    resolve(_resourcesData);
  });
}

clear = () => _resourcesData = null;

export default {
  fetchFromServer,
  getResources,
  refreshResourcesData,
  clear,
}