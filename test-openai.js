// Quick test script to verify OpenAI API connection
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  console.log('Testing OpenAI API connection...');
  console.log('API Key present:', !!process.env.OPENAI_API_KEY);
  console.log('API Key preview:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello!' }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    console.log('Success! OpenAI response:', completion.choices[0]?.message?.content);
  } catch (error) {
    console.error('OpenAI API Error:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
  }
}

testOpenAI();
