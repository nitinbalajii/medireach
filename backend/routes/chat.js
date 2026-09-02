const express = require('express');
const crypto = require('crypto');
const { processMessage } = require('../services/aiService');

const router = express.Router();

/**
 * POST /api/chat
 * Main AI chat endpoint.
 */
router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const activeSessionId = sessionId || `session_${crypto.randomUUID()}`;

    // Get Socket.io instance from the app
    const io = req.app.get('io');

    const response = await processMessage(activeSessionId, message.trim(), io);

    res.json({
      sessionId: activeSessionId,
      response: response.text,
      severity: response.severity,
      toolsCalled: response.toolsCalled,
      dispatchInfo: response.dispatchInfo,
    });
  } catch (error) {
    console.error('[Chat Route] Error:', error);
    res.status(500).json({
      error: 'Failed to process message.',
      details: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
