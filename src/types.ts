export type QuestionData = {
  question: string;
  keys: string[];
  distractors: string[];
};

export type QuizOption = {
  text: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  question: string;
  options: QuizOption[];
  userSelectedIndices: number[];
  isSubmitted: boolean;
};

export type SubmittedQuestion = {
  question: string;
  options: QuizOption[];
  userSelectedIndices: number[];
  isCorrect: boolean;
};

export type QuizResults = {
  questions: SubmittedQuestion[];
  score: number;
};
