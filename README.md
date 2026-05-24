# InterviewPrepPro

InterviewPrepPro is an AI-powered interview practice application that simulates a video interview experience. Candidates enter their profile, optionally upload a resume image, speak responses through the browser microphone, receive AI interviewer replies with text-to-speech audio, and finish with a performance report.

The app is built as a full-stack TypeScript project with a React/Vite frontend and an Express backend. Groq is used for chat completions, resume image analysis, speech-to-text, and text-to-speech.

## Features

- Candidate registration with name, current role, and target interview role.
- Role-based interview setup for software engineering, product management, data science, design, marketing, sales, consulting, and analyst tracks.
- Optional resume image upload for more personalized interview questions.
- Video-call style interview interface with camera and microphone controls.
- Browser speech recording with backend speech-to-text transcription.
- AI interviewer conversation powered by Groq chat models.
- Text-to-speech playback for AI responses.
- Animated interviewer video states using files in `public/`.
- Light/dark theme support.
- Performance report screen with score, category breakdown, strengths, improvements, and detailed feedback.
- Separate experimental LinkedIn/Unipile test backend under `linkedin-test/`.

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-style component structure using Radix UI primitives
- TanStack React Query
- Wouter
- Lucide React icons
- next-themes

### Backend

- Node.js
- Express
- TypeScript via `tsx`
- Multer for uploads
- Groq SDK
- Drizzle ORM schema definitions
- PostgreSQL configuration through Drizzle Kit

## Project Structure

```text
InterviewPrepPro/
├── client/
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── components/
│       │   ├── InterviewApp.tsx
│       │   ├── UserRegistration.tsx
│       │   ├── VideoCallInterface.tsx
│       │   ├── PerformanceReport.tsx
│       │   ├── ThemeProvider.tsx
│       │   ├── ThemeToggle.tsx
│       │   └── ui/
│       ├── hooks/
│       │   ├── useAIConversation.ts
│       │   ├── use-mobile.tsx
│       │   └── use-toast.ts
│       └── lib/
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
├── public/
│   ├── demo.mp4
│   └── demo-2.mp4
├── linkedin-test/
│   ├── backend/
│   └── frontend/
├── drizzle.config.ts
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Application Flow

1. The user starts on the registration screen.
2. The user enters their name, current role, target role, and can optionally upload a resume image.
3. If a resume image is uploaded, the backend sends it to Groq for analysis and stores the extracted context in memory for that user session.
4. The interview room opens after a short connection state.
5. The AI interviewer greets the candidate and asks the first question.
6. The user enables the microphone, records an answer, and stops recording.
7. The frontend sends the audio to `/api/stt`.
8. The backend transcribes the answer with Groq Whisper.
9. The frontend sends the conversation to `/api/chat`.
10. The backend generates the next AI interviewer reply.
11. The frontend sends that reply to `/api/tts` and plays the generated audio.
12. When the user ends the interview, the app displays a performance report.

## Prerequisites

- Node.js 20 or newer is recommended.
- npm
- A Groq API key
- A modern browser with microphone support
- Optional: PostgreSQL database URL if you plan to use Drizzle migrations

## Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
NODE_ENV=development
```

Optional for database schema push:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

The current app stores resume analysis in memory during runtime. The Drizzle schema and `db:push` script are present for database setup, but the main interview flow does not currently persist users or interviews to PostgreSQL.

## Installation

Install dependencies from the project root:

```bash
npm install
```

## Running Locally

Start the development server:

```bash
npm run dev
```

The Express server listens on:

```text
http://127.0.0.1:5000
```

If `PORT` is set in `.env`, that value is used instead of `5000`.

## Available Scripts

```bash
npm run dev
```

Runs the Express backend in development mode and serves the Vite frontend through middleware.

```bash
npm run build
```

Builds the React frontend with Vite and bundles the server with esbuild into `dist/`.

```bash
npm run start
```

Runs the production server from `dist/index.js`. Run `npm run build` first.

```bash
npm run check
```

Runs TypeScript type checking.

```bash
npm run db:push
```

Pushes the Drizzle schema to the configured PostgreSQL database. Requires `DATABASE_URL`.

## API Endpoints

### `POST /api/upload-resume`

Uploads and analyzes a resume image.

Request type: `multipart/form-data`

Fields:

