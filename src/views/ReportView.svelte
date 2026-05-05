<script lang="ts">
  import type { QuizQuestion } from '../types';
  import { isQuestionCorrect, generateBatchAIPrompt } from '../lib/helpers';

  let {
    quizData,
    score,
    onrestart,
  }: {
    quizData: QuizQuestion[];
    score: number;
    onrestart: () => void;
  } = $props();

  let total = $derived(quizData.length);
  let percentage = $derived(Math.round((score / total) * 100));
  let incorrectQuestions = $derived(quizData.filter((q) => !isQuestionCorrect(q)));
  let aiPrompt = $derived(generateBatchAIPrompt(incorrectQuestions));

  function selectText(e: Event): void {
    (e.target as HTMLTextAreaElement).select();
  }
</script>

<div class="min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
    <div class="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div class="text-center mb-10">
        <div class="text-5xl mb-4">{percentage > 70 ? '🎉' : '💡'}</div>
        <h1 class="text-4xl font-black">{percentage}%</h1>
        <p class="text-gray-500">正确：{score} / {total}</p>
      </div>

      {#if incorrectQuestions.length > 0}
        <div class="mb-8 p-6 bg-red-50/50 border border-red-100 rounded-3xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-black text-red-500 uppercase tracking-widest">整合AI提示词</h3>
            <span class="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">批量模式</span>
          </div>
          <p class="text-xs text-red-400 mb-3 leading-relaxed">将下方文本复制到您常用的 AI 中，一次性分析所有错误。</p>
          <textarea
            readonly
            value={aiPrompt}
            class="w-full h-80 p-4 text-xs font-mono bg-white border border-red-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400 custom-scrollbar"
            onclick={selectText}
          ></textarea>
          <div class="mt-4 text-center">
            <p class="text-[10px] text-gray-400">点击文本框全选文本</p>
          </div>
        </div>
      {:else}
        <div class="p-12 text-center bg-green-50 rounded-3xl text-green-700 font-bold mb-8 italic">
          "完美掌握！您已经完全掌握这组题目。"
        </div>
      {/if}

      <button class="btn-primary" onclick={onrestart}>重新开始</button>
    </div>
  </div>
</div>
