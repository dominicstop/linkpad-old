import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';

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
      renderBody : false,
      subjectData: null ,
    }
  }

  toggleSubjectModal = async (subjectData) => {
    //receive subject data from onpress subject
    await this.setState({subjectData: subjectData});
    this.subjectModal.open();
  }

  _onModalOpened = () => {
    this.setState({renderBody: true});
  }

  _onModalClosed = () => {
    this.setState({renderBody: false});
  }

  _renderGradeItem = ({item, index}) => {
    const { subjectData } = this.state;
    return (
      index == 0? <SummaryItem subjectData={subjectData}/> : <GradeItem {...item}/>
    );
  }

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

  _renderBody(){
    return(
      <View style={{flex: 1}}>

      </View>
    );
  }

  _renderButtons(){
    const CloseButton = (props) =>  <IconButton
      containerStyle={{margin: 17, justifyContent: 'center', backgroundColor: '#C62828', padding: 15, borderRadius: 10}}
      text={'Cancel'}
      iconName={'close'}
      iconType={'simple-line-icon'}
      iconSize={22}
      iconColor={'white'}
      textStyle={{color: 'white', fontSize: 16, flex: 0}}
      onPress={() => this.subjectModal.close()}
      {...props}
    />

    const ReviewButton = (props) => <IconButton
      containerStyle={{marginHorizontal: 17, justifyContent: 'center', backgroundColor: '#6200EA', padding: 15, borderRadius: 10}}
      text={'Start Practice Exam'}
      iconName={'pencil-square-o'}
      iconType={'font-awesome'}
      iconSize={22}
      iconColor={'white'}
      textStyle={{color: 'white', fontSize: 16, flex: 0}}
      {...props}
    />

    return(
      <Animatable.View 
        animation={'fadeInUp'}
        duration={500}
        delay={200}
        easing={'ease-in-out'}
        useNativeDriver={true}
        collapsable={true}
      >
        <ReviewButton/>
        <CloseButton/>
      </Animatable.View>
    );
  }

  render(){
    return(
      <Modal 
        style={{ height: 575, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: 'hidden'}}  
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
              containerStyle={{margin: 17}}
              iconName ={'notebook'}
              iconType ={'simple-line-icon'}
              iconColor={'rgba(0, 0, 0, 0.6)'}
              iconSize ={26}
              text={'Subject Name'}
              subtitle={'Choose an option'}
              textStyle={{fontSize: 20, fontWeight: 'bold'}}
              subtitleStyle={{fontWeight: '200'}}
            />
            {this.state.renderBody && this._renderGrades ()}
            {this.state.renderBody && this._renderBody   ()}
            {this.state.renderBody && this._renderButtons()}
          </View>
        </BlurView>
      </Modal>
    );
  }
}