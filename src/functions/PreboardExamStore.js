import * as FileSystem from 'expo-file-system';
import store from 'react-native-simple-store';
import _ from 'lodash';

import { fetchWithProgress, createFolderIfDoesntExist, isBase64Image } from './Utils';
import { IMAGE_TYPE } from '../Constants';
import { PreboardExam, PreboardExamChoice, PreboardExamQuestion } from '../models/PreboardModel';

let _preboardData = null;

const BASE_DIR   = FileSystem.documentDirectory;
const FOLDER_KEY = 'preboard_images';

//raw response
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

            //if has photouri or photofilename, assume it's base64
            const imageType = ((question.photouri || question.photofilename)
              ? IMAGE_TYPE.BASE64 
              : IMAGE_TYPE.NONE
            );
            
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
              //pass down properties
              ...question, questionID, examModuleID, imageType,
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
          const { photouri, photofilename, imageType } = question;
          const hasImage = (photouri || photofilename || imageType != IMAGE_TYPE.NONE);
          //skip if doesn't have an image
          if(!hasImage) continue;

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
              //update question uri
              question.photouri  = img_uri;
              question.imageType = IMAGE_TYPE.FS_URI;

            } else {
              //debug
              if(__DEV__){
                console.log('invalid base64 uri, skipping...');
                console.log((question.photouri || '').slice(0, 15));
              };

              //replace with null if invalid uri
              question.photouri  = null;
              question.imageType = IMAGE_TYPE.FAILED;
            };

          } catch(error){
            //debug
            console.log(`Unable to save image ${photofilename}`);
            console.log(`photouri: ${(question.photouri || '').slice(0, 20)}`);
            console.log(error);

            //replace with null if cannot be saved to fs
            question.photouri  = null;
            question.imageType = IMAGE_TYPE.FAILED;
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

export class PreboardExamStore {
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
      let results = await fetch(PreboardExamStore.URL);
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
      const pb_raw       = await PreboardExamStore.fetch();
      const pb_processed = _processPreboard(pb_raw);
      const pb_imgsSaved = await _saveBase64ToStorage(pb_processed);

      //write to storage
      await store.save(PreboardExamStore.KEY, pb_imgsSaved);
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
      const { STATUS } = PreboardExamStore;
      const progressCallback = (loaded) => {
        //subtract 5% from the total percentage
        const percent = Math.round((loaded/105) * 100);
        callback && callback(percent, STATUS.FETCHING);
      };

      //fetch data from server
      const response = await fetchWithProgress(PreboardExamStore.URL, progressCallback);
      const json = response.data;

      //makes sure all of the properties exists and has a default value
      //todo: implement filter

      callback && callback(95, STATUS.SAVING_IMAGES);
      //process base64 images and store      
      //const preboard = await _saveBase64ToStorage(json);
      
      callback && callback(97, STATUS.WRITING);
      //write to storage
      await store.save(PreboardExamStore.KEY, json);

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
      const data = await store.get(PreboardExamStore.KEY);

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
    const { STATUS } = PreboardExamStore;

    try {
      status && status(STATUS.FETCHING);
      //fetch preboard from server
      const new_preboard = await PreboardExamStore.fetch();

      //check for changes
      const ispreboardNew = !_.isEqual(_preboardData, new_preboard);

      status && status(STATUS.WRITING);      
      //delete previous preboard stored
      await PreboardExamStore.delete();
      //write preboard to storage
      await store.save(PreboardExamStore.KEY, preboard_wrapped);

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
    await store.delete(PreboardExamStore.KEY);
  };

  /** get the base64Images from the question's URI's */
  static async getImages(questionItems = [PreboardExamQuestion.structure]){
    const questions = PreboardExamQuestion.wrapArray(questionItems);
    const base64Images = {};

    for(const question of questions){
      const { imageType, photouri } = question;
      
      try {
        if(imageType == IMAGE_TYPE.FS_URI){
          const base64Image = await FileSystem.readAsStringAsync(photouri);
          base64Images[photouri] = base64Image;
        };
      } catch(error){
        console.log('Preboard: Unable to getImages');
        console.log(error);
      };
    };

    return base64Images;
  };
};