import React, { Fragment } from 'react';
import { View, ScrollView, RefreshControl, Text, TouchableOpacity, Platform, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService';
import { HEADER_PROPS, STYLES          } from '../Constants';
import { ViewWithBlurredHeader, IconText, Card } from '../components/Views' ;
import { CustomHeader          } from '../components/Header';
import { DrawerButton, IconButton, PlatformTouchableIconButton } from '../components/Buttons';

import PreboardExamStore from '../functions/PreboardExamStore';
import LottieCircle from '../components/LottieCircle';
import { BoardExamTestScreen } from './BoardExamTestScreen';
import { PreboardExam, PreboardExamManager, PreboardExamItem, PreboardExamModuleItem } from '../functions/PreboardExamStore';
import { setStateAsync } from '../functions/Utils';
import { AnimateInView } from '../components/Views';

import * as Animatable from 'react-native-animatable';
import { Header, createStackNavigator } from 'react-navigation';
import { Icon, Divider } from 'react-native-elements';
import PlatformTouchable from '../components/Touchable';


//first card: explains what preboard exam is
export class IntroductionCard extends React.PureComponent {
  static propTypes = {
    onPressMore: PropTypes.func
  }

  constructor(props){
    super(props);
    this.animationSource = require('../animations/text.json');
  }

  _handleOnPress = () => {
    const { onPressMore } = this.props;
    onPressMore && onPressMore();
  }

  _renderButton(){
    return(
      <PlatformTouchableIconButton
        wrapperStyle={[{width: '100%', backgroundColor: '#7C4DFF', marginTop: 15}, STYLES.mediumShadow]}
        textStyle={{color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 10}}
        iconName={'bookmark'}
        iconType={'feather'}
        iconColor={'white'}
        iconSize={24}
        text={'Learn More'}
        onPress={this._handleOnPress}
      />
    );
  }

  render(){
    return (
      <Card style={{paddingVertical: 15, alignItems: 'center', justifyContent: 'center'}}>
        <LottieCircle 
          containerStyle={{backgroundColor: '#7C4DFF', marginTop: 15}}
          source={this.animationSource}
          ref={r => this.lottie = r}
          circleSize={90}
          iconSize={550}
        />
        <Text style={{fontSize: 32, fontWeight: '700', marginTop: 10, color: '#311B92'}}>{'Preboard Exam'}</Text>
        <Text style={{flex: 1, fontSize: 20, marginTop: 5, textAlign: 'justify'}}>
          {"Our Preboard exam will help you test all the things you've learned so far! We create a new one every year to test how you'll do."}
        </Text>
        {this._renderButton()}
      </Card>
    );
  }
}

//shown when there are no active preboard
export class InactiveCard extends React.PureComponent {
  constructor(props){
    super(props);
    this.image = require('../../assets/icons/letter.png');
  }

  render(){
    return (
      <Card style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 15}}>
        <Animatable.Image
          source={this.image}
          style={{width: 75, height: 75}}
          animation={'pulse'}
          iterationCount={"infinite"}
          duration={5000}
          easing={'ease-in-out'}
          useNativeDriver={true}
        />
        <Text style={{fontSize: 32, fontWeight: '700', marginTop: 10, color: '#311B92'}}>{'Not Available'}</Text>
        <Text style={{flex: 1, fontSize: 20, marginTop: 5, textAlign: 'justify'}}>
          {"Sorry, it looks like there isn't a Preboard Exam available right now. Pull down to refresh or check again at a later time."}
        </Text>
      </Card>
    );
  }
}

//shown when there is an active preboard
export class ActiveCard extends React.PureComponent {
  static propTypes = {
    preboardData: PropTypes.object.isRequired,
    onPressStart: PropTypes.func,
  };

