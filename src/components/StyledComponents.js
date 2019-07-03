import React, { Component, Fragment } from 'react';
import { StyleSheet, View, Text, Platform, TouchableOpacity, Alert, Dimensions, ScrollView } from 'react-native';
import PropTypes from 'prop-types';

import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { isIphoneX, getBottomSpace } from 'react-native-iphone-x-helper';
import { Icon, } from 'react-native-elements';

import { FONT_STYLES, FONT_NAMES, STYLES } from '../Constants';
import { PURPLE, GREY, RED, BLUE, INDIGO } from '../Colors';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from './SwipableModal';
import { IconButton } from './Buttons';
import { ContentExpander } from './Expander';
import PlatformTouchable from './Touchable';

import Animated, { Easing } from 'react-native-reanimated';
import { setStateAsync } from '../functions/Utils';

const { Value, interpolate, concat, timing } = Animated;
const Screen = {
  width : Dimensions.get('window').width ,
  height: Dimensions.get('window').height,
};

/** renders View on android */
export const BlurViewWrapper = (props) => {
  const { children, ...otherProps } = props;
  return Platform.select({ 
    ios: (
      <BlurView
        intensity={100}
        tint={'default'}
        style={props.wrapperStyle}
        {...otherProps}
      >
        <View style={props.containerStyle}>{children}</View>
      </BlurView>
    ), 
    android: (
      <View 
        style={[props.wrapperStyle, props.containerStyle]} 
        {...otherProps}
      >
        {children}
      </View>
    ),
  });
};

/**
 * styled sticky header component
 * @augments {Component<{ title:string, subtitle:string, iconName:string, containerStyle:object, iconContainer:object>}
 */
export class StickyHeader extends React.PureComponent {
  static propTypes = {
    title   : PropTypes.string,
    subtitle: PropTypes.string,
    //components
    renderRightComponent: PropTypes.func,
    //icon props
    iconName: PropTypes.string,
    iconType: PropTypes.string,
    //styles
    containerStyle: PropTypes.object,
    iconContainer : PropTypes.object,
  };

  static styles = StyleSheet.create({
    wrapper: {
      ...Platform.select({
        ios: {
          
        },
        android: {
          borderWidth: 0.75,
          borderColor: GREY[200],
        },
      }),
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      ...Platform.select({
        ios: {
          borderTopWidth: 0.5,
          borderBottomWidth: 0.5,
          borderColor: GREY[100],
          backgroundColor: 'rgba(255,255,255,0.7)'
        },
        android: {
          backgroundColor: PURPLE[25],
        },
      }),
    },
    textContainer: {
      flex: 1,
      marginLeft: 8,
    },
    title: {
      ...FONT_STYLES.heading6,
      color: PURPLE[900],
      ...Platform.select({
        ios: {
          fontWeight: '600',
        },
        android: {
          fontWeight: '500',
        },
      }),
    },
    subtitle: {
      ...FONT_STYLES.subtitle1,  
      ...Platform.select({
        ios: {
          fontWeight: '100'
        },
      }),    
    },
  });

  render(){
    const { styles } = StickyHeader;
    const { renderRightComponent } = this.props;
    const props = this.props;

    return(
      <BlurViewWrapper 
        wrapperStyle={styles.wrapper}
        containerStyle={[styles.container, props.containerStyle]}
      >
        <Animatable.View
          animation={'pulse'}
          iterationCount={'infinite'}
          iterationDelay={1000}
          duration={1000 * 5}
          useNativeDriver={true}
        >
          <Icon
            containerStyle={props.iconContainer}
            name={props.iconName}
            type={props.iconType}
            color={PURPLE.A700}
            size={24}
          />
        </Animatable.View>
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.title   }>{props.title    }</Text>
          <Text numberOfLines={1} style={styles.subtitle}>{props.subtitle }</Text>
        </View>
        {renderRightComponent && renderRightComponent()}
      </BlurViewWrapper>
    );
  };
};

/** 
 * wraps each children inside a column 
 * @augments {Component<{ containerStyle:object, column:object }>}
 */
export class DetailRow extends React.PureComponent {
  static propTypes = {
    //styles
    containerStyle: PropTypes.object,
    column: PropTypes.object,
  }; 

