//note: the models/objects are written like tbis for VSCODE type inference and autocomplete

import _ from 'lodash';


export class QuizQuestion {

};

export class QuizAnswer {
  static structure = {
    answerID: '',
    timestampAnswered: -1,
    question: {},
    userAnswer: '',
    isCorrect: false,
  };

  /** wraps an object so that VSCODE can suggest types/autocomplete */
  static wrap(data = QuizAnswer.structure){
    return ({...QuizAnswer.structure, ...data});
  };

  /** wraps array so that VSCODE can suggest types/autocomplete */
  static wrapArray(data = [QuizAnswer.structure]){
    return [...data || []].map(item => QuizAnswer.wrap(item));
  };
  
  constructor(data = QuizAnswer.structure){
    this.data = {...QuizAnswer.structure, ...data};
  };

  get answerID(){
    return this.data.answerID;
  };

  set answerID(answerID){
    this.data.answerID = answerID;
  };

  get timestampAnswered(){
    return this.data.timestampAnswered;
  };

  set timestampAnswered(timestampAnswered){
    this.data.timestampAnswered = timestampAnswered;
  };

  get question(){
    return this.data.question;
  };

  set question(question){
    this.data.question = question;
  };

  get userAnswer(){
    return this.data.userAnswer;
  };

  set userAnswer(userAnswer){
    this.data.userAnswer = userAnswer;
  };

  get isCorrect(){
    return this.data.isCorrect;
  };

  set isCorrect(isCorrect){
    this.data.isCorrect = isCorrect;
  };
  
  get(){
    return this.data;
  };
};
