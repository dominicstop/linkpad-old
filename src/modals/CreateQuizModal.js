import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, SectionList, Animated as NativeAnimated, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES } from '../Constants';
import { PURPLE } from '../Colors';

import { plural , setStateAsync, timeout , isEmpty} from '../functions/Utils';
import { ModuleItemModel } from '../models/ModuleModels';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../components/SwipableModal';
import { IconText, AnimateInView } from '../components/Views';

import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Lottie from 'lottie-react-native'

import * as Animatable  from 'react-native-animatable';
import { isIphoneX, ifIphoneX } from 'react-native-iphone-x-helper';
import { Icon, Divider } from 'react-native-elements';
import Animated, { Easing } from 'react-native-reanimated';

const { Value, timing, interpolate } = Animated;


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
    this._value = new NativeAnimated.Value(0.5);
    this._config = { 
      toValue: 1,
      duration: 500,
      useNativeDriver: true 
    };

    this._animated = NativeAnimated.timing(this._value, this._config);
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
}

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
    
    const moduleDescription = isEmpty(description)? 'No Description' : description;

    return(
      <Fragment>
        <Text numberOfLines={1} style={styles.headerTitle}>{modulename}</Text>
        <Text numberOfLines={2} style={styles.headerSubtitle}>{moduleDescription}</Text>
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
}

//shows the subject item
class ModalSectionItem extends React.PureComponent {
  static propTypes = {
    subjectData: PropTypes.object,
    moduleData: PropTypes.object,
    onPressItem: PropTypes.func,
    isSelected : PropTypes.bool,
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

    const { onPressItem, subjectData, moduleData } = this.props;
    onPressItem && onPressItem({
      isSelected: !isSelected, subjectData, moduleData
    });
  };

  _renderCheckbox(){
    const { isSelected } = this.state;

    const props = Platform.select({
      ios: {
        type: 'ionicon',
        size: 26,
        ...(isSelected ? {
          name: 'ios-checkmark-circle',
          color: PURPLE[500],
        } : {
          name: 'ios-radio-button-off',
          color: PURPLE[200],
        }),
      },
      android: {
        type: 'ionicon',
        size: 26,
        ...(isSelected ? {
          name: 'ios-checkmark-circle',
          color: PURPLE[500],
        } : {
          name: 'ios-radio-button-off',
          color: PURPLE[200],
        }),
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
}

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
      borderRadius: 15,
      paddingHorizontal: 15,
      ...ifIphoneX({
        marginBottom: 20,
        borderRadius: 17,
      }),
    },
    buttonText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: 'white',
      textAlign: 'left',
      textAlignVertical: 'center',
      marginLeft: 15,
    },
  });
  
  constructor(props){
    super(props);

    const finalHeight = isIphoneX? 90 : 80;
    this.progress = new Value(0);

    this.height = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, finalHeight],
    });
    this.opacity = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, 1],
    });
    this.scale = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0.8, 1],
    });
    this.translateY = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [40, 0],
    });
  };

  show = () => {
    const config = {
      duration: 300,
      toValue : 100,
      easing  : Easing.inOut(Easing.ease),
    };
    const animation = timing(this.progress, config);
    animation.start();
  };

  hide = () => {
    const config = {
      duration: 300,
      toValue : 0,
      easing  : Easing.inOut(Easing.ease),
    };
    const animation = timing(this.progress, config);
    animation.start();
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
          name={'ios-add-circle'}
          type={'ionicon'}
          color={'white'}
          size={26}
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
    const containerStyle = {
      height : this.height,
      opacity: this.opacity,
      transform: [
        {scale: this.scale},
        {translateY: this.translateY}
      ],
    };

    return (
      <Animated.View style={[styles.container, containerStyle]}>
        <TouchableOpacity style={{flex: 1}} onPress={this._handleOnPress}>
          {this._renderContents()}
        </TouchableOpacity>
      </Animated.View>
    );
  };
}

class ModalTitle extends React.PureComponent {
  static styles = StyleSheet.create({
    containerStyle: {
      flexDirection: 'row',
      marginLeft: 7, 
      marginRight: 25, 
      marginBottom: 7,
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
    },
    subtitleContainer: {
      height: 26,
      maxHeight: 26,
    },
    subtitleSelectedContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    subtitleSelectedCount: {
      color: 'white',
      ...Platform.select({
        ios: {
          fontWeight: '300'
        },
        android: {
          fontWeight: '500'
        }
      })
    },
    subtitleCountContainer: {
      backgroundColor: PURPLE.A700,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 2,
      marginRight: 2,
    }
  });

