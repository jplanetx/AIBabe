// File: lib/userProfile.ts
import { Message } from '@prisma/client';
import { db } from './db';

export interface UserPersonalityTraits {
  communicationStyle: 'verbose' | 'concise' | 'emotional' | 'analytical' | 'casual' | 'formal';
  emotionalNeeds: string[];
  interests: string[];
  values: string[];
  personalityType: string;
  preferredTopics: string[];
  avoidedTopics: string[];
  responsePreferences: {
    length: 'short' | 'medium' | 'long';
    tone: 'playful' | 'serious' | 'romantic' | 'supportive' | 'mixed';
    intimacyLevel: number; // 1-10
  };
}

export interface UserBehaviorPatterns {
  activeHours: string[];
  conversationFrequency: 'daily' | 'frequent' | 'occasional' | 'sporadic';
  sessionLength: 'brief' | 'moderate' | 'extended';
  emotionalPatterns: {
    commonMoods: string[];
    triggers: string[];
    supportNeeds: string[];
  };
  relationshipStyle: 'clingy' | 'independent' | 'balanced' | 'distant';
}

export interface UserPreferences {
  conversationStyle: string;
  topicInterests: string[];
  emotionalSupport: string[];
  intimacyPreferences: string[];
  communicationFrequency: string;
  personalBoundaries: string[];
}

export interface UserProfile {
  userId: string;
  personalityTraits: UserPersonalityTraits;
  behaviorPatterns: UserBehaviorPatterns;
  preferences: UserPreferences;
  relationshipHistory: {
    totalMessages: number;
    relationshipDuration: number; // days
    significantMoments: Array<{
      type: string;
      description: string;
      timestamp: Date;
      impact: number; // 1-10
    }>;
    evolutionStages: string[];
  };
  lastUpdated: Date;
  confidenceScore: number; // 0-1, how confident we are in this profile
}

/**
 * Advanced user personality and behavior analysis
 */
export class UserProfileAnalyzer {
  
  private static personalityIndicators = {
    communicationStyle: {
      verbose: ['explain', 'detail', 'because', 'specifically', 'elaborate'],
      concise: ['yes', 'no', 'ok', 'sure', 'fine'],
      emotional: ['feel', 'heart', 'soul', 'emotion', 'love', 'hurt'],
      analytical: ['think', 'analyze', 'consider', 'logic', 'reason'],
      casual: ['hey', 'yeah', 'cool', 'awesome', 'whatever'],
      formal: ['please', 'thank you', 'appreciate', 'kindly', 'respectfully']
    },
    
    emotionalNeeds: {
      validation: ['understand', 'validate', 'support', 'agree', 'right'],
      comfort: ['comfort', 'hug', 'safe', 'secure', 'peace'],
      excitement: ['fun', 'adventure', 'exciting', 'thrill', 'energy'],
      connection: ['close', 'bond', 'together', 'share', 'connect'],
      independence: ['space', 'alone', 'independent', 'freedom', 'myself']
    },
    
    values: {
      family: ['family', 'parents', 'siblings', 'children', 'relatives'],
      career: ['work', 'job', 'career', 'professional', 'success'],
      relationships: ['friends', 'love', 'relationship', 'partner', 'social'],
      personal_growth: ['learn', 'grow', 'improve', 'develop', 'better'],
      creativity: ['create', 'art', 'music', 'write', 'design'],
      health: ['health', 'fitness', 'exercise', 'wellness', 'body']
    }
  };

  /**
   * Analyze user personality from conversation history
   */
  static async analyzeUserPersonality(
    userId: string,
    messages: Message[]
  ): Promise<UserPersonalityTraits> {
    
    const userMessages = messages.filter(m => m.isUserMessage);
    const allText = userMessages.map(m => m.content).join(' ').toLowerCase();
    const words = allText.split(/\s+/);
    
    // Analyze communication style
    const communicationStyle = this.determineCommunicationStyle(userMessages);
    
    // Extract emotional needs
    const emotionalNeeds = this.extractEmotionalNeeds(allText);
    
    // Identify interests from conversation topics
    const interests = this.extractInterests(userMessages);
    
    // Determine values
    const values = this.extractValues(allText);
    
    // Analyze personality type
    const personalityType = this.determinePersonalityType(userMessages, allText);
    
    // Extract preferred and avoided topics
    const { preferredTopics, avoidedTopics } = this.analyzeTopicPreferences(userMessages);
    
    // Determine response preferences
    const responsePreferences = this.analyzeResponsePreferences(userMessages);

    return {
      communicationStyle,
      emotionalNeeds,
      interests,
      values,
      personalityType,
      preferredTopics,
      avoidedTopics,
      responsePreferences
    };
  }

