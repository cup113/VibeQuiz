<script lang="ts">
  import type { QuizQuestion } from '../types';

  let {
    question,
    index,
    total,
    ontoggle,
    onsubmit,
    onnext,
  }: {
    question: QuizQuestion;
    index: number;
    total: number;
    ontoggle: (i: number) => void;
    onsubmit: () => void;
    onnext: () => void;
  } = $props();

  let isLast = $derived(index === total - 1);
  let progress = $derived(((index + 1) / total) * 100);
</script>

<div class="min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
    <div class="h-2 bg-gray-100 w-full">
      <div class="h-full bg-black transition-all duration-500" style="width: {progress}%"></div>
    </div>
    <div class="p-8">
      <div class="flex justify-between items-center mb-8">
        <span class="text-xs font-bold uppercase tracking-widest text-gray-400">第 {index + 1}/{total} 题</span>
      </div>
      <h2 class="text-xl font-bold mb-8 leading-snug">{question.question}</h2>
      <div class="space-y-3">
        {#each question.options as option, i (i)}
          {@const selected = question.userSelectedIndices.includes(i)}
          {@const cls = question.isSubmitted
            ? option.isCorrect
              ? 'bg-green-50 border-green-500 text-green-900'
              : selected
                ? 'bg-red-50 border-red-500 text-red-900'
                : 'bg-white border-gray-100 opacity-50'
            : selected
              ? 'bg-black text-white border-black'
              : 'bg-white border-gray-200 hover:border-gray-400'}
          <div
            class="option-card cursor-pointer p-4 border-2 rounded-2xl flex items-center gap-4 {cls}"
            role="button"
            tabindex="0"
            onclick={() => { if (!question.isSubmitted) ontoggle(i); }}
            onkeydown={(e) => { if (!question.isSubmitted && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); ontoggle(i); } }}
          >
            <span class="w-8 h-8 flex items-center justify-center rounded-lg border font-bold text-sm">{String.fromCharCode(65 + i)}</span>
            <span class="font-medium">{option.text}</span>
          </div>
        {/each}
      </div>
      <div class="mt-10">
        {#if !question.isSubmitted}
          <button class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed" disabled={question.userSelectedIndices.length === 0} onclick={onsubmit}>检查答案</button>
        {:else}
          <button class="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold" onclick={onnext}>{isLast ? '查看结果' : '下一题 →'}</button>
        {/if}
      </div>
    </div>
  </div>
</div>
