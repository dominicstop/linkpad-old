import store from 'react-native-simple-store';
import _ from 'lodash';
import { fetchWithProgress, replacePropertiesWithNull } from './Utils';


let _preboardData = null;

export class PreboardExamChoice {
  static structure = {
    value: '',
    //added afer processing
    choiceID         : -1   , //unique id for use in lists and comparison (in case the choices are falsy i.e null/undef etc.) or have the same exact string
    isAnswer         : false, //is the correct answer (choices and answers are merged together, or in cases where there are mult. correct answers)
    indexid_question : -1   , //passed down from question - which question  this choice belongs to
    indexid_premodule: -1   , //passed down from question - which premodule this choice belongs to
    questionID       : ''   , //passed down from question (used for reconciling when they are separated)
  };

  static wrap(data = PreboardExamChoice.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExamChoice.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExamChoice.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [PreboardExamChoice.structure]){
    return items.map((item) => 
      PreboardExamChoice.wrap(item)
    );
  };
};

export class PreboardExamAnswer {
  static structure = {
    answer   : PreboardExamChoice.structure, //the selected answer
    isCorrect: false, //true when matches the correct answer
    timestamp: -1   , //timestamp of when the answer was made
    answerID : -1   , //derived from choiceID
  };

  static wrap(data = PreboardExamAnswer.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExamAnswer.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExamAnswer.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [PreboardExamAnswer.structure]){
    return items.map((item) => 
      PreboardExamAnswer.wrap(item)
    );
  };

  /** create an answer */
  static create(choice = PreboardExamChoice.structure, isCorrect = false){
    return PreboardExamAnswer.wrap({
      choice, isCorrect,
      timestamp: Date.now(),
      answerID : choice.choiceID,
    });
  };
};

export class PreboardExamQuestion {
  static structure = {
    answer     : '',
    choices    : PreboardExamChoice.wrapArray([]),
    explanation: '',
    question   : '',
    //added after processing
    indexid_premodule: -1, //which premodule this question belongs to
    questionID       : '', //unique id for use in lists and comparison
  };

  static wrap(data = PreboardExamChoice.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExamChoice.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExamChoice.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [PreboardExamChoice.structure]){
    return items.map((item) => 
      PreboardExamChoice.wrap(item)
    );
  };
};

export class PreboardExamModule {
  static structure = {
    indexid      : -1, 
    premodulename: '',
    description  : '',
    questions    : PreboardExamQuestion.wrapArray([]),
  };

  static wrap(data = PreboardExamModule.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExamModule.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExamModule.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [PreboardExamModule.structure]){
    return items.map((item) => 
      PreboardExamModule.wrap(item)
    );
  };
};

export class PreboardExamItem {
  static structure = {
    indexid    : '',
    examname   : '',
    description: '',
    dateposted : '',
    startdate  : '',
    enddate    : '',
    timelimit  : -1,
    exammodules: PreboardExamModule.wrapArray([]),
  };

  static structure = {
    answer     : '',
    choices    : PreboardExamChoice.wrapArray([]),
    explanation: '',
    question   : '',
    //added after processing
    indexid_premodule: -1, //which premodule this question belongs to
    questionID       : '', //unique id for use in lists and comparison
  };

  static wrap(data = PreboardExamItem.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExamItem.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExamItem.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [PreboardExamItem.structure]){
    return items.map((item) => 
      PreboardExamItem.wrap(item)
    );
  };
};

export class PreboardExam {
  static structure = {
    message: ''   ,
    success: false,
    active : false,
    examkey: -1   , 
    exams  : PreboardExamItem.wrapArray([]),
  };

  static wrap(data = PreboardExamItem.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExamItem.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExamItem.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };
};


export class PreboardExamstore {
  static get KEY(){
    return 'preboard';
  };

  /** describes the current operation being done*/
  static STATUS = {
    READING      : 'READING',
    WRITING      : 'WRITING',
    FETCHING     : 'FETCHING',
    SAVING_IMAGES: 'SAVING_IMAGES',
    FINISHED     : 'FINISHED',
  };

  static get URL(){
    return 'https://linkpad-pharmacy-reviewer.firebaseapp.com/getallpreboardexams';
  };

  static async fetch(){
    try {
      //get preboard from server
      let results = await fetch(PreboardExamstore.URL);
      let json    = await results.json();
      //resolve
      return (json);

    } catch(error) {
      console.log('Failed to fetch preboard from server.');
      console.log(error);
      throw error;
    };
  };

  static async fetchAndSaveWithProgress(callback){
    try {
      const { STATUS } = PreboardExamstore;
      const progressCallback = (loaded) => {
        //subtract 5% from the total percentage
        const percent = Math.round((loaded/105) * 100);
        callback && callback(percent, STATUS.FETCHING);
      };

      //fetch data from server
      const response = await fetchWithProgress(PreboardExamstore.URL, progressCallback);
      const json = response.data;

      //makes sure all of the properties exists and has a default value
      //todo: implement filter

      callback && callback(95, STATUS.SAVING_IMAGES);
      //process base64 images and store      
      //const preboard = await _saveBase64ToStorage(json);
      
      callback && callback(97, STATUS.WRITING);
      //write to storage
      await store.save(PreboardExamstore.KEY, json);

      callback && callback(100, STATUS.FINISHED);    
      return json;

    } catch(error){
      console.log('fetchAndSaveWithProgress: unable to save/fetch preboard');
      console.log(error);
      throw error;
    };
  };

  /** read preboard from store */
  static async read(){
    try {
      //read from store
      const data = await store.get(PreboardExamstore.KEY);

      //update cache var
      _preboardData = data;
      //resolve
      return (data);

    } catch(error){
      console.log('Failed to read preboard from store.');
      console.log(error);
      throw error;
    };
  };

  static async refresh(status){
    const { STATUS } = PreboardExamstore;

    try {
      status && status(STATUS.FETCHING);
      //fetch preboard from server
      const new_preboard = await PreboardExamstore.fetch();

      //check for changes
      const ispreboardNew = !_.isEqual(_preboardData, new_preboard);

      status && status(STATUS.WRITING);      
      //delete previous preboard stored
      await PreboardExamstore.delete();
      //write preboard to storage
      await store.save(PreboardExamstore.KEY, preboard_wrapped);

      //update cache var
      _preboardData = new_preboard;

      status && status(STATUS.FINISHED);
      //resolve
      return ({preboard: new_preboard, ispreboardNew});

    } catch(error) {
      console.log('Unable to refresh preboard.');
      console.log(error);
      
      throw error;
    };
  };

  static clear(){
    _preboardData = null;
  };

  static async delete(){
    _preboardData = null;
    await store.delete(PreboardExamstore.KEY);
  };
};