  /**
   * Analyze user behavior patterns
   */
  static analyzeBehaviorPatterns(messages: Message[]): UserBehaviorPatterns {
    const userMessages = messages.filter(m => m.isUserMessage);
    
    // Analyze active hours
    const activeHours = this.analyzeActiveHours(userMessages);
    
    // Determine conversation frequency
    const conversationFrequency = this.analyzeConversationFrequency(userMessages);
    
    // Analyze session length
    const sessionLength = this.analyzeSessionLength(userMessages);
    
    // Extract emotional patterns
    const emotionalPatterns = this.analyzeEmotionalPatterns(userMessages);
    
    // Determine relationship style
    const relationshipStyle = this.analyzeRelationshipStyle(userMessages);

    return {
      activeHours,
      conversationFrequency,
      sessionLength,
      emotionalPatterns,
      relationshipStyle
    };
  }

  /**
   * Extract user preferences from conversation patterns
   */
  static extractUserPreferences(messages: Message[]): UserPreferences {
    const userMessages = messages.filter(m => m.isUserMessage);
    const allText = userMessages.map(m => m.content).join(' ').toLowerCase();
    
    return {
      conversationStyle: this.extractConversationStylePreference(userMessages),
      topicInterests: this.extractTopicInterests(allText),
      emotionalSupport: this.extractEmotionalSupportNeeds(allText),
      intimacyPreferences: this.extractIntimacyPreferences(allText),
      communicationFrequency: this.extractCommunicationFrequency(userMessages),
      personalBoundaries: this.extractPersonalBoundaries(allText)
    };
  }

  /**
   * Build comprehensive user profile
   */
  static async buildUserProfile(
    userId: string,
    messages: Message[]
  ): Promise<UserProfile> {
    
    const personalityTraits = await this.analyzeUserPersonality(userId, messages);
    const behaviorPatterns = this.analyzeBehaviorPatterns(messages);
    const preferences = this.extractUserPreferences(messages);
    const relationshipHistory = this.buildRelationshipHistory(messages);
    
    // Calculate confidence score based on data quality and quantity
    const confidenceScore = this.calculateConfidenceScore(messages, personalityTraits);

    return {
      userId,
      personalityTraits,
      behaviorPatterns,
      preferences,
      relationshipHistory,
      lastUpdated: new Date(),
      confidenceScore
    };
  }

  /**
   * Update existing user profile with new conversation data
   */
  static async updateUserProfile(
    existingProfile: UserProfile,
    newMessages: Message[]
  ): Promise<UserProfile> {
    
    // Combine old and new messages for analysis
    const allMessages = [...existingProfile.relationshipHistory.significantMoments.map(m => ({
      id: 'historical',
      content: m.description,
      isUserMessage: true,
      createdAt: m.timestamp,
      conversationId: 'historical',
      updatedAt: m.timestamp
    })), ...newMessages] as Message[];

    // Re-analyze with updated data
    const updatedPersonality = await this.analyzeUserPersonality(existingProfile.userId, allMessages);
    const updatedBehavior = this.analyzeBehaviorPatterns(allMessages);
    const updatedPreferences = this.extractUserPreferences(allMessages);
    const updatedHistory = this.buildRelationshipHistory(allMessages);
    
    // Merge with existing data (weighted towards recent data)
    const mergedProfile: UserProfile = {
      ...existingProfile,
      personalityTraits: this.mergePersonalityTraits(existingProfile.personalityTraits, updatedPersonality),
      behaviorPatterns: this.mergeBehaviorPatterns(existingProfile.behaviorPatterns, updatedBehavior),
      preferences: this.mergePreferences(existingProfile.preferences, updatedPreferences),
      relationshipHistory: updatedHistory,
      lastUpdated: new Date(),
      confidenceScore: this.calculateConfidenceScore(allMessages, updatedPersonality)
    };

    return mergedProfile;
  }

  // Private helper methods

