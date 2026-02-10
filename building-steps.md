# Building Steps - RAG Comparison System

## 🎉 What's Been Built

This document outlines everything that was created in this RAG comparison system project.

---

## ✅ Complete Full-Stack Application

### Backend (Node.js/Express/TypeScript)

**Core API Endpoints:**
- Upload API with file validation
- Document management endpoints (list, get, delete)
- Chat API with LLM integration (Claude & OpenAI)
- Health check endpoint

**Services:**
- **Upload Service** - File handling, document storage, job queuing
- **Retrieval Service** - pgvector similarity search with parser filtering
- **Chat Service** - LLM integration (Claude 3.5 Sonnet, GPT-4o)
- **Embedding Service** - OpenAI text-embedding-3-small integration
- **Normalization Service** - Azure DI JSON → Markdown conversion

**Workers (Background Jobs):**
- Docling parsing processor
- Azure DI parsing processor
- Embedding generation processor
- Bull queue setup with Redis

**Database:**
- Prisma ORM configuration
- PostgreSQL with pgvector extension
- Unified chunk table with JSONB metadata filtering
- Automated migrations

**Technologies:**
- Express.js with TypeScript
- Prisma ORM
- Bull (Redis-based queue)
- @anthropic-ai/sdk
- openai SDK
- @azure/ai-form-recognizer

---

### Python Parsing Microservice (FastAPI)

**Core Functionality:**
- Docling integration for layout-aware document parsing
- Semantic chunking algorithm (by headers/sections)
- Markdown normalization
- FastAPI with auto-generated OpenAPI docs

**Components:**
- `main.py` - FastAPI application setup
- `docling_parser.py` - Docling document processing
- `normalizer.py` - Semantic chunking implementation
- Health check endpoint

**Technologies:**
- FastAPI
- Docling (IBM Research)
- Python 3.11
- Uvicorn server

---

### Frontend (Next.js/React/TypeScript)

**Pages:**
- **Home** - Redirects to upload
- **Upload Page** - Document upload and management interface
- **Chat Page** - Interactive chat with documents

**Components:**
- `UploadZone` - Drag-and-drop file upload with react-dropzone
- `DocumentList` - Document list with real-time status updates
- `ChatInterface` - Chat UI with message rendering and streaming
- `ParserSelector` - Radio buttons for Docling/Azure DI selection
- `ModelSelector` - Radio buttons for Claude/OpenAI selection
- `QueryProvider` - React Query setup

**Features:**
- Real-time status polling (every 3 seconds)
- Toast notifications with Sonner
- Responsive design with Tailwind CSS
- Loading states and error handling
- Source chunk viewer for transparency

**Technologies:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- React Dropzone
- Axios
- Lucide React icons

---

### Infrastructure

**Docker Compose Services:**
- PostgreSQL 15 with pgvector extension
- Redis 7 (for Bull queue)
- Node.js backend (port 3001)
- Python parsing service (port 8000)
- Next.js frontend (port 3000)

**Configuration Files:**
- `docker-compose.yml` - Service orchestration
- Backend `Dockerfile`
- Frontend `Dockerfile`
- Python service `Dockerfile`
- `.env.example` - Environment variable template
- `.gitignore` - Git exclusions

**Database Schema:**
- `documents` table - Uploaded document metadata
- `document_chunks` table - Unified chunks with JSONB metadata
- `chat_sessions` table - Conversation sessions
- `chat_messages` table - Individual messages

---

## 🐳 Docker Container Isolation

Each service runs in its own **isolated Docker container**, ensuring no conflicts with your system:

### Container Architecture

1. **PostgreSQL Container** (`rag_postgres`)
   - Isolated PostgreSQL 15 with pgvector extension
   - No conflict with system PostgreSQL installations
   - Data persists in Docker volume: `postgres_data`

2. **Redis Container** (`rag_redis`)
   - Self-contained Redis 7 instance
   - Isolated from any other Redis installations
   - Data persists in Docker volume: `redis_data`

3. **Backend Container** (`rag_backend`)
   - Node.js 20 with npm packages
   - Completely separate from system Node.js
   - Hot reload enabled for development

4. **Python Parsing Service Container** (`rag_parsing_service`)
   - Python 3.11 with Docling and FastAPI
   - Isolated Python environment with pip packages
   - No interference with system Python

5. **Frontend Container** (`rag_frontend`)
   - Next.js 14 with npm packages
   - Separate Node.js environment
   - Development server with hot reload

### Benefits of Container Isolation

