import type { QuizQuestion } from '../types';

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function isQuestionCorrect(question: QuizQuestion): boolean {
  const correctIndices = question.options
    .map((opt, idx) => (opt.isCorrect ? idx : null))
    .filter((idx) => idx !== null) as number[];
  return (
    question.userSelectedIndices.length === correctIndices.length &&
    question.userSelectedIndices.every((idx) => correctIndices.includes(idx))
  );
}

export function generateBatchAIPrompt(incorrectQuestions: QuizQuestion[]): string {
  const header = `工作流程：
1. 针对每一道错题：
  1.1. 评估题目质量（无歧义性、区分度）：1~5分。
  1.2. 解释为什么我的答案不对，正确答案又为什么正确。
2. 最后总结我在这组题目中暴露出的核心知识盲区。
`;

  const body = incorrectQuestions
    .map((q, idx) => {
      const optionsStr = q.options
        .map((o, i) => `${String.fromCharCode(65 + i)}. ${o.text}`)
        .join("\n");

      const correctStr = q.options
        .map((o, i) => ({ ...o, option: String.fromCharCode(65 + i) }))
        .filter((o) => o.isCorrect)
        .map((o) => o.option)
        .join("");

      const userStr =
        q.userSelectedIndices.length > 0
          ? q.userSelectedIndices
              .map((i) => String.fromCharCode(65 + i))
              .join("")
          : "None";

      return `【题目 #${idx + 1}】 ${q.question}
${optionsStr}

【正确答案】${correctStr}；【我的选择】${userStr}。
---`;
    })
    .join("\n\n");

  return header + body;
}
