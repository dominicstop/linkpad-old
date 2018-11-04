import { NavigationActions, DrawerActions } from 'react-navigation';

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


let _authNavigator;
function setAuthNavigator(navigatorRef){
  _authNavigator = navigatorRef;
}

function navigateAuth(routeName, params) {
  _authNavigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}

let _drawerNavigator;
function setDrawerNavigator(navigatorRef){
  _drawerNavigator = navigatorRef;
}

function navigateDrawerToggle() {
  _drawerNavigator.dispatch(
    DrawerActions.toggleDrawer()
  );
}

export default {
  setRootNavigator  , navigateRoot        ,
  setAppNavigator   , navigateApp         ,
  setDrawerNavigator, navigateDrawerToggle,
};