import { NavigationActions } from 'react-navigation';

let _rootNavigator;
function setRootNavigator(navigatorRef) {
  _rootNavigator = navigatorRef;
}

function navigateRoot(routeName, params) {
  _rootNavigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}

let _appNavigator;
function setAppNavigator(navigatorRef){
  _appNavigator = navigatorRef;
}
function navigateApp(routeName, params) {
  _appNavigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}

// add other navigation functions that you need and export them

export default {
  setRootNavigator,
  navigateRoot,
  setAppNavigator,
  navigateApp,
};