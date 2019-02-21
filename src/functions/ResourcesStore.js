import { FileSystem } from 'react-native';
import store from 'react-native-simple-store';
import _ from 'lodash';

import { isDataURL , getBase64MimeType, isMimeTypeImage, isBase64Image} from './Utils';
import Expo from 'expo';

let _doesFolderExist = false;
let _resourcesData = null;

const DEBUG = false;

const BASE_DIR   = Expo.FileSystem.documentDirectory;
const FOLDER_KEY = 'resource_images';

export class ResourceModel {
  static structure = {
    description  : '',
    dateposted   : '',
    title        : '',
    link         : '',
    indexid      : -1,
    photouri     : '',
    photofilename: '',
  };

  constructor(data = ResourceModel.structure){
    this.data = {...ResourceModel.structure, ...data};
  };

  get title(){
    return this.data.title || '';
  };

  get link(){
    return this.data.link || '';
  };

  get dateposted(){
    return this.data.dateposted || '';
  };

  get description(){
    return this.data.description || '';
  };

  get(){
    return this.data;
  };
};

async function _createFolderIfDoesntExist(){
  //params for getinfoasync
  const folder_uri = BASE_DIR + FOLDER_KEY;
  const options    = {size: false, md5: false};

  try {
    //get details of folder
    const info = await Expo.FileSystem.getInfoAsync(folder_uri, options);
    const { exists, isDirectory } = info;

    const shouldMakeDirectory = (!exists && !isDirectory);
    if(shouldMakeDirectory){
      //create direcory
      await Expo.FileSystem.makeDirectoryAsync(folder_uri);
      _doesFolderExist = true;
      alert('Make Directory');
    };

  } catch(error){
    console.log('Unable to create folder');
    console.log(error);
    throw error;
  };
};

/** store Base64 images to storage and replace with URI */
async function _saveBase64ToStorage(_resources = [ResourceModel.structure]){
  const resources = _.cloneDeep(_resources);

  try {
    //create folder if does not exist
    await _createFolderIfDoesntExist();

    for (const resource of resources){
      const { photouri, photofilename } = resource;

      //check if uri is image
      const isImage = isBase64Image(photouri);
      //construct the uri for where the image is saved
      const img_uri = `${BASE_DIR}${FOLDER_KEY}/${photofilename}`;

      try {
        if(isImage){
          //save the base64 image to the fs
          await Expo.FileSystem.writeAsStringAsync(img_uri, photouri);
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

  static async refresh(){
    let isResourcesNew = false;
    
    try {
      //fetch resources from server
      let new_resources = await ResourcesStore.fetch();
      //check for changes
      isResourcesNew = _.isEqual(_resourcesData, new_resources);
      
      //delete previous resources stored
      ResourcesStore.delete();

      //write resources to storage
      await store.save(ResourcesStore.KEY, _resourcesData);

      //update global var
      _resourcesData = new_resources;

      //resolve
      return ({
        resources: _resourcesData,
        isResourcesNew,
      });

    } catch(error) {
      console.error('Unable to refresh resources.');
      throw error;
    };
  };

  static clear(){
    _resourcesData = null;
  };

  static async delete(){
    await store.delete(ResourcesStore.KEY);
  };
};