  static styles = StyleSheet.create({
    detailRow: {
      flex: 1, 
      flexDirection: 'row', 
      marginTop: 7,
    },
    titleStyle: {
      fontSize: 18,
      fontWeight: '500',
      ...Platform.select({ android: {
        fontWeight: '900',
      }})
    },
    subtitleStyle: {
      fontSize: 24,
      fontWeight: '200',
      ...Platform.select({ android: {
        fontWeight: '100',
        color: 'grey'
      }})
    },
  });

  constructor(props){
    super(props);
    this.image = require('../../assets/icons/tablet.png');
  }

  _handleOnPress = () => {
    const { onPressStart } = this.props;
    onPressStart && onPressStart();
  }

  _renderHeading(){
    return(
      <Fragment>
        <Image
          source={require('../../assets/icons/tablet.png')}
          style={{width: 75, height: 75, marginTop: 10}}
          animation={'pulse'}
          iterationCount={"infinite"}
          duration={5000}
          easing={'ease-in-out'}
          useNativeDriver={true}
        />
        <Text style={{fontSize: 32, fontWeight: '700', marginTop: 10, color: '#311B92'}}>{'Take the Test'}</Text>
        <Text style={{flex: 1, fontSize: 20, marginTop: 5, textAlign: 'justify'}}>
          {"A Preboard exam is currently available! Whenever you're ready, you can take the ecam right here and right now."}
        </Text>
      </Fragment>
    );
  }

  _renderDescription(){
    const { preboardData } = this.props;
    const model = new PreboardExam(preboardData);
    const exams = model.getExams();

    let   examData = exams[0].get();
    return(
      <View style={{alignSelf: 'stretch', marginTop: 15}}>
        <IconText
          //icon
          iconName={'message-circle'}
          iconType={'feather'}
          iconColor={'rgba(74, 20, 140, 0.5)'}
          iconSize={26}
          //title
          text={'Description'}
          textStyle={{fontSize: 24, fontWeight: '800', color: '#311B92'}}
        />
        <Text style={{flex: 1, fontSize: 20, marginTop: 5, textAlign: 'justify'}}>
          {examData.description}
        </Text>
      </View>
    );
  }

  _renderDetails(){
    const { styles } = ActiveCard;
    const { preboardData } = this.props;
    const model = new PreboardExam(preboardData);
    const exam = model.getActiveExamAsModel();
    const examData = exam.get();
    
    let countModules  = exam.getTotalModules();
    let countQuestion = exam.getTotalQuestions();
 

    return(
      <View style={{alignSelf: 'stretch', marginTop: 15}}>
        <IconText
          //icon
          iconName={'file-text'}
          iconType={'feather'}
          iconColor={'rgba(74, 20, 140, 0.5)'}
          iconSize={26}
          //title
          text={'Exam Details'}
          textStyle={{fontSize: 24, fontWeight: '800', color: '#311B92'}}
        />
        <View style={styles.detailRow}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.titleStyle   }>{'Start: '}</Text>
            <Text numberOfLines={1} style={styles.subtitleStyle}>{examData.startdate}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.titleStyle   }>{'End: '}</Text>
            <Text numberOfLines={1} style={styles.subtitleStyle}>{examData.enddate}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.titleStyle   }>{'Modules: '}</Text>
            <Text numberOfLines={1} style={styles.subtitleStyle}>
              {countModules + ' module' + (countModules > 1? 's' : '')}
            </Text>
          </View>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.titleStyle   }>{'Questions: '}</Text>
            <Text numberOfLines={1} style={styles.subtitleStyle}>
              {countQuestion + ' item' + (countModules > 1? 's' : '')}
            </Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={styles.titleStyle   }>{'Date Posted: '}</Text>
            <Text numberOfLines={1} style={styles.subtitleStyle}>{examData.dateposted}</Text>
          </View>
        </View>
      </View>
    );
  }

  _renderButton(){
    return(
      <PlatformTouchableIconButton
        wrapperStyle={[{width: '100%', backgroundColor: '#7C4DFF', marginTop: 15}, STYLES.mediumShadow]}
        textStyle={{flex: 1, color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 10}}
        iconName={'edit-3'}
        iconType={'feather'}
        iconColor={'white'}
        iconSize={24}
        text={'Start Exam'}
        onPress={this._handleOnPress}
      >
        <Icon
          name ={'chevron-right'}
          color={'rgba(255, 255, 255, 0.5)'}
          type ={'feather'}
          size ={27}
        /> 
      </PlatformTouchableIconButton>
    );
  }

  render(){
    return (
      <Card style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 15}}>
        {this._renderHeading()}
        {this._renderDescription()}
        {this._renderDetails()}
        {this._renderButton()}
      </Card>
    );
  }
}

