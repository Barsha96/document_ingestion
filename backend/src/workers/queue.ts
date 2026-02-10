import Bull from 'bull';
import { parseWithDocling } from './processors/parse-docling.processor';
import { parseWithAzureDI } from './processors/parse-azure.processor';
import { generateEmbeddings } from './processors/embed.processor';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create queues
export const doclingQueue = new Bull('docling-parsing', REDIS_URL);
export const azureQueue = new Bull('azure-parsing', REDIS_URL);
export const embeddingQueue = new Bull('embedding-generation', REDIS_URL);

// Process Docling parsing jobs
doclingQueue.process(async (job) => {
  const { documentId, filePath } = job.data;
  console.log(`Processing Docling job for document ${documentId}`);

  try {
    await parseWithDocling(documentId, filePath);
    console.log(`✅ Docling parsing completed for document ${documentId}`);

    // Enqueue embedding generation
    await embeddingQueue.add({ documentId, parser: 'docling' });
  } catch (error) {
    console.error(`❌ Docling parsing failed for document ${documentId}:`, error);
    throw error;
  }
});

// Process Azure DI parsing jobs
azureQueue.process(async (job) => {
  const { documentId, filePath } = job.data;
  console.log(`Processing Azure DI job for document ${documentId}`);

  try {
    await parseWithAzureDI(documentId, filePath);
    console.log(`✅ Azure DI parsing completed for document ${documentId}`);

    // Enqueue embedding generation
    await embeddingQueue.add({ documentId, parser: 'azure_di' });
  } catch (error) {
    console.error(`❌ Azure DI parsing failed for document ${documentId}:`, error);
    throw error;
  }
});

// Process embedding generation jobs
embeddingQueue.process(async (job) => {
  const { documentId, parser } = job.data;
  console.log(`Generating embeddings for document ${documentId} (${parser})`);

  try {
    await generateEmbeddings(documentId, parser);
    console.log(`✅ Embeddings generated for document ${documentId} (${parser})`);
  } catch (error) {
    console.error(`❌ Embedding generation failed for document ${documentId}:`, error);
    throw error;
  }
});

// Enqueue parsing jobs for both parsers
export async function enqueueParsingJobs(documentId: string, filePath: string) {
  await Promise.all([
    doclingQueue.add({ documentId, filePath }),
    azureQueue.add({ documentId, filePath }),
  ]);
}

// Event listeners for monitoring
doclingQueue.on('completed', (job) => {
  console.log(`Docling job ${job.id} completed`);
});

doclingQueue.on('failed', (job, err) => {
  console.error(`Docling job ${job?.id} failed:`, err);
});

azureQueue.on('completed', (job) => {
  console.log(`Azure DI job ${job.id} completed`);
});

azureQueue.on('failed', (job, err) => {
  console.error(`Azure DI job ${job?.id} failed:`, err);
});

embeddingQueue.on('completed', (job) => {
  console.log(`Embedding job ${job.id} completed`);
});

embeddingQueue.on('failed', (job, err) => {
  console.error(`Embedding job ${job?.id} failed:`, err);
});
