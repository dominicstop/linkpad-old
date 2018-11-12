import React, { Fragment } from 'react';
import { View, ScrollView, Platform,StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';

import { AboutDeveloperScreen } from './AboutDeveloperScreen';
import { HEADER_PROPS, STYLES } from '../Constants';

import { AndroidHeader } from '../components/AndroidHeader';
import { CustomHeader  } from '../components/Header';

import { ViewWithBlurredHeader, IconText, Card, AnimateInView } from '../components/Views';
import { DrawerButton, PlatformTouchableIconButton } from '../components/Buttons';

import { Header, createStackNavigator } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';

//shown when there are no active preboard
export class AboutCard extends React.PureComponent {
  static propTypes = {
    onPressMore: PropTypes.func,
  };

  static styles = StyleSheet.create({
    card: {
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: 15
    },
    image: {
      width: 90, 
      height: 90,
    },
    title: {
      fontSize: 32, 
      fontWeight: '700', 
      marginTop: 10, 
      color: '#311B92'
    },
    textBody: {
      flex: 1, 
      fontSize: 20,
      marginTop: 5, 
      textAlign: 'justify'
    },
    button: {
      width: '100%', 
      backgroundColor: '#7C4DFF', 
      marginTop: 15
    }
  });

  constructor(props){
    super(props);
    this.image = require('../../assets/icons/books.png');
  };

  _renderButton(){
    const { styles } = AboutCard;
    const { onPressMore } = this.props;

    return(
      <PlatformTouchableIconButton
        wrapperStyle={[styles.button, STYLES.mediumShadow]}
        textStyle={{color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 10}}
        iconName={'heart'}
        iconType={'feather'}
        iconColor={'white'}
        iconSize={24}
        text={'More Info'}
        onPress={onPressMore}
      />
    );
  };

  render(){
    const { styles } = AboutCard;

    return (
      <Card style={styles.card}>
        <Animatable.Image
          source={this.image}
          style={styles.image}
          animation={'pulse'}
          iterationCount={"infinite"}
          duration={5000}
          easing={'ease-in-out'}
          useNativeDriver={true}
        />
        <Text style={styles.title}>{'About LinkPad'}</Text>
        <Text style={styles.textBody}>
          {"LinkPad Review is Vestibulum id ligula porta felis euismod semper. Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum."}
        </Text>
        {this._renderButton()}
      </Card>
    );
  };
};

//shared icon betw ios/android
const iconProps = { 
  name : 'info', 
  type : 'feather', 
  color: 'white',
  size : 22, 
};

//android and ios icons
const titleIcon = <Icon {...iconProps} containerStyle={{marginTop: 3}}/>
const headerTitle = (props) => <CustomHeader {...props} {...iconProps}/>

export class AboutScreen extends React.Component {
  static navigationOptions=({navigation, screenProps}) => ({
    headerTitle,
    title: 'About',
    headerLeft : <DrawerButton/>,
    
    //custom android header
    ...Platform.select({
      android: { header: props => 
        <AndroidHeader {...{titleIcon, ...props}}/> 
    }}),
  });

  static styles = StyleSheet.create({
    scrollview: Platform.select({
      ios    : { paddingTop: 10 },
      android: { paddingTop: 15 },
    }),
  });

  constructor(props){
    super(props);

    this.state = {
      mount: false,
    };
  };

  componentDidMount(){
    //delay rendering
    setTimeout(() => this.setState({mount: true}), 0);
  };

  _handleOnPressMore = () => {
    const { navigation } = this.props;
    navigation.navigate('AboutDeveloperRoute');
  };

  _renderFooter = () => {
    const delay = 2000;
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'zoomIn'  ,
    });

    return (
      <Animatable.View 
        style={{paddingBottom: 80}}
        duration={750}
        useNativeDriver={true}
        {...{animation, delay}}
      >
        <Animatable.View
          animation={'pulse'}
          duration={1000}
          easing={'ease-in-out'}
          delay={3000}
          iterationCount={'infinite'}
          useNativeDriver={true}
          {...{delay}}
        >
          <Icon
            name={'heart'}
            type={'entypo'}
            color={'#B39DDB'}
            size={24}
          />
        </Animatable.View>
      </Animatable.View>
    );
  };

  render(){
    if(!this.state.mount) return null;

    const { styles } = AboutScreen;
    const offset = Header.HEIGHT;

    return(
      <ViewWithBlurredHeader>
        <ScrollView
          contentContainerStyle={styles.scrollview}
          contentInset={{top: offset}}
          contentOffset={{x: 0, y: -offset}}
        >
          <AnimateInView duration={500}>
            <AboutCard onPressMore={this._handleOnPressMore}/>
            <View/>
          </AnimateInView>
          {this._renderFooter()}
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};

export const AboutStack = createStackNavigator({
  AboutRoute: {
      screen: AboutScreen,
    },
    AboutDeveloperRoute: {
      screen: AboutDeveloperScreen,
    }
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: HEADER_PROPS,
  }
);