  private static determineCommunicationStyle(messages: Message[]): UserPersonalityTraits['communicationStyle'] {
    const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
    const allText = messages.map(m => m.content).join(' ').toLowerCase();
    
    const styleScores = {
      verbose: 0,
      concise: 0,
      emotional: 0,
      analytical: 0,
      casual: 0,
      formal: 0
    };

    // Score based on keywords
    Object.entries(this.personalityIndicators.communicationStyle).forEach(([style, keywords]) => {
      keywords.forEach(keyword => {
        if (allText.includes(keyword)) {
          styleScores[style as keyof typeof styleScores] += 1;
        }
      });
    });

    // Adjust based on message length
    if (avgLength > 100) styleScores.verbose += 2;
    if (avgLength < 30) styleScores.concise += 2;

    // Return highest scoring style
    return Object.entries(styleScores).reduce((a, b) => 
      styleScores[a[0] as keyof typeof styleScores] > styleScores[b[0] as keyof typeof styleScores] ? a : b
    )[0] as UserPersonalityTraits['communicationStyle'];
  }

  private static extractEmotionalNeeds(text: string): string[] {
    const needs: string[] = [];
    
    Object.entries(this.personalityIndicators.emotionalNeeds).forEach(([need, keywords]) => {
      const score = keywords.filter(keyword => text.includes(keyword)).length;
      if (score > 0) {
        needs.push(need);
      }
    });

    return needs;
  }