✅ **No System Conflicts**
- Services don't interfere with your system installations
- Each container has its own dependencies
- Multiple versions can coexist peacefully

✅ **Clean Environment**
- Fresh installation every time you rebuild
- No dependency pollution
- Consistent across all machines

✅ **Easy Cleanup**
- Remove everything with `docker-compose down -v`
- No leftover files on your system
- Complete environment reset

✅ **Reproducibility**
- Same environment on Windows, Mac, Linux
- Version-locked dependencies
- Guaranteed consistency

### What Gets Installed Where

**On Your System:**
- ✅ Docker Desktop (if not already installed)
- ✅ `.env` file with API keys (in project folder)
- ❌ **No Node.js packages**
- ❌ **No Python packages**
- ❌ **No PostgreSQL**
- ❌ **No Redis**

**In Docker Containers:**
- All Node.js dependencies (backend + frontend)
- All Python dependencies (parsing service)
- PostgreSQL database
- Redis queue system
- Application code

**In Docker Volumes:**
- `postgres_data` - Database files
- `redis_data` - Redis persistence
- `upload_files` - Uploaded documents

### Container Communication

Containers communicate through Docker's internal network:

```
Frontend (port 3000) → Backend (port 3001) → PostgreSQL (port 5432)
                            ↓                      ↓
                     Parsing Service         Redis (port 6379)
                     (port 8000)
```

**External Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Parsing Service: http://localhost:8000

**Internal Access (container-to-container):**
- Backend → PostgreSQL: `postgres:5432`
- Backend → Redis: `redis:6379`
- Backend → Parsing: `parsing-service:8000`

---

## 📁 Complete File Structure

```
document_ingestion/
│
├── backend/                          # Node.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # Prisma setup, pgvector init
│   │   ├── routes/
│   │   │   ├── health.routes.ts     # Health check
│   │   │   ├── upload.routes.ts     # Upload endpoint
│   │   │   ├── documents.routes.ts  # Document management
│   │   │   └── chat.routes.ts       # Chat endpoint
│   │   ├── services/
│   │   │   ├── upload.service.ts    # File handling
│   │   │   ├── embedding.service.ts # OpenAI embeddings
│   │   │   ├── retrieval.service.ts # Vector search
│   │   │   ├── chat.service.ts      # LLM integration
│   │   │   └── normalization.service.ts # Azure→Markdown
│   │   ├── workers/
│   │   │   ├── queue.ts             # Bull queue setup
│   │   │   └── processors/
│   │   │       ├── parse-docling.processor.ts
│   │   │       ├── parse-azure.processor.ts
│   │   │       └── embed.processor.ts
│   │   ├── utils/
│   │   │   └── chunking.util.ts     # Semantic chunking
│   │   └── index.ts                 # Express app entry
│   ├── prisma/
│   │   └── schema.prisma            # Database schema
│   ├── uploads/
│   │   └── .gitkeep                 # Placeholder
│   ├── package.json                 # Dependencies
│   ├── tsconfig.json                # TypeScript config
│   ├── Dockerfile                   # Docker image
│   └── .env.example                 # Environment template
│
├── parsing-service/                 # Python Microservice
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py           # Pydantic models
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── parse.py             # Parse endpoint
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── docling_parser.py    # Docling integration
│   │       └── normalizer.py        # Semantic chunking
│   ├── requirements.txt             # Python dependencies
│   └── Dockerfile                   # Docker image
│
├── frontend/                        # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Home (redirect)
│   │   │   ├── globals.css          # Global styles
│   │   │   ├── upload/
│   │   │   │   └── page.tsx         # Upload page
│   │   │   └── chat/
│   │   │       └── page.tsx         # Chat page
│   │   ├── components/
│   │   │   ├── QueryProvider.tsx    # React Query setup
│   │   │   ├── UploadZone.tsx       # File upload
│   │   │   ├── DocumentList.tsx     # Document list
│   │   │   ├── ChatInterface.tsx    # Chat UI
│   │   │   ├── ParserSelector.tsx   # Parser radio buttons
│   │   │   └── ModelSelector.tsx    # Model radio buttons
│   │   ├── lib/
│   │   │   └── api.ts               # API client
│   │   └── types/
│   │       └── document.ts          # TypeScript types
│   ├── package.json                 # Dependencies
│   ├── tsconfig.json                # TypeScript config
│   ├── next.config.js               # Next.js config
│   ├── tailwind.config.ts           # Tailwind config
│   ├── postcss.config.js            # PostCSS config
│   └── Dockerfile                   # Docker image
│
├── docker-compose.yml               # Service orchestration
├── .env.example                     # Environment variables
├── .gitignore                       # Git exclusions
├── README.md                        # Main documentation
└── building-steps.md                # This file
```

