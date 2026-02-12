/**
 * Video player – expo-av for backend videos, WebView for Google Drive embeds.
 * Uses native controls with proper sizing for mobile.
 */
import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { isGoogleDriveVideoUrl, getDriveEmbedUrlFromStreamUri } from '../utils/videoUrl';
import Icon from '../components/Icon';
import { CustomVideoPlayer } from '../components/CustomVideoPlayer';
import VideoFeedbackModal from '../components/VideoFeedbackModal';
import { checkVideoFeedback } from '../services/videoFeedbackService';
import { getVideoToken, getPlayableVideoUrl } from '../services/videoTokenService';
import { getToken } from '../auth/storage';
import { useTheme } from '../theme/ThemeContext';

const { width, height: screenHeight } = Dimensions.get('window');
const VIDEO_WRAPPER_HEIGHT = Math.max(screenHeight * 0.5, width * (9 / 16) + 80);

type Route = RouteProp<RootStackParamList, 'VideoPlayer'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'VideoPlayer'>;

export interface CourseVideoPlayerProps {
  videoUri: string;
  title?: string;
  subtitle?: string;
  /** Thumbnail URL to show before video loads */
  thumbnailUri?: string;
  /** Course ID for video token API */
  courseId?: string;
  /** Lecture ID (for lecture videos) */
  lectureId?: string;
  /** Whether this is an intro video */
  isIntro?: boolean;
  /** When false (e.g. inline on course page), no top bar with back button */
  showHeader?: boolean;
  /** Called when native video finishes */
  onEnd?: () => void;
  /** When true, show "Rate this session" below the player */
  showFeedbackButton?: boolean;
  onFeedbackPress?: () => void;
}

