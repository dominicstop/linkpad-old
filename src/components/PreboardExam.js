import React, { Fragment } from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, ViewPropTypes, TouchableOpacity, Animated, Easing, Alert, FlatList, Platform } from 'react-native';
import PropTypes from 'prop-types';

import { setStateAsync, timeout, shuffleArray, randomElementFromArray , returnToZero} from '../functions/Utils';

import { IconButton, AnimatedCollapsable } from './Buttons';
import { AnimatedListItem, IconText, Card } from './Views';
import { PreboardExam, PreboardExamManager, PreboardExamItem, PreboardExamModuleItem } from '../functions/PreboardExamStore';
import { STYLES } from '../Constants';
import PlatformTouchable from './Touchable';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import      Carousel   from 'react-native-snap-carousel';
import { Header } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { DangerZone } from 'expo';
const { Lottie } = DangerZone;

export class ExamModuleItem extends React.PureComponent {
  static propTypes = {
    module: PropTypes.object,
  };

  static styles = StyleSheet.create({
    card: {
      paddingHorizontal: 0, 
      paddingVertical: 0,
    },
    container: {
      paddingHorizontal: 15, 
      paddingVertical: 10,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
    },
    subtitle: {
      fontWeight: '100',
      fontSize: 16,
    },
    description: {
      fontSize: 18,
      textAlign: 'justify',
      marginTop: 5,
    }
  });

  _renderBody(){
    const { styles } = ExamModuleItem;
    const { module, style } = this.props;
    const model = new PreboardExamModuleItem(module);
    const data  = model.examModule;
    const questionCount = model.getQuestionCount();

    return(
      <View style={styles.container}>
        <IconText
          //icon
          iconName={'file-text'}
          iconType={'feather'}
          iconColor={'rgba(74, 20, 140, 0.5)'}
          iconSize={32}
          //title
          text={data.premodulename}
          textStyle={styles.title}
          //subtitle
          subtitle={`Questions: ${questionCount} items`}
          subtitleStyle={styles.subtitle}
        />
        <Text style={styles.description}>{data.description}</Text>
      </View>
    );
  }

  render(){
    const { styles } = ExamModuleItem;
    const { style } = this.props;

    return(
      <Card style={[styles.card, style]}>
        <PlatformTouchable >
          {this._renderBody()}
        </PlatformTouchable>
      </Card>
    );
  }
}

export class ExamDetails extends React.PureComponent {
  static propTypes = {
    examData: PropTypes.object,
    showStartEnd  : PropTypes.bool,
    showItemCount : PropTypes.bool,
    showLastRow   : PropTypes.bool,
  };

  static defaultProps = {
    showStartEnd  : true,
    showItemCount : true,
    showLastRow   : true,
  }

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

  //1st row
  _renderStartEnd(){
    const { styles } = ExamDetails;
    const { examData } = this.props;
    //wrap in model for easier access
    const exam = new PreboardExamItem(examData);
    const data = exam.get();

    return (
      <View style={styles.detailRow}>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.titleStyle   }>{'Start: '}</Text>
          <Text numberOfLines={1} style={styles.subtitleStyle}>{data.startdate}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.titleStyle   }>{'End: '}</Text>
          <Text numberOfLines={1} style={styles.subtitleStyle}>{data.enddate}</Text>
        </View>
      </View>
    );
  }

  //2nd row
  _renderItemCount(){
    const { styles } = ExamDetails;
    const { examData } = this.props;
    //wrap in model for easier access
    const exam = new PreboardExamItem(examData);
    const data = exam.get();
    //count items
    const countModules  = exam.getTotalModules();
    const countQuestion = exam.getTotalQuestions();

    return(
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
    );
  }

  //3rd row
  _renderDatePosted(){
    const { styles } = ExamDetails;
    const { examData } = this.props;
    //wrap in model for easier access
    const exam = new PreboardExamItem(examData);
    const data = exam.get();

    return(
      <View style={styles.detailRow}>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.titleStyle   }>{'Date Posted: '}</Text>
          <Text numberOfLines={1} style={styles.subtitleStyle}>{data.dateposted}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.titleStyle   }>{'Exam Name: '}</Text>
          <Text numberOfLines={1} style={styles.subtitleStyle}>{data.examname}</Text>
        </View>
      </View>
    );
  }

  render(){
    const { showStartEnd, showItemCount, showLastRow   , style } = this.props;
 
    return(
      <View style={[{alignSelf: 'stretch'}, style]}>
        {showStartEnd   && this._renderStartEnd  ()}
        {showItemCount  && this._renderItemCount ()}
        {showLastRow    && this._renderDatePosted()}
      </View>
    );
  }
}

export class PreboardExamList extends React.PureComponent {
  static styles = StyleSheet.create({
    flatlist: {
      flex: 1,
      padding: 0,
    }
  });

  constructor(props){
    super(props);
    this.state = {
      loading : true,
      modules : [new PreboardExamModuleItem(null).examModule],
      exam    : new PreboardExamItem(),
    };
    //used for getting the preboard data
    this.preboardExam = new PreboardExamManager();
  }

  async componentWillMount(){
    this.setState({loading: true});
    //get module data
    let exam = await this.preboardExam.getActiveExamModel();
    let modules = exam.getExamModules();
    this.setState({
      modules,
      exam   : exam.get(), 
      loading: false
    });
  }

  _keyExtactor = (item) => {
    const model = new PreboardExamModuleItem(item);
    return model.getCompositeIndexid();
  }

