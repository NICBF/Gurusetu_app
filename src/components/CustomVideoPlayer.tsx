/**
 * Custom video player – expo-video (VideoView + useVideoPlayer) with custom controls.
 * Google Drive URLs use WebView. Other URLs use expo-video.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useEvent, useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import Icon from './Icon';
import { isGoogleDriveVideoUrl, getDriveEmbedUrlFromStreamUri } from '../utils/videoUrl';
import DriveVideoPlayer from './DriveVideoPlayer';

const { width, height: screenHeight } = Dimensions.get('window');
const PLAYER_MIN_HEIGHT = Math.max(screenHeight * 0.5, width * (9 / 16));
const BOTTOM_PADDING = 60;

interface CustomVideoPlayerProps {
  videoUri: string;
  thumbnailUri?: string;
  title?: string;
  subtitle?: string;
  onEnd?: () => void;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  videoUri,
  thumbnailUri,
  title = 'GuruSetu Secure Stream',
  subtitle,
  onEnd,
}) => {
  // Check if it's a Drive URL directly, or if it's a stream URL pointing to Drive
  const isDriveVideo = isGoogleDriveVideoUrl(videoUri);
  const driveEmbedUrl = !isDriveVideo ? getDriveEmbedUrlFromStreamUri(videoUri) : null;
  const finalVideoUri = driveEmbedUrl || videoUri;
  const usingDrive = isDriveVideo || !!driveEmbedUrl;

  // Log once on mount so tapping Quizzes etc. doesn't flood terminal with video logs
  useEffect(() => {
    if (__DEV__) {
      console.log('[CustomVideoPlayer] Using player:', usingDrive ? 'WebView (Google Drive)' : 'expo-video');
    }
  }, [usingDrive]);

  // Google Drive: use dedicated DriveVideoPlayer component (WebView only, no custom controls)
  if (usingDrive) {
    return <DriveVideoPlayer driveUrl={finalVideoUri} />;
  }

  return (
    <NativeVideoPlayer
      videoUri={videoUri}
      title={title}
      subtitle={subtitle}
      onEnd={onEnd}
    />
  );
};

/** Uses expo-video (useVideoPlayer + VideoView). Only mounted for non–Drive URLs. */
function NativeVideoPlayer({
  videoUri,
  title,
  subtitle,
  onEnd,
}: Omit<CustomVideoPlayerProps, 'thumbnailUri'>) {
  const [hasStarted, setHasStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const AUTO_HIDE_MS = 3000;

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => setShowControls(false), AUTO_HIDE_MS);
  }, []);

  useEffect(() => {
    if (!showControls) return;
    hideTimerRef.current = setTimeout(() => setShowControls(false), AUTO_HIDE_MS);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [showControls]);

  const handleTapVideo = useCallback(() => {
    setShowControls((v) => !v);
  }, []);

  const player = useVideoPlayer(videoUri, (p) => {
    p.timeUpdateEventInterval = 0.5;
  });

  const statusEvent = useEvent(player, 'statusChange', { status: player.status });
  const status = (statusEvent as { status?: string } | null)?.status ?? player.status;

  const playingEvent = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const isPlaying = (playingEvent as { isPlaying?: boolean } | null)?.isPlaying ?? player.playing;

  useEventListener(player, 'timeUpdate', () => {
    const pos = player.currentTime;
    const dur = player.duration;
    setPosition(pos);
    if (dur > 0) setDuration(dur);
    if (dur > 0 && pos >= dur - 0.3) onEnd?.();
  });

  useEffect(() => {
    if (status === 'loading') setIsLoading(true);
    else if (status === 'ready') {
      setIsLoading(false);
      if (player.duration > 0) setDuration((d) => (d > 0 ? d : player.duration));
    } else if (status === 'error') {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('Failed to load video. Please check your connection.');
    }
  }, [status]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const handlePlayPause = () => {
    if (isPlaying) player.pause();
    else {
      setHasStarted(true);
      player.play();
    }
  };

  const handleSeek = (seconds: number) => {
    player.currentTime = seconds;
    setPosition(seconds);
  };

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.playerWrapper}>
        <View style={styles.videoContainer} pointerEvents="box-none">
            <View style={styles.videoWrapper} pointerEvents="none">
              <VideoView
                player={player}
                style={styles.video}
                contentFit="contain"
                nativeControls={false}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
                onFirstFrameRender={() => setIsLoading(false)}
              />
            </View>
            <View style={styles.videoOverlay} pointerEvents="box-none">
              <TouchableWithoutFeedback onPress={handleTapVideo}>
                <View style={StyleSheet.absoluteFill} />
              </TouchableWithoutFeedback>
            </View>
            <View style={styles.topOverlay} pointerEvents="none" />
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#135bec" />
              </View>
            )}
            {hasError && (
              <View style={styles.errorOverlay}>
                <Icon name="close" size={48} color="#fff" />
                <Text style={styles.errorText}>{errorMessage || 'Failed to load video'}</Text>
                <Text style={styles.errorSubtext}>
                  The backend video streaming endpoint is not configured.
                </Text>
                <Text style={styles.errorSubtext}>Please contact support or check backend configuration.</Text>
              </View>
            )}
            {showControls && (
              <View style={styles.controlsOverlay} pointerEvents="box-none">
                <TouchableWithoutFeedback onPress={resetHideTimer}>
                  <View style={styles.controlsBar}>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                        <View style={[styles.progressThumb, { left: `${progressPercentage}%` }]} />
                      </View>
                      <View style={styles.timeRow}>
                        <Text style={styles.timeText}>
                          {formatTime(position)} / {formatTime(duration)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.controlsRow}>
                      <TouchableOpacity
                        style={styles.smallControlBtn}
                        onPress={() => { resetHideTimer(); handleSeek(Math.max(0, position - 10)); }}
                      >
                        <Icon name="replay_10" size={22} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.playPauseButton}
                        onPress={() => { resetHideTimer(); handlePlayPause(); }}
                      >
                        <Icon name={isPlaying ? 'pause' : 'play_arrow'} size={40} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.smallControlBtn}
                        onPress={() => { resetHideTimer(); handleSeek(Math.min(duration || 0, position + 10)); }}
                      >
                        <Icon name="forward_10" size={22} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.smallControlBtn}
                        onPress={() => { resetHideTimer(); player.muted = !isMuted; setIsMuted(!isMuted); }}
                      >
                        <Icon name={isMuted ? 'volume_off' : 'volume_up'} size={22} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.speedButton}
                        onPress={() => {
                          resetHideTimer();
                          const speeds = [1.0, 1.25, 1.5, 2.0];
                          const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
                          player.playbackRate = next;
                          setPlaybackRate(next);
                        }}
                      >
                        <Text style={styles.speedText}>{playbackRate}x</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.smallControlBtn}>
                        <Icon name="fullscreen" size={22} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            )}
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    paddingBottom: BOTTOM_PADDING,
  },
  playerWrapper: {
    width: '100%',
    height: PLAYER_MIN_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnailContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  thumbnail: { ...StyleSheet.absoluteFillObject },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(19, 91, 236, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#135bec',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 10,
  },
  playButtonInner: { marginLeft: 4 },
  durationBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  durationText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#000',
    zIndex: 1,
    borderRadius: 0,
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 0,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '85%',
    backgroundColor: 'rgba(0,0,0,0.01)',
    zIndex: 50,
    elevation: 50,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  controlsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 100,
  },
  controlsBar: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressContainer: { marginBottom: 10 },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: { height: '100%', backgroundColor: '#135bec', borderRadius: 2 },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#135bec',
    shadowColor: '#135bec',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  timeRow: { marginTop: 4 },
  timeText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '500' },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  smallControlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 20,
  },
  errorText: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 16, textAlign: 'center' },
  errorSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8, textAlign: 'center' },
  openBrowserButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#135bec',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openBrowserText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
