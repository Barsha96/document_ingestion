import { AzureKeyCredential, DocumentAnalysisClient } from '@azure/ai-form-recognizer';
import fs from 'fs/promises';
import prisma from '../../config/database';
import { updateDocumentStatus } from '../../services/upload.service';
import { semanticChunk } from '../../utils/chunking.util';
import { convertAzureToMarkdown } from '../../services/normalization.service';

const AZURE_ENDPOINT = process.env.AZURE_DI_ENDPOINT;
const AZURE_KEY = process.env.AZURE_DI_KEY;

export async function parseWithAzureDI(documentId: string, filePath: string) {
  try {
    if (!AZURE_ENDPOINT || !AZURE_KEY) {
      throw new Error('Azure Document Intelligence credentials not configured');
    }

    // Check file size before processing (Azure DI Free tier: 4MB limit, Standard: 500MB)
    const AZURE_DI_MAX_SIZE = 4 * 1024 * 1024; // 4 MB for free tier
    const fileStats = await fs.stat(filePath);

    if (fileStats.size > AZURE_DI_MAX_SIZE) {
      const sizeMB = (fileStats.size / 1024 / 1024).toFixed(2);
      const errorMsg = `File size (${sizeMB} MB) exceeds Azure DI free tier limit (4 MB). Upgrade to Standard tier or use smaller files.`;
      await updateDocumentStatus(documentId, 'azure_di', 'failed', errorMsg);
      console.log(`⚠️ ${errorMsg}`);
      return; // Skip processing without throwing error
    }

    // Update status to processing
    await updateDocumentStatus(documentId, 'azure_di', 'processing');

    // Initialize Azure client
    const client = new DocumentAnalysisClient(
      AZURE_ENDPOINT,
      new AzureKeyCredential(AZURE_KEY)
    );

    // Read file
    const fileBuffer = await fs.readFile(filePath);

    // Analyze document with layout model
    const poller = await client.beginAnalyzeDocument('prebuilt-layout', fileBuffer);
    const result = await poller.pollUntilDone();

    // Convert Azure result to Markdown
    const markdown = convertAzureToMarkdown(result);

    // Get document info for metadata
    const document = await prisma.document.findUnique({ where: { id: documentId } });

    if (!document) {
      throw new Error('Document not found');
    }

    // Perform semantic chunking
    const chunks = semanticChunk(markdown, document.filename);

    // Store chunks in database
    await prisma.documentChunk.createMany({
      data: chunks.map((chunk) => ({
        documentId,
        content: chunk.content,
        metadata: {
          source_tool: 'azure_di',
          file_name: document.filename,
          page_number: chunk.pageNumber,
          chunk_serial: chunk.chunkSerial,
          section_title: chunk.sectionTitle,
          layout_info: chunk.layoutMetadata,
        },
      })),
    });

    // Update status to completed
    await updateDocumentStatus(documentId, 'azure_di', 'completed');
  } catch (error) {
    console.error('Azure DI parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateDocumentStatus(documentId, 'azure_di', 'failed', errorMessage);
    throw error;
  }
}