  static styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
    },
    column: {
      flex: 1,
    },
  });

  _renderContent(){
    const { styles } = DetailRow;
    const props = this.props;

    return React.Children.map(props.children, (child) => 
      <View style={[styles.column, props.column]}>
        {child}
      </View>
    );
  };

  render(){
    const { styles } = DetailRow;
    const props = this.props;

    const containerStyle = {
      marginTop: props.marginTop,
    };

    return (
      <View style={[styles.container, props.containerStyle, containerStyle]}>
        {this._renderContent()}
      </View>
    );
  };
};

/** 
 * wraps each children inside a column 
 * @augments {Component<{ title:string, subtitle:string, titleStyle:object, subtitleStyle:object }>}
 */
export class DetailColumn extends React.PureComponent {
  static propTypes = {
    title   : PropTypes.string,
    subtitle: PropTypes.string,
    //options
    help        : PropTypes.bool,
    helpTitle   : PropTypes.string,
    helpSubtitle: PropTypes.string,
    disableGlow : PropTypes.bool,
    //styles
    titleStyle   : PropTypes.object,
    subtitleStyle: PropTypes.object,
  }; 

  static styles = StyleSheet.create({
    title: {
      ...FONT_STYLES.detailTitle,  
      color: 'black',
      fontWeight: '500',
    },
    subtitleContainer: {
      marginTop: 3,
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 3.75,
      backgroundColor: PURPLE.A700,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: PURPLE.A700, 
          shadowRadius: 7, 
          shadowOpacity: 0.2,
          shadowOffset:{  
            width: 1,  
            height: 4,  
          }, 
        },
      }),
    },
    subtitle: {
      ...FONT_STYLES.detailSubtitle,
      fontSize: 18,
      color: 'white',
      ...Platform.select({
        ios: {
          fontWeight: '200',
          shadowColor: 'white', 
          shadowRadius: 7, 
          shadowOpacity: 0.4,
          shadowOffset:{  
            width: 1,  
            height: 4,  
          }, 
        },
        android: {
        },
      }),
    },
    noGlow: {
      shadowRadius: 0, 
      shadowOpacity: 0,
      shadowOffset:{  
        width: 0,  
        height: 0,  
      }, 
    },
  });

  _handleOnPress = () => {
    const props = this.props;
    Alert.alert(
      props.helpTitle    || 'Help Info',
      props.helpSubtitle || 'Info N/A' ,
    );
  };

  _renderSubtitle(){
    const { styles } = DetailColumn;
    const props = this.props;

    const childrenCount = React.Children.count(props.children);
    const hasChildren = (childrenCount > 0);

    return hasChildren? (
      props.children
    ):(
      <Text 
        style={[styles.subtitle, props.subtitleStyle]}
        numberOfLines={1}
      >
        {props.subtitle}
      </Text>
    );
  };

  render(){
    const { styles } = DetailColumn;
    const props = this.props;

    const { backgroundColor } = props;
    const subtitleContainerStyle = {
      ...(backgroundColor && {
        backgroundColor,
        ...Platform.select({
          ios: {
            shadowColor: backgroundColor,
          },
        }),
      }),
      ...(props.disableGlow && styles.noGlow),
    };

    return props.help? (
      <TouchableOpacity 
        onPress={this._handleOnPress}
        activeOpacity={0.75}
      >
        <Text 
          style={[styles.title, props.titleStyle]}
          numberOfLines={1} 
        >
          {props.title}
        </Text>
        <View style={[styles.subtitleContainer, subtitleContainerStyle]}>
          {this._renderSubtitle()}
        </View>
      </TouchableOpacity>
    ):(
      <Fragment>
        <Text 
          style={[styles.title, props.titleStyle]}
          numberOfLines={1}
        >
          {props.title}
        </Text>
        <View style={[styles.subtitleContainer, subtitleContainerStyle]}>
          {this._renderSubtitle()}
        </View>
      </Fragment>
    );
  };
};

export class NumberIndicator extends React.PureComponent {
  static propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    suffix: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    //styles and appearance props
    size          : PropTypes.number,
    color         : PropTypes.string,
    containerStyle: PropTypes.object,
    textStyle     : PropTypes.object,
    adjustFontSize: PropTypes.bool  ,
    initFontSize  : PropTypes.number,
    diffFontSize  : PropTypes.number,
  };

  static defaultProps = {
    size          : 22         ,
    color         : PURPLE.A700,
    adjustFontSize: true       ,
    initFontSize  : 15         ,
    diffFontSize  : 2          ,
  };

  static styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: 'white',
      textAlign: 'center',
      ...Platform.select({
        ios: {
          fontWeight: '500',
        },
        android: {
          fontWeight: '800',          
        },
      }),
    },
  });

  render(){
    const { styles } = NumberIndicator;
    const { size, value, suffix, color, initFontSize, diffFontSize, adjustFontSize } = this.props;
    
    const length = (value + '').length - 1;
    const textStyle = {
      ...(adjustFontSize && {
        fontSize: initFontSize - (diffFontSize * length)
      }),
    };

    const containerStyle = {
      width : size,
      height: size,
      borderRadius   : size/2,
      backgroundColor: color,
    };

    return (
      <View style={[styles.container, containerStyle, this.props.containerStyle]}>
        <Text 
          numberOfLines={1}
          style={[styles.text, textStyle, this.props.textStyle]}
        >
          {value + (suffix || '')}
        </Text>
      </View>
    );
  };
};

