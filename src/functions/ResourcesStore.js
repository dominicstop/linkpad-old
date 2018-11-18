import store from 'react-native-simple-store';
import _ from 'lodash';

const DEBUG = false;

export class ResourceModel {
  constructor(data = {
    //from backend resp
    description: '',
    dateposted : '',
    title      : '',
    link       : '',
    indexid    : -1,
  }){
    this.data = data;
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

let _resourcesData = null;
export class ResourcesStore {
  static get KEY(){
    return 'resources';
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
      console.error('Failed to fetch resources...');
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
      console.error('Failed to read resources from store.');
      throw error;
    };
  };

  /** read/fetch resources */
  static async get(){
    if(_resourcesData == null){
      //not init, get from store
      _resourcesData = await ResourcesStore.read();
    };

    if(_resourcesData == null){
      //fetch resources from server
      _resourcesData = await ResourcesStore.fetch();

      //write resources to storage
      for(let module in _resourcesData){
        await store.push('resources', _resourcesData[module]);
      };
    };

    //resolve
    return (_resourcesData);
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
      for(let module in new_resources){
        await store.push('resources', new_resources[module]);
      };

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