import store from 'react-native-simple-store';
import _ from 'lodash';
import {IncompletePracticeExamModel, AnswerModel} from './IncompletePracticeExamStore';
import { Question } from '../components/Exam';
import { getTimestamp } from './Utils';

const URL = 'https://linkpad-pharmacy-reviewer.firebaseapp.com/getallmodules';
let _moduleData = null;


//structure of single question item in module subject.questions array
export class QuestionItem {
  constructor(question = {
    //modeled from backend response
    question   : '', 
    explanation: '', 
    answer     : '', 
    choices    : [],
    //used for identification
    indexID_module  : -1,
    indexID_subject : -1,
    indexID_question: -1,
    //store the answer
    user_answer: '',
    timestamp_answered: 0,
  }){
    this.question = {
      timestamp_answered: 0,
      user_answer: '',
      ...question,
    };
  };

  get = () => {
    return this.question;
  };

  getCopy = () => {
    return _.cloneDeep(this.question);
  };

  setIndexIDs = (indexIDs = {indexID_module: -1, indexID_subject: -1, indexID_question: -1}) => {
    this.question.indexID_module   = indexIDs.indexID_module  ;
    this.question.indexID_subject  = indexIDs.indexID_subject ;
    this.question.indexID_question = indexIDs.indexID_question;
  };

  setUserAnswer(user_answer = ''){
    //set answer
    this.question.user_answer = user_answer;
  };

  setAnswerTimestamp(){
    //set timestamp
    this.question.timestamp_answered = getTimestamp();
  };

  initFromAnswer(model = new AnswerModel()){
    const { answer, timestamp_answered } = model.get();

    this.question.user_answer        = answer;
    this.question.timestamp_answered = timestamp_answered;
  };

  getAnswerModel(){
    const { indexID_module, indexID_subject, indexID_question, answer } = this.getCopy();

    let model = new AnswerModel();
    //append indexid's to answer model
    model.setIndexIDs({indexID_module, indexID_subject, indexID_question});
    //append answers to answer model
    model.setAnswerKey(answer);

    return model;
  };
  
  getChoices(){
    const { choices, answer } = this.get();
    //extract choice from object
    let mapped = choices.map((choice) => choice.value);

    return mapped.concat(answer);
  };

  getAnswerModel(){
    const { indexID_module, indexID_subject, indexID_question, answer, user_answer, timestamp_answered } = this.question;

    return new AnswerModel({
      //pas down indexid's
      indexID_module, indexID_subject, indexID_question,
      answer   : user_answer,
      answerKey: answer,
      isCorrect: this.isCorrect(),
      timestamp_answered,
    });
  };

  isAnswered(){
    const { user_answer } = this.get();
    return user_answer != '';
  };

  isCorrect(){
    const { answer, user_answer } = this.get();
    return answer == user_answer;
  };
}

//structure of single subject item in modules.subjects array
export class SubjectItem {
  constructor(subject = {
    //modeled from backend response
    indexid    : -1, 
    subjectname: '',
    description: '', 
    lastupdated: '', 
    questions  : [new QuestionItem().get()],
    //used for identification
    indexID_module: -1,
  }){
    this.data = {
      //to avoid null when param is incomplete/invalid
      questions: [],
      indexID_module: -1,
      ...subject
    };

    const { indexID_module, indexid } = subject;
    //if subj is not init., replace with empty array
    if(indexID_module == -1 && indexid == -1){
      this.subject.questions = [];
    };
  };

  setModuleIndexID(indexID_module = -1){
    this.data.indexID_module = indexID_module;
  };

  get(){
    return this.data;
  };

  getCopy(){
    return _.cloneDeep(this.data);
  };

  getQuestions(){
    //to avoid mutations by ref
    const { questions, indexID_module, indexid } = this.getCopy();

    //wrap questions inside a model
    return questions.map((item, index) => {
      let model = new QuestionItem(item);
      //append index id's
      model.setIndexIDs({
        indexID_module,
        indexID_subject : indexid,
        indexID_question: index  
      });
      return model;
    });
  };

  getQuestionLength() {
    if( this.data == null || this.data.questions == null){
      return 0;
    };
    return this.data.questions.length;
  };

