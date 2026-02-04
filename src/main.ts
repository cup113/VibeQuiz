import "./style.css";

// ----------------- Type Definitions -----------------
type QuestionData = {
  question: string;
  keys: string[];
  distractors: string[];
};

type QuizQuestion = {
  question: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  userSelectedIndices: number[];
  isSubmitted: boolean;
};

type AppState = {
  view: "import" | "quiz" | "report";
  quizData: QuizQuestion[];
  currentIndex: number;
  score: number;
};

// ----------------- DOM Elements -----------------
const DOM = {
  // View containers
  importContainer: document.getElementById("importContainer") as HTMLElement,
  quizContainer: document.getElementById("quizContainer") as HTMLElement,
  reportContainer: document.getElementById("reportContainer") as HTMLElement,

  // Import view elements
  jsonInput: document.getElementById("jsonInput") as HTMLTextAreaElement,
  importBtn: document.getElementById("importBtn") as HTMLButtonElement,

  // Quiz view elements
  progressFill: document.getElementById("progressFill") as HTMLElement,
  questionCounter: document.getElementById("questionCounter") as HTMLElement,
  questionText: document.getElementById("questionText") as HTMLElement,
  optionsContainer: document.getElementById("optionsContainer") as HTMLElement,
  submitBtn: document.getElementById("submitBtn") as HTMLButtonElement,
  nextBtn: document.getElementById("nextBtn") as HTMLButtonElement,

  // Report view elements
  resultEmoji: document.getElementById("resultEmoji") as HTMLElement,
  resultPercentage: document.getElementById("resultPercentage") as HTMLElement,
  resultScore: document.getElementById("resultScore") as HTMLElement,
  aiPromptSection: document.getElementById("aiPromptSection") as HTMLElement,
  aiPrompt: document.getElementById("aiPrompt") as HTMLTextAreaElement,
  perfectScoreMessage: document.getElementById(
    "perfectScoreMessage",
  ) as HTMLElement,
  restartBtn: document.getElementById("restartBtn") as HTMLButtonElement,
};

// ----------------- State Management -----------------
const state: AppState = {
  view: "import",
  quizData: [],
  currentIndex: 0,
  score: 0,
};

// ----------------- Helper Functions -----------------
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateCorrectIndices(question: QuizQuestion): number[] {
  return question.options
    .map((opt, idx) => (opt.isCorrect ? idx : null))
    .filter((idx) => idx !== null) as number[];
}

function isQuestionCorrect(question: QuizQuestion): boolean {
  const correctIndices = calculateCorrectIndices(question);
  return (
    question.userSelectedIndices.length === correctIndices.length &&
    question.userSelectedIndices.every((idx) => correctIndices.includes(idx))
  );
}

