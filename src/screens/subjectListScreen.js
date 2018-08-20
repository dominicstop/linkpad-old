import React from 'react';
import { Text, View } from 'react-native';

import { SubjectList, ModuleTitle, ModuleDescription } from '../components/Cards'  ;
import { ViewWithBlurredHeader, IconText      } from '../components/Views'  ;
import { ExpandCollapse, ExpandableWithHeader } from '../components/Buttons';

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

    const moduleData   = navigation.getParam('moduleData', null);
    const subjectCount = moduleData.subjects.length;

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
        >
          <ModuleDescription 
            moduleData={moduleData}
            detailedView={true}
          />
        </ExpandableWithHeader>

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