import prisma from '../config/database';
import { generateQueryEmbedding } from './embedding.service';

export interface RetrievedChunk {
  id: string;
  content: string;
  metadata: any;
  similarity: number;
}

export async function retrieveChunks(
  query: string,
  parserType: 'docling' | 'azure_di',
  topK: number = 5
): Promise<RetrievedChunk[]> {
  try {
    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query);

    // Convert to PostgreSQL vector format
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    // Perform vector similarity search with source_tool filter
    const results = await prisma.$queryRaw<RetrievedChunk[]>`
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

    return results;
  } catch (error) {
    console.error('Retrieval error:', error);
    throw error;
  }
}

/**
 * Retrieve chunks from both parsers for comparison
 */
export async function retrieveFromBothParsers(
  query: string,
  topK: number = 5
): Promise<{
  docling: RetrievedChunk[];
  azure_di: RetrievedChunk[];
}> {
  const [doclingChunks, azureChunks] = await Promise.all([
    retrieveChunks(query, 'docling', topK),
    retrieveChunks(query, 'azure_di', topK),
  ]);

  return {
    docling: doclingChunks,
    azure_di: azureChunks,
  };
}
