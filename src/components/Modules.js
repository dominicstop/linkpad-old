import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, Dimensions, FlatList, TouchableOpacity, ViewPropTypes, Platform } from 'react-native';

import { IconText  , AnimatedListItem } from './Views';
import { colorShift , timeout} from '../functions/Utils';
import { ModuleItemModel, SubjectItem } from '../models/ModuleModels';

import _ from 'lodash';
import * as Animatable from 'react-native-animatable';
import Carousel from 'react-native-snap-carousel';
import { NumberIndicator } from './StyledComponents';
import { FONT_NAMES } from '../Constants';
import { GREY } from '../Colors';


export const subjectProps = {
  subjectID  : PropTypes.string,
  subjectName: PropTypes.string,
  subjectDesc: PropTypes.string,
};

export const moduleProps = {
  indexid: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  modulename : PropTypes.string,
  description: PropTypes.string,
  subjects   : PropTypes.array ,
};

//subject title and desc 
export class SubjectDetails extends React.PureComponent {
  static propTypes = {
    subjectData: PropTypes.object,
    numberOfLinesDesc: PropTypes.number,
    onPress: PropTypes.func,
    containerStyle: ViewPropTypes.style,
  }

  static styles = StyleSheet.create({
    title: {

    },
    description: {
      flex: 1, 
      textAlign: 'justify',
      ...Platform.select({
        ios: {
          marginTop: 1,
          fontWeight: '200',
        },
        android: {
          marginTop: -1,
          fontWeight: '100',
        },
      }),
    },
  });

  _handleOnPress = () => {
    const { onPress } = this.props;
    onPress && onPress(subjectData);
  };

  render() {
    const { styles } = SubjectDetails;
    const { subjectData, containerStyle, numberOfLinesDesc } = this.props;

    const subjectname = subjectData.subjectname || "Unknown Subject";
    const description = subjectData.description || "Description not available";

    const sharedTextProps = {
      ellipsizeMode: 'tail', 
      lineBreakMode: 'tail',
    };

    return(
      <TouchableOpacity 
        style={[{flex: 1,}, containerStyle]} 
        onPress={this._handleOnPress}
        activeOpacity={0.7}
      >
        <Text style={styles.title} numberOfLines={1} {...sharedTextProps}>
          {subjectname}
        </Text>
        <Text style={styles.description} numberOfLines={numberOfLinesDesc} {...sharedTextProps}>
          {description}
        </Text>
      </TouchableOpacity>
    );
  }
};

//shows a single subject card and holds SubjectDetails and SubjectProgess
export class SubjectListItem extends React.PureComponent {
  static propTypes = {
    subjectData: PropTypes.shape(subjectProps),
    height: PropTypes.number,
    numberOfLinesDesc: PropTypes.number,
    showDetails: PropTypes.bool,
    //callbacks
    onPressSubject: PropTypes.func,
    //styles
    containerStyle: ViewPropTypes.style,
  };

  static defaultProps = {
    showDetails: false,
    height: Platform.select({ios: 165, android: 150}),
  };

  static styles = StyleSheet.create({
    title: {
      fontWeight: '500',
      fontSize: 21,
      color: '#161616',
    },
    description: {
      fontSize: 16,
      ...Platform.select({
        ios: {
          marginTop: 2,    
          textAlign: 'justify',
          fontWeight: '300',
          color: '#202020',
        },
        android: {
          marginTop: -1, 
          fontWeight: '100',
          color: GREY[800],
        },
      }),
    },
    detail: Platform.select({
      ios: {
        fontSize: 20,
        fontWeight: '300',
        color: 'rgba(0, 0, 0, 0.60)'
      },
      android: {
        fontSize: 18,
        fontWeight: '100',
        color: 'grey'
      }
    }),
    wrapper: Platform.select({
      ios: {
        paddingTop: 10, 
        paddingBottom: 35,
        paddingHorizontal: 12,
        shadowColor: '#686868', 
        shadowOpacity: 0.5, 
        shadowRadius: 5,
        shadowOffset: {  
          width: 4,
          height: 5
        }, 
      },
      android: {
        flex: 1, 
        paddingTop: 6, 
        paddingLeft: 7, 
        paddingRight: 9, 
        paddingBottom: 15,
      }
    }),
    container: Platform.select({
      ios: {
        flex: 1, 
        borderRadius: 15, 
        flexDirection: 'row', 
        paddingHorizontal: 20, 
        paddingVertical: 15, 
        backgroundColor: 'white',
        overflow: 'hidden',
      },
      android: {
        flex: 1, 
        elevation: 9, 
        borderRadius: 15, 
        paddingHorizontal: 15, 
        paddingVertical: 10, 
        backgroundColor: 'white'
      }
    }),
  });

