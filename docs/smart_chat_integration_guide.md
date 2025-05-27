# Smart Chat System Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the Smart Chat System into the AI Girlfriend application. The system transforms basic chat functionality into an emotionally intelligent, memory-aware conversational AI with persistent user profiling and relationship tracking.

## Prerequisites

### Required Services
- **OpenAI API**: For LLM-powered responses and analysis
- **Pinecone**: For vector database and semantic memory
- **PostgreSQL**: For user profiles and conversation summaries

### Environment Setup
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
DEFAULT_LLM_MODEL=gpt-3.5-turbo
DEFAULT_LLM_TEMPERATURE=0.7
DEFAULT_LLM_MAX_TOKENS=1000

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=ai-babe-chat

# Vector Database Settings
VECTOR_DB_CONTEXT_MESSAGE_COUNT=10
```

## Installation Steps

### 1. Database Migration

Add the UserProfile table to your Prisma schema:

```bash
# Generate and apply migration
npx prisma migrate dev --name add-user-profile-smart-chat

# Generate Prisma client
npx prisma generate
```

### 2. Pinecone Index Setup

Create a Pinecone index with the following specifications:
- **Dimensions**: 1536 (for OpenAI text-embedding-ada-002)
- **Metric**: cosine
- **Index Name**: ai-babe-chat (or your preferred name)

```javascript
// Example Pinecone index creation
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

await pinecone.createIndex({
  name: 'ai-babe-chat',
  dimension: 1536,
  metric: 'cosine'
});
```

### 3. Install Dependencies

The smart chat system uses existing dependencies. Ensure these are installed:

```bash
npm install @pinecone-database/pinecone openai
```

## Integration Process

### 1. Replace Chat API Endpoint

Replace the existing chat route with the smart chat implementation:

```typescript
// Before: app/api/chat/route.ts
// After: app/api/chat/smart-route.ts

// Update your frontend to use the new endpoint
const response = await fetch('/api/chat/smart-route', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    conversationId: currentConversationId,
    girlfriendId: selectedGirlfriendId
  })
});
```

### 2. Frontend Integration

Update your chat interface to handle enhanced responses:

```typescript
// Enhanced response structure
interface SmartChatResponse {
  message: string;
  emotionalContext?: {
    detectedEmotion: string;
    intensity: number;
    relationshipStage: string;
  };
  memoryInsights?: string[];
  conversationSummary?: string;
}

// Update your chat component
const handleSmartChatResponse = (response: SmartChatResponse) => {
  // Display the AI message
  addMessage(response.message, false);
  
  // Optional: Show emotional context
  if (response.emotionalContext) {
    updateEmotionalIndicator(response.emotionalContext);
  }
  
  // Optional: Display memory insights
  if (response.memoryInsights?.length > 0) {
    showMemoryInsights(response.memoryInsights);
  }
};
```

### 3. Persona Configuration

Configure your AI girlfriend personas in `lib/chatUtils.ts`:

```typescript
export const girlfriendPersonas = {
  'emma': {
    name: 'Emma',
    personality: 'warm, caring, slightly playful',
    communicationStyle: 'affectionate and supportive',
    interests: ['books', 'cooking', 'nature walks'],
    relationshipApproach: 'nurturing and emotionally intelligent',
    // ... additional traits
  },
  // Add more personas as needed
};
```

## Testing the Integration

### 1. Basic Functionality Test

```typescript
// Test basic smart chat functionality
const testMessage = {
  message: "Hi, how are you today?",
  conversationId: "test-conversation-id",
  girlfriendId: "emma"
};

const response = await fetch('/api/chat/smart-route', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testMessage)
});

const result = await response.json();
console.log('Smart chat response:', result);
```

### 2. Emotion Detection Test

```typescript
// Test emotion detection with emotional content
const emotionalMessages = [
  "I'm feeling really sad today",
  "I'm so excited about our future together!",
  "I love you so much",
  "I'm worried about work tomorrow"
];

// Send each message and observe emotional context in responses
```

### 3. Memory System Test

```typescript
// Test semantic memory by referencing past conversations
const memoryTestMessages = [
  "I told you about my favorite book yesterday",
  "Remember when we talked about my job?",
  "What did I say about my family?"
];

