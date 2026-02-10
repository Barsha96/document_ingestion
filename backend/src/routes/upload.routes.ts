import { Router } from 'express';
import { UploadedFile } from 'express-fileupload';
import { uploadDocument } from '../services/upload.service';

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

    res.status(201).json({
      success: true,
      document,
      message: 'File uploaded successfully. Processing started.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