function generateBatchAIPrompt(incorrectQuestions: QuizQuestion[]): string {
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

// ----------------- View Management -----------------
function showView(view: AppState["view"]): void {
  // Hide all views
  DOM.importContainer.classList.add("hidden");
  DOM.quizContainer.classList.add("hidden");
  DOM.reportContainer.classList.add("hidden");

  // Show the requested view
  switch (view) {
    case "import":
      DOM.importContainer.classList.remove("hidden");
      break;
    case "quiz":
      DOM.quizContainer.classList.remove("hidden");
      break;
    case "report":
      DOM.reportContainer.classList.remove("hidden");
      break;
  }
}

function updateProgress(): void {
  if (state.quizData.length === 0) return;

  const progress = ((state.currentIndex + 1) / state.quizData.length) * 100;
  DOM.progressFill.style.width = `${progress}%`;
}

function updateQuestionCounter(): void {
  DOM.questionCounter.textContent = `第 ${state.currentIndex + 1}/${state.quizData.length} 题`;
}

function createOptionElement(
  option: { text: string; isCorrect: boolean },
  index: number,
  question: QuizQuestion,
): HTMLElement {
  const optionElement = document.createElement("div");
  optionElement.dataset.index = index.toString();
  optionElement.className =
    "option-card cursor-pointer p-4 border-2 rounded-2xl flex items-center gap-4";

  const isSelected = question.userSelectedIndices.includes(index);
  let styleClass = "";

  if (question.isSubmitted) {
    if (option.isCorrect) {
      styleClass = "bg-green-50 border-green-500 text-green-900";
    } else if (isSelected) {
      styleClass = "bg-red-50 border-red-500 text-red-900";
    } else {
      styleClass = "bg-white border-gray-100 opacity-50";
    }
  } else {
    styleClass = isSelected
      ? "bg-black text-white border-black"
      : "bg-white border-gray-200 hover:border-gray-400";
  }

  optionElement.classList.add(...styleClass.split(" "));

  optionElement.innerHTML = `
    <span class="w-8 h-8 flex items-center justify-center rounded-lg border font-bold text-sm">
      ${String.fromCharCode(65 + index)}
    </span>
    <span class="font-medium">${option.text}</span>
  `;

  return optionElement;
}

function renderQuizView(): void {
  if (
    state.quizData.length === 0 ||
    state.currentIndex >= state.quizData.length
  )
    return;

  const currentQuestion = state.quizData[state.currentIndex];

  // Update progress and counter
  updateProgress();
  updateQuestionCounter();

  // Update question text
  DOM.questionText.textContent = currentQuestion.question;

  // Clear and repopulate options
  DOM.optionsContainer.innerHTML = "";
  currentQuestion.options.forEach((option, index) => {
    const optionElement = createOptionElement(option, index, currentQuestion);
    DOM.optionsContainer.appendChild(optionElement);
  });

  // Update button visibility
  if (currentQuestion.isSubmitted) {
    DOM.submitBtn.classList.add("hidden");
    DOM.nextBtn.classList.remove("hidden");

    // Update next button text
    DOM.nextBtn.textContent =
      state.currentIndex === state.quizData.length - 1
        ? "查看结果"
        : "下一题 →";
  } else {
    DOM.submitBtn.classList.remove("hidden");
    DOM.nextBtn.classList.add("hidden");
  }
}

function renderReportView(): void {
  const percentage = Math.round((state.score / state.quizData.length) * 100);
  const incorrectQuestions = state.quizData.filter(
    (q) => !isQuestionCorrect(q),
  );

  // Update result display
  DOM.resultEmoji.textContent = percentage > 70 ? "🎉" : "💡";
  DOM.resultPercentage.textContent = `${percentage}%`;
  DOM.resultScore.textContent = `正确：${state.score} / ${state.quizData.length}`;

  // Show/hide AI prompt section
  if (incorrectQuestions.length > 0) {
    DOM.aiPromptSection.classList.remove("hidden");
    DOM.perfectScoreMessage.classList.add("hidden");

    // Update AI prompt text
    DOM.aiPrompt.value = generateBatchAIPrompt(incorrectQuestions);

    // Update prompt title
    const titleElement = DOM.aiPromptSection.querySelector("h3") as HTMLElement;
    titleElement.textContent = `整合AI提示词 (${incorrectQuestions.length} 个错误)`;
  } else {
    DOM.aiPromptSection.classList.add("hidden");
    DOM.perfectScoreMessage.classList.remove("hidden");
  }
}

// ----------------- Core Logic -----------------
function importJSON(raw: string): void {
  try {
    const data = JSON.parse(raw) as QuestionData[];

    // Transform and shuffle data
    state.quizData = data.map((item) => {
      const options = [
        ...item.keys.map((key) => ({ text: key, isCorrect: true })),
        ...item.distractors.map((distractor) => ({
          text: distractor,
          isCorrect: false,
        })),
      ];

      return {
        question: item.question,
        options: shuffleArray(options),
        userSelectedIndices: [],
        isSubmitted: false,
      };
    });

    // Shuffle questions
    state.quizData = shuffleArray(state.quizData);

    // Reset state
    state.currentIndex = 0;
    state.score = 0;
    state.view = "quiz";

    // Update views
    showView("quiz");
    renderQuizView();
  } catch (error) {
    alert("❌ JSON格式无效。");
  }
}

function toggleOption(index: number): void {
  const currentQuestion = state.quizData[state.currentIndex];
  if (currentQuestion.isSubmitted) return;

  const position = currentQuestion.userSelectedIndices.indexOf(index);
  if (position > -1) {
    currentQuestion.userSelectedIndices.splice(position, 1);
  } else {
    currentQuestion.userSelectedIndices.push(index);
  }

  renderQuizView();
}

function submitCurrentQuestion(): void {
  const currentQuestion = state.quizData[state.currentIndex];
  if (currentQuestion.userSelectedIndices.length === 0) return;

  currentQuestion.isSubmitted = true;

  if (isQuestionCorrect(currentQuestion)) {
    state.score++;
  }

  renderQuizView();
}

function goToNextQuestion(): void {
  if (state.currentIndex < state.quizData.length - 1) {
    state.currentIndex++;
    renderQuizView();
  } else {
    state.view = "report";
    showView("report");
    renderReportView();
  }
}

function restartSession(): void {
  state.view = "import";
  state.quizData = [];
  state.currentIndex = 0;
  state.score = 0;

  // Clear input
  DOM.jsonInput.value = "";

  showView("import");
}

// ----------------- Event Listeners -----------------
function setupEventListeners(): void {
  // Import view
  DOM.importBtn.addEventListener("click", () => {
    importJSON(DOM.jsonInput.value);
  });

  DOM.jsonInput.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      importJSON(DOM.jsonInput.value);
    }
  });

  // Quiz view options
  DOM.optionsContainer.addEventListener("click", (e: Event) => {
    const target = e.target as HTMLElement;
    const optionElement = target.closest("[data-index]") as HTMLElement;

    if (optionElement && state.quizData.length > 0) {
      const currentQuestion = state.quizData[state.currentIndex];
      if (!currentQuestion.isSubmitted) {
        const index = parseInt(optionElement.dataset.index || "0", 10);
        toggleOption(index);
      }
    }
  });

  // Quiz view buttons
  DOM.submitBtn.addEventListener("click", submitCurrentQuestion);
  DOM.nextBtn.addEventListener("click", goToNextQuestion);

  // Report view
  DOM.aiPrompt.addEventListener("click", function () {
    this.select();
  });

  DOM.restartBtn.addEventListener("click", restartSession);
}

// ----------------- Initialization -----------------
function init(): void {
  // Validate DOM elements exist
  const requiredElements = Object.values(DOM);
  const missingElements = requiredElements.filter((el) => el === null);

  if (missingElements.length > 0) {
    console.error(
      "Some DOM elements are missing. Please check the HTML structure.",
    );
    return;
  }

  // Set up event listeners
  setupEventListeners();

  // Show initial view
  showView(state.view);
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Export for potential future module usage
export {
  state,
  importJSON,
  toggleOption,
  submitCurrentQuestion,
  goToNextQuestion,
  restartSession,
  generateBatchAIPrompt,
};
