import React from 'react';
import { Text, View, Platform, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import PropTypes from 'prop-types';

import { ModuleItemModel } from '../models/ModuleModels';
import { plural } from '../functions/Utils';
import { HEADER_HEIGHT } from '../Constants';

import { SubjectList } from '../components/Modules';
import { ViewWithBlurredHeader, IconText } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import { AnimatedCollapsable } from '../components/Buttons';
import { CustomHeader } from '../components/Header' ;

import {  NavigationEvents  } from 'react-navigation';
import { Divider } from 'react-native-elements' ;
import * as Animatable from 'react-native-animatable';
import _ from 'lodash';

const SubjectListHeader = (props) => <CustomHeader {...props}/>

class SubjectHeader extends React.PureComponent {
  static propTypes = {
    moduleData: PropTypes.object,
  };

  static styles = StyleSheet.create({
    card: {
      paddingTop: 15,
      marginBottom: 15,
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
    divider: {
      marginHorizontal: 12,
      marginVertical: 10,
    },
    headerContainer: Platform.select({
      ios: {
        overflow: 'hidden', 
        marginBottom: 10,
        paddingHorizontal: 5,
      },
      android: {
        backgroundColor: 'white',
        elevation: 7,
        padding: 10,
        marginHorizontal: 7,
        marginTop: 7,
        marginBottom: 10,
        borderRadius: 10,
      }
    }),
    title: {
      color: '#160656',
      flex: 1,
      ...Platform.select({
        ios: {
          fontSize: 24, 
          fontWeight: '800'
        },
        android: {
          fontSize: 26, 
          fontWeight: '900',
        }
      })
    },
    description: {
      fontSize: 18, 
      fontWeight: '300',
      textAlign: 'justify'
    },
    detailContainer: {
      flexDirection: 'row', 
    },
    detailTitle: Platform.select({
      ios: {
        fontSize: 18,
        fontWeight: '700',
        color: 'rgba(0, 0, 0, 0.75)'
      },
      android: {
        fontSize: 18,
        fontWeight: '900'
      }
    }),
    detailSubtitle: Platform.select({
      ios: {
        fontSize: 20,
        fontWeight: '200'
      },
      android: {
        fontSize: 18,
        fontWeight: '100',
        marginTop: -3,
        color: '#424242'
      },
    }),
  });

  _renderHeaderTitle(){
    const { styles } = SubjectHeader;
    const { moduleData } = this.props;

    const model = new ModuleItemModel(moduleData);
    const { modulename } = model.module;
    
    return(
      <TouchableOpacity onPress={this._handleTitleOnPress}>
        <IconText
          //icon
          iconName={'info'}
          iconType={'feather'}
          iconColor={'#512DA8'}
          iconSize={24}
          //title
          text={modulename}
          textStyle={styles.title}
        />
      </TouchableOpacity>
    );
  };

  _renderDetails(){
    const { styles } = SubjectHeader;

    const { moduleData } = this.props;
    const model = new ModuleItemModel(moduleData);
    
    //extract details
    const { lastupdated } = model.module;
    const countSubject  = model.getLenghtSubjects();
    const countQuestion = model.getTotalQuestions();
    
    return(
      <View style={styles.detailContainer}>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.detailTitle   }>{plural('Subject', countSubject)}</Text>
          <Text numberOfLines={1} style={styles.detailSubtitle}>{`${countSubject} ${plural('item', countSubject)}`}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.detailTitle   }>{plural('Question', countQuestion)}</Text>
          <Text numberOfLines={1} style={styles.detailSubtitle}>{`${countQuestion} ${plural('item', countSubject)}`}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.detailTitle   }>{'Updated: '}</Text>
          <Text numberOfLines={1} style={styles.detailSubtitle}>{lastupdated}</Text>
        </View>
      </View>
    );
  };

  render(){
    const { styles } = SubjectHeader;
    const { moduleData: {description} } = this.props;

    //platform specific animations
    const animation = Platform.select({
      ios    : 'fadeInUp', 
      android: 'fadeInLeft'
    });

    return(
      <Animatable.View 
        style={styles.card}
        duration={300}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        <AnimatedCollapsable
          titleComponent={this._renderHeaderTitle()}
          text={description}
          style={styles.description}
          collapsedNumberOfLines={6}
          maxChar={400}
          extraAnimation={false}
        />
        <Divider style={styles.divider}/>
        {this._renderDetails()}
      </Animatable.View>
    );
  };
};

export default class SubjectListScreen extends React.Component {
  static navigationOptions = {
    title: 'View Module',
    headerTitle: SubjectListHeader,
    //custom android header
    ...Platform.select({
      android: { header: props => <AndroidHeader {...props}/> }
    }),
  };

  static styles = StyleSheet.create({
    subjectList: {
      paddingBottom: 50,
    },
  });

  static NAV_PARAMS = {
    moduleData: 'moduleData',
    modules   : 'modules'   ,
  };

  componentDidFocus = () => {
    const { setDrawerSwipe } = this.props.screenProps;
    setDrawerSwipe(false);
  };

  _handleTitleOnPress = () => {
    const { navigation } = this.props;
    //extract details
    const moduleData = navigation.getParam('moduleData', null);
    const model = new ModuleItemModel(moduleData);
    const { modulename } = model.module;
    //show full title
    Alert.alert('Module Title', modulename);
  };

  _onPressSubject = (subjectData, moduleData) => {
    const { getRefSubjectModal } = this.props.screenProps;
    getRefSubjectModal().openSubjectModal(moduleData, subjectData);    
  };

  _renderHeader = () => {
    const { navigation } = this.props;
    //get data from prev. screen
    const moduleData = navigation.getParam('moduleData', null);

    return(
      <SubjectHeader {...{moduleData}}/>
    );
  };

  render(){
    const { styles } = SubjectListScreen;
    const { navigation } = this.props;

    //get data from previous screen: module list
    const modules    = navigation.getParam('modules'   , null);
    const moduleData = navigation.getParam('moduleData', null);

    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <SubjectList
          contentInset={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
          contentContainerStyle={styles.subjectList}
          ListHeaderComponent={this._renderHeader}
          onPressSubject={this._onPressSubject}
          //pass down props
          {...{moduleData, modules}}
        />
      </ViewWithBlurredHeader>
    );
  };
};