**Total Files Created:** 60+ files across backend, frontend, and Python service

---

## 💡 Key Features Implemented

### 1. Unified Chunk Table Architecture
- Single `document_chunks` table with JSONB metadata
- Filter by parser using `WHERE metadata->>'source_tool' = 'docling'`
- Easy to add new parsers without schema changes
- Simplifies switching between parsers

### 2. Normalization Layer
- **Critical for fair comparison**
- Docling outputs Markdown natively
- Azure DI outputs JSON → converted to Markdown
- Both parsers normalized to same format before chunking
- Ensures apples-to-apples comparison

### 3. Semantic Chunking
- Chunks by document sections (headers) instead of fixed length
- Preserves context and semantic meaning
- Splits large chunks intelligently (max 1000 words)
- Includes section titles in metadata

### 4. Parallel Processing
- Both parsers run simultaneously on upload
- Bull queue manages background jobs
- Independent status tracking per parser
- Embedding generation after parsing completes

### 5. Real-time Status Updates
- Frontend polls every 3 seconds for document status
- Live progress indicators:
  - 🔵 Pending
  - 🔄 Processing
  - ✅ Completed
  - ❌ Failed (with error message)

### 6. Source Transparency
- Chat responses include retrieved chunks
- "Show source chunks" button reveals:
  - Chunk content
  - Page number
  - File name
  - Similarity score
  - Section title (if available)

### 7. Multiple LLM Support
- **Claude 3.5 Sonnet** via Anthropic API
- **GPT-4o** via OpenAI API
- Easy to switch models in chat UI
- Same retrieval context sent to both

### 8. Vector Similarity Search
- PostgreSQL pgvector extension
- OpenAI text-embedding-3-small (1536 dimensions)
- Cosine similarity ranking
- IVFFlat index for performance
- Top-k retrieval (default: 5 chunks)

---

## 🔍 Technical Highlights

### Database Design
```sql
-- Unified chunks table (research-recommended approach)
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB NOT NULL,  -- Contains: source_tool, page_number, etc.
  created_at TIMESTAMP
);

-- Index for parser filtering
CREATE INDEX idx_chunks_source_tool
ON document_chunks ((metadata->>'source_tool'));

-- Vector similarity index
CREATE INDEX idx_chunks_embedding
ON document_chunks USING ivfflat (embedding vector_cosine_ops);
```

### Retrieval Query
```typescript
const results = await prisma.$queryRaw`
  SELECT
    id::text,
    content,
    metadata,
    1 - (embedding <=> ${embeddingStr}::vector) as similarity
  FROM document_chunks
  WHERE metadata->>'source_tool' = ${parserType}
    AND embedding IS NOT NULL
  ORDER BY embedding <=> ${embeddingStr}::vector
  LIMIT ${topK}
`;
```

### Job Processing Flow
```
Upload → Save File → Enqueue Jobs
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
    ParseDoclingJob           ParseAzureDIJob
              ↓                       ↓
    Store Chunks              Store Chunks
              ↓                       ↓
    GenerateEmbeddingsJob    GenerateEmbeddingsJob
              ↓                       ↓
         Update DB               Update DB
```

---

## 📊 Technologies & Dependencies

