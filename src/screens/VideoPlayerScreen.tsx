/**
 * Single inline video player – expo-av only (WebView fallback for Google Drive).
 * No extras: no saveProgress, no speed menu, no custom controls. Used on course page and as standalone screen.
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import { isGoogleDriveVideoUrl, getDriveEmbedUrl } from '../utils/videoUrl';

const { width } = Dimensions.get('window');

type Route = RouteProp<RootStackParamList, 'VideoPlayer'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'VideoPlayer'>;

export interface CourseVideoPlayerProps {
  videoUri: string;
  title?: string;
  /** When false (e.g. inline on course page), no top bar with back button */
  showHeader?: boolean;
}

export const CourseVideoPlayer: React.FC<CourseVideoPlayerProps> = ({
  videoUri,
  title,
  showHeader = true,
}) => {
  const navigation = useNavigation<Nav>();

  if (!videoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No video URL provided.</Text>
      </View>
    );
  }

  const driveRef =
    typeof videoUri === 'string' && videoUri.includes('ref=')
      ? decodeURIComponent(videoUri.split('ref=')[1] || '')
      : '';
  const isDrive = !!driveRef && isGoogleDriveVideoUrl(driveRef);
  const sourceUri = isDrive ? getDriveEmbedUrl(driveRef) : videoUri;

  return (
    <View style={styles.container}>
      {isDrive ? (
        <WebView
          source={{ uri: sourceUri }}
          style={styles.video}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      ) : (
        <Video
          source={{ uri: sourceUri }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
        />
      )}

      {showHeader && (
        <View style={styles.topBar}>
          <Text style={styles.title} numberOfLines={1}>
            {title || 'Lesson'}
          </Text>
          <Text style={styles.backLink} onPress={() => navigation.goBack()}>
            Back
          </Text>
        </View>
      )}
    </View>
  );
};

function VideoPlayerScreen() {
  const route = useRoute<Route>();
  const { videoUri, title } = route.params;

  if (!videoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No video URL provided.</Text>
      </View>
    );
  }

  return (
    <CourseVideoPlayer videoUri={videoUri} title={title} showHeader={true} />
  );
}

export default VideoPlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: width * 0.56,
    backgroundColor: '#000',
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backLink: {
    color: '#fff',
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
});
