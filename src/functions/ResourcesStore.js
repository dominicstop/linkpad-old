import { FileSystem } from 'expo';

import store from 'react-native-simple-store';
import _ from 'lodash';

import { createFolderIfDoesntExist, isBase64Image, fetchWithProgress } from './Utils';
import { ResourceModel } from '../models/ResourceModel';

//temp store resources for caching
let _resourcesData = null;
const DEBUG = false;

const BASE_DIR   = FileSystem.documentDirectory;
const FOLDER_KEY = 'resource_images';

/** store Base64 images to storage and replace with URI */
async function _saveBase64ToStorage(_resources = [ResourceModel.structure]){
  const resources = _.cloneDeep(_resources);

  try {
    //create folder if does not exist
    await createFolderIfDoesntExist(BASE_DIR + FOLDER_KEY);

    for (const resource of resources){
      const { photouri, photofilename } = resource;

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
          //update resource uri
          resource.photouri = img_uri;

        } else {
          //replace with null if invalid uri
          resource.photouri = null;
        };

      } catch(error){
        //replace with null if cannot be saved to fs
        resource.photouri = null;
        console.log(`Unable to save image ${photofilename}`); 
        console.log(error);
      };
    };

    //resolve resources
    return resources;

  } catch(error){
    console.log('Unable to save images.');
    console.log(error);
    throw error;
  };
};

export class ResourcesStore {
  static get KEY(){
    return 'resources';
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
    return 'https://linkpad-pharmacy-reviewer.firebaseapp.com/getallresources';
  };

  static async fetch(){
    try {
      //get resources from server
      let results = await fetch(ResourcesStore.URL);
      let json    = await results.json();
      //resolve
      return (json);

    } catch(error) {
      console.log(error);
      console.log('Failed to fetch resources.');
      throw error;
    };
  };

  static async fetchAndSaveWithProgress(callback){
    try {
      const { STATUS } = ResourcesStore;
      const progressCallback = (loaded) => {
        //subtract 5% from the total percentage
        const percent = Math.round((loaded/105) * 100);
        callback && callback(percent, STATUS.FETCHING);
      };

      //fetch data from server
      const response = await fetchWithProgress(ResourcesStore.URL, progressCallback);
      const json = response.data;

      callback && callback(95, STATUS.SAVING_IMAGES);
      //process base64 images and store      
      const resources = await _saveBase64ToStorage(json);
      
      callback && callback(97, STATUS.WRITING);
      //write modules to storage
      await store.save(ResourcesStore.KEY, resources);

      callback && callback(100, STATUS.FINISHED);    
      return resources;

    } catch(error){
      console.log('fetchAndSaveWithProgress: unable to save/fetch resources');
      console.log(error);
      throw error;
    };
  };

  /** read resources from store */
  static async read(){
    try {
      //read from store
      let data = await store.get(ResourcesStore.KEY);
      _resourcesData = data;
      return (data);

    } catch(error){
      console.log(error);
      console.log('Failed to read resources from store.');
      throw error;
    };
  };

  /** read/fetch resources */
  static async get(status){
    const { STATUS } = ResourcesStore;
    try {
      if(_resourcesData == null){
        status && status(STATUS.READING);
        //not init, get from store
        _resourcesData = await ResourcesStore.read();
      };
  
      if(_resourcesData == null){
        status && status(STATUS.FETCHING);
        //fetch resources from server
        const raw_resources = await ResourcesStore.fetch();

        status && status(STATUS.SAVING_IMAGES);
        //process base64 images and store
        const resources = await _saveBase64ToStorage(raw_resources);
        
        status && status(STATUS.WRITING);
        //write resources to storage
        await store.save(ResourcesStore.KEY, resources);

        //update global value for caching
        _resourcesData = resources;
      };
  
      //resolve
      status && status(STATUS.FINISHED);      
      return (_resourcesData);

    } catch(error){
      console.log(error);
      console.log('Failed to read/fetch resources from store.');
      throw error;
    };
  };

  static async refresh(status){
    const { STATUS } = ResourcesStore;
    let isResourcesNew = false;
    
    try {
      status && status(STATUS.FETCHING);
      //fetch resources from server
      let new_resources = await ResourcesStore.fetch();
      //check for changes
      isResourcesNew = !_.isEqual(_resourcesData, new_resources);
      
      status && status(STATUS.WRITING);
      //delete previous resources stored
      await ResourcesStore.delete();

      //process base64 images and store
      const resources = await _saveBase64ToStorage(new_resources);

      //write resources to storage
      await store.save(ResourcesStore.KEY, resources);

      //update global var
      _resourcesData = resources;

      status && status(STATUS.FINISHED);
      //resolve
      return ({
        resources: _resourcesData,
        isResourcesNew,
      });

    } catch(error) {
      console.log('Unable to refresh resources.');
      console.log(error);
      throw error;
    };
  };

  static clear(){
    _resourcesData = null;
  };

  static async delete(){
    _resourcesData = null;
    await store.delete(ResourcesStore.KEY);
  };
};