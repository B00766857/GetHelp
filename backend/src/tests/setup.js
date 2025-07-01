// Setup environment variables for testing
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/gethelp-test';
process.env.REDIS_URL = 'redis://localhost:6379';

// Mock OpenAI to avoid actual API calls during testing
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    audio: {
      transcriptions: {
        create: jest.fn().mockResolvedValue({ text: 'Test transcription' })
      },
      speech: {
        create: jest.fn().mockResolvedValue('mock audio buffer')
      }
    },
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test AI response' } }]
        })
      }
    }
  }));
});