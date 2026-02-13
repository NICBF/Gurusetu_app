/**
 * Quiz popup modal – adapted from HTML design.
 * Progress (Question X of Y, % Complete), question text, selectable options, Submit Answer, Skip.
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from './Icon';
import type { Quiz, QuizQuestion, QuizSubmissionRequest, QuizSubmissionResponse } from '../services/quizService';
import { submitQuiz } from '../services/quizService';

const PRIMARY = '#2b6cee';

export interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
  onComplete?: (response: QuizSubmissionResponse) => void;
}

function normalizeOptions(question: QuizQuestion | null): string[] {
  if (!question) return [];
  const raw = (question as QuizQuestion & { choices?: unknown[]; answers?: unknown[] }).options
    ?? (question as { choices?: unknown[] }).choices
    ?? (question as { answers?: unknown[] }).answers;
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((opt: unknown) => {
    if (typeof opt === 'string') return opt;
    if (opt && typeof opt === 'object') {
      const o = opt as Record<string, unknown>;
      const s = o.text ?? o.label ?? o.value ?? o.option ?? o.option_text ?? o.name;
      if (s != null && s !== '') return String(s);
    }
    return String(opt ?? '');
  });
}

export default function QuizModal({
  isOpen,
  onClose,
  quiz,
  onComplete,
}: QuizModalProps) {
  const [quizReady, setQuizReady] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ score?: number; total?: number; percentage?: number } | null>(null);

  const questions = useMemo(() => (quiz?.questions ?? []) as QuizQuestion[], [quiz?.questions]);
  const hasQuestions = questions.length > 0;
  const question = hasQuestions ? questions[currentQuestion] : null;
  const options = useMemo(() => normalizeOptions(question ?? null), [question]);
  const questionText = useMemo(
    () => (question?.text ?? (question as { question_text?: string })?.question_text ?? '').toString() || 'Question',
    [question]
  );

  const attemptCount = quiz?.attempt_count ?? 0;
  const maxAttempts = quiz?.max_attempts ?? 3;
  const remainingAttempts =
    quiz?.remaining_attempts !== undefined && quiz?.remaining_attempts !== null
      ? Math.max(0, quiz.remaining_attempts)
      : Math.max(0, maxAttempts - attemptCount);
  const hasPassed = quiz?.is_completed === true || quiz?.has_passed === true;

  useEffect(() => {
    if (isOpen) {
      setQuizReady(false);
      setCurrentQuestion(0);
      setSelectedOption(null);
      setAnswers({});
      setShowResult(false);
      setResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (!quiz) return null;

  if (!hasQuestions || !question) {
    return (
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Icon name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
            <Text style={styles.quizTitle}>{quiz.title || 'Quiz'}</Text>
            <Text style={styles.emptyText}>No questions available for this quiz yet.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={onClose}>
              <Text style={styles.primaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  /* Ready screen – attempts info, same pattern as Assignment */
  if (!quizReady) {
    const shortDesc = quiz.description
      ? quiz.description.length > 180
        ? `${quiz.description.slice(0, 180).trim()}…`
        : quiz.description
      : '';
    return (
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Icon name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
            <Text style={styles.readyIcon}>❓</Text>
            <Text style={styles.readyTitle}>Are you ready for the quiz?</Text>
            <ScrollView style={styles.readyScroll} contentContainerStyle={styles.readyScrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.readyDesc}>
                This quiz contains {questions.length} question{questions.length !== 1 ? 's' : ''}.
                {shortDesc ? `\n${shortDesc}` : ''}
              </Text>
            {hasPassed ? (
              <View style={[styles.attemptBadge, styles.attemptBadgePassed]}>
                <Text style={styles.attemptBadgeText}>✅ Already passed</Text>
              </View>
            ) : remainingAttempts <= 0 ? (
              <View style={[styles.attemptBadge, styles.attemptBadgeFailed]}>
                <Text style={styles.attemptBadgeText}>❌ No attempts remaining</Text>
              </View>
            ) : (
              <View style={styles.attemptBadge}>
                <Text style={styles.attemptBadgeText}>
                  Attempt {attemptCount + 1} of {maxAttempts} ({remainingAttempts} left)
                </Text>
              </View>
            )}
              <View style={styles.readyActions}>
                {!hasPassed && remainingAttempts > 0 && (
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => setQuizReady(true)}>
                    <Text style={styles.primaryBtnText}>Yes, Start Quiz</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
                  <Text style={styles.skipText}>
                    {hasPassed || remainingAttempts <= 0 ? 'Close' : 'Skip Quiz'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  const isLastQuestion = currentQuestion === questions.length - 1;
  const progressPct = Math.round(((currentQuestion + 1) / questions.length) * 100);

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    const qId = question.id ?? String(currentQuestion);
    setAnswers((prev) => ({ ...prev, [qId]: index }));
  };

  const handleSubmitAnswer = () => {
    if (options.length > 0 && selectedOption === null) return;
    if (isLastQuestion) {
      handleSubmit();
    } else {
      const nextIdx = currentQuestion + 1;
      const nextQ = questions[nextIdx];
      const nextId = nextQ?.id ?? String(nextIdx);
      setCurrentQuestion(nextIdx);
      setSelectedOption((answers[nextId] as number) ?? null);
    }
  };

  const handleSubmit = async () => {
    const quizId = quiz.id != null ? String(quiz.id) : '';
    if (!quizId) return;
    const qId = question.id ?? String(currentQuestion);
    const finalAnswers = { ...answers };
    if (options.length > 0 && selectedOption !== null) finalAnswers[qId] = selectedOption;
    // Backend expects answers keyed by question index ("0", "1", "2"), not question id
    const indexKeyedAnswers: Record<string, number> = {};
    questions.forEach((q, idx) => {
      const id = q.id ?? String(idx);
      const val = finalAnswers[id];
      if (val !== undefined && val !== null) indexKeyedAnswers[String(idx)] = Number(val);
    });
    setSubmitting(true);
    try {
      const response = await submitQuiz(quizId, indexKeyedAnswers as QuizSubmissionRequest['answers']);
      setResult({
        score: response.score,
        total: response.total ?? questions.length,
        percentage: response.percentage,
      });
      setShowResult(true);
      onComplete?.(response);
    } catch (error) {
      console.error('[QuizModal] Submit error:', error);
      setShowResult(true);
      setResult({ score: Object.keys(answers).length, total: questions.length });
      onComplete?.({ score: Object.keys(answers).length, total: questions.length });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (isLastQuestion) {
      onClose();
      return;
    }
    const nextIdx = currentQuestion + 1;
    const nextQ = questions[nextIdx];
    const nextId = nextQ?.id ?? String(nextIdx);
    setCurrentQuestion(nextIdx);
    setSelectedOption((answers[nextId] as number) ?? null);
  };

  const handleClose = () => {
    setQuizReady(false);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setAnswers({});
    setShowResult(false);
    setResult(null);
    onClose();
  };

  if (showResult && result) {
    return (
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose} statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.resultEmoji}>{result.percentage != null && result.percentage >= 70 ? '🎉' : '📝'}</Text>
            <Text style={styles.resultTitle}>Quiz Completed!</Text>
            <Text style={styles.resultScore}>{result.score} / {result.total}</Text>
            {result.percentage != null && (
              <Text style={styles.resultPct}>{result.percentage.toFixed(0)}%</Text>
            )}
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleClose}>
                <Text style={styles.secondaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Icon name="close" size={24} color="#94a3b8" />
          </TouchableOpacity>

          {/* Progress – Question X of Y, % Complete */}
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                Question {currentQuestion + 1} of {questions.length}
              </Text>
              <Text style={styles.progressPct}>{progressPct}% Complete</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>

          {/* Question + options – scrollable, fills middle */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.questionText}>{questionText}</Text>
            <View style={styles.optionsWrap}>
              {options.length > 0 ? (
                options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                      onPress={() => handleOptionSelect(index)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.optionRadio, isSelected && styles.optionRadioSelected]}>
                        {isSelected && <View style={styles.optionRadioDot} />}
                      </View>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]} numberOfLines={2}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.emptyOptionText}>No options for this question.</Text>
              )}
            </View>
          </ScrollView>

          {/* Actions – pinned to bottom */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryBtn, (options.length > 0 && selectedOption === null) && styles.primaryBtnDisabled]}
              onPress={handleSubmitAnswer}
              disabled={submitting || (options.length > 0 && selectedOption === null)}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {isLastQuestion ? 'Submit Answer' : 'Next'} →
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip this question</Text>
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
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    maxHeight: '90%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  quizTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 24,
  },
  readyIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  readyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  readyScroll: {
    flex: 1,
    minHeight: 0,
  },
  readyScrollContent: {
    paddingBottom: 16,
  },
  readyDesc: {
    color: '#94a3b8',
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  attemptBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    marginBottom: 24,
  },
  attemptBadgePassed: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  attemptBadgeFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  attemptBadgeText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  readyActions: {
    gap: 12,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  progressPct: {
    fontSize: 12,
    color: '#94a3b8',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 3,
  },
  contentScroll: {
    flex: 1,
    minHeight: 0,
  },
  contentScrollContent: {
    paddingBottom: 16,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f1f5f9',
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsWrap: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  optionRowSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + '15',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#64748b',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  optionRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#cbd5e1',
  },
  optionLabelSelected: {
    color: PRIMARY,
    fontWeight: '600',
  },
  emptyOptionText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
  },
  actions: {
    paddingTop: 16,
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '500',
  },
  secondaryBtn: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultEmoji: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  resultScore: {
    color: '#22c55e',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  resultPct: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  resultActions: {
    marginTop: 8,
  },
});
