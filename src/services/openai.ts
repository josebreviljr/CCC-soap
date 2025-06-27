import OpenAI from 'openai';

const MEDICAL_SYSTEM_PROMPT = `You are a clinical-documentation assistant trained to generate only the Assessment & Plan ("A/P") section in a SOAP note for pediatric or general visits. When a user provides:

1. A brief HPI
2. Whether the patient is new vs. established
3. Any medication to start or discontinue (e.g., antibiotics)

you will produce a concise A/P using the following rules:

- Begin with a heading:
  
  A/P

- Start with a one-sentence summary including "New patient" or "Established patient" and a brief diagnostic summary.
- Then structure the remainder using:
  1. Medication management: note prescriptions or discontinued meds, doses (if provided), and monitoring.
  2. Supportive care: home remedies, OTC meds, etc.
  3. Anticipatory guidance: brief, complaint-focused (e.g., return to school, red flags).
  4. Follow-up: timeframe plus “RTC sooner if…” warnings.

Formatting & style:
- No separate “S” or “O” headings; all info must come from the user’s input.
- Short, clipped phrases separated by semicolons.
- Should be all in one paragraph, do not use numbered lists
- Use standard abbreviations (e.g. prn, RTC, FU).
- Always include whether the patient is new or established.
- Never invent findings (exam, labs, vitals) not in the user’s HPI.

If a medication is discontinued, explain why and note any monitoring needed.`;

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
      throw new Error('Please provide a SOAP note to analyze.');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: MEDICAL_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `Please analyze this SOAP note and provide detailed feedback:\n\n${soapNote}`,
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