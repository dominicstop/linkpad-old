import store from 'react-native-simple-store';
import _ from 'lodash';
import * as Utils from './Utils'
import {ModuleItemModel, QuestionItem} from './ModuleStore';

const KEY   = 'incomplete_practiceExams';
const DEBUG = false;


export class AnswerModel {
  constructor(data = {
    //used for checking which module/subject it belongs to
    indexID_module  : -1,
    indexID_subject : -1,
    indexID_question: -1,
    //store the answer results
    answer   : '',
    answerKey: '',
    isCorrect: false,
    //store when question was answered
    timestamp_answered: 0,
  }){
    this.data = data;
  };

  get(){
    return this.data;
  }

  getCopy(){
    //returns a copy w/o reference
    return _.clone(this.data);
  }

  getIndexIDs(){
    const  { indexID_module, indexID_subject, indexID_question } = this.data;
    return { indexID_module, indexID_subject, indexID_question };
  };

  getCompositeID(){
    const  { indexID_module, indexID_subject, indexID_question } = this.data;
    return (`${indexID_module}-${indexID_subject}-${indexID_question}`);
  };

  setIndexIDs = (indexIDs = {indexID_module: -1, indexID_subject: -1, indexID_question: -1}) => {
    this.data.indexID_module   = indexIDs.indexID_module  ;
    this.data.indexID_subject  = indexIDs.indexID_subject ;
    this.data.indexID_question = indexIDs.indexID_question;
  };

  setAnswerKey(answerKey = ''){
    this.data.answerKey = answerKey;
  };

  setAnswer(answer = ''){
    const { answerKey } = this.data;
    //show warning when correct answer is not set
    if(answerKey == ''){
      console.warn('correct answer is not set');
    };

    //set the answer and check if correct
    this.data.answer    = answer;
    this.data.isCorrect = answer == answerKey;
    //set timestamp 
    this.timestamp_answered = Utils.getTimestamp();
  };

  isAnswered(){
    const { answer } = this.data;
    return answer == '';
  };

  isInitialized(){
    const { indexID_module, indexID_question, indexID_subject, answerKey } = this.data;
    return(
      //not init. when id's are -1
      indexID_module   != -1 ||
      indexID_subject  != -1 ||
      indexID_question != -1 ||
      //not init. when answerKey is empty
      answerKey != '' 
    );
  }

}

export class IncompletePracticeExamModel {
  constructor(data = {
    //used for checking which module/subject it belongs to
    indexID_module : -1,
    indexID_subject: -1,
    //used for checking when it started/ended
    timestamp_started: 0,
    timestamp_ended  : 0,
    //holds the answered questions
    answers: [new AnswerModel().data],
  }){
    this.data = data;
    //wrap first answer in model
    const model = new AnswerModel(data.answers[0]);
    if(!model.isInitialized()){
      //overwrite answers with empty array
      this.data.answers = [];
    };
  };

  get(){
    return this.data;
  };

  getCopy(){
    //returns a copy w/o reference
    return _.clone(this.data);
  };

  setIndexIDs(indexIDs = {indexID_module: -1, indexID_subject: -1}){
    this.data.indexID_module  = indexIDs.indexID_module ;
    this.data.indexID_subject = indexIDs.indexID_subject;
  };

  setTimestampStart(){
    this.data.timestamp_started = Utils.getTimestamp();
  };

  setTimestampEnd(){
    this.data.timestamp_ended = Utils.getTimestamp();
  };

  getAnswersAsModel(){
    const { answers } = this.data;
    //wraps the answers inside a model
    return answers.map((item) => new AnswerModel(item));
  };

  isInitialized(){
    const { indexID_module, indexID_subject } = this.data;
    //not init when indexes are -1
    return (indexID_module == -1 || indexID_subject == -1);
  };

  isActive(){
    const { timestamp_started, timestamp_ended } = this.data;
    return (timestamp_started != 0 && timestamp_ended == 0);
  };
  
  //
  insertAnswerFromQuestion(question = new QuestionItem()){
    const { indexID_module, indexID_subject } = this.data;
    let answerModel = new AnswerModel({
      //append id's
      indexID_module, indexID_subject
    });
  };

};



let _incompletePracticeExams = null;

//returns the current timestamp
function getTimestamp(){
  const dateTime  = new Date().getTime();
  return Math.floor(dateTime / 1000);
}

let structure = {
  grades: [
    {
      indexID_module : '',
      indexID_subject: '',
      timestamp_started: '',
      timestamp_ended  : '',
      answers: [
        {
          indexID_question: '',
          answer: '',
          isCorrect: false,
          timestamp: '',
        }
      ]
    }
  ]
}