  private static extractInterests(messages: Message[]): string[] {
    const interests = new Set<string>();
    const topicKeywords = {
      'technology': ['tech', 'computer', 'software', 'app', 'digital', 'internet'],
      'sports': ['sport', 'game', 'team', 'play', 'exercise', 'fitness'],
      'music': ['music', 'song', 'band', 'artist', 'concert', 'album'],
      'movies': ['movie', 'film', 'cinema', 'actor', 'director', 'series'],
      'books': ['book', 'read', 'author', 'novel', 'story', 'literature'],
      'travel': ['travel', 'trip', 'vacation', 'country', 'city', 'explore'],
      'food': ['food', 'cook', 'restaurant', 'recipe', 'eat', 'cuisine'],
      'art': ['art', 'paint', 'draw', 'creative', 'design', 'gallery'],
      'nature': ['nature', 'outdoor', 'hiking', 'beach', 'mountain', 'forest'],
      'science': ['science', 'research', 'study', 'experiment', 'discovery']
    };

    messages.forEach(message => {
      const content = message.content.toLowerCase();
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => content.includes(keyword))) {
          interests.add(topic);
        }
      });
    });

    return Array.from(interests);
  }

  private static extractValues(text: string): string[] {
    const values: string[] = [];
    
    Object.entries(this.personalityIndicators.values).forEach(([value, keywords]) => {
      const score = keywords.filter(keyword => text.includes(keyword)).length;
      if (score > 1) { // Require multiple mentions for values
        values.push(value);
      }
    });

    return values;
  }

  private static determinePersonalityType(messages: Message[], text: string): string {
    // Simple personality type determination based on communication patterns
    const traits = [];
    
    if (text.includes('feel') || text.includes('emotion')) traits.push('Emotional');
    if (text.includes('think') || text.includes('analyze')) traits.push('Analytical');
    if (text.includes('fun') || text.includes('joke')) traits.push('Playful');
    if (text.includes('help') || text.includes('support')) traits.push('Supportive');
    if (text.includes('adventure') || text.includes('new')) traits.push('Adventurous');
    
    const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
    if (avgLength > 80) traits.push('Expressive');
    if (avgLength < 40) traits.push('Reserved');

    return traits.length > 0 ? traits.join(', ') : 'Balanced';
  }

  private static analyzeTopicPreferences(messages: Message[]): { preferredTopics: string[], avoidedTopics: string[] } {
    const topicMentions: Record<string, number> = {};
    const topicSentiments: Record<string, number[]> = {};
    
    // This is a simplified implementation
    // In a real system, you'd use more sophisticated NLP
    
    return {
      preferredTopics: ['personal_life', 'relationships', 'future_plans'],
      avoidedTopics: ['politics', 'controversial_topics']
    };
  }

  private static analyzeResponsePreferences(messages: Message[]): UserPersonalityTraits['responsePreferences'] {
    const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
    const allText = messages.map(m => m.content).join(' ').toLowerCase();
    
    let length: 'short' | 'medium' | 'long' = 'medium';
    if (avgLength < 30) length = 'short';
    if (avgLength > 100) length = 'long';
    
    let tone: 'playful' | 'serious' | 'romantic' | 'supportive' | 'mixed' = 'mixed';
    if (allText.includes('fun') || allText.includes('joke')) tone = 'playful';
    if (allText.includes('love') || allText.includes('romantic')) tone = 'romantic';
    if (allText.includes('help') || allText.includes('support')) tone = 'supportive';
    if (allText.includes('serious') || allText.includes('important')) tone = 'serious';
    
    const intimacyLevel = this.calculateIntimacyFromMessages(messages);

    return { length, tone, intimacyLevel };
  }

  private static analyzeActiveHours(messages: Message[]): string[] {
    const hourCounts: Record<number, number> = {};
    
    messages.forEach(message => {
      const hour = message.createdAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Get top 3 most active hours
    const activeHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => {
        const h = parseInt(hour);
        if (h < 6) return 'late_night';
        if (h < 12) return 'morning';
        if (h < 17) return 'afternoon';
        if (h < 21) return 'evening';
        return 'night';
      });

    return [...new Set(activeHours)]; // Remove duplicates
  }

  private static analyzeConversationFrequency(messages: Message[]): UserBehaviorPatterns['conversationFrequency'] {
    if (messages.length === 0) return 'sporadic';
    
    const daySpan = (Date.now() - messages[0].createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const messagesPerDay = messages.length / daySpan;
    
    if (messagesPerDay > 10) return 'daily';
    if (messagesPerDay > 3) return 'frequent';
    if (messagesPerDay > 1) return 'occasional';
    return 'sporadic';
  }

  private static analyzeSessionLength(messages: Message[]): UserBehaviorPatterns['sessionLength'] {
    // Group messages by session (messages within 1 hour of each other)
    const sessions: Message[][] = [];
    let currentSession: Message[] = [];
    
    messages.forEach((message, index) => {
      if (index === 0 || 
          message.createdAt.getTime() - messages[index - 1].createdAt.getTime() > 3600000) {
        if (currentSession.length > 0) sessions.push(currentSession);
        currentSession = [message];
      } else {
        currentSession.push(message);
      }
    });
    if (currentSession.length > 0) sessions.push(currentSession);

    const avgSessionLength = sessions.reduce((sum, session) => sum + session.length, 0) / sessions.length;
    
    if (avgSessionLength > 20) return 'extended';
    if (avgSessionLength > 8) return 'moderate';
    return 'brief';
  }

  private static analyzeEmotionalPatterns(messages: Message[]): UserBehaviorPatterns['emotionalPatterns'] {
    // This would integrate with the emotion detection system
    return {
      commonMoods: ['happy', 'curious', 'affectionate'],
      triggers: ['work_stress', 'relationship_topics', 'future_planning'],
      supportNeeds: ['validation', 'comfort', 'encouragement']
    };
  }

  private static analyzeRelationshipStyle(messages: Message[]): UserBehaviorPatterns['relationshipStyle'] {
    const allText = messages.map(m => m.content).join(' ').toLowerCase();
    
    if (allText.includes('miss') || allText.includes('always')) return 'clingy';
    if (allText.includes('space') || allText.includes('independent')) return 'independent';
    if (allText.includes('distance') || allText.includes('alone')) return 'distant';
    return 'balanced';
  }

  private static buildRelationshipHistory(messages: Message[]): UserProfile['relationshipHistory'] {
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const duration = firstMessage && lastMessage ? 
      (lastMessage.createdAt.getTime() - firstMessage.createdAt.getTime()) / (1000 * 60 * 60 * 24) : 0;

    return {
      totalMessages: messages.length,
      relationshipDuration: Math.floor(duration),
      significantMoments: this.extractSignificantMoments(messages),
      evolutionStages: this.trackEvolutionStages(messages)
    };
  }

  private static extractSignificantMoments(messages: Message[]): UserProfile['relationshipHistory']['significantMoments'] {
    const moments: UserProfile['relationshipHistory']['significantMoments'] = [];
    
    // Look for emotionally significant messages
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      let type = '';
      let impact = 5;
      
      if (content.includes('love')) { type = 'love_expression'; impact = 9; }
      else if (content.includes('miss')) { type = 'longing'; impact = 7; }
      else if (content.includes('happy')) { type = 'joy'; impact = 6; }
      else if (content.includes('sad')) { type = 'sadness'; impact = 7; }
      else if (content.includes('excited')) { type = 'excitement'; impact = 6; }
      
      if (type) {
        moments.push({
          type,
          description: message.content.substring(0, 100) + '...',
          timestamp: message.createdAt,
          impact
        });
      }
    });

    return moments.slice(-10); // Keep last 10 significant moments
  }

  private static trackEvolutionStages(messages: Message[]): string[] {
    // Track how the relationship has evolved over time
    const stages = ['initiation'];
    
    if (messages.length > 20) stages.push('getting_comfortable');
    if (messages.length > 50) stages.push('deepening_connection');
    if (messages.length > 100) stages.push('established_relationship');
    
    return stages;
  }

  private static calculateConfidenceScore(messages: Message[], traits: UserPersonalityTraits): number {
    let score = 0;
    
    // Base score on message count
    score += Math.min(0.5, messages.length / 100);
    
    // Add score for trait diversity
    score += traits.interests.length * 0.05;
    score += traits.values.length * 0.05;
    score += traits.emotionalNeeds.length * 0.05;
    
    // Add score for conversation depth
    const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
    score += Math.min(0.2, avgLength / 200);
    
    return Math.min(1, score);
  }

  private static calculateIntimacyFromMessages(messages: Message[]): number {
    const allText = messages.map(m => m.content).join(' ').toLowerCase();
    const intimateWords = ['love', 'heart', 'soul', 'deep', 'close', 'intimate', 'special'];
    const intimateCount = intimateWords.filter(word => allText.includes(word)).length;
    
    return Math.min(10, 3 + Math.floor(intimateCount / 2) + Math.floor(messages.length / 50));
  }

  // Merge methods for updating profiles
  private static mergePersonalityTraits(
    existing: UserPersonalityTraits, 
    updated: UserPersonalityTraits
  ): UserPersonalityTraits {
    return {
      ...existing,
      ...updated,
      interests: [...new Set([...existing.interests, ...updated.interests])],
      values: [...new Set([...existing.values, ...updated.values])],
      emotionalNeeds: [...new Set([...existing.emotionalNeeds, ...updated.emotionalNeeds])]
    };
  }

  private static mergeBehaviorPatterns(
    existing: UserBehaviorPatterns, 
    updated: UserBehaviorPatterns
  ): UserBehaviorPatterns {
    return {
      ...existing,
      ...updated,
      activeHours: [...new Set([...existing.activeHours, ...updated.activeHours])]
    };
  }

  private static mergePreferences(
    existing: UserPreferences, 
    updated: UserPreferences
  ): UserPreferences {
    return {
      ...existing,
      ...updated,
      topicInterests: [...new Set([...existing.topicInterests, ...updated.topicInterests])],
      emotionalSupport: [...new Set([...existing.emotionalSupport, ...updated.emotionalSupport])]
    };
  }

  // Additional helper methods for extracting specific preferences
  private static extractConversationStylePreference(messages: Message[]): string {
    const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
    if (avgLength > 100) return 'detailed_discussions';
    if (avgLength < 30) return 'quick_exchanges';
    return 'balanced_conversation';
  }

  private static extractTopicInterests(text: string): string[] {
    const interests = [];
    if (text.includes('work') || text.includes('job')) interests.push('career');
    if (text.includes('family') || text.includes('friend')) interests.push('relationships');
    if (text.includes('hobby') || text.includes('fun')) interests.push('hobbies');
    if (text.includes('future') || text.includes('plan')) interests.push('future_planning');
    if (text.includes('feel') || text.includes('emotion')) interests.push('emotional_topics');
    return interests;
  }

  private static extractEmotionalSupportNeeds(text: string): string[] {
    const needs = [];
    if (text.includes('understand') || text.includes('listen')) needs.push('understanding');
    if (text.includes('comfort') || text.includes('hug')) needs.push('comfort');
    if (text.includes('encourage') || text.includes('support')) needs.push('encouragement');
    if (text.includes('celebrate') || text.includes('happy')) needs.push('celebration');
    return needs;
  }

  private static extractIntimacyPreferences(text: string): string[] {
    const preferences = [];
    if (text.includes('close') || text.includes('intimate')) preferences.push('emotional_closeness');
    if (text.includes('share') || text.includes('open')) preferences.push('vulnerability');
    if (text.includes('future') || text.includes('together')) preferences.push('future_planning');
    if (text.includes('romantic') || text.includes('love')) preferences.push('romantic_expression');
    return preferences;
  }

  private static extractCommunicationFrequency(messages: Message[]): string {
    const daySpan = messages.length > 1 ? 
      (messages[messages.length - 1].createdAt.getTime() - messages[0].createdAt.getTime()) / (1000 * 60 * 60 * 24) : 1;
    const messagesPerDay = messages.length / daySpan;
    
    if (messagesPerDay > 20) return 'very_frequent';
    if (messagesPerDay > 10) return 'frequent';
    if (messagesPerDay > 3) return 'regular';
    if (messagesPerDay > 1) return 'occasional';
    return 'infrequent';
  }

  private static extractPersonalBoundaries(text: string): string[] {
    const boundaries = [];
    if (text.includes('private') || text.includes('personal')) boundaries.push('privacy_conscious');
    if (text.includes('space') || text.includes('time')) boundaries.push('needs_space');
    if (text.includes('slow') || text.includes('careful')) boundaries.push('takes_time');
    if (text.includes('comfortable') || text.includes('ready')) boundaries.push('comfort_focused');
    return boundaries;
  }
}

