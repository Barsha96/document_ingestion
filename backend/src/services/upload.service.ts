import { UploadedFile } from 'express-fileupload';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import prisma from '../config/database';
import { enqueueParsingJobs } from '../workers/queue';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function uploadDocument(file: UploadedFile) {
  await ensureUploadDir();

  // Generate unique filename
  const fileId = uuidv4();
  const ext = path.extname(file.name);
  const filename = `${fileId}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  // Save file to disk
  await file.mv(filePath);

  // Create document record
  const document = await prisma.document.create({
    data: {
      filename: file.name,
      filePath,
      fileType: ext.substring(1), // Remove leading dot
      fileSize: BigInt(file.size),
      doclingStatus: 'pending',
      azureDiStatus: 'pending',
    },
  });

  // Enqueue parsing jobs
  await enqueueParsingJobs(document.id, filePath);

  return document;
}

export async function listDocuments() {
  return prisma.document.findMany({
    orderBy: { uploadTimestamp: 'desc' },
    include: {
      _count: {
        select: { chunks: true },
      },
    },
  });
}

export async function getDocumentById(id: string) {
  return prisma.document.findUnique({
    where: { id },
    include: {
      _count: {
        select: { chunks: true },
      },
    },
  });
}

export async function deleteDocument(id: string) {
  const document = await prisma.document.findUnique({ where: { id } });

  if (!document) {
    throw new Error('Document not found');
  }

  // Delete file from disk
  try {
    await fs.unlink(document.filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }

  // Delete from database (cascades to chunks)
  await prisma.document.delete({ where: { id } });
}

export async function updateDocumentStatus(
  id: string,
  parser: 'docling' | 'azure_di',
  status: string,
  error?: string
) {
  const updateData: any = {};

  if (parser === 'docling') {
    updateData.doclingStatus = status;
    if (error) updateData.doclingError = error;
  } else {
    updateData.azureDiStatus = status;
    if (error) updateData.azureDiError = error;
  }

  return prisma.document.update({
    where: { id },
    data: updateData,
  });
}