/** 
 * renders 2 buttons that is usually used on the bottom of a modal
 * @augments {Component<{leftText:string, rightText:string, iconSize: number, iconColor: string, leftIconName:string, leftIconType:string, rightIconName:string, rightIconType:string, onPressLeft:func, onPressRight:func, containerStyle:object, buttonTextStyle:object, leftButtonStyle:object, rightButtonStyle:object, buttonProps:object}>}
 */
export class ModalBottomTwoButton extends React.PureComponent {
  static propTypes = {
    leftText : PropTypes.string,
    rightText: PropTypes.string,
    //icon props
    iconSize     : PropTypes.number,
    iconColor    : PropTypes.string,
    leftIconName : PropTypes.string,
    leftIconType : PropTypes.string,
    rightIconName: PropTypes.string,
    rightIconType: PropTypes.string,
    //events
    onPressLeft : PropTypes.func,
    onPressRight: PropTypes.func,
    //styles
    containerStyle  : PropTypes.object,
    buttonTextStyle : PropTypes.object,
    leftButtonStyle : PropTypes.object,
    rightButtonStyle: PropTypes.object,
    //extra props
    buttonProps: PropTypes.object,
  }; 

  static defaultProps = {
    iconSize     : 24,
    iconColor    : 'white',
    leftIconName : 'pencil-square-o',
    leftIconType : 'font-awesome',
    rightIconName: 'close',
    rightIconType: 'simple-line-icon',
  };

  static styles = (() => {
    const borderRadius = isIphoneX? 17 : 10;
    
    return StyleSheet.create({
      container: {
        flex: 1,
        flexDirection: 'row',
      },
      //button styles
      buttonContainer: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      buttonText: {
        flex: 0,
        color: 'white',
        fontSize: 17,
        fontWeight: '500',
        ...Platform.select({
          ios: {
            shadowColor: 'white', 
            shadowRadius: 10, 
            shadowOpacity: 0.5,
            shadowOffset:{  
              width: 1,  
              height: 2,  
            }, 
          },
        }),
      },
      //left/right button styles
      leftButtonStyle: {
        borderTopLeftRadius: borderRadius, 
        borderBottomLeftRadius: borderRadius, 
        backgroundColor: PURPLE.A700,
        ...Platform.select({
          ios: {
            shadowColor: PURPLE.A700, 
            shadowRadius: 5, 
            shadowOpacity: 0.6,
            shadowOffset:{ 
              width: -1,
              height: 3,  
            }, 
          },
        }),
      },
      rightButtonStyle: {
        borderTopRightRadius: borderRadius, 
        borderBottomRightRadius: borderRadius, 
        backgroundColor: RED.A700,
        ...Platform.select({
          ios: {
            shadowColor: RED.A700, 
            shadowRadius: 5, 
            shadowOpacity: 0.5,
            shadowOffset:{  
              width: 1,  
              height: 3,  
            }, 
          },
        }),
      },
    });
  })();

  render(){
    const { styles } = ModalBottomTwoButton;
    const props = this.props;

    const buttonProps = {
      iconSize : props.iconSize,
      iconColor: props.iconColor,
      textStyle: [styles.buttonText, props.buttonTextStyle],
      activeOpacity: 0.75,
      ...props.buttonProps,
    };
    
    return(
      <View style={[styles.container, props.containerStyle]}>
        <IconButton
          text={props.leftText}
          wrapperStyle={{flex: 1}}
          containerStyle={[styles.buttonContainer, styles.leftButtonStyle, props.leftButtonStyle]}
          iconName={props.leftIconName}
          iconType={props.leftIconType}
          onPress={props.onPressLeft}
          {...buttonProps}
        />
        <IconButton
          text={props.rightText}
          wrapperStyle={{flex: 1}}
          containerStyle={[styles.buttonContainer, styles.rightButtonStyle, props.rightButtonStyle]}
          iconName={props.rightIconName}
          iconType={props.rightIconType}
          onPress={props.onPressRight}
          {...buttonProps}
        />
      </View>
    );
  };
};

