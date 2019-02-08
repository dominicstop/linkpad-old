import store from 'react-native-simple-store';
import _ from 'lodash';
import * as Utils from './Utils'
import {ModuleItemModel, QuestionItem, SubjectItem} from './ModuleStore';

const KEY   = 'incomplete_practiceExams';
const DEBUG = false;

let _incompletePracticeExams = null;

export class AnswerModel {
  constructor(data = {
    //used for checking which module/subject it belongs to
    indexID_module  : -1,
    indexID_subject : -1,
    indexID_question: -1,
    //store the answer results
    answer   : '',
    answerKey: '',
    isCorrect: false,
    //store when question was answered
    timestamp_answered: 0,
  }){
    this.data = data;
  };

  get(){
    return this.data;
  }

  getCopy(){
    //returns a copy w/o reference
    return _.clone(this.data);
  }

  getIndexIDs(){
    const  { indexID_module, indexID_subject, indexID_question } = this.data;
    return { indexID_module, indexID_subject, indexID_question };
  };

  getCompositeID(){
    const  { indexID_module, indexID_subject, indexID_question } = this.data;
    return (`${indexID_module}-${indexID_subject}-${indexID_question}`);
  };

  setIndexIDs = (indexIDs = {indexID_module: -1, indexID_subject: -1, indexID_question: -1}) => {
    this.data.indexID_module   = indexIDs.indexID_module  ;
    this.data.indexID_subject  = indexIDs.indexID_subject ;
    this.data.indexID_question = indexIDs.indexID_question;
  };

  setAnswerKey(answerKey = ''){
    this.data.answerKey = answerKey;
  };

  setAnswer(answer = ''){
    const { answerKey } = this.data;
    //show warning when correct answer is not set
    if(answerKey == ''){
      console.warn('correct answer is not set');
    };

    //set the answer and check if correct
    this.data.answer    = answer;
    this.data.isCorrect = answer == answerKey;
    //set timestamp 
    this.data.timestamp_answered = Utils.getTimestamp();
  };

  isAnswered(){
    const { answer } = this.data;
    return answer == '';
  };

  isInitialized(){
    const { indexID_module, indexID_question, indexID_subject, answerKey } = this.data;
    return(
      //not init. when id's are -1
      indexID_module   != -1 ||
      indexID_subject  != -1 ||
      indexID_question != -1 ||
      //not init. when answerKey is empty
      answerKey != '' 
    );
  };
};

/** a model that holds a single item of incompletePracticeExam */
export class IncompletePracticeExamModel {
  constructor(data = {
    //used for checking which module/subject it belongs to
    indexID_module : -1,
    indexID_subject: -1,
    //used for checking when it started/ended
    timestamp_started: 0,
    timestamp_ended  : 0,
    //holds the answered questions
    answers: [new AnswerModel().data],
  }){
    this.data = {
      answers: [],
      ...data,
    };

    const { indexID_module, indexID_subject } = data;
    //if answers is not init., replace with empty array
    if(indexID_module == -1 && indexID_subject == -1){
      this.data.answers = [];
    };
  };

  get(){
    return this.data;
  };

  getCopy(){
    //returns a copy w/o reference
    return _.clone(this.data);
  };

  getCompositeID(){
    const  { indexID_module, indexID_subject} = this.data;
    return (`${indexID_module}-${indexID_subject}`);
  };

  getAnswersCount(){
    const { answers } = this.get();
    return answers.length;
  };

  setIndexIDs(indexIDs = {indexID_module: -1, indexID_subject: -1}){
    this.data.indexID_module  = indexIDs.indexID_module ;
    this.data.indexID_subject = indexIDs.indexID_subject;
  };

  setTimestampStart(){
    this.data.timestamp_started = Utils.getTimestamp();
  };

  setTimestampEnd(){
    this.data.timestamp_ended = Utils.getTimestamp();
  };

  getAnswersAsModel(){
    const { answers } = this.data;
    //wraps the answers inside a model
    return answers.map((item) => new AnswerModel(item));
  };

  /** appends the answers to subjectModel's user_answer */
  appendAnswersToSubject(subjectModel = new SubjectItem()){
    const { answers } = this.data;
    let questions = subjectModel.getQuestions();

    //append the answer from answers to questions
    let combined = questions.map((question) => {
      //extract indexid from questions
      const {indexID_module, indexID_subject, indexID_question} = question.get();

      //get corresponding answer
      let match = answers.find((answer) => 
        answer.indexID_module   == indexID_module   &&
        answer.indexID_subject  == indexID_subject  &&
        answer.indexID_question == indexID_question 
      );

      //if has a match replace answer
      if(match != undefined){
        let answerModel = new AnswerModel(match);
        question.initFromAnswer(answerModel);
      };
      return question;
    });

    //replace questions with combined
    subjectModel.data.questions = combined.map((item) => item.get());
  };

