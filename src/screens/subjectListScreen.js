import React from 'react';
import { StyleSheet, Text, View, TabBarIOS, Platform } from 'react-native';

import { SubjectList, ModuleHeader } from '../components/cards'  ;
import { ViewWithBlurredHeader     } from '../components/views'  ;
import { ExpandCollapse            } from '../components/buttons';

import { Header  } from 'react-navigation';
import { Divider, colors } from 'react-native-elements' ;

const getModuleTitle = (moduleData) => moduleData != null ? moduleData.moduleName : 'Module Name';


export default class SubjectListScreen extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: getModuleTitle(navigation.getParam('moduleData', null)),
  });

  _renderHeader = () => {
    const { navigation} = this.props;
    const moduleData = navigation.getParam('moduleData', null);
    return(
      <View style={{marginHorizontal: 20, paddingBottom: 10}}>
        <ExpandCollapse 
          collapseHeight={100}
          colors={['rgba(255, 255, 255, 0)', 'rgb(233, 232, 239)']}
        >
          <ModuleHeader 
            moduleData={moduleData}
            detailedView={true}
          />
        </ExpandCollapse>
      </View>
    );
  }

  render(){
    const { navigation } = this.props;
    const moduleData = navigation.getParam('moduleData', null);

    return(
      <ViewWithBlurredHeader>
        <SubjectList
          containerStyle={{paddingTop: Header.HEIGHT + 10}}
          ListHeaderComponent={this._renderHeader}
          subjectListData={moduleData.subjects}
        />
      </ViewWithBlurredHeader>
    );
  }
}