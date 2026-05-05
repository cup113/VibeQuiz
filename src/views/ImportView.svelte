<script lang="ts">
  let json = $state('');
  let { onimport }: { onimport: (raw: string) => void } = $props();
</script>

<div class="min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
    <div class="p-8">
      <h1 class="text-2xl font-extrabold mb-2">🧠 VibeQuiz</h1>
      <p class="text-gray-500 mb-4">导入JSON开始测验。</p>

      <details class="mb-6 bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
        <summary class="cursor-pointer text-blue-700 font-semibold text-sm flex items-center gap-2">
          <span>📝 如何使用AI提示生成JSON</span>
        </summary>
        <div class="mt-4 space-y-4">
          <div class="text-sm text-gray-700">
            <p class="mb-2">复制此提示词模板，向你最喜欢的 AI 请求生成测验问题：</p>
            <div class="bg-white p-4 rounded-xl border border-gray-200 text-xs font-mono mb-3">
<pre># 能力与规则：

## 出题方向

【输入你的出题方向】

## 干扰项设计（Distractor Quality）

- **避免主观**：干扰项必须有据可查。
- **难度适中**：干扰项应具有迷惑性，能够区分"模糊记忆"与"精准掌握"。
- **选项数量**：每题总共 3-6 个选项，若考点单一可设为 3-4 个。

# 输出格式：

输出一个 JSON 代码块，格式如下：

&#x60;&#x60;&#x60;typescript
Array&lt;&#123;
    question: string,
    keys: string[],
    distractors: string[]
&#125;&gt;
&#x60;&#x60;&#x60;</pre>
            </div>
            <div class="text-xs text-gray-500 space-y-1">
              <p class="flex items-center gap-1"><span class="inline-block w-2 h-2 bg-green-500 rounded-full"></span> <strong>示例 1（历史）：</strong> 生成 5 个关于第二次世界大战的多选题。</p>
              <p class="flex items-center gap-1"><span class="inline-block w-2 h-2 bg-blue-500 rounded-full"></span> <strong>示例 2 （编程）：</strong> 创建 3 个关于 async/await 的 JavaScript 问题。</p>
              <p class="flex items-center gap-1"><span class="inline-block w-2 h-2 bg-purple-500 rounded-full"></span> <strong>示例3（医学）：</strong> "制作4个带临床场景的解剖学问题..."</p>
            </div>
          </div>
        </div>
      </details>

      <textarea
        bind:value={json}
        placeholder={`[{"question": "...", "keys": ["..."], "distractors": ["..."]}]`}
        class="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-black outline-none transition-all custom-scrollbar"
        onkeydown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onimport(json); }}
      ></textarea>

      <button
        class="btn-primary mt-6"
        onclick={() => onimport(json)}
      >开始测验 →</button>
    </div>
  </div>
</div>
