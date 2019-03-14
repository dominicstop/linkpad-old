import { FileSystem, Clipboard } from 'react-native';
import Expo from 'expo';

import store from 'react-native-simple-store';
import _ from 'lodash';

import { createFolderIfDoesntExist, isBase64Image } from './Utils';
import { ModuleItemModel, SubjectItem, QuestionItem } from '../models/ModuleModels';

//save a copy of modules
let _modules = null;

const BASE_DIR   = Expo.FileSystem.documentDirectory;
const FOLDER_KEY = 'module_images';

/** makes sure all the properties exists and removes invalid items */
function _filterModules(_modules = [ModuleItemModel.structure]){
  try {
    const modules = _.cloneDeep(_modules);
  
    //make sure each/all modules have default values/properties
    return modules.map(module => {
      //assign default values and missing properties to module
      const module_wrapped = ModuleItemModel.wrap(module);
      const {subjects} = module_wrapped;

      //filter out null subjects
      const subjects_filtered = subjects.filter(subject => subject != null);

      return {
        ...module_wrapped,
        //make sure each/all subjects have default values/properties
        subjects: subjects_filtered.map(subject => {
          //assign default values and missing properties to subject
          const subject_wrapped = SubjectItem.wrap(subject);
          const {questions} = subject_wrapped;

          //filter out null questions
          const quesions_filtered = questions.filter(question => question != null);

          return {
            ...subject_wrapped,
            //assign indexid's
            indexID_module: module_wrapped.indexid,
            //make sure each/all subjects have default values/properties
            questions: quesions_filtered.map(question => {
              //assign default values and missing properties to question
              const question_wrapped = QuestionItem.wrap(question);

              return {
                ...question_wrapped,
                //assign indexid's
                indexID_module: module_wrapped.indexid,
                indexID_subject: subject_wrapped.indexid,
              };
            })
          };
        })
      };
    });
  } catch(error){
    console.log('Unable to filter modules');
    console.log(error);
    throw error;
  };
};

/** store Base64 images to storage and replace with URI */
async function _saveBase64ToStorage(_modules = [ModuleItemModel.structure]){
  const modules = _.cloneDeep(_modules);

  try {
    //create folder if does not exist
    await createFolderIfDoesntExist(BASE_DIR + FOLDER_KEY);

    for (const module of modules){
      for(const subject of module.subjects){
        for(const question of subject.questions){
          const { photouri, photofilename } = QuestionItem.wrap(question);

          //check if uri is image
          const isImage = isBase64Image(photouri);
          //construct the uri for where the image is saved
          const img_uri = `${BASE_DIR}${FOLDER_KEY}/${photofilename}`;

          try {
            if(isImage){
              //save the base64 image to the fs
              await Expo.FileSystem.writeAsStringAsync(img_uri, photouri);
              //update module uri
              question.photouri = img_uri;

            } else {
              //replace with null if invalid uri
              question.photouri = null;
            };

          } catch(error){
            //replace with null if cannot be saved to fs
            question.photouri = null;
            console.log(`Unable to save image ${photofilename}`); 
            console.log(error);
          };
        };
      };
    };

    //resolve modules
    return modules;

  } catch(error){
    console.log('Unable to save images.');
    console.log(error);
    throw error;
  };
};

export class ModuleStore {
  static get KEY(){
    return 'modules';
  };

  static get URL(){
    return 'https://linkpad-pharmacy-reviewer.firebaseapp.com/getallmodules';
  };

  /** describes the current operation being done*/
  static STATUS = {
    READING      : 'READING',
    WRITING      : 'WRITING',
    FETCHING     : 'FETCHING',
    SAVING_IMAGES: 'SAVING_IMAGES',
    FINISHED     : 'FINISHED',
  };

  /** get from backend */
  static async fetch(){
    try {
      //get modules from server
      let results = await fetch(ModuleStore.URL);
      let json    = await results.json();
      //resolve
      return (json);

    } catch(error) {
      console.error('Failed to fetch modules...');
      throw error;
    };
  };

  /** read modules from store */
  static async read(){
    try {
      //read from store
      let data = await store.get(ModuleStore.KEY);
      _modules = data;

      return (data);

    } catch(error){
      console.error('Failed to read modules from store.');
      throw error;
    };
  };

  /** read/fetch modules */
  static async get(status){
    const { STATUS } = ModuleStore;
    try {
      if(_modules == null){
        status && status(STATUS.READING);
        //not init, get from store
        _modules = await ModuleStore.read();
      };
  
      if(_modules == null){
        status && status(STATUS.FETCHING);
        //fetch modules from server
        const modules_raw = await ModuleStore.fetch();
  
        //makes sure all of the properties exists and has a default value
        const modules_filtered = _filterModules(modules_raw);
        
        status && status(STATUS.SAVING_IMAGES);
        //process base64 images and store      
        const modules = await _saveBase64ToStorage(modules_filtered);
        
        status && status(STATUS.WRITING);
        //write modules to storage
        await store.save(ModuleStore.KEY, modules);
  
        //update cache variable
        _modules = modules;
      };

      //resolve
      status && status(STATUS.FINISHED);      
      return (_modules);

    } catch(error){
      console.log(error);
      console.log('Failed to read/fetch modules from store.');
      throw error;
    };
  };

  static async refresh(status){
    const { STATUS } = ModuleStore;
    let isModuleNew = false;

    try {
      status && status(STATUS.FETCHING);
      //fetch modules from server
      let modules_raw = await ModuleStore.fetch();
      //check for changes
      isModuleNew = !_.isEqual(_modules, modules_raw);

      //makes sure all of the properties exists and has a default value
      const modules_filtered = _filterModules(modules_raw);
        
      status && status(STATUS.SAVING_IMAGES);
      //process base64 images and store      
      const modules = await _saveBase64ToStorage(modules_filtered);
      
      status && status(STATUS.WRITING);
      //delete previous modules stored
      await ModuleStore.delete();
      //write modules to storage
      await store.save(ModuleStore.KEY, modules);

      //update cache variable
      _modules = modules;

      //resolve
      status && status(STATUS.FINISHED);      
      return (_modules);

    } catch(error) {
      console.log('Unable to refresh modules.');
      console.error(error);
      throw error;
    };
  };

  static clear(){
    _modules = null;
  };

  static async delete(){
    await store.delete(ModuleStore.KEY);
  };
};