const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const VoiceService = require('../services/voiceService');
const AIService = require('../services/aiService');

const router = express.Router();
const voiceService = new VoiceService();
const aiService = new AIService();

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'temp-audio';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `audio-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /wav|mp3|m4a|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Process voice input
router.post('/process', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Convert speech to text
    const transcription = await voiceService.speechToText(req.file.path);
    
    // Process with AI
    const conversationHistory = req.body.history ? JSON.parse(req.body.history) : [];
    const aiResponse = await aiService.processConversation(transcription, conversationHistory);
    
    // Generate speech from AI response
    const audioResponse = await voiceService.textToSpeech(aiResponse);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({
      transcription,
      response: aiResponse,
      audioResponse: audioResponse ? 'Audio generated successfully' : null
    });
    
  } catch (error) {
    console.error('Voice processing error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Voice processing failed',
      message: error.message 
    });
  }
});

// Text-only conversation endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const conversationHistory = history || [];
    const response = await aiService.processConversation(message, conversationHistory);
    
    res.json({
      message,
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({ 
      error: 'Chat processing failed',
      message: error.message 
    });
  }
});

// Text-to-speech endpoint
router.post('/speak', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const audioBuffer = await voiceService.textToSpeech(text);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="speech.mp3"'
    });
    
    // Convert audio buffer to response
    audioBuffer.pipe(res);
    
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ 
      error: 'Text-to-speech failed',
      message: error.message 
    });
  }
});

module.exports = router;