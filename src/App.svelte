<script lang="ts">
  import { onMount } from 'svelte';
  import ImportView from './views/ImportView.svelte';
  import QuizView from './views/QuizView.svelte';
  import ReportView from './views/ReportView.svelte';
  import { shuffleArray, isQuestionCorrect } from './lib/helpers';
  import type { QuestionData, QuizResults, QuizQuestion } from './types';

  let view = $state<'import' | 'quiz' | 'report'>('import');
  let quizData: QuizQuestion[] = $state([]);
  let currentIndex = $state(0);
  let score = $state(0);
  let sessionId: string | null = $state(null);

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('s');
    if (sid) {
      sessionId = sid;
      loadQuizFromServer(sid);
    }
  });

  function startQuiz(data: QuestionData[]): void {
    quizData = data.map((item) => ({
      question: item.question,
      options: shuffleArray([
        ...item.keys.map((key) => ({ text: key, isCorrect: true })),
        ...item.distractors.map((distractor) => ({ text: distractor, isCorrect: false })),
      ]),
      userSelectedIndices: [],
      isSubmitted: false,
    }));
    quizData = shuffleArray(quizData);
    currentIndex = 0;
    score = 0;
    view = 'quiz';
  }

  function importJSON(raw: string): void {
    try {
      startQuiz(JSON.parse(raw) as QuestionData[]);
    } catch {
      alert('❌ JSON格式无效。');
    }
  }

  async function loadQuizFromServer(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/quiz/${id}`);
      if (!res.ok) throw new Error();
      startQuiz(await res.json() as QuestionData[]);
    } catch {
      alert('❌ 无法加载测验，请检查链接是否有效。');
    }
  }

  async function submitResultsToServer(): Promise<void> {
    if (!sessionId) return;
    const results: QuizResults = {
      questions: quizData.map((q) => ({
        question: q.question,
        options: q.options,
        userSelectedIndices: q.userSelectedIndices,
        isCorrect: isQuestionCorrect(q),
      })),
      score,
    };
    try {
      await fetch(`/api/submit/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results),
      });
    } catch { /* silent */ }
  }

  function toggleOption(index: number): void {
    const q = quizData[currentIndex];
    if (q.isSubmitted) return;
    const pos = q.userSelectedIndices.indexOf(index);
    if (pos > -1) {
      q.userSelectedIndices.splice(pos, 1);
    } else {
      q.userSelectedIndices.push(index);
    }
  }

  function submitCurrentQuestion(): void {
    const q = quizData[currentIndex];
    if (q.userSelectedIndices.length === 0) return;
    q.isSubmitted = true;
    if (isQuestionCorrect(q)) score++;
  }

  function goToNextQuestion(): void {
    if (currentIndex < quizData.length - 1) {
      currentIndex++;
    } else {
      if (sessionId) submitResultsToServer();
      view = 'report';
    }
  }

  function restartSession(): void {
    view = 'import';
    quizData = [];
    currentIndex = 0;
    score = 0;
    sessionId = null;
  }
</script>

{#if view === 'import'}
  <ImportView onimport={importJSON} />
{:else if view === 'quiz' && quizData.length > 0}
  <QuizView
    question={quizData[currentIndex]}
    index={currentIndex}
    total={quizData.length}
    ontoggle={toggleOption}
    onsubmit={submitCurrentQuestion}
    onnext={goToNextQuestion}
  />
{:else if view === 'report'}
  <ReportView {quizData} {score} onrestart={restartSession} />
{/if}
