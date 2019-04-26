import { NetInfo, Clipboard } from 'react-native';
import { timeout, parseIfJSON } from './Utils';
import _ from 'lodash';

export class Login {
  static URL = 'https://linkpad-pharmacy-reviewer.firebaseapp.com/login';

  static ERROR_TYPE = {
    RESPONSE_NOT_OKAY: 'RESPONSE_NOT_OKAY',
    RESPONSE_NOT_JSON: 'RESPONSE_NOT_JSON',
    NO_INTERNET      : 'NO_INTERNET'      ,
    USER_NOT_FOUND   : 'USER_NOT_FOUND'   ,
    WRONG_PASSWORD   : 'WRONG_PASSWORD'   , 
  };

  static ERROR_MSG = {
    RESPONSE_NOT_OKAY: 'There seems to be a problem with the server. Try again later.',
    RESPONSE_NOT_JSON: 'Looks like the server is having some issues. Try again later.',
    NO_INTERNET      : 'Unable to connect to server. Please check your internet connection',
    USER_NOT_FOUND   : 'Invalid Email: User does not exist.',
    WRONG_PASSWORD   : 'Sorry, the password is invalid.',
    UKNOWN_ERROR     : 'Something went wrong, unable to login.',
  };

  /** corresponds to the response.message string from server */
  static RESPONSE_MESSAGE = {
    USER_NOT_FOUND: 'User not found',
    WRONG_PASSWORD: 'Wrong Password',
    SUCCESS       : 'Successfully logged in',
  };

  static MESSAGE_TYPE = {
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    WRONG_PASSWORD: 'WRONG_PASSWORD',
    SUCCESS       : 'SUCCESS',
  };

  static async login({email, pass}, throwErrorIfLoginInvalid = false) {
    const { ERROR_TYPE } = Login;
    try {
      //check for internet connectivity
      const isConnected = await NetInfo.isConnected.fetch();
      if(!isConnected) throw ERROR_TYPE.NO_INTERNET;
    
      //post email/pass and wait for response
      const response = await fetch(Login.URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, pass}),
      });

      //show error when response not okay
      if(!response.ok) throw ERROR_TYPE.RESPONSE_NOT_OKAY;

      //parse response as text
      const text = await response.text();
      //parse and check if the response is json
      const { isJson, json } = await parseIfJSON(text);

      //throw an error if response is not a json
      if(!isJson) throw ERROR_TYPE.RESPONSE_NOT_JSON;
      //throw an error if login is not successful
      if(throwErrorIfLoginInvalid && !json.success) throw Login.getResponseMessageType(json.message);  
      
      //resolve results
      return {
        success: json.success || false, // whether or not if the login is successful
        message: json.message || null , // ex: "Successfully logged in", "Wrong Password", "User not found"
        user   : json.user    || null , // obj: user inf, ex: email, firstname, isPremium etc.
        uid    : json.uid     || null , // unique user identifier
      };

    } catch(error) {
      console.log("login: Unable to login.");
      console.log(error);
      throw error;
    };
  };

  static async mockLogin({email, pass}, onError){
    await timeout(2000);
    return({
      "success": true,
      "message": "Successfully logged in",
      "user": {
        "email": "testaccount6@gmail.com",
        "firstname": "test",
        "ispremium": "False",
        "lastlogin": "",
        "lastname": "account",
        "userid": "testaccount6"
      },
      "uid": "X7CYGDXvPuRCzV0Kyq9i180BUj12"
    });
  };

  static async mockDownload(callback){
    for (let index = 0; index <  100; index++) {
      await timeout(100);
      callback && callback(index);
    };
  };

  static getErrorMessage(type){
    const { ERROR_TYPE, ERROR_MSG } = Login;
    switch (type) {
      case ERROR_TYPE.RESPONSE_NOT_OKAY: return (ERROR_MSG.RESPONSE_NOT_OKAY);
      case ERROR_TYPE.RESPONSE_NOT_JSON: return (ERROR_MSG.RESPONSE_NOT_JSON);
      case ERROR_TYPE.NO_INTERNET      : return (ERROR_MSG.NO_INTERNET      );
      case ERROR_TYPE.USER_NOT_FOUND   : return (ERROR_MSG.USER_NOT_FOUND   );
      case ERROR_TYPE.WRONG_PASSWORD   : return (ERROR_MSG.WRONG_PASSWORD   );
      default: return (ERROR_MSG.UKNOWN_ERROR);
    };
  };

  static getResponseMessageType(message){
    const { RESPONSE_MESSAGE, MESSAGE_TYPE } = Login;
    switch (message) {
      case RESPONSE_MESSAGE.USER_NOT_FOUND: return (MESSAGE_TYPE.USER_NOT_FOUND);
      case RESPONSE_MESSAGE.WRONG_PASSWORD: return (MESSAGE_TYPE.WRONG_PASSWORD);
      case RESPONSE_MESSAGE.SUCCESS       : return (MESSAGE_TYPE.SUCCESS       );
      default: return ('');
    };
  };
};

export class LoginResponseModel {
  static structure = {
    success: true,
    message: '',
    uid: '',
    user: {
      email: '',
      firstname: '',
      ispremium: false,
      lastlogin: '',
      lastname: '',
      userid: ''
    },
  };

  static wrap(response = LoginResponseModel.structure){
    return {...LoginResponseModel.structure, ...response || {}};
  };
};