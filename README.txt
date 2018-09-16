Files I Modified Inside node_modules

1) DrawerLayout.js
  DIR: /kaacbay/node_modules/react-native-drawer-layout/dist
  CHANGES:
    Line 413: backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backgroundColor: _reactNative.Platform.OS == 'ios'? 'rgba(0, 0, 0, 0.0)' : 'rgba(0, 0, 0, 0.5)',


2) LinearGradient.android.js and LinearGradient.ios.js
  DIR: /kaacbay/node_modules/expo/src/effects
  CHANGES:
    ADD TO LINE 21 (Inside the class LinearGradient):
      setNativeProps(props) {
        this.gradientRef.setNativeProps(props);
      }