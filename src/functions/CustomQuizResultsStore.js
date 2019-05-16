import { Clipboard } from 'react-native'
import _ from 'lodash';
import store from 'react-native-simple-store';

import { shuffleArray, getTimestamp, replacePropertiesWithNull } from './Utils';
import { QuizAnswer, QuizQuestion } from '../models/Quiz';

let _quizResults = [];


export class QuestionAnswerItem {
  /** obj properties with default values */
  static structure = {
    question: QuizQuestion.wrap({}),
    hasMatchedAnswer: false,
    questionID: '',
    answer: {
      isCorrect: false,
      answerID: '',
      timestampAnswered: -1,
      userAnswer: '',
    },
    durations: {
      data: [],
      hasDuration: false,
      totalTime: -1,
      viewCount: -1,
    },
  };

  static wrap(data = QuestionAnswerItem.structure){
    return ({
      //assign default properties w/ default values
      ...QuestionAnswerItem.structure,
      //remove all default values and replace w/ null
      ...replacePropertiesWithNull(QuestionAnswerItem.structure),
      //combine with obj from param
      ...data || {},
    });
  };

  static wrapArray(items = [QuestionAnswerItem.structure]){
    return items.map(item => QuestionAnswerItem.wrap(item));
  };
};

export class CustomQuizResultItem {
  /** obj properties with default values */
  static structure = {
    questionAnswersList: QuestionAnswerItem.wrapArray([]),
    startTime: -1,
    endTime: -1,
    indexID_quiz: -1,
    results: {
      correct  : -1,
      incorrect: -1,
      unaswered: -1,
      total    : -1,
    },
    timeStats: {
      'min': -1,
      'max': -1,
      'avg': -1,
      'sum': -1,
    },
  };
  
  static wrap(data = CustomQuizResultItem.structure){
    return ({
      //assign default properties w/ default values
      ...CustomQuizResultItem.structure,
      //remove all default values and replace w/ null
      ...replacePropertiesWithNull(CustomQuizResultItem.structure),
      //combine with obj from param
      ...data || {},
    });
  };

  static wrapArray(items = [CustomQuizResultItem.structure]){
    return (items || []).map(item => CustomQuizResultItem.wrap(item));
  };
};

export class CustomQuizResultsStore {
  static get KEY(){
    return 'custom-quiz-results';
  };

  /** read raw data from store */
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

  static async readWrapped(){
    try {
      //read from store
      const items = await store.get(CustomQuizResultsStore.KEY);
      const quizResults = CustomQuizResultItem.wrapArray(items);
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