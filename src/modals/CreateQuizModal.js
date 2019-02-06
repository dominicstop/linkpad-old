import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, SectionList, Animated, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES } from '../Constants';
import { PURPLE } from '../Colors';

import { plural , setStateAsync, timeout } from '../functions/Utils';
import { SubjectItem, ModuleItemModel, ModuleStore } from '../functions/ModuleStore';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../components/SwipableModal';
import { IconText, AnimateInView } from '../components/Views';

import { BlurView, LinearGradient, DangerZone } from 'expo';
import { Icon, Divider } from 'react-native-elements';

import * as Animatable  from 'react-native-animatable';
import * as _Reanimated from 'react-native-reanimated';

const { Lottie } = DangerZone;
const { Easing } = _Reanimated;
const Reanimated = _Reanimated.default;

const Screen = {
  width : Dimensions.get('window').width ,
  height: Dimensions.get('window').height,
};

class CheckAnimation extends React.PureComponent {
  constructor(props){
    super(props);

    this.state = {
      mountAnimation: false,
    };

    this._source = require('../animations/checked_done_2.json');
    this._value = new Animated.Value(0.5);
    this._config = { 
      toValue: 1,
      duration: 500,
      useNativeDriver: true 
    };

    this._animated = Animated.timing(this._value, this._config);
  };

  //start animation
  start = () => {
    return new Promise(async resolve => {
      await setStateAsync(this, {mountAnimation: true});
      this._animated.start(() => resolve());
    });
  };

  render(){
    //dont mount until animation starts
    if(!this.state.mountAnimation) return null;

    return(
      <Lottie
        ref={r => this.animation = r}
        progress={this._value}
        source={this._source}
        loop={false}
        autoplay={false}
      />
    );
  };
};

//shows the module title
class ModalSectionHeader extends React.PureComponent {
  static propTypes = {
    sextion: PropTypes.object,
  };

  static styles = StyleSheet.create({
    container: {
      marginTop: -1,
      padding: 10,
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255, 255, 255, 0.20)',
        },
        android: {
          backgroundColor: 'white',
          borderBottomColor: 'rgb(200,200,200)',
          borderBottomWidth: 1,
        }
      }),
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

  _renderContent(){
    const { styles } = ModalSectionHeader;
    const { section } = this.props;

    //wrap data inside model
    const moduleModel = new ModuleItemModel({
      //combine section data as subjects array
      subjects: section.data, ...section,
    });
    
    //deconstruct module properties
    const { modulename, description, lastupdated } = moduleModel.get();
    const subjectCount = moduleModel.getLenghtSubjects();

    return(
      <Fragment>
        <Text numberOfLines={1} style={styles.headerTitle}>{modulename}</Text>
        <Text numberOfLines={2} style={styles.headerSubtitle}>{description}</Text>
      </Fragment>
    );
  };

  _renderIOS(){
    const { styles } = ModalSectionHeader;
    return(
      <BlurView
        style={{marginBottom: 2, borderBottomColor: 'black'}}
        tint={'default'}
        intensity={100}
      >
        <View style={styles.container}>
          {this._renderContent()}
        </View>
      </BlurView>
    );
  };

  _renderAndroid(){
    const { styles } = ModalSectionHeader;

    return(
      <View style={styles.container}>
        {this._renderContent()}
      </View>
    );
  };

  render(){
    return Platform.select({
      ios    : this._renderIOS(),
      android: this._renderAndroid(),
    });
  };
};

//shows the subject item
class ModalSectionItem extends React.PureComponent {
  static propTypes = {
    subjectData: PropTypes.object,
    onPressItem: PropTypes.func,
    isSelected : PropTypes.bool,
  };

  defaultProps = {
    isSelected: true,
  };

  static styles = StyleSheet.create({
    buttonContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255,255, 0.25)', 
      padding: 10,
      paddingLeft: 17,
    },
    subjectTitle: {
      fontSize: 18, 
      fontWeight: 'bold',
      color: 'rgb(25, 25, 25)'
    },
    subtitle: {
      fontSize: 16, 
      fontWeight: '100'
    }
  });

  constructor(props){
    super(props);
    this.state = {
      isSelected: props.isSelected,
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
    });

    return (
      <Icon
        containerStyle={{marginRight: 10}}
        {...props}
      />
    );
  };

  _renderDetails(){
    const { styles } = ModalSectionItem;

    const { subjectData } = this.props;
    //create subjectname if does not exist
    const subject = Object.assign({'subjectname': ''}, subjectData);
    //extract properties
    const { subjectname, description } = subject;

    const title    = subjectname? subjectname : 'No Subject Name';
    const subtitle = description? description : 'No Description';

    return (
      <View style={{flex: 1}}>
        <Text style={styles.subjectTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle    } numberOfLines={1}>{subtitle}</Text>
      </View>
    );
  };

  render(){
    const { styles } = ModalSectionItem;

    return (
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={this._handleOnPress}
        activeOpacity={0.7}
      >
        {this._renderCheckbox()}
        {this._renderDetails ()}
      </TouchableOpacity>
    );
  };
};

