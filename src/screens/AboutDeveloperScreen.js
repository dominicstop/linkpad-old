
import React, { Fragment } from 'react';
import { View, ScrollView, Platform,StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';

import { AnimateInView, Card } from '../components/Views';


import Starfield from '../components/Starfield';
import * as Animatable from 'react-native-animatable';
import { Avatar, Icon } from 'react-native-elements';

export class AboutDeveloperScreen extends React.Component {
  static navigationOptions = {
    //disable header
    header: null,
  };

  static styles = StyleSheet.create({
    bgContainer: {
      width: '100%', 
      height: '100%', 
      position: 'absolute',
    },
    bigTitle: {
      fontSize: 64,
      fontWeight: '900',
      color: 'white',
      elevation: 50,
    },
    card: {
      flex: 1, 
      flexDirection: 'row', 
      marginTop: 30, 
      padding: 15,
      paddingVertical: 20,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '900'
    },
    cardSubtitle: {
      fontSize: 18,
      fontWeight: '100'
    }
  });

  constructor(props){
    super(props);

    this.state = {
      mount: false,
    };
  };

  componentDidMount(){
    //delay rendering
    setTimeout(() => this.setState({mount: true}), 500);
  };

  _renderBG(){
    const { styles } = AboutDeveloperScreen;

    if(!this.state.mount) return null;

    return(
      <Animatable.View
        style={styles.bgContainer}
        animation={'fadeIn'}
        duration={1500}
        useNativeDriver={true}
      >
        <Starfield/>
      </Animatable.View>
    );
  };

  _renderJude(){
    const { styles } = AboutDeveloperScreen;

    return(
      <Animatable.View
        animation={'pulse'}
        easing={'ease-in-out'}
        iterationCount={'infinite'}
        duration={5000}
        delay={2000}
        useNativeDriver={true}
      >
        <Card style={styles.card}>
          <Avatar
            large rounded
            source={require('../../assets/icons/jude.jpg')}
          />
          <View style={{flex: 1, marginLeft: 15}}>
            <Text style={styles.cardTitle   }>Jude Dominic Caacbay</Text>
            <Text style={styles.cardSubtitle}>@jdcaacbay</Text>
          </View>
        </Card>
      </Animatable.View>
    );
  };

  _renderDomi(){
    const { styles } = AboutDeveloperScreen;

    return(
      <Animatable.View
        animation={'pulse'}
        easing={'ease-in-out'}
        iterationCount={'infinite'}
        duration={5000}
        delay={2000}
        useNativeDriver={true}
      >
        <Card style={styles.card}>
          <Avatar
            large rounded
            source={require('../../assets/icons/dominic.jpg')}
          />
          <View style={{flex: 1, marginLeft: 15}}>
            <Text style={styles.cardTitle   }>Dominic Go</Text>
            <Text style={styles.cardSubtitle}>@dominicstop</Text>
          </View>
        </Card>
      </Animatable.View>
    );
  };

  _renderFooter(){
    return (
      <Animatable.View
        style={{marginTop: 15, marginBottom: 75}}
        animation={'pulse'}
        duration={1000}
        easing={'ease-in-out'}
        delay={3000}
        iterationCount={'infinite'}
        useNativeDriver={true}
      >
        <Icon
          name={'heart'}
          type={'entypo'}
          color={'white'}
          size={24}
        />
      </Animatable.View>
    );
  };

  _renderFG(){
    const { styles } = AboutDeveloperScreen;

    return(
      <ScrollView style={{padding: 15}}>
        <View style={{marginTop: 100}}/>
        <AnimateInView duration={500} delay={1000}>
          <Text style={styles.bigTitle}>Made</Text>
          <Text style={styles.bigTitle}>With</Text>
          <Text style={styles.bigTitle}>Love By</Text>
          {this._renderJude  ()}
          {this._renderDomi  ()}
          {this._renderFooter()}
        </AnimateInView>
      </ScrollView>
    );
  };

  render(){
    const { styles } = AboutDeveloperScreen;

    return (
      <Animatable.View
        style={{flex: 1, backgroundColor: '#0e0244'}}
        animation={'fadeIn'}
        duration={750}
        useNativeDriver={true}
      >
        {this._renderBG()}
        {this._renderFG()}
      </Animatable.View>
    );
  };
};