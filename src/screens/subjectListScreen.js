import React from 'react';
import { Text, View, Platform, StyleSheet } from 'react-native';

import { SubjectList, ModuleTitle, ModuleDescription } from '../components/Modules';
import { ViewWithBlurredHeader, IconText } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import { ExpandableWithHeader } from '../components/Buttons';
import { CustomHeader } from '../components/Header' ;

import { Header, NavigationEvents  } from 'react-navigation';
import { Divider, colors } from 'react-native-elements' ;
import * as Animatable from 'react-native-animatable';
import _ from 'lodash';

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
        paddingTop: 15,
        paddingHorizontal: 5
      }
    })
  });

  componentDidFocus = () => {
    const { setDrawerSwipe } = this.props.screenProps;
    setDrawerSwipe(false);
  }

  _onPressSubject = (subjectData, moduleData) => {
    const { getRefSubjectModal } = this.props.screenProps;
    getRefSubjectModal().toggleSubjectModal(moduleData, subjectData);
  }

  _renderHeader = () => {
    const { navigation} = this.props;

    const moduleData   = navigation.getParam('moduleData', null);
    const subjectCount = _.compact(moduleData.subjects).length;

    return null;

    const Header = (
      <IconText
        textStyle={{fontSize: 30, fontWeight: '900', marginLeft: 10}}
        iconName={'image'}
        iconType={'font-awesome'}
        iconSize={25}
        iconColor={'gray'}
        text={'Image'}
      >
        <Text style={{fontWeight: '200', fontSize: 16, color: 'grey'}}>
          touch to expand or collapse
        </Text>
      </IconText>
    );

    return(
      <View style={{marginHorizontal: 20, paddingBottom: 10}}>
        <ExpandableWithHeader
          collapseHeight={80}
          header={<ModuleTitle moduleData={moduleData}/>}
          colors={['rgba(255, 255, 255, 0)', 'rgb(233, 232, 239)']}
        >
          <ModuleDescription 
            moduleData={moduleData}
            detailedView={true}
          />
        </ExpandableWithHeader>

        <Animatable.View
          animation='fadeInUp'
          easing='ease-in-out'
          duration={500}
          delay={100}
          useNativeDriver={true}
        >
          <Text style={{fontSize: 26, fontWeight: '900', marginTop: 15}}>
            {subjectCount + ' '}
            <Text style={{fontSize: 26, fontWeight: '300', marginTop: 20, textAlignVertical: 'center'}}>
              {subjectCount > 1? 'Subjects' : 'Subject'}
            </Text>
          </Text>
        </Animatable.View>
      </View>
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