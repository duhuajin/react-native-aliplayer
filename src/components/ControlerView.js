import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Text,
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { formatTime, getBitrateLabel } from '../lib/utils';
import useTimeout from '../lib/useTimeout';
import PressView from './PressView';
import StateView from './StateView';
import Progress from './Progress';
import ConfigView from './ConfigView';
import Seekbar from './Seekbar';

const GradientWhite = 'rgba(0,0,0,0)';
const GradientBlack = 'rgba(0,0,0,0.3)';
const controlerHeight = 40;
const controlerDismissTime = 5000;
const AnimateView = Animated.View;

const styles = StyleSheet.create({
  controler: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  stateview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textTitle: {
    color: 'white',
    flex: 1,
    fontSize: 16,
  },
  textQuality: {
    color: 'white',
    fontSize: 16,
  },
  textTime: {
    color: 'white',
    fontSize: 12,
  },
  iconLeft: {
    marginLeft: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: controlerHeight,
    width: '100%',
    paddingHorizontal: 10,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    height: controlerHeight,
    width: '100%',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  bottomSlide: {
    flex: 0.8,
    marginHorizontal: 5,
  },
  play: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  full: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function ControlerView({
  title,
  isFull,
  current,
  buffer,
  total,
  isPlaying,
  enableFullScreen,
  enableCast,
  playSource,
  bitrateList,
  bitrateIndex,
  themeColor,
  poster,
  isStart,
  // config
  setSpeed,
  setScaleMode,
  setLoop,
  setMute,
  // ******
  isError,
  isLoading,
  errorObj,
  loadingObj,
  onPressPlay,
  onPressPause,
  onPressReload,
  onPressFullIn,
  onPressFullOut,
  onChangeConfig,
  onChangeBitrate,
  onSlide,
  onCastClick,
  enableSeekForword,
}) {
  const [visible, setVisible] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [qualityVisible, setQualityVisible] = useState(false);
  const currentFormat = formatTime(current);
  const totalFormat = formatTime(total);
  const hasBitrate = Array.isArray(bitrateList) && bitrateList.length;
  const bitrate =
    bitrateList && bitrateList.find(o => o.index === bitrateIndex);
  const [configObj, setConfigObj] = useState({
    setSpeed,
    setScaleMode,
    setLoop,
    setMute,
  });
  const bitrateLabel = getBitrateLabel(bitrate) || '画质';

  const { animateValue, bottomAnimate, headerAnimate, opacityAnimate } =
    useMemo(() => {
      const animateValue = new Animated.Value(0);
      const bottomAnimate = animateValue.interpolate({
        inputRange: [0, 1],
        outputRange: [controlerHeight, 0],
      });
      const headerAnimate = animateValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-controlerHeight, 0],
      });
      const opacityAnimate = animateValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      });
      return {
        animateValue,
        bottomAnimate,
        headerAnimate,
        opacityAnimate,
      };
    }, []);

  const [_, clear, set] = useTimeout(() => {
    setVisible(false);
  }, controlerDismissTime);

  useEffect(() => {
    Animated.timing(animateValue, {
      toValue: visible ? 1 : 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [visible, animateValue]);

  const handlePressPlayer = () => {
    if (visible) {
      setVisible(false);
      clear();
    } else {
      setVisible(true);
      set();
    }
  };

  return (
    <SafeAreaView style={styles.controler}>
      {!isStart && (
        <Image
          source={poster}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />
      )}
      <AnimateView
        style={[
          styles.header,
          {
            opacity: opacityAnimate,
            transform: [{ translateY: headerAnimate }],
          },
        ]}>
        <LinearGradient
          style={StyleSheet.absoluteFill}
          colors={[GradientBlack, GradientWhite]}
        />

        {isFull && (
          <TouchableOpacity style={styles.back} onPress={onPressFullOut}>
            <Image source={require('../assets/img/back.png')} />
          </TouchableOpacity>
        )}

        <Text style={styles.textTitle}>{title}</Text>
        {/* {Boolean(hasBitrate && isFull) && (
          <Text
            style={[styles.textQuality, styles.iconLeft]}
            onPress={() => setQualityVisible(true)}>
            {bitrateLabel}
          </Text>
        )} */}
      </AnimateView>
      <PressView
        style={styles.stateview}
        onPress={handlePressPlayer}
        activeOpacity={1}>
        <StateView
          isError={isError}
          isLoading={isLoading}
          errorObj={errorObj}
          isPlaying={isPlaying}
          loadingObj={loadingObj}
          themeColor={themeColor}
          onPressPlay={onPressPlay}
          onPressReload={onPressReload}
        />
      </PressView>
      <AnimateView
        style={[
          styles.bottom,
          {
            opacity: opacityAnimate,
            transform: [{ translateY: bottomAnimate }],
          },
        ]}>
        <LinearGradient
          style={StyleSheet.absoluteFill}
          colors={[GradientWhite, GradientBlack]}
        />

        <TouchableOpacity
          style={styles.play}
          onPress={isPlaying ? onPressPause : onPressPlay}>
          <Image
            resizeMode="contain"
            source={
              isPlaying
                ? require('../assets/img/pause.png')
                : require('../assets/img/play.png')
            }
          />
        </TouchableOpacity>
        <Text
          style={
            styles.textTime
          }>{`${currentFormat.M}:${currentFormat.S}`}</Text>
        <Seekbar
          progress={current}
          min={0}
          max={total}
          style={styles.bottomSlide}
          progressColor={themeColor}
          onProgressChanged={value => {
            if (enableSeekForword === true) {
              onSlide(value);
              return;
            }
            if (value > current) {
              return;
            }
            onSlide(value);
          }}
          themeColor={themeColor}
        />
        <Text
          style={styles.textTime}>{`${totalFormat.M}:${totalFormat.S}`}</Text>
        {enableFullScreen && (
          <TouchableOpacity
            style={styles.full}
            onPress={isFull ? onPressFullOut : onPressFullIn}>
            <Image
              source={
                isFull
                  ? require('../assets/img/shrink.png')
                  : require('../assets/img/expand.png')
              }
            />
          </TouchableOpacity>
        )}
      </AnimateView>
      <Progress
        disable={visible}
        value={current}
        maxValue={total}
        themeColor={themeColor}
      />
      <ConfigView
        config={configObj}
        visible={configVisible}
        themeColor={themeColor}
        onClose={() => setConfigVisible(false)}
        onChange={res => {
          const newConfig = Object.assign({}, configObj, res);
          setConfigObj(newConfig);
          onChangeConfig(newConfig);
        }}
      />
      {/* <QualityView
        themeColor={themeColor}
        playSource={playSource}
        visible={qualityVisible}
        bitrateList={bitrateList}
        bitrateIndex={bitrateIndex}
        onChange={res => {
          onChangeBitrate(res.value);
          setQualityVisible(false);
        }}
        onClose={() => setQualityVisible(false)}
      /> */}
    </SafeAreaView>
  );
}
export default ControlerView;
