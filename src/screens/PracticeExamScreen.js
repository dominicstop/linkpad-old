import React from 'react';
import { StyleSheet, Text, View, Platform, TouchableOpacity, Alert } from 'react-native';

import   Constants, { STYLES } from '../Constants';
import { ViewWithBlurredHeader } from '../components/Views';
import { PracticeExamList } from '../components/Exam';
import { AndroidHeader, AndroidBackButton } from '../components/AndroidHeader';
import { PracticeExamOptionsModal } from '../components/SwipableModal';

import { IncompletePracticeExamModel } from '../functions/IncompletePracticeExamStore';
import { ModuleItemModel, SubjectItem } from '../models/ModuleModels';

import { Icon } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import { createStackNavigator } from 'react-navigation';
import { IconButton } from 'react-native-paper';


export class PracticeExamHeader extends React.PureComponent {
  constructor(props){
    super(props);
    this.state = {
      currentIndex: 0,
    }
  }

  updateIndex = (index) => {
    this.setState({currentIndex: index});
  }

  render(){
    return(
      <Text>Hello {this.state.currentIndex}</Text>
    );
  }
}

//android header text style
const titleStyle = { 
  flex: 1, 
  textAlign: 'center', 
  marginRight: 10,
  position: 'absolute',
  color: 'white',
};

//ios back button
const CloseButton = (props) => {
  return (
    <TouchableOpacity
      style={{marginHorizontal: 10, flexDirection: 'row', alignItems: 'center'}}
      {...props}
    >
      <Icon
        name={'ios-close-circle'}
        type={'ionicon'}
        color={'white'}
        size={26}
      />
      <Text style={{marginLeft: 7, fontSize: 18, color: 'white'}}>Cancel</Text>
    </TouchableOpacity>
  );
};

let _onPressBack;
const headerLeft = Platform.select({
  //very ugly/hacky solution
  ios    : <CloseButton       onPress={() => _onPressBack && _onPressBack()}/>,
  android: <AndroidBackButton onPress={() => _onPressBack && _onPressBack()}/>,
});

let _onPressOptions;
const headerRight = (
  <IconButton
    icon="format-list-bulleted"
    color={'white'}
    size={20}
    onPress={() => _onPressOptions && _onPressOptions()}
  />
);

export class PracticeExamListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;

    let title = '';
    if(state.params) title = state.params.title;

    return ({
      headerTitle: title,
      headerTitleStyle: STYLES.glow,
      headerLeft,
      headerRight,

      //custom android header
      ...Platform.select({
        android: { header: props => 
          <AndroidHeader 
            rightComponent={headerRight}
            {...{titleStyle, ...props}}
          />
      }}),
    });
  };

  constructor(props){
    super(props);
    
    this.initializeModels();
    const { moduleModel, subjectModel } = this;

    this.state = {
      //get data from models
      moduleData : moduleModel .get(),
      subjectData: subjectModel.get(),
    };

    //assign to global var
    _onPressBack    = this._handleOnPressBack   ;
    _onPressOptions = this._handleOnPressOptions;
  };

  componentWillMount(){
    this.updateTitleIndex(1);
  };

  initializeModels(){
    const { navigation } = this.props;

    //get data from prev. screen
    const moduleData  = navigation.getParam('moduleData' , null);
    const subjectData = navigation.getParam('subjectData', null);

    //wrap data inside models
    let moduleModel  = new ModuleItemModel(moduleData );
    let subjectModel = new SubjectItem    (subjectData);
    //extract indexid from subjectdata
    const { indexid } = subjectModel.get();

    //set models as properties 
    this.moduleModel  = moduleModel;
    this.subjectModel = moduleModel.getSubjectByID(indexid);
  };

  //returns the last item's index in iPE's store
  async getLastAnsweredIndex(){
    
  };

  /** Set the screen's title */
  updateTitle = (title = '') => {
    const {setParams} = this.props.navigation;
    setParams({ title: title })
  };

  /** Set the title with the current index */
  updateTitleIndex = (index = 0) => {
    const { subjectModel } = this;

    const total = subjectModel.getQuestionLength();
    this.updateTitle(`Question ${index}/${total}`);
  };

  _handleOnExit = () => {
    const { navigation } = this.props;
    navigation && navigation.navigate('HomeRoute');
  };

  _handleOnPressBack = () => {
    Alert.alert(
      'Do you want to go back?',
      "Don't worry your progress will be saved.",
      [
        {text: 'Cancel', style  : 'cancel'          },
        {text: 'OK'    , onPress: this._handleOnExit},
      ],
      { cancelable: false }
    );
  };

  _handleOnPressOptions = () => {
    const { navigation } = this.props;

    //get ref to modal
    const { getPracticeExamOptionsModal } = this.props.screenProps;
    let modal = getPracticeExamOptionsModal();

    modal.openModal();
  };

  _handleOnSnapToItem = (index = 0) => {
    this.updateTitleIndex(index + 1)
  };

  _handleOnNextItem = (index = 0) => {
    this.updateTitleIndex(index + 2);
  };

  _handleOnEndReached = () => {
    console.log('onEndReached');
  };

  _handleOnListInit = (practiceExamModel = new IncompletePracticeExamModel()) => {
    const { answers } = practiceExamModel.get();
    
    const count = answers.length == 0? 1 : answers.length;
    this.updateTitleIndex(count);
  };
  
  render() {
    const { moduleData, subjectData } = this.state;
    return (
      <ViewWithBlurredHeader>
        <Animatable.View
          animation={'fadeInUp'}
          duration={500}
          easing={'ease-in-out'}
          delay={750}
        >
          <PracticeExamList
            onSnapToItem={this._handleOnSnapToItem}
            onEndReached={this._handleOnEndReached}
            onListInit  ={this._handleOnListInit  }
            onNextItem  ={this._handleOnNextItem  }
            //pass down props
            {...{moduleData, subjectData}}
          />
        </Animatable.View>
      </ViewWithBlurredHeader>
    );
  };
};

export const PracticeExamStack = createStackNavigator({
  PracticeExamListRoute: {
      screen: PracticeExamListScreen,
    },
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: Constants.HEADER_PROPS,
  }
);

export class PracticeExamStackContainer extends React.Component {
  static router = PracticeExamStack.router;

  static navigationOptions = {
    header: null,
  };

  constructor(props){
    super(props);

  };

  static styles = StyleSheet.create({
    rootContainer: {
      flex: 1,
    }
  });

  _renderOptionsModal = () => {
    return(
      <PracticeExamOptionsModal
        ref={r => this._optionsModal = r}
      />
    );
  };
  
  render(){
    const { styles } = PracticeExamStackContainer;

    return(
      <View style={styles.rootContainer}>
        <PracticeExamStack
          navigation={this.props.navigation}
          screenProps={{
            ...this.props.screenProps,
            getPracticeExamOptionsModal: () => this._optionsModal,
          }}
        />
        {/**this._renderOptionsModal()*/}
      </View>
    );
  };
};