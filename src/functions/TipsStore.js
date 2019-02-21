import store from 'react-native-simple-store';
import _ from 'lodash';

let _tipsData = null;
export class TipsStore {
  static get KEY(){
    return 'tips';
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

  /** read tips from store */
  static async read(){
    try {
      //read from store
      let data = await store.get(TipsStore.KEY);
      _tipsData = data;

      return (data);

    } catch(error){
      console.log('Failed to read tips from store.');
      console.log(error);
      throw error;
    };
  };

  /** read/fetch tips */
  static async get(){
    if(_tipsData == null){
      //not init, get from store
      _tipsData = await TipsStore.read();
    };

    if(_tipsData == null){
      //fetch tips from server
      _tipsData = await TipsStore.fetch();

      //write tips to storage
      await store.save(TipsStore.KEY, _tipsData);
    };

    //resolve
    return (_tipsData);
  };

  static async refresh(){
    let isTipsNew = false;

    try {
      //fetch tips from server
      let new_tips = await TipsStore.fetch();
      //check for changes
      isTipsNew = _.isEqual(_tipsData, new_tips);
      
      //delete previous tips stored
      TipsStore.delete();

      //write tips to storage
      await store.save(TipsStore.KEY, new_tips);

      //update global var
      _tipsData = new_tips;

      //resolve
      return ({
        tips: _tipsData,
        isTipsNew
      });

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
    await store.delete(TipsStore.KEY);
  };
};