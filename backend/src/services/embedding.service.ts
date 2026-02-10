import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSION = 1536;

export async function generateEmbedding(text: string): Promise<string> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSION,
    });

    const embedding = response.data[0].embedding;

    // Convert to PostgreSQL vector format: [1,2,3,...]
    return `[${embedding.join(',')}]`;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: query,
      dimensions: EMBEDDING_DIMENSION,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating query embedding:', error);
    throw error;
  }
}
