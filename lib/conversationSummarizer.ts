// File: lib/conversationSummarizer.ts
import { Message } from '@prisma/client';
import { getChatCompletion } from './llm_service';
import { db } from './db';

export interface ConversationSummary {
  id: string;
  conversationId: string;
  summary: string;
  keyTopics: string[];
  emotionalHighlights: string[];
  relationshipMilestones: string[];
  userPersonalityInsights: string[];
  significantMoments: Array<{
    type: string;
    description: string;
    timestamp: Date;
    significance: number; // 1-10
  }>;
  summaryMetadata: {
    messageCount: number;
    timeSpan: string;
    averageMessageLength: number;
    emotionalTone: string;
    conversationQuality: number; // 1-10
  };
  createdAt: Date;
  lastUpdated: Date;
}

export interface SummarizationConfig {
  maxTokens: number;
  includeEmotionalAnalysis: boolean;
  includePersonalityInsights: boolean;
  includeRelationshipMilestones: boolean;
  compressionRatio: number; // Target ratio of summary to original content
}

/**
 * Advanced conversation summarization with emotional intelligence and relationship tracking
 */
export class ConversationSummarizer {
  
  private static defaultConfig: SummarizationConfig = {
    maxTokens: 1000,
    includeEmotionalAnalysis: true,
    includePersonalityInsights: true,
    includeRelationshipMilestones: true,
    compressionRatio: 0.1 // 10% of original length
  };