  constructor(props){
    super(props);

    const { selectedCount } = props;

    this.state = {
      //get title/desc when no. of selected
      ...this.getTitleText(selectedCount),
      selectedCount,
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

    const prefix = global.usePlaceholder? 'Quam' : 'Subject';
    const subtitlePrefix = `${selectedCount} ${plural(prefix, selectedCount)}`;
    const subtitleSuffix = ' has been selected.';

    const subtitle = (selectedCount == 0
      ? subtitleDefault
      : subtitlePrefix + subtitleSuffix
    );

    return { text, subtitle, subtitlePrefix, subtitleSuffix };
  };

  setSelectedCount = async (selectedCount) => {
    //store prev. value
    const old_selectedCount = this.state.selectedCount;
  
    const titleText = this.getTitleText(selectedCount);

    if((old_selectedCount == 0 && selectedCount == 1) || (old_selectedCount == 1 && selectedCount == 0)){
      //animate in/out changed subtitle
      await setStateAsync(this, {...titleText, selectedCount});

    } else {
      //no fade animation
      this.subtitleText.pulse(300);
      await setStateAsync(this, {...titleText, selectedCount});
    };
  };

  _renderSubtitleSelected(){
    const { styles } = ModalTitle;
    const { subtitlePrefix, subtitleSuffix } = this.state;

    return(
      <View style={styles.subtitleSelectedContainer}>
        <View style={styles.subtitleCountContainer}>
          <Text style={[styles.subtitle, styles.subtitleSelectedCount]}>
            {subtitlePrefix}
          </Text>
        </View>
        <Text style={styles.subtitle}>
          {subtitleSuffix}
        </Text>
      </View>
    );
  };

  _renderSubtitleUnselected(){
    const { styles } = ModalTitle;
    const { subtitle } = this.state;

    return(
      <Text style={styles.subtitle}>
        {subtitle}
      </Text>
    );
  };

  render(){
    const { styles } = ModalTitle;
    const { text, subtitle, selectedCount } = this.state;
    const isSelected = selectedCount > 0;
    
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
          <Animatable.View 
            ref={r => this.subtitleText = r}
            style={styles.subtitleContainer}
            animation={'fadeInUp'}
            easing={'ease-in-out'}
            duration={500}
            delay={200}
            useNativeDriver={true}
          >
            {isSelected
              ? this._renderSubtitleSelected() 
              : this._renderSubtitleUnselected()
            }
          </Animatable.View>
        </View>
      </View>      
    );
  };
}

class ModalContents extends React.PureComponent {
  static propTypes = {
    onPressAddItems: PropTypes.func,
    modules: PropTypes.array,
    selected: PropTypes.array,
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
    const { onPressAddItems } = this.props;
    //create a copy of selected
    const selected = [...this.selected];
    //call callback
    onPressAddItems && onPressAddItems({selected});
  };

  _handleOnPressItem = ({isSelected, subjectData, moduleData}) => {
    const selected_id = `${subjectData.indexID_module}-${subjectData.indexid}`;
    //store the previous value of selected before add/remove
    const old_selected = [...this.selected];
    
    //add/remove subjects from selected
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
    const selectedCount = this.selected.length;

    return(
      <ModalTitle
        ref={r => this.modalTitle = r}
        {...{selectedCount}}
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
        moduleData={section}
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
}

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

  openModal = async ({selected, modules}) => {
    //remap modules to work with sectionlist
    const modules_mapped = modules.map((module, index, array) => {
      //extract subjects from module
      const { subjects, ...other } = module;
      //rename subjects to data
      return { data: subjects, ...other };
    });

    this.setState({
      mountContent: true,
      modules: modules_mapped,
      //pass down to state
      selected, 
    });
    this._modal.showModal();
  };

  _handleOnModalShow = () => {
  };

  _handleOnModalHide = () => {
    this.setState({mountContent: false});
  };

  _handleOnPressAddSubjects = async ({selected}) => {
    //only if callback is defined
    if(this.onPressAddSubject != null){
      //hide button
      this.modalContents._nextButton.hide();

      const overlayOpacity = Platform.select({
        ios: 0.4, android: 0.7,
      });

      //wait to finish
      await Promise.all([
        //show overlay
        this.overlay.transitionTo({opacity: overlayOpacity}, 500),
        //show check animation
        this.animatedCheck.start(),
      ]);
      
      //wait for modal to close
      await this._modal.hideModal();
      this.onPressAddSubject({selected});
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
      <Animated.View {...{style}}>
        <ModalContents
          ref={r => this.modalContents = r}
          onPressAddItems={this._handleOnPressAddSubjects}
          //pass down props
          {...{modules, selected}}
        />
      </Animated.View>
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
}