  /** returns null when there is no match */
  getQuestionModelByIndex(index = 0){
    const { questions, indexID_module, indexid } = this.getCopy();

    //invalid index given
    if(questions.length == 0 || questions.length < index + 1 || index < 0){
      console.warn(`Invalid index: ${index} with length: ${questions.length}`);
      return null;
    };

    //wrap data inside a model
    let model = new QuestionItem(questions[index]);

    //append index id's
    model.setIndexIDs({
      indexID_module,
      indexID_subject : indexid,
      indexID_question: index  
    });

    return model;
  };

  /** returns an iPE model that is initialized with this subject details */
  getIncompletePracticeExamModel = () => {
    //to avoid mutations by ref
    const { indexid, indexID_module } = this.getCopy();

    let model = new IncompletePracticeExamModel();
    //append indexid's to model
    model.setIndexIDs({indexID_module, indexID_subject: indexid});
    return model;
  };

  getIndexIDs(){
    const  { indexID_module, indexid } = this.getCopy();
    return { indexID_module, indexID_subject: indexid };
  };

  isQuestionsEmpty(){
    const { questions } = this.data;
    return questions.length == 0;
  };

  /** returns undefined when there is no match */
  getAnsweredQuestions(){
    const { questions } = this.get();

    //return questions that has user_answer set
    return questions.filter((question) => 
      question.user_answer != ''
    );
  };

  /** returns undefined when there is no match */
  getUnansweredQuestions(){
    const questions = this.getQuestions();

    //return questions that has user_answer set
    return (
      questions
        .filter((question) => !question.isAnswered())
        .map   ((question) =>  question.get       ())
    );
  };
};

//represents the structure for a single module item
export class ModuleItemModel {
  constructor(module = {
    //modeled from backend response
    description: '', 
    modulename : '', 
    lastupdated: '', 
    indexid    : 0 , 
    subjects   : [],
  }){
    this.module = module;
  }

  get = () => {
    //returns a copy as a ref    
    return this.module;
  };

  getCopy = () => {
    //returns a copy w/o a ref
    return _.cloneDeep(this.module);
  };

  //returns an array of SubjectItem
  getSubjects = () => {
    //to avoid mutations by reference
    const { subjects, indexid } = this.getCopy();
    //wraps subjects inside a model object
    return subjects.map((item) => {
      let model = new SubjectItem(item);
      //append module indexid to model
      model.setModuleIndexID(indexid);
      return model;
    });
  };

  getSubjectByID(index_id){
    let subjectModels = this.getSubjects();
    //return matching subject
    return subjectModels.find((subject) => 
      subject.data.indexid == index_id
    );
  };

  getLenghtSubjects = () => {
    const { subjects } = this.module;
    return _.compact(subjects).length;
  };

  getUnansweredQuestions

  getTotalQuestions = () => {
    const subjectModels = this.getSubjects();
    let total = 0;
    subjectModels.forEach((subject) => 
      total += subject.getQuestionLength()
    );
    return total;
  };
}

export class ModulesManager {

  getModuAsModel = async () => {
    const modules = await getModuleData();
    //return new M
  }
}

fetchModuleData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let results = await fetch(URL);
      let json    = await results.json();
      resolve(json);
    } catch(error) {
      console.error('Failed to fetch modules...');
      reject(error);
    }
  });
}

getModuleData = () => {
  return new Promise(async (resolve, reject) => {
    //has not been set, init with storage
    if(_moduleData == null){
      //get modules from storage
      _moduleData = await store.get('modules');
    }
    //if stil empty after init with value from stotage
    if(_moduleData == null){
      try {
        //fetch modules from server
        _moduleData = await fetchModuleData();
        //write modules to storage
        for(let module in _moduleData){
          await store.push('modules', _moduleData[module]);
        }
      } catch(error) {
        //some error occured
        reject(error);
      }
    }

    //debug
    //console.log('\n\n\n\n Resolve Module Data');
    //console.log(_moduleData);

    //resolve module data
    resolve(_moduleData);
  });
}

refreshModuleData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      //fetch modules from server
      let new_modules = await fetchModuleData();
      //delete previous modules stored
      await store.delete('modules');
      //write modules to storage
      for(let module in new_modules){
        await store.push('modules', new_modules[module]);
      }
      //update global var
      _moduleData = new_modules;
    } catch(error) {
      //some error occured
      reject(error);
    }
    resolve(_moduleData);
  });
}

clear = () => _moduleData = null;

export default {
  fetchModuleData,
  getModuleData,
  refreshModuleData,
  clear,
}