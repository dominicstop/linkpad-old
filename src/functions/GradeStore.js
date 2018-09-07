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

/*
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
*/

getGrades = () => {
  return store.get(KEY);
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

addGrade = (new_grade_item) => {
  return new Promise(async (resolve, reject) => {
    try { 
      if(DEBUG){
        console.log('\n\n\n\n\nGrade Store - adding grade:');
        console.log(new_grade_item);
      }

      let current_grades = await store.get(KEY);
      if(DEBUG){
        console.log('\nREADING GRADES: ');
        console.log(current_grades);
      }

      let match_index = null;
      let matching_grade_item = null;

      if(current_grades != null){
        if(DEBUG) console.log('\ncurrent_grades not null');
        //find matching grade_item
        match_index = 0;
        matching_grade_item = current_grades.find((item, index) => {
          if(DEBUG){
            console.log('\n\ngrade item from store: ');
            console.log('array index    : ' + index);
            console.log('indexID_module : ' + item.indexID_module );
            console.log('indexID_subject: ' + item.indexID_subject);
          }
          match_index = index;
          return item.indexID_module == new_grade_item.indexID_module && item.indexID_subject == new_grade_item.indexID_subject;
        });

        if(DEBUG){
          console.log('\n\n\n\nMatching Grade Item');
          console.log('index: ' + match_index);
          console.log(matching_grade_item);
          console.log('\n\ncurrent_grades: ');
          console.log(current_grades);
        }

        if(matching_grade_item != null){
          //overwrite
          current_grades[match_index] = new_grade_item;

          if(DEBUG){
            console.log('\n\n\n\nAFTER CHANGE: ');
            console.log(current_grades);
          }
        }
      }

      if(current_grades == null || matching_grade_item == null){
        await store.push(KEY, new_grade_item);
      } else {
        if(DEBUG){
          console.log('\n\n\nSAVING: ');
          console.log(current_grades);
        }
        await store.save(KEY, current_grades);
      }
    } catch(error){
      reject(error)
    }
    resolve();
  });
}

export default {
  getGrades,
  setGrades,
  addGrade,
}