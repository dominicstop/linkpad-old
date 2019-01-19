import React, { Fragment } from 'react';
import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, ScrollView, Platform, Alert, LayoutAnimation, UIManager, SectionList } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES } from '../../Constants';
import { PURPLE } from '../../Colors';

import { plural , setStateAsync } from '../../functions/Utils';
import { SubjectItem, ModuleItemModel } from '../../functions/ModuleStore';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../SwipableModal';
import { IconText, AnimateInView } from '../../components/Views';

import * as Animatable from 'react-native-animatable';
import Animated, { Easing } from 'react-native-reanimated';
import { BlurView } from 'expo';
import { Icon, Divider } from 'react-native-elements';

//module title
export class CreateQuizModalSectionHeader extends React.PureComponent {
  static propTypes = {
    sextion: PropTypes.object,
  };

  static styles = StyleSheet.create({
    container: {
      padding: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.20)',
    },
    headerTitle: {
      fontWeight: '600',
      fontSize: 20,
      color: PURPLE[900],
    },
    headerSubtitle: {
      fontSize: 18,
      fontWeight: '300'
    },
  });

  _renderIOS(props){
    const { styles } = CreateQuizModalSectionHeader;
    return (
      <BlurView
        style={{marginBottom: 2, borderBottomColor: 'black'}}
        tint={'default'}
        intensity={100}
        {...props}
      >
        <View style={styles.container}>
          {props.children}
        </View>
      </BlurView>
    );
  };

  render(){
    const { styles } = CreateQuizModalSectionHeader;
    const { section } = this.props;

    //wrap data inside model
    const moduleModel = new ModuleItemModel({
      //combine section data as subjects array
      subjects: section.data, ...section,
    });
    
    //deconstruct module properties
    const { modulename, description, lastupdated } = moduleModel.get();
    const subjectCount = moduleModel.getLenghtSubjects();

    const Container = Platform.select({
      ios    : this._renderIOS,
      android: (props) => <View     {...props}>{props.children}</View>    ,
    });

    return(
      <Container>
        <Text numberOfLines={1} style={styles.headerTitle}>{modulename}</Text>
        <Text numberOfLines={2} style={styles.headerSubtitle}>{description}</Text>
      </Container>
    );
  };
};

//subject item
export class CreateQuizModalSectionItem extends React.PureComponent {
  static propTypes = {
    subjectData: PropTypes.object,
    onPressItem: PropTypes.func,
  };

  static styles = StyleSheet.create({
    buttonContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255,255, 0.25)', 
      padding: 10
    },
    subjectTitle: {
      fontSize: 18, 
      fontWeight: 'bold',
      color: 'rgb(25, 25, 25)'
    },
  });

  constructor(props){
    super(props);
    this.state = {
      isSelected: false,
    };
  };

  _handleOnPress = () => {
    const { isSelected } = this.state;
    this.setState({ isSelected: !isSelected });

    const { onPressItem, subjectData } = this.props;
    onPressItem && onPressItem(!isSelected, subjectData);
  };

  _renderCheckbox(){
    const { isSelected } = this.state;

    const props = Platform.select({
      ios: {
        type: 'ionicon',
        size: 26,
        ...isSelected? {
          name: 'ios-checkmark-circle',
          color: PURPLE[500],
        } : {
          name: 'ios-radio-button-off',
          color: PURPLE[200],
        },
      },
      android: {
        name: '',
        type: '',
        size: '',
        ...isSelected? {

        } : {

        },
      },
    });

    return (
      <Icon
        containerStyle={{marginRight: 10}}
        {...props}
      />
    );
  };

  _renderDetails(){
    const { styles } = CreateQuizModalSectionItem;

    const { subjectData } = this.props;
    const { subjectname, description } = subjectData;

    return (
      <View>
        <Text style={styles.subjectTitle}>{subjectname}</Text>
        <Text style={{fontSize: 16, fontWeight: '100'}}>{description}</Text>
      </View>
    );
  };

  render(){
    const { styles } = CreateQuizModalSectionItem;

    return (
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={this._handleOnPress}
      >
        {this._renderCheckbox()}
        {this._renderDetails ()}
      </TouchableOpacity>
    );
  };
};

