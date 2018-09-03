import store from 'react-native-simple-store';

let _moduleData = null;

fetchModuleData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let results = await fetch('https://linkpad-pharmacy-reviewer.firebaseapp.com/getallmodules');
      console.log('\n\n\nresults.data');
      console.log(results.data);
      let json    = await results.json();
      //console.log('json result');
      //console.log(json);
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
      //debug
      console.log('Fetching modules storage...');
      //get modules from storage
      _moduleData = await store.get('modules');
    }
    //if stil empty after init with value from stotage
    if(_moduleData == null){
      try {
        //debug
        console.log('Storage Empty! Fetching modules from server and saving to storage...');
        //fetch modules from server
        _moduleData = await fetchModuleData();
        //write modules to storage
        console.log('Looping through modules and storing to storage')
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

export default {
  fetchModuleData,
  getModuleData,
}