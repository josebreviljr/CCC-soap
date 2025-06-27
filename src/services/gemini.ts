import { GoogleGenerativeAI } from '@google/generative-ai';

const MEDICAL_SYSTEM_PROMPT = `You are an expert medical documentation assistant specializing in SOAP note analysis and improvement. Your role is to help physicians create comprehensive, accurate, and well-structured SOAP notes.

Please analyze the provided SOAP note and provide specific, actionable feedback in the following areas:

1. **COMPLETENESS**: Identify missing elements in each section (Subjective, Objective, Assessment, Plan)
2. **CLARITY**: Highlight unclear statements, ambiguous language, or confusing sections
3. **MEDICAL ACCURACY**: Check for proper medical terminology, appropriate abbreviations, and clinical accuracy
4. **STRUCTURE**: Suggest improvements to organization and flow
5. **ACTIONABILITY**: Ensure the Plan section contains specific, measurable actions

Guidelines for your analysis:
- Focus on constructive, specific feedback
- Suggest concrete improvements rather than general comments
- Prioritize patient safety and clinical accuracy
- Maintain professional medical language
- Consider billing and documentation requirements
- Highlight potential liability issues

Format your response with clear sections for each type of feedback. If the note is well-written, acknowledge its strengths while still providing enhancement suggestions.

Remember: This content has been automatically anonymized to protect patient privacy before analysis.`;

interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private config: GeminiConfig | null = null;

  constructor(config?: GeminiConfig) {
    if (config) {
      this.updateConfig(config);
    }
  }

  updateConfig(config: GeminiConfig): void {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  isConfigured(): boolean {
    return this.genAI !== null && this.config !== null;
  }

  async analyzeSoapNote(soapNote: string): Promise<string> {
    if (!this.genAI || !this.config) {
      throw new Error('Gemini service not configured. Please provide API key in settings.');
    }

    if (!soapNote.trim()) {
      throw new Error('Please provide a SOAP note to analyze.');
    }

    try {
      const model = this.genAI.getGenerativeModel({ 
        model: this.config.model || 'gemini-1.5-pro',
        systemInstruction: MEDICAL_SYSTEM_PROMPT,
      });

      const prompt = `Please analyze this SOAP note and provide detailed feedback:\n\n${soapNote}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.3,
        },
      });

      const response = await result.response;
      const analysis = response.text();

      if (!analysis) {
        throw new Error('No analysis received from Gemini');
      }

      return analysis;
    } catch (error: any) {
      if (error?.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid API key. Please check your Google AI API key in settings.');
      } else if (error?.message?.includes('QUOTA_EXCEEDED')) {
        throw new Error('Gemini quota exceeded. Please check your account billing.');
      } else if (error?.message?.includes('RATE_LIMIT_EXCEEDED')) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error?.message?.includes('SAFETY')) {
        throw new Error('Content was blocked by safety filters. Please review your SOAP note content.');
      } else {
        console.error('Gemini API error:', error);
        throw new Error(`Gemini API error: ${error?.message || 'An unexpected error occurred'}`);
      }
    }
  }
}

export const geminiService = new GeminiService();