class ModalAddButton extends React.PureComponent {
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
      fontWeight: '500',
      color: 'white',
      textAlign: 'left',
      textAlignVertical: 'center',
      marginLeft: 10,
    },
  });
  
  constructor(props){
    super(props);

    this._height = new Reanimated.Value(0);
    this._showConfig = {
      duration: 300,
      toValue : 80,
      easing  : Easing.inOut(Easing.ease),
    };

    this._hideConfig = {
      duration: 300,
      toValue : 0,
      easing  : Easing.inOut(Easing.ease),
    };

    this._animatedShow = Reanimated.timing(this._height, this._showConfig);
    this._animatedHide = Reanimated.timing(this._height, this._hideConfig);
  };

  show = () => {
    this._animatedShow.start();
    this._animatedShow = Reanimated.timing(this._height, this._showConfig);
  };

  hide = () => {
    this._animatedHide.start();
    this._animatedHide = Reanimated.timing(this._height, this._hideConfig);
  };

  _handleOnPress = () => {
    const { onPress } = this.props;
    onPress && onPress();
  };

  _renderContents(){
    const { styles } = ModalAddButton;

    const buttonText = (global.usePlaceholder
      ? 'Lorem Vulputate Magna'
      : 'Add Selected Items'
    );

    return(
      <LinearGradient
        style={[styles.button, STYLES.mediumShadow]}
        colors={[PURPLE[800], PURPLE[500]]}
        start={[0, 1]} end={[1, 0]}
      >
        <Icon
          name={'ios-add-circle-outline'}
          type={'ionicon'}
          color={'white'}
          size={24}
        />
        <Text style={styles.buttonText}>{buttonText}</Text>
        <Icon
          name={'chevron-right'}
          type={'feather'}
          color={'white'}
          size={24}
        />
      </LinearGradient>
    );
  };

  render(){
    const { styles } = ModalAddButton;
    return (
      <Reanimated.View style={[{height: this._height}, styles.container]}>
        <TouchableOpacity style={{flex: 1}} onPress={this._handleOnPress}>
          {this._renderContents()}
        </TouchableOpacity>
      </Reanimated.View>
    );
  };
};

class ModalTitle extends React.PureComponent {
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
      fontSize: 16,
      ...Platform.select({
        ios: {
          fontWeight: '200'
        },
        android: {
          fontWeight: '100'
        }
      })
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
    const text = (global.usePlaceholder
      ? 'Ridiculus Eges'
      : 'Add Subject'
    );

    const subtitleDefault = (global.usePlaceholder
      ? 'Consectetur Bibendum Cursus Etiam Lorum.'
      : 'Select the subjects that you want to add.'
    );

    const prefix = global.usePlaceholder? 'Quam' : 'subject';
    const subtitle = (selectedCount == 0
      ? subtitleDefault
      : `${selectedCount} ${plural(prefix, selectedCount)} has been selected.`
    );

