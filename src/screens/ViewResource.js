import React from 'react';
import { Text, View, Platform, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';

import { ViewWithBlurredHeader, IconText, Card, AnimateInView, IconFooter } from '../components/Views';
import { AndroidHeader } from '../components/AndroidHeader';
import { CustomHeader } from '../components/Header' ;

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import { Header, NavigationEvents  } from 'react-navigation';

import {plural} from '../functions/Utils';
import { ResourceModel } from '../functions/ResourcesStore';
import { Divider } from 'react-native-elements';

const ViewResourceHeader = (props) => <CustomHeader {...props}/>

export default class ViewResourceScreen extends React.Component {
  static navigationOptions = {
    title: 'View Resource',
    headerTitle: ViewResourceHeader,
    //custom android header
    ...Platform.select({
      android: { header: props => <AndroidHeader {...props}/> }
    }),
  };

  static styles = StyleSheet.create({
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
      color: 'blue', 
      textDecorationLine: 'underline', 
      textAlignVertical: 'center',
    },
  });

  constructor(props){
    super(props);

    const { navigation } = props;
    //get data from previous screen: ResourcesScreen
    const resource  = navigation.getParam('resource' , null);
    const resources = navigation.getParam('resources', null);

    this.state = {
      resource, resources
    };

  };

  componentDidFocus = () => {
    const { setDrawerSwipe } = this.props.screenProps;
    setDrawerSwipe(false);
  };

  _handleTitleOnPress = () => {
    return
    const { navigation } = this.props;
    //extract details
    const moduleData = navigation.getParam('moduleData', null);
    const model = new ModuleItemModel(moduleData);
    const { modulename } = model.module;
    //show full title
    Alert.alert('Resource Title', modulename);
  }

  _renderHeaderTitle(){
    return
    const { styles } = ViewResourceScreen;
    const { navigation } = this.props;
    //extract details
    const moduleData = navigation.getParam('moduleData', null);
    const model = new ModuleItemModel(moduleData);
    const { modulename } = model.module;
    
    return(
      <TouchableOpacity onPress={this._handleTitleOnPress}>
        <IconText
          //icon
          iconName={'info'}
          iconType={'feather'}
          iconColor={'#512DA8'}
          iconSize={24}
          //title
          text={modulename}
          textStyle={styles.title}
        />
      </TouchableOpacity>
    );
  }

  _renderHeader(){
    const { styles } = ViewResourceScreen;
    const { resource } = this.state;

    //wrap inside model
    const model = new ResourceModel(resource);

    return(
      <Card>
        <Text style={styles.textTitle}>
          {model.title}
        </Text>
        <Text style={styles.textSubtitle}>
          {`Last updated on ${model.dateposted}`}
        </Text>
        <Divider style={{margin: 10}}/>  
        <IconText
          //icon
          iconName={'globe'}
          iconType={'simple-line-icon'}
          iconColor={'#512DA8'}
          iconSize={22}
          //title
          text={model.link}
          textStyle={styles.textLink}
        />
      </Card>
    );
  };

  _renderResource(){
    const { styles } = ViewResourceScreen;
    const { resource } = this.state;

    //wrap inside model
    const model = new ResourceModel(resource);

    return (
      <Card style={{marginBottom: 20}}>
        <IconText
          //icon
          iconName={'info'}
          iconType={'feather'}
          iconColor={'#512DA8'}
          iconSize={24}
          //title
          text={'Description'}
          textStyle={styles.textTitle}
        />
        <Divider style={{margin: 10}}/>   
        <Text style={styles.textBody} numberOfLines={4}>
          {model.description}
        </Text>
      </Card>
    );
  };

  render(){
    const offset = Header.HEIGHT;
    
    return(
      <ViewWithBlurredHeader hasTabBar={false}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        <ScrollView
          //adjust top distance
          contentInset ={{top: offset}}
          contentOffset={{x: 0, y: -offset}}
          //extra top distance
          contentContainerStyle={{ paddingTop: 12 }}
        >
          <AnimateInView duration={500}>
            {this._renderHeader  ()}
            {this._renderResource()}
            <IconFooter 
              hide={false}
              animateIn={false}
            />
          </AnimateInView>
        </ScrollView>
      </ViewWithBlurredHeader>
    );
  };
};