export class CreateQuizModalNextButton extends React.PureComponent {
  static propTypes = {
    onPress: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      borderTopColor: 'rgba(0, 0, 0, 0.2)',
      borderTopWidth: 1,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: PURPLE[700], 
      margin: 12, 
      borderRadius: 10,
      paddingHorizontal: 15,
    },
    buttonText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '400',
      color: 'white',
      textAlign: 'left',
      textAlignVertical: 'center',
      marginLeft: 10,
      textDecorationLine: 'underline'
    },
  });
  
  constructor(props){
    super(props);

    this._height = new Animated.Value(0);
    this._showConfig = {
      duration: 500,
      toValue : 80,
      easing  : Easing.inOut(Easing.ease),
    };

    this._hideConfig = {
      duration: 500,
      toValue : 0,
      easing  : Easing.inOut(Easing.ease),
    };

    this._animatedShow = Animated.timing(this._height, this._showConfig);
    this._animatedHide = Animated.timing(this._height, this._hideConfig);
  };

  show = () => {
    this._animatedShow.start();
    this._animatedShow = Animated.timing(this._height, this._showConfig);
  };

  hide = () => {
    this._animatedHide.start();
    this._animatedHide = Animated.timing(this._height, this._hideConfig);
  };

  _handleOnPress = () => {
    const { onPress } = this.props;
    onPress && onPress();
  };

  _renderContents(){
    const { styles } = CreateQuizModalNextButton;
    return(
      <Fragment>
        <Icon
          name={'ios-add-circle-outline'}
          type={'ionicon'}
          color={'white'}
          size={24}
        />
        <Text style={styles.buttonText}>{'Create Custom Quiz'}</Text>
        <Icon
          name={'chevron-right'}
          type={'feather'}
          color={'white'}
          size={24}
        />
      </Fragment>
    );
  };

  render(){
    const { styles } = CreateQuizModalNextButton;
    return (
      <Animated.View style={[{height: this._height}, styles.container]}>
        <TouchableOpacity
          style={[styles.button, STYLES.lightShadow]}
          onPress={this._handleOnPress}
        >
          {this._renderContents()}
        </TouchableOpacity>
      </Animated.View>
    );
  };
};

export class CreateQuizModalTitle extends React.PureComponent {
  static propTypes = {
    type: PropTypes.string,
  };

  static styles = StyleSheet.create({
    containerStyle: {
      flexDirection: 'row',
      marginLeft: 7, 
      marginRight: 25, 
      marginBottom: 10
    },
    textContainer: {
      marginHorizontal: 10,
    },
    title: {
      color: '#160656',
      ...Platform.select({
        ios: {
          fontSize: 24, 
          fontWeight: '800'
        },
        android: {
          fontSize: 26, 
          fontWeight: '900'
        }
      })
    },
    subtitle: {
      fontWeight: '200', 
      fontSize: 16
    }
  });

  constructor(props){
    super(props);

    //get title when no. of selected is 0
    const { text, subtitle } = this.getTitleText(0);

    this.state = {
      text, subtitle,
      selectedCount: 0,
    };
  };

  getTitleText(selectedCount){
    const { TYPES } = CreateQuizModal;
    const { type } = this.props;
    
    //icontext props
    let text, subtitle;
    
    //set inital title/desc based on type
    switch (type) {
      case TYPES.module:
        //title/desc when type is module
        text     = 'Add Module';
        subtitle = selectedCount == 0
          ? 'Select the modules that you want to add.' 
          : `${selectedCount} ${plural('module', selectedCount)} has been selected.`
        break;

      case TYPES.subject:
        //title/desc when type is subject
        text     = 'Add Subject';
        subtitle = selectedCount == 0
          ? 'Select the subjects that you want to add.' 
          : `${selectedCount} ${plural('subject', selectedCount)} has been selected.`
        break;
    
      default:
        //invalid type
        text     = '?';
        subtitle = '?';
        break;
    };

    return { text, subtitle };
  };

  setSubtitle = async (subtitle) => {
    await this.subtitleText.fadeOut(300);
    await setStateAsync(this, {subtitle});
    await this.subtitleText.fadeIn (300);
  };

  setSelectedCount = (selectedCount) => {
    //store prev. value
    const old_selectedCount = this.state.selectedCount;
  
    this.setState({selectedCount});
    const { subtitle } = this.getTitleText(selectedCount);

    if((old_selectedCount == 0 && selectedCount == 1) || (old_selectedCount == 1 && selectedCount == 0)){
      //animate in/out changed subtitle
      this.setSubtitle(subtitle);

    } else {
      //no animation
      this.setState({subtitle});
    };
  };

  render(){
    const { styles } = CreateQuizModalTitle;
    const { text, subtitle } = this.state;
    
    return(
      <View style={styles.containerStyle}>
        <Icon
          name={'notebook'}
          type={'simple-line-icon'}
          color={'#512DA8'}
          size={26}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{text}</Text>
          <Animatable.Text 
            ref={r => this.subtitleText = r}
            style={styles.subtitle}
          >
            {subtitle}
          </Animatable.Text>
        </View>
      </View>      
    );
  };
};

export class CreateQuizModal extends React.PureComponent {
  static styles = StyleSheet.create({
    textSubtitle: {
      fontSize: 18,
      fontWeight: '200',
      color: '#212121',
      textAlign: 'justify',
      marginBottom: 5,
    },
    textBody: {
      fontSize: 18, 
      textAlign: 'justify',
      color: '#202020',
    },
    scrollview: {
      flex: 1, 
      borderTopColor: 'rgb(200, 200, 200)', 
      borderTopWidth: 1
    },
  });

  //enum for modal type
  static TYPES = {
    module : 'module ',
    subject: 'subject',
  };

