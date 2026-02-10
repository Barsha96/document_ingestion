import { Router } from 'express';
import { chat } from '../services/chat.service';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { message, parserType, model } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!parserType || !['docling', 'azure_di'].includes(parserType)) {
      return res.status(400).json({
        error: 'Invalid parserType. Must be "docling" or "azure_di"',
      });
    }

    if (!model || !['claude', 'openai'].includes(model)) {
      return res.status(400).json({
        error: 'Invalid model. Must be "claude" or "openai"',
      });
    }

    const response = await chat(message, parserType, model);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
