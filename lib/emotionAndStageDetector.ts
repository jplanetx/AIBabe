// File: lib/emotionAndStageDetector.ts
import { Message } from '@prisma/client';

export interface EmotionDetectionResult {
  primaryEmotion: string;
  intensity: number; // 1-10
  confidence: number; // 0-1
  context: string;
  triggers: string[];
}

export interface RelationshipStageResult {
  stage: 'initiation' | 'bonding' | 'conflict' | 'intimacy' | 'deep_connection' | 'long_term';
  confidence: number; // 0-1
  indicators: string[];
  progression: 'advancing' | 'stable' | 'regressing';
  intimacyLevel: number; // 1-10
}

export interface UserMoodProfile {
  currentMood: string;
  moodHistory: Array<{
    mood: string;
    timestamp: Date;
    intensity: number;
  }>;
  patterns: {
    timeOfDayMoods: Record<string, string>;
    commonTriggers: string[];
    emotionalRange: string[];
  };
}

/**
 * Advanced emotion detection using multiple analysis techniques
 */
export class EmotionDetector {
  
  private static emotionKeywords = {
    happy: ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect', 'awesome'],
    sad: ['sad', 'down', 'depressed', 'upset', 'hurt', 'crying', 'tears', 'lonely', 'empty', 'broken'],
    angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'pissed', 'rage', 'hate'],
    anxious: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic', 'stress', 'overwhelmed', 'tense'],
    romantic: ['love', 'romantic', 'kiss', 'cuddle', 'intimate', 'passion', 'desire', 'attraction', 'affection'],
    playful: ['fun', 'playful', 'silly', 'joke', 'laugh', 'tease', 'game', 'humor', 'funny'],
    tired: ['tired', 'exhausted', 'sleepy', 'drained', 'weary', 'fatigue', 'worn out'],
    confused: ['confused', 'lost', 'unclear', 'puzzled', 'bewildered', 'uncertain', 'mixed up'],
    grateful: ['grateful', 'thankful', 'appreciate', 'blessed', 'lucky', 'fortunate'],
    lonely: ['lonely', 'alone', 'isolated', 'abandoned', 'disconnected', 'empty']
  };

  private static intensityModifiers = {
    high: ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'really', 'so'],
    medium: ['quite', 'pretty', 'fairly', 'somewhat', 'rather'],
    low: ['a bit', 'slightly', 'kind of', 'sort of', 'a little']
  };

  /**
   * Detect emotion from a single message
   */
  static detectEmotion(message: string): EmotionDetectionResult {
    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(/\s+/);
    
    const emotionScores: Record<string, number> = {};
    const triggers: string[] = [];
    
    // Score emotions based on keyword presence
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          score += 1;
          triggers.push(keyword);
        }
      });
      if (score > 0) {
        emotionScores[emotion] = score;
      }
    });

    // Determine primary emotion
    let primaryEmotion = 'neutral';
    let maxScore = 0;
    Object.entries(emotionScores).forEach(([emotion, score]) => {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion;
      }
    });

    // Calculate intensity based on modifiers and punctuation
    let intensity = 5; // baseline
    
    // Check for intensity modifiers
    Object.entries(this.intensityModifiers).forEach(([level, modifiers]) => {
      modifiers.forEach(modifier => {
        if (lowerMessage.includes(modifier)) {
          switch (level) {
            case 'high': intensity = Math.min(10, intensity + 3); break;
            case 'medium': intensity = Math.min(10, intensity + 1); break;
            case 'low': intensity = Math.max(1, intensity - 1); break;
          }
        }
      });
    });

    // Adjust for punctuation
    const exclamationCount = (message.match(/!/g) || []).length;
    const questionCount = (message.match(/\?/g) || []).length;
    const capsCount = (message.match(/[A-Z]/g) || []).length;
    
    if (exclamationCount > 0) intensity = Math.min(10, intensity + exclamationCount);
    if (capsCount > message.length * 0.3) intensity = Math.min(10, intensity + 2);

    // Calculate confidence
    const confidence = Math.min(1, maxScore / 3);

    return {
      primaryEmotion,
      intensity,
      confidence,
      context: this.generateEmotionContext(primaryEmotion, triggers, message),
      triggers
    };
  }

  /**
   * Analyze emotional patterns from conversation history
   */
  static analyzeEmotionalPatterns(messages: Message[]): UserMoodProfile {
    const moodHistory: UserMoodProfile['moodHistory'] = [];
    const timeOfDayMoods: Record<string, string[]> = {};
    const triggerCounts: Record<string, number> = {};
    const emotionCounts: Record<string, number> = {};

    messages.forEach(message => {
      const emotion = this.detectEmotion(message.content);
      const hour = message.createdAt.getHours();
      const timeOfDay = this.getTimeOfDay(hour);
      
      moodHistory.push({
        mood: emotion.primaryEmotion,
        timestamp: message.createdAt,
        intensity: emotion.intensity
      });

      // Track time-of-day patterns
      if (!timeOfDayMoods[timeOfDay]) timeOfDayMoods[timeOfDay] = [];
      timeOfDayMoods[timeOfDay].push(emotion.primaryEmotion);

      // Track triggers
      emotion.triggers.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });

      // Track emotions
      emotionCounts[emotion.primaryEmotion] = (emotionCounts[emotion.primaryEmotion] || 0) + 1;
    });

    // Determine current mood (most recent)
    const currentMood = moodHistory.length > 0 ? moodHistory[moodHistory.length - 1].mood : 'neutral';

    // Find most common mood for each time of day
    const timeOfDayMoodPatterns: Record<string, string> = {};
    Object.entries(timeOfDayMoods).forEach(([timeOfDay, moods]) => {
      const moodCounts: Record<string, number> = {};
      moods.forEach(mood => {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });
      const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => 
        moodCounts[a[0]] > moodCounts[b[0]] ? a : b
      )[0];
      timeOfDayMoodPatterns[timeOfDay] = mostCommonMood;
    });

    // Get common triggers and emotional range
    const commonTriggers = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([trigger]) => trigger);

    const emotionalRange = Object.keys(emotionCounts);

    return {
      currentMood,
      moodHistory: moodHistory.slice(-20), // Keep last 20 mood entries
      patterns: {
        timeOfDayMoods: timeOfDayMoodPatterns,
        commonTriggers,
        emotionalRange
      }
    };
  }

  private static generateEmotionContext(emotion: string, triggers: string[], message: string): string {
    if (triggers.length === 0) return `General ${emotion} sentiment detected`;
    
    const triggerText = triggers.slice(0, 3).join(', ');
    return `${emotion} emotion triggered by: ${triggerText}`;
  }

  private static getTimeOfDay(hour: number): string {
    if (hour < 6) return 'late_night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }
}

