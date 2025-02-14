// @ts-nocheck

import React, {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
} from 'react';
import { StyleSheet, StatusBar, Image, View } from 'react-native';
import PropTypes from 'prop-types';
import { useAppState, useDimensions } from '@react-native-community/hooks';
import {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';

import ALIViewPlayer from './ALIViewPlayer';
import ControlerView from './components/ControlerView';

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    backgroundColor: 'black',
  },
});

const Player = forwardRef(
  (
    {
      title,
      source,
      poster,
      style,
      themeColor,
      onFullScreen,
      onCompletion,
      setAutoPlay,
      onChangeBitrate,
      onProgress,
      onPrepare,
      isLandscape,
      enableSeekForword = true,
      onPause,
      onPlay,
      ...restProps
    },
    ref,
  ) => {
    const playerRef = useRef();
    const [playSource, setPlaySource] = useState(source);
    const [error, setError] = useState(false);
    const [errorObj, setErrorObj] = useState({});
    const [loading, setLoading] = useState(true);
    const [isComplate, setIsComplate] = useState(false);
    const [isStopPlay, setIsStopPlay] = useState(false);
    const [isPlaying, setIsPlaying] = useState(setAutoPlay);
    const [loadingObj, setLoadingObj] = useState({});
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(0);
    const [buffer, setBuffer] = useState(0);
    const [isStart, setIsStart] = useState(false);
    const [bitrateList, setBitrateList] = useState([]);
    const [bitrateIndex, setBitrateIndex] = useState();
    const { screen, window } = useDimensions();
    const currentAppState = useAppState();

    useImperativeHandle(ref, () => ({
      play: play => {
        if (play) {
          handlePlay();
        } else {
          handlePause();
        }
      },
      fullscreen: full => {
        if (full) {
          handleFullScreenIn();
        } else {
          handleFullScreenOut();
        }
      },
      stop: handleStop,
      seekTo: handleSlide,
    }));

    useEffect(() => {
      if (isLandscape) {
        hideNavigationBar();
      } else {
        showNavigationBar();
      }
    }, [isLandscape]);

    // 处理切换资源
    useEffect(() => {
      if (source) {
        changeSource(source);
      }
    }, [source]);

    useEffect(() => {
      if (currentAppState === 'background') {
        playerRef.current.pausePlay();
        setIsPlaying(false);
        onPause && onPause();
      }
    }, [currentAppState]);

    // useBackHandler(() => {
    //   if (isOrientationLandscape) {
    //     handleFullScreenOut();
    //     return true;
    //   }
    //   return false;
    // });

    const changeSource = src => {
      setPlaySource(src);
      setLoading(true);
      setLoadingObj({});
      setError(false);
    };

    const handlePlay = () => {
      if (isComplate) {
        playerRef.current.restartPlay();
        setIsComplate(false);
      } else if (isStopPlay) {
        playerRef.current.reloadPlay();
      } else {
        playerRef.current.startPlay();
      }
      setIsPlaying(true);
      onPlay && onPlay();
    };

    const handlePause = () => {
      playerRef.current.pausePlay();
      setIsPlaying(false);
      onPause && onPause();
    };

    const handleReload = () => {
      setError(false);
      playerRef.current.reloadPlay();
    };

    const handleSlide = value => {
      playerRef.current.seekTo(value);
    };

    const handleStop = () => {
      playerRef.current.stopPlay();
      setIsStopPlay(true);
      setIsPlaying(false);
      setIsStart(false);
    };

    const handleFullScreenIn = () => {
      onFullScreen(true);
    };

    const handleFullScreenOut = () => {
      onFullScreen(false);
    };

    const handleChangeConfig = config => {
      playerRef.current.setNativeProps(config);
    };

    const handleChangeBitrate = newIndex => {
      setBitrateIndex(newIndex);
    };

    const isOrientationLandscape = isLandscape;

    const fullscreenStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: isOrientationLandscape
        ? Math.max(screen.width, screen.height)
        : Math.min(screen.width, screen.height),
      height: isOrientationLandscape
        ? Math.min(screen.width, screen.height)
        : Math.max(screen.width, screen.height),
      zIndex: 100,
    };

    const fullwindowStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: isOrientationLandscape
        ? Math.max(window.width, window.height)
        : Math.min(window.width, window.height),
      height: isOrientationLandscape
        ? Math.min(window.width, window.height)
        : Math.max(window.width, window.height),
    };

    return (
      <View
        style={[styles.base, isOrientationLandscape ? fullscreenStyle : style]}>
        <ALIViewPlayer
          {...restProps}
          ref={playerRef}
          source={playSource}
          setAutoPlay={setAutoPlay}
          selectBitrateIndex={bitrateIndex}
          style={
            isOrientationLandscape ? fullwindowStyle : StyleSheet.absoluteFill
          }
          onAliPrepared={({ nativeEvent }) => {
            setTotal(nativeEvent.duration);
            if (isPlaying) {
              playerRef.current.startPlay();
            }
            setCurrent(0);
            setBuffer(0);
            onPrepare({ duration: nativeEvent.duration });
          }}
          onAliLoadingBegin={() => {
            setLoading(true);
            setLoadingObj({});
          }}
          onAliLoadingProgress={({ nativeEvent }) => {
            setLoadingObj(nativeEvent);
          }}
          onAliLoadingEnd={() => {
            setLoading(false);
            setLoadingObj({});
          }}
          onAliRenderingStart={() => {
            setError(false);
            setLoading(false);
            setIsStopPlay(false);
            setIsPlaying(true);
            setIsStart(true);
          }}
          onAliCurrentPositionUpdate={({ nativeEvent }) => {
            setCurrent(nativeEvent.position);
            onProgress({ progress: nativeEvent.position });
          }}
          onAliBufferedPositionUpdate={({ nativeEvent }) => {
            setBuffer(nativeEvent.position);
            onProgress({ buffered: nativeEvent.position });
          }}
          onAliCompletion={() => {
            setIsComplate(true);
            setIsPlaying(false);
            onCompletion();
          }}
          onAliError={({ nativeEvent }) => {
            setError(true);
            setErrorObj(nativeEvent);
          }}
          onAliBitrateChange={({ nativeEvent }) => {
            onChangeBitrate(nativeEvent);
          }}
          onAliBitrateReady={({ nativeEvent }) => {
            setBitrateList(nativeEvent.bitrates);
          }}>
          <StatusBar hidden={isLandscape} />
          <ControlerView
            onPressPlay={handlePlay}
            onPressPause={handlePause}
            {...restProps}
            title={title}
            isFull={isOrientationLandscape}
            current={current}
            buffer={buffer}
            total={total}
            isError={error}
            poster={poster}
            isStart={isStart}
            isLoading={loading}
            errorObj={errorObj}
            isPlaying={isPlaying}
            loadingObj={loadingObj}
            themeColor={themeColor}
            playSource={playSource}
            bitrateList={bitrateList}
            bitrateIndex={bitrateIndex}
            onSlide={handleSlide}
            onPressReload={handleReload}
            onPressFullIn={handleFullScreenIn}
            onPressFullOut={handleFullScreenOut}
            onChangeConfig={handleChangeConfig}
            onChangeBitrate={handleChangeBitrate}
            enableSeekForword={enableSeekForword}
          />
        </ALIViewPlayer>
      </View>
    );
  },
);
Player.propTypes = {
  ...ALIViewPlayer.propTypes,
  source: PropTypes.string, // 播放地址
  poster: Image.propTypes.source, // 封面图
  onFullScreen: PropTypes.func, // 全屏回调事件
  onCompletion: PropTypes.func, // 播放完成事件
  enableFullScreen: PropTypes.bool, // 是否允许全屏
  themeColor: PropTypes.string, // 播放器主题
  enableCast: PropTypes.bool, // 是否显示投屏按钮
  onCastClick: PropTypes.func, // 投屏按钮点击事件
  onChangeBitrate: PropTypes.func, // 切换清晰度
  onProgress: PropTypes.func, // 进度回调
  onPrepare: PropTypes.func, // 播放准备回调
  isLandscape: PropTypes.bool, // 全屏是否横屏
  enableSeek: PropTypes.bool,
};

Player.defaultProps = {
  onFullScreen: () => { },
  onCompletion: () => { },
  onCastClick: () => { },
  onChangeBitrate: () => { },
  onProgress: () => { },
  onPrepare: () => { },
  onPause: () => { },
  onPlay: () => { },
  themeColor: '#F85959',
  enableHardwareDecoder: false,
  setSpeed: 1.0,
  setScaleMode: 0,
  isLandscape: true,
};

export default React.memo(Player);
