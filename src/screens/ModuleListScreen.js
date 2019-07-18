import React from 'react';
import { StyleSheet, Text, View, Platform, RefreshControl } from 'react-native';
import PropTypes from 'prop-types';

import { HEADER_HEIGHT, FONT_STYLES } from '../Constants';
import { ModulesLastUpdated } from '../functions/MiscStore';
import { timeout, setStateAsync} from '../functions/Utils';
import { ModuleStore } from '../functions/ModuleStore';

import { ViewWithBlurredHeader, IconFooter, Card } from '../components/Views'  ;
import { ModuleList } from '../components/Modules';

import moment from 'moment';
import * as Animatable from 'react-native-animatable';
import { Header, NavigationEvents } from 'react-navigation';
import { Divider } from 'react-native-elements';
import { DetailRow, DetailColumn } from '../components/StyledComponents';


class ModulesHeader extends React.PureComponent {
  static propTypes = {
    modules: PropTypes.array,
    lastUpdated: PropTypes.number,
  };

  static styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      paddingTop: 15,
      marginBottom: 20,
      paddingHorizontal: 12,
      paddingBottom: 16,
      backgroundColor: 'white',
      shadowColor: 'black',
      elevation: 10,
      shadowRadius: 4,
      shadowOpacity: 0.4,
      shadowOffset:{
        width: 2,  
        height: 3,  
      },
    },
    image: {
      width: 75, 
      height: 75,
      marginRight: 12,
      marginVertical: 12,
    },
    headerTextContainer: {
      flex: 1, 
      justifyContent: 'center', 
    },
    divider: {
      marginHorizontal: 15,
      marginVertical: 8,
    },  
  });

  constructor(props){
    super(props);
    this.imageHeader = require('../../assets/icons/notes-pencil.png');    
  };

  _renderDetails(){
    const { styles } = ModulesHeader;
    const { modules = [], lastUpdated = 0 } = this.props;
    
    const time = lastUpdated * 1000;
    const moduleCount = modules.length || '--';

    const timeText = (lastUpdated
      ? moment(time).fromNow()
      : 'N/A'
    );

    return(
      <DetailRow>
        <DetailColumn
          title={'Modules'}
          subtitle={`${moduleCount} items`}
          help={true}
          helpTitle={'Module Count'}
          helpSubtitle={'Number of modules available.'}
          disableGlow={true}
        />
         <DetailColumn
          title={'Updated'}
          subtitle={timeText}
          help={true}
          helpTitle={'Time Updated'}
          helpSubtitle={'When was the module list last refreshed.'}
          disableGlow={true}
        />
      </DetailRow>
    );
  };

  render(){
    const { styles } = ModulesHeader;
    
    const animation = Platform.select({
      ios    : 'fadeInUp',
      android: 'fadeInRight',
    });

    return(
      <Animatable.View
        style={styles.card}
        duration={400}
        easing={'ease-in-out'}
        useNativeDriver={true}
        {...{animation}}
      >
        <Animatable.Image
          source={this.imageHeader}
          style={styles.image}
          animation={'pulse'}
          easing={'ease-in-out'}
          iterationCount={"infinite"}
          duration={5000}
          useNativeDriver={true}
        />
        <View style={styles.headerTextContainer}>
          <Text style={FONT_STYLES.cardTitle}>
            {'Available Modules'}
          </Text>
          <Text style={FONT_STYLES.cardSubtitle}>
            {'Each module contains several subjects with related topics. Choose a subject and start learning.'}
          </Text>
          <Divider style={styles.divider}/>
          {this._renderDetails()}
        </View>
      </Animatable.View>
    );
  };
};

//show a list of modules
export class ModuleListScreen extends React.Component {
  static styles = StyleSheet.create({

  });
  
  constructor(props){
    super(props);

    const lastUpdated = ModulesLastUpdated.get();

    this.state = {
      modules: [], 
      refreshing: false,
      mount: false,
      mountFooter: false,
      lastUpdated,
    };
  };

  componentDidFocus = () => {
    //TODO: fix later
    return;
    //enable drawer when this screen is active
    const { setDrawerSwipe, getRefSubjectModal } = this.props.screenProps;
    setDrawerSwipe(true);

    //close the modal if it's open
    let modal = getRefSubjectModal();
    const isModalVisible = modal.isModalVisible();

    if(isModalVisible){
      modal.loadPracticeExams();
    };
  };

  componentDidMount = async () => {
    //delay rendering
    setTimeout(() => { this.setState({mount: true}) }, 500);

    //get modules from storage
    let modules = await ModuleStore.get();
    //get lastupdated from store
    const lastUpdated = ModulesLastUpdated.get();

    this.setState({modules, lastUpdated});
  };

  _onRefresh = async () => {
    await setStateAsync(this, {refreshing: true });

    let result = await Promise.all([
      ModuleStore       .refresh     (),
      ModulesLastUpdated.setTimestamp(),
      //avoid flicker
      timeout(1000),
    ]);

    await setStateAsync(this, {
      refreshing : false, 
      modules    : result[0],
      lastUpdated: result[1],
    });
  };

  _navigateToModule = (modules, moduleData) => {
    this.props.navigation.navigate('SubjectListRoute', {
      modules, moduleData
    });
  };

  _onPressSubject = (subjectData, moduleData) => {
    const { getRefSubjectModal, setDrawerSwipe } = this.props.screenProps;
    const { modalClosedCallback, modalOpenedCallback } = getRefSubjectModal();

    //set callbacks for modal when opened/closed
    if(!modalClosedCallback) getRefSubjectModal().modalClosedCallback = () => setDrawerSwipe(true );
    if(!modalOpenedCallback) getRefSubjectModal().modalOpenedCallback = () => setDrawerSwipe(false);

    getRefSubjectModal().openSubjectModal(moduleData, subjectData);
  };

  _handleOnEndReached = () => {
    this.footer.show();
  };

  _renderRefreshCotrol(){
    const { refreshing } = this.state;
    const prefix = refreshing? 'Checking' : 'Pull down to check';
    return(
      <RefreshControl 
        onRefresh={this._onRefresh}
        title={prefix + ' for changes...'}
        {...{refreshing}}
      />
    );
  };

  _renderHeader = () => {
    const { modules, lastUpdated } = this.state;
    return(
      <ModulesHeader {...{modules, lastUpdated}}/>
    );
  };

  _renderFooter = () => {
    return(
      <View style={{marginBottom: 75}}>
        <IconFooter ref={r => this.footer = r}/>
      </View>
    );
  };

  render(){
    const { modules } = this.state;
    
    const flatListProps = {
      //adjust top distance
      contentInset: {top: HEADER_HEIGHT},
      contentOffset: {x: 0, y: -HEADER_HEIGHT},
      //onEndReached callback not fired when on android
      onEndReachedThreshold: Platform.select({
        ios    : 0  ,
        android: 0.1,
      }),
    };

    return(
      <ViewWithBlurredHeader hasTabBar={true}>
        <NavigationEvents onDidFocus={this.componentDidFocus}/>
        {modules && <ModuleList
          modules={modules || []}
          onPressModule ={this._navigateToModule}
          onPressSubject={this._onPressSubject}
          onEndReached={this._handleOnEndReached}
          refreshControl={this._renderRefreshCotrol()}
          ListHeaderComponent={this._renderHeader}
          ListFooterComponent={this._renderFooter}
          {...flatListProps}
        />}
      </ViewWithBlurredHeader>
    );
  };
};
