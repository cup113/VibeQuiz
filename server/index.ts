import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import apiRouter from "./api.js";
import * as session from "./session.js";
import type { QuestionData } from "../src/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use("/api", apiRouter);

const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));

const PORT = parseInt(process.env.PORT || "3001", 10);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.error(`[VibeQuiz] HTTP server on http://localhost:${PORT}`);
});

const mcpServer = new Server(
  { name: "vibe-quiz", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_quiz",
      description: "Create a quiz session and get a shareable URL for a user to take the quiz",
      inputSchema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string", description: "The question text, specify if single-choice or multi-choice" },
                keys: { type: "array", items: { type: "string" }, description: "Array of correct answers" },
                distractors: { type: "array", items: { type: "string" }, description: "Array of incorrect options" },
              },
              required: ["question", "keys", "distractors"],
            },
          },
        },
        required: ["questions"],
      },
    },
    {
      name: "check_results",
      description: "Check if a user has completed a quiz and get their score and answers",
      inputSchema: {
        type: "object",
        properties: {
          sessionId: { type: "string", description: "The session ID returned by create_quiz" },
        },
        required: ["sessionId"],
      },
    },
  ],
}));

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "create_quiz": {
      const { questions } = request.params.arguments as {
        questions: QuestionData[];
      };

      if (!Array.isArray(questions) || questions.length === 0) {
        return {
          content: [{ type: "text", text: "Error: questions must be a non-empty array" }],
          isError: true,
        };
      }

      for (const q of questions) {
        if (!q.question || !Array.isArray(q.keys) || q.keys.length === 0 || !Array.isArray(q.distractors)) {
          return {
            content: [{ type: "text", text: "Error: each question must have a question, non-empty keys, and distractors array" }],
            isError: true,
          };
        }
      }

      const sessionId = session.createSession(questions);
      const url = `${BASE_URL}/?s=${sessionId}`;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ sessionId, url }),
          },
        ],
      };
    }

    case "check_results": {
      const { sessionId } = request.params.arguments as {
        sessionId: string;
      };

      const s = session.getSession(sessionId);
      if (!s) {
        return {
          content: [{ type: "text", text: "Session not found or expired" }],
          isError: true,
        };
      }

      if (!s.results) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ status: "pending" }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "completed",
              score: s.results.score,
              total: s.questions.length,
              percentage: Math.round((s.results.score / s.questions.length) * 100),
              questions: s.results.questions,
            }),
          },
        ],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
        isError: true,
      };
  }
});

const transportMode = process.env.MCP_TRANSPORT || "stdio";

if (transportMode === "sse") {
  const transports = new Map<string, SSEServerTransport>();

  app.get("/mcp", async (req, res) => {
    const transport = new SSEServerTransport("/mcp/message", res);
    transports.set(transport.sessionId, transport);
    res.on("close", () => transports.delete(transport.sessionId));
    await mcpServer.connect(transport);
  });

  app.post("/mcp/message", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);
    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(404).json({ error: "No active MCP session" });
    }
  });

  console.error(`[VibeQuiz] MCP transport: SSE at ${BASE_URL}/mcp`);
} else {
  const transport = new StdioServerTransport();
  mcpServer.connect(transport).catch((err) => {
    console.error("[VibeQuiz] MCP server error:", err);
    process.exit(1);
  });

  console.error("[VibeQuiz] MCP transport: stdio");
}
