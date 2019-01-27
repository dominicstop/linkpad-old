import { Clipboard } from 'react-native'
import { shuffleArray, getTimestamp } from './Utils';
import { QuestionItem } from './ModuleStore';
import store from 'react-native-simple-store';
import _ from 'lodash';

let _quizes = [];

export class CustomQuiz {
  constructor(quiz = {title: '', description: '', indexID_quiz: -1, timestampCreated: 0, questions: '',}){
    this._quiz = {
      title: '',
      description: '',
      indexID_quiz: -1,
      timestampCreated: 0,
      questions: [new QuestionItem().get()],
      ...quiz,
    };
  };

  get quiz(){
    return this._quiz;
  };

  get title(){
    return this.quiz.title;
  };

  get description(){
    return this.quiz.description;
  };

  get quizIndexID(){
    return this.quiz.quizIndexID;
  };

  get questions(){
    return this.quiz.questions;
  };

  get createdTimestamp(){
    return this.timestampCreated;
  };

  setTimestampCreated(){
    this.quiz.timestampCreated = getTimestamp();
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
      indexID_quiz: 0,
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
      let quizes = await store.get(ResourcesStore.KEY);
      _quizes = quizes;

      return (data);

    } catch(error){
      console.error('Failed to read quizes from store.');
      throw error;
    };
  };

  static get(){
    return _quizes;
  };

  static clear(){
    _quizes = null;
  };

  static async delete(){
    await store.delete(CustomQuizStore.KEY);
  };
};