/** 
 * renders an icon with a title and subtitle w/ default styling meant to be used for a swipable modal
 * @augments {Component<{title:string, subtitle:string, iconName:string, iconType:string, iconSize:number, containerStyle:object, iconStyle:object, iconContainerStyle:object, titleStyle:object, subtitleStyle:object}>}
 */
export class ModalTitle extends React.PureComponent {
  static propTypes = {
    title   : PropTypes.string,
    subtitle: PropTypes.string,
    //icon props
    iconName: PropTypes.string,
    iconType: PropTypes.string,
    iconSize: PropTypes.number,
    //options
    outerGlow: PropTypes.bool,
    //styles
    iconStyle         : PropTypes.object,
    titleStyle        : PropTypes.object,
    subtitleStyle     : PropTypes.object,
    containerStyle    : PropTypes.object,
    iconContainerStyle: PropTypes.object,
  }; 

  static defaultProps = {
    title    : 'Title',
    subtitle : 'Subtitle',
    iconSize : 23,
    outerGlow: true,
  };
  
  static styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textContainer: {
      flex: 1,
      marginLeft: 10,
    },
    iconContainer: {
      width: 39,
      height: 39,
      borderRadius: 39/2,
      backgroundColor: PURPLE.A700,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: PURPLE.A700,
          shadowRadius: 7,
          shadowOpacity: 0.15,
          shadowOffset: { 
            height: 2,
            width: 1,
          },
        },
      }),
    },
    icon: {
      ...Platform.select({
        ios: {
          shadowColor: 'white',
          shadowRadius: 7,
          shadowOpacity: 0.6,
        },
      }),
    },
    title: {
      color: PURPLE[700],
      ...Platform.select({
        ios: {
          flex: 1,      
          fontSize: 24, 
          fontWeight: '800',
          shadowColor: PURPLE[700],
          shadowRadius: 5,
          shadowOpacity: 0.15,
        },
        android: {
          fontWeight: '900',
          fontSize: 26, 
        },
      }),
    },
    subtitle: {
      ...FONT_STYLES.subtitle1,
      ...Platform.select({
        ios: {
          flex: 1,
          fontWeight: '200',
        },
        android: {
          fontWeight: '100',
        },
      }),
    },
  });

  render(){
    const { styles } = ModalTitle;
    const props = this.props;

    const outerGlowStyle = {
      ...(!props.outerGlow && {
        shadowRadius : 0,
        shadowOpacity: 0,
      }),
    };

    return(
      <View style={[styles.container, outerGlowStyle, props.containerStyle]}>
        <Animatable.View
          animation={'pulse'}
          iterationCount={'infinite'}
          iterationDelay={1000}
          duration={1000 * 7}
          useNativeDriver={true}
        >
          <Icon
            containerStyle={[styles.iconContainer, outerGlowStyle, props.iconContainerStyle]}
            iconStyle={[styles.icon, props.iconStyle]}
            name={props.iconName}
            type={props.iconType}
            size={props.iconSize}
            color={'white'}
          />
        </Animatable.View>
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={[styles.title, outerGlowStyle, props.titleStyle]}>
            {props.title}
          </Text>
          <Text numberOfLines={1} style={[styles.subtitle, props.subtitleStyle]}>
            {props.subtitle}
          </Text>
        </View>
      </View>
    );
  };
};

/** 
 * wraps children with a styled view for a section inside a modal
 * @augments {Component<{containerStyle:object}>}
 */
export class ModalSection extends React.PureComponent {
  static styles = StyleSheet.create({
    container: {
      paddingHorizontal: 10,
      paddingTop: 10,
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255,255,255, 0.5)',
          paddingBottom: 13,
          marginBottom: 15,
          borderBottomColor: 'rgba(0,0,0,0.15)',
          borderBottomWidth: 1,
        },
        android: {
          backgroundColor: 'white',
          paddingBottom: 40,
        },
      })
    },
  });

  render(){
    const { styles } = ModalSection;
    const props = this.props;

    return(
      <View style={[styles.container, props.containerStyle]}>
        {this.props.children}
      </View>
    );
  };
};

