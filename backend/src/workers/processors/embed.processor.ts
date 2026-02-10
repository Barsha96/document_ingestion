import prisma from '../../config/database';
import { generateEmbedding } from '../../services/embedding.service';

export async function generateEmbeddings(documentId: string, parser: string) {
  try {
    // Fetch all chunks for this document and parser without embeddings
    const chunks = await prisma.documentChunk.findMany({
      where: {
        documentId,
        embedding: null,
        metadata: {
          path: ['source_tool'],
          equals: parser,
        },
      },
    });

    if (chunks.length === 0) {
      console.log(`No chunks to embed for document ${documentId} (${parser})`);
      return;
    }

    console.log(`Generating embeddings for ${chunks.length} chunks...`);

    // Process in batches of 10 to avoid rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (chunk) => {
          const embedding = await generateEmbedding(chunk.content);

          // Update chunk with embedding using raw SQL (Prisma doesn't support vector type)
          await prisma.$executeRaw`
            UPDATE document_chunks
            SET embedding = ${embedding}::vector
            WHERE id = ${chunk.id}::uuid
          `;
        })
      );

      console.log(`Embedded ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length} chunks`);
    }

    console.log(`✅ All embeddings generated for document ${documentId} (${parser})`);
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw error;
  }
}
