import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(() => false),
}));

describe('API routes', () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.resetModules();
    const apiRouter = (await import('../api')).default;
    app = express();
    app.use(express.json());
    app.use('/api', apiRouter);
  });

  it('GET /api/quiz/:id returns 404 for unknown session', async () => {
    const res = await request(app).get('/api/quiz/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Session not found' });
  });

  it('GET /api/quiz/:id returns questions for valid session', async () => {
    const session = await import('../session');
    const id = session.createSession([
      { question: 'Q1', keys: ['a'], distractors: ['b', 'c'] },
    ]);
    const res = await request(app).get(`/api/quiz/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].question).toBe('Q1');
  });

  it('POST /api/submit/:id returns 404 for unknown session', async () => {
    const res = await request(app)
      .post('/api/submit/unknown')
      .send({ score: 1, questions: [] });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Session not found' });
  });

  it('POST /api/submit/:id stores results', async () => {
    const session = await import('../session');
    const id = session.createSession([
      { question: 'Q1', keys: ['a'], distractors: ['b'] },
    ]);
    const results = { score: 0, questions: [] };
    const res = await request(app).post(`/api/submit/${id}`).send(results);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    const s = session.getSession(id);
    expect(s!.results).toEqual(results);
  });
});