export const CourseVideoPlayer: React.FC<CourseVideoPlayerProps> = ({
  videoUri,
  title,
  subtitle,
  thumbnailUri,
  courseId,
  lectureId,
  isIntro,
  showHeader = true,
  onEnd,
  showFeedbackButton,
  onFeedbackPress,
}) => {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const c = theme.colors;
  const [playableUrl, setPlayableUrl] = React.useState<string | null>(null);
  const [loadingToken, setLoadingToken] = React.useState(false);
  const [tokenError, setTokenError] = React.useState<string | null>(null);

  // Extract video path from URI for protected_videos endpoint
  const getVideoPath = (uri: string): string | undefined => {
    if (uri.includes('/api/videos/stream?ref=')) {
      const refMatch = uri.match(/ref=([^&]+)/);
      if (refMatch) {
        return decodeURIComponent(refMatch[1]);
      }
    }
    // If it's a relative path or direct path
    if (!uri.startsWith('http://') && !uri.startsWith('https://')) {
      return uri;
    }
    // If it's already a backend API URL, extract the path
    if (uri.includes('/api/videos/')) {
      const match = uri.match(/\/api\/videos\/(.+)$/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
    }
    return undefined;
  };

  // Get video token and playable URL
  React.useEffect(() => {
    if (!courseId) {
      // Fallback to original URI if no courseId
      setPlayableUrl(videoUri);
      return;
    }

    let cancelled = false;
    setLoadingToken(true);
    setTokenError(null);

    (async () => {
      try {
        const videoType = isIntro ? 'intro' : 'lecture';
        
        // Extract video_id from videoUri if possible (for Google Drive, extract file ID)
        let videoId: string | undefined;
        if (videoUri.includes('drive.google.com')) {
          const driveMatch = videoUri.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
          if (driveMatch) {
            videoId = driveMatch[1];
          }
        }
        
        const tokenResponse = await getVideoToken(courseId, videoType, lectureId, videoId);
        
        if (cancelled) return;

        const videoPath = getVideoPath(videoUri);
        const url = getPlayableVideoUrl(tokenResponse, videoPath);
        
        if (url) {
          console.log('[CourseVideoPlayer] Got playable URL:', url);
          setPlayableUrl(url);
        } else {
          console.warn('[CourseVideoPlayer] No playable URL from token response');
          setPlayableUrl(videoUri); // Fallback
        }
      } catch (error: any) {
        if (cancelled) return;
        const is404 = error?.response?.status === 404;
        if (!is404) console.error('[CourseVideoPlayer] Error getting video token:', error);

        if (is404) {
          setTokenError(null);
          // If video is backend stream?ref=... pointing to Google Drive, backend proxy often 404s – use direct Drive embed URL in WebView
          const driveEmbedUrl = getDriveEmbedUrlFromStreamUri(videoUri);
          if (driveEmbedUrl) {
            setPlayableUrl(driveEmbedUrl);
          } else {
            let fallbackUrl = videoUri;
            try {
              const token = await getToken();
              if (token && videoUri.startsWith('http')) {
                const sep = videoUri.includes('?') ? '&' : '?';
                fallbackUrl = `${videoUri}${sep}access_token=${encodeURIComponent(token)}`;
              }
            } catch (_) {
              // keep fallbackUrl as videoUri
            }
            setPlayableUrl(fallbackUrl);
          }
        } else {
          setTokenError('Failed to get video token');
          setPlayableUrl(videoUri);
        }
      } finally {
        if (!cancelled) {
          setLoadingToken(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [videoUri, courseId, lectureId, isIntro]);

  if (!videoUri) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.errorText, { color: c.text }]}>No video URL provided.</Text>
      </View>
    );
  }

  if (loadingToken) {
    return (
      <View style={[styles.videoWrapper, { backgroundColor: c.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: c.background }]}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={[styles.loadingText, { color: c.text }]}>Loading video...</Text>
        </View>
      </View>
    );
  }

  const sourceUri = playableUrl || videoUri;
  
  console.log('[CourseVideoPlayer] Final sourceUri for CustomVideoPlayer:', sourceUri);
  console.log('[CourseVideoPlayer] playableUrl:', playableUrl);
  console.log('[CourseVideoPlayer] original videoUri:', videoUri);

  return (
    <View style={[showHeader ? styles.container : styles.inlineContainer, { backgroundColor: c.background }]}>
      <View style={[styles.videoWrapper, { backgroundColor: c.background }]}>
        {tokenError && (
          <View style={[styles.errorBanner, { backgroundColor: 'rgba(255,0,0,0.8)' }]}>
            <Text style={styles.errorBannerText}>{tokenError}</Text>
          </View>
        )}
        <CustomVideoPlayer
          videoUri={sourceUri}
          thumbnailUri={thumbnailUri}
          title={title || 'GuruSetu Secure Stream'}
          subtitle={subtitle}
          onEnd={onEnd}
        />
      </View>

      {showHeader && (
        <View style={[styles.topBar, { backgroundColor: theme.isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)' }]}>
          <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
            {title || 'Lesson'}
          </Text>
          <Text style={[styles.backLink, { color: c.text }]} onPress={() => navigation.goBack()}>
            Back
          </Text>
        </View>
      )}

      {showFeedbackButton && (
        <TouchableOpacity
          style={[styles.feedbackButton, { backgroundColor: 'rgba(76, 175, 80, 0.9)' }]}
          onPress={onFeedbackPress}
          activeOpacity={0.8}
        >
          <Icon name="grading" size={20} color="#fff" />
          <Text style={styles.feedbackButtonText}>Rate this session</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

function VideoPlayerScreen() {
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const c = theme.colors;
  const { videoUri, title, courseId, lectureId, isIntro } = route.params;
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [hasFeedback, setHasFeedback] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    (async () => {
      try {
        const exists = await checkVideoFeedback(courseId, lectureId, isIntro);
        if (!cancelled) {
          setHasFeedback(exists);
        }
      } catch (e) {
        console.error('[VideoPlayer] Error checking feedback:', e);
        if (!cancelled) {
          setHasFeedback(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [courseId, lectureId, isIntro]);

  const handleVideoEnd = async () => {
    if (hasFeedback === null) {
      setTimeout(() => {
        if (!hasFeedback) setShowFeedback(true);
      }, 500);
    } else if (!hasFeedback) {
      setShowFeedback(true);
    }
  };

  const handleFeedbackPress = () => {
    if (!hasFeedback) {
      setShowFeedback(true);
    }
  };

  if (!videoUri) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.errorText, { color: c.text }]}>No video URL provided.</Text>
      </View>
    );
  }

  const canShowFeedback = !!courseId && !hasFeedback;

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <CourseVideoPlayer
        videoUri={videoUri}
        title={title}
        showHeader={true}
        onEnd={canShowFeedback ? handleVideoEnd : undefined}
        showFeedbackButton={canShowFeedback}
        onFeedbackPress={canShowFeedback ? handleFeedbackPress : undefined}
      />
      {courseId && (
        <VideoFeedbackModal
          isOpen={showFeedback && !hasFeedback}
          onClose={() => setShowFeedback(false)}
          lectureTitle={title || 'Session'}
          courseId={courseId}
          lectureId={lectureId}
          isIntro={isIntro}
          onSubmit={() => {
            setHasFeedback(true);
            setShowFeedback(false);
          }}
        />
      )}
    </View>
  );
}

export default VideoPlayerScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingBottom: 80,
  },
  container: {
    flex: 1,
  },
  inlineContainer: {
    width: '100%',
  },
  videoWrapper: {
    width: '100%',
    minHeight: VIDEO_WRAPPER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    opacity: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoHidden: {
    opacity: 0,
    position: 'absolute',
  },
  thumbWrap: {
    flex: 1,
    position: 'relative',
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerContainer: {
    flex: 1,
    position: 'relative',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  placeholderText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorSubtext: {
    color: '#999',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,0,0,0.8)',
    padding: 8,
    zIndex: 100,
  },
  errorBannerText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  debugOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,0,0,0.7)',
    padding: 5,
    zIndex: 100,
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  backLink: {
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: 12,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
