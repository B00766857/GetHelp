const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.systemPrompt = `You are a helpful customer service AI assistant for GetHelp. 
    You can help customers with:
    1. Account information retrieval
    2. Appointment scheduling
    3. Order status and tracking
    4. Bill payment processing
    5. Technical support ticketing
    6. Product information and recommendations
    
    Always be polite, helpful, and ask clarifying questions when needed.`;
  }

  async processConversation(userMessage, conversationHistory = []) {
    try {
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }
}

module.exports = AIService;