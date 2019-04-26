import store from 'react-native-simple-store';
import _ from 'lodash';

let _userData = null;

export class UserModel {
  static structure = {
    email    : '',
    firstname: '',
    lastlogin: '',
    lastname : '',
    userid   : '',
    uid      : '',
    ispremium: false,
  };

  static wrap(user = UserModel.structure){
    return {...UserModel.structure, ...user || {}};
  };
};

export class UserStore {
  static get KEY(){
    return 'user';
  };

  /** read user data from store */
  static async read(){
    try {
      //read from store
      const data = await store.get(UserStore.KEY);
      //update cahched value
      _userData = data;
      return (data);

    } catch(error){
      console.error('Failed to read user data from store.');
      throw error;
    };
  };

  static get(){
    return _userData;
  };

  static async set(user){
    await store.save(UserStore.KEY, user);    
    _userData = user;
  };

  static clear(){
    _userData = null;
  };

  static async delete(){
    await store.delete(UserStore.KEY);
  };
};