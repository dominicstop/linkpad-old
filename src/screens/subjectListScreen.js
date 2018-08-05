import React from 'react';
import { Text, View } from 'react-native';

import { SubjectList, ModuleHeader } from '../components/Cards'  ;
import { ViewWithBlurredHeader     } from '../components/Views'  ;
import { ExpandCollapse            } from '../components/Buttons';

import { Header  } from 'react-navigation';
import { Divider, colors } from 'react-native-elements' ;
import * as Animatable from 'react-native-animatable';

const getModuleTitle = (moduleData) => moduleData != null ? moduleData.moduleName : 'View Module';

export default class SubjectListScreen extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: getModuleTitle(navigation.getParam('moduleData', null)),
  });

  _renderHeader = () => {
    const { navigation} = this.props;
    const moduleData = navigation.getParam('moduleData', null);
    const subjectCount = moduleData.subjects.length;
    return(
      <View style={{marginHorizontal: 20, paddingBottom: 10}}>
        <ExpandCollapse 
          collapseHeight={100}
          colors={['rgba(255, 255, 255, 0)', 'white']}
        >
          <ModuleHeader 
            moduleData={moduleData}
            detailedView={true}
          />
        </ExpandCollapse>
        <Animatable.View
          animation='fadeInRight'
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
    const { navigation } = this.props;
    const moduleData = navigation.getParam('moduleData', null);

    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <SubjectList
          containerStyle={{paddingTop: Header.HEIGHT + 10, backgroundColor: 'white'}}
          ListHeaderComponent={this._renderHeader}
          subjectListData={moduleData.subjects}
        />
      </ViewWithBlurredHeader>
    );
  }
}