function get(forceRefresh = false){
  return new Promise(async (resolve, reject) => {
    //return iPE from private global var
    if(!forceRefresh) resolve(_incompletePracticeExams);

    try {
      //read from store
      let stored_iPE = await store.get(KEY);
      //update private global var
      _incompletePracticeExams = stored_iPE;
      //set timestamp
      lastUpadate = getTimestamp();
      //return iPE
      resolve(stored_iPE);

    } catch(error){
      //debug: print error
      if(DEBUG) console.log('iPE Get Error: ' + error);
      reject(error);
    }
  });
}

async function findMatch({indexID_module, indexID_subject}, forceRefresh = true){
  //debug: print params to console
  if(DEBUG){
    console.log('\n**********START');
    console.log('iPE: find match: ');
    console.log('indexID_module : ' + indexID_module );
    console.log('indexID_subject: ' + indexID_subject);
    console.log('**************END');
  }
  //get incompletePracticeExam from store 
  let current_iPE = await get(forceRefresh);
  

  //for keeping track of the matching iPE item
  let match_index = null;
  let match_iPE   = null;

  //loop through the current iPE's to check if the one being added exists
  match_iPE = current_iPE && current_iPE.find((item, index) => {
    //debug: print each iPE item
    if(DEBUG){
      console.log('\n-------------------LOOP');
      console.log('iPE item from store:     ');
      console.log('array index    : ' + index);
      console.log('indexID_module : ' + item.indexID_module );
      console.log('indexID_subject: ' + item.indexID_subject);
    }
    //store the matched current iPE's index
    match_index = index;
    //check if the iPE's from the store matches the id's from params
    return item.indexID_module == indexID_module && item.indexID_subject == indexID_subject;
  });

  //check if found matching iPE from store
  const hasMatch = match_index != null && match_iPE != null;

  //print the matched iPE from store and the new iPE
  if(DEBUG){
    console.log('\n=====================START');
    console.log('Has Match?: ' + hasMatch     );
    console.log('Matching iPE from store: '   );
    console.log('index: ' + match_index       );
    console.log( match_iPE                    );
    console.log('=========================END');
  }

  //return the matching iPE's
  return {match_index, match_iPE, hasMatch}
}

function set(incompletePracticeExams_array){
  return new Promise(async (resolve, reject) => {
    try {
      //delete previous data
      await store.delete(KEY);
      //write new data to storage
      for(let incompletePracticeExam of incompletePracticeExams_array){
        await store.push(KEY, incompletePracticeExam);
      }
      //update global var
      _incompletePracticeExams = incompletePracticeExams_array;
    } catch(error){
      //print error
      if(DEBUG) console.log('set error: ' + error);
      reject(error);
    }
    //resolve  data
    resolve(_incompletePracticeExams);
  }); 
}

function add(new_iPE){
  return new Promise(async (resolve, reject) => {
    try {
      //debug print parameter
      if(DEBUG){
        console.log('\n,,,,,,,,,,,START');
        console.log('iPE - adding item:');
        console.log(new_iPE);
        console.log(',,,,,,,,,,,,,,,,END');
      }
      
      //get iPE's from store 
      let current_iPE = await get(true);
      //debug: print current_iPE
      if(DEBUG){
        console.log('\n+++++++++++++++START');
        console.log('Read iPE from store:  ');
        console.log(current_iPE             );
        console.log('+++++++++++++++++++END');
      }

      //store matching iPE item from store
      let match_iPE = null;

      //if the store is not empty, check if iPE to be added already exists
      if(current_iPE != null){
        if(DEBUG) console.log('\ncurrent_iPE not null');

        //find match from store
        match_iPE = await findMatch(new_iPE, false);

        //if a matching iPE is found from the store
        if(match_iPE.hasMatch){
          //overwrite the new iPE to the old iPE
          current_iPE[match_iPE.match_index] = new_iPE;
          //print the current iPE after changing it
          if(DEBUG){
            console.log('\n.........START');
            console.log('After changing: ');
            console.log(current_iPE       );
            console.log('.............END');
          }
        }
      }

      //store isnt empty and current iPE doesnt exist yet
      if(current_iPE == null || !match_iPE.hasMatch){
        if(DEBUG) console.log('current iPE doesnt exist yet, Append: ');
        await store.push(KEY, new_iPE);

      } else {
        await store.save(KEY, current_iPE);
      }

    } catch(error){
      //print error to console
      if(DEBUG) console.log('Add iPE Error: ' + error);
      reject(error)
    }
    resolve();
  });
}

export default {
  get, set, add, findMatch,
}