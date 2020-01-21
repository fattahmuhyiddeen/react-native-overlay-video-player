import React from 'react';
import {
  Modal,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import Video from 'react-native-video';
import Slider from 'react-native-slider';
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');
export default class extends React.Component {
  state = {
    imageHeight: height / 1.5,
    imageWidth: width,
    isLoading: true,
    video: {},
    currentPosition: 0,
    paused: false,
  };

  componentDidMount() {
    this.isMount = true;
  }

  componentWillUnmount() {
    this.isMount = false;
  }

  safeSetState = (props, callback) => this.isMount && this.setState(props, () => callback && callback());

  onLoadVideo = data => {
    this.safeSetState({ isLoading: false, video: data });
    let w = data.naturalSize.width;
    let h = data.naturalSize.height;
    const screenWidth = width - 20;
    const screenHeight = height / 1.5;
    if (w > screenWidth) {
      h = (h * screenWidth) / w;
      w = screenWidth;
    }

    if (h > screenHeight) {
      w = (w * screenHeight) / h;
      h = screenHeight;
    }

    this.safeSetState({ imageHeight: h, imageWidth: w });
  };

  updateTime = ({ currentTime }) => this.safeSetState({ currentPosition: currentTime });

  get videoDuration() {
    if (!this.state.video || !this.state.video.duration) return 0;
    return Math.floor(this.state.video.duration);
  }

  get currentTime() {
    const duration = Math.floor(this.state.currentPosition);
    let min = Math.floor(duration / 60);
    let sec = duration % 60;
    if (min < 10) min = `0${min}`;
    if (sec < 10) sec = `0${sec}`;
    return `${min}:${sec}`;
  }

  get videoLength() {
    if (!this.state.video || !this.state.video.duration) return '00:00';

    const duration = Math.floor(this.state.video.duration);
    let min = Math.floor(duration / 60);
    let sec = duration % 60;
    if (min < 10) min = `0${min}`;
    if (sec < 10) sec = `0${sec}`;
    return `${min}:${sec}`;
  }

  generateVideo = () => {
    if (!!this.props.source && !!this.props.source.uri) {
      return (
        <View style={{ alignItems: 'center' }}>
          <Video
            ref={ref => this.videoPlayer = ref}
            paused={this.state.paused}
            source={this.props.source}
            style={{
              width: this.state.imageWidth,
              height: this.state.imageHeight,
            }}
            onLoad={this.onLoadVideo}
            onProgress={this.updateTime}
            onEnd={() => this.safeSetState({ paused: true })}
            playInBackground={false}
            playWhenInactive={false}
          />
          <View style={styles.playbackContainer}>
            <TouchableOpacity onPress={() => this.safeSetState({ paused: !this.state.paused })}>
              <View style={{ paddingRight: 5 }}>
                <IconMaterialCommunity name={this.state.paused ? 'play' : 'pause'} style={{ color: 'white', fontSize: 20 }} />
              </View>
            </TouchableOpacity>
            <Text style={{ fontSize: 12, color: 'white' }}>{`${this.currentTime} / ${this.videoLength}`}</Text>
            <View
              ref={ref => this.playerSlider = ref}
              style={{ flex: 1, marginLeft: 10 }}
            >
              <TouchableOpacity
                onPressIn={evt => {
                  this.playerSlider.measure((fx, fy, width, height, px, py) => {
                    const clickedPosition = Math.floor(evt.nativeEvent.locationX - 14);
                    if (clickedPosition < width) {
                      const seekPosition = ((clickedPosition / width) * this.state.video.duration).toFixed(0)
                      this.videoPlayer.seek(seekPosition);
                    }
                  });
                }}>
                <Slider
                  value={this.state.currentPosition}
                  maximumValue={this.videoDuration}
                  thumbTintColor="#5FC0DB"
                  maximumTrackTintColor="#A9A9A9"
                  minimumTrackTintColor="white"
                  onSlidingComplete={data => this.videoPlayer.seek(data)}
                  trackStyle={{ height: 2 }}
                  thumbStyle={{
                    width: 15,
                    height: 15,
                    borderRadius: 15 / 2,
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
  };

  onClose = () => {
    this.safeSetState({
      imageHeight: height / 1.5,
      imageWidth: width,
      isLoading: true,
      video: {},
      currentPosition: 0,
      paused: false,
    });
    this.props.onHideViewPreview();
  };
  render() {
    return (
      <Modal visible={this.props.show} onRequestClose={() => null} transparent>
        <View style={styles.modalBackground}>
          <TouchableOpacity onPress={() => this.onClose()}>
            <IconMaterialCommunity name="close" style={{ fontSize: 40, color: 'white' }} />
          </TouchableOpacity>
          <View style={{ padding: 10, width: width, alignItems: 'center' }}>
            {this.generateVideo()}
            {this.state.isLoading && <ActivityIndicator size="large" style={styles.loadingIcon} />}
          </View>
        </View>
      </Modal>
    );
  }
};

const styles = StyleSheet.create({
  loadingIcon: { position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 },
  modalBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,.5)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  playbackContainer: {
    marginTop: 5,
    flexDirection: 'row',
    backgroundColor: '#708090',
    paddingHorizontal: 8,
    alignItems: 'center',
    width: '100%',
  },
});