  _handleOnPress = () => {
    const { subjectData, onPressSubject } = this.props;
    onPressSubject && onPressSubject(subjectData);
  };

  _onPressSubject = () => {
    const { onPressSubject, subjectData, moduleData } = this.props;
    //pass subject data as param to callback
    onPressSubject(subjectData, moduleData);
  };

  _renderDetails(){
    const { styles } = SubjectListItem;
    const { subjectData, showDetails } = this.props;
    if(!showDetails) return null;

    const model = new SubjectItem(subjectData);
    const { lastupdated } = model.get();
    const questionCount = model.getQuestionLength();

    return(
      <View style={{flexDirection: 'row', marginBottom: 2}}>
        <Text style={styles.detail}>{`${questionCount} items `}</Text>
        <Text style={styles.detail}>{` (Updated: ${lastupdated})`}</Text>
      </View>
    );
  };

  _renderDescription(){
    const { styles } = SubjectListItem;
    const { subjectData, numberOfLinesDesc } = this.props;

    const description = subjectData.description || "No description available.";

    return(
      <TouchableOpacity
        style={{flex: 1}}
        onPress={this._handleOnPress}
        activeOpacity={0.7}
      >
        <Text 
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode={'tail'} 
          lineBreakMode={'tail'}
        >
          {subjectData.subjectname}
        </Text>
        {this._renderDetails()}
        <Text 
          style={styles.description} 
          numberOfLines={numberOfLinesDesc}
          ellipsizeMode={'tail'} 
          lineBreakMode={'tail'}
        >
          {description}
        </Text>
      </TouchableOpacity>
    );
  };

  render() {
    const { styles } = SubjectListItem;
    const { height, wrapperStyle, containerStyle } = this.props;

    return(
      <View style={[{height}, styles.wrapper, wrapperStyle]}>
        <View style={[styles.container, containerStyle]}>
          {this._renderDescription()}
        </View>
      </View>
    );
  };
};

//displays a single module item and a list of subjects
export class ModuleItem extends React.PureComponent {
  static propTypes = {
    modules: PropTypes.array,
    moduleData: PropTypes.object,
    numberOfLinesDesc: PropTypes.number,
    //callbacks
    onPressSubject: PropTypes.func,
    onPressModule : PropTypes.func,
  };

  static defaultProps = {
    numberOfLinesDesc: 3
  };

  static styles = StyleSheet.create({
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    numberIndicator: {
      marginRight: 5,
    },
    title: {
      flex: 1,
      color: '#150a44',
      ...Platform.select({
        ios: {
          fontSize: 24,
          fontWeight: '700',
        },
        android: {
          fontSize: 24,
          fontFamily: FONT_NAMES.barlow_semicondensed_semi_bold,
        }
      }),
    },
    subtitle: Platform.select({
      ios: {
        fontSize: 22,
        color: '#202020'
      },
      android: {
        marginTop: -3,
        fontSize: 18,
        fontWeight: '100',
        color: '#424242'
      }
    }),
    column: {
      flex: 1,
    },
    detail: {
      fontSize: 16,
      fontWeight: '100',
      color: 'grey'
    },
    description: {
      fontSize: 18,
      ...Platform.select({
        ios: {
          fontWeight: '200',
          textAlign: 'justify',    
        },
        android: {
          marginTop: -2,
          fontWeight: '100',
          color: GREY[900],
        },
      })
    },
  });

  _onPressModule = () => {
    const { modules, moduleData, onPressModule } = this.props;
    onPressModule && onPressModule(modules, moduleData);
  };

  _handleOnPressSubject = (subjectData) => {
    const { modules, moduleData, onPressSubject } = this.props;
    onPressSubject && onPressSubject(subjectData, moduleData);
  }

  _renderHeader(){
    const { styles } = ModuleItem;
    const { moduleData, index } = this.props;

    const modulename  = moduleData.modulename  || 'Unknown Module';
    const description = moduleData.description || 'No description';
    const lastupdated = moduleData.lastupdated || 'No Date';

    return(
      <TouchableOpacity 
        style={{paddingHorizontal: 12}} 
        onPress={this._onPressModule}
      >
        <View style={styles.titleContainer}>
          <NumberIndicator 
            value={(index || 0) + 1}
            containerStyle={styles.numberIndicator}
          />
          <Text style={styles.title} numberOfLines={1}>
            {modulename}
          </Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
          {`Updated on: ${lastupdated}`}
        </Text>
      </TouchableOpacity>
    );
  };

