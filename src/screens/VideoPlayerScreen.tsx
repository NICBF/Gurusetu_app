/**
 * In-app video player (GuruSetu style). Adapted from HTML player.
 * Uses expo-av for playback; progress, play/pause, speed, fullscreen.
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Video, AVPlaybackStatus } from 'expo-av';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  bg: '#0a0e27',
  bgGradient: '#1a1f3a',
  primary: '#667eea',
  primaryDark: '#764ba2',
  white: '#ffffff',
  white80: 'rgba(255,255,255,0.8)',
  white20: 'rgba(255,255,255,0.2)',
  white60: 'rgba(255,255,255,0.6)',
};

type Route = RouteProp<RootStackParamList, 'VideoPlayer'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'VideoPlayer'>;

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function VideoPlayerScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { videoUri, title } = route.params;
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const isLoaded = status?.isLoaded ?? false;
  const position = isLoaded ? (status.positionMillis ?? 0) / 1000 : 0;
  const duration = isLoaded ? (status.durationMillis ?? 0) / 1000 : 0;
  const playing = isLoaded ? (status.isPlaying ?? false) : false;
  const rate = isLoaded ? (status.rate ?? 1) : 1;
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const onStatusUpdate = useCallback((s: AVPlaybackStatus) => {
    setStatus(s);
    if (s.isLoaded) {
      setLoading(false);
      if (s.error) {
        setError(s.error);
      }
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!videoRef.current || !isLoaded) return;
    try {
      if (playing) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Playback error');
    }
  }, [playing, isLoaded]);

  const seek = useCallback(
    async (frac: number) => {
      if (!videoRef.current || !isLoaded || duration <= 0) return;
      const t = Math.max(0, Math.min(duration, frac * duration));
      try {
        await videoRef.current.setPositionAsync(t * 1000);
      } catch (e) {
        console.error('[VideoPlayer] Seek error:', e);
      }
    },
    [isLoaded, duration]
  );

  const setPlaybackRate = useCallback(
    async (r: number) => {
      if (!videoRef.current || !isLoaded) return;
      try {
        await videoRef.current.setRateAsync(r, true);
        setShowSpeedMenu(false);
      } catch (e) {
        console.error('[VideoPlayer] Rate error:', e);
      }
    },
    [isLoaded]
  );

  if (!videoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No video URL provided.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title} numberOfLines={2}>{title || 'Video'}</Text>

        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            useNativeControls={false}
            resizeMode="contain"
            onPlaybackStatusUpdate={onStatusUpdate}
            onLoadStart={() => setLoading(true)}
            onError={(e) => {
              setLoading(false);
              setError(e?.nativeEvent?.error || 'Playback error');
            }}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
          {error && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Center play button */}
          {!loading && !error && (
            <TouchableOpacity
              style={[styles.playCenter, !playing && styles.playCenterVisible]}
              onPress={togglePlay}
              activeOpacity={0.9}
            >
              <Text style={styles.playIcon}>{playing ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
          )}

          {/* Controls overlay */}
          <View style={styles.controlsOverlay}>
            {/* Progress bar */}
            <TouchableOpacity
              style={styles.progressContainer}
              activeOpacity={1}
              onPress={(e) => {
                const { locationX } = e.nativeEvent;
                const w = SCREEN_WIDTH - 40;
                if (w > 0) seek(locationX / w);
              }}
            >
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </TouchableOpacity>

            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlBtn} onPress={togglePlay}>
                <Text style={styles.controlBtnText}>{playing ? '⏸' : '▶'}</Text>
              </TouchableOpacity>
              <Text style={styles.timeText}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
              <View style={styles.rightControls}>
                <View style={styles.speedWrap}>
                  <TouchableOpacity
                    style={styles.speedBtn}
                    onPress={() => setShowSpeedMenu(!showSpeedMenu)}
                  >
                    <Text style={styles.speedBtnText}>{rate.toFixed(2)}X</Text>
                  </TouchableOpacity>
                  {showSpeedMenu && (
                    <>
                      <TouchableWithoutFeedback onPress={() => setShowSpeedMenu(false)}>
                        <View style={StyleSheet.absoluteFill} />
                      </TouchableWithoutFeedback>
                      <View style={styles.speedMenu}>
                        {SPEEDS.map((r) => (
                          <TouchableOpacity
                            key={r}
                            style={[styles.speedOption, Math.abs(rate - r) < 0.01 && styles.speedOptionActive]}
                            onPress={() => setPlaybackRate(r)}
                          >
                            <Text style={styles.speedOptionText}>{r}X</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.white,
    fontSize: 14,
  },
  playCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -35,
    marginLeft: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white20,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  playCenterVisible: {
    opacity: 1,
    backgroundColor: COLORS.primary + 'cc',
  },
  playIcon: {
    fontSize: 28,
    color: COLORS.white,
    marginLeft: 4,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.white20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnText: {
    color: COLORS.white,
    fontSize: 18,
  },
  timeText: {
    color: COLORS.white,
    fontSize: 13,
    minWidth: 100,
    textAlign: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedWrap: {
    position: 'relative',
  },
  speedBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white20,
  },
  speedBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  speedMenu: {
    position: 'absolute',
    bottom: 44,
    right: 0,
    backgroundColor: 'rgba(20,20,30,0.95)',
    borderRadius: 10,
    minWidth: 100,
    overflow: 'hidden',
    zIndex: 20,
  },
  speedOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  speedOptionActive: {
    backgroundColor: COLORS.primary + '66',
  },
  speedOptionText: {
    color: COLORS.white60,
    fontSize: 14,
    textAlign: 'right',
  },
});
