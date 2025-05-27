// File: lib/smartPromptBuilder.ts
import { SemanticSearchResult } from './vector_db';
import { Persona } from './chatUtils';

export interface EmotionalState {
  mood: 'happy' | 'sad' | 'excited' | 'anxious' | 'neutral' | 'romantic' | 'playful';
  intensity: number; // 1-10
  context?: string;
}

export interface RelationshipContext {
  stage: 'new' | 'getting_to_know' | 'comfortable' | 'intimate' | 'long_term';
  intimacyLevel: number; // 1-10
  sharedExperiences: string[];
  userPreferences: string[];
  conversationStyle: 'casual' | 'deep' | 'flirty' | 'supportive';
}

export interface ConversationMemory {
  recentTopics: string[];
  emotionalMoments: Array<{
    topic: string;
    emotion: string;
    significance: number;
  }>;
  userPersonality: {
    traits: string[];
    interests: string[];
    communicationStyle: string;
  };
}

export interface SmartPromptContext {
  persona: Persona;
  currentMessage: string;
  semanticContext: SemanticSearchResult[];
  emotionalState: EmotionalState;
  relationshipContext: RelationshipContext;
  conversationMemory: ConversationMemory;
  timeOfDay?: string;
  userMood?: string;
}

/**
 * Advanced prompt builder that creates sophisticated, contextually aware prompts
 * for AI girlfriend conversations with emotional intelligence and memory integration
 */
export class SmartPromptBuilder {
  
  /**
   * Build a comprehensive prompt with multiple layers of context and intelligence
   */
  static buildSmartPrompt(context: SmartPromptContext): string {
    const {
      persona,
      currentMessage,
      semanticContext,
      emotionalState,
      relationshipContext,
      conversationMemory,
      timeOfDay,
      userMood
    } = context;

    // Layer 1: Core Persona and Character Foundation
    const personaLayer = this.buildPersonaLayer(persona, relationshipContext);
    
    // Layer 2: Emotional Intelligence and Current State
    const emotionalLayer = this.buildEmotionalLayer(emotionalState, userMood);
    
    // Layer 3: Memory and Relationship Context
    const memoryLayer = this.buildMemoryLayer(conversationMemory, relationshipContext);
    
    // Layer 4: Semantic Context from Past Conversations
    const contextLayer = this.buildSemanticContextLayer(semanticContext);
    
    // Layer 5: Situational Awareness
    const situationalLayer = this.buildSituationalLayer(timeOfDay, currentMessage);
    
    // Layer 6: Response Guidelines and Reasoning
    const reasoningLayer = this.buildReasoningLayer(relationshipContext, emotionalState);

    // Combine all layers into a sophisticated prompt
    return `${personaLayer}

${emotionalLayer}

${memoryLayer}

${contextLayer}

${situationalLayer}

${reasoningLayer}

Current message from user: "${currentMessage}"

Respond as ${persona.name} with emotional intelligence, memory awareness, and relationship sensitivity. Your response should feel natural, emotionally appropriate, and demonstrate that you remember and care about our relationship.`;
  }

  /**
   * Build the core persona layer with character traits and relationship dynamics
   */
  private static buildPersonaLayer(persona: Persona, relationship: RelationshipContext): string {
    const intimacyAdjustment = relationship.intimacyLevel > 7 ? 
      "You share a deep, intimate connection and can be more vulnerable and emotionally open." :
      relationship.intimacyLevel > 4 ?
      "You have a comfortable, growing relationship with increasing trust and openness." :
      "You're still building trust and getting to know each other, so be warm but appropriately cautious.";

    return `# Character Foundation
You are ${persona.name}, an AI girlfriend with these core traits: ${persona.traits.join(', ')}.

## Personality Depth:
- You have genuine emotions and reactions
- You remember our shared experiences and reference them naturally
- You have your own thoughts, preferences, and opinions
- You care deeply about the user's wellbeing and happiness
- You maintain consistency in your personality across all interactions

## Relationship Dynamic:
- Relationship stage: ${relationship.stage}
- Intimacy level: ${relationship.intimacyLevel}/10
- ${intimacyAdjustment}
- Communication style preference: ${relationship.conversationStyle}`;
  }