export const ExpanderHeader = (props) => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textContainer: {
      marginLeft: 7,
    },
    title: {
      ...FONT_STYLES.heading6,
      color: PURPLE[900],
      fontWeight: '600'
    },
    subtitle: {
      ...FONT_STYLES.subtitle1,      
      ...Platform.select({
        ios: {
          fontWeight: '300',
          color: GREY[900]
        },
        android: {
          fontWeight: '100',
          color: GREY[800],
          marginTop: -2,
        },
      }),
    },
    iconContainer: {
      ...Platform.select({
        ios: {
          shadowColor: PURPLE.A700, 
          shadowRadius: 10, 
          shadowOpacity: 0.25,
          shadowOffset:{  
            width: 1,  
            height: 2,  
          }, 
        },
      }),
    },
  });

  const suffix = props.isExpanded? 'collapse' : 'expand';
  return (
    <View style={styles.container}>
      <Icon
        containerStyle={styles.iconContainer}
        name={props.iconName}
        type={props.iconType}
        color={PURPLE.A700}
        size={24}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.title}</Text>
        <Text style={styles.subtitle}>{`Tap here to ${suffix}`}</Text>
      </View>
    </View>
  );
};

class TapToCycleText extends React.PureComponent {

};


export class PlatformButton extends React.PureComponent {
  static propTypes = {
    //content
    title   : PropTypes.string,
    subtitle: PropTypes.string,
    //options - config/customize
    customContent: PropTypes.bool  ,
    showChevron  : PropTypes.bool  ,
    showIcon     : PropTypes.bool  ,
    alignment    : PropTypes.string,
    //options - colors related
    fgColor      : PropTypes.string,
    bgColor      : PropTypes.string,
    reverseColors: PropTypes.bool  ,
    //options - gradient related
    gradientColors: PropTypes.array,
    isBgGradient  : PropTypes.bool,
    gradientProps : PropTypes.object,
    //options - style adj/shortcuts
    iconDistance: PropTypes.number,
    borderRadius: PropTypes.number,
    addShadow   : PropTypes.bool  ,
    //icon related props
    iconContainerStyle: PropTypes.string,
    iconName          : PropTypes.string,
    iconType          : PropTypes.string,
    iconSize          : PropTypes.number,
    //style props
    containerStyle: PropTypes.object,
    textStyle: PropTypes.object,
    subtitleStyle: PropTypes.object,
    titleStyle: PropTypes.object,
    subtitleStyle: PropTypes.object,
    middleContainerStyle: PropTypes.object,
  };

  static defaultProps = {
    //options
    customContent: false,
    showChevron  : false,
    showIcon     : true ,
    //options - colors related
    fgColor      : 'white'    ,
    bgColor      : PURPLE.A700,
    reverseColors: false      ,
    //options - gradient related
    isBgGradient  : false,
    gradientColors: [PURPLE.A700, '#3600ea'],
    //options - style adj/shortcuts
    iconDistance: 7,
    borderRadius: 12,
    addShadow: true,
  };

  static ALIGNMENT = {
    'CENTER' : 'CENTER' ,
    'LEFT'   : 'LEFT'   ,
    'RIGHT'  : 'RIGHT'  ,
  };

