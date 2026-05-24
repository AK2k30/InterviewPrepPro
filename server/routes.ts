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
  file?: Express.Multer.File;
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

// Store resume data in memory (in production, use a database)
const resumeStore = new Map<string, { analysis: string; imageBase64: string }>();

export async function registerRoutes(app: Express): Promise<Server> {

  // ----------------------
  // Resume Upload endpoint
  // ----------------------
  app.post('/api/upload-resume', upload.single("resume"), async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No resume file provided" });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const filePath = req.file.path;
      const imageBuffer = fs.readFileSync(filePath);
      const ext = path.extname(req.file.originalname).replace(".", "");
      const imageBase64 = `data:image/${ext};base64,${imageBuffer.toString("base64")}`;

      // Analyze resume with vision model
      const analysis = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "Analyze this resume image and extract key information: skills, experience, education, projects, and notable achievements. Provide a concise summary that can be used to generate relevant interview questions." 
              },
              { type: "image_url", image_url: { url: imageBase64 } }
            ]
          }
        ],
        max_completion_tokens: 1024,
        temperature: 0.5
      });

      const resumeAnalysis = analysis.choices[0]?.message?.content || "Unable to analyze resume";
      
      // Store both resume analysis and image base64
      resumeStore.set(userId, {
        analysis: resumeAnalysis,
        imageBase64: imageBase64
      });

      // Delete the temp file
      fs.unlinkSync(filePath);

      res.json({ 
        message: "Resume uploaded and analyzed successfully",
        analysis: resumeAnalysis 
      });
    } catch (err) {
      console.error("Resume upload error:", err);
      res.status(500).json({ error: "Failed to process resume" });
    }
  });

  // ----------------------
  // Chat endpoint
  // ----------------------
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { messages, userId } = req.body;

      // Get resume data if available
      const resumeData = userId ? resumeStore.get(userId) : null;

      // If resume exists, use vision model with image context
      if (resumeData && resumeData.imageBase64) {
        // Convert messages to vision model format with resume image
        const visionMessages = messages.map((msg: any) => {
          if (msg.role === 'system') {
            // System message with resume context instruction
            return {
              role: 'user',
              content: [
                { 
                  type: 'text', 
                  text: `${msg.content}\n\nIMPORTANT: You have access to the candidate's resume image. Use it to ask specific questions about their experience, projects, skills, and achievements shown in the resume. Make the interview highly personalized based on what you see in their resume.` 
                },
                { type: 'image_url', image_url: { url: resumeData.imageBase64 } }
              ]
            };
          } else if (msg.role === 'user') {
            // User messages with resume image for context
            return {
              role: 'user',
              content: [
                { type: 'text', text: msg.content },
                { type: 'image_url', image_url: { url: resumeData.imageBase64 } }
              ]
            };
          } else {
            // Assistant messages stay as text
            return msg;
          }
        });

        const completion = await groq.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: visionMessages,
          temperature: 1,
          max_completion_tokens: 300,
        });

        const reply = completion.choices[0]?.message?.content || 'No reply';
        res.json({ reply, ttsText: reply });
      } else {
        // No resume - use regular text model
        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: 1,
          max_completion_tokens: 300,
          top_p: 1,
          stream: false,
        });

        const reply = completion.choices[0]?.message?.content || 'No reply';
        res.json({ reply, ttsText: reply });
      }
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
        model: "canopylabs/orpheus-v1-english",
        voice: "diana",
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

  // ----------------------
  // Summary Report endpoint
  // ----------------------
  app.post('/api/summary-report', async (req: Request, res: Response) => {
    try {
      const { messages, userId } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      // Get resume data if available
      const resumeData = userId ? resumeStore.get(userId) : null;
      
      const summaryPrompt = `You are an expert interview evaluator. Based on the following interview conversation, generate a comprehensive summary report.

The report should include:
1. **Overall Performance**: Brief assessment of the candidate's performance
2. **Strengths**: Key strengths demonstrated during the interview
3. **Areas for Improvement**: Specific areas where the candidate can improve
4. **Technical Skills**: Technical competencies observed
5. **Communication Skills**: Assessment of communication and articulation
6. **Recommendation**: Final recommendation (Strong Hire, Hire, Maybe, No Hire)
7. **Detailed Feedback**: Specific examples from the interview

Interview Conversation:
${messages.map((msg: any) => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}

${resumeData ? `\nCandidate Resume Analysis:\n${resumeData.analysis}` : ''}

Please provide a detailed, professional summary report in a structured format.`;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        temperature: 0.7,
        max_completion_tokens: 2048,
      });

      const summaryReport = completion.choices[0]?.message?.content || 'Unable to generate summary report';

      res.json({ 
        summary: summaryReport,
        timestamp: new Date().toISOString(),
        candidateId: userId || 'unknown'
      });
    } catch (err) {
      console.error('Summary report generation error:', err);
      res.status(500).json({ error: 'Failed to generate summary report' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
