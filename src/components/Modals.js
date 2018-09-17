import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';

import NavigationService from '../NavigationService';
import { IconText } from './Views';
import { AnimatedCollapsable } from './Buttons';
import { GradeItem, SummaryItem } from './Grades';
import { setStateAsync } from '../functions/Utils';

import * as Animatable      from 'react-native-animatable'   ;
import      Modal           from "react-native-modal"        ;
import      Carousel        from 'react-native-snap-carousel';
import    { IconButton    } from '../components/Buttons'     ;
import    { Icon, Divider } from 'react-native-elements'     ;
import    { BlurView      } from 'expo'                      ;

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
      //used to show or hide the modal
      modalVisible: false,
      //show or hide the modal contents
      showModalContent: false,
      moduleData  : null ,
      subjectData : null ,
    }
  }

  //shows or hide the modal
  toggleModal = (toggle = false) => {
    this.setState({
      modalVisible: toggle
    });
  }

  //called when
  toggleSubjectModal = async (moduleData, subjectData) => {
    //receive subject/module data from onpress subject
    await setStateAsync(this, {
      moduleData : moduleData ,
      subjectData: subjectData,
    });
    //show the modal
    this.toggleModal(true);
  }

  _handleOnModalShow = () => {
    //call callback if defined
    if(this.modalOpenedCallback) this.modalOpenedCallback();
    //show the modal content after animation
    this.setState({showModalContent: true});
  }

  _handleOnModalHide = () => {
    //call callback if defined
    if(this.modalClosedCallback) this.modalClosedCallback();
    //hide the modal content after animation
    this.setState({showModalContent: false})
  }

  _handleOnPressStartPE = () => {
    //navigate to practice exam route
    NavigationService.navigateApp('PracticeExamRoute', {
      moduleData : this.state.moduleData ,
      subjectData: this.state.subjectData,
    });
  }

  _handleOnModalHide = () => {
    //hide the modal
    this.toggleModal(false)
  }

  //hide modal when swiped down
  _handleOnSwipe = () => {
    this.setState({ modalVisible: false })
  }

  _handleOnScroll = event => {
    this.setState({
      scrollOffset: event.nativeEvent.contentOffset.y
    });
  };

  _handleScrollTo = p => {
    if (this.scrollViewRef) {
      this.scrollViewRef.scrollTo(p);
    }
  };

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

  _renderTitle(){
    const { subjectData } = this.state;
    return(
      <Animatable.View
        animation={'fadeInUp'}
        duration={500}
        delay={0}
        useNativeDriver={true}
      >
        <IconText
          containerStyle={styles.subjectIconText}
          textStyle={styles.subjectTitle}
          subtitleStyle={styles.subjectSubtitle}
          text     ={subjectData.subjectname}
          subtitle ={'Choose an option'}
          iconName ={'notebook'}
          iconType ={'simple-line-icon'}
          iconColor={'rgba(0, 0, 0, 0.6)'}
          iconSize ={26}
        />
      </Animatable.View>
    );
  }

  _renderDescription(){
    const { moduleData, subjectData } = this.state;

    const descriptionTitle = <IconText
      //icon
      iconName={'info'}
      iconType={'feather'}
      iconColor={'grey'}
      iconSize={26}
      //title
      text={'Description'}
      textStyle={{fontSize: 24, fontWeight: '800'}}
    />

    return(
      <AnimatedCollapsable
        text={subjectData.description}
        maxChar={200}
        titleComponent={descriptionTitle}
        titleContainerStyle={{marginHorizontal: 15}}
        containerStyle={{marginHorizontal: 15}}
        style={{fontSize: 18, textAlign: 'justify'}}
      />
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
          onPress={this._handleOnPressStartPE}
          {...buttonProps}
        />
        <Button
          text={'Cancel'}
          style={{backgroundColor: '#C62828'}}      
          iconName={'close'}
          iconType={'simple-line-icon'}
          onPress={this._handleOnPressCancel}
          {...buttonProps}
        />
      </Animatable.View>
    );
  }

  //renders the content of the modal
  _renderModalContent(){
    const { showModalContent } = this.state;
    if(!showModalContent) return(null);
    return(
      <View collapsable={true}>
        {this._renderTitle      ()}
        {this._renderDescription()}
        {this._renderGrades     ()}
        {this._renderButtons    ()}
      </View>
    );
  }

  render(){
    const { height, width } = Dimensions.get("window");
    const modalHeight = height * 0.85;

    return(
      <Modal 
        isVisible={this.state.modalVisible}
        onSwipe={this._handleOnSwipe}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
        //swipeDirection="down"
        //scrollTo={this._handleScrollTo}
        //scrollOffset={this.state.scrollOffset}
        //scrollOffsetMax={modalHeight} // content height - ScrollView height
        style={styles.bottomModal}
        backdropOpacity={0.15}
        useNativeDriver={false}
      >
        
        <View style={{height: modalHeight}}>
          <BlurView
            style={{flex: 1}}
            intensity={100}
            tint='light'
          >
            <ScrollView
              ref={ref => (this.scrollViewRef = ref)}
              onScroll={this._handleOnScroll}
              scrollEventThrottle={200}
              directionalLockEnabled={true}
            >
              {this._renderModalContent()}
            </ScrollView>
          </BlurView>
          
        </View>
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
  },

  scrollableModalContent1: {
    height: 200,
    backgroundColor: "orange",
    alignItems: "center",
    justifyContent: "center"
  },
  scrollableModalContent2: {
    height: 200,
    backgroundColor: "lightgreen",
    alignItems: "center",
    justifyContent: "center"
  },
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0
  },
});