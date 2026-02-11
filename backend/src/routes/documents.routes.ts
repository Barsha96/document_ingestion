import { Router } from 'express';
import {
  listDocuments,
  getDocumentById,
  deleteDocument
} from '../services/upload.service';
import { serializeBigInt } from '../utils/json.util';

const router = Router();

// Get all documents
router.get('/', async (req, res, next) => {
  try {
    const documents = await listDocuments();
    res.json({ documents: serializeBigInt(documents) });
  } catch (error) {
    next(error);
  }
});

// Get document by ID
router.get('/:id', async (req, res, next) => {
  try {
    const document = await getDocumentById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document: serializeBigInt(document) });
  } catch (error) {
    next(error);
  }
});

// Delete document
router.delete('/:id', async (req, res, next) => {
  try {
    await deleteDocument(req.params.id);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