  //title comp for collapsable  
  _renderDescriptionTitle = () => {
    return(
      <IconText
        //icon
        iconName={'ios-information-circle'}
        iconType={'ionicon'}
        iconColor={'#7986CB'}
        iconSize={26}
        //title
        text={'Description'}
        textStyle={{fontSize: 24, fontWeight: '500', color: '#1A237E'}}
      />
    );
  }

  _renderFlatlistHeader = () => {
    const { exam } = this.state;
    //helper object for easier access
    const model = new PreboardExamItem(exam);
    const data  = model.get();
    return(
      <Animatable.View 
        style={{margin: 10, marginBottom: 10}}
        animation={'fadeInUp'}
        delay={250}
        duration={600}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        <Text style={{fontSize: 30, fontWeight: '900', color: '#303F9F', textDecorationLine: 'underline', textDecorationColor: '#9FA8DA'}}>{data.examname}</Text>
        <ExamDetails
          style={{marginBottom: 10}}
          examData={data}
          showStartEnd={false}
          showLastRow   ={false}
        />
        <View style={{overflow: 'hidden'}}>
          <AnimatedCollapsable
            extraAnimation={false}
            text={'Nulla vitae elit libero, a pharetra augue. Nulla vitae elit libero, a pharetra augue. Nulla vitae elit libero, a pharetra augue. Nulla vitae elit libero, a pharetra augue.vv vNulla vitae elit libero, a pharetra augue. Nulla vitae elit libero, a pharetra augue. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. '}
            maxChar={200}
            collapsedNumberOfLines={4}
            titleComponent={this._renderDescriptionTitle()}
            style={{fontSize: 18, textAlign: 'justify', fontWeight: '200'}}
          />
        </View>
        
      </Animatable.View>
    );
  }

  _renderFlatlistFooter = () => {
    return(
      <Animatable.View
        style={{marginTop: 5, marginBottom: 75}}
        animation={'fadeInUp'}
        delay={3000}
        duration={750}
        easing={'ease-in-out'}
        useNativeDriver={true}
      >
        <Animatable.View
          animation={'pulse'}
          delay={3750}
          iterationCount={"infinite"}
          duration={1500}
          easing={'ease-in-out'}
          useNativeDriver={true}
        >
          <Icon
            name ={'medical-bag'}
            type ={'material-community'}
            color={'#6200EA'}
            size ={37}
          /> 
        </Animatable.View>
      </Animatable.View>
    );
  }

  _renderItem = ({item, index}) => {
    //fadeinup clips on android, use diff animation
    const animation = Platform.select({
      ios: 'fadeInUp',
      android: 'fadeInLeft'
    });

    return(
      <AnimatedListItem
        delay={500}
        duration={500}
        {...{index, animation}}
      >
        <ExamModuleItem module={item}/>
      </AnimatedListItem>
    );
  }

  render(){
    const { styles } = PreboardExamList;
    const { style, ...flatListProps} = this.props;
    const { modules, loading} = this.state;
    if(loading) return null;
    return(
      <FlatList
        style={[styles.flatlist, style]}
        data={_.compact(modules)}
        keyExtractor={this._keyExtactor}
        renderItem ={this._renderItem }
        ListHeaderComponent={this._renderFlatlistHeader}
        ListFooterComponent={this._renderFlatlistFooter}
        scrollEventThrottle={200}
        directionalLockEnabled={true}
        removeClippedSubviews={false}
        {...flatListProps}
      />
    );
  }
}

export class PreboardExamTest extends React.PureComponent {
  static propTypes = {

  }

  constructor(props){
    super(props);
    this.DEBUG = false;
    this.state = {
      //true when read/writng to storage
      loading: true,
      //list of all the questions
      questions: [],
      //list of questions to show in the UI
      questionList: [],
      //determines which question to show
      currentIndex: 0,
    };

    this.preboard = new PreboardExamManager();
  }

  async componentWillMount(){
    //get Preboard data
    let preboardModel = await this.preboard.getAsModel();
    //extract exams array
    let exams = preboardModel.getExams ();
    //extract modules from first exam item
    let modules = exams[0].getExamModules();
    //extract module details from first module
    let moduleData = modules[0].get();
    //extract questions from module data

    this.setState({
      preboardDetails: preboardModel.get()
    });
  }

  //adds a new question at the end
  async nextQuestion(){
    const { questions, questionList, currentIndex } = this.state;
    //add question to list
    let list = questionList.slice();
    list.push(questions[currentIndex+1]);

    //update question list
    await setStateAsync(this, {
      questionList: list,
      currentIndex: currentIndex+1,
    });

    //show new question
    this._questionListCarousel.snapToNext();
  }

  _onPressNextQuestion = () => {
    this.nextQuestion();
  }

  //callback: when answer is selected
  _onAnswerSelected = (question, questionIndex, answer, isCorrect) => {

  }
  
  _renderItem = ({item, index}) => {
    const isLast = index == this.state.questions.length - 1;
    return (
      null
    );
  }

  render(){
    const {onEndReached, ...flatListProps } = this.props;
    //ui values for carousel
    const headerHeight = Header.HEIGHT + 15;
    const screenHeight = Dimensions.get('window').height;
    const carouselHeight = {
      sliderHeight: screenHeight, 
      itemHeight  : screenHeight - headerHeight,
    };


    if(this.state.loading) return null;

    return(
      <Carousel
        ref={(c) => { this._questionListCarousel = c; }}
        data={this.state.questionList}
        renderItem={this._renderItem}
        firstItem={this.state.currentIndex}
        activeSlideAlignment={'end'}
        vertical={true}
        lockScrollWhileSnapping={false}
        //scrollview props
        showsHorizontalScrollIndicator={true}
        bounces={true}
        //other props
        {...carouselHeight}
        {...flatListProps}
      />
    );
  }
}