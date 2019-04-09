import { Clipboard } from 'react-native'
import _ from 'lodash';
import store from 'react-native-simple-store';

import { shuffleArray, getTimestamp, replacePropertiesWithNull } from './Utils';
import { QuizQuestion } from '../models/Quiz';

let _quizes = [];

export class CustomQuiz {
  /** obj properties with default values */
  static structure = {
    title           : '',
    description     : '',
    indexID_quiz    : -1,
    timestampCreated: -1,
    questions       : QuizQuestion.wrapArray([]),
  };

  /** wrap object with CustomQuiz.structure to prevent missing properties and enable VSCODE type intellesense */
  static wrap(data = CustomQuiz.structure){
    return ({
      //assign default properties w/ default values
      ...CustomQuiz.structure,
      //remove all default values and replace w/ null
      ...replacePropertiesWithNull(CustomQuiz.structure),
      //combine with obj from param
      ...data,
    });
  };

  /** wraps each element in an array to make sure */
  static wrapArray(items = [CustomQuiz.structure]){
    return items.map((item) => 
      CustomQuiz.wrap(item)
    );
  };

  constructor(data = CustomQuiz.structure){
    this.data = CustomQuiz.wrap(data);
  };

  /** set the timestamp of when this quiz was created */
  setTimestampCreated(){
    this.data.timestampCreated = getTimestamp();
  };

  //---- getters ----
  /** get the quiz properties/data */
  get quiz(){
    return this.data;
  };

  /** Title of the custom quiz */
  get title(){
    return this.data.title;
  };

  /** Description of the custom quiz */
  get description(){
    return this.data.description;
  };

  /** Unique ID of the custom quiz */
  get quizIndexID(){
    return this.data.quizIndexID;
  };

  /** array of questions */
  get questions(){
    return this.data.questions;
  };

  /** time/date of when the quiz was created */
  get createdTimestamp(){
    return this.data.timestampCreated;
  };
};

export class CreateCustomQuiz {
  static createQuiz({title = '', description = '', selected = []}){
    const selectedCopy = _.cloneDeep(selected);

    //append indexid's to questions for identification
    selectedCopy.forEach((subject) => {
      //extract indexid from subject
      const { indexid, indexID_module } = subject;
      subject.questions.forEach((question, index) => {
        //append indexid's to questions
        question.indexID_module   = indexID_module;
        question.indexID_subject  = indexid;
        question.indexID_question = index;
      });
    });
    
    let questions = [];
    while(questions.length <= 100){
      for (let i = 0; i < selectedCopy.length; i++) {
        const subject = selectedCopy[i];
        //shuffle questions
        subject.questions = shuffleArray(subject.questions);
  
        if(subject.questions.length > 0){
          const question = subject.questions.pop();
          questions.push(question);
          selectedCopy[i] = subject;
        };  
      };

      const isEmpty = selectedCopy.every((subject) => {
        return subject.questions.length == 0;
      });
      if(isEmpty) break;
    };

    const customQuiz = new CustomQuiz({
      title, description, questions,
      indexID_quiz: getTimestamp(),
    });

    customQuiz.setTimestampCreated();
    return customQuiz;
  };
};

export class CustomQuizStore {
  static get KEY(){
    return 'custom-quiz';
  };

  /** read from store */
  static async read(){
    try {
      //read from store
      const raw_quizes = await store.get(CustomQuizStore.KEY);
      //wrap each quiz items
      const quizes = CustomQuiz.wrapArray(raw_quizes);
      //update cache variable
      _quizes = quizes;

      return (quizes);

    } catch(error){
      console.error('Failed to read quizes from store.');
      throw error;
    };
  };

  /** get quizes from cache variable */
  static get(){
    return CustomQuiz.wrapArray(_quizes);
  };

  /** replace existing quizes */
  static async set(quizes = CustomQuiz.wrapArray([])){
    //save new customquizes to store
    await store.save(CustomQuizStore.KEY, quizes); 
    //update cache variable
    _quizes = quizes;
  };

  /** clear cache variable */
  static clear(){
    _quizes = [];
  };

  /** delete all custom quizes from store */
  static async delete(){
    await store.delete(CustomQuizStore.KEY);
  };
};