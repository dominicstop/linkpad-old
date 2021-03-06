import * as FileSystem from 'expo-file-system';

import store from 'react-native-simple-store';
import _ from 'lodash';

import { createFolderIfDoesntExist, isBase64Image, fetchWithProgress } from './Utils';
import { TipModel } from '../models/TipModel';

//temp store tips for caching
let _tipsData = null;

const BASE_DIR   = FileSystem.documentDirectory;
const FOLDER_KEY = 'tips_images';

/** store Base64 images to storage and replace with URI */
async function _saveBase64ToStorage(_tips = [tipModel.structure]){
  const tips = _.cloneDeep(_tips);

  try {
    //create folder if does not exist
    await createFolderIfDoesntExist(BASE_DIR + FOLDER_KEY);

    for (const tip of tips){
      const { photouri, photofilename } = tip;

      //check if uri is image
      const isImage = isBase64Image(photouri);
      //remove space from file name in ios
      const filename = photofilename.replace(/\ /g, '');
      //construct the uri for where the image is saved
      const img_uri = `${BASE_DIR}${FOLDER_KEY}/${filename}`;

      try {
        if(isImage){
          //save the base64 image to the fs
          await FileSystem.writeAsStringAsync(img_uri, photouri);
          //update tip uri
          tip.photouri = img_uri;

        } else {
          //debug
          console.log('invalid base64 uri');
          console.log(tip.photouri.slice(0, 15));

          //replace with null if invalid uri
          tip.photouri = null;
        };

      } catch(error){
        //debug
        console.log(`Unable to save image ${photofilename}`);
        console.log(`photouri: ${tip.photouri.slice(0, 20)}`);
        console.log(error);

        //replace with null if cannot be saved to fs
        tip.photouri = null;
      };
    };

    //resolve tips
    return tips;

  } catch(error){
    console.log('Unable to save images.');
    console.log(error);
    throw error;
  };
};

export class TipsStore {
  static get KEY(){
    return 'tips';
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
    return 'https://linkpad-pharmacy-reviewer.firebaseapp.com/getalltips';
  };

  static async fetch(){
    try {
      //get tips from server
      let results = await fetch(TipsStore.URL);
      let json    = await results.json();
      //resolve
      return (json);

    } catch(error) {
      console.log('Failed to fetch tips from server.');
      console.log(error);
      throw error;
    };
  };

  static async fetchAndSaveWithProgress(callback){
    try {
      const { STATUS } = TipsStore;
      const progressCallback = (loaded) => {
        //subtract 5% from the total percentage
        const percent = Math.round((loaded/105) * 100);
        callback && callback(percent, STATUS.FETCHING);
      };

      //fetch data from server
      const response = await fetchWithProgress(TipsStore.URL, progressCallback);
      const json = response.data;

      //makes sure all of the properties exists and has a default value
      //const tips_filtered = _filterModules(json);

      callback && callback(95, STATUS.SAVING_IMAGES);
      //process base64 images and store      
      const tips = await _saveBase64ToStorage(json);
      
      callback && callback(97, STATUS.WRITING);
      //write modules to storage
      await store.save(TipsStore.KEY, tips);

      callback && callback(100, STATUS.FINISHED);    
      return tips;

    } catch(error){
      console.log('fetchAndSaveWithProgress: unable to save/fetch tips');
      console.log(error);
      throw error;
    };
  };

  /** read tips from store */
  static async read(){
    try {
      //read from store
      const data = await store.get(TipsStore.KEY);

      //written like this, so that VS code can infer type
      const tips = [...(data || [])].map(tip => new TipModel(tip).get());

      //update cache var
      _tipsData = tips;
      //resolve
      return (tips);

    } catch(error){
      console.log('Failed to read tips from store.');
      console.log(error);
      throw error;
    };
  };

  /** read/fetch tips */
  static async get(status){
    const { STATUS } = TipsStore;

    if(_tipsData == null){
      status && status(STATUS.READING);
      //not init, get from store
      _tipsData = await TipsStore.read();
    };

    if(_tipsData == null){
      status && status(STATUS.FETCHING);
      //fetch tips from server
      const raw_tips = await TipsStore.fetch();

      status && status(STATUS.SAVING_IMAGES);
      const tips = await _saveBase64ToStorage(raw_tips);

      status && status(STATUS.WRITING);
      //write tips to storage
      await store.save(TipsStore.KEY, tips);

      //update global value for caching
      _tipsData = tips;
    };

    //resolve
    status && status(STATUS.FINISHED);
    return (_tipsData);
  };

  static async refresh(status){
    const { STATUS } = TipsStore;
    let isTipsNew = false;

    try {
      status && status(STATUS.FETCHING);
      //fetch tips from server
      const new_tips = await TipsStore.fetch();

      //check for changes
      isTipsNew = !_.isEqual(_tipsData, new_tips);

      status && status(STATUS.WRITING);
      //save base64 images to fs
      const tips_processed = await _saveBase64ToStorage(new_tips);
      //wrap in tipmodel for vscode autocomplete
      const tips_wrapped = tips_processed.map(tip => new TipModel(tip).get());
      
      //delete previous tips stored
      await TipsStore.delete();
      //write tips to storage
      await store.save(TipsStore.KEY, tips_wrapped);

      //update cache var
      _tipsData = tips_wrapped;

      status && status(STATUS.FINISHED);
      //resolve
      return ({tips: tips_wrapped, isTipsNew});

    } catch(error) {
      console.log('Unable to refresh tips.');
      console.log(error);
      
      throw error;
    };
  };

  static clear(){
    _tipsData = null;
  };

  static async delete(){
    _tipsData = null;
    await store.delete(TipsStore.KEY);
  };
};