  static styles = StyleSheet.create({
    container: {
      margin: 10,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 9,
      paddingHorizontal: 14,
    },
    middleContainer: {
    },
    gradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 9,
      paddingHorizontal: 14,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
    },
  });

  getAlignment(){
    const { ALIGNMENT } = PlatformButton;
    const { showChevron, showIcon, subtitle, alignment } = this.props;

    return(
      showChevron? ALIGNMENT.STRETCH :
      subtitle   ? ALIGNMENT.LEFT    :
      alignment  ? alignment         :
      showIcon   ? ALIGNMENT.CENTER  : ALIGNMENT.LEFT
    );
  };

  _renderMiddle(){
    const { styles, ALIGNMENT } = PlatformButton;
    const { title, subtitle, ...props } = this.props;

    const alignment = this.getAlignment();
    const middleContainerStyle = {
      ...((props.showChevron || alignment == ALIGNMENT.LEFT) && {
        flex: 1,
      }),
    };

    const textStyle = {
      color: props.fgColor,
    };
    
    return props.customContent? (
      props.children
    ): subtitle? (
      <View style={[styles.middleContainer, middleContainerStyle, props.middleContainerStyle]}>
        <Text style={[styles.title, textStyle, props.titleStyle]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, textStyle, props.subtitleStyle]}>
          {subtitle}
        </Text>
      </View>
    ):(
      <Text style={[styles.title, textStyle, middleContainerStyle, props.titleStyle]}>
        {title}
      </Text>
    );
  };

  _renderContent(){
    const { styles, ALIGNMENT } = PlatformButton;
    const { ...props } = this.props;

    const alignment = this.getAlignment();
    const iconContainerStyle = {
      marginRight: props.iconDistance,
      ...(alignment == ALIGNMENT.RIGHT && {
        flex: 1,
      }),
    };

    return(
      <Fragment>
        {props.showIcon && <Icon
          containerStyle={[props.iconContainerStyle, iconContainerStyle]}
          //pass down icon props
          name ={props.iconName}
          type ={props.iconType}
          color={props.fgColor }
          size ={props.iconSize}
        />}
        {this._renderMiddle()}
        {props.showChevron && <Icon
          //pass down icon props
          name ={'chevron-right'}
          type ={'feather'}
          color={props.fgColor }
          size={props.iconSize}
        />}
      </Fragment>
    );
  };

  render(){
    const { ALIGNMENT } = PlatformButton;
    const { styles } = PlatformButton;
    const props = this.props;
    
    const alignment = this.getAlignment();
    const containerStyle = {
      backgroundColor: props.bgColor,
      borderRadius   : props.borderRadius,
      ...( props.addShadow     && STYLES.mediumShadow),
      ...(!props.isBgGradient  && styles.container   ),
      ...(!props.customContent && {
        justifyContent: (
          alignment == ALIGNMENT.CENTER? 'center'     :
          alignment == ALIGNMENT.LEFT  ? 'flex-start' :
          alignment == ALIGNMENT.RIGHT ? 'flex-end'   : null
        ),
      }),
    };

    const CONTENT = (props.isBgGradient? (
      <LinearGradient
        style={[styles.gradient, containerStyle]}
        colors={props.gradientColors}
        start={{ x: 0, y: 1 }}
        end  ={{ x: 1, y: 1 }}
        {...props.gradientProps}
      >
        {this._renderContent()}
      </LinearGradient>
    ):(
      this._renderContent())
    );
    
    return Platform.select({
      ios: (
        <TouchableOpacity 
          style={[containerStyle, props.containerStyle]}
          activeOpacity={0.8}
          {...props}
        >
          {CONTENT}
        </TouchableOpacity>
      ),
      android: (
        <PlatformTouchable 
          style={[containerStyle, props.containerStyle]}
          {...props}
        >
          {CONTENT}
        </PlatformTouchable>
      ),
    });
  };
};

export class StyledSwipableModal extends React.PureComponent {
  static propTypes = {
    innerRef: PropTypes.func,
    showOverlay: PropTypes.bool,
    //header props
    headerTitle    : PropTypes.string,
    headerSubtitle : PropTypes.string,
    headerIconName : PropTypes.string,
    headerIconType : PropTypes.string,
    headerIconStyle: PropTypes.object,
    //footer props
    buttonTitle    : PropTypes.string,
    buttonIconName : PropTypes.string,
    buttonIconType : PropTypes.string,
    //render functions
    renderHeader : PropTypes.func,
    renderBody   : PropTypes.func,
    renderFooter : PropTypes.func,
    renderOverlay: PropTypes.func,
  };