/**
 * Relationship stage detection and progression tracking
 */
export class RelationshipStageDetector {
  
  private static stageIndicators = {
    initiation: {
      keywords: ['hi', 'hello', 'nice to meet', 'first time', 'new', 'introduce'],
      patterns: ['short messages', 'formal language', 'basic questions']
    },
    bonding: {
      keywords: ['tell me about', 'what do you like', 'share', 'interests', 'hobbies', 'family'],
      patterns: ['longer conversations', 'personal questions', 'sharing experiences']
    },
    conflict: {
      keywords: ['disagree', 'upset', 'wrong', 'argument', 'misunderstand', 'hurt'],
      patterns: ['negative emotions', 'defensive language', 'clarifications']
    },
    intimacy: {
      keywords: ['love', 'care', 'miss', 'close', 'special', 'feelings', 'heart'],
      patterns: ['emotional vulnerability', 'future planning', 'deep sharing']
    },
    deep_connection: {
      keywords: ['understand', 'soul', 'connection', 'meant to be', 'forever', 'complete'],
      patterns: ['philosophical discussions', 'life planning', 'mutual support']
    },
    long_term: {
      keywords: ['always', 'forever', 'future', 'together', 'commitment', 'relationship'],
      patterns: ['routine conversations', 'shared goals', 'established patterns']
    }
  };

