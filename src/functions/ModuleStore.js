import store from 'react-native-simple-store';

let _moduleData = null;

fetchModuleData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let results = await fetch('https://linkpad-pharmacy-reviewer.firebaseapp.com/getallmodules');
      let json    = await results.json();
      resolve(json);
    } catch(error) {
      console.error('Failed to fetch modules...');
      reject(error);
    }
  });
}

getModuleData = () => {
  return new Promise(async (resolve, reject) => {
    //has not been set, init with storage
    if(_moduleData == null){
      //get modules from storage
      _moduleData = await store.get('modules');
    }
    //if stil empty after init with value from stotage
    if(_moduleData == null){
      try {
        //fetch modules from server
        _moduleData = await fetchModuleData();
        //write modules to storage
        for(let module in _moduleData){
          await store.push('modules', _moduleData[module]);
        }
      } catch(error) {
        //some error occured
        reject(error);
      }
    }

    //debug
    //console.log('\n\n\n\n Resolve Module Data');
    //console.log(_moduleData);

    //resolve module data
    resolve(_moduleData);
  });
}

refreshModuleData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      //fetch modules from server
      let new_modules = await fetchModuleData();
      //delete previous modules stored
      await store.delete('modules');
      //write modules to storage
      for(let module in new_modules){
        await store.push('modules', new_modules[module]);
      }
      //update global var
      _moduleData = new_modules;
    } catch(error) {
      //some error occured
      reject(error);
    }
    resolve(_moduleData);
  });
}

clear = () => _moduleData = null;

export default {
  fetchModuleData,
  getModuleData,
  refreshModuleData,
  clear,
}