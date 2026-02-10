# RAG Comparison System

A full-stack web application for comparing layout-aware document extraction approaches (Docling vs Azure Document Intelligence) in a RAG (Retrieval-Augmented Generation) system.

## 🎯 Overview

This system allows you to:
- Upload documents (PDF, DOCX, PPTX)
- Process them with two different parsing approaches:
  - **Docling** (IBM Research layout-aware parsing)
  - **Azure Document Intelligence** (Microsoft's document analysis service)
- Store chunks in PostgreSQL with pgvector for semantic search
- Chat with your documents using either Claude or OpenAI models
- Compare which parsing approach retrieves better information

## 🏗️ Architecture

```
Frontend (Next.js) ←→ Backend (Node.js/Express) ←→ PostgreSQL + pgvector
                            ↓                           ↓
                    Python Microservice            Redis (Bull Queue)
                    (Docling Parser)
```

### Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Parsing Service:** Python, FastAPI, Docling
- **Database:** PostgreSQL 15 with pgvector extension
- **Queue:** Redis with Bull
- **LLMs:** Claude 3.5 Sonnet, GPT-4o
- **Embeddings:** OpenAI text-embedding-3-small

## 📋 Prerequisites

- Docker and Docker Compose
- OpenAI API key (required for embeddings and GPT)
- Anthropic API key (required for Claude)
- Azure Document Intelligence credentials (optional - can be set up later)

## 🚀 Quick Start

### 1. Clone the repository

```bash
cd document_ingestion
```

### 2. Set up environment variables

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Azure DI (optional - can add later)
AZURE_DI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DI_KEY=your-azure-di-key-here
```

### 3. Start all services with Docker Compose

```bash
docker-compose up --build
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 3001)
- Python parsing service (port 8000)
- Frontend (port 3000)

### 4. Initialize the database

In a new terminal, run:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
```

### 5. Access the application

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/health
- **Parsing Service:** http://localhost:8000/health

## 📖 Usage Guide

### Uploading Documents

1. Navigate to the **Upload** tab
2. Drag and drop PDF, DOCX, or PPTX files (max 50MB)
3. Watch as both parsers process your document in parallel
4. Status indicators show:
   - 🔵 **Processing** - Document is being parsed
   - ✅ **Completed** - Parsing successful
   - ❌ **Failed** - Parsing encountered an error

### Chatting with Documents

1. Navigate to the **Chat** tab
2. Select your parsing approach:
   - **Docling** - IBM Research layout-aware parsing
   - **Azure DI** - Azure Document Intelligence
3. Select your LLM model:
   - **Claude** - Claude 3.5 Sonnet
   - **OpenAI** - GPT-4o
4. Ask questions about your documents
5. Click "Show source chunks" to see which document chunks were used to answer

### Comparing Parsers

- Upload the same document
- Ask the same question with different parser selections
- Compare the quality of answers and retrieved chunks
- Look at source chunks to see how each parser structured the content

## 🔧 Configuration

### Azure Document Intelligence Setup

If you don't have Azure DI set up yet:

1. Create an Azure account at portal.azure.com
2. Create a "Document Intelligence" resource
3. Choose the **Free F0** tier (500 pages/month free)
4. Copy the endpoint and key to your `.env` file

Without Azure DI configured, only Docling parsing will work.

## 🐛 Troubleshooting

### Services won't start

```bash
# Clean up Docker
docker-compose down -v
docker-compose up --build
```

### Database connection issues

```bash
# Check database logs
docker logs rag_postgres

# Verify pgvector extension
docker exec -it rag_postgres psql -U raguser -d rag_database -c "CREATE EXTENSION IF NOT EXISTS vector"
```

### Parsing errors

```bash
# Check parsing service logs
docker logs rag_parsing_service

# Test parsing service
curl http://localhost:8000/health
```

## 📚 Project Structure

```
document_ingestion/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── workers/        # Background jobs
│   │   └── utils/          # Utilities
│   ├── prisma/             # Database schema
│   └── package.json
├── parsing-service/        # Python microservice
│   ├── app/
│   │   ├── services/       # Docling parser
│   │   └── routers/        # FastAPI routes
│   └── requirements.txt
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages
│   │   ├── components/    # React components
│   │   └── lib/           # API client
│   └── package.json
└── docker-compose.yml      # Service orchestration
```

## 🎯 Next Steps

1. **Upload test documents** - Start with PDFs containing tables
2. **Test both parsers** - Compare Docling vs Azure DI quality
3. **Experiment with queries** - Ask specific questions about tables, sections
4. **Analyze results** - Look at source chunks to understand parsing differences

## 📝 Notes

- First upload takes longer as Docker downloads images and models
- Docling processes documents locally (no API cost)
- Azure DI requires API calls (cost: ~$1.50-$10 per 1,000 pages)
- OpenAI embeddings cost ~$0.02 per 1M tokens

---

**Built with ❤️ for better document understanding in RAG systems**
