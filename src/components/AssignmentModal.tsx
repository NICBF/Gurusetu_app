/**
 * Learner Assignments modal: ready screen and assignment panel.
 * Adapts JS code to TS/TSX with improved UI.
 */
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from './Icon';
import type { Assignment } from '../services/assignmentService';

export interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onStartAssignment?: () => void;
}

interface AttemptInfo {
  attemptCount: number;
  remainingAttempts: number;
  hasPassed: boolean;
}

export default function AssignmentModal({
  isOpen,
  onClose,
  assignment,
  onStartAssignment,
}: AssignmentModalProps) {
  const [assignmentReady, setAssignmentReady] = useState(false);

  if (!isOpen || !assignment) return null;

  const attemptCount = assignment.attempt_count ?? 0;
  const maxAttempts = assignment.max_attempts ?? 3;
  const remainingAttempts = assignment.remaining_attempts ?? (maxAttempts - attemptCount);
  const hasPassed = assignment.has_passed ?? assignment.is_completed ?? false;
  const questionCount = assignment.questions?.length ?? 0;

  const attemptInfo: AttemptInfo = {
    attemptCount,
    remainingAttempts: Math.max(0, remainingAttempts),
    hasPassed,
  };

  const handleReadyOpen = () => {
    setAssignmentReady(true);
    onStartAssignment?.();
  };

  const handleClose = () => {
    setAssignmentReady(false);
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {!assignmentReady ? (
            /* STATE 1: READY SCREEN */
            <View style={styles.readyScreen}>
              <Text style={styles.readyIcon}>📝</Text>
              <Text style={styles.readyTitle}>Are you ready for the assignment?</Text>

              <Text style={styles.description}>
                This assignment contains {questionCount} question{questionCount !== 1 ? 's' : ''}.
                {assignment.description && `\n${assignment.description}`}
              </Text>

              {hasPassed ? (
                <View style={[styles.badge, styles.badgePassed]}>
                  <Text style={styles.badgeText}>✅ Already Passed!</Text>
                </View>
              ) : remainingAttempts > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    Attempt {attemptCount + 1} of {maxAttempts} ({remainingAttempts} left)
                  </Text>
                </View>
              ) : (
                <View style={[styles.badge, styles.badgeFailed]}>
                  <Text style={styles.badgeText}>❌ No attempts remaining</Text>
                </View>
              )}

              <View style={styles.actions}>
                {!hasPassed && remainingAttempts > 0 && (
                  <TouchableOpacity style={styles.btnPrimary} onPress={handleReadyOpen}>
                    <Text style={styles.btnText}>Yes, Open Assignment</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.btnSecondary} onPress={handleClose}>
                  <Text style={styles.btnTextSecondary}>
                    {hasPassed || remainingAttempts === 0 ? 'Close' : 'Skip Assignment'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* STATE 2: ASSIGNMENT PANEL */
            <View style={styles.contentScreen}>
              <View style={styles.header}>
                <Text style={styles.headerTitle} numberOfLines={2}>
                  {assignment.title}
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Icon name="close" size={22} color="#aaa" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                {assignment.description && (
                  <Text style={styles.bodyText}>{assignment.description}</Text>
                )}
                {assignment.questions && assignment.questions.length > 0 ? (
                  <View style={styles.questionsContainer}>
                    <Text style={styles.questionsTitle}>Questions ({questionCount})</Text>
                    {assignment.questions.map((q, idx) => (
                      <View key={q.id || idx} style={styles.questionItem}>
                        <Text style={styles.questionText}>
                          {idx + 1}. {q.text}
                        </Text>
                        {q.type === 'multiple_choice' && q.options && (
                          <View style={styles.optionsContainer}>
                            {q.options.map((opt, optIdx) => (
                              <Text key={optIdx} style={styles.optionText}>
                                • {opt}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.bodyText}>Assignment questions would load here...</Text>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  popup: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  readyScreen: {
    alignItems: 'center',
  },
  readyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  readyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    fontSize: 15,
  },
  badge: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 10,
    marginBottom: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  badgePassed: {
    backgroundColor: '#1b4332',
  },
  badgeFailed: {
    backgroundColor: '#431b1b',
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
  },
  btnPrimary: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  btnSecondary: {
    padding: 10,
    alignItems: 'center',
  },
  btnTextSecondary: {
    color: '#888',
    fontSize: 15,
  },
  contentScreen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 15,
    marginBottom: 15,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  bodyText: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  questionsContainer: {
    marginTop: 8,
  },
  questionsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  questionItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  questionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 22,
  },
  optionsContainer: {
    marginLeft: 12,
    marginTop: 8,
  },
  optionText: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});
