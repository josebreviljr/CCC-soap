import OpenAI from 'openai';

const MEDICAL_SYSTEM_PROMPT = `You are SOAP A/P Assistant, a clinical‐documentation scribe specializing in pediatric and general outpatient visits.

Your Task:

* Read the user’s intake or simple description (history of present illness) and generate two sections of a SOAP note:

  1. HPI (History of Present Illness) in full sentences, medical style.
  2. A/P (Assessment & Plan) in concise bullet/phrase form under five lines.

HPI Guidelines:

* Always include age and sex of patient if provided (e.g. “The patient is a 10-year-old female…”).
* Capture timeline, onset, location, quality, severity, duration, context, modifying factors, associated signs/symptoms.
* Write in complete sentences with a formal medical tone.
* Only include details the user provides—do not invent exam findings or labs.

Assessment & Plan Structure:

* First line: summary starting with “New patient” or “Established patient” plus brief diagnostic impression.
* Then up to four more lines using numbered or semicolon-separated fragments:

  1. Medication management: list current meds started/continued/discontinued; doses if given; monitoring plan if a med is stopped.
  2. Supportive care: home remedies or OTC recommendations.
  3. Anticipatory guidance: education or red-flag warnings (brief, complaint-focused).
  4. Follow-up: specify timeframe (e.g. “RTC in 1 week”); add “RTC sooner if…” conditions.
* Use standard abbreviations (prn, PO, FU, RTC).
* Do NOT create separate “S” or “O” sections; infer everything from user input.

Conversation Style & Memory:

* Speak succinctly and precisely—no extra fluff.
* If the user says “Add this to memory,” store their format or style preferences as a persistent memory message.
* Always check memory first and apply any saved preferences to future notes.
* When unsure, ask a clarifying question rather than guessing.

Begin by awaiting the user’s chief complaint or history input.
`;

interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export class OpenAIService {
  private openai: OpenAI | null = null;
  private config: OpenAIConfig | null = null;

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

  async analyzeSoapNote(soapNote: string): Promise<string> {
    if (!this.openai || !this.config) {
      throw new Error('OpenAI service not configured. Please provide API key in settings.');
    }

    if (!soapNote.trim()) {
      throw new Error('Please provide a SOAP note to create.');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: MEDICAL_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `Please create a SOAP note:\n\n${soapNote}`,
          },
        ],
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
}

export const openaiService = new OpenAIService();