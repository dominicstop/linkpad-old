//note: the models/objects are written like tbis for VSCODE type inference and autocomplete

import _ from 'lodash';
import { replacePropertiesWithNull, replaceIfNull } from '../functions/Utils';

/** model that describes the properties of a quiz question */
export class QuizQuestion {
  /** obj properties with default values */
  static structure = {
    //data from backend
    answer        : '',
    explanation   : '',
    photofilename : '',
    photouri      : '',
    question      : '',
    choices       : [],
    //added when processed in module store
    questionID       : '',
    indexID_module   : -1,
    indexID_subject  : -1,
    indexID_question : -1,
  };

  /** wrap object with QuizQuestion.structure to prevent missing properties and enable VSCODE type intellesense */
  static wrap(data = QuizQuestion.structure){
    return {
      //assign default properties w/ default values
      ...QuizQuestion.structure,
      //remove all default values and replace w/ null
      ...replacePropertiesWithNull(QuizQuestion.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  /** wraps each element in an array to make sure */
  static wrapArray(items = [QuizQuestion.structure]){
    return items.map((item) => 
      QuizQuestion.wrap(item)
    );
  };

  constructor(data = QuizQuestion.structure){
    //makes sure all properties exist
    this.data = QuizQuestion.wrap(data);
  };

  //---- getters ----
  /** the correct answer to the question */
  get answer(){
    return this.data.answer
  };

  /** array of choices/possible answers to the question  */
  get choices(){
    return this.data.choices;
  };

  /** the question's rationale or explanation */
  get explanation(){
    return this.data.explanation;
  };

  /** ID: which module this question belongs to */
  get indexID_module(){
    return this.data.indexID_module;
  };

  /** unique id of the questions */
  get indexID_question(){
    return this.data.indexID_question;
  };

  /** ID: which subject this question belongs to */
  get indexID_subject(){
    return this.data.indexID_subject;
  };

  /** the name of the photo's filename */
  get photofilename(){
    return this.data.photofilename;
  };

  /** points to where the file is currently saved */
  get photouri(){
    return this.data.photouri;
  };

  /** the question string */
  get question(){
    return this.data.question;
  };
};

export const QUIZ_LABELS = {
  'SKIPPPED': 'SKIPPPED',
  'MARKED'  : 'MARKED'  ,
};

export class QuizAnswer {
  static structure = {
    answerID          : '',
    userAnswer        : '',
    isCorrect         : false,
    timestampAnswered : -1,
    question          : QuizQuestion.wrap({}),
    label             : '',
  };
  
  /** wrap object with QuizAnswer.structure to prevent missing properties and enable VSCODE type intellesense */
  static wrap(data = QuizAnswer.structure){
    return {
      //assign default properties w/ default values
      ...QuizAnswer.structure,
      //remove all default values and replace w/ null
      ...replacePropertiesWithNull(QuizAnswer.structure),
      //create//append properties if not set yet or null
      isCorrect: data.isCorrect || (data.userAnswer == data.question.answer),
      answerID : data.answerID  || ((question) => `${question.indexID_module}-${question.indexID_subject}-${question.indexID_question}`)(data.question),
      //combine with obj from param
      ...(data || {}),
    };
  };

  /** wraps each element in an array to make sure */
  static wrapArray(items = [QuizAnswer.structure]){
    return items.map((item) => 
      QuizAnswer.wrap(item)
    );
  };

  constructor(data = QuizAnswer.structure){
    //makes sure all properties exist
    this.data = QuizAnswer.wrap(data);
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

  /** the timestamp when the user answer was set */
  get timestampAnswered(){
    return this.data.timestampAnswered;
  };

  /** the user's answer the to the question */
  get userAnswer(){
    return this.data.userAnswer;
  };

  //---- setters ----
  /** set the user answer and timestamp_answered  */
  set userAnswer(answer = ''){
    //set answer timestamp
    this.data.timestampAnswered = Date.now();
    //set the user's answer
    this.data.userAnswer = answer;
  };
};
