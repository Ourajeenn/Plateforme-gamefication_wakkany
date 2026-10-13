/**
 * Hook for LLM Question Generation
 */

import { useState, useCallback, useRef } from 'react';
import {
  generateQuestionWithLLM,
  generateQuestionsInBatch,
  generateRoundQuestion,
  generateConsequenceQuestion,
  validateQuestion
} from '../utils/llmQuestionGenerator';

export function useLLMQuestionGenerator(initialContext = {}) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const generatedCountRef = useRef(0);

  /**
   * Generate a new question
   */
  const generateNextQuestion = useCallback(async (context = {}) => {
    setLoading(true);
    setError(null);

    try {
      const mergedContext = { ...initialContext, ...context };
      const question = await generateQuestionWithLLM(mergedContext);

      // Validate
      const validation = validateQuestion(question);
      if (!validation.valid) {
        setError(`Invalid question: ${validation.errors.join(', ')}`);
        return null;
      }

      // Store current and add to history
      if (currentQuestion) {
        setPreviousQuestions(prev => [...prev, currentQuestion].slice(-10)); // Keep last 10
      }
      setCurrentQuestion(question);
      generatedCountRef.current += 1;

      return question;
    } catch (err) {
      const errorMsg = `Failed to generate question: ${err.message}`;
      setError(errorMsg);
      console.error('[useLLMQuestionGenerator]', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentQuestion, initialContext]);

  /**
   * Generate a batch of questions
   */
  const generateBatch = useCallback(async (count = 5, context = {}) => {
    setLoading(true);
    setError(null);

    try {
      const mergedContext = { ...initialContext, ...context };
      const questions = await generateQuestionsInBatch(count, mergedContext);

      // Validate all
      const invalidQuestions = questions.filter(q => !validateQuestion(q).valid);
      if (invalidQuestions.length > 0) {
        console.warn(`${invalidQuestions.length} invalid questions generated`);
      }

      if (questions.length > 0) {
        setCurrentQuestion(questions[0]);
        setPreviousQuestions(questions.slice(1));
      }

      return questions;
    } catch (err) {
      setError(`Batch generation failed: ${err.message}`);
      console.error('[useLLMQuestionGenerator]', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [initialContext]);

  /**
   * Generate question for specific round
   */
  const generateForRound = useCallback(async (round, worldState = {}) => {
    setLoading(true);
    setError(null);

    try {
      const question = await generateRoundQuestion(round, worldState);
      
      const validation = validateQuestion(question);
      if (!validation.valid) {
        setError(`Invalid round question: ${validation.errors.join(', ')}`);
        return null;
      }

      if (currentQuestion) {
        setPreviousQuestions(prev => [...prev, currentQuestion].slice(-10));
      }
      setCurrentQuestion(question);
      generatedCountRef.current += 1;

      return question;
    } catch (err) {
      setError(`Round generation failed: ${err.message}`);
      console.error('[useLLMQuestionGenerator]', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentQuestion]);

  /**
   * Generate follow-up question based on consequence
   */
  const generateFollowUp = useCallback(async (consequence, worldState = {}) => {
    setLoading(true);
    setError(null);

    try {
      const question = await generateConsequenceQuestion(consequence, worldState);
      
      const validation = validateQuestion(question);
      if (!validation.valid) {
        setError(`Invalid consequence question: ${validation.errors.join(', ')}`);
        return null;
      }

      if (currentQuestion) {
        setPreviousQuestions(prev => [...prev, currentQuestion].slice(-10));
      }
      setCurrentQuestion(question);
      generatedCountRef.current += 1;

      return question;
    } catch (err) {
      setError(`Follow-up generation failed: ${err.message}`);
      console.error('[useLLMQuestionGenerator]', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentQuestion]);

  /**
   * Pre-load next question while current is being answered
   */
  const preloadNextQuestion = useCallback(async (context = {}) => {
    // Load in background without setting state
    try {
      const question = await generateQuestionWithLLM(context);
      validateQuestion(question);
      return question;
    } catch (err) {
      console.warn('[useLLMQuestionGenerator] Preload failed', err);
      return null;
    }
  }, []);

  /**
   * Get generation statistics
   */
  const getStats = useCallback(() => {
    return {
      generated: generatedCountRef.current,
      inHistory: previousQuestions.length,
      hasCurrentQuestion: !!currentQuestion
    };
  }, [previousQuestions.length, currentQuestion]);

  /**
   * Reset generator
   */
  const reset = useCallback(() => {
    setCurrentQuestion(null);
    setPreviousQuestions([]);
    setError(null);
    generatedCountRef.current = 0;
  }, []);

  return {
    // State
    currentQuestion,
    previousQuestions,
    loading,
    error,

    // Methods
    generateNextQuestion,
    generateBatch,
    generateForRound,
    generateFollowUp,
    preloadNextQuestion,
    getStats,
    reset
  };
}

export default useLLMQuestionGenerator;
