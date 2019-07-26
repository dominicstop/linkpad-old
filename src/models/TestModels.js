import { PreboardExamQuestion, PreboardExamChoice, PreboardExamItem } from "./PreboardModel";
import { replacePropertiesWithNull } from "../functions/Utils";
import moment from 'moment';

export const EXAM_TYPE = {
  preboard  : 'preboard'  ,
  practice  : 'practice'  ,
  customQuiz: 'customQuiz',
};

export const EXAM_LABELS = {
  'NONE'    : 'NONE'    ,
  'SKIPPPED': 'SKIPPPED',
  'MARKED'  : 'MARKED'  ,
};

export class TestChoice {
  static structure = {
    value     : ''   , //answer string
    choiceID  : ''   , //unique id for use in lists and comparison (in case the choices are falsy i.e null/undef etc.) or have the same exact string
    questionID: ''   , //passed down - used for reconciling to question when they are separated
    isAnswer  : false, //is the correct answer (choices and answers are merged together, or in cases where there are mult. correct answers)
    extraData : {}   , //data not needed after converting
  };

  static wrap(data = TestChoice.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...TestChoice.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(TestChoice.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [TestChoice.structure]){
    return items.map((item) => 
      TestChoice.wrap(item)
    );
  };

  //#region - Validation
  static isValidItem(choice = TestChoice.structure){
    try {
      const { value } = (choice || {});
      
      return ((choice && value) && (
        value !== ''        ||
        value !== null      ||
        value !== undefined 
      ));
    } catch(error){
      return false;
    };
  };

  static isValidItems(choices = [TestChoice.structure]){
    return (choices && (choices.length > 0) &&
      choices.every(choice => TestChoice.isValidItem(choice))
    );
  };

  static filterInvalidItems(items = [TestChoice.structure]){
    return (items || []).filter((item = {}) => 
      TestChoice.isValidItem(item)
    );
  };
  //#endregion 

  //#region - Conversion: PreboardChoice 
  static createFromPreboardChoice(choice = PreboardExamChoice.structure){
    return TestChoice.wrap({
      value     : choice.value     ,
      choiceID  : choice.choiceID  ,
      questionID: choice.questionID,
      isAnswer  : choice.isAnswer  ,
      extraData : {
        indexid_exam     : choice.indexid_exam     ,
        indexid_question : choice.indexid_question ,
        indexid_premodule: choice.indexid_premodule,
        examModuleID     : choice.examModuleID     ,
      },
    });
  };

  /**converts am array of PreboardQuestion item into TestQuestion items and removes invalid items*/
  static createFromPreboardChoices(choices = [PreboardExamChoice.structure]){
    return TestChoice.filterInvalidItems((choices || [])
      .map(choice => TestChoice.createFromPreboardChoice(choice))
    );
  };

  /**converts a TestChoice item back into PreboardChoices item */
  static convertToPreboardQuestion(question = TestQuestion.structure){
    const extraData = (question.extraData || {});
    return PreboardExamQuestion.wrap({
      questionID    : question.questionID   ,
      imageType     : question.imageType    ,
      explanation   : question.explanation  ,
      question      : question.question     ,
      photouri      : question.photouri     ,
      photofilename : question.photofilename,
      //pass down extraData values
      answer           : extraData.answer           ,
      choices          : extraData.choices          ,
      indexid_exam     : extraData.indexid_exam     ,
      indexid_premodule: extraData.indexid_premodule,
      examModuleID     : extraData.examModuleID     ,
    });
  };
  //#endregion
};

export class TestAnswer {
  static structure = {
    answerID  : ''   , // derived from choiceID
    questionID: ''   , // for reconcilation - tells which question this belongs to
    isCorrect : false, // true when matches the correct answer
    label     : ''   , // EXAM_LABELS enum - used for marking this answer
    timestamp : -1   , // timestamp of when the answer was made
    // the selected choice
    userAnswer: [TestChoice.structure], 
  };

  static wrap(data = TestAnswer.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...TestAnswer.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(TestAnswer.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [TestAnswer.structure]){
    return items.map((item) => 
      TestAnswer.wrap(item)
    );
  };

  /** create an answer */
  static create(choice = TestChoice.structure){
    return TestAnswer.wrap({
      userAnswer: choice, 
      timestamp : Date.now()     ,
      isCorrect : choice.isAnswer,
      answerID  : choice.choiceID,
    });
  };

  /** counts the number of answers that are skipped or has no answer */
  static countAnswered(items = [TestAnswer.structure]){
    const filtered = items.filter((answer = {}) => (
      (!answer.userAnswer                    ) || 
      ( answer.label === EXAM_LABELS.SKIPPPED)
    ));
    return filtered.length;
  };
};

export class TestQuestion {
  static structure = {
    questionID   : '', //uniqued id for use in lists etc.
    imageType    : '', //Constants - IMAGE_TYPE enum: type of image
    explanation  : '', //explanation of the answer
    question     : '', //question string
    photouri     : '', //question image
    photofilename: '', //the name of the question image file
    extraData    : {}, //values not needed for 
    choiceItems  : [TestChoice.structure], 
  };

