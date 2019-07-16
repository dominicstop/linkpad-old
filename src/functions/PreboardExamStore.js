import store from 'react-native-simple-store';
import _ from 'lodash';
import { fetchWithProgress } from './Utils';


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

  static wrap(){

  };

  static wrapArray(){

  };
};

export class PreboardExamAnswer {
  static structure = {
    answer   : PreboardExamChoice.structure, //the selected answer
    isCorrect: false, //true when matches the correct answer
    timestamp: -1   , //timestamp of when the answer was made
    answerID : -1   , //derived from choiceID
  };

  static wrap(){

  };

  static wrapArray(){

  };

  static create(){

  };
};

export class PreboardExamQuestion {
  static structure = {
    answer     : '',
    choices    : [],
    explanation: '',
    question   : '',
    //added after processing
    indexid_premodule: -1, //which premodule this question belongs to
    questionID       : '', //unique id for use in lists and comparison
  };

  static wrap(){

  };

  static wrapArray(){

  };
};

export class PreboardExamModule {
  static structure = {
    indexid      : -1, 
    premodulename: '',
    description  : '',
    questions    : [],
  };

  static wrap(){

  };

  static wrapArray(){

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
    exammodules: [],
  };

  static wrap(){

  };

  static wrapArray(){

  };
};

export class PreboardExam {
  static structure = {
    message: ''   ,
    success: false,
    active : false,
    examkey: -1   , 
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