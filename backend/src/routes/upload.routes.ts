import { Router } from 'express';
import { UploadedFile } from 'express-fileupload';
import { uploadDocument } from '../services/upload.service';
import { serializeBigInt } from '../utils/json.util';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file as UploadedFile;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-powerpoint', // .ppt
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Supported types: PDF, DOCX, DOC, PPTX, PPT',
      });
    }

    const document = await uploadDocument(file);

    // Check if file is too large for Azure DI (Free tier: 4MB limit)
    const AZURE_DI_MAX_SIZE = 4 * 1024 * 1024; // 4 MB
    const warnings = [];
    if (file.size > AZURE_DI_MAX_SIZE) {
      warnings.push(`File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds Azure DI free tier limit (4 MB). Azure DI processing will be skipped.`);
    }

    res.status(201).json({
      success: true,
      document: serializeBigInt(document),
      message: 'File uploaded successfully. Processing started.',
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
