import store from 'react-native-simple-store';
import _ from 'lodash';

const URL = 'https://linkpad-pharmacy-reviewer.firebaseapp.com/getallmodules';
let _moduleData = null;


//structure of single question item in module subject.questions array
export class QuestionItem {
  constructor(question = { answer: '', choices: [], explanation: '', question: '' }){
    this.question = question;
  }

  get = () => {
    return _.cloneDeep(this.question);
  }
}

//structure of single subject item in modules.subjects array
export class SubjectItem {
  constructor(subject = {description: '', indexid: 0, lastupdated: '', questions: [], subjectname: ''}){
    this.subject = subject;
  }

  get = () => {
    return _.cloneDeep(this.subject);
  };

  getQuestions = () => {
    const { subject } = this;
    //note: written like this for VSCODE autocomplete to work
    let questions = [new QuestionItem(subject.questions[0])];
    //could have used foreach but needed to skip index 0
    for (let i = 1; i < subject.questions.length; i++) {
      questions.push(new SubjectItem(subject.questions[i]));
    }
    return questions;
  };

  getQuestionLength = () => {
    if( this.subject == null || this.subject.questions == null){
      return 0;
    };
    return this.subject.questions.length;
  }
}

//represents the structure for a single module item
export class ModuleItemModel {
  constructor(module = {description: '', indexid: 0, lastupdated: '', modulename: '', subjects: []}){
    this.module = module;
  }

  get = () => {
    return _.cloneDeep(this.module);
  }

  //returns an array of SubjectItem
  getSubjects = () => {
    const { module } = this;
    return module.subjects.map((item) => new SubjectItem(item));
  }

  getLenghtSubjects = () => _.compact(this.module.subjects).length;

  getTotalQuestions = () => {
    const subjectModels = this.getSubjects();
    let total = 0;
    subjectModels.forEach((subject) => 
      total += subject.getQuestionLength()
    );
    return total;
  }
}

export class ModulesManager {

  getModuAsModel = async () => {
    const modules = await getModuleData();
    //return new M
  }
}

fetchModuleData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let results = await fetch(URL);
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