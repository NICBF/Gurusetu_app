/**
 * Learner video feedback popup: rate session with 5 categories (smiley scale).
 * Submits to POST /api/video-feedback. Use below the course video player.
 */
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from './Icon';
import { submitVideoFeedback, type VideoFeedbackRequest } from '../services/videoFeedbackService';

const SMILEY_OPTIONS = [
  { value: 1, emoji: '😞', label: 'Needs Improvement' },
  { value: 2, emoji: '😐', label: 'OK' },
  { value: 3, emoji: '😊', label: 'Good' },
  { value: 4, emoji: '😄', label: 'Very Good' },
  { value: 5, emoji: '🤩', label: 'Excellent' },
] as const;

const CATEGORIES: { key: keyof Ratings; label: string }[] = [
  { key: 'quality', label: 'Quality of Content' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'learning_value', label: 'Learning Value' },
  { key: 'practicality', label: 'Practicality' },
  { key: 'overall_satisfaction', label: 'Overall Satisfaction' },
];

type Ratings = {
  quality: number;
  clarity: number;
  learning_value: number;
  practicality: number;
  overall_satisfaction: number;
};

const INITIAL_RATINGS: Ratings = {
  quality: 0,
  clarity: 0,
  learning_value: 0,
  practicality: 0,
  overall_satisfaction: 0,
};

export interface VideoFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectureTitle: string;
  courseId: string;
  lectureId?: string;
  isIntro?: boolean;
  onSubmit?: (ratings: Ratings) => void;
}

export default function VideoFeedbackModal({
  isOpen,
  onClose,
  lectureTitle,
  courseId,
  lectureId,
  isIntro,
  onSubmit,
}: VideoFeedbackModalProps) {
  const [ratings, setRatings] = useState<Ratings>(INITIAL_RATINGS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const setRating = (key: keyof Ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const allRated = CATEGORIES.every((cat) => ratings[cat.key] > 0);

  const handleSubmit = async () => {
    if (!allRated) {
      setError('Please rate all categories.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body: VideoFeedbackRequest = {
        course_id: courseId,
        quality_rating: ratings.quality,
        clarity_rating: ratings.clarity,
        learning_value_rating: ratings.learning_value,
        practicality_rating: ratings.practicality,
        overall_satisfaction_rating: ratings.overall_satisfaction,
      };
      if (lectureId != null) body.lecture_id = lectureId;
      if (isIntro != null) body.is_intro = isIntro;
      await submitVideoFeedback(body);
      onSubmit?.(ratings);
      onClose();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Failed to submit feedback.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    setRatings(INITIAL_RATINGS);
    setError('');
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Rate this Session</Text>
            <TouchableOpacity
              onPress={handleSkip}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon name="close" size={22} color="#aaa" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle} numberOfLines={2}>
            {lectureTitle}
          </Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {CATEGORIES.map((cat) => (
              <View key={cat.key} style={styles.catContainer}>
                <Text style={styles.catLabel}>{cat.label}</Text>
                <View style={styles.smileyRow}>
                  {SMILEY_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setRating(cat.key, opt.value)}
                      style={[
                        styles.smiley,
                        ratings[cat.key] === opt.value && styles.selectedSmiley,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.smileyEmoji}>{opt.emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          {error ? (
            <Text style={styles.errorText} numberOfLines={2}>
              {error}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSkip} disabled={submitting}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, !allRated && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!allRated || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit Feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  popup: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  scroll: {
    maxHeight: 320,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  catContainer: {
    marginBottom: 18,
  },
  catLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
  },
  smileyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smiley: {
    padding: 8,
    borderRadius: 12,
    minWidth: 44,
    alignItems: 'center',
  },
  selectedSmiley: {
    backgroundColor: '#333',
  },
  smileyEmoji: {
    fontSize: 28,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  skipText: {
    color: '#aaa',
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