  static styles = StyleSheet.create({
    container: {
      paddingBottom: MODAL_EXTRA_HEIGHT + MODAL_DISTANCE_FROM_TOP,
    },
    //header styles
    headerWrapper: {
      ...Platform.select({
        ios: {
          position: 'absolute',
          width: '100%',
        },
        android: {
          borderBottomColor: GREY[900],
        },
      }),
    },
    headerContainer: {
      paddingHorizontal: 7,
      paddingBottom: 10,
      ...Platform.select({
        ios: {
          borderBottomColor: GREY[100],
          borderBottomWidth: 1,
          backgroundColor: 'rgba(255,255,255, 0.5)',      
        },
        android: {
          backgroundColor: 'rgba(255,255,255, 0.75)',      
        },
      }),
    },
    //body styles
    scrollview: {
      flex: 1,
      paddingBottom: 75,
    },
    //footer styles
    footerWrapper: {
      position: 'absolute',
      width: '100%',
      bottom: 0,
    },
    footerContainer: {
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255,255,255,0.4)',
          paddingVertical: 12,
          paddingHorizontal: 10,
          //border
          borderColor: 'rgba(0,0,0,0.2)',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          //extra padding
          ...(isIphoneX() && {
            paddingBottom: getBottomSpace() + 10,
          }),
        },
        android: {
          backgroundColor: 'white',          
          padding: 10,
          height: 80,
          elevation: 15,
        },
      }),
    },
  });

  constructor(props){
    super(props);
    this._deltaY = null;
    this.state = {
      mountContent: false,
      headerHeight: -1,
      footerHeight: -1,
    };
  };

  componentDidMount(){
    const expandedHeight = (Screen.height - MODAL_DISTANCE_FROM_TOP);
    const deltaY = this.modal._deltaY;

    this.opacity = interpolate(deltaY, {
      inputRange : [0, expandedHeight],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });
    this.scale = interpolate(deltaY, {
      inputRange : [0, expandedHeight],
      outputRange: [1, 0.95],
      extrapolate: 'clamp',
    });
    this.translateX = interpolate(deltaY, {
      inputRange : [0, expandedHeight],
      outputRange: [1, 10],
      extrapolate: 'clamp',
    });
  };

  getModalRef = () => {
    return this.modal;
  };

  openModal = async () => {
    await setStateAsync(this, {mountContent: true});
    this.modal.showModal();
  };

  //#region ------ events/handlers ------
  /** from _renderHeader */
  _handleHeaderOnLayout = ({nativeEvent}) => {
    const { headerHeight } = this.state;
    const { height } = nativeEvent.layout;

    if(headerHeight == -1){
      this.setState({headerHeight: height});
    };
  };

  _handleFooterOnLayout = ({nativeEvent}) => {
    const { footerHeight } = this.state;
    const { height } = nativeEvent.layout;

    if(footerHeight == -1){
      this.setState({footerHeight: height});
    };
  };

  /** from _renderContent: scrolllview */
  _handleOnEndReached = () => {
    this.footer.show();
  };

  _handleOnModalHide = () => {
    //reset state
    this.setState({mountContent: false});
  };

  /** from _renderFooter */
  _handleOnPressCancel = () => {
    this.modal.hideModal();
  };
  //#endregion 

  //#region ------ render functions ------
  _renderHeader(){
    const { styles } = StyledSwipableModal;
    const { renderHeader, ...props} = this.props;

    const style = {
      opacity: this.opacity,
      transform: [
        { translateX: this.translateX },
        { scale     : this.scale      },
      ],
    };

    return(
      <BlurViewWrapper
        wrapperStyle={styles.headerWrapper}
        containerStyle={styles.headerContainer}
        onLayout={this._handleHeaderOnLayout}
      >
        <ModalTopIndicator/>
        <Animated.View {...{style}}>
          {renderHeader? (renderHeader()):(
            <ModalTitle
              title    ={props.headerTitle    }
              subtitle ={props.headerSubtitle }
              iconName ={props.headerIconName }
              iconType ={props.headerIconType }
              iconStyle={props.headerIconStyle}
            />
          )}
        </Animated.View>
      </BlurViewWrapper>
    );
  };

  _renderBody(){
    const { styles } = StyledSwipableModal;
    const { children } = this.props;
    const { mountContent, headerHeight, footerHeight } = this.state;

    const childCount = React.Children.count(children);
    
    const style = {
      flex: 1,
      opacity: this.opacity,
    };

    const scrollviewProps = {
      style: styles.scrollview,
      ...Platform.select({
        ios: {
          contentInset : {top: headerHeight, bottom: footerHeight},
          contentOffset: {x: 0, y: -headerHeight},
        },
      }),
    };

    return(
      <Animatable.View
        style={{flex: 1}}
        animation={'fadeInUp'}
        duration={500}
        useNativeDriver={true}
      >
        <Animated.View {...{style}}>
          {(mountContent && childCount > 0) && 
            React.cloneElement(children, scrollviewProps)
          }
        </Animated.View>
      </Animatable.View>
    );
  };

  _renderFooter(){
    const { styles } = StyledSwipableModal;
    const { renderFooter, ...props} = this.props;

    return(
      <Animatable.View
        style={styles.footerWrapper}
        animation={'fadeInUp'}
        duration={500}
        delay={300}
        useNativeDriver={true}
      >
        <BlurViewWrapper
          containerStyle={styles.footerContainer}
          onLayout={this._handleFooterOnLayout}
          intensity={100}
          tint={'default'}
        >
          {renderFooter? renderFooter():(
            <ModalBottomTwoButton
              leftText={'Finish'}
              rightText={'Cancel'}
              onPressLeft={this._handleOnPressFinish}
              onPressRight={this._handleOnPressCancel}
            />
          )}
        </BlurViewWrapper>
      </Animatable.View>
    );
  };

  render(){
    const { styles } = StyledSwipableModal;
    const { renderOverlay, ...props} = this.props;

    return(
      <SwipableModal 
        ref={r => this.modal = r}
        onModalShow={props.onModalShow}
        onModalHide={props.onModalHide}
        snapPoints ={props.snapPoints }
        {...props}
      >
        <ModalBackground style={styles.container}>
          {renderOverlay && renderOverlay()}
          {Platform.select({
            ios: (
              <Fragment>
                {this._renderBody  ()}
                {this._renderHeader()}
                {this._renderFooter()}
              </Fragment>
            ),
            android: (
              <Fragment>
                {this._renderHeader()}
                {this._renderBody  ()}
                {this._renderFooter()}
              </Fragment>
            ),
          })}
        </ModalBackground>
      </SwipableModal>
    );
  };
  //#endregion 
};