  //renders a single subject item
  _renderItem = ({item, index}) => {
    const { modules, moduleData } = this.props;
    return(
      <SubjectListItem 
        subjectData={item}
        numberOfLinesDesc={this.props.numberOfLinesDesc}
        onPressSubject={this._handleOnPressSubject}
        //pass down props
        {...{modules, moduleData}}
      />
    );
  };

  render() {
    const { moduleData } = this.props;
    const data = _.compact(moduleData.subjects);

    //ui values
    const sliderWidth = Dimensions.get('window').width;
    const platformSpecificProps = Platform.select({
      ios: {
        layout: 'tinder',
        activeSlideAlignment: 'center',
        itemWidth: sliderWidth - 20,
        enableSnap: true,
        layoutCardOffset: 10,
      },
      android: {
        layout: 'default',
        activeSlideAlignment: 'start',
        itemWidth: sliderWidth - 50,
        enableSnap: true,
        inactiveSlideShift: 0,
        inactiveSlideOpacity: 0.9,
        inactiveSlideScale: 1,
        containerCustomStyle: { paddingLeft: 0 },
      }
    });

    return(
      <View style={{justifyContent: 'center', marginBottom: 5}}>
        {this._renderHeader()}
        <Carousel
          ref={r => this._carousel = r }
          renderItem={this._renderItem}
          activeSlideAlignment={'center'}
          removeClippedSubviews={false}
          {...{data, sliderWidth, ...platformSpecificProps}}
        />
      </View>
    );
  };
};

//displays the list of modules
export class ModuleList extends React.PureComponent {
  static propTypes = {
    modules: PropTypes.arrayOf(
      PropTypes.shape(moduleProps)
    ).isRequired,
    //callbacks
    onPressSubject: PropTypes.func,
    onPressModule : PropTypes.func,
  };

  _renderItem = ({item, index}) => {
    const { modules, onPressModule, onPressSubject } = this.props;
    const animation = Platform.select({
      ios    : 'fadeInUp', 
      android: 'fadeInRight'
    });

    return(
      <AnimatedListItem
        delay={250}
        duration={400}
        multiplier={200}
        {...{animation, index}}
      >
        <ModuleItem
          moduleData={item}
          numberOfLinesDesc={3}
          //pass down props
          {...{modules, onPressModule, onPressSubject, index}}
        />
      </AnimatedListItem>
    );
  }

  render(){
    const { modules, containerStyle, ...flatListProps} = this.props;
    return(
      <FlatList
        data={_.compact(modules)}
        ref={r => this.flatlist = r}
        keyExtractor={(item) => item.indexid + ''}
        renderItem ={this._renderItem }
        ListFooterComponent={this._renderFooter}
        removeClippedSubviews={false}
        {...flatListProps}
      />
    );
  }
};

export class SubjectList extends React.Component {
  static propTypes = {
    //extra props
    modules   : PropTypes.array ,
    moduleData: PropTypes.object,
    //callbacks
    onPressSubject: PropTypes.func,
    //style
    containerStyle: ViewPropTypes.style,
  };

  static styles = StyleSheet.create({
    wrapper: {
      height: null,
      ...Platform.select({
        ios: {
          paddingTop: 5, 
          paddingBottom: 10, 
        },
        android: {
          paddingTop: 7, 
          paddingBottom: 8,
        }
      })
    },
    container: Platform.select({
      android: { elevation: 5 }
    }),
  });

  //only receives subject data
  _handleOnPressSubject = (subjectData) => {
    const { onPressSubject, moduleData } = this.props;
    onPressSubject && onPressSubject(subjectData, moduleData);
  }
  
  _renderItem = ({item, index}) => {
    const { styles } = SubjectList;
    const { moduleData } = this.props;
    const animation = Platform.select({
      ios    : 'fadeInUp', 
      android: 'fadeInLeft'
    });

    return(
      <AnimatedListItem
        delay={0}
        duration={300}
        multiplier={100}
        {...{animation, index}}
      >
        <SubjectListItem
          showDetails={true}
          wrapperStyle={styles.wrapper}
          containerStyle={styles.container}
          numberOfLinesDesc={6}
          subjectData={item}
          onPressSubject={this._handleOnPressSubject}
          //pass dowm props
          {...{moduleData, index}}
        />
      </AnimatedListItem>
    );
  }

  render(){
    const { moduleData, containerStyle, ...flatListProps} = this.props;
    const data = _.compact(moduleData.subjects);
    return(
      <FlatList
        {...{data}}
        keyExtractor={(item) => item.indexid + ''}
        renderItem ={this._renderItem }
        removeClippedSubviews={true}
        {...flatListProps}
      />
    );
  }
};