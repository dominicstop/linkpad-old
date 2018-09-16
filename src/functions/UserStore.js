import store from 'react-native-simple-store';
import _ from 'lodash';

const KEY = 'user';

let _userData = null;


getUserData = () => {
  return new Promise(async (resolve, reject) => {
    //has not been set, init with storage
    if(_userData == null){
      //get modules from storage
      _userData = await store.get(KEY);
    }
    //resolve tips data
    resolve(_userData);
  });
}

setUserData = (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      //update user data
      await store.update(KEY, userData);
      _userData = userData;
    } catch(error){
      reject(error);
    }
    //resolve tips data
    resolve(_userData);
  }); 
}

clear = () => _userData = null;

export default {
  getUserData,
  setUserData,
  clear,
}