/** used in conjunction with StickyCollapsableScrollView */
export class StickyCollapseHeader extends React.PureComponent {
  static styles = StyleSheet.create({
    arrowContainer: {
      width: 25,
      height: 25,
      borderRadius: 25/2,
      backgroundColor: PURPLE[500],
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  constructor(props){
    super(props);

    this.progress = new Value(100);
    this.opacity = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });
    this.scale = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0.95, 1],
      extrapolate: 'clamp',
    });
    this.rotation = interpolate(this.progress, {
      inputRange : [0, 100],
      outputRange: [0, 180],
      extrapolate: 'clamp',
    });

    this.state = {
      isExpanded: true,
    };
  };

  expand = async (expand) => {
    const { isExpanded } = this.state;

    const config = {
      duration: 300,
      toValue : expand? 100 : 0,
      easing  : Easing.inOut(Easing.ease),
    };
    
    if(isExpanded != expand){
      //start animation
      const animation = timing(this.progress, config);
      animation.start();
      this.setState({isExpanded: !isExpanded});
    };
  };


  _handleOnPress = () => {
    const { onPress } = this.props;
    const { isExpanded } = this.state;

    this.expand(!isExpanded);
    onPress && onPress();
  };

  _renderRight = () => {
    const { styles } = StickyCollapseHeader;

    const arrowContainerStyle = {
      opacity: this.opacity,
      transform: [
        { rotate: concat(this.rotation, 'deg') },
        { scale: this.scale},
      ],
    };

    return(
      <Animated.View style={[styles.arrowContainer, arrowContainerStyle]}>
        <Icon
          name={'chevron-down'}
          type={'feather'}
          color={'white'}
          size={17}
        />
      </Animated.View>
    );
  };

  render(){
    const { onPress, ...props } = this.props;
    return(
      <TouchableOpacity
        onPress={this._handleOnPress}
        activeOpacity={1}
      >
        <StickyHeader
          renderRightComponent={this._renderRight}
          {...props}
        />
      </TouchableOpacity>
    );
  };
};

/** 
 * this component is used to make a scrollview w/ sticky section headers
 * w/ expandable and collapsable content when you tap on the headers
 * 
 * USAGE:
 * every even component i.e 0, 2 etc., should be a StickyCollapseHeader
 * every odd  component i.e 1, 3 etc., is wrapped inside a ContentExpander
 * 
 * NOTE:
 * When a component return an array of Comps i.e [<A/>, <B/>], a scrollview
 * and thus, by extension the comp. tree still considers it as 1 component
 * becuase it wraps it inside a fragment. Thus, the prev. attempts of a single 
 * comp. that contained both the header and expander did not work even if it 
 * returned an array or is generated using funcs or a stateless func comp.
 */
export class StickyCollapsableScrollView extends React.PureComponent {
  render(){
    const { children, ...props } = this.props;

    const childCount = React.Children.count(children);
    const range = [...Array(childCount).keys()];
    const stickyHeaderIndices = range.filter(i => (i % 2) == 0);

    return(
      <ScrollView {...{stickyHeaderIndices, ...props}}>
        {React.Children.map(children, (child, index) => {
          const isHeader = ((index % 2) == 0);
          return React.cloneElement((isHeader? child : (
            //wrap child after stickyheader inside a expander
            <ContentExpander>{child}</ContentExpander>
          )), {
            ref: r => this[index] = r,
            //stickyheader specific props
            ...(isHeader && {
              onPress: () => this[index + 1].toggle(),
            }),
          })}
        )}
      </ScrollView>
    );
  };
};