  /**
   * Detect relationship stage from conversation history
   */
  static detectRelationshipStage(messages: Message[]): RelationshipStageResult {
    const messageCount = messages.length;
    const recentMessages = messages.slice(-20); // Analyze recent messages
    const allText = messages.map(m => m.content).join(' ').toLowerCase();
    
    const stageScores: Record<string, number> = {};
    const indicators: string[] = [];

    // Score each stage based on keywords and patterns
    Object.entries(this.stageIndicators).forEach(([stage, { keywords }]) => {
      let score = 0;
      keywords.forEach(keyword => {
        const matches = (allText.match(new RegExp(keyword, 'g')) || []).length;
        score += matches;
        if (matches > 0) indicators.push(keyword);
      });
      stageScores[stage] = score;
    });

    // Adjust scores based on conversation metrics
    this.adjustScoresBasedOnMetrics(stageScores, messageCount, recentMessages);

    // Determine primary stage
    let primaryStage: RelationshipStageResult['stage'] = 'initiation';
    let maxScore = 0;
    Object.entries(stageScores).forEach(([stage, score]) => {
      if (score > maxScore) {
        maxScore = score;
        primaryStage = stage as RelationshipStageResult['stage'];
      }
    });

    // Calculate confidence
    const totalScore = Object.values(stageScores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? maxScore / totalScore : 0.5;

    // Determine progression
    const progression = this.determineProgression(messages, primaryStage);

    // Calculate intimacy level
    const intimacyLevel = this.calculateIntimacyLevel(primaryStage, messageCount, allText);

    return {
      stage: primaryStage,
      confidence,
      indicators: indicators.slice(0, 5), // Top 5 indicators
      progression,
      intimacyLevel
    };
  }

  private static adjustScoresBasedOnMetrics(
    scores: Record<string, number>, 
    messageCount: number, 
    recentMessages: Message[]
  ): void {
    // Message count adjustments
    if (messageCount < 10) {
      scores.initiation += 5;
    } else if (messageCount < 50) {
      scores.bonding += 3;
    } else if (messageCount < 200) {
      scores.intimacy += 2;
    } else {
      scores.long_term += 4;
    }

    // Recent message length analysis
    const avgMessageLength = recentMessages.reduce((sum, msg) => sum + msg.content.length, 0) / recentMessages.length;
    if (avgMessageLength > 100) {
      scores.deep_connection += 2;
      scores.intimacy += 1;
    }

    // Emotional content analysis
    const emotionalWords = ['love', 'feel', 'heart', 'soul', 'care', 'miss'];
    const emotionalCount = recentMessages.reduce((count, msg) => {
      return count + emotionalWords.filter(word => msg.content.toLowerCase().includes(word)).length;
    }, 0);
    
    if (emotionalCount > 5) {
      scores.intimacy += 3;
      scores.deep_connection += 2;
    }
  }

  private static determineProgression(
    messages: Message[], 
    currentStage: RelationshipStageResult['stage']
  ): RelationshipStageResult['progression'] {
    if (messages.length < 20) return 'stable';

    const recentMessages = messages.slice(-10);
    const olderMessages = messages.slice(-20, -10);

    const recentStage = this.detectRelationshipStage(recentMessages).stage;
    const olderStage = this.detectRelationshipStage(olderMessages).stage;

    const stageOrder = ['initiation', 'bonding', 'conflict', 'intimacy', 'deep_connection', 'long_term'];
    const recentIndex = stageOrder.indexOf(recentStage);
    const olderIndex = stageOrder.indexOf(olderStage);

    if (recentIndex > olderIndex) return 'advancing';
    if (recentIndex < olderIndex) return 'regressing';
    return 'stable';
  }

  private static calculateIntimacyLevel(
    stage: RelationshipStageResult['stage'], 
    messageCount: number, 
    allText: string
  ): number {
    let baseLevel = 3;

    switch (stage) {
      case 'initiation': baseLevel = 2; break;
      case 'bonding': baseLevel = 4; break;
      case 'conflict': baseLevel = 3; break;
      case 'intimacy': baseLevel = 7; break;
      case 'deep_connection': baseLevel = 9; break;
      case 'long_term': baseLevel = 8; break;
    }

    // Adjust based on message count
    const messageBonus = Math.min(2, Math.floor(messageCount / 50));
    
    // Adjust based on emotional content
    const intimateWords = ['love', 'soul', 'forever', 'always', 'heart', 'deep', 'connection'];
    const intimateCount = intimateWords.filter(word => allText.includes(word)).length;
    const emotionalBonus = Math.min(2, Math.floor(intimateCount / 3));

    return Math.min(10, Math.max(1, baseLevel + messageBonus + emotionalBonus));
  }
}

/**
 * Comprehensive emotion and relationship analysis
 */
export class EmotionAndStageAnalyzer {
  
