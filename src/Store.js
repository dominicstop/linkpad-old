import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import   thunk      from 'redux-thunk';

import rootReducer from './reducers'
import Actions     from './Actions';

const initialState = {};
const middleware   = [thunk];

const store = createStore(
  rootReducer , 
  initialState, 
  applyMiddleware(...middleware)
);

export default store;