import prisma from '../../config/database';
import { updateDocumentStatus } from '../../services/upload.service';

const PARSING_SERVICE_URL = process.env.PARSING_SERVICE_URL || 'http://localhost:8000';

interface NormalizedChunk {
  content: string;
  pageNumber: number;
  chunkSerial: number;
  sectionTitle?: string;
  layoutMetadata?: any;
}

export async function parseWithDocling(documentId: string, filePath: string) {
  try {
    // Update status to processing
    await updateDocumentStatus(documentId, 'docling', 'processing');

    // Call Python parsing service
    const response = await fetch(`${PARSING_SERVICE_URL}/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        filePath,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Parsing service error: ${error}`);
    }

    const { chunks }: { chunks: NormalizedChunk[] } = await response.json();

    // Get document info for metadata
    const document = await prisma.document.findUnique({ where: { id: documentId } });

    if (!document) {
      throw new Error('Document not found');
    }

    // Store chunks in database
    await prisma.documentChunk.createMany({
      data: chunks.map((chunk) => ({
        documentId,
        content: chunk.content,
        metadata: {
          source_tool: 'docling',
          file_name: document.filename,
          page_number: chunk.pageNumber,
          chunk_serial: chunk.chunkSerial,
          section_title: chunk.sectionTitle,
          layout_info: chunk.layoutMetadata,
        },
      })),
    });

    // Update status to completed
    await updateDocumentStatus(documentId, 'docling', 'completed');
  } catch (error) {
    console.error('Docling parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateDocumentStatus(documentId, 'docling', 'failed', errorMessage);
    throw error;
  }
}
