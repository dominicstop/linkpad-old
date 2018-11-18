import store from 'react-native-simple-store';
import {getTimestamp} from './Utils';

const _modulesLastUpdated = '';

export class ModulesLastUpdated {
  static get KEY() {
    return 'modulesLastUpdated';
  };

  static get(){
    return _modulesLastUpdated;
  };

  static async setTimestamp(){
    const key = ModulesLastUpdated.KEY;

    _modulesLastUpdated = getTimestamp();
    await store.save(key, _modulesLastUpdated);

    return _modulesLastUpdated;
  };

  static async read(){
    const key = ModulesLastUpdated.KEY;

    let timestamp = await store.get(key);
    _modulesLastUpdated = timestamp;

    return timestamp;
  };
};