// server.js - static site + ChatGPT AI endpoint

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const OpenAI = require("openai");


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


const publicPath = path.join(__dirname, "public");
console.log("[server] Serving static files from:", publicPath);
app.use(express.static(publicPath));
app.use(bodyParser.json());


let client = null;
if (process.env.OPENAI_API_KEY) {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.warn("[server] WARNING: OPENAI_API_KEY is not set. /api/chat will return an error.");
}


app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


app.post("/api/chat", async (req, res) => {
  if (!client) {
    return res.status(500).json({
      error: "AI is not configured. Please set OPENAI_API_KEY on the server."
    });
  }

  try {
    const { question, code } = req.body || {};

    const prompt = `
You are a helpful assistant for game developers using Unity C#.

User question:
${question || ""}

Here is the code snippet from the website:
${code || ""}

TASK:
Explain how to integrate or adapt this code into their Unity project.
Give clear, step-by-step instructions and mention important components, settings, or common pitfalls.

FORMAT RULES:
- If the user writes in Chinese, answer in Chinese. Otherwise, answer in English.
- Use short paragraphs and numbered steps (1., 2., 3., ...).
- Do NOT use any Markdown syntax: no headings (###), no bullet points (-, *), no horizontal rules (---), no bold (**text**).
- Do NOT wrap code in backticks. If you need to show code, prefix the line with "Code: ".
- Keep the answer compact and focused on integration steps, not theory.
`;

const completion = await client.chat.completions.create({
  model: "gpt-4.1-mini",
  messages: [
    {
      role: "system",
      content:
        "You help users integrate Unity C# snippets into their own projects. Always follow the format rules in the user prompt: plain text only, no Markdown."
    },
    { role: "user", content: prompt }
  ]
});

    const answer =
      completion.choices &&
      completion.choices[0] &&
      completion.choices[0].message &&
      completion.choices[0].message.content
        ? completion.choices[0].message.content
        : "No answer returned from AI.";

    res.json({ answer });
  } catch (err) {
    console.error("[/api/chat] Error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});


app.listen(port, () => {
  console.log(`[server] Server listening at http://localhost:${port}`);
});
