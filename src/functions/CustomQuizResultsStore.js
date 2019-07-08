import { Clipboard } from 'react-native'
import _ from 'lodash';
import store from 'react-native-simple-store';

import { shuffleArray, getTimestamp, replacePropertiesWithNull } from './Utils';
import { QuizAnswer, QuizQuestion } from '../models/Quiz';
import { QuestionItem } from '../models/ModuleModels';

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
    return {
      //assign default properties w/ default values
      ...QuestionAnswerItem.structure,
      //remove all default values and replace w/ null
      ...replacePropertiesWithNull(QuestionAnswerItem.structure),
      //combine with obj from param
      ...(data || {}),
    };
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
    timestampSaved: -1,
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
    return {
      //assign default properties w/ default values
      ...CustomQuizResultItem.structure,
      //remove all default values and replace w/ null
      ...replacePropertiesWithNull(CustomQuizResultItem.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [CustomQuizResultItem.structure]){
    return (items || []).map(item => CustomQuizResultItem.wrap(item));
  };
};

/** collection of helper functions related to CustomQuizResults */
export class CustomQuizResults {
  /** filter out results that do not match quizID */
  static filterByQuizID(quizID = '', results = []){
    return results.filter(result => 
      result.indexID_quiz == quizID
    );
  };

  static processDurations({questions: _questions, durations = []}){
    const questions = QuestionItem.wrapArray(_questions);

    return durations = questions.map(question => {
      const { questionID } = question;
      //get all the durations that match this question
      const matchDurations = durations.filter(
        ({questionID: itemID}) => (itemID === questionID)
      );

      //add all the durations together
      const totalDuration = matchDurations.reduce(
        (acc, {duration}) => (acc + (duration || 0)), 0
      );

      return {
        questionID: question.questionID,
        totalTime : totalDuration,
        viewCount : matchDurations.length,
      };
    });
  };

  /** maps the answers and durations to the corresponding question  */
  static generateQAList({questions, answers: _answers, durations}){
    //remove question property from answer
    const answers = _answers.map((answer) => {
      //extract questions
      const { question, ...otherProperties } = answer;
      //return answer without questions
      return otherProperties;
    });

    return questions.map((question, index) => {
      //used for checking if question matches answers
      const questionID = `${question.indexID_module}-${question.indexID_subject}-${question.indexID_question}`;
      
      //find matching items, otherwise returns undefined
      const matchedAnswer    = answers  .find((answer  ) => (questionID === answer  .answerID  ));
      const matchedDurations = durations.find((duration) => (questionID === duration.questionID));
      
      //check if there is match
      const hasMatchedAnswer   = (matchedAnswer    != undefined);
      const hasMatchedDuration = (matchedDurations != undefined);      

      return({
        answer: matchedAnswer, //contains: timestampAnswered, userAnswer etc.
        hasMatchedAnswer     , //used to check if there's a matching answer
        questionID           , //used as unique id in list
        question             , //pass down question object
        //append computed durations
        durations: {
          hasDuration: hasMatchedDuration,
          totalTime  : matchedDurations.totalTime,
          viewCount  : matchedDurations.viewCount,
        },
      });
    });
  };

  /** goes through each item in the list and creates a result obj */
  static generateResultFromQAList(list){
    const unanswered = list.filter(answer => !answer.hasMatchedAnswer);
    const answered   = list.filter(answer =>  answer.hasMatchedAnswer);
  
    //viewCount answers that are correct/wrong etc.
    const correct   = answered.reduce((acc, {answer}) => acc += answer.isCorrect? 1 : 0, 0);
    const incorrect = answered.reduce((acc, {answer}) => acc += answer.isCorrect? 0 : 1, 0);
    const unaswered = unanswered.length;
  
    //add everything to get total
    const total = (correct + incorrect + unaswered);
  
    return({correct, incorrect, unaswered, total});
  };

  static createCustomQuizResult({quiz: _quiz, timeStats, startTime, questions, answers, durations: _durations}){
    const { indexID_quiz } = CustomQuizResultItem.wrap(_quiz);
    const currentTime = Date.now();

    const durations = CustomQuizResults.processDurations({questions, durations: _durations});
    const QAList    = CustomQuizResults.generateQAList({questions, answers, durations});
    const results   = CustomQuizResults.generateResultFromQAList(QAList);

    return CustomQuizResultItem.wrap({
      //pass down other info
      endTime            : currentTime,
      questionAnswersList: QAList,
      //pass down properties
      results, indexID_quiz, timeStats, startTime
    });
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
    await store.push(CustomQuizResultsStore.KEY, {
      ...quizResult,
      timestampSaved: Date.now(),
    });     
  };

  static clear(){
    _quizResults = null;
  };

  static async delete(){
    await store.delete(CustomQuizResultsStore.KEY);
  };
};