  /**
   * Create a comprehensive summary of a conversation
   */
  static async summarizeConversation(
    conversationId: string,
    messages: Message[],
    config: Partial<SummarizationConfig> = {}
  ): Promise<ConversationSummary> {
    
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Filter and prepare messages
    const validMessages = messages.filter(m => m.content && m.content.trim().length > 0);
    
    if (validMessages.length === 0) {
      return this.createEmptySummary(conversationId);
    }

    // Generate different types of summaries
    const [
      mainSummary,
      keyTopics,
      emotionalHighlights,
      relationshipMilestones,
      personalityInsights,
      significantMoments
    ] = await Promise.all([
      this.generateMainSummary(validMessages, finalConfig),
      this.extractKeyTopics(validMessages),
      finalConfig.includeEmotionalAnalysis ? this.analyzeEmotionalHighlights(validMessages) : [],
      finalConfig.includeRelationshipMilestones ? this.identifyRelationshipMilestones(validMessages) : [],
      finalConfig.includePersonalityInsights ? this.extractPersonalityInsights(validMessages) : [],
      this.identifySignificantMoments(validMessages)
    ]);

    // Generate metadata
    const metadata = this.generateSummaryMetadata(validMessages);

    return {
      id: `summary_${conversationId}_${Date.now()}`,
      conversationId,
      summary: mainSummary,
      keyTopics,
      emotionalHighlights,
      relationshipMilestones,
      userPersonalityInsights: personalityInsights,
      significantMoments,
      summaryMetadata: metadata,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
  }

  /**
   * Update existing summary with new messages
   */
  static async updateSummary(
    existingSummary: ConversationSummary,
    newMessages: Message[],
    config: Partial<SummarizationConfig> = {}
  ): Promise<ConversationSummary> {
    
    if (newMessages.length === 0) {
      return existingSummary;
    }

    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Get all messages for complete context
    const allMessages = await db.message.findMany({
      where: { conversationId: existingSummary.conversationId },
      orderBy: { createdAt: 'asc' }
    });

    // Generate incremental updates
    const [
      updatedSummary,
      newTopics,
      newEmotionalHighlights,
      newMilestones,
      newPersonalityInsights,
      newSignificantMoments
    ] = await Promise.all([
      this.generateIncrementalSummary(existingSummary.summary, newMessages, finalConfig),
      this.extractKeyTopics(newMessages),
      finalConfig.includeEmotionalAnalysis ? this.analyzeEmotionalHighlights(newMessages) : [],
      finalConfig.includeRelationshipMilestones ? this.identifyRelationshipMilestones(newMessages) : [],
      finalConfig.includePersonalityInsights ? this.extractPersonalityInsights(newMessages) : [],
      this.identifySignificantMoments(newMessages)
    ]);

    // Merge with existing data
    return {
      ...existingSummary,
      summary: updatedSummary,
      keyTopics: this.mergeUniqueItems(existingSummary.keyTopics, newTopics),
      emotionalHighlights: this.mergeUniqueItems(existingSummary.emotionalHighlights, newEmotionalHighlights),
      relationshipMilestones: this.mergeUniqueItems(existingSummary.relationshipMilestones, newMilestones),
      userPersonalityInsights: this.mergeUniqueItems(existingSummary.userPersonalityInsights, newPersonalityInsights),
      significantMoments: [...existingSummary.significantMoments, ...newSignificantMoments].slice(-20), // Keep last 20
      summaryMetadata: this.generateSummaryMetadata(allMessages),
      lastUpdated: new Date()
    };
  }

  /**
   * Generate main conversation summary using AI
   */
  private static async generateMainSummary(
    messages: Message[],
    config: SummarizationConfig
  ): Promise<string> {
    
    const conversationText = this.formatMessagesForSummarization(messages);
    const targetLength = Math.max(100, Math.floor(conversationText.length * config.compressionRatio));

    const prompt = `Summarize this conversation between a user and an AI girlfriend, focusing on:
1. Key topics discussed
2. Emotional moments and relationship development
3. Important personal information shared
4. Relationship progression and milestones

Target summary length: approximately ${targetLength} characters.

Conversation:
${conversationText}

Provide a comprehensive but concise summary that captures the essence of their relationship and interaction:`;

    try {
      const summary = await getChatCompletion([
        { role: 'user', content: prompt }
      ], {
        maxTokens: Math.min(config.maxTokens, 800),
        temperature: 0.3
      });

      return summary || 'Unable to generate summary';
    } catch (error) {
      console.error('Failed to generate main summary:', error);
      return this.generateFallbackSummary(messages);
    }
  }

  /**
   * Generate incremental summary update
   */
  private static async generateIncrementalSummary(
    existingSummary: string,
    newMessages: Message[],
    config: SummarizationConfig
  ): Promise<string> {
    
    const newConversationText = this.formatMessagesForSummarization(newMessages);

    const prompt = `Update this conversation summary with new messages:

Existing Summary:
${existingSummary}

New Messages:
${newConversationText}

Provide an updated summary that incorporates the new information while maintaining the key points from the existing summary:`;

    try {
      const updatedSummary = await getChatCompletion([
        { role: 'user', content: prompt }
      ], {
        maxTokens: Math.min(config.maxTokens, 800),
        temperature: 0.3
      });

      return updatedSummary || existingSummary;
    } catch (error) {
      console.error('Failed to generate incremental summary:', error);
      return existingSummary;
    }
  }

  /**
   * Extract key topics from conversation
   */
  private static async extractKeyTopics(messages: Message[]): Promise<string[]> {
    const conversationText = this.formatMessagesForSummarization(messages);

    const prompt = `Extract the main topics discussed in this conversation. Return only a comma-separated list of 3-7 key topics:

${conversationText}

Topics:`;

    try {
      const response = await getChatCompletion([
        { role: 'user', content: prompt }
      ], {
        maxTokens: 150,
        temperature: 0.2
      });

      return response
        .split(',')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0)
        .slice(0, 7);
    } catch (error) {
      console.error('Failed to extract topics:', error);
      return this.extractTopicsFallback(messages);
    }
  }

