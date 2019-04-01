import { Clipboard } from 'react-native'
import _ from 'lodash';
import store from 'react-native-simple-store';

import { shuffleArray, getTimestamp } from './Utils';

let _quizResults = [];

export class CustomQuizResultsStore {
  static get KEY(){
    return 'custom-quiz-results';
  };

  /** read from store */
  static async read(){
    try {
      //read from store
      let quizResults = await store.get(CustomQuizResultsStore.KEY);
      _quizResults = quizResults;

      return (quizResults);

    } catch(error){
      console.error('Failed to read quiz results from store.');
      throw error;
    };
  };

  /** read from cached value */
  static get(){
    return _quizResults;
  };

  static async set(quizResults = []){
    await store.save(CustomQuizResultsStore.KEY, quizResults); 
  };

  static async insert(quizResult){
    await store.push(CustomQuizResultsStore.KEY, quizResult);     
  };

  static clear(){
    _quizResults = null;
  };

  static async delete(){
    await store.delete(CustomQuizResultsStore.KEY);
  };
};