    return { text, subtitle };
  };

  setSubtitle = async (subtitle) => {
    await this.subtitleText.fadeOut(200);
    await setStateAsync(this, {subtitle});
    await this.subtitleText.fadeIn (200);
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
    const { styles } = ModalTitle;
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

class ModalContents extends React.PureComponent {
  static propTypes = {
    onPressAddItems: PropTypes.func,
    modules: PropTypes.array,
    selected: PropTypes.array
  };
  
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

  constructor(props){
    super(props);
    this.selected = [...props.selected];
  };

  async componentDidMount(){
    const selectedCount = this.selected.length;
    
    if(selectedCount > 0){
      //delay show
      await timeout(500);    
      //show next button
      this._nextButton.show();
    };
  };

  _handleKeyExtractor(item, index){
    //create subjectname if does not exist
    const subject = Object.assign({'subjectname': ''}, item);
    const { subjectname, indexid } = subject;

    return(`${subjectname}-${indexid}`);
  };

  _handleOnPressAdd = () => {
    //create a copy of selected
    const selected = [...this.selected];
    
    const { onPressAddItems } = this.props;
    onPressAddItems && onPressAddItems(selected);
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
    return(
      <ModalTitle
        ref={r => this.modalTitle = r}
      />
    );
  };

  _renderItem = ({item, index, section}) => {
    const item_id = `${item.indexID_module}-${item.indexid}`;

    //find match from selected items
    const match = this.selected.filter(selected_item => {
      const selected_id = `${selected_item.indexID_module}-${selected_item.indexid}`;
      return item_id == selected_id;
    });

    //if has match in selected, selected
    const isSelected = match.length > 0;

    return (
      <ModalSectionItem
        subjectData={item}
        onPressItem={this._handleOnPressItem}
        {...{isSelected}}
      />
    );
  };

  _renderSectionHeader = ({section}) => {
    return(
      <ModalSectionHeader {...{section}}/>
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
      <ModalAddButton
        ref={r => this._nextButton = r}
        onPress={this._handleOnPressAdd}
      />
    );
  };

  render(){
    const { styles } = ModalContents; 
    return(
      <View style={{flex: 1}}>
        {this._renderTitle()}
        <SectionList
          style={styles.scrollview}
          renderItem={this._renderItem}
          renderSectionHeader={this._renderSectionHeader}
          renderSectionFooter={this._renderSectionFooter}
          ItemSeparatorComponent={this._renderItemSeperator}
          keyExtractor={this._handleKeyExtractor}
          sections={this.props.modules}
          stickySectionHeadersEnabled={true}
        />
        {this._renderNextButton()}
      </View>
    );
  };
};

export class CreateQuizModal extends React.PureComponent {
  static styles = StyleSheet.create({
    overlayContainer: {
      flex: 1,
      position: 'absolute',
      height: '100%',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlay: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      opacity: 0,
      backgroundColor: 'white',
    },
    checkContainer: {
      width: '50%', 
      height: '50%', 
      marginBottom: 325
    }
  });
  
  constructor(props){
    super(props);

    this.state = {
      mountContent: false,
      modules: [],
      selected: [],
    };

    this._deltaY = null;
    //called when add subject is pressed
    this.onPressAddSubject = null;
  };

  componentDidMount(){
    this._deltaY = this._modal._deltaY
  };

  openModal = async (selected) => {
    const modules = await this._getModules();
    this.setState({modules, selected, mountContent: true});
    this._modal.showModal();
  };

  async _getModules(){
    const modules_raw = await ModuleStore.read();

    const modules = modules_raw.map((module) => {
      const { indexid } = module;
      const new_subject = module.subjects.map(subject => {
        return { indexID_module: indexid, ...subject };
      });
      return { ...module, subjects: new_subject };
    });

    //remap modules to work with sectionlist
    return modules.map((module, index, array) => {
      //extract subjects from module
      const { subjects, ...other } = module;
      //rename subjects to data
      return { data: subjects, ...other };
    });
  };

  _handleOnModalShow = () => {
  };

  _handleOnModalHide = () => {
    this.setState({mountContent: false});
  };

  _handleOnPressAddSubjects = async (selected) => {
    //only if callback is defined
    if(this.onPressAddSubject != null){
      //hide button
      this.modalContents._nextButton.hide();

      //wait to finish
      await Promise.all([
        //show overlay
        this.overlay.transitionTo({opacity: 0.4}, 500),
        //show check animation
        this.animatedCheck.start(),
      ]);
      
      //wait for modal to close
      await this._modal.hideModal();
      this.onPressAddSubject(selected);
    };
  };

  _renderOverlay(){
    const { styles } = CreateQuizModal;
    return (
      <View 
        style={styles.overlayContainer}
        pointerEvents={'none'}
      >
        <Animatable.View 
          ref={r => this.overlay = r}
          style={styles.overlay}
          useNativeDriver={true}
        />
        <View style={styles.checkContainer}>
          <CheckAnimation ref={r => this.animatedCheck = r}/>
        </View>
      </View>
    );
  };

  _renderContent(){
    const { modules, selected } = this.state;

    const style = {
      flex: 1,
      opacity: this._deltaY.interpolate({
        inputRange: [0, Screen.height - MODAL_DISTANCE_FROM_TOP],
        outputRange: [1, 0.25],
        extrapolateRight: 'clamp',
      }),
    };

    return(
      <Reanimated.View {...{style}}>
        <ModalContents
          ref={r => this.modalContents = r}
          onPressAddItems={this._handleOnPressAddSubjects}
          //pass down props
          {...{modules, selected}}
        />
      </Reanimated.View>
    );
  };

  render(){
    const { mountContent } = this.state;

    const paddingBottom = (
      MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP
    );

    return(
      <SwipableModal 
        ref={r => this._modal = r}
        onModalShow={this._handleOnModalShow}
        onModalHide={this._handleOnModalHide}
      >
        <Fragment>
          <ModalBackground style={{paddingBottom}}>
            <ModalTopIndicator/>
            {mountContent && this._renderContent()}
          </ModalBackground>
          {this._renderOverlay()}
        </Fragment>
      </SwipableModal>
    );
  };
};