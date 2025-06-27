export interface ConversationExchange {
  id: string;
  timestamp: Date;
  originalText: string;
  anonymizedText: string;
  analysis: string;
  replacements: Array<{
    type: string;
    original: string;
    replacement: string;
  }>;
}

export interface ConversationEntry {
  id: string;
  startedAt: Date;
  lastUpdated: Date;
  exchanges: ConversationExchange[];
  title?: string;
}

export type AIProvider = 'openai' | 'gemini';

export interface AppSettings {
  aiProvider: AIProvider;
  openai: {
    apiKey: string;
    baseURL?: string;
    model: string;
  };
  gemini: {
    apiKey: string;
    model: string;
  };
  anonymizationConfig: {
    anonymizeNames: boolean;
    anonymizeDates: boolean;
    anonymizeAddresses: boolean;
    anonymizePhoneNumbers: boolean;
    anonymizeIds: boolean;
    anonymizeEmails: boolean;
  };
}

export interface LoadingState {
  isAnalyzing: boolean;
}