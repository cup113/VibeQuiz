import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(() => false),
}));

describe('session store', () => {
  let session: typeof import('../session');

  beforeEach(async () => {
    vi.resetModules();
    session = await import('../session');
  });

  it('createSession returns a UUID string', () => {
    const id = session.createSession([{ question: 'q', keys: ['a'], distractors: ['b'] }]);
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('getSession returns session for valid id', () => {
    const id = session.createSession([{ question: 'q', keys: ['a'], distractors: ['b'] }]);
    const s = session.getSession(id);
    expect(s).toBeDefined();
    expect(s!.questions).toHaveLength(1);
  });

  it('getSession returns undefined for unknown id', () => {
    expect(session.getSession('nonexistent')).toBeUndefined();
  });

  it('submitResults stores results and returns true', () => {
    const id = session.createSession([{ question: 'q', keys: ['a'], distractors: ['b'] }]);
    const ok = session.submitResults(id, { score: 1, questions: [] });
    expect(ok).toBe(true);
    const s = session.getSession(id);
    expect(s!.results).toEqual({ score: 1, questions: [] });
  });

  it('submitResults returns false for unknown session', () => {
    expect(session.submitResults('nonexistent', { score: 1, questions: [] })).toBe(false);
  });

  it('getSession returns undefined for expired session', async () => {
    vi.useFakeTimers();
    const id = session.createSession([{ question: 'q', keys: ['a'], distractors: ['b'] }]);
    vi.advanceTimersByTime(61 * 60 * 1000);
    expect(session.getSession(id)).toBeUndefined();
    vi.useRealTimers();
  });

  it('multiple sessions are independent', () => {
    const id1 = session.createSession([{ question: 'q1', keys: ['a'], distractors: ['b'] }]);
    const id2 = session.createSession([{ question: 'q2', keys: ['c'], distractors: ['d'] }]);
    expect(id1).not.toBe(id2);
    const s1 = session.getSession(id1);
    const s2 = session.getSession(id2);
    expect(s1!.questions[0].question).toBe('q1');
    expect(s2!.questions[0].question).toBe('q2');
  });
});
