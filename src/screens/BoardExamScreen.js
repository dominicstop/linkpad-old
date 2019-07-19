import React, { Fragment } from 'react';
import { View, ScrollView, RefreshControl, Text, TouchableOpacity, Platform, Image, StyleSheet, Clipboard } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService      from '../NavigationService';
import Constants, { HEADER_PROPS, STYLES, ROUTES, LOAD_STATE, FONT_STYLES, HEADER_HEIGHT } from '../Constants';

import { PreboardExamListScreen } from './BoardExamListScreen';
import { BoardExamTestStack, BoardExamTestScreen     } from './BoardExamTestScreen';

import   LottieCircle    from '../components/LottieCircle';
import { setStateAsync, plural } from '../functions/Utils';
import { AndroidHeader } from '../components/AndroidHeader';
import { CustomHeader  } from '../components/Header';
import { ExamDetails   } from '../components/PreboardExam';

import { ViewWithBlurredHeader, IconText, Card, AnimateInView } from '../components/Views';
import { DrawerButton, PlatformTouchableIconButton } from '../components/Buttons';
import { PreboardExamstore, PreboardExam } from '../functions/PreboardExamStore';

import { Header, createStackNavigator } from 'react-navigation';
import * as Animatable from 'react-native-animatable';
import { Icon, Divider } from 'react-native-elements';
import { Surface } from 'react-native-paper';

import moment from 'moment';
import { GREY } from '../Colors';
import { PlatformButton } from '../components/StyledComponents';

class PreboardHeader extends React.PureComponent {
  static propTypes = {
    preboard   : PropTypes.array,
    lastUpdated: PropTypes.number,
  };

  static styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      paddingTop: 15,
      marginBottom: 20,
      paddingHorizontal: 12,
      paddingBottom: 16,
      backgroundColor: 'white',
      shadowColor: 'black',
      elevation: 10,
      shadowRadius: 4,
      shadowOpacity: 0.4,
      shadowOffset:{
        width: 2,  
        height: 3,  
      },
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    headerTextContainer: {
      flex: 1, 
      justifyContent: 'center', 
    },
    divider: {
      marginHorizontal: 15,
      marginVertical: 8,
    },  
  });

  constructor(props){
    super(props);
    this.imageHeader = require('../../assets/icons/notes-pencil.png');    
  };

  render(){
    const { styles } = PreboardHeader;
    
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'fadeInRight',
    });

    return(
      <Animatable.View
        style={styles.card}
        duration={400}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        <Animatable.Image
          source={this.imageHeader}
          style={styles.image}
          animation={'pulse'}
          easing={'ease-in-out'}
          iterationCount={"infinite"}
          duration={5000}
          useNativeDriver={true}
        />
        <View style={styles.headerTextContainer}>
          <Text style={FONT_STYLES.cardTitle}>
            {'Preboard Exam'}
          </Text>
          <Text style={FONT_STYLES.cardSubtitle}>
            {'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Etiam porta sem malesuada magna mollis euismod.'}
          </Text>
        </View>
      </Animatable.View>
    );
  };
};

class BoardExamMainScreen extends React.Component {
  static navigationOptions = () => {
    const headerTitle = (props) => (
      <CustomHeader
        name={'ios-clipboard'}
        type={'ionicon'}
        size={24}
        {...props}
      />
    );

    return ({
      title: 'Preboard',
      headerTitle,
      //custom android header
      ...Platform.select({
        android: { header: props => <AndroidHeader {...props}/> }
      }),
    });
  };

