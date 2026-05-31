import express from "express";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { pipeline } from '@huggingface/transformers';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

// 1. Initialize Hugging Face pipeline locally (384-dimension vector transformer)
const generateEmbedding = await pipeline('feature-extraction', 'Supabase/gte-small');

const app = express();

const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    process.env.FRONTEND_ORIGIN,
    "https://fyodor-dostoevsky-retrieval.vercel.app",
  ].filter((o): o is string => Boolean(o)),
);

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Pass a pure RegExp object instead of a string to bypass path-to-regexp parsing completely
app.all(/^\/api\/auth\/(.*)/, (req, res) => {
  return toNodeHandler(auth)(req, res);
});


app.use(express.json());

// 2. Set up the Prisma v7 Driver Adapter for standard PostgreSQL connections
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 3. Initialize the LangChain ChatGroq Instance using the active Llama 3.1 model
const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY || "fallback-key-for-typescript",
    model: "llama-3.1-8b-instant", 
    temperature: 0.2, 
});

// 4. Declare a balanced Prompt Template that handles broad summaries and strict context searches
const OFF_TOPIC_REPLY = "ahn !! my mother didn't taught me about this";
/** Cosine distance from pgvector — above this, chunks are too weak to answer from the book */
const RELEVANCE_DISTANCE_THRESHOLD = 0.42;

import { ChatPromptTemplate } from "@langchain/core/prompts";


export const chatPrompt = ChatPromptTemplate.fromMessages([
  [

    "system",
    `You are a kind,empathic, concise literary assistant specializing ONLY in the book "White Nights" by Fyodor Dostoevsky.

     CORE OPERATIONAL RULES:
     1. ACCURACY & CONCISENESS: Your answers must be as per question, direct or detailed depends upon question.Do not invent characters (like Marya). you can make the answer engaging.dont hallucinate.
     
     2. ADAPTIVE TONE FORMATTING:
     - If the question is direct or historical, answer immediately with markdown headings and clear, short bullet points.
     - If the question asks for a poetic reflection *about the book*, keep your response brief and detailed at same time.

     3. STRICT OFF-TOPIC ABSOLUTE GUARDRAIL:
     - If the user asks ANY question, says any word, or brings up a topic that is not directly a plot point, character, or theme inside Dostoevsky's "White Nights" (such as random words like "mom", coding, everyday life, or other books), you must immediately cease all formatting, roleplay, and poetry.
     - You must respond with exactly this phrase and absolutely nothing else:
     "ahh!! my mother didn't taught me this plz asked related to book"`,
  ],
  ["human", "{question}"],
]);

function isClearlyOffTopic(question: string): boolean {
  const q = question.toLowerCase();
  const bookSignals =
    /\b(white night|nastenka|nastya|dreamer|dostoevsky|dostoyevsky|petersburg|petrograd|narrator|first night|second night|third night|fourth night|epilogue|loneliness|solitude|midnight sun)\b/i;
  if (bookSignals.test(q)) return false;

  const offTopicSignals =
    /\b(israel|gaza|palestin|trump|biden|modi|putin|election|prime minister|\bpm\b|president|congress|parliament|python|javascript|typescript|react|code|coding|crypto|bitcoin|stock market|weather forecast|recipe|football|nba|iphone|android)\b/i;
  return offTopicSignals.test(q);
}

function normalizeGuardrailAnswer(answer: string): string {
  const trimmed = answer.trim();
  if (/am\s*i\s*fool/i.test(trimmed) || /^i'?m\s*a\s*fool/i.test(trimmed)) {
    return OFF_TOPIC_REPLY;
  }
  return trimmed;
}

// 5. Build the LangChain LCEL Pipeline Chain (Prompt -> Model Inference -> String Clean)
const ragChain = chatPrompt.pipe(model).pipe(new StringOutputParser());

type ChatPrepareResult =
  | { kind: "guardrail"; answer: string }
  | { kind: "error"; status: number; message: string }
  | { kind: "ready"; context: string; sourcesUsed: number };

async function prepareChat(question: string): Promise<ChatPrepareResult> {
  if (isClearlyOffTopic(question)) {
    return { kind: "guardrail", answer: OFF_TOPIC_REPLY };
  }

  const output = await generateEmbedding(question, {
    pooling: "mean",
    normalize: true,
  });
  const queryEmbedding = Array.from(output.data as any);
  const vectorString = `[${queryEmbedding.join(",")}]`;

  const matchingChunks: { content: string; distance: number }[] =
    await prisma.$queryRawUnsafe(
      `SELECT content, (embedding <=> $1::vector) AS distance FROM "documents" ORDER BY distance LIMIT 6;`,
      vectorString,
    );

  if (!matchingChunks?.length) {
    return { kind: "error", status: 404, message: "No book context found inside the database." };
  }

  const bestDistance = Number(matchingChunks[0]?.distance ?? 2);
  if (bestDistance > RELEVANCE_DISTANCE_THRESHOLD) {
    return { kind: "guardrail", answer: OFF_TOPIC_REPLY };
  }

  console.log("\n=== CHUNKS FOUND BY PGVECTOR ===");
  matchingChunks.forEach((chunk, index) => {
    console.log(
      `[Chunk ${index + 1}] d=${Number(chunk.distance).toFixed(3)}: ${chunk.content.substring(0, 120)}...`,
    );
  });
  console.log("================================\n");

  return {
    kind: "ready",
    context: matchingChunks.map((chunk) => chunk.content).join("\n\n"),
    sourcesUsed: matchingChunks.length,
  };
}