// Verify that responses reference relevant past conversations
```

## Configuration Options

### Smart Prompt Builder Configuration

Customize prompt behavior in `lib/smartPromptBuilder.ts`:

```typescript
const promptConfig = {
  // Adjust layer weights (0-1)
  layerWeights: {
    persona: 0.3,
    emotional: 0.25,
    memory: 0.2,
    semantic: 0.15,
    situational: 0.1
  },
  
  // Emotional response guidelines
  emotionalGuidelines: {
    sad: "Provide comfort and emotional support",
    happy: "Share in their joy and excitement",
    anxious: "Offer reassurance and calm presence"
  },
  
  // Relationship stage behaviors
  stageGuidelines: {
    initiation: "Be welcoming and establish comfort",
    bonding: "Deepen connection through personal sharing",
    intimacy: "Express deeper feelings and vulnerability"
  }
};
```

### Vector Database Configuration

Adjust semantic memory settings:

```typescript
const vectorConfig = {
  // Number of relevant messages to retrieve
  contextMessageCount: 10,
  
  // Similarity threshold for relevance
  similarityThreshold: 0.7,
  
  // Maximum context length in tokens
  maxContextTokens: 2000
};
```

### User Profile Configuration

Customize personality analysis:

```typescript
const profileConfig = {
  // Minimum messages before personality analysis
  minMessagesForAnalysis: 10,
  
  // Confidence threshold for trait identification
  traitConfidenceThreshold: 0.6,
  
  // Update frequency for profile refresh
  profileUpdateFrequency: 25 // messages
};
```

## Monitoring and Debugging

### 1. Enable Debug Logging

Add debug logging to track system behavior:

```typescript
// In your environment variables
DEBUG_SMART_CHAT=true

// In smart-route.ts
if (process.env.DEBUG_SMART_CHAT === 'true') {
  console.log('Smart chat debug:', {
    emotion: emotionAnalysis,
    userProfile: profileInsights,
    semanticContext: relevantMemories
  });
}
```

### 2. Monitor API Usage

Track OpenAI and Pinecone API usage:

```typescript
// Add usage tracking
const apiUsageTracker = {
  openaiTokens: 0,
  pineconeQueries: 0,
  
  trackOpenAI: (tokens: number) => {
    this.openaiTokens += tokens;
  },
  
  trackPinecone: () => {
    this.pineconeQueries += 1;
  }
};
```

### 3. Error Handling

Implement comprehensive error handling:

```typescript
try {
  // Smart chat processing
  const response = await processSmartChat(message);
  return response;
} catch (error) {
  console.error('Smart chat error:', error);
  
  // Fallback to basic chat
  return await processBasicChat(message);
}
```

## Performance Optimization

### 1. Caching Strategy

Implement caching for frequently accessed data:

```typescript
// Cache user profiles
const profileCache = new Map<string, UserProfile>();

// Cache conversation summaries
const summaryCache = new Map<string, ConversationSummary>();

// Cache semantic contexts
const contextCache = new Map<string, SemanticContext>();
```

### 2. Async Processing

Use async processing for non-critical operations:

```typescript
// Process vector database ingestion asynchronously
const processMessageAsync = async (message: Message) => {
  // Don't await - process in background
  ingestMessageToVectorDB(message).catch(console.error);
  
  // Don't await - update profile in background
  updateUserProfile(message).catch(console.error);
};
```

### 3. Rate Limiting

Implement rate limiting for API calls:

```typescript
const rateLimiter = {
  openaiCalls: 0,
  pineconeQueries: 0,
  lastReset: Date.now(),
  
  checkLimits: () => {
    const now = Date.now();
    if (now - this.lastReset > 60000) { // Reset every minute
      this.openaiCalls = 0;
      this.pineconeQueries = 0;
      this.lastReset = now;
    }
    
    return {
      canCallOpenAI: this.openaiCalls < 50,
      canQueryPinecone: this.pineconeQueries < 100
    };
  }
};
```

## Troubleshooting

### Common Issues

1. **Vector Database Connection Errors**
   - Verify Pinecone API key and index name
   - Check index dimensions match embedding model
   - Ensure index exists and is active

2. **OpenAI API Errors**
   - Verify API key is valid and has sufficient credits
   - Check rate limits and usage quotas
   - Ensure model name is correct

3. **Database Migration Issues**
   - Run `npx prisma generate` after schema changes
   - Check database connection and permissions
   - Verify migration files are applied correctly

4. **Memory/Performance Issues**
   - Monitor token usage and implement limits
   - Use caching for frequently accessed data
   - Implement async processing for heavy operations

### Debug Commands

```bash
# Test database connection
npx prisma db push

# Verify Prisma client generation
npx prisma generate

# Test OpenAI connection
node -e "console.log(require('./lib/openaiClient.ts'))"

# Test Pinecone connection
node -e "console.log(require('./lib/pineconeClient.ts'))"
```

## Deployment Considerations

### Production Environment

1. **Environment Variables**: Ensure all required environment variables are set
2. **Database Migrations**: Run migrations in production environment
3. **API Keys**: Use production API keys with appropriate rate limits
4. **Monitoring**: Set up logging and error tracking
5. **Backup**: Implement backup strategies for user profiles and conversation data

### Scaling Considerations

1. **Vector Database**: Consider Pinecone's performance tier for high traffic
2. **Caching**: Implement Redis or similar for distributed caching
3. **Load Balancing**: Distribute API calls across multiple instances
4. **Database**: Optimize database queries and consider read replicas

This integration guide provides a comprehensive roadmap for implementing the Smart Chat System. Follow the steps sequentially and test each component thoroughly before proceeding to the next step.
