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

// 1. Initialize Hugging Face pipeline locally (384-dimension vector transformer)
const generateEmbedding = await pipeline('feature-extraction', 'Supabase/gte-small');

const app = express();

// CORS for Vite dev server and production frontend
app.use((req, res, next) => {
    const origin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
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
const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", `You are an expert literary assistant specializing in the book White Nights by Fyodor Dostoevsky.
     Use the provided context excerpts to answer the question as accurately as possible. 
     
     CONTEXT EXCERPTS:
     {context}
     
     If the context excerpts contain relevant details, prioritize them completely. If the excerpts are too broad or insufficient to answer a high-level conceptual question (such as overall summaries, structural themes, or book overviews), if he ask any question that is not related to the book just tell him "am i fool ", use your general literary knowledge of White Nights to formulate a comprehensive, accurate response. if the question is out of book dont hallucinate just tell him "am i fool "`],
    ["human", "{question}"]
]);

// 5. Build the LangChain LCEL Pipeline Chain (Prompt -> Model Inference -> String Clean)
const ragChain = chatPrompt.pipe(model).pipe(new StringOutputParser());

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

        // A. Vectorize incoming search question via HuggingFace
        const output = await generateEmbedding(question, {
            pooling: 'mean',
            normalize: true,
        });
        const queryEmbedding = Array.from(output.data as any);

        // B. Formulate the explicit binding string parameter for Postgres pgvector
        const vectorString = `[${queryEmbedding.join(",")}]`;

        // C. Run raw vector distance logic matching top 6 elements for broader context coverage
        const matchingChunks: any[] = await prisma.$queryRawUnsafe(
            `SELECT content FROM "documents" ORDER BY embedding <=> $1::vector LIMIT 6;`,
            vectorString
        );

        if (!matchingChunks || matchingChunks.length === 0) {
            return res.status(404).json({ error: "No book context found inside the database." });
        }

        // 🔴 DEBUG LOG: Print out what the database found to your terminal console
        console.log("\n=== CHUNKS FOUND BY PGVECTOR ===");
        matchingChunks.forEach((chunk, index) => {
            console.log(`[Chunk ${index + 1}]: ${chunk.content.substring(0, 120)}...`);
        });
        console.log("================================\n");

        // D. Aggregate matching lines into a clean text snippet
        const retrievedContext = matchingChunks.map(chunk => chunk.content).join("\n\n");
        console.log(`Context retrieved. Invoking LangChain LCEL pipeline...`);

        // E. Direct invocation of the modular chain pipeline
        const answerText = await ragChain.invoke({
            context: retrievedContext,
            question: question
        });

        // F. Return results down to your local client
        res.json({
            success: true,
            question,
            answer: answerText,
            sourcesUsed: matchingChunks.length
        });

    } catch (err: any) {
        console.error("LangChain Chat Error:", err);
        res.status(500).json({ error: "Chat processing failed", details: err.message || err });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});