  static wrap(data = TestQuestion.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...TestQuestion.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(TestQuestion.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  static wrapArray(items = [TestQuestion.structure]){
    return items.map((item) => 
      TestQuestion.wrap(item)
    );
  };

  //#region - Validation Helper Functions
  /** returns true if item is valid */
  static isValidItem(item = TestQuestion.structure){
    try {
      const { question, explanation } = item;
      return (item && (
          question !== ''        ||
          question !== null      ||
          question !== undefined 
        ) && (
          explanation !== ''        ||
          explanation !== null      ||
          explanation !== undefined 
        ) && (
          TestChoice.isValidItems(item.choiceItems)
        )
      );
    } catch(error){
      return false;
    };
  };

  /** returns true if all items are valid */
  static isValidItems(items = [TestQuestion.structure]){
    return ((items && items.length > 0) &&
      items.every(item => TestQuestion.isValidItem(item))
    );
  };

  /** filter out invalid question items */
  static filterInvalidItems(items = [TestQuestion.structure]){
    return (items || []).filter((item = {}) => 
      TestQuestion.isValidItem(item)
    );
  };
  //#endregion 

  //#region - Conversion: PreboardQuestion
  /**converts a PreboardQuestion item into TestQuestion item */
  static createFromPreboardQuestion(question = PreboardExamQuestion.structure){
    return TestQuestion.wrap({
      questionID   : question.questionID   ,
      imageType    : question.imageType    ,
      explanation  : question.explanation  ,
      question     : question.question     ,
      photouri     : question.photouri     ,
      photofilename: question.photofilename,
      //convert preboard choices to test choices
      choiceItems: TestChoice.createFromPreboardChoices(question.choiceItems),
      //store all of the values not needed for TestQuestion
      extraData: {
        answer           : question.answer           ,
        choices          : question.choices          ,
        indexid_exam     : question.indexid_exam     ,
        indexid_premodule: question.indexid_premodule,
        examModuleID     : question.examModuleID     ,
      },
    });
  };

  /**converts an array of PreboardQuestion item into TestQuestion items and removes invalid items */
  static createFromPreboardQuestions(questions = [PreboardExamQuestion.structure]){
    return TestQuestion.filterInvalidItems((questions || []).map(
      question => TestQuestion.createFromPreboardQuestion(question)
    ));
  };
  
  /**converts a TestQuestion item back into PreboardQuestion item */
  static convertToPreboardQuestion(question = TestQuestion.structure){
    const extraData = (question.extraData || {});
    return PreboardExamQuestion.wrap({
      questionID    : question.questionID   ,
      imageType     : question.imageType    ,
      explanation   : question.explanation  ,
      question      : question.question     ,
      photouri      : question.photouri     ,
      photofilename : question.photofilename,
      //pass down extraData values
      answer           : extraData.answer           ,
      choices          : extraData.choices          ,
      indexid_exam     : extraData.indexid_exam     ,
      indexid_premodule: extraData.indexid_premodule,
      examModuleID     : extraData.examModuleID     ,
    });
  };
  //#endregion
};

export class TestInformation {
  static structure = {
    title        : '',
    description  : '',
    timestampDate: -1, 
    examType     : '', //EXAM_TYPE enum value,
    extraData    : {},
    //preboard specific properties
    preboardTimeLimit: -1,
    preboardStartdate: '',
    preboardEnddate  : '',
  };

  static wrap(data = TestInformation.structure){
    return {
      //assign default properties w/ default values (so that vscode can infer types)
      ...TestInformation.structure,
      //overwrite all default values and replace w/ null (for assigning default values with ||)
      ...replacePropertiesWithNull(TestInformation.structure),
      //combine with obj from param
      ...(data || {}),
    };
  };

  //#region - Conversion: Preboard
  /**converts a PreboardExamItem item into TestInformation item */
  static createFromPreboardExamItem(exam = PreboardExamItem.structure){
    //convert date string into timestamp
    const timestampDate = moment(exam.dateposted, 'YYYY-MM-DD').unix();

    return TestInformation.wrap({
      examType     : EXAM_TYPE.preboard,
      title        : exam.examname     ,
      description  : exam.description  ,
      //pass down converted date
      timestampDate,
      //assign preboard specific data
      preboardTimeLimit: exam.timelimit,
      preboardStartdate: exam.startdate,
      preboardEnddate  : exam.enddate  ,
      //store all of the values not needed
      extraData: {
        indexid    : exam.indexid    ,
        exammodules: exam.exammodules,
        dateposted : exam.dateposted  ,
      },
    });
  };

  /**converts a TestInformation item back into PreboardExamItem item */
  static convertToPreboardExamItem(info = TestInformation.structure){
    const extraData = (info.extraData || {});
    return PreboardExamItem.wrap({
      examname   : info.title        ,
      description: info.description  ,
      //reassign preboard specific data
      timelimit: info.preboardTimeLimit,
      startdate: info.preboardStartdate,
      enddate  : info.preboardEnddate  ,
      //reassign extraData
      indexid    : extraData.indexid    ,
      exammodules: extraData.exammodules,
      dateposted : extraData.dateposted ,
    });
  };
  //#endregion
};