import React from 'react';
import { Text, View, Platform, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { SubjectList, ModuleTitle, ModuleDescription , ModuleItem} from '../components/Modules';
import { ViewWithBlurredHeader, IconText } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import { AnimatedCollapsable } from '../components/Buttons';
import { CustomHeader } from '../components/Header' ;

import { Header, NavigationEvents  } from 'react-navigation';
import { Divider, colors } from 'react-native-elements' ;
import * as Animatable from 'react-native-animatable';
import _ from 'lodash';
import {ModuleItemModel} from '../functions/ModuleStore';
import {plural} from '../functions/Utils';

const SubjectListHeader = (props) => <CustomHeader {...props}/>

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
    subjectList: Platform.select({
      ios: {
        paddingTop: 10,
        paddingHorizontal: 10,
      },
      android: {
        paddingTop: 10,
        paddingHorizontal: 5,
      }
    }),
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
      fontSize: 20, 
      fontWeight: '300',
      textAlign: 'justify'
    },
    detailContainer: {
      flexDirection: 'row', 
      marginTop: 5
    },
    detailTitle: Platform.select({
      ios: {
        fontSize: 18,
        fontWeight: '500',
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

  componentDidFocus = () => {
    const { setDrawerSwipe } = this.props.screenProps;
    setDrawerSwipe(false);
  }

  _handleTitleOnPress = () => {
    const { navigation } = this.props;
    //extract details
    const moduleData = navigation.getParam('moduleData', null);
    const model = new ModuleItemModel(moduleData);
    const { modulename } = model.module;
    //show full title
    Alert.alert('Module Title', modulename);
  }

  _onPressSubject = (subjectData, moduleData) => {
    const { getRefSubjectModal } = this.props.screenProps;
    getRefSubjectModal().openSubjectModal(moduleData, subjectData);    
  }

  _renderHeaderTitle(){
    const { styles } = SubjectListScreen;
    const { navigation } = this.props;
    //extract details
    const moduleData = navigation.getParam('moduleData', null);
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
  }

  _renderHeader = () => {
    const { styles } = SubjectListScreen;
    const { navigation } = this.props;
    //platform specific animations
    const animation = Platform.select({
      ios    : 'fadeInUp', 
      android: 'zoomIn'
    });
    //get data from prev. screen
    const moduleData = navigation.getParam('moduleData', null);
    //wrap data in model
    const model = new ModuleItemModel(moduleData);
    //extract details
    const { description, lastupdated } = model.module;
    const countSubject  = model.getLenghtSubjects();
    const countQuestion = model.getTotalQuestions();

    return(
      <Animatable.View 
        style={styles.headerContainer}
        duration={500}
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
      </Animatable.View>
    );
  }

  render(){
    const { styles } = SubjectListScreen;
    const { navigation } = this.props;
    const offset = Header.HEIGHT;
    //get data from previous screen: module list
    const modules    = navigation.getParam('modules'   , null);
    const moduleData = navigation.getParam('moduleData', null);

    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <SubjectList
          contentInset={{top: offset}}
          contentOffset={{x: 0, y: -offset}}
          contentContainerStyle={styles.subjectList}
          ListHeaderComponent={this._renderHeader}
          onPressSubject={this._onPressSubject}
          //pass down props
          {...{moduleData, modules}}
        />
      </ViewWithBlurredHeader>
    );
  }
}