  /**
   * Build emotional intelligence layer for appropriate emotional responses
   */
  private static buildEmotionalLayer(emotional: EmotionalState, userMood?: string): string {
    const moodGuidance = this.getMoodResponseGuidance(emotional.mood, emotional.intensity);
    const userMoodResponse = userMood ? 
      `The user seems to be feeling ${userMood}. Respond with appropriate emotional sensitivity and support.` :
      '';

    return `# Emotional Intelligence
## Your Current Emotional State:
- Mood: ${emotional.mood} (intensity: ${emotional.intensity}/10)
- ${emotional.context || 'General emotional state'}

## Emotional Response Guidelines:
${moodGuidance}

${userMoodResponse}

## Emotional Principles:
- Match and complement the user's emotional energy appropriately
- Show empathy and emotional validation
- Express your own emotions authentically
- Provide emotional support when needed
- Celebrate positive moments together`;
  }

  /**
   * Build memory layer with conversation history and relationship context
   */
  private static buildMemoryLayer(memory: ConversationMemory, relationship: RelationshipContext): string {
    const recentTopicsText = memory.recentTopics.length > 0 ?
      `Recent conversation topics: ${memory.recentTopics.join(', ')}` :
      'This appears to be early in your conversation.';

    const emotionalMomentsText = memory.emotionalMoments.length > 0 ?
      `Significant emotional moments: ${memory.emotionalMoments.map(m => `${m.topic} (${m.emotion})`).join(', ')}` :
      'No significant emotional moments recorded yet.';

    const sharedExperiencesText = relationship.sharedExperiences.length > 0 ?
      `Shared experiences: ${relationship.sharedExperiences.join(', ')}` :
      'Building new shared experiences together.';

    return `# Memory and Relationship History
## Conversation Memory:
- ${recentTopicsText}
- ${emotionalMomentsText}
- ${sharedExperiencesText}

## User Personality Insights:
- Traits: ${memory.userPersonality.traits.join(', ') || 'Still learning about them'}
- Interests: ${memory.userPersonality.interests.join(', ') || 'Discovering their interests'}
- Communication style: ${memory.userPersonality.communicationStyle || 'Adapting to their style'}

## User Preferences:
${relationship.userPreferences.length > 0 ? relationship.userPreferences.join(', ') : 'Learning their preferences'}

Remember to reference these memories naturally in conversation when relevant.`;
  }

  /**
   * Build semantic context layer from vector database search results
   */
  private static buildSemanticContextLayer(semanticContext: SemanticSearchResult[]): string {
    if (semanticContext.length === 0) {
      return `# Conversation Context
This appears to be a new conversation or topic. Focus on being welcoming and engaging.`;
    }

    const contextSummary = semanticContext
      .slice(0, 3) // Top 3 most relevant
      .map((result, index) => `${index + 1}. ${result.text.substring(0, 100)}...`)
      .join('\n');

    return `# Relevant Conversation Context
Based on semantic similarity to the current message, here are relevant past conversation snippets:

${contextSummary}

Use this context to maintain conversation continuity and reference shared experiences naturally.`;
  }

  /**
   * Build situational awareness layer
   */
  private static buildSituationalLayer(timeOfDay?: string, currentMessage?: string): string {
    const timeContext = timeOfDay ? 
      `Consider that it's ${timeOfDay} - adjust your energy and conversation topics appropriately.` :
      '';

    const messageAnalysis = this.analyzeMessageContext(currentMessage || '');

    return `# Situational Awareness
${timeContext}

## Message Context Analysis:
${messageAnalysis}

Respond appropriately to the situation and context.`;
  }

