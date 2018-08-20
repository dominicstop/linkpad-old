import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { IconText     } from '../components/Views';
import { subjectProps } from '../components/Cards';

import { Divider } from 'react-native-elements';

export class GradeCard extends React.PureComponent {
  render(){
    return(
      <View style={{backgroundColor: 'white', height: 125, borderRadius: 12, padding: 10, marginBottom: 10, shadowOpacity: 0.4, shadowRadius: 3, shadowColor: 'black', shadowOffset: { height: 5, width: 2 },}}>
        {this.props.children}
      </View>
    );
  }
}

export class GradeItem extends React.PureComponent {
  static propTypes = {
    id        : PropTypes.string,
    active    : PropTypes.bool  ,
    correct   : PropTypes.number,
    mistakes  : PropTypes.number,
    unanswered: PropTypes.number,
    dateTaken : PropTypes.string,
  }

  render(){
    const { id, active, correct, mistakes, unanswered, dateTaken } = this.props;

    const titleText = active? 'Current Grade' : dateTaken; 

    return(
      <GradeCard>
        <IconText
          iconName={'update'}
          iconType={'material-community'}
          iconSize={22}
          iconColor={'rgba(0, 0, 0, 0.5)'}
          containerStyle={{justifyContent: 'center'}}
          text={titleText}
          textStyle={{flex: 0, fontSize: 16, fontWeight: 'bold'}}
        />
        <Divider style={{height: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)', marginVertical: 5, marginHorizontal: 10}}/>
      </GradeCard>
    );
  }
}

export class SummaryItem extends React.PureComponent {
  static propTypes = {
    subjectData: PropTypes.shape(subjectProps).isRequired,
  }
  
  render(){
    return(
      <GradeCard>
        <IconText
          iconName={'ios-calculator'}
          iconType={'ionicon'}
          iconSize={22}
          iconColor={'rgba(0, 0, 0, 0.5)'}
          containerStyle={{justifyContent: 'center'}}
          text={'Grade Summary'}
          textStyle={{flex: 0, fontSize: 16, fontWeight: 'bold'}}
        />
        <Divider style={{height: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)', marginVertical: 5, marginHorizontal: 10}}/>
      </GradeCard>
    );
  }
}