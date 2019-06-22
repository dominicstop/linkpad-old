import React from 'react';
import { Text, View, Platform, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';

import { ViewWithBlurredHeader, IconText, Card, AnimateInView, IconFooter } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import { CustomHeader } from '../components/Header' ;

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import * as FileSystem from 'expo-file-system';
import { Header, NavigationEvents  } from 'react-navigation';
import { Divider } from 'react-native-elements';

import { isEmpty, timeout} from '../functions/Utils';
import { TipModel } from '../models/TipModel';

import { BLUE , GREY, PURPLE} from '../Colors';
import { STYLES, ROUTES , HEADER_HEIGHT} from '../Constants';

const headerTitle = (props) => <CustomHeader {...props}/>

class ImageCard extends React.PureComponent {
  static propTypes = {
    fileURI: PropTypes.string,
    onLoadEnd: PropTypes.func,
    onPressImage: PropTypes.func,
  };

  static styles = StyleSheet.create({
    card: {
      marginHorizontal: 12, 
      marginBottom: 12,
      elevation: 7,
    },
    cardContainer: {
      flex: 1,
      overflow: 'hidden',
      backgroundColor: 'white',
      borderRadius: 10,
    },
    loadingImageContainer: {
      height: 400,
      backgroundColor: PURPLE[100],
    },
    loadingContainer: {
      height: 400,
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleContainer: {
      padding: 10,
      paddingBottom: 15,
    },
    textTitle: {
      fontSize: 24, 
      fontWeight: 'bold',
      color: '#160758',
    },
    textSubtitle: {
      fontSize: 16, 
      ...Platform.select({
        ios: {
          fontWeight: '200'
        },
        android: {
          fontWeight: '100',
          color: '#424242'
        },
      })
    },
    image: {
      height: 400,
    },
  });

  constructor(props){
    super(props);
    this.state = {
      uri: null,
      loading: true,
    };
  };

  async componentDidMount(){
    const { fileURI } = this.props;
    await timeout(1250);
    
    try {
      const uri = await FileSystem.readAsStringAsync(fileURI);
      this.setState({uri, loading: false});

    } catch(error){
      this.setState({uri: null, loading: false});
      Alert.alert('Error', 'Image could not be loaded.');
      this._handleOnLoadEnd();
      console.log(error);
    };
  };

  componentDidCatch(){
    console.log('Unable to load image.');
  };

  _handleOnLoadEnd = () => {
    const { onLoadEnd } = this.props;
    onLoadEnd && onLoadEnd();
  };

  _handleImageOnPress = () => {
    const { uri } = this.state;
    const { onPressImage } = this.props;
    onPressImage && onPressImage({imageBase64: uri});
  };

  _renderTitle(){
    const { styles } = ImageCard;
    return(
      <IconText
        //icon
        iconName={'image'}
        iconType={'feather'}
        iconColor={'#512DA8'}
        iconSize={24}
        //title
        text={'Image'}
        textStyle={styles.textTitle}
        subtitle={'Tap the image to view fullscreen.'}
        subtitleStyle={styles.textSubtitle}
        containerStyle={styles.titleContainer}
      />
    );
  };

  _renderLoading(){
    const { styles } = ImageCard;
    return(
      <View style={[styles.loadingContainer]}>
        <ActivityIndicator size={'large'}/>
      </View>
    );
  };
  
  _renderImage(){
    const { styles } = ImageCard;
    const { uri } = this.state;
    if(uri == null) return null;

    return(
      <TouchableOpacity
        onPress={this._handleImageOnPress}
        activeOpacity={0.85}
      >
        <Animatable.View
          animation={'fadeIn'}
          duration={500}
          delay={500}
          useNativeDriver={true}
        >
          <Image
            style={[styles.image]}
            source={{uri}} 
            resizeMode={'cover'}
            onLoadEnd={this._handleOnLoadEnd}
          />
        </Animatable.View>
      </TouchableOpacity>
    );
  };

  render(){
    const { styles } = ImageCard;
    const { loading } = this.state;

    return(
      <View style={[STYLES.mediumShadow, styles.card]}>
        <View style={styles.cardContainer}>
          {this._renderTitle()}
          <View style={styles.loadingImageContainer}>
            {loading? this._renderLoading() : this._renderImage()}
          </View>
        </View>
      </View>
    );
  };
};

export default class ViewTipScreen extends React.Component {
  static navigationOptions = {
    title: 'View Resource',
    headerTitle,
    //custom android header
    ...Platform.select({
      android: { header: props => <AndroidHeader {...props}/> }
    }),
  };

  static styles = StyleSheet.create({
    headerCard: {
      flex: 1,
      marginTop: 0,
      marginBottom: 15,
      marginHorizontal: 0,
      paddingTop: 15,
      paddingHorizontal: 12,
      paddingBottom: 16,
      backgroundColor: 'white',
      shadowColor: 'black',
      elevation: 10,
    },
    textTitle: {
      fontSize: 24, 
      fontWeight: 'bold',
      color: '#160758',
    },
    textSubtitle: {
      fontSize: 16, 
      fontWeight: '100', 
      color: 'grey',
    },
    textBody: {
      fontSize: 18, 
      fontWeight: '300', 
      textAlign: 'justify'
    },
    textLink: {
      flex: 1,
      fontSize: 18, 
      color: BLUE[900], 
      textDecorationLine: 'underline', 
      textAlignVertical: 'center',
    },
  });

  constructor(props){
    super(props);

    const { navigation } = props;
    //get data from previous screen: TipsScreen
    const tip   = navigation.getParam('tip'  , null);
    const tips  = navigation.getParam('tips' , null);
    const index = navigation.getParam('index', null);

    //wrap inside model
    const model = new TipModel(tip);
    //check if tip has a picture uri
    const hasImage = !isEmpty(model.photouri);

    this.state = {
      tip, tips, hasImage, index,
      mountFooter: !hasImage,
    };
  };

  componentDidFocus = () => {
    const { setDrawerSwipe } = this.props.screenProps;
    setDrawerSwipe && setDrawerSwipe(false);
  };

  _handleOnLoadEnd = () => {
    this.setState({mountFooter: true});
  };

  _handleOnPressImage = ({imageBase64}) => {
    const { navigation } = this.props;
    navigation && navigation.navigate(ROUTES.ViewImageRoute, {imageBase64});
  };

  _renderHeader(){
    const { styles } = ViewTipScreen;
    const { tip } = this.state;

    //wrap inside model
    const model = new TipModel(tip);

    return(
      <View style={[STYLES.lightShadow, styles.headerCard]}>
        <Text style={styles.textTitle}>
          {model.title}
        </Text>
        <Text style={styles.textSubtitle}>
          {`Last updated on ${model.dateposted}`}
        </Text>
      </View>
    );
  };

  _renderResource(){
    const { styles } = ViewTipScreen;
    const { tip } = this.state;

    //wrap inside model
    const model = new TipModel(tip);

    return (
      <Card style={{marginBottom: 20}}>
        <IconText
          //icon
          iconName={'info'}
          iconType={'feather'}
          iconColor={'#512DA8'}
          iconSize={24}
          //title
          text={'Resource'}
          textStyle={styles.textTitle}
        />
        <Divider style={{margin: 10}}/>   
        <Text style={styles.textBody} numberOfLines={4}>
          {model.tip}
        </Text>
      </Card>
    );
  };

  _renderImage(){
    const { hasImage, tip } = this.state;
    if(!hasImage) return null;

    //wrap inside model
    const model = new TipModel(tip);

    return(
      <ImageCard 
        fileURI={model.photouri}
        onLoadEnd={this._handleOnLoadEnd}
        onPressImage={this._handleOnPressImage}
      />
    );
  };

  render(){
    const { mountFooter } = this.state;
    
    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <ScrollView
          //adjust top distance
          contentInset ={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
        >
          <AnimateInView duration={500}>
            {this._renderHeader  ()}
            {this._renderResource()}
            {this._renderImage   ()}
            {mountFooter && <IconFooter hide={false} animateIn={false}/>}
          </AnimateInView>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};