  constructor(props){
    super(props);

    this.state = {
      mountContent: true,
      type: null,
      
      modules: [
        {
          description: 'lorum desc', modulename: 'ipsum desc', lastupdated: '1/1/1998', indexid: 1, 
          data: [
            { indexid: 0, subjectname: 'lorum subject 1', description: 'ipsum desc 1', lastupdated: '1/1/2090', questions: [], indexID_module: 1 },
            { indexid: 1, subjectname: 'lorum subject 2', description: 'ipsum desc 2', lastupdated: '1/1/2010', questions: [], indexID_module: 1 },
            { indexid: 2, subjectname: 'lorum subject 3', description: 'ipsum desc 3', lastupdated: '1/1/2020', questions: [], indexID_module: 1 },
          ]
        },
        {
          description: 'lorum desc', modulename: 'ipsum red', lastupdated: '1/1/1998', indexid: 2, 
          data: [
            { indexid: 0, subjectname: 'lorum subject 1', description: 'ipsum desc 1', lastupdated: '1/1/2090', questions: [], indexID_module: 2 },
            { indexid: 1, subjectname: 'lorum subject 2', description: 'ipsum desc 2', lastupdated: '1/1/2010', questions: [], indexID_module: 2 },
            { indexid: 2, subjectname: 'lorum subject 3', description: 'ipsum desc 3', lastupdated: '1/1/2020', questions: [], indexID_module: 2 },
          ]
        },
        {
          description: 'lorum desc', modulename: 'ipsum asd', lastupdated: '1/1/1998', indexid: 3, 
          data: [
            { indexid: 0, subjectname: 'lorum subject 1', description: 'ipsum desc 1', lastupdated: '1/1/2090', questions: [], indexID_module: 3 },
            { indexid: 1, subjectname: 'lorum subject 2', description: 'ipsum desc 2', lastupdated: '1/1/2010', questions: [], indexID_module: 3 },
            { indexid: 2, subjectname: 'lorum subject 3', description: 'ipsum desc 3', lastupdated: '1/1/2020', questions: [], indexID_module: 3 },
          ]
        }
      ],
    };

    this.selected = [];
  };

  openModal = ({type}) => {
    this.setState({
      mountContent: true,
      type
    });

    this._modal.showModal();
  };

  _handleKeyExtractor(item, index){
    const { modulename, indexid } = item;
    return(`${modulename}-${indexid}`);
  };

  _handleOnPressItem = (isSelected, subjectData) => {
    const selected_id = `${subjectData.indexID_module}-${subjectData.indexid}`;
    //store the previous value of selected before add/remove
    const old_selected = [...this.selected];
    
    if(isSelected){
      //add to selected list
      this.selected.push(subjectData);
    } else {
      //remove from selected list
      this.selected = this.selected.filter(value =>
        //only add items that does not match selected id
        selected_id != `${value.indexID_module}-${value.indexid}`
      );
    };

    const old_length = old_selected.length;
    const new_length = this.selected.length;

    //show or hide the next button
    if(old_length == 0 && new_length > 0){
      //show next button
      this._nextButton.show();

    } else if(old_length > 0 && new_length == 0){
      //hide next button
      this._nextButton.hide();
    };

    //update modal title
    this.modalTitle.setSelectedCount(new_length);
  };

  _renderTitle(){
    const { styles, TYPES } = CreateQuizModal;
    const { type } = this.state;

    return(
      <CreateQuizModalTitle
        ref={r => this.modalTitle = r}
        {...{type}}
      />
    );
  };

  _renderItem = ({item, index, section}) => {
    const { styles } = CreateQuizModal;

    return (
      <CreateQuizModalSectionItem
        subjectData={item}
        onPressItem={this._handleOnPressItem}
      />
    );
  };

  _renderSectionHeader = ({section}) => {
    return(
      <CreateQuizModalSectionHeader {...{section}}/>
    );
  };

  _renderSectionFooter(){
    return (
      <View style={{marginBottom: 25, borderBottomColor: 'rgba(0, 0, 0, 0.15)', borderBottomWidth: 1}}/>
    );
  };

  _renderItemSeperator(){
    return(
      <View style={{marginTop: 2}}/>
    );
  };

  _renderNextButton(){
    return (
      <CreateQuizModalNextButton
        ref={r => this._nextButton = r}
      />
    );
  };

  _renderContent(){
    const { styles } = CreateQuizModal; 

    return(
      <View style={{flex: 1}}>
        <ModalTopIndicator/>
        {this._renderTitle()}
        <SectionList
          style={styles.scrollview}
          renderItem={this._renderItem}
          renderSectionHeader={this._renderSectionHeader}
          renderSectionFooter={this._renderSectionFooter}
          ItemSeparatorComponent={this._renderItemSeperator}
          keyExtractor={this._handleKeyExtractor}
          sections={this.state.modules}
        />
        {this._renderNextButton()}
      </View>
    );
  };

  render(){
    const { styles } = CreateQuizModal;
    const { mountContent } = this.state;

    const paddingBottom = (MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP);

    return(
      <SwipableModal 
        ref={r => this._modal = r}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
      >
        <ModalBackground style={{paddingBottom}}>
          {mountContent && this._renderContent()}
        </ModalBackground>
      </SwipableModal>
    );
  };
};