import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import { Groq } from "groq-sdk";
import path from "path";

// Extend Request type to include file property from multer
interface MulterRequest extends Request {
  file?: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
  };
}

// Load environment variables
dotenv.config();

// Initialize Groq client with API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // ----------------------
  // Chat endpoint
  // ----------------------
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { messages } = req.body;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 1,
        max_completion_tokens: 300, // strict token limit for TTS
        top_p: 1,
        stream: false,
      });

      const reply = completion.choices[0]?.message?.content || 'No reply';

      res.json({ reply, ttsText: reply });
    } catch (err) {
      console.error('Groq API error:', err);
      res.status(500).json({ error: 'Groq API call failed' });
    }
  });

  // ----------------------
  // Text-to-Speech endpoint
  // ----------------------
  app.post('/api/tts', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      const response = await groq.audio.speech.create({
        model: "playai-tts",
        voice: "Arista-PlayAI",
        input: text,
        response_format: "wav"
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      res.setHeader("Content-Type", "audio/wav");
      res.send(buffer);
    } catch (err) {
      console.error("Groq TTS error:", err);
      res.status(500).json({ error: "Groq TTS failed" });
    }
  });

  // ----------------------
  // Speech-to-Text endpoint
  // ----------------------
  app.post('/api/stt', upload.single("audio"), async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const tempPath = req.file.path;
      const ext = ".wav"; // force correct extension
      const filePath = tempPath + ext;

      // Rename the file to include extension
      fs.renameSync(tempPath, filePath);

      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-large-v3-turbo",
        response_format: "verbose_json",
        language: "en",
        temperature: 0.0,
      });

      // Delete the temp file
      fs.unlinkSync(filePath);

      res.json({ text: transcription.text });
    } catch (err) {
      console.error("Groq STT error:", err);
      res.status(500).json({ error: "STT failed" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
