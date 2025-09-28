# 📚 StudyMate AI – Your Personal Study Companion  

**StudyMate AI** is a web-based application that helps students manage and revise their coursework by generating **summaries, quizzes, and motivational nudges** using AI.  

---

## ✨ Features  
- 📑 **Note Summarization** – Generate concise summaries from notes  
- 📂 **Multi-Format File Support** – Upload PDF, DOCX, PPTX, TXT, or MD  
- 📝 **Quiz Generation** – Create multiple-choice quizzes automatically  
- 💡 **Motivational Messages** – AI-powered encouragement to stay focused  
- 📊 **Progress Tracking** – Mark topics as understood or for revision  
- 🔄 **File Drag & Drop** – Smooth file upload experience  

---

## 🛠️ Tech Stack  
- **Frontend**: React.js (TypeScript, modern UI)  
- **Backend**: Node.js + Express.js  
- **AI Integration**: DeepSeek V3.1 via OpenRouter API  
- **File Processing**: PDF-parse, Mammoth (DOCX), Yauzl (PPTX)  
- **Storage**: Browser Local Storage  
- **HTTP Client**: Axios  

---

## 📌 Project Type  
✅ **Full-Stack Web Application** – Educational productivity tool powered by AI.  

---

## 🚀 Quick Start

### Local Development
```bash
# Clone and install
git clone https://github.com/your-username/StudyMate_AI.git
cd StudyMate_AI
npm run install-all

# Set up backend environment
cd backend
cp .env.example .env
# Add your DeepSeek API key to .env

# Run development servers
npm run dev
```

### Environment Variables (Backend/.env)
```bash
DEEPSEEK_API_KEY=your_openrouter_api_key
OPENROUTER_API_URL=https://openrouter.ai/api/v1
REQUESTS_PER_MINUTE=20
REQUESTS_PER_DAY=1000
MAX_TOKENS_PER_REQUEST=32000
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Vercel Environment Variables
When deploying to Vercel, add these environment variables in your Vercel dashboard:
- `DEEPSEEK_API_KEY` - Your OpenRouter API key
- `OPENROUTER_API_URL` - https://openrouter.ai/api/v1  
- `REQUESTS_PER_MINUTE` - 20
- `REQUESTS_PER_DAY` - 1000
- `MAX_TOKENS_PER_REQUEST` - 32000

### Vercel Deployment
1. Import repository to [Vercel](https://vercel.com)
2. Build Command: `npm run vercel-build`
3. Output Directory: `frontend/build`
4. Add environment variables in Vercel dashboard
5. Deploy! 🎉

---

## 📁 File Support
- **PDF** (.pdf) - Text extraction
- **Word** (.doc, .docx) - Document parsing  
- **PowerPoint** (.ppt, .pptx) - Slide content
- **Text** (.txt, .md) - Direct processing

---

## 🔗 API Endpoints
- `POST /api/ai/summarize` - Text summarization
- `POST /api/ai/summarize/file` - File upload & summarize
- `POST /api/ai/quiz` - Quiz generation
- `POST /api/ai/motivation` - Motivational messages
- `GET /api/ai/health` - Service status

---