  /**
   * Analyze emotional highlights
   */
  private static async analyzeEmotionalHighlights(messages: Message[]): Promise<string[]> {
    const conversationText = this.formatMessagesForSummarization(messages);

    const prompt = `Identify the most emotionally significant moments in this conversation. Return 3-5 brief descriptions of emotional highlights:

${conversationText}

Emotional highlights:`;

    try {
      const response = await getChatCompletion([
        { role: 'user', content: prompt }
      ], {
        maxTokens: 200,
        temperature: 0.3
      });

      return response
        .split('\n')
        .map(highlight => highlight.replace(/^[-*•]\s*/, '').trim())
        .filter(highlight => highlight.length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error('Failed to analyze emotional highlights:', error);
      return this.analyzeEmotionsFallback(messages);
    }
  }

  /**
   * Identify relationship milestones
   */
  private static async identifyRelationshipMilestones(messages: Message[]): Promise<string[]> {
    const conversationText = this.formatMessagesForSummarization(messages);

    const prompt = `Identify relationship milestones and significant developments in this conversation. Return 2-4 brief milestone descriptions:

${conversationText}

Relationship milestones:`;

    try {
      const response = await getChatCompletion([
        { role: 'user', content: prompt }
      ], {
        maxTokens: 150,
        temperature: 0.3
      });

      return response
        .split('\n')
        .map(milestone => milestone.replace(/^[-*•]\s*/, '').trim())
        .filter(milestone => milestone.length > 0)
        .slice(0, 4);
    } catch (error) {
      console.error('Failed to identify milestones:', error);
      return this.identifyMilestonesFallback(messages);
    }
  }

  /**
   * Extract personality insights about the user
   */
  private static async extractPersonalityInsights(messages: Message[]): Promise<string[]> {
    const userMessages = messages.filter(m => m.isUserMessage);
    const userText = userMessages.map(m => m.content).join('\n');

    if (userText.length < 50) {
      return [];
    }

    const prompt = `Based on these user messages, identify 3-5 key personality traits or insights about the user:

${userText}

Personality insights:`;

    try {
      const response = await getChatCompletion([
        { role: 'user', content: prompt }
      ], {
        maxTokens: 150,
        temperature: 0.3
      });

      return response
        .split('\n')
        .map(insight => insight.replace(/^[-*•]\s*/, '').trim())
        .filter(insight => insight.length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error('Failed to extract personality insights:', error);
      return this.extractPersonalityFallback(userMessages);
    }
  }

  /**
   * Identify significant moments with timestamps
   */
  private static identifySignificantMoments(messages: Message[]): Array<{
    type: string;
    description: string;
    timestamp: Date;
    significance: number;
  }> {
    
    const moments: Array<{
      type: string;
      description: string;
      timestamp: Date;
      significance: number;
    }> = [];

    messages.forEach(message => {
      const content = message.content.toLowerCase();
      let type = '';
      let significance = 5;

      // Detect different types of significant moments
      if (content.includes('love') || content.includes('i love you')) {
        type = 'love_expression';
        significance = 10;
      } else if (content.includes('miss') || content.includes('i miss you')) {
        type = 'longing';
        significance = 8;
      } else if (content.includes('excited') || content.includes('amazing') || content.includes('wonderful')) {
        type = 'joy';
        significance = 7;
      } else if (content.includes('sad') || content.includes('upset') || content.includes('hurt')) {
        type = 'sadness';
        significance = 8;
      } else if (content.includes('thank') || content.includes('grateful')) {
        type = 'gratitude';
        significance = 6;
      } else if (content.includes('future') || content.includes('together') || content.includes('plan')) {
        type = 'future_planning';
        significance = 7;
      } else if (content.includes('share') || content.includes('tell you') || content.includes('secret')) {
        type = 'vulnerability';
        significance = 7;
      }

      if (type && significance >= 6) {
        moments.push({
          type,
          description: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
          timestamp: message.createdAt,
          significance
        });
      }
    });

    // Sort by significance and return top moments
    return moments
      .sort((a, b) => b.significance - a.significance)
      .slice(0, 10);
  }

  /**
   * Generate summary metadata
   */
  private static generateSummaryMetadata(messages: Message[]): ConversationSummary['summaryMetadata'] {
    const messageCount = messages.length;
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    
    const timeSpan = firstMessage && lastMessage ? 
      this.formatTimeSpan(firstMessage.createdAt, lastMessage.createdAt) : 'Unknown';
    
    const totalLength = messages.reduce((sum, m) => sum + m.content.length, 0);
    const averageMessageLength = messageCount > 0 ? Math.round(totalLength / messageCount) : 0;
    
    const emotionalTone = this.analyzeOverallEmotionalTone(messages);
    const conversationQuality = this.assessConversationQuality(messages);

    return {
      messageCount,
      timeSpan,
      averageMessageLength,
      emotionalTone,
      conversationQuality
    };
  }

  // Helper methods

  private static formatMessagesForSummarization(messages: Message[]): string {
    return messages
      .map(m => `${m.isUserMessage ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');
  }

  private static createEmptySummary(conversationId: string): ConversationSummary {
    return {
      id: `summary_${conversationId}_empty`,
      conversationId,
      summary: 'No messages to summarize',
      keyTopics: [],
      emotionalHighlights: [],
      relationshipMilestones: [],
      userPersonalityInsights: [],
      significantMoments: [],
      summaryMetadata: {
        messageCount: 0,
        timeSpan: '0 minutes',
        averageMessageLength: 0,
        emotionalTone: 'neutral',
        conversationQuality: 0
      },
      createdAt: new Date(),
      lastUpdated: new Date()
    };
  }

  private static generateFallbackSummary(messages: Message[]): string {
    const messageCount = messages.length;
    const userMessages = messages.filter(m => m.isUserMessage).length;
    const aiMessages = messageCount - userMessages;
    
    return `Conversation with ${messageCount} messages (${userMessages} from user, ${aiMessages} from AI). ` +
           `Topics discussed include general conversation and relationship building.`;
  }

  private static extractTopicsFallback(messages: Message[]): string[] {
    const topics = new Set<string>();
    const keywords = {
      'work': ['work', 'job', 'career', 'office'],
      'family': ['family', 'mom', 'dad', 'sister', 'brother'],
      'hobbies': ['hobby', 'music', 'movie', 'book', 'game'],
      'feelings': ['feel', 'emotion', 'happy', 'sad', 'love'],
      'future': ['future', 'plan', 'dream', 'goal']
    };

    messages.forEach(message => {
      const content = message.content.toLowerCase();
      Object.entries(keywords).forEach(([topic, words]) => {
        if (words.some(word => content.includes(word))) {
          topics.add(topic);
        }
      });
    });

    return Array.from(topics).slice(0, 5);
  }

  private static analyzeEmotionsFallback(messages: Message[]): string[] {
    const emotions: string[] = [];
    const emotionKeywords = {
      'Expressions of love and affection': ['love', 'care', 'miss'],
      'Moments of happiness and joy': ['happy', 'excited', 'great'],
      'Times of sadness or concern': ['sad', 'upset', 'worried'],
      'Gratitude and appreciation': ['thank', 'grateful', 'appreciate']
    };

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const hasEmotion = messages.some(m => 
        keywords.some(keyword => m.content.toLowerCase().includes(keyword))
      );
      if (hasEmotion) {
        emotions.push(emotion);
      }
    });

    return emotions.slice(0, 4);
  }

  private static identifyMilestonesFallback(messages: Message[]): string[] {
    const milestones: string[] = [];
    
    if (messages.length > 50) {
      milestones.push('Established ongoing conversation pattern');
    }
    if (messages.some(m => m.content.toLowerCase().includes('love'))) {
      milestones.push('First expressions of love');
    }
    if (messages.some(m => m.content.toLowerCase().includes('future'))) {
      milestones.push('Discussion of future plans');
    }

    return milestones;
  }

  private static extractPersonalityFallback(userMessages: Message[]): string[] {
    const traits: string[] = [];
    const allText = userMessages.map(m => m.content).join(' ').toLowerCase();
    
    if (allText.includes('work') || allText.includes('job')) {
      traits.push('Career-focused');
    }
    if (allText.includes('family') || allText.includes('friend')) {
      traits.push('Values relationships');
    }
    if (allText.includes('feel') || allText.includes('emotion')) {
      traits.push('Emotionally expressive');
    }

    return traits;
  }

  private static mergeUniqueItems(existing: string[], newItems: string[]): string[] {
    const combined = [...existing, ...newItems];
    return [...new Set(combined)];
  }

  private static formatTimeSpan(start: Date, end: Date): string {
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  }

  private static analyzeOverallEmotionalTone(messages: Message[]): string {
    const allText = messages.map(m => m.content).join(' ').toLowerCase();
    
    if (allText.includes('love') || allText.includes('happy')) return 'positive';
    if (allText.includes('sad') || allText.includes('upset')) return 'negative';
    if (allText.includes('excited') || allText.includes('amazing')) return 'enthusiastic';
    return 'neutral';
  }

  private static assessConversationQuality(messages: Message[]): number {
    let quality = 5; // Base quality
    
    // Adjust based on message count
    if (messages.length > 50) quality += 1;
    if (messages.length > 100) quality += 1;
    
    // Adjust based on message length
    const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
    if (avgLength > 50) quality += 1;
    if (avgLength > 100) quality += 1;
    
    // Adjust based on emotional content
    const emotionalWords = ['love', 'feel', 'happy', 'care', 'miss'];
    const hasEmotionalContent = messages.some(m => 
      emotionalWords.some(word => m.content.toLowerCase().includes(word))
    );
    if (hasEmotionalContent) quality += 1;

    return Math.min(10, quality);
  }
}

/**
 * Database integration for conversation summaries
 */
export class ConversationSummaryManager {
  
  /**
   * Save conversation summary to database
   */
  static async saveSummary(summary: ConversationSummary): Promise<void> {
    try {
      await db.conversationSummary.upsert({
        where: { conversationId: summary.conversationId },
        update: {
          summary: JSON.stringify(summary),
          summarizedAt: summary.lastUpdated
        },
        create: {
          conversationId: summary.conversationId,
          summary: JSON.stringify(summary),
          summarizedAt: summary.createdAt
        }
      });
    } catch (error) {
      console.error('Failed to save conversation summary:', error);
    }
  }

  /**
   * Load conversation summary from database
   */
  static async loadSummary(conversationId: string): Promise<ConversationSummary | null> {
    try {
      const record = await db.conversationSummary.findUnique({
        where: { conversationId }
      });

      if (!record) return null;

      return JSON.parse(record.summary) as ConversationSummary;
    } catch (error) {
      console.error('Failed to load conversation summary:', error);
      return null;
    }
  }

  /**
   * Auto-summarize conversation when it reaches certain thresholds
   */
  static async autoSummarizeIfNeeded(conversationId: string): Promise<ConversationSummary | null> {
    try {
      const messageCount = await db.message.count({
        where: { conversationId }
      });

      // Auto-summarize every 50 messages
      if (messageCount > 0 && messageCount % 50 === 0) {
        const messages = await db.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' }
        });

        const existingSummary = await this.loadSummary(conversationId);
        
        let summary: ConversationSummary;
        if (existingSummary) {
          const newMessages = messages.slice(-50); // Last 50 messages
          summary = await ConversationSummarizer.updateSummary(existingSummary, newMessages);
        } else {
          summary = await ConversationSummarizer.summarizeConversation(conversationId, messages);
        }

        await this.saveSummary(summary);
        return summary;
      }

      return null;
    } catch (error) {
      console.error('Failed to auto-summarize conversation:', error);
      return null;
    }
  }
}
