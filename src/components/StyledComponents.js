

import React, { Component, Fragment } from 'react';
import { StyleSheet, View, Text, Platform, TouchableOpacity, Alert } from 'react-native';
import PropTypes from 'prop-types';

import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo';
import { isIphoneX } from 'react-native-iphone-x-helper';

import { Icon, } from 'react-native-elements';
import { FONT_STYLES, FONT_NAMES } from '../Constants';
import { PURPLE, GREY, RED, BLUE, } from '../Colors';
import { IconButton } from './Buttons';
import { ContentExpander } from './Expander';

import Animated, { Easing } from 'react-native-reanimated';
const { Value, interpolate, concat, set, onChange } = Animated;

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
          fontWeight: '100',
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
      <Text style={[styles.subtitle, props.subtitleStyle]}>
        {props.children}
      </Text>
    ):(
      <Text style={[styles.subtitle, props.subtitleStyle]}>
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
    };

    return props.help? (
      <TouchableOpacity 
        onPress={this._handleOnPress}
        activeOpacity={0.75}
      >
        <Text style={[styles.title, props.titleStyle]}>{props.title}</Text>
        <View style={[styles.subtitleContainer, subtitleContainerStyle]}>
          {this._renderSubtitle()}
        </View>
      </TouchableOpacity>
    ):(
      <Fragment>
        <Text style={[styles.title, props.titleStyle]}>{props.title}</Text>
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
    color         : PURPLE[600],
    adjustFontSize: true       ,
    initFontSize  : 18         ,
    diffFontSize  : 1          ,
  };

  static styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: 'white',
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
    const { size, value, color, initFontSize, diffFontSize, adjustFontSize } = this.props;
    
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
          {value}
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
    //style
    iconStyle         : PropTypes.object,
    titleStyle        : PropTypes.object,
    subtitleStyle     : PropTypes.object,
    containerStyle    : PropTypes.object,
    iconContainerStyle: PropTypes.object,
  }; 

  static defaultProps = {
    title   : 'Title',
    subtitle: 'Subtitle',
    iconSize: 23,
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

    return(
      <View style={[styles.container, props.containerStyle]}>
        <Animatable.View
          animation={'pulse'}
          iterationCount={'infinite'}
          iterationDelay={1000}
          duration={1000 * 7}
          useNativeDriver={true}
        >
          <Icon
            containerStyle={[styles.iconContainer, props.iconContainerStyle]}
            iconStyle={[styles.icon, props.iconStyle]}
            name={props.iconName}
            type={props.iconType}
            size={props.iconSize}
            color={'white'}
          />
        </Animatable.View>
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={[styles.title, props.titleStyle]}>
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

export class TapToCycleText extends React.PureComponent {

};
