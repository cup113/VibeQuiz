import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import type { QuestionData, QuizResults } from "../src/types.js";

export type Session = {
  questions: QuestionData[];
  results: QuizResults | null;
  createdAt: number;
};

const sessions = new Map<string, Session>();
const TTL = 60 * 60 * 1000;
const FILE_PATH = path.join(process.cwd(), ".sessions.json");

function load(): void {
  if (!existsSync(FILE_PATH)) return;
  try {
    const raw = readFileSync(FILE_PATH, "utf-8");
    const data = JSON.parse(raw) as [string, Session][];
    for (const [id, s] of data) {
      sessions.set(id, s);
    }
  } catch {
    console.error("[VibeQuiz] Failed to load sessions, starting fresh");
  }
}

function save(): void {
  try {
    const data = JSON.stringify([...sessions.entries()]);
    writeFileSync(FILE_PATH, data, "utf-8");
  } catch {
    console.error("[VibeQuiz] Failed to save sessions");
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.createdAt > TTL) {
      sessions.delete(id);
    }
  }
  save();
}, 10 * 60 * 1000);

load();

export function createSession(data: QuestionData[]): string {
  const id = crypto.randomUUID();
  sessions.set(id, {
    questions: data,
    results: null,
    createdAt: Date.now(),
  });
  save();
  return id;
}

export function getSession(id: string): Session | undefined {
  const s = sessions.get(id);
  if (!s) return undefined;
  if (Date.now() - s.createdAt > TTL) {
    sessions.delete(id);
    save();
    return undefined;
  }
  return s;
}

export function submitResults(id: string, results: QuizResults): boolean {
  const s = sessions.get(id);
  if (!s) return false;
  s.results = results;
  save();
  return true;
}
