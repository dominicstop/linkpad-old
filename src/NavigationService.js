import { NavigationActions } from 'react-navigation';

let _rootNavigator;
let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  console.log('Navigating');
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}

function setRootNavigator(navigatorRef) {
  _navigator = navigatorRef;
}


function navigateRoot(routeName, params) {
  _rootNavigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}

// add other navigation functions that you need and export them

export default {
  navigate,
  setTopLevelNavigator,
  setRootNavigator,
  navigateRoot,

};