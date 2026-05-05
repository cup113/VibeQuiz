import { describe, it, expect } from 'vitest';
import { formatCheckResults } from '../format';
import type { QuizResults } from '../../src/types';

describe('formatCheckResults', () => {
  const results: QuizResults = {
    score: 1,
    questions: [
      {
        question: 'Q1 correct',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
        ],
        userSelectedIndices: [0],
        isCorrect: true,
      },
      {
        question: 'Q2 extra',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
        ],
        userSelectedIndices: [0, 1],
        isCorrect: false,
      },
      {
        question: 'Q3 missed',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: true },
        ],
        userSelectedIndices: [0],
        isCorrect: false,
      },
      {
        question: 'Q4 mixed',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
          { text: 'C', isCorrect: true },
        ],
        userSelectedIndices: [0, 1],
        isCorrect: false,
      },
    ],
  };

  const total = 4;
  const output = formatCheckResults(results, total);

  it('includes score summary', () => {
    expect(output).toContain('📊 测验结果');
    expect(output).toContain('1/4');
  });

  it('marks correct question as 【正确】', () => {
    expect(output).toContain('【正确】');
  });

  it('marks extra selection as 【多选1个】', () => {
    expect(output).toContain('【多选1个】');
  });

  it('marks missed selection as 【漏选1个】', () => {
    expect(output).toContain('【漏选1个】');
  });

  it('marks mixed as 【漏选1个，多选1个】', () => {
    expect(output).toContain('【漏选1个，多选1个】');
  });

  it('shows checkmark for correct question', () => {
    expect(output).toContain('✓');
  });

  it('shows cross for incorrect questions', () => {
    expect(output).toContain('✗');
  });

  it('shows correct answer for incorrect questions', () => {
    expect(output).toContain('正确答案');
  });

  it('does not show correct answer for correct question', () => {
    const correctLine = output.split('\n').find((l) => l.includes('Q1 correct'));
    const afterQ1 = output.slice(output.indexOf('Q1 correct'), output.indexOf('Q2 extra'));
    expect(afterQ1).not.toContain('正确答案');
  });

  it('joins multiple answers with 、', () => {
    expect(output).toContain('、');
  });
});
