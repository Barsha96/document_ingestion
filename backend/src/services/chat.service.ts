import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { retrieveChunks, RetrievedChunk } from './retrieval.service';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatResponse {
  answer: string;
  retrievedChunks: RetrievedChunk[];
  model: string;
  parserType: string;
}

export async function chat(
  message: string,
  parserType: 'docling' | 'azure_di',
  model: 'claude' | 'openai'
): Promise<ChatResponse> {
  try {
    // Retrieve relevant chunks
    const retrievedChunks = await retrieveChunks(message, parserType, 5);

    if (retrievedChunks.length === 0) {
      return {
        answer: 'No relevant information found in the uploaded documents. Please upload documents first.',
        retrievedChunks: [],
        model,
        parserType,
      };
    }

    // Format context from retrieved chunks
    const context = retrievedChunks
      .map((chunk, idx) => {
        const metadata = chunk.metadata as any;
        return `[${idx + 1}] (Page ${metadata.page_number}, ${metadata.file_name})\n${chunk.content}`;
      })
      .join('\n\n---\n\n');

    // Create prompt
    const prompt = `You are a helpful assistant. Use the following context from documents to answer the user's question. If the answer cannot be found in the context, say so.

Context:
${context}

Question: ${message}

Answer:`;

    let answer: string;

    if (model === 'claude') {
      answer = await chatWithClaude(prompt);
    } else {
      answer = await chatWithOpenAI(prompt);
    }

    return {
      answer,
      retrievedChunks,
      model,
      parserType,
    };
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
}

async function chatWithClaude(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  return '';
}

async function chatWithOpenAI(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content || '';
}
