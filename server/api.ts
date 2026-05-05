import { Router } from "express";
import * as session from "./session.js";

const router = Router();

router.get("/quiz/:id", (req, res) => {
  const s = session.getSession(req.params.id);
  if (!s) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json(s.questions);
});

router.post("/submit/:id", (req, res) => {
  const success = session.submitResults(req.params.id, req.body);
  if (!success) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
