import store from 'react-native-simple-store';
import { getTimestamp } from './Utils';

const _modulesLastUpdated = null;
export class ModulesLastUpdated {
  static get KEY() {
    return 'modulesLastUpdated';
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

  static get(){
    return _modulesLastUpdated;
  };
};

const _resourcesLastUpdated = null;
export class ResourcesLastUpdated {
  static get KEY() {
    return 'resourcesLastUpdated';
  };

  static async setTimestamp(){
    const key = ResourcesLastUpdated.KEY;

    _resourcesLastUpdated = getTimestamp();
    await store.save(key, _resourcesLastUpdated);

    return _resourcesLastUpdated;
  };

  static async read(){
    const key = ResourcesLastUpdated.KEY;

    let timestamp = await store.get(key);
    _resourcesLastUpdated = timestamp;

    return timestamp;
  };

  static get(){
    return _resourcesLastUpdated;
  };
};

const _tipsLastUpdated = null;
export class TipsLastUpdated {
  static get KEY() {
    return 'tipsLastUpdated';
  };

  static async setTimestamp(){
    const key = TipsLastUpdated.KEY;

    _tipsLastUpdated = getTimestamp();
    await store.save(key, _tipsLastUpdated);

    return _tipsLastUpdated;
  };

  static async read(){
    const key = TipsLastUpdated.KEY;

    let timestamp = await store.get(key);
    _tipsLastUpdated = timestamp;

    return timestamp;
  };

  static async get(shouldRefresh = false){
    if(shouldRefresh || _tipsLastUpdated == null){
      let timestamp = await TipsLastUpdated.read();
      _tipsLastUpdated = timestamp;
    };

    return _tipsLastUpdated;
  };
};