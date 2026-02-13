/**
 * Learner Assignments modal: ready screen and assignment panel with selectable Q&A.
 */
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from './Icon';
import type { Assignment } from '../services/assignmentService';
import { submitAssignment } from '../services/assignmentService';

export interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onStartAssignment?: () => void;
  onSubmitSuccess?: () => void;
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
  onSubmitSuccess,
}: AssignmentModalProps) {
  const [assignmentReady, setAssignmentReady] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

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
    setAnswers({});
    onClose();
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitAssignment = async () => {
    const questions = assignment.questions ?? [];
    const withOptions = questions.filter((q) => {
      const opts = q.options ?? (q as { choices?: unknown[] }).choices ?? [];
      return Array.isArray(opts) && opts.length > 0;
    });
    const missing = withOptions.filter((q) => answers[String(q.id)] === undefined);
    if (missing.length > 0) {
      Alert.alert('Incomplete', 'Please select an answer for each question.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, number> = {};
      questions.forEach((q, i) => {
        const id = String(q.id ?? i);
        if (answers[id] !== undefined) payload[id] = answers[id];
      });
      await submitAssignment(String(assignment.id), { answers: payload });
      Alert.alert('Success', 'Assignment submitted successfully!');
      onSubmitSuccess?.();
      handleClose();
    } catch (e) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to submit'
        : 'Failed to submit';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.popup, { minHeight: 200 }]}>
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
                    {assignment.questions.map((q, idx) => {
                      const qId = String(q.id ?? idx);
                      const qText = (q.text ?? (q as { question_text?: string }).question_text ?? '').toString() || 'Question';
                      const opts = q.options ?? (q as { choices?: unknown[] }).choices ?? [];
                      const optionsList = Array.isArray(opts) ? opts : [];
                      const selectedIndex = answers[qId];
                      return (
                        <View key={qId} style={styles.questionItem}>
                          <Text style={styles.questionText}>
                            {idx + 1}. {qText}
                          </Text>
                          {optionsList.length > 0 ? (
                            <View style={styles.assignmentOptionsWrap}>
                              {optionsList.map((opt, optIdx) => {
                                const optText = typeof opt === 'string' ? opt : String(opt);
                                const isSelected = selectedIndex === optIdx;
                                return (
                                  <TouchableOpacity
                                    key={optIdx}
                                    style={[styles.assignmentOptionBtn, isSelected && styles.assignmentOptionBtnSelected]}
                                    onPress={() => handleSelectOption(qId, optIdx)}
                                    activeOpacity={0.7}
                                  >
                                    <Text style={[styles.assignmentOptionText, isSelected && styles.assignmentOptionTextSelected]}>
                                      {optText}
                                    </Text>
                                    <View style={[styles.assignmentOptionRadio, isSelected && styles.assignmentOptionRadioSelected]}>
                                      {isSelected && <Text style={styles.assignmentOptionCheck}>✓</Text>}
                                    </View>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          ) : null}
                        </View>
                      );
                    })}
                    <TouchableOpacity
                      style={[styles.submitAssignmentBtn, submitting && styles.submitAssignmentBtnDisabled]}
                      onPress={handleSubmitAssignment}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.submitAssignmentBtnText}>Submit Assignment</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.bodyText}>No questions for this assignment yet, or questions are still loading.</Text>
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
  assignmentOptionsWrap: {
    marginTop: 10,
    gap: 10,
  },
  assignmentOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  assignmentOptionBtnSelected: {
    borderColor: '#2196F3',
    backgroundColor: 'rgba(33,150,243,0.15)',
  },
  assignmentOptionText: {
    flex: 1,
    color: '#ccc',
    fontSize: 15,
    marginRight: 12,
  },
  assignmentOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  assignmentOptionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignmentOptionRadioSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  assignmentOptionCheck: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  submitAssignmentBtn: {
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitAssignmentBtnDisabled: {
    opacity: 0.7,
  },
  submitAssignmentBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
