import _ from 'lodash';
import { replacePropertiesWithNull, shuffleArray } from '../functions/Utils';

export class PreboardExamChoice {
  static structure = {
    value: '',
    //added afer processing
    choiceID         : -1   , //unique id for use in lists and comparison (in case the choices are falsy i.e null/undef etc.) or have the same exact string
    isAnswer         : false, //is the correct answer (choices and answers are merged together, or in cases where there are mult. correct answers)
    indexid_exam     : -1   , //passed down - which exam      this choice belongs to    
    indexid_question : -1   , //passed down - which question  this choice belongs to
    indexid_premodule: -1   , //passed down - which premodule this choice belongs to
    questionID       : ''   , //passed down - used for reconciling to question when they are separated
    examModuleID     : ''   , //passed down - used for reconciling to exam     when they are separated
  };

  static wrap(data = PreboardExamChoice.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExamChoice.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExamChoice.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [PreboardExamChoice.structure]){
    return items.map((item) => 
      PreboardExamChoice.wrap(item)
    );
  };
};

export class PreboardExamQuestion {
  static structure = {
    answer       : '',
    choices      : [],
    explanation  : '',
    question     : '',
    photouri     : '',
    photofilename: '',
    //added after processing
    choiceItems      : PreboardExamChoice.wrapArray([]), //contains both the answer and choices
    imageType        : '', //Constants - IMAGE_TYPE enum
    indexid_exam     : -1, //passed down - which exam      this question belongs to
    indexid_premodule: -1, //passed down - which premodule this question belongs to
    questionID       : '', //passed down - unique id for use in lists and comparison
    examModuleID     : '', //passed down - used for reconciling to exam
  };

  static wrap(data = PreboardExamQuestion.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExamQuestion.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExamQuestion.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [PreboardExamQuestion.structure]){
    return items.map((item) => 
      PreboardExamQuestion.wrap(item)
    );
  };
};

export class PreboardExamModule {
  static structure = {
    indexid      : -1, 
    premodulename: '',
    description  : '',
    questions    : PreboardExamQuestion.wrapArray([]),
    //added after processing
    indexid_exam: '', //passed down - which exam this module belongs to
    examModuleID: '', //unique id for use in list
  };

  static wrap(data = PreboardExamModule.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExamModule.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExamModule.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [PreboardExamModule.structure]){
    return items.map((item) => 
      PreboardExamModule.wrap(item)
    );
  };
};

export class PreboardExamItem {
  static structure = {
    indexid    : '',
    examname   : '',
    description: '',
    dateposted : '',
    startdate  : '',
    enddate    : '',
    timelimit  : -1,
    exammodules: PreboardExamModule.wrapArray([]),
  };

  static wrap(data = PreboardExamItem.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExamItem.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExamItem.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [PreboardExamItem.structure]){
    return items.map((item) => 
      PreboardExamItem.wrap(item)
    );
  };
};

export class PreboardExam {
  static structure = {
    message: ''   ,
    success: false,
    active : false,
    examkey: -1   , 
    exams  : PreboardExamItem.wrapArray([]),
  };

  static wrap(data = PreboardExam.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...PreboardExam.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(PreboardExam.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static createQuestionList(examItem = PreboardExamItem.structure){
    const exam = PreboardExamItem.wrap(examItem);
    let questions = [];

    //exract all of the questions from each module
    for (const module of exam.exammodules) {
      for (const question of module.questions) {
        questions.push(question);        
      };
    };

    //shuffle and return questions
    return shuffleArray(questions);
  };
};