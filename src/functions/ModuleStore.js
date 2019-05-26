import { Clipboard, ImageStore } from 'react-native';
import { FileSystem } from 'expo';
import store from 'react-native-simple-store';
import _ from 'lodash';

import { createFolderIfDoesntExist, isBase64Image , fetchWithProgress} from './Utils';
import { ModuleItemModel, SubjectItem, QuestionItem, IMAGE_TYPE } from '../models/ModuleModels';

//save a copy of modules
let _modules = null;

const BASE_DIR   = FileSystem.documentDirectory;
const FOLDER_KEY = 'module_images';

/** pass down properties such indexid's to each subject and questions */
function _filterModules(modules){
  try {
    //wrap raw data for vscode autocomplete and fill in missing properties
    const wrapped = ModuleItemModel.wrapArray(modules);

    //append indexID's to subject and questions
    return wrapped.map(module => ({
      ...module,
      //pass down indexid's to each subject
      subjects: (module.subjects || []).filter(subject => subject != undefined).map(subject => ({
        ...subject,
        //pass down the module name - for displaying in UI
        modulename : module.modulename,
        //used to identify which module the subject belongs to
        indexID_module: module.indexid,
        //uniqueID: combines the indexid's together - for convenience in identification 
        subjectID: `${module.indexid}-${subject.indexid}`,
        //pass down indexid's to each question
        questions: (subject.questions || []).filter(question => question != undefined).map((question, index) => ({
          ...question,
          //pass down the module and subject names - for displaying
          modulename : module.modulename,
          subjectname: subject.subjectname, 
          //used to identify which subject/module the question belongs to
          indexID_module  : module .indexid,
          indexID_subject : subject.indexid,
          indexID_question: index,
          //uniqueID: combines the indexid's together - for convenience in identification
          questionID: `${module.indexid}-${subject.indexid}-${index}`,
        })),
      })),
    }));
    
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

    //cant use map because it doesnt support await/.then
    for (const module of modules){
      for(const subject of module.subjects){
        for(const question of subject.questions){
          const { photouri, photofilename } = QuestionItem.wrap(question);

          //check if uri is image
          const isImage = isBase64Image(photouri || '');
          //remove space from file name in ios
          const filename = (photofilename || '').replace(/\ /g, '');
          //construct the uri for where the image is saved
          const img_uri = `${BASE_DIR}${FOLDER_KEY}/${filename}`;

          try {
            if(isImage){
              //save the base64 image to the fs
              await FileSystem.writeAsStringAsync(img_uri, photouri);
              //update module uri
              question.photouri = img_uri;
              question.imageType = IMAGE_TYPE.FS_URI;            

            } else {
              //replace with null if invalid uri
              question.photouri = null;
              question.imageType = IMAGE_TYPE.NONE;         
            };

          } catch(error){
            //replace with null if cannot be saved to fs
            question.photouri = null;
            question.imageType = IMAGE_TYPE.FAILED;
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

export class ModuleHelper {
  /** collapse module array into obj - access modules via object[id]. */
  static getModulesByID(modules){
    return modules.reduce((acc, module) => {
      const id = (module.indexid != undefined)? module.indexid : -1; 
      //skip if moduleid does not exist - because id can be 0 thus, if(0) false
      if(id == -1) return acc;
  
      //append module data to acc
      acc[id] = module;
      return acc;
    }, {});
  };

  /** collapse module array into obj - access modules via object[id]. */
  static getSubjectByID(modules){
    return modules.reduce((acc, module) => {
      const moduleID = (module.indexid  || -1);
      const subjects = (module.subjects || []);

      //skip if moduleid does not exist
      if(moduleID === -1) return acc;

      //collapse subject array into obj
      const subjectsAcc = subjects.reduce((subjectAcc, subject) => {
        const subjectID = (subject.indexid != undefined)? subject.indexid : -1; 
        //skip if subjectid does not exist
        if(subjectID == -1) return subjectAcc;
        
        //append subject data to acc
        subjectAcc[`${moduleID}-${subjectID}`] = subject;
        return subjectAcc;
      }, {});
      
      return {...acc, ...subjectsAcc};
    }, {});
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

  static async fetchAndSaveWithProgress(callback){
    try {
      const { STATUS } = ModuleStore;
      const progressCallback = (loaded) => {
        //subtract 5% from the total percentage
        const percent = Math.round((loaded/105) * 100);
        callback && callback(percent, STATUS.FETCHING);
      };

      //fetch data from server
      const response = await fetchWithProgress(ModuleStore.URL, progressCallback);
      const json = response.data;

      //makes sure all of the properties exists and has a default value
      const modules_filtered = _filterModules(json);

      callback && callback(95, STATUS.SAVING_IMAGES);
      //process base64 images and store      
      const modules = await _saveBase64ToStorage(modules_filtered);
      
      callback && callback(97, STATUS.WRITING);
      //write modules to storage
      await store.save(ModuleStore.KEY, modules);

      callback && callback(100, STATUS.FINISHED);    
      return modules;

    } catch(error){
      console.log('fetchAndSaveWithProgress: unable to save/fetch modules');
      console.log(error);
      throw error;
    };
  };

  /** read modules from store */
  static async read(){
    try {
      //read from store
      const data = await store.get(ModuleStore.KEY);
      //wrap raw data for vscode autocomplete and fill in missing properties
      const modules = ModuleItemModel.wrapArray(data);

      //update local/cache variable
      _modules = modules;
      return (modules);

    } catch(error){
      console.error('Failed to read modules from store.');
      throw error;
    };
  };

  static async getImages(modules){
    const base64Images = {};

    for (const module of modules){
      for(const subject of module.subjects){
        for(const question of subject.questions){
          const { imageType, photouri } = question;
          
          try {
            if(imageType == IMAGE_TYPE.FS_URI){
              const base64Image = await FileSystem.readAsStringAsync(photouri);
              base64Images[photouri] = base64Image;
            };
          } catch(error){
            console.log(error);
          };
        };
      };
    };
    return { modules, base64Images };
  };

  static async set(modules){
    await store.save(ModuleStore.KEY, modules);    
    _modules = data;
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