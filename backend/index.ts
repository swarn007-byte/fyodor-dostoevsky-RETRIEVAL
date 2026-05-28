import express from "express";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

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
            chunkSize: 100,
            chunkOverlap: 0
        });

        const texts = await splitter.splitDocuments(docs);

        res.json({
            success: true,
            totalChunks: texts.length,
            chunks: texts.map(t => t.pageContent)
        });

    } catch (err: any) {
        res.status(500).json({ error: "Ingestion failed", details: err.message || err });
    }
});

app.post("/chat", async (req, res) => {
    res.status(501).json({ message: "Not implemented" });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});