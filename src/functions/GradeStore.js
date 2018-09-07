import store from 'react-native-simple-store';
import _ from 'lodash';

const KEY   = 'grade_practice';
const DEBUG = true;

let _gradeData = null;

let structure = {
  grades: [
    {
      indexID_module : '',
      indexID_subject: '',

      timestamp_started: '',
      timestamp_ended  : '',

      answers: [
        {
          indexID_question: '',
          answer: '',
          isCorrect: false,
          timestamp: '',
        }
      ]
    }
  ]
}

getGrades = () => {
  return new Promise(async (resolve, reject) => {
    if(DEBUG) console.log('\nReading Practice Grades: ');
    //has not been set, init with storage
    if(_gradeData == null){
      //get modules from storage
      _gradeData = await store.get(KEY);
    }
    //resolve tips data
    if(DEBUG) console.log(_gradeData);
    resolve(_gradeData);
  });
}

setGrades = (grades_array) => {
  return new Promise(async (resolve, reject) => {
    try {
      //delete previous data
      await store.delete(KEY);
      //write grades to storage
      for(let grade of grades_array){
        await store.push(KEY, grade);
      }
      //update grades global var
      _gradeData = grades_array;
    } catch(error){
      reject(error);
    }
    //resolve  data
    resolve(_gradeData);
  }); 
}

addGrade = (grade_item) => {
  //convert grade_item to JSON Stirng
  //let grade_item_string = JSON.stringify(grade_item);
  if(DEBUG) console.log(_gradeData);
  return store.push(KEY, grade_item);
}

export default {
  getGrades,
  setGrades,
  addGrade,
}