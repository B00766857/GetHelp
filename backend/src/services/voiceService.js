const OpenAI = require('openai');
const fs = require('fs');

class VoiceService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async speechToText(audioFile) {
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFile),
        model: "whisper-1",
      });
      return transcription.text;
    } catch (error) {
      throw new Error(`Speech-to-text failed: ${error.message}`);
    }
  }

  async textToSpeech(text) {
    try {
      const mp3 = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
      });
      return mp3;
    } catch (error) {
      throw new Error(`Text-to-speech failed: ${error.message}`);
    }
  }
}

module.exports = VoiceService;