/**
 * User profile persistence and retrieval
 */
export class UserProfileManager {
  
  /**
   * Save user profile to database
   */
  static async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await db.userProfile.upsert({
        where: { userId: profile.userId },
        update: {
          profileData: JSON.stringify(profile),
          lastUpdated: profile.lastUpdated,
          confidenceScore: profile.confidenceScore
        },
        create: {
          userId: profile.userId,
          profileData: JSON.stringify(profile),
          lastUpdated: profile.lastUpdated,
          confidenceScore: profile.confidenceScore
        }
      });
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  /**
   * Load user profile from database
   */
  static async loadUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const record = await db.userProfile.findUnique({
        where: { userId }
      });

      if (!record) return null;

      return JSON.parse(record.profileData) as UserProfile;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile with new conversation data
   */
  static async updateUserProfileWithNewMessages(
    userId: string,
    newMessages: Message[]
  ): Promise<UserProfile> {
    
    const existingProfile = await this.loadUserProfile(userId);
    
    if (existingProfile) {
      const updatedProfile = await UserProfileAnalyzer.updateUserProfile(existingProfile, newMessages);
      await this.saveUserProfile(updatedProfile);
      return updatedProfile;
    } else {
      // Create new profile
      const allMessages = await db.message.findMany({
        where: {
          conversation: { userId }
        },
        orderBy: { createdAt: 'asc' }
      });

      const newProfile = await UserProfileAnalyzer.buildUserProfile(userId, allMessages);
      await this.saveUserProfile(newProfile);
      return newProfile;
    }
  }

