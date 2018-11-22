import React from 'react';
import { StyleSheet, Text, View, Platform, TouchableOpacity, Alert } from 'react-native';

import   Constants, { STYLES   } from '../Constants';
import { ViewWithBlurredHeader } from '../components/Views';
import { PracticeExamList      } from '../components/Exam';
import { AndroidHeader, AndroidBackButton} from '../components/AndroidHeader';


import { IncompletePracticeExamModel } from '../functions/IncompletePracticeExamStore';


import { Icon } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import { createStackNavigator } from 'react-navigation';
import { ModuleItemModel, SubjectItem } from '../functions/ModuleStore';

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
  ios    : <CloseButton       onPress={() => _onPressBack()}/>,
  android: <AndroidBackButton onPress={() => _onPressBack()}/>,
});

export class PracticeExamListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;

    let title = '';
    if(state.params) title = state.params.title;

    return ({
      title: title,
      headerTitleStyle: STYLES.glow,
      headerLeft,

      //custom android header
      ...Platform.select({
        android: { header: props => 
          <AndroidHeader {...{titleStyle, ...props}}/>
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
    _onPressBack = this._handleOnPressBack;
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
    this.updateTitleIndex(answers.length);
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