### Backend Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.30.1",
  "@azure/ai-form-recognizer": "^5.0.0",
  "@prisma/client": "^5.22.0",
  "bull": "^4.12.0",
  "express": "^4.19.2",
  "openai": "^4.72.0"
}
```

### Frontend Dependencies
```json
{
  "next": "14.1.0",
  "react": "^18.2.0",
  "@tanstack/react-query": "^5.20.1",
  "react-dropzone": "^14.2.3",
  "sonner": "^1.4.0"
}
```

### Python Dependencies
```txt
fastapi==0.109.2
uvicorn[standard]==0.27.1
docling==1.0.0
pydantic==2.6.1
```

---

## 🎯 What's Working vs. What Needs Setup

### ✅ Working Out of the Box
- File upload and storage
- Docling parsing (no API key needed)
- Document management (list, view, delete)
- Database with pgvector
- Background job processing
- Frontend UI

### 🔑 Requires API Keys
- **OpenAI API** - Required for:
  - Embeddings (text-embedding-3-small)
  - GPT-4o chat responses

- **Anthropic API** - Required for:
  - Claude 3.5 Sonnet chat responses

- **Azure Document Intelligence** - Optional for:
  - Azure DI parsing approach
  - Can be added later

---

## 🚀 Ready to Deploy

The system is **production-ready for local development**:

✅ All core features implemented
✅ Error handling and validation
✅ Docker containerization
✅ Comprehensive documentation
✅ Type safety (TypeScript)
✅ Responsive UI
✅ Real-time updates
✅ Background job processing
✅ Database migrations
✅ Health checks

---

## 🔧 Installation & Setup Steps

### Step 1: Install Docker Desktop

**Docker is required** to run this project. If you don't have Docker installed:

**For Windows:**
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Run the installer
3. Restart your computer if prompted
4. Start Docker Desktop and wait for it to initialize
5. Verify installation:
   ```bash
   docker --version
   docker compose version
   ```

**For Mac:**
1. Download Docker Desktop for Mac from: https://www.docker.com/products/docker-desktop/
2. Drag Docker.app to Applications
3. Open Docker Desktop
4. Verify installation:
   ```bash
   docker --version
   docker compose version
   ```

**For Linux:**
1. Follow the official guide: https://docs.docker.com/engine/install/
2. Install Docker Compose plugin:
   ```bash
   sudo apt-get install docker-compose-plugin
   ```

### Step 2: Set Up API Keys

Create a `.env` file in the project root:

```bash
cd document_ingestion
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required for embeddings and GPT-4o
OPENAI_API_KEY=sk-your-openai-api-key-here

# Required for Claude 3.5 Sonnet
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Optional - can be added later
AZURE_DI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DI_KEY=your-azure-di-key-here
```

**Get API Keys:**
- **OpenAI:** https://platform.openai.com/api-keys
- **Anthropic:** https://console.anthropic.com/settings/keys
- **Azure DI:** https://portal.azure.com (create Document Intelligence resource)

### Step 3: Start All Services

From the project root directory:

```bash
docker compose up -d --build
```

This will:
- ⬇️ Download Docker images (first time only, ~10-15 minutes)
- 🔨 Build custom images for backend, frontend, and parsing service
- 🚀 Start all 5 containers
- ✅ Initialize networking between containers

**Note:** Use `docker-compose` (with hyphen) if you have an older Docker version.

### Step 4: Initialize the Database

In a new terminal, navigate to the backend directory and run:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
```

This will:
- Install Node.js dependencies
- Generate Prisma client
- Create database tables
- Enable pgvector extension
- Set up indexes

### Step 5: Verify Services Are Running

Check that all containers are healthy:

```bash
docker ps
```

You should see 5 running containers:
- ✅ `rag_postgres` - PostgreSQL database
- ✅ `rag_redis` - Redis queue
- ✅ `rag_backend` - Node.js API
- ✅ `rag_parsing_service` - Python parser
- ✅ `rag_frontend` - Next.js UI

Test the services:
```bash
# Backend health check
curl http://localhost:3001/health

# Parsing service health check
curl http://localhost:8000/health

# Frontend (open in browser)
# http://localhost:3000
```

### Step 6: Access the Application

Open your browser and navigate to:
- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:3001/health
- **Parsing Service:** http://localhost:8000/docs (FastAPI docs)

---

## 📝 Usage Steps

Once everything is running:

1. **Upload documents** (Upload tab)
   - Drag and drop PDF, DOCX, or PPTX files
   - Watch both parsers process in parallel
   - Wait for "Completed" status on both

2. **Chat with documents** (Chat tab)
   - Select parser: Docling or Azure DI
   - Select model: Claude or OpenAI
   - Ask questions about your documents
   - View source chunks used for answers

3. **Compare parsers**
   - Ask the same question with different parser selections
   - Compare quality of answers
   - Analyze retrieved chunks

---

## 🎓 What You Can Learn From This Project

- **RAG System Architecture** - End-to-end implementation
- **Microservices** - Node.js + Python service communication
- **Vector Databases** - pgvector with PostgreSQL
- **Queue Systems** - Bull with Redis for async processing
- **LLM Integration** - Multiple providers (Anthropic, OpenAI)
- **Document Processing** - Layout-aware extraction techniques
- **TypeScript** - Full-stack type safety
- **Docker** - Multi-container orchestration
- **Modern React** - Next.js 14, React Query, Tailwind CSS

---

**Built with ❤️ for comparing document parsing approaches in RAG systems**