  static styles = StyleSheet.create({
    title: {
      fontSize: 19,
      fontWeight: '800'
    },
    description: {
      fontSize: 15,
      color: GREY[900],
    },
    divider: {
      margin: 7,
    },
    //#region - Detail Styles
    detailContainer: {
    },
    detailRow: {
      flexDirection: 'row',
      paddingVertical: 2,
    },
    detailLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
    },
    detail: {
      fontSize: 15,
      fontWeight: '200',

    },
    //#endregion
    //#region 
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 7,
    },
    footerTitle: {
      fontSize: 17,
      fontWeight: '500',
    },
    footerSubtile: {
      fontSize: 15,
      fontWeight: '200',
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    footerTextContainer: {
      flex: 1, 
    },
    //#endregion
  });

  constructor(props){
    super(props);
    this.imageFooter = require('../../assets/icons/notes-pencil.png');    
    this.state = {
      loading : LOAD_STATE.LOADING,
      preboard: null,
    };
  };

  async componentDidMount(){
    const preboard = await PreboardExamstore.fetchAndSave();

    this.setState({
      preboard,
      loading: LOAD_STATE.SUCCESS,
    });
  };

  getActiveExam(){
    const { preboard: _preboard } = this.state;
    const { examkey, exams } = PreboardExam.wrap(_preboard);
    return exams.find(exam => 
      (exam.indexid === examkey)
    );
  };

  _handleOnPressTakePreboard = () => {
    const { NAV_PARAMS } = BoardExamTestScreen;
    const { navigation } = this.props;
    
    const exam = this.getActiveExam();
    const questions = PreboardExam.createQuestionList(exam);

    navigation && navigation.navigate(
      ROUTES.PreboardExamTestRoute, { 
        [NAV_PARAMS.exam    ]: exam     , 
        [NAV_PARAMS.questions]: questions, 
    });
  };

  _renderLoading(){

  };

  _renderError(){

  };

  _renderActive(){
    const { styles } = BoardExamMainScreen;
    const { preboard: _preboard } = this.state;
    const preboard = PreboardExam.wrap(_preboard);

    const {timelimit, ...exam} = this.getActiveExam();

    const formatInput  = 'YYYY-MM-DD';
    const formatOutput = 'ddd, MMMM D YYYY';

    const startDate = moment(exam.startdate, formatInput).format(formatOutput);
    const enddate   = moment(exam.enddate  , formatInput).format(formatOutput);

    const TITLE = (
      <Fragment>
        <Text style={styles.title}>
          {exam.examname || 'Exam Name N/A'}
        </Text>
        <Text style={styles.description}>
          {exam.description || 'Description N/A'}
        </Text>
      </Fragment>
    );

    const DETAILS = (
      <View style={styles.detailContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {'Start Date'}
          </Text>
          <Text style={styles.detail}>
            {exam.startdate? startDate : 'N/A'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {'End Date'}
          </Text>
          <Text style={styles.detail}>
            {exam.enddate? enddate : 'N/A'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {'Time Limit'}
          </Text>
          <Text style={styles.detail}>
            {timelimit? `${timelimit} ${plural('Hour', timelimit)}` : 'N/A'}
          </Text>
        </View>
      </View>
    );

    const FOOTER = (
      <View style={styles.footer}>
        <Animatable.Image
          source={this.imageFooter}
          style={styles.image}
          animation={'pulse'}
          easing={'ease-in-out'}
          iterationCount={"infinite"}
          duration={5000}
          useNativeDriver={true}
        />
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerTitle}>
            {'Preboard Exam Available'}
          </Text>
          <Text style={styles.footerSubtile}>
            {"It looks like you haven't taken the exam yet, be sure to take it before the specified end date."}
          </Text>
        </View>
      </View>
    );

    return(
      <Card>
        {TITLE}
        <Divider style={styles.divider}/>
        {DETAILS}
        <Divider style={styles.divider}/>
        {FOOTER}
        <PlatformButton
          title={'Take Preboard'}
          subtitle={'Start the preboard exam'}
          onPress={this._handleOnPressTakePreboard}
          iconName={'clipboard'}
          iconType={'feather'}
          iconDistance={10}
          isBgGradient={true}
          showChevron={true}
        />
      </Card>
    );
  };

  _renderInactive(){
  };


  render(){
    const { loading, preboard: _preboard } = this.state;
    const preboard = PreboardExam.wrap(_preboard);
    
    const body = (() => {
      switch (loading) {
        case LOAD_STATE.LOADING: return this._renderLoading();
        case LOAD_STATE.ERROR  : return this._renderError  (); 
        case LOAD_STATE.SUCCESS: return (preboard.active
          ? this._renderActive  ()
          : this._renderInactive()
        );
      };
    })();

    return(
      <ViewWithBlurredHeader>
        <ScrollView
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
        >
          <PreboardHeader/>
          {body}
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};

const CustomQuizExamStack = createStackNavigator({
    [ROUTES.PreboardExamRoute    ]: BoardExamMainScreen,
    [ROUTES.PreboardExamTestRoute]: BoardExamTestScreen,
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: {
      gesturesEnabled: false,
      ...Constants.HEADER_PROPS
    },
  }
);

//container for the stacknav: CustomQuizExamStack
export class BoardExamScreen extends React.PureComponent {
  static router = CustomQuizExamStack.router;

  static navigationOptions = {
    header: null,
  };

  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1, 
      height: '100%', 
      width: '100%', 
      backgroundColor: 'rgb(233, 232, 239)'
    },
  });

  _renderContents(){
    return(
      <CustomQuizExamStack
        navigation={this.props.navigation}
        screenProps={{
          ...this.props.screenProps,
        }}
      />
    );
  };

  render(){
    const { styles } = BoardExamScreen;

    return (
      <View style={styles.rootContainer}>
        {this._renderContents()}
      </View>
    );
  };
};