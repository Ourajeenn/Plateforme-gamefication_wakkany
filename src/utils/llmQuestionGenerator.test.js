/**
 * LLM Question Generator Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateQuestionWithLLM,
  generateQuestionsInBatch,
  generateRoundQuestion,
  generateConsequenceQuestion,
  validateQuestion,
  generateFallbackQuestion
} from '../utils/llmQuestionGenerator';

describe('LLM Question Generator', () => {
  
  describe('Fallback Question Generation', () => {
    it('should generate a fallback history question', () => {
      const question = generateFallbackQuestion({ category: 'history', round: 1 });
      
      expect(question).toBeDefined();
      expect(question.id).toBeTruthy();
      expect(question.question).toBeTruthy();
      expect(question.answers).toHaveLength(4);
      expect(question.round).toBe(1);
    });

    it('should generate a fallback science question', () => {
      const question = generateFallbackQuestion({ category: 'science', round: 2 });
      
      expect(question.category).toBe('science');
      expect(question.answers.length).toBe(4);
    });

    it('should have exactly one correct answer', () => {
      const question = generateFallbackQuestion();
      const correctAnswers = question.answers.filter(a => a.isCorrect);
      
      expect(correctAnswers.length).toBeGreaterThanOrEqual(1);
    });

    it('should have consequences for all answers', () => {
      const question = generateFallbackQuestion();
      
      question.answers.forEach(answer => {
        expect(answer.consequence).toBeDefined();
        expect(answer.xpReward).toBeGreaterThan(0);
      });
    });
  });

  describe('Question Validation', () => {
    it('should validate a correct question', () => {
      const question = {
        id: 'q1',
        question: 'What is 2+2?',
        answers: [
          { text: '4', isCorrect: true, xpReward: 100, consequence: { type: 'none' } },
          { text: '5', isCorrect: false, xpReward: 0, consequence: { type: 'none' } },
          { text: '3', isCorrect: false, xpReward: 0, consequence: { type: 'none' } },
          { text: '6', isCorrect: false, xpReward: 0, consequence: { type: 'none' } }
        ]
      };

      const result = validateQuestion(question);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject a question without 4 answers', () => {
      const question = {
        id: 'q1',
        question: 'Test question',
        answers: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false }
        ]
      };

      const result = validateQuestion(question);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject a question without correct answer', () => {
      const question = {
        id: 'q1',
        question: 'Test question',
        answers: [
          { text: 'A', isCorrect: false },
          { text: 'B', isCorrect: false },
          { text: 'C', isCorrect: false },
          { text: 'D', isCorrect: false }
        ]
      };

      const result = validateQuestion(question);
      expect(result.valid).toBe(false);
    });

    it('should reject a question without ID', () => {
      const question = {
        question: 'Test',
        answers: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
          { text: 'C', isCorrect: false },
          { text: 'D', isCorrect: false }
        ]
      };

      const result = validateQuestion(question);
      expect(result.valid).toBe(false);
    });
  });

  describe('Batch Generation', () => {
    it('should generate multiple questions', async () => {
      const questions = await generateQuestionsInBatch(3, { category: 'history' });
      
      expect(questions).toHaveLength(3);
      questions.forEach(q => {
        expect(validateQuestion(q).valid).toBe(true);
      });
    });
  });

  describe('Round Questions', () => {
    it('should generate a question for a specific round', async () => {
      const worldState = { prosperity: 70, population: 1000 };
      const question = await generateRoundQuestion(5, worldState);
      
      expect(question).toBeDefined();
      expect(question.round).toBe(5);
      expect(validateQuestion(question).valid).toBe(true);
    });
  });

  describe('Consequence Questions', () => {
    it('should generate a follow-up question after a consequence', async () => {
      const consequence = {
        type: 'forest_destruction',
        description: 'Vous avez détruit la forêt'
      };
      
      const worldState = { prosperity: 40, population: 800 };
      const question = await generateConsequenceQuestion(consequence, worldState);
      
      expect(question).toBeDefined();
      expect(validateQuestion(question).valid).toBe(true);
    });
  });

  describe('Question Structure', () => {
    it('should have proper XP rewards', () => {
      const question = generateFallbackQuestion();
      
      question.answers.forEach(answer => {
        if (answer.isCorrect) {
          expect(answer.xpReward).toBeGreaterThan(0);
        }
      });
    });

    it('should have consequences with proper structure', () => {
      const question = generateFallbackQuestion();
      
      question.answers.forEach(answer => {
        const consequence = answer.consequence;
        expect(consequence).toBeDefined();
        expect(consequence.type).toBeTruthy();
        expect(consequence.description || consequence.type).toBeTruthy();
      });
    });
  });
});

describe('LLM Integration Tests', () => {
  it('should handle missing Supabase gracefully', async () => {
    const question = await generateQuestionWithLLM({ category: 'science' });
    
    expect(question).toBeDefined();
    expect(question.question).toBeTruthy();
    expect(validateQuestion(question).valid).toBe(true);
  });

  it('should generate questions continuously', async () => {
    let previousId = null;
    
    for (let i = 0; i < 5; i++) {
      const question = await generateQuestionWithLLM({ round: i });
      
      expect(question.id).toBeTruthy();
      if (previousId) {
        expect(question.id).not.toBe(previousId);
      }
      previousId = question.id;
    }
  });
});