function initSse(res: express.Response) {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
}

function sendSse(res: express.Response, payload: Record<string, unknown>) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

/** Typewriter effect for short guardrail replies */
async function streamFixedText(res: express.Response, text: string, sourcesUsed = 0) {
  for (const char of text) {
    sendSse(res, { token: char });
    await new Promise((r) => setTimeout(r, 16));
  }
  sendSse(res, { done: true, sourcesUsed, answer: text });
  res.end();
}

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// --- ROUTE 1: INGEST (PDF Parsing -> Vector Embeddings -> Supabase) ---
app.post("/ingest", async (req, res) => {
    try {
        const driveLink = req.body.url;
        if (!driveLink) {
            return res.status(400).json({ error: "URL field required" });
        }

        const matches = driveLink.match(/\/d\/([^/]+)/);
        if (!matches || !matches[1]) {
            return res.status(400).json({ error: "Invalid Drive link format" });
        }

        const fileId = matches[1];
        const directDownloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;

        const response = await fetch(directDownloadUrl);
        if (!response.ok) {
            throw new Error(`Download failed: ${response.status}`);
        }

        const pdfBlob = await response.blob();
        const loader = new PDFLoader(pdfBlob);
        const docs = await loader.load();

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 400,
            chunkOverlap: 40
        });

        const texts = await splitter.splitDocuments(docs);
        console.log(`Processing, embedding, and saving ${texts.length} chunks to Supabase...`);

        let savedCount = 0;

        for (const doc of texts) {
            const cleanContent = doc.pageContent.replace(/\s+/g, " ").trim();
            if (!cleanContent) continue;

            const output = await generateEmbedding(cleanContent, {
                pooling: 'mean',
                normalize: true,
            });

            const embedding = Array.from(output.data as any);

            // Save directly to Supabase casting vector format explicitly
            await prisma.$executeRawUnsafe(
                `INSERT INTO "documents" (content, metadata, embedding) VALUES ($1, $2, $3::vector)`,
                cleanContent,
                JSON.stringify(doc.metadata),
                `[${embedding.join(",")}]`
            );

            savedCount++;
            if (savedCount % 100 === 0) {
                console.log(`Saved ${savedCount}/${texts.length} chunks...`);
            }
        }

        res.json({
            success: true,
            message: `Successfully structured, embedded, and saved ${savedCount} chunks to Supabase using pgvector.`
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Ingestion failed", details: err.message || err });
    }
});

// --- ROUTE 2: CHAT (Vector Database Match + LangChain Pipeline Execution) ---
app.post("/chat", async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: "Question is required" });
        }

        const prepared = await prepareChat(question);
        if (prepared.kind === "guardrail") {
            return res.json({
                success: true,
                question,
                answer: prepared.answer,
                sourcesUsed: 0,
            });
        }
        if (prepared.kind === "error") {
            return res.status(prepared.status).json({ error: prepared.message });
        }

        console.log(`Context retrieved. Invoking LangChain LCEL pipeline...`);
        const rawAnswer = await ragChain.invoke({
            context: prepared.context,
            question,
        });
        const answerText = normalizeGuardrailAnswer(rawAnswer);

        res.json({
            success: true,
            question,
            answer: answerText,
            sourcesUsed: prepared.sourcesUsed,
        });
    } catch (err: any) {
        console.error("LangChain Chat Error:", err);
        res.status(500).json({ error: "Chat processing failed", details: err.message || err });
    }
});

// --- ROUTE 2b: CHAT STREAM (SSE — tokens arrive line-by-line like ChatGPT) ---
app.post("/chat/stream", async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: "Question is required" });
        }

        const prepared = await prepareChat(question);
        initSse(res);

        if (prepared.kind === "guardrail") {
            console.log(`Off-topic (stream): "${question}" → guardrail`);
            await streamFixedText(res, prepared.answer, 0);
            return;
        }
        if (prepared.kind === "error") {
            sendSse(res, { error: prepared.message });
            res.end();
            return;
        }

        console.log(`Context retrieved. Streaming LangChain LCEL pipeline...`);
        let fullText = "";
        const stream = await ragChain.stream({
            context: prepared.context,
            question,
        });

        for await (const chunk of stream) {
            const token = typeof chunk === "string" ? chunk : String(chunk);
            fullText += token;
            sendSse(res, { token });
        }

        const answerText = normalizeGuardrailAnswer(fullText);
        if (answerText !== fullText.trim()) {
            sendSse(res, { replace: true, answer: answerText });
        }
        sendSse(res, { done: true, sourcesUsed: prepared.sourcesUsed, answer: answerText });
        res.end();
    } catch (err: any) {
        console.error("LangChain Stream Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Chat streaming failed", details: err.message || err });
        } else {
            sendSse(res, { error: err.message || "Stream failed" });
            res.end();
        }
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
    console.log(`Chat off-topic reply: "${OFF_TOPIC_REPLY}"`);
});

//so it is done finally