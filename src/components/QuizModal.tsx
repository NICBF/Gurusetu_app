/**
 * Quiz popup modal: displays quiz questions one at a time with progress tracking.
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
  ActivityIndicator,
} from 'react-native';
import Icon from './Icon';
import type { Quiz, QuizQuestion, QuizSubmissionRequest } from '../services/quizService';
import { submitQuiz } from '../services/quizService';

export interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
  onComplete?: (score?: number, total?: number) => void;
}

export default function QuizModal({
  isOpen,
  onClose,
  quiz,
  onComplete,
}: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ score?: number; total?: number; percentage?: number } | null>(null);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return null;
  }

  const questions = quiz.questions as QuizQuestion[];
  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    if (question.id) {
      setAnswers((prev) => ({ ...prev, [question.id]: index }));
    }
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(answers[questions[currentQuestion + 1]?.id] ?? null);
    }
  };

  const handleSubmit = async () => {
    if (!quiz.id) return;
    setSubmitting(true);
    try {
      const submission: QuizSubmissionRequest = { answers };
      const response = await submitQuiz(quiz.id, submission);
      setResult({
        score: response.score,
        total: response.total ?? questions.length,
        percentage: response.percentage,
      });
      setShowResult(true);
      onComplete?.(response.score, response.total ?? questions.length);
    } catch (error) {
      console.error('[QuizModal] Error submitting quiz:', error);
      // Still show completion even if submission fails
      setShowResult(true);
      setResult({ score: Object.keys(answers).length, total: questions.length });
      onComplete?.(Object.keys(answers).length, questions.length);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setAnswers({});
    setShowResult(false);
    setResult(null);
    onClose();
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setAnswers({});
    setShowResult(false);
    setResult(null);
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.quizTitle}>{quiz.title}</Text>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Icon name="close" size={22} color="#aaa" />
              </TouchableOpacity>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                Question {currentQuestion + 1} of {questions.length}
              </Text>
            </View>
          </View>

          {showResult && result ? (
            <View style={styles.resultContainer}>
              <View style={styles.resultIcon}>
                <Text style={styles.resultEmoji}>
                  {result.percentage && result.percentage >= 70 ? '🎉' : '📝'}
                </Text>
              </View>
              <Text style={styles.resultTitle}>Quiz Completed!</Text>
              <Text style={styles.resultScore}>
                {result.score} / {result.total}
              </Text>
              {result.percentage !== undefined && (
                <Text style={styles.resultPercentage}>
                  {result.percentage.toFixed(0)}%
                </Text>
              )}
              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
                  <Text style={styles.restartBtnText}>Retake Quiz</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeResultBtn} onPress={handleClose}>
                  <Text style={styles.closeResultBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.questionText}>{question.text}</Text>
                <View style={styles.optionsContainer}>
                  {question.options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionBtn,
                        selectedOption === index && styles.selectedOption,
                      ]}
                      onPress={() => handleOptionSelect(index)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionContent}>
                        <View
                          style={[
                            styles.optionRadio,
                            selectedOption === index && styles.selectedRadio,
                          ]}
                        >
                          {selectedOption === index && (
                            <View style={styles.radioDot} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            selectedOption === index && styles.selectedOptionText,
                          ]}
                        >
                          {option}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity onPress={handleClose} style={styles.skipBtn}>
                  <Text style={styles.skipText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNext}
                  disabled={selectedOption === null || submitting}
                  style={[
                    styles.nextBtn,
                    (selectedOption === null || submitting) && styles.disabledBtn,
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.nextText}>
                      {isLastQuestion ? 'Submit' : 'Next'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
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
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quizTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    maxHeight: 400,
  },
  contentContainer: {
    paddingBottom: 8,
  },
  questionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionBtn: {
    backgroundColor: '#262626',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  selectedOption: {
    backgroundColor: '#1e3a1e',
    borderColor: '#4CAF50',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  optionText: {
    flex: 1,
    color: '#ccc',
    fontSize: 15,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
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
  skipBtn: {
    paddingVertical: 8,
  },
  skipText: {
    color: '#888',
    fontSize: 16,
  },
  nextBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#444',
    opacity: 0.6,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  resultIcon: {
    marginBottom: 16,
  },
  resultEmoji: {
    fontSize: 64,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  resultScore: {
    color: '#4CAF50',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  resultPercentage: {
    color: '#888',
    fontSize: 18,
    marginBottom: 24,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  restartBtn: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  restartBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeResultBtn: {
    flex: 1,
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeResultBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
