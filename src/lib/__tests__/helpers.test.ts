import { describe, it, expect } from 'vitest';
import { shuffleArray, isQuestionCorrect, generateBatchAIPrompt } from '../helpers';
import type { QuizQuestion } from '../../types';

describe('shuffleArray', () => {
  it('returns array of same length', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleArray(arr)).toHaveLength(5);
  });

  it('contains same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleArray(arr).sort()).toEqual(arr);
  });

  it('does not mutate input', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(copy);
  });

  it('handles empty array', () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it('handles single element', () => {
    expect(shuffleArray([42])).toEqual([42]);
  });
});

describe('isQuestionCorrect', () => {
  const base: QuizQuestion = {
    question: 'test',
    options: [
      { text: 'A', isCorrect: true },
      { text: 'B', isCorrect: true },
      { text: 'C', isCorrect: false },
      { text: 'D', isCorrect: false },
    ],
    userSelectedIndices: [],
    isSubmitted: true,
  };

  it('returns true when all correct selected and no wrong ones', () => {
    expect(isQuestionCorrect({ ...base, userSelectedIndices: [0, 1] })).toBe(true);
  });

  it('returns false when extra wrong option selected', () => {
    expect(isQuestionCorrect({ ...base, userSelectedIndices: [0, 1, 2] })).toBe(false);
  });

  it('returns false when some correct options missed', () => {
    expect(isQuestionCorrect({ ...base, userSelectedIndices: [0] })).toBe(false);
  });

  it('returns false when nothing selected', () => {
    expect(isQuestionCorrect(base)).toBe(false);
  });

  it('returns false when only wrong options selected', () => {
    expect(isQuestionCorrect({ ...base, userSelectedIndices: [2, 3] })).toBe(false);
  });
});

describe('generateBatchAIPrompt', () => {
  function question(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
    return {
      question: 'What is 2+2?',
      options: [
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false },
        { text: '6', isCorrect: false },
      ],
      userSelectedIndices: [],
      isSubmitted: true,
      ...overrides,
    };
  }

  it('returns header even with no incorrect questions', () => {
    const result = generateBatchAIPrompt([]);
    expect(result).toContain('工作流程');
  });

  it('includes question text for incorrect questions', () => {
    const q = question({ userSelectedIndices: [1] });
    const result = generateBatchAIPrompt([q]);
    expect(result).toContain('What is 2+2?');
  });

  it('includes correct answer and user selection labels', () => {
    const q = question({ userSelectedIndices: [1] });
    const result = generateBatchAIPrompt([q]);
    expect(result).toContain('【正确答案】');
    expect(result).toContain('【我的选择】');
  });

  it('includes all questions when multiple incorrect', () => {
    const q1 = question({ question: 'Q1', userSelectedIndices: [1] });
    const q2 = question({ question: 'Q2', userSelectedIndices: [1] });
    const result = generateBatchAIPrompt([q1, q2]);
    expect(result).toContain('Q1');
    expect(result).toContain('Q2');
  });
});