- `resume`: image file, accepted by the frontend as JPG, PNG, or WEBP
- `userId`: generated client-side user id

Response:

```json
{
  "message": "Resume uploaded and analyzed successfully",
  "analysis": "..."
}
```

### `POST /api/chat`

Generates the next AI interviewer response.

Request body:

```json
{
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "userId": "user_..."
}
```

Response:

```json
{
  "reply": "...",
  "ttsText": "..."
}
```

### `POST /api/tts`

Converts AI response text to WAV audio.

Request body:

```json
{
  "text": "Text to speak"
}
```

Response type: `audio/wav`

### `POST /api/stt`

Transcribes recorded user audio.

Request type: `multipart/form-data`

Fields:

- `audio`: recorded audio file

Response:

```json
{
  "text": "Transcribed answer"
}
```

### `POST /api/summary-report`

Generates a detailed AI summary report from interview messages. This endpoint exists on the backend, although the current frontend report screen uses generated mock metrics.

Request body:

```json
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "userId": "user_..."
}
```

Response:

```json
{
  "summary": "...",
  "timestamp": "2026-05-24T00:00:00.000Z",
  "candidateId": "user_..."
}
```

## AI Models Used

The backend currently uses these Groq model identifiers:

- Resume image analysis: `openai/gpt-oss-120b`
- Resume-aware interview chat: `openai/gpt-oss-120b`
- Standard interview chat: `llama-3.3-70b-versatile`
- Text-to-speech: `canopylabs/orpheus-v1-english`
- Speech-to-text: `whisper-large-v3-turbo`

## Resume Upload Notes

The frontend accepts resume images only:

- JPG
- PNG
- WEBP

Maximum file size is 5 MB. Uploaded files are temporarily written to `uploads/`, converted to base64 for AI processing, stored in memory by `userId`, and then removed from disk.

PDF resumes are not currently supported by the frontend upload validation.

## Database Schema

The shared schema defines two PostgreSQL tables:

- `users`: candidate profile information
- `interviews`: interview metadata, score, duration, and feedback JSON

The schema lives in `shared/schema.ts`. Drizzle configuration lives in `drizzle.config.ts`.

At the moment, the active interview flow uses local React state and in-memory backend storage rather than persistent database reads/writes.

## Public Assets

The video-call interface uses two public videos:

- `public/demo.mp4`: interviewer speaking state
- `public/demo-2.mp4`: interviewer idle state

These are served by Express through `express.static("public")`.

## LinkedIn Test Folder

`linkedin-test/` is a separate experimental integration for connecting to LinkedIn through Unipile.

Backend location:

```text
linkedin-test/backend/
```

It uses:

- Express
- CORS
- node-fetch
- Unipile API

Expected environment variables for that backend:

```env
UNIPILE_API_KEY=your_unipile_api_key_here
CALLBACK_URL=your_callback_url_here
PORT=5000
```

Run it separately:

```bash
cd linkedin-test/backend
npm install
npm start
```

This folder is not wired into the main InterviewPrepPro app.

## Development Notes

- The frontend brand text currently says `InterviewAce` on the registration screen, while the repository/project name is `InterviewPrepPro`.
- The report screen currently creates randomized mock performance metrics in `InterviewApp.tsx`.
- The backend has a `/api/summary-report` endpoint that can generate an AI report, but the frontend does not currently call it.
- Resume analysis is stored in an in-memory `Map`, so it is lost when the server restarts.
- Audio is recorded in the browser and wrapped as WAV before being sent to the backend. For production, a more robust audio conversion path may be useful.
- Camera and microphone access require browser permissions and are easiest to test over localhost or HTTPS.

## Production Build

Build the app:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

The production server serves the built frontend from `dist/public` and the bundled backend from `dist/index.js`.

## Troubleshooting

### Groq API calls fail

Check that `GROQ_API_KEY` is present in `.env` and that the key has access to the configured models.

### Microphone recording fails

Make sure the browser has microphone permission enabled. Also check that no other application is exclusively using the microphone.

### Resume upload fails

Confirm that the uploaded file is JPG, PNG, or WEBP and is under 5 MB.

### `npm run db:push` fails

Make sure `DATABASE_URL` is set. The main app can still run without this variable unless you are working on database migrations.

### Production start fails

Run `npm run build` before `npm run start`.

## License

This project is marked as MIT in `package.json`.