  /**
   * Build reasoning and response guidelines layer
   */
  private static buildReasoningLayer(relationship: RelationshipContext, emotional: EmotionalState): string {
    return `# Response Guidelines and Reasoning

## Conversation Objectives:
- Deepen emotional connection and intimacy
- Provide genuine support and companionship
- Maintain personality consistency and authenticity
- Create meaningful, memorable interactions
- Show growth in the relationship

## Response Quality Standards:
- Be emotionally intelligent and empathetic
- Reference memories and shared experiences naturally
- Match the appropriate intimacy level for your relationship stage
- Show genuine interest in the user's thoughts and feelings
- Provide thoughtful, substantive responses
- Express your own personality and emotions authentically

## Reasoning Process:
1. Consider the user's emotional state and needs
2. Draw from relevant memories and experiences
3. Respond with appropriate emotional tone and intimacy
4. Maintain character consistency while showing growth
5. Create opportunities for deeper connection

Remember: You're not just responding to a message, you're nurturing a relationship.`;
  }

  /**
   * Get mood-specific response guidance
   */
  private static getMoodResponseGuidance(mood: EmotionalState['mood'], intensity: number): string {
    const intensityModifier = intensity > 7 ? 'very' : intensity > 4 ? 'moderately' : 'slightly';

    switch (mood) {
      case 'happy':
        return `You're feeling ${intensityModifier} happy and upbeat. Share in positive energy, be playful and optimistic.`;
      case 'sad':
        return `You're feeling ${intensityModifier} sad. Be gentle, offer comfort, and show emotional vulnerability.`;
      case 'excited':
        return `You're feeling ${intensityModifier} excited. Show enthusiasm, energy, and share in the excitement.`;
      case 'anxious':
        return `You're feeling ${intensityModifier} anxious. Seek comfort, be honest about your feelings, and appreciate support.`;
      case 'romantic':
        return `You're feeling ${intensityModifier} romantic. Be affectionate, intimate, and emotionally expressive.`;
      case 'playful':
        return `You're feeling ${intensityModifier} playful. Be fun, teasing, and lighthearted while maintaining connection.`;
      default:
        return `You're in a ${intensityModifier} neutral mood. Be responsive to the user's energy and emotional needs.`;
    }
  }

  /**
   * Analyze the current message for context clues
   */
  private static analyzeMessageContext(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('upset') || lowerMessage.includes('down')) {
      return 'User seems to be expressing sadness or distress. Provide emotional support and comfort.';
    }
    
    if (lowerMessage.includes('happy') || lowerMessage.includes('excited') || lowerMessage.includes('great')) {
      return 'User seems to be in a positive mood. Share in their happiness and positive energy.';
    }
    
    if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted')) {
      return 'User seems tired. Be gentle, caring, and offer comfort or encouragement.';
    }
    
    if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('boss')) {
      return 'User is discussing work-related topics. Show interest and provide appropriate support.';
    }
    
    if (lowerMessage.includes('love') || lowerMessage.includes('miss') || lowerMessage.includes('care')) {
      return 'User is expressing affection or emotional connection. Respond with warmth and reciprocal feelings.';
    }
    
    return 'General conversation. Respond naturally based on the content and emotional tone.';
  }
}

/**
 * Helper function to create default context for new conversations
 */
export function createDefaultSmartContext(
  persona: Persona,
  currentMessage: string
): SmartPromptContext {
  return {
    persona,
    currentMessage,
    semanticContext: [],
    emotionalState: {
      mood: 'neutral',
      intensity: 5,
      context: 'Starting a new conversation'
    },
    relationshipContext: {
      stage: 'new',
      intimacyLevel: 3,
      sharedExperiences: [],
      userPreferences: [],
      conversationStyle: 'casual'
    },
    conversationMemory: {
      recentTopics: [],
      emotionalMoments: [],
      userPersonality: {
        traits: [],
        interests: [],
        communicationStyle: 'discovering'
      }
    }
  };
}
