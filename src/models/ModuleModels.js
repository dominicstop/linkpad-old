import _ from 'lodash';

import { IncompletePracticeExamModel, AnswerModel } from '../functions/IncompletePracticeExamStore';
import { getTimestamp , replacePropertiesWithNull} from '../functions/Utils';

//structure of single question item in module subject.questions array
export class QuestionItem {
  static structure = {
    //modeled from backend response
    question   : '', 
    explanation: '', 
    answer     : '', 
    choices    : [],
    //picture metadata
    photofilename: '',
    photouri: '',
    //used for identification
    indexID_module  : -1,
    indexID_subject : -1,
    indexID_question: -1,
    //store the answer
    user_answer: '',
    timestamp_answered: 0,
    //added/appended from _filterModules after fetching
    questionID : '',
    modulename : '',
    subjectname: '',
    //added/appended from _saveBase64ImageToStorage after _filterModules
    hasImage: false,
  };

  static wrap(data = QuestionItem.structure){
    return ({
      //assign default properties w/ default values
      ...QuestionItem.structure,
      //remove all default values and replace w/ null
      ...replacePropertiesWithNull(QuestionItem.structure),
      //combine with obj from param
      ...(data || {}),
    });
  };

  /** wraps each element in an array to make sure */
  static wrapArray(items = [QuestionItem.structure]){
    return items.map((item) => QuestionItem.wrap(item));
  };
  
  constructor(question = QuestionItem.structure){
    this.question = {...QuestionItem.structure,  ...question};
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
};

//structure of single subject item in modules.subjects array
export class SubjectItem {
  static structure = {
    //modeled from backend response
    indexid    : -1, 
    subjectname: '',
    description: '', 
    lastupdated: '', 
    questions  : [QuestionItem.structure],
    //used for identification
    indexID_module: -1,
    //added/appended from _filterModules after fetching
    modulename : '',
    subjectID  : '',
  };

  /** wrap object with SubjectItem.structure to prevent missing properties and enable VSCODE type intellesense */
  static wrap(data = SubjectItem.structure){
    return ({
      //assign default properties w/ default values
      ...SubjectItem.structure,
      //remove all default values and replace w/ null
      ...replacePropertiesWithNull(SubjectItem.structure),
      //combine with obj from param
      ...data || {},
    });
  };

  /** wraps each element in an array to make sure */
  static wrapArray(items = [SubjectItem.structure]){
    return items.map((item) => 
      SubjectItem.wrap(item)
    );
  };

  constructor(subject = SubjectItem.structure){
    this.data = {...SubjectItem.structure, ...subject};
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
  static structure = {
    //modeled from backend response
    subjects   : SubjectItem.wrapArray([]),
    description: '', 
    modulename : '', 
    lastupdated: '', 
    indexid    : -1, 
  };

  /** makes sure all of module's properties exists and assigns default values */
  static wrap(module = ModuleItemModel.structure){
    return ({
      //assign default properties w/ default values
      ...ModuleItemModel.structure,
      //remove all default values and replace w/ null
      ...replacePropertiesWithNull(ModuleItemModel.structure),
      //combine with obj from param
      ...module || {},
    });
  };

  /** wraps each element in an array to make sure */
  static wrapArray(items = [SubjectItem.structure]){
    return items.map((item) => 
     ModuleItemModel.wrap(item)
    );
  };

  constructor(module = ModuleItemModel.structure){
    this.module = ModuleItemModel.wrap(module);
  };

  get(){
    //returns a copy as a ref    
    return this.module;
  };

  getCopy(){
    //returns a copy w/o a ref
    return _.cloneDeep(this.module);
  };

  /** returns an array of SubjectItem */
  getSubjects(){
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

  getLenghtSubjects(){
    const { subjects } = this.module;
    return _.compact(subjects).length;
  };

  getTotalQuestions(){
    const subjectModels = this.getSubjects();

    let total = 0;
    subjectModels.forEach((subject) => 
      total += subject.getQuestionLength()
    );

    return total;
  };
};