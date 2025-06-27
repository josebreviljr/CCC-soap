import React, { useState, useEffect } from 'react';
import { Stethoscope, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { SoapNoteInput } from './components/SoapNoteInput';
import { ConversationHistory } from './components/ConversationHistory';
import { SettingsPanel } from './components/SettingsPanel';
import { anonymizeText, DEFAULT_ANONYMIZATION_CONFIG } from './utils/anonymization';
import { openaiService } from './services/openai';
import { geminiService } from './services/gemini';
import { exportConversations, exportAsText } from './utils/export';
import { ConversationEntry, ConversationExchange, AppSettings, LoadingState } from './types';

const getDefaultSettings = (): AppSettings => ({
  aiProvider: 'openai' as const,
  openai: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    model: 'gpt-4o-mini',
  },
  gemini: {
    apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
    model: 'gemini-1.5-pro',
  },
  anonymizationConfig: DEFAULT_ANONYMIZATION_CONFIG,
});

function App() {
  const [currentConversation, setCurrentConversation] = useState<ConversationEntry | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getDefaultSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState<LoadingState>({
    isAnalyzing: false,
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const savedSettings = localStorage.getItem('soap-refiner-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const defaultSettings = getDefaultSettings();
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }

    const savedConversations = localStorage.getItem('soap-refiner-conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        // Handle both old and new conversation formats
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed[0].exchanges) {
            // New format
            const conversations = parsed.map((conv: any) => ({
              ...conv,
              startedAt: new Date(conv.startedAt),
              lastUpdated: new Date(conv.lastUpdated),
              exchanges: conv.exchanges.map((ex: any) => ({
                ...ex,
                timestamp: new Date(ex.timestamp)
              }))
            }));
            setConversationHistory(conversations);
          } else {
            // Old format - migrate to new structure
            const migratedConversation: ConversationEntry = {
              id: 'migrated-' + Date.now(),
              startedAt: new Date(parsed[0].timestamp || Date.now()),
              lastUpdated: new Date(parsed[parsed.length - 1]?.timestamp || Date.now()),
              exchanges: parsed.map((conv: any) => ({
                ...conv,
                timestamp: new Date(conv.timestamp)
              })),
              title: 'Migrated Conversation'
            };
            setConversationHistory([migratedConversation]);
          }
        }
      } catch (e) {
        console.error('Failed to parse saved conversations:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('soap-refiner-settings', JSON.stringify(settings));
    
    // Configure OpenAI service with fallback to environment variables
    const openaiApiKey = settings.openai.apiKey || process.env.REACT_APP_OPENAI_API_KEY;
    if (openaiApiKey) {
      openaiService.updateConfig({
        apiKey: openaiApiKey,
        baseURL: settings.openai.baseURL,
        model: settings.openai.model,
      });
    }
    
    // Configure Gemini service with fallback to environment variables
    const geminiApiKey = settings.gemini.apiKey || process.env.REACT_APP_GEMINI_API_KEY;
    if (geminiApiKey) {
      geminiService.updateConfig({
        apiKey: geminiApiKey,
        model: settings.gemini.model,
      });
    }
  }, [settings]);

  useEffect(() => {
    const allConversations = currentConversation 
      ? [currentConversation, ...conversationHistory]
      : conversationHistory;
    localStorage.setItem('soap-refiner-conversations', JSON.stringify(allConversations));
  }, [currentConversation, conversationHistory]);

  const handleSoapNoteSubmit = async (text: string) => {
    // Get API key from settings or fallback to environment variables
    const currentApiKey = settings.aiProvider === 'openai' 
      ? settings.openai.apiKey || process.env.REACT_APP_OPENAI_API_KEY
      : settings.gemini.apiKey || process.env.REACT_APP_GEMINI_API_KEY;
      
    if (!currentApiKey) {
      setError(`Please configure your ${settings.aiProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} API key in settings or environment variables`);
      setShowSettings(true);
      return;
    }

    setLoading({ isAnalyzing: true });
    setError('');

    try {
      const anonymizationResult = anonymizeText(text, settings.anonymizationConfig);
      
      const analysis = settings.aiProvider === 'openai'
        ? await openaiService.analyzeSoapNote(anonymizationResult.anonymizedText)
        : await geminiService.analyzeSoapNote(anonymizationResult.anonymizedText);

      const newExchange: ConversationExchange = {
        id: Date.now().toString(),
        timestamp: new Date(),
        originalText: text,
        anonymizedText: anonymizationResult.anonymizedText,
        analysis,
        replacements: anonymizationResult.replacements,
      };

      if (currentConversation) {
        // Add to existing conversation
        setCurrentConversation(prev => ({
          ...prev!,
          lastUpdated: new Date(),
          exchanges: [newExchange, ...prev!.exchanges]
        }));
      } else {
        // Start new conversation
        const newConversation: ConversationEntry = {
          id: Date.now().toString(),
          startedAt: new Date(),
          lastUpdated: new Date(),
          exchanges: [newExchange],
          title: `Conversation ${new Date().toLocaleDateString()}`
        };
        setCurrentConversation(newConversation);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading({ isAnalyzing: false });
    }
  };

  const handleSettingsSave = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setError('');
  };

  const handleExport = () => {
    const allConversations = currentConversation 
      ? [currentConversation, ...conversationHistory]
      : conversationHistory;
    const choice = window.confirm('Export as JSON (OK) or Text file (Cancel)?');
    if (choice) {
      exportConversations(allConversations);
    } else {
      exportAsText(allConversations);
    }
  };

  const handleClearCurrent = () => {
    if (window.confirm('Are you sure you want to clear the current conversation? This cannot be undone.')) {
      if (currentConversation) {
        setConversationHistory(prev => [currentConversation, ...prev]);
      }
      setCurrentConversation(null);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all conversation history? This cannot be undone.')) {
      setConversationHistory([]);
      setCurrentConversation(null);
    }
  };

  const isConfigured = (() => {
    const userApiKey = settings.aiProvider === 'openai' ? settings.openai.apiKey : settings.gemini.apiKey;
    const envApiKey = settings.aiProvider === 'openai' 
      ? process.env.REACT_APP_OPENAI_API_KEY 
      : process.env.REACT_APP_GEMINI_API_KEY;
    return (userApiKey || envApiKey || '').trim() !== '';
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-medical-100 p-2 rounded-lg">
                <Stethoscope className="h-8 w-8 text-medical-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vivaria</h1>
                <p className="text-sm text-gray-600">AI-Powered Medical Documentation Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              <SettingsIcon className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConfigured && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">Configuration Required</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Please configure your {settings.aiProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} API key in settings to start analyzing SOAP notes.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <SoapNoteInput 
              onSubmit={handleSoapNoteSubmit}
              isLoading={loading.isAnalyzing}
            />
          </div>
          
          <div className="space-y-8">
            <ConversationHistory
              currentConversation={currentConversation}
              conversationHistory={conversationHistory}
              onExport={handleExport}
              onClear={handleClearHistory}
              onClearCurrent={handleClearCurrent}
            />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>Vivaria - Secure, Privacy-First Medical Documentation Assistant</p>
            <p className="mt-1">All PHI is automatically anonymized before AI analysis. Data is stored locally.</p>
          </div>
        </div>
      </footer>

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSettingsSave}
      />
    </div>
  );
}

export default App;