  isInitialized(){
    const { indexID_module, indexID_subject } = this.data;
    //not init when indexes are -1
    return (indexID_module == -1 || indexID_subject == -1);
  };

  isActive(){
    const { timestamp_started, timestamp_ended } = this.data;
    return (timestamp_started != 0 && timestamp_ended == 0);
  };

  isAnswersEmpty(){
    const { answers } = this.data;
    return answers.length == 0;
  };
  
  insertAnswer(item = new AnswerModel()){
    const { answers } = this.data;

    //check if answer to be added is init.
    if(!item.isInitialized()){
      console.warn('Cant insert Answer: Answer is not initialized.');
      return null;
    };

    //avoid duplicates: answers without 'item' param
    let filtered = answers.filter((element) => 
      element.indexID_module   != item.indexID_module   &&
      element.indexID_subject  != item.indexID_subject  &&
      element.indexID_question != item.indexID_question
    );
    
    //append to answers
    filtered.push(item.get());
    //overwrite property
    this.data.answers = filtered;
  };
};

/** a model that holds an array of incompletePracticeExam */
export class IncompletePracticeExamsModel {
  constructor(items = [new IncompletePracticeExamModel().data]){
    this.elements = items;
  };

  get(){
    return this.elements;
  };

  /** returns undefined when no match is found */
  findMatchFromIDs(indexIDs = {indexID_module: -1, indexID_subject: -1}){
    const { indexID_module, indexID_subject } = indexIDs;

    return this.elements.find((item) => 
      item.indexID_module  == indexID_module && 
      item.indexID_subject == indexID_subject
    );
  };

  /** returns undefined when no match is found */
  findMatchFromIDsAsModel(indexIDs = {indexID_module: -1, indexID_subject: -1}){
    let match = this.findMatchFromIDs(indexIDs);

    //check if has match
    if(match == undefined) return undefined;
    //wrap match inside model
    return new IncompletePracticeExamModel(match);
  };

  replaceExistingItem(item = new IncompletePracticeExamModel()){
    //extract id's from  new 'item' param
    const { indexID_module, indexID_subject } = item.get();

    //array without the old 'item' element
    let filtered = this.elements.filter((items) => 
      items.indexID_module  != indexID_module &&
      items.indexID_subject != indexID_subject
    );

    //insert the new 'item' and update property
    filtered.push(item.get());
    this.elements = filtered;
  };

  /** removes the item from the array */
  removeItem(item = new IncompletePracticeExamModel()){
    //extract id's from  new 'item' param
    const { indexID_module, indexID_subject } = item.get();

    //array without the old 'item' element
    let filtered = this.elements.filter((item) => 
      item.indexID_module  != indexID_module &&
      item.indexID_subject != indexID_subject
    );

    this.elements = filtered;
  };
};

async function get(){
  let items = [];
  //read from store
  items = items.concat(await store.get(KEY));
  //remove null elements
  items = items.filter(item => item != null);

  //update private global var
  _incompletePracticeExams = items;

  return(items);
};

/** will return null if store is empty */
async function getAsModel(){
  let items = await get();

  //return null if store is empty
  if(items.length == 0 || items[0] == null) return null;

  //wrap items inside model
  return new IncompletePracticeExamsModel(items);
};

async function set(model = new IncompletePracticeExamsModel()){
  await store.save(KEY, model.get());
};

async function add(item = new IncompletePracticeExamModel()){
  try {
    //read from storage
    let model = await getAsModel();

    //extract ids from item param
    const { indexID_module, indexID_subject } = item.get();
    
    let match = undefined;
    
    //only check for match when store is not empty
    if(model != null){
      //check if item already exists in store
      match = model.findMatchFromIDs({
        indexID_module, indexID_subject
      });
    };

    if(match == undefined){
      //add item to store since it doesn't exist yet
      await store.push(KEY, item.get());

    } else {
      //overwrite with updated item
      await store.save(KEY, item.get());
    };

  } catch(error) {
    console.log('unable to add IncompletePracticeExam');
    console.log(error);

    throw error;
  };
};

async function reset(){
  await store.delete(KEY);
};

export default {
  set, get, add, getAsModel, reset
};