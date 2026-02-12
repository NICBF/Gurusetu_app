/**
 * Recorded videos for a course: GET /api/courses/:id/lectures. Read-only list with video playback.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import api from '../services/api';
import { getVideoPlayableUrl } from '../utils/videoUrl';
import { API_BASE } from '../config';

type Route = RouteProp<RootStackParamList, 'VideoList'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Lecture {
  id: string;
  title?: string;
  name?: string;
  video_path?: string;
  teaser_path?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  state?: string;
  created_at?: string;
  [key: string]: unknown;
}

const COLORS = {
  primary: '#0061A4',
  onPrimary: '#FFFFFF',
  surface: '#FDFBFF',
  surfaceContainer: '#F3F4F9',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#43474E',
  outline: '#73777F',
};

export default function VideoListScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { courseId } = route.params;
  const [list, setList] = useState<Lecture[]>([]);
  const [course, setCourse] = useState<{ intro_video_path?: string; thumbnail_url?: string; title?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        console.log('[VideoList] Fetching lectures for course:', courseId);
        const [lecturesRes, courseRes] = await Promise.all([
          api.get(`/courses/${courseId}/lectures`).catch(() => ({ data: [] })),
          api.get(`/courses/${courseId}`).catch(() => ({ data: null })),
        ]);
        console.log('[VideoList] Lectures data received:', lecturesRes.data);
        console.log('[VideoList] Course data received:', courseRes.data);
        const arr = Array.isArray(lecturesRes.data) ? lecturesRes.data : (lecturesRes.data?.lectures ?? lecturesRes.data?.items ?? []);
        if (!cancelled) {
          setList(Array.isArray(arr) ? arr : []);
          setCourse(courseRes.data || null);
          // If no lectures but course has intro_video_path, add it as first "lecture"
          if (arr.length === 0 && courseRes.data?.intro_video_path) {
            const introLecture: Lecture = {
              id: 'intro',
              title: 'Introduction',
              video_path: courseRes.data.intro_video_path,
              thumbnail_url: courseRes.data.thumbnail_url,
            };
            setList([introLecture]);
            console.log('[VideoList] Added intro video as lecture');
          }
        }
      } catch (e) {
        console.error('[VideoList] Error loading lectures:', e);
        if (!cancelled) {
          const errorMsg = e && typeof e === 'object' && 'response' in e
            ? (e as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail || 'Failed to load lectures'
            : 'Failed to load lectures';
          setError(errorMsg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoPress = (lecture: Lecture) => {
    const videoPath = lecture.video_path;
    if (!videoPath) return;

    const videoUrl = getVideoPlayableUrl(videoPath);
    if (!videoUrl) return;

    const title = lecture.title ?? lecture.name ?? `Lecture ${lecture.id}`;

    const isIntro = lecture.id === 'intro';
    navigation.navigate('VideoPlayer', {
      videoUri: videoUrl,
      title,
      courseId,
      lectureId: lecture.id,
      isIntro,
    });
  };

  const renderItem = ({ item }: { item: Lecture }) => {
    const title = item.title ?? item.name ?? `Lecture ${item.id}`;
    let thumbnail = item.thumbnail_url;
    // Make thumbnail URL absolute if relative
    if (thumbnail && !thumbnail.startsWith('http')) {
      const base = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
      thumbnail = base ? `${base}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}` : null;
    }
    const duration = formatDuration(item.duration_seconds);
    const hasVideo = !!item.video_path;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => hasVideo && handleVideoPress(item)}
        disabled={!hasVideo}
        activeOpacity={hasVideo ? 0.7 : 1}
      >
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailIcon}>▶</Text>
          </View>
        )}
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{title}</Text>
          {duration ? <Text style={styles.duration}>{duration}</Text> : null}
          {item.video_path ? (
            <Text style={styles.playText}>Tap to play video</Text>
          ) : (
            <Text style={styles.noVideoText}>Video not available</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <ActivityIndicator style={styles.centered} size="large" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      {list.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recorded lectures available</Text>
          <Text style={styles.emptySubtext}>Videos will appear here when they are added to this course.</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  centered: { flex: 1, justifyContent: 'center' },
  error: { padding: 20, color: '#c62828', textAlign: 'center' },
  listContent: {
    padding: 16,
  },
  item: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderOpacity: 0.1,
  },
  thumbnail: {
    width: 120,
    height: 80,
    backgroundColor: '#E0E0E0',
  },
  thumbnailPlaceholder: {
    width: 120,
    height: 80,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    fontSize: 32,
    color: COLORS.onPrimary,
  },
  itemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
  },
  playText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  noVideoText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
});
