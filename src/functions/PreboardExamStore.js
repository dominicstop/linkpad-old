import store from 'react-native-simple-store';
import _ from 'lodash';

const DEBUG = true;
const URL = 'https://linkpad-pharmacy-reviewer.firebaseapp.com/getallpreboardexams';
const KEY = 'preboard';

let _preboardData = null;

//structure of single exammodule item in preboard exams.exammodule array
export class PreboardExamModuleItem {
  constructor(examModule = { description: '', indexid: 0, premodulename: '', questions: []}){
    this.examModule = examModule;
  }

  get = () => {
    return _.cloneDeep(this.examModule);
  }
}

//structure of single exam item in preboard exams array
export class PreboardExamItem {
  constructor(exam = {dateposted: '', description: '', enddate: '', exammodules: []}){
    this.exam = exam;
  }

  get = () => {
    return _.cloneDeep(this.exam);
  };

  getExamModules = () => {
    const { exam } = this;
    //note: written like this for VSCODE autocomplete to work
    let exams = [new PreboardExamModuleItem(exam.exammodules[0])];
    //could have used foreach but needed to skip index 0
    for (let i = 1; i < exam.exammodules.length; i++) {
      exams.push(new PreboardExamItem(exam.exammodules[i]));
    }
    return exams;
  }
}

//represents the structure of the json response for exam
export class PreboardExam {
  constructor(response = {message: '', success: false, exams: [], active: false, examkey: 0}){
    this.response = response;
  }

  get = () => {
    return _.cloneDeep(this.response);
  }

  //returns an array of PreboardExamItem
  getExams = () => {
    const { response } = this;
    //note: written like this for VSCODE autocomplete to work
    let exams = [new PreboardExamItem(response.exams[0])];
    //could have used foreach but needed to skip index 0
    for (let i = 1; i < response.exams.length; i++) {
      exams.push(new PreboardExamItem(response.exams[i]));
    }
    return exams;
  }
}

fetchPreboard = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let results = await fetch(URL);
      let json    = await results.json();
      resolve(json);
      
    } catch(error) {
      reject('Preboard fetchPreboard error.');
    }
  });
}

get = () => {
  return new Promise(async (resolve, reject) => {
    try {
      //has not been set, init with storage
      if(_preboardData == null){
        //get modules from storage
        if (DEBUG) console.log('\nReading preboard from storage...');
        _preboardData = await store.get(KEY);
      }
      //if stil empty after init with value from stotage
      if(_preboardData == null){
        //fetchPreboard from server
        if (DEBUG) console.log('Nothing stored. Getting preboard from server...');
        let new_preboard = await fetchPreboard();
        //assign to global variable
        _preboardData = new_preboard;
        //write preboard to storage
        if (DEBUG) console.log('Writting preboard to storage...');
        await store.save(KEY, _preboardData);      
      }
      //resolve preboard data
      resolve(_preboardData);
  
    } catch(error){
      //some error occured
      if (DEBUG) console.log('preboard Error: ' + error);
      reject(error);
    }
  })
}

refresh = async () => {
  if (DEBUG) console.log('\nRefreshing preboard...');
  try {
    //fetchPreboard modules from server
    if (DEBUG) console.log('fetchPreboarding preboard from server...');
    let new_preboard = await fetchPreboard();

    //delete previous preboard stored
    if (DEBUG) console.log('Deleting previous stored preboard...');
    await store.delete(KEY);

    //update global var
    _preboardData = new_preboard;

    //write to storage
    if (DEBUG) console.log('Writing preboard to storage');
    await store.save(KEY, _preboardData);

  } catch(error) {
    //some error occured
    if (DEBUG) console.log('Refresh preboard Failed: ' + error);
    return Promise.reject(new Error('Preboard refresh error.'));
  }
  //resolve preboard data
  return(_preboardData);
}

clear = () => _preboardData = null;

export default {
  fetchPreboard,
  get,
  refresh,
  clear,
}
