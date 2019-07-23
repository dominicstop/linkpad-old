import React, { Fragment } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated as NativeAnimated, Dimensions, ScrollView, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { STYLES, FONT_STYLES } from '../Constants';
import { PURPLE, GREY, BLUE, GREEN, RED, ORANGE, AMBER } from '../Colors';
import { setStateAsync, timeout, addLeadingZero } from '../functions/Utils';

import { MODAL_DISTANCE_FROM_TOP, MODAL_EXTRA_HEIGHT, SwipableModal, ModalBackground, ModalTopIndicator } from '../components/SwipableModal';
import { IconFooter } from '../components/Views';

import * as Animatable from 'react-native-animatable';
import _ from 'lodash';
import moment from "moment";
import TimeAgo from 'react-native-timeago';
import Chroma from 'chroma-js';

import Lottie from 'lottie-react-native'
import { Icon, Divider } from 'react-native-elements';

import { QuizAnswer, QuizQuestion, QUIZ_LABELS } from '../models/Quiz';
import { isIphoneX, getBottomSpace } from 'react-native-iphone-x-helper';

import { BlurViewWrapper, StickyHeader, DetailRow, DetailColumn, ModalBottomTwoButton, ModalTitle, StickyHeaderCollapsable, ModalSection, ExpanderHeader, NumberIndicator, StyledSwipableModal } from '../components/StyledComponents';

import Animated, { Easing } from 'react-native-reanimated';
import { ContentExpander } from '../components/Expander';
import { CustomQuiz, CustomQuizStore } from '../functions/CustomQuizStore';
const { interpolate, Value, timing, concat } = Animated; 




export class TestScreen extends React.Component {

  render(){
    return null
  };
};