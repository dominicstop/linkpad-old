import React, { Fragment } from 'react';
import { View, ScrollView, ViewPropTypes, Text, TouchableOpacity, Platform, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import   NavigationService       from '../NavigationService';
import { HEADER_PROPS          } from '../Constants';
import { ViewWithBlurredHeader, IconText, Card } from '../components/Views' ;
import { CustomHeader          } from '../components/Header';
import { DrawerButton          } from '../components/Buttons';

import PreboardExamStore from '../functions/PreboardExamStore';
import LottieCircle from '../components/LottieCircle';
import { PreboardExam, PreboardExamManager, PreboardExamItem, PreboardExamModuleItem } from '../functions/PreboardExamStore';
import { setStateAsync } from '../functions/Utils';

import * as Animatable from 'react-native-animatable';
import { Header, createStackNavigator } from 'react-navigation';
import { Icon, Divider } from 'react-native-elements';



export class IntroductionCard extends React.PureComponent {
  constructor(props){
    super(props);
    this.animationSource = require('../animations/text.json');
  }

  render(){
    return (
      <Card>
        <View style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 15}}>
          <LottieCircle 
            source={this.animationSource}
            containerStyle={{backgroundColor: '#7C4DFF'}}
            ref={r => this.lottie = r}
            circleSize={90}
            iconSize={550}
          />
          <Text style={{fontSize: 32, fontWeight: '700', marginTop: 10, color: '#311B92'}}>{'Preboard Exam'}</Text>
          <Text style={{flex: 1, fontSize: 20, marginTop: 5, textAlign: 'justify'}}>
            {"Our Preboard exam will help you test all the things you've learned so far! We create a new one every year to test how you'll do."}
          </Text>
        </View>
      </Card>
    );
  }
}

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
          style={{width: 75, height: 75, marginTop: 10}}
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

export class ActiveCard extends React.PureComponent {
  static propTypes = {
    preboardData: PropTypes.object.isRequired,
  }

  constructor(props){
    super(props);
    this.image = require('../../assets/icons/tablet.png');
  }

  _renderHeading(){
    return(
      <Fragment>
        <Animatable.Image
          source={this.image}
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

  _renderDetails(){
    const { preboardData } = this.props;
    const model = new PreboardExam(preboardData);

    const titleStyle = {
      fontSize: 18,
      fontWeight: '500'
    };
    const subtitleStyle = {
      fontSize: 24,
      fontWeight: '200'
    };

    return(
      <View style={{alignSelf: 'stretch', marginTop: 15}}>
        <IconText
          //icon
          iconName={'file-text'}
          iconType={'feather'}
          iconColor={'rgba(74, 20, 140, 0.5)'}
          iconSize={26}
          //title
          text={'Subject Details'}
          textStyle={{fontSize: 24, fontWeight: '800', color: '#311B92'}}
        />
        <View style={{flex: 1, flexDirection: 'row', marginTop: 3}}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={titleStyle   }>{'Questions: '}</Text>
            <Text numberOfLines={1} style={subtitleStyle}>{'subject.questions.length' + ' items'}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} style={titleStyle   }>{'Updated: '}</Text>
            <Text numberOfLines={1} style={subtitleStyle}>{'subject.lastupdated'}</Text>
          </View>
        </View>
      </View>
    );
  }

  render(){
    return (
      <Card style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 15}}>
        {this._renderHeading()}
        {this._renderDetails()}
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

  constructor(props){
    super(props);
    this.state = {
      preboard: null,
      isActive: false,
    }
    this.preboard = new PreboardExamManager();
    
  }

  async componentWillMount(){
    //get preboard exams
    let preboardModel = await this.preboard.getAsModel();
    const isActive = true;//preboardModel.response.active;
    this.setState({preboard: preboardModel.get(), isActive});
  }

  _renderCards = () => {
    const { isActive, preboard } = this.state;
    
    return(
      <Fragment>
        {!isActive && <InactiveCard/>}
        { isActive && <ActiveCard 
          preboardData={preboard}
        />}
      </Fragment>
    );
  }

  render(){
    const header_height = Header.HEIGHT;
    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <ScrollView style={{paddingTop: header_height}}>
          <IntroductionCard/>
          {this._renderCards()}
          <View style={{height: 100}}/>
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
  }, {
    headerMode: 'float',
    headerTransitionPreset: 'uikit',
    headerTransparent: true,
    navigationOptions: HEADER_PROPS,
  }
);