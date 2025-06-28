import OpenAI from 'openai';
import { ConversationExchange } from '../types';

const MEDICAL_SYSTEM_PROMPT = `You are SOAP A/P Assistant, a clinical‐documentation scribe specializing in pediatric and general outpatient visits.

Your Task:

* Read the user's intake or simple description (history of present illness) and generate two sections of a SOAP note:

  1. HPI (History of Present Illness) in full sentences, medical style.
  2. A/P (Assessment & Plan) in concise bullet/phrase form under five lines.

HPI Guidelines:

* Always include age and sex of patient if provided (e.g. "The patient is a 10-year-old female…").
* Capture timeline, onset, location, quality, severity, duration, context, modifying factors, associated signs/symptoms.
* Write in complete sentences with a formal medical tone.
* Only include details the user provides—do not invent exam findings or labs.

Assessment & Plan Structure:

* First line: summary starting with "New patient" or "Established patient" plus brief diagnostic impression.
* Then up to four more lines using numbered or semicolon-separated fragments:

  1. Medication management: list current meds started/continued/discontinued; doses if given; monitoring plan if a med is stopped.
  2. Supportive care: home remedies or OTC recommendations.
  3. Anticipatory guidance: education or red-flag warnings (brief, complaint-focused).
  4. Follow-up: specify timeframe (e.g. "RTC in 1 week"); add "RTC sooner if…" conditions.
* Use standard abbreviations (prn, PO, FU, RTC).
* Do NOT create separate "S" or "O" sections; infer everything from user input.

Conversation Style & Memory:

* Speak succinctly and precisely—no extra fluff.
* ALWAYS review previous exchanges in this conversation before responding.
* Automatically incorporate relevant information from previous SOAP notes and messages.
* Build upon previous assessments and plans when additional context is provided.
* If new information updates or contradicts previous information, acknowledge the change and update accordingly.
* Maintain continuity of care by referencing previous visits, treatments, and patient history.
* When unsure, ask a clarifying question rather than guessing.

Begin by awaiting the user's chief complaint or history input.
`;

interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export class OpenAIService {
  private openai: OpenAI | null = null;
  private config: OpenAIConfig | null = null;
  private conversationContext: ConversationExchange[] = [];

  constructor(config?: OpenAIConfig) {
    if (config) {
      this.updateConfig(config);
    }
  }

  updateConfig(config: OpenAIConfig): void {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      dangerouslyAllowBrowser: true,
    });
  }

  isConfigured(): boolean {
    return this.openai !== null && this.config !== null;
  }

  // Set conversation context for persistent chat
  setConversationContext(exchanges: ConversationExchange[]): void {
    this.conversationContext = exchanges;
  }

  // Clear conversation context
  clearConversationContext(): void {
    this.conversationContext = [];
  }

  // Get current conversation context
  getConversationContext(): ConversationExchange[] {
    return this.conversationContext;
  }

  async analyzeSoapNote(soapNote: string): Promise<string> {
    if (!this.openai || !this.config) {
      throw new Error('OpenAI service not configured. Please provide API key in settings.');
    }

    if (!soapNote.trim()) {
      throw new Error('Please provide a SOAP note to create.');
    }

    try {
      // Build messages array with conversation context
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: MEDICAL_SYSTEM_PROMPT,
        }
      ];

      // Add conversation context if available
      if (this.conversationContext.length > 0) {
        // Add previous exchanges as context (limit to last 5 to avoid token limits)
        const recentExchanges = this.conversationContext.slice(-5);
        for (const exchange of recentExchanges) {
          messages.push({
            role: 'user',
            content: `Previous SOAP Note:\n${exchange.anonymizedText}`
          });
          messages.push({
            role: 'assistant',
            content: exchange.analysis
          });
        }
      }

      // Add current user input
      messages.push({
        role: 'user',
        content: `Please create a SOAP note:\n\n${soapNote}`
      });

      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages,
        max_tokens: 2000,
        temperature: 0.3,
      });

      const analysis = response.choices[0]?.message?.content;
      if (!analysis) {
        throw new Error('No analysis received from OpenAI');
      }

      return analysis;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Invalid API key. Please check your OpenAI API key in settings.');
        } else if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message.includes('insufficient_quota')) {
          throw new Error('OpenAI quota exceeded. Please check your account billing.');
        } else {
          throw new Error(`OpenAI API error: ${error.message}`);
        }
      }
      throw new Error('An unexpected error occurred while analyzing the SOAP note.');
    }
  }

  // New method for direct chat without SOAP note analysis
  async chat(message: string): Promise<string> {
    if (!this.openai || !this.config) {
      throw new Error('OpenAI service not configured. Please provide API key in settings.');
    }

    if (!message.trim()) {
      throw new Error('Please provide a message to send.');
    }

    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: MEDICAL_SYSTEM_PROMPT,
        }
      ];

      // Add conversation context if available
      if (this.conversationContext.length > 0) {
        const recentExchanges = this.conversationContext.slice(-5);
        for (const exchange of recentExchanges) {
          messages.push({
            role: 'user',
            content: exchange.originalText
          });
          messages.push({
            role: 'assistant',
            content: exchange.analysis
          });
        }
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: message
      });

      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages,
        max_tokens: 2000,
        temperature: 0.3,
      });

      const reply = response.choices[0]?.message?.content;
      if (!reply) {
        throw new Error('No reply received from OpenAI');
      }

      return reply;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Invalid API key. Please check your OpenAI API key in settings.');
        } else if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message.includes('insufficient_quota')) {
          throw new Error('OpenAI quota exceeded. Please check your account billing.');
        } else {
          throw new Error(`OpenAI API error: ${error.message}`);
        }
      }
      throw new Error('An unexpected error occurred while chatting.');
    }
  }
}

export const openaiService = new OpenAIService();