const BoardExamHeader = (props) => <CustomHeader {...props}
  iconName='menu'
  iconType='simple-line-icon'
  iconSize={22}
/>

export class BoardExamScreen extends React.Component {
  static navigationOptions=({navigation, screenProps}) => ({
    title: 'Board Exam',
    headerTitle: BoardExamHeader,
    headerLeft : <DrawerButton drawerNav={screenProps.drawerNav}/>,
  });

  static styles = StyleSheet.create({
    scrollview: Platform.select({
      android: {
        paddingTop: 15,
      }
    }),
  });

  constructor(props){
    super(props);
    this.state = {
      preboard: null,
      isActive: false,
      refreshing: false
    }
    this.preboard = new PreboardExamManager();
    
  }

  async componentWillMount(){
    //get preboard exams
    let preboardModel = await this.preboard.getAsModel();
    const isActive = true;//preboardModel.response.active;
    this.setState({preboard: preboardModel.get(), isActive});
  }

  _onRefresh = async () => {
    setStateAsync(this, {refreshing: true});
    await this.preboard.refresh();
    let preboardModel = await this.preboard.getAsModel();
    setStateAsync(this, {refreshing: false, preboard: preboardModel.get()});
  }

  _handleOnPressMore = () => {
    const { getBoardExamModelRef } = this.props.screenProps;
    getBoardExamModelRef && getBoardExamModelRef().showModal();
  }

  _handleOnPressStart = () => {
    const { navigation } = this.props;
    navigation && navigation.navigate('BoardExamTestRoute');
  }

  _renderCards = () => {
    const { isActive, preboard } = this.state;
    
    return(
      <Fragment>
        {!isActive && <InactiveCard/>}
        { isActive && <ActiveCard 
          preboardData={preboard}
          onPressStart={this._handleOnPressStart}
        />}
      </Fragment>
    );
  }

  _renderRefreshCotrol(){
    const { refreshing } = this.state;
    const prefix = refreshing? 'Checking' : 'Pull down to check';
    return(
      <RefreshControl 
        {...{refreshing}}
        onRefresh={this._onRefresh}
        title={prefix + ' for changes...'}
      />
    );
  }

  render(){
    const { styles } = BoardExamScreen;
    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <ScrollView
          contentContainerStyle={styles.scrollview}
          contentInset={{top: Header.HEIGHT}}
          contentOffset={{x: 0, y: -70}}
          ref={r => this.scrollview = r}
          refreshControl={this._renderRefreshCotrol()}
        >
          <AnimateInView duration={500}>
            <IntroductionCard onPressMore={this._handleOnPressMore}/>
            {this._renderCards()}
          </AnimateInView>
          <View style={{height: 125}}/>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  }
}

export const styles = StyleSheet.create({

});

export const BoardExamStack = createStackNavigator({
    BoardExamRoute: {
      screen: BoardExamScreen,
    },
    BoardExamTestRoute: {
      screen: BoardExamTestScreen,
      navigationOptions: {
        gesturesEnabled: false,
      }
    },
  }, {
    initialRouteName: 'BoardExamRoute',
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    //mode: 'modal',
    navigationOptions: HEADER_PROPS,
  }
);