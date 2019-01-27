import { Clipboard } from 'react-native'
import store from 'react-native-simple-store';
import _ from 'lodash';

let _quizes = [];

export class CreateCustomQuiz {
  static createQuiz({title, description, selected}){
    const selectedCopy = _.cloneDeep(selected);
    
    //console.log('before selected array: \n\n\n');
    //console.log(selectedCopy);

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
  
        if(subject.questions.length > 0){
          const question = subject.questions.pop();
          questions.push(question);
          selectedCopy[i] = subject;
        };  
      };

      const isEmpty = selectedCopy.every((subject) => {
        return subject.questions.length == 0;
      });  
      console.log('isEmpty: ' + isEmpty);
      if(isEmpty) break;
    };

    console.log('questions: ');
    console.log(questions.length);
    //console.log('original array: \n\n\n');
    //console.log(selectedCopy);
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