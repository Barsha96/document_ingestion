import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Enable pgvector extension
export async function initializeDatabase() {
  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`;

    // Create index for source_tool filtering
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_chunks_source_tool
      ON document_chunks ((metadata->>'source_tool'))
    `;

    // Create index for vector similarity search
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_chunks_embedding
      ON document_chunks
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `;

    console.log('✅ Database initialized with pgvector extension and indexes');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export default prisma;
