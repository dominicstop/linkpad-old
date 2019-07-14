import { Clipboard } from 'react-native'
import _ from 'lodash';
import * as FileSystem from 'expo-file-system';
import store from 'react-native-simple-store';

import { shuffleArray, getTimestamp, replacePropertiesWithNull } from './Utils';
import { QuizQuestion } from '../models/Quiz';
import { SubjectItem, IMAGE_TYPE } from '../models/ModuleModels';

let _quizes = [];

export class CustomQuiz {
  /** obj properties with default values */
  static structure = {
    title            : '',
    description      : '',
    indexID_quiz     : -1,
    timestampCreated : -1,
    questions        : QuizQuestion.wrapArray([]),
    itemsPerSubject  : -1,
    maxItemsQuiz     : -1,
    distributeEqually: false,
    subjects         : SubjectItem.wrapArray([]),
    subjectIDs       : [],
  };

  /** wrap object with CustomQuiz.structure to prevent missing properties and enable VSCODE type intellesense */
  static wrap(data = CustomQuiz.structure){
    return ({
      //assign default properties w/ default values
      ...CustomQuiz.structure,
      //remove all default values and replace w/ null
      ...replacePropertiesWithNull(CustomQuiz.structure),
      //combine with obj from param
      ...(data || {}),
    });
  };

  /** wraps each element in an array to make sure */
  static wrapArray(items = [CustomQuiz.structure]){
    return items.map((item) => CustomQuiz.wrap(item));
  };

  static randomizeQuestionOrder(quiz){
    const quizItem = CustomQuiz.wrap(quiz); 
    const questions = quizItem.questions || [];
    const shuffled = shuffleArray(questions);

    return {
      ...quizItem,
      questions: shuffled,
    };
  };

  static createQuiz({title = '', description = '', selected = [], itemsPerSubject = -1, maxItemsQuiz = -1, shouldDistributeEqually = false}){
    const selectedSubjs = SubjectItem.wrapArray(selected);
    
    const uniqueSubjectIDs = [...new Set(selectedSubjs.map(subj => subj.indexid))];
    const uniqueSubjects = selectedSubjs.filter(subject => {
      const match = uniqueSubjectIDs.find(id => (id === subject.indexid));
      //add to array if has match, otherwise skip
      return match !== undefined;
    });


    //append indexid's from subj to questions for identification
    const subjects = selectedSubjs.map(subject => {
      //extract indexid from subject
      const { indexid, indexID_module, questions } = subject;

      //pass down indexid's to each questions
      const new_questions = questions.map((question, index) => {
        return {
          ...question,
          indexID_module  : indexID_module,
          indexID_subject : indexid,
          indexID_question: index,
        };
      });

      return {
        ...subject,
        questions: new_questions,
      };
    });

    let questions = [];
    subjects.forEach(subject => {
      const max = (subject.allocatedItems || 0);
      const shuffled = shuffleArray(subject.questions);
      const items = shuffled.slice(0, max);
      questions.push(...items);
    });

    const shuffled = shuffleArray(questions);
    const sliced   = shuffled.slice(0, maxItemsQuiz)

    return CustomQuiz.wrap({
      questions       : sliced,
      indexID_quiz    : Date.now(),
      timestampCreated: Date.now(),
      subjects        : uniqueSubjects,
      subjectIDs      : uniqueSubjectIDs,
      //pass down items
      title, description, itemsPerSubject, maxItemsQuiz, shouldDistributeEqually
    });
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
      const quizes = CustomQuiz.wrapArray(raw_quizes || []);
      //update cache variable
      _quizes = quizes;

      return (quizes);

    } catch(error){
      console.error('Failed to read custom quizes from store.');
      throw error;
    };
  };

  /** get quizes from cache variable */
  static get(){
    return CustomQuiz.wrapArray(_quizes);
  };

  /** get the base64Images from the question's URI's */
  static async getImages(data){
    const quiz = CustomQuiz.wrap(data);
    const base64Images = {};

    for(const question of quiz.questions){
      const { imageType, photouri } = question;
      
      try {
        if(imageType == IMAGE_TYPE.FS_URI){
          const base64Image = await FileSystem.readAsStringAsync(photouri);
          base64Images[photouri] = base64Image;
        };
      } catch(error){
        console.log('Unable to getImages');
        console.log(error);
      };
    };

    return { quiz, base64Images };
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