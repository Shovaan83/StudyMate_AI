require('dotenv').config();
const DeepSeekService = require('./services/deepseekService');

async function testDeepSeekAPI() {
  try {
    console.log('🔍 Testing DeepSeek API connection...');
    
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('❌ DEEPSEEK_API_KEY not found in environment');
      return;
    }
    
    const deepseekService = new DeepSeekService();
    
    // Test 1: Basic text summarization
    console.log('📝 Testing text summarization...');
    const testText = `Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines capable of performing tasks that typically require human intelligence. AI systems can learn, reason, perceive, and make decisions. Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed.`;
    
    const summary = await deepseekService.summarizeText(testText);
    console.log('✅ Summary Result:', summary);
    
    // Test 2: Quiz generation
    console.log('\n🧠 Testing quiz generation...');
    const quiz = await deepseekService.generateQuiz(testText, 'medium', 2);
    console.log('✅ Quiz Result:', quiz);
    
    // Test 3: Motivational message
    console.log('\n💪 Testing motivational message...');
    const motivation = await deepseekService.generateMotivationalMessage('Student learning AI concepts');
    console.log('✅ Motivation Result:', motivation);
    
    // Test 4: Service status
    console.log('\n📊 Service Status:', deepseekService.getStatus());
    
    console.log('\n🎉 All DeepSeek API tests passed!');
    
  } catch (error) {
    console.error('❌ DeepSeek API test failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testDeepSeekAPI();