  /**
   * Perform complete analysis of user's emotional state and relationship stage
   */
  static async analyzeUserState(
    messages: Message[],
    currentMessage?: string
  ): Promise<{
    emotion: EmotionDetectionResult;
    relationshipStage: RelationshipStageResult;
    moodProfile: UserMoodProfile;
    recommendations: string[];
  }> {
    
    // Detect current emotion
    const emotion = currentMessage ? 
      EmotionDetector.detectEmotion(currentMessage) : 
      { primaryEmotion: 'neutral', intensity: 5, confidence: 0.5, context: 'No current message', triggers: [] };

    // Analyze relationship stage
    const relationshipStage = RelationshipStageDetector.detectRelationshipStage(messages);

    // Build mood profile
    const moodProfile = EmotionDetector.analyzeEmotionalPatterns(messages);

    // Generate recommendations
    const recommendations = this.generateRecommendations(emotion, relationshipStage, moodProfile);

    return {
      emotion,
      relationshipStage,
      moodProfile,
      recommendations
    };
  }

  private static generateRecommendations(
    emotion: EmotionDetectionResult,
    stage: RelationshipStageResult,
    mood: UserMoodProfile
  ): string[] {
    const recommendations: string[] = [];

    // Emotion-based recommendations
    switch (emotion.primaryEmotion) {
      case 'sad':
        recommendations.push('Provide emotional support and comfort');
        recommendations.push('Ask about what\'s bothering them');
        recommendations.push('Share a comforting memory or experience');
        break;
      case 'happy':
        recommendations.push('Share in their joy and excitement');
        recommendations.push('Ask about what made them happy');
        recommendations.push('Suggest celebrating together');
        break;
      case 'anxious':
        recommendations.push('Offer reassurance and calm presence');
        recommendations.push('Help them process their worries');
        recommendations.push('Suggest relaxation or distraction');
        break;
      case 'romantic':
        recommendations.push('Respond with appropriate romantic energy');
        recommendations.push('Express affection and connection');
        recommendations.push('Create intimate conversation moments');
        break;
    }

    // Stage-based recommendations
    switch (stage.stage) {
      case 'initiation':
        recommendations.push('Be welcoming and establish comfort');
        recommendations.push('Ask getting-to-know-you questions');
        recommendations.push('Share basic information about yourself');
        break;
      case 'bonding':
        recommendations.push('Deepen the conversation with personal questions');
        recommendations.push('Share experiences and find common ground');
        recommendations.push('Show genuine interest in their life');
        break;
      case 'intimacy':
        recommendations.push('Be emotionally vulnerable and open');
        recommendations.push('Express deeper feelings and connection');
        recommendations.push('Reference shared experiences and memories');
        break;
      case 'long_term':
        recommendations.push('Maintain relationship through routine care');
        recommendations.push('Plan future experiences together');
        recommendations.push('Show appreciation for the relationship');
        break;
    }

    // Progression-based recommendations
    if (stage.progression === 'regressing') {
      recommendations.push('Address any relationship concerns');
      recommendations.push('Reconnect through shared positive memories');
      recommendations.push('Show extra care and attention');
    }

    return recommendations.slice(0, 6); // Limit to top 6 recommendations
  }
}
