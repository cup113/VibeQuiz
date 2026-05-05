import type { QuizResults } from "../src/types.js";

export function formatCheckResults(results: QuizResults, total: number): string {
  const score = results.score;
  const percentage = Math.round((score / total) * 100);

  const lines: string[] = [];
  lines.push(`📊 测验结果：${score}/${total}（${percentage}%）`);
  lines.push("");

  results.questions.forEach((q, i) => {
    const correctIndices = q.options
      .map((opt, idx) => (opt.isCorrect ? idx : -1))
      .filter((idx) => idx !== -1);
    const selectedIndices = q.userSelectedIndices;

    const correctSet = new Set(correctIndices);
    const selectedSet = new Set(selectedIndices);

    const missed = correctIndices.filter((idx) => !selectedSet.has(idx));
    const extra = selectedIndices.filter((idx) => !correctSet.has(idx));

    let label: string;
    if (missed.length === 0 && extra.length === 0) {
      label = "【正确】";
    } else if (missed.length > 0 && extra.length === 0) {
      label = `【漏选${missed.length}个】`;
    } else if (missed.length === 0 && extra.length > 0) {
      label = `【多选${extra.length}个】`;
    } else {
      label = `【漏选${missed.length}个，多选${extra.length}个】`;
    }

    const correctTexts = correctIndices.map((idx) => q.options[idx].text);
    const selectedTexts = selectedIndices.map((idx) => q.options[idx].text);

    lines.push(`${i + 1}. ${label} ${q.question}`);
    lines.push(
      selectedTexts.length > 0
        ? `   你的答案：${selectedTexts.join("、")}${q.isCorrect ? " ✓" : " ✗"}`
        : "   你的答案：（未选择）",
    );
    if (!q.isCorrect) {
      lines.push(`   正确答案：${correctTexts.join("、")}`);
    }
    lines.push("");
  });

  return lines.join("\n");
}
