import * as FileSystem from 'expo-file-system';
import store from 'react-native-simple-store';
import _ from 'lodash';

import { fetchWithProgress, replacePropertiesWithNull, createFolderIfDoesntExist, isBase64Image } from './Utils';

let _preboardData = null;

const BASE_DIR   = FileSystem.documentDirectory;
const FOLDER_KEY = 'preboard_images';

//response structure
const response = {
  active : false,
  success: false,
  examkey: -1   ,
  message: ''   ,
  exams  : [{
    indexid    : -1,
    timelimit  : -1,
    examname   : '',
    description: '',
    dateposted : '',
    startdate  : '',
    enddate    : '',
    exammodules: [{
      description  : '',
      indexid      : -1,
      premodulename: '',
      questions    : [{
        question     : '',
        explanation  : '',
        photofilename: '',
        photouri     : '',
        answer       : '',
        choices      : [{
          value: '',
        }],
      }],
    }],
  }],
};

function _processPreboard(data = {}){
  const preboard = PreboardExam.wrap(data);

  return {
    ...preboard,
    exams: (preboard.exams || []).map(exam => ({
      ...exam,
      exammodules: (exam.exammodules || []).map(module => {
        const examModuleID = `${exam.indexid}-${module.indexid}`;
        return {
          ...module, examModuleID, 
          indexid_exam: exam.indexid,
          questions: (module.questions || []).map((question, indexQuestion) => {
            const questionID = `${exam.indexid}-${module.indexid}-${indexQuestion}`;
            
            //extract choice strings from object array
            const choiceStrings = question.choices.map(
              choice => (choice || {}).value //returns undefined
            );
    
            //shared properties for each of the choiceItems
            const choiceItemsSharedValues = {
              indexid_exam     : exam.indexid  ,
              indexid_premodule: module.indexid,
              indexid_question : indexQuestion ,
              //pass down
              questionID, examModuleID
            };
    
            return {
              ...question, questionID, examModuleID,
              indexid_premodule: module.indexid,
              choiceItems: [
                //create the correct choice
                PreboardExamChoice.wrap({
                  ...choiceItemsSharedValues ,
                  choiceID: `${questionID}-0`,
                  value   : question.answer  ,
                  isAnswer: true             ,
                }),
                //create the other choices
                ...choiceStrings.map((choice, indexChoice) => PreboardExamChoice.wrap({
                  ...choiceItemsSharedValues,
                  choiceID: `${questionID}-${indexChoice + 1}`,
                  value   : choice,
                  isAnswer: false ,
                })),
              ],
            };
          }),
        };
      })
    })),
  };
};

/** store Base64 images to storage and replace with URI */
async function _saveBase64ToStorage(preboard = PreboardExam.structure){
  const { exams, ...restPreboard } = PreboardExam.wrap(preboard);

  try {
    //create folder if does not exist
    await createFolderIfDoesntExist(BASE_DIR + FOLDER_KEY);

    for (const exam of exams){
      for (const module of exam.exammodules) {
        for (const question of module.questions) {
          const { photouri, photofilename } = question;

          //check if uri is image
          const isImage = isBase64Image(photouri);
          //remove space from file name 
          const filename = photofilename.replace(/\ /g, '');
          //construct the uri for where the image is saved
          const img_uri = `${BASE_DIR}${FOLDER_KEY}/${filename}`;

          try {
            if(isImage){
              //save the base64 image to the fs
              await FileSystem.writeAsStringAsync(img_uri, photouri);
              //update tip uri
              question.photouri = img_uri;

            } else {
              //debug
              console.log('invalid base64 uri');
              console.log(tip.photouri.slice(0, 15));

              //replace with null if invalid uri
              question.photouri = null;
            };

          } catch(error){
            //debug
            console.log(`Unable to save image ${photofilename}`);
            console.log(`photouri: ${question.photouri.slice(0, 20)}`);
            console.log(error);

            //replace with null if cannot be saved to fs
            question.photouri = null;
          };
        };
      };
    };

    //resolve preboard
    return { exams, ...restPreboard };

  } catch(error){
    console.log('Unable to save images.');
    console.log(error);
    throw error;
  };
};

export class PreboardExamChoice {
  static structure = {
    value: '',
    //added afer processing
    choiceID         : -1   , //unique id for use in lists and comparison (in case the choices are falsy i.e null/undef etc.) or have the same exact string
    isAnswer         : false, //is the correct answer (choices and answers are merged together, or in cases where there are mult. correct answers)
    indexid_exam     : -1   , //passed down - which exam      this choice belongs to    
    indexid_question : -1   , //passed down - which question  this choice belongs to
    indexid_premodule: -1   , //passed down - which premodule this choice belongs to
    questionID       : ''   , //passed down - used for reconciling to question when they are separated
    examModuleID     : ''   , //passed down - used for reconciling to exam     when they are separated
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
    choices    : [],
    explanation: '',
    question   : '',
    //added after processing
    choiceItems      : PreboardExamChoice.wrapArray([]), //contains both the answer and choices
    indexid_exam     : -1, //passed down - which exam      this question belongs to
    indexid_premodule: -1, //passed down - which premodule this question belongs to
    questionID       : '', //passed down - unique id for use in lists and comparison
    examModuleID     : '', //passed down - used for reconciling to exam
  };

  static wrap(data = PreboardExamQuestion.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExamQuestion.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExamQuestion.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [PreboardExamQuestion.structure]){
    return items.map((item) => 
      PreboardExamQuestion.wrap(item)
    );
  };
};

export class PreboardExamModule {
  static structure = {
    indexid      : -1, 
    premodulename: '',
    description  : '',
    questions    : PreboardExamQuestion.wrapArray([]),
    //added after processing
    indexid_exam: '', //passed down - which exam this module belongs to
    examModuleID: '', //unique id for use in list
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

  static wrap(data = PreboardExam.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExam.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExam.structure),
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

  static async fetchAndSave(){
    try {
      //pipeline i.e: a -> b -> c
      const pb_raw       = await PreboardExamstore.fetch();
      const pb_processed = _processPreboard(pb_raw);
      const pb_imgsSaved = await _saveBase64ToStorage(pb_processed);

      //write to storage
      await store.save(PreboardExamstore.KEY, pb_imgsSaved);
      //update cache var
      _preboardData = pb_imgsSaved;
      //resolve
      return pb_imgsSaved;

    } catch(error){
      console.log('Failed to fetchAndSave preboard');
      console.log(error);
      console.log('\n');
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