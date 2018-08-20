import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

import { IconText } from './Views';
import { GradeItem, SummaryItem } from './Grades';

import * as Animatable      from 'react-native-animatable'   ;
import      Modal           from 'react-native-modalbox'     ;
import      Carousel        from 'react-native-snap-carousel';
import    { IconButton    } from '../components/Buttons'     ;
import    { Icon, Divider } from 'react-native-elements'     ;
import    { BlurView      } from 'expo';

const GRADE_DATA = [
  {
    id: '001',
    active    : true,
    correct   : 50,
    mistakes  : 25,
    unanswered: 25,
    dateTaken : 'Oct. 5 2018'
  },
  {
    id: '002',
    active    : false,
    correct   : 50,
    mistakes  : 25,
    unanswered: 25,
    dateTaken : 'Oct. 5 2018'
  },
  {
    id: '003',
    active    : false,
    correct   : 50,
    mistakes  : 25,
    unanswered: 25,
    dateTaken : 'Oct. 5 2018',
  },
];

export class SubjectModal extends React.PureComponent {
  constructor(props){
    super(props);
    this.state = {
      modalVisible: false,
      subjectData : null ,
    }
  }

  toggleSubjectModal = async (subjectData) => {
    //receive subject data from onpress subject
    await this.setState({subjectData: subjectData});
    this.subjectModal.open();
  }

  _onModalOpened = () => {
    this.setState({modalVisible: true});
  }

  _onModalClosed = () => {
    this.setState({modalVisible: false});
  }

  //grades carousel
  _renderGrades(){
    //ui values
    const sliderWidth = Dimensions.get('window').width;
    const itemWidth   = sliderWidth - 80;

    return(
      <Animatable.View
        style={{flex: 1}}
        animation={'fadeInUp'}
        easing={'ease-in-out'}
        duration={450}
        useNativeDriver={true}
      >
        <Carousel
          ref={(c) => { this._carousel = c; }}
          data={GRADE_DATA}
          renderItem={this._renderGradeItem}
          sliderWidth={sliderWidth}
          itemWidth={itemWidth}
          itemHeight={100}
          activeSlideAlignment={'center'}
          inactiveSlideScale={0.9}
          inactiveSlideOpacity={0.7}
          firstItem={1}
        />
      </Animatable.View>
    );
  }

  //render for carousel item
  _renderGradeItem = ({item, index}) => {
    const { subjectData } = this.state;
    return (
      //first item is summary, the rest is grades
      index == 0? <SummaryItem subjectData={subjectData}/> : <GradeItem {...item}/>
    );
  }

  _renderBody(){
    return(
      <View style={{flex: 1}}>

      </View>
    );
  }

  //bottom buttons: start practice/cancel
  _renderButtons(){
    const Button = (props) => {
      const { style, ...IconButtonProps } = props;
      return(
        <IconButton
          containerStyle={[styles.modalButton, styles.shadow, style]}
          textStyle={styles.modalButtonText}
          {...IconButtonProps}
        />
      );
    }

    //shared props betw iconButtons
    const buttonProps = {
      iconSize: 22,
      iconColor: 'white',
    }

    return(
      <Animatable.View 
        animation={'fadeInUp'}
        duration={500}
        delay={200}
        easing={'ease-in-out'}
        useNativeDriver={true}
        collapsable={true}
      >
        <Button
          text={'Start Practice Exam'}
          style={{backgroundColor: '#6200EA'}}
          iconName={'pencil-square-o'}
          iconType={'font-awesome'}
          {...buttonProps}
        />
        <Button
          text={'Cancel'}
          style={{backgroundColor: '#C62828'}}      
          iconName={'close'}
          iconType={'simple-line-icon'}
          onPress={() => this.subjectModal.close()}
          {...buttonProps}
        />
      </Animatable.View>
    );
  }

  render(){
    const { modalVisible } = this.state;
    return(
      <Modal 
        style={styles.subjectModal}  
        position={"bottom"} 
        ref={r => this.subjectModal = r} 
        swipeArea={15}
        swipeThreshold={1}
        backdropOpacity={0.3}
        animationDuration={500}
        swipeToClose={true}
        onOpened={this._onModalOpened}
        onClosed={this._onModalClosed}
      >
        <BlurView
          style={{flex: 1}}
          intensity={100}
          tint='default'
        >
          <View style={{flex: 1}}>
            <IconText
              containerStyle={styles.subjectIconText}
              textStyle={styles.subjectTitle}
              subtitleStyle={styles.subjectSubtitle}
              text     ={'Subject Name'}
              subtitle ={'Choose an option'}
              iconName ={'notebook'}
              iconType ={'simple-line-icon'}
              iconColor={'rgba(0, 0, 0, 0.6)'}
              iconSize ={26}
            />
            {modalVisible && this._renderGrades ()}
            {modalVisible && this._renderBody   ()}
            {modalVisible && this._renderButtons()}
          </View>
        </BlurView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  subjectModal: {
    height: 575, 
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    overflow: 'hidden'
  },
  subjectIconText: {
    margin: 17
  },
  subjectTitle: {
    fontSize: 20, 
    fontWeight: 'bold'
  },
  subjectSubtitle: {
    fontWeight: '200',
  },
  modalButton: {
    height: 50,
    margin: 17,
    marginTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  modalButtonText: {
    flex: 0,
    color: 'white', 
    fontSize: 16, 
  },
  shadow: {
    shadowOffset:{  width: 3,  height: 5,  },
    shadowColor: 'black',
    shadowRadius: 6,
    shadowOpacity: 0.5,
  }
});