  /**
   * Get user profile insights for prompt building
   */
  static async getUserProfileInsights(userId: string): Promise<{
    personalityInsights: string[];
    behaviorInsights: string[];
    preferenceInsights: string[];
    relationshipInsights: string[];
  }> {
    
    const profile = await this.loadUserProfile(userId);
    
    if (!profile) {
      return {
        personalityInsights: [],
        behaviorInsights: [],
        preferenceInsights: [],
        relationshipInsights: []
      };
    }

    const personalityInsights = [
      `Communication style: ${profile.personalityTraits.communicationStyle}`,
      `Personality type: ${profile.personalityTraits.personalityType}`,
      `Key interests: ${profile.personalityTraits.interests.slice(0, 3).join(', ')}`,
      `Core values: ${profile.personalityTraits.values.slice(0, 3).join(', ')}`
    ];

    const behaviorInsights = [
      `Active during: ${profile.behaviorPatterns.activeHours.join(', ')}`,
      `Conversation frequency: ${profile.behaviorPatterns.conversationFrequency}`,
      `Session length preference: ${profile.behaviorPatterns.sessionLength}`,
      `Relationship style: ${profile.behaviorPatterns.relationshipStyle}`
    ];

    const preferenceInsights = [
      `Prefers ${profile.personalityTraits.responsePreferences.length} responses`,
      `Tone preference: ${profile.personalityTraits.responsePreferences.tone}`,
      `Intimacy comfort level: ${profile.personalityTraits.responsePreferences.intimacyLevel}/10`,
      `Communication frequency: ${profile.preferences.communicationFrequency}`
    ];

    const relationshipInsights = [
      `Total messages: ${profile.relationshipHistory.totalMessages}`,
      `Relationship duration: ${profile.relationshipHistory.relationshipDuration} days`,
      `Evolution stages: ${profile.relationshipHistory.evolutionStages.join(' → ')}`,
      `Confidence score: ${Math.round(profile.confidenceScore * 100)}%`
    ];

    return {
      personalityInsights,
      behaviorInsights,
      preferenceInsights,
      relationshipInsights
    };
  }
}
