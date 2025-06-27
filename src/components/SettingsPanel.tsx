import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Eye, EyeOff } from 'lucide-react';
import { AppSettings, AIProvider } from '../types';
import { DEFAULT_ANONYMIZATION_CONFIG } from '../utils/anonymization';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings, isOpen]);

  const handleSave = () => {
    onSave(localSettings);
    setHasChanges(false);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setHasChanges(false);
    onClose();
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateAnonymizationConfig = (updates: Partial<typeof settings.anonymizationConfig>) => {
    setLocalSettings(prev => ({
      ...prev,
      anonymizationConfig: { ...prev.anonymizationConfig, ...updates }
    }));
    setHasChanges(true);
  };

  const updateOpenAIConfig = (updates: Partial<typeof settings.openai>) => {
    setLocalSettings(prev => ({
      ...prev,
      openai: { ...prev.openai, ...updates }
    }));
    setHasChanges(true);
  };

  const updateGeminiConfig = (updates: Partial<typeof settings.gemini>) => {
    setLocalSettings(prev => ({
      ...prev,
      gemini: { ...prev.gemini, ...updates }
    }));
    setHasChanges(true);
  };

  const currentApiKey = localSettings.aiProvider === 'openai' 
    ? localSettings.openai.apiKey 
    : localSettings.gemini.apiKey;

  const isConfigured = currentApiKey.trim() !== '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">AI Provider</h3>
            <div className="flex space-x-4 mb-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="aiProvider"
                  value="openai"
                  checked={localSettings.aiProvider === 'openai'}
                  onChange={(e) => updateSettings({ aiProvider: e.target.value as AIProvider })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">OpenAI</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="aiProvider"
                  value="gemini"
                  checked={localSettings.aiProvider === 'gemini'}
                  onChange={(e) => updateSettings({ aiProvider: e.target.value as AIProvider })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Google Gemini</span>
              </label>
            </div>

            {localSettings.aiProvider === 'openai' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700">OpenAI Configuration</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key *
                  </label>
                  <div className="relative">
                    <input
                      type={showOpenAIKey ? 'text' : 'password'}
                      value={localSettings.openai.apiKey}
                      onChange={(e) => updateOpenAIConfig({ apiKey: e.target.value })}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-medical-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showOpenAIKey ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {!localSettings.openai.apiKey && process.env.REACT_APP_OPENAI_API_KEY && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Using API key from environment variables
                    </p>
                  )}
                  {!process.env.REACT_APP_OPENAI_API_KEY && (
                    <p className="text-xs text-gray-500 mt-1">
                      API key will be stored locally and never sent to our servers
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    value={localSettings.openai.model}
                    onChange={(e) => updateOpenAIConfig({ model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Default)</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={localSettings.openai.baseURL || ''}
                    onChange={(e) => updateOpenAIConfig({ baseURL: e.target.value || undefined })}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use OpenAI's default endpoint
                  </p>
                </div>
              </div>
            )}

            {localSettings.aiProvider === 'gemini' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700">Google Gemini Configuration</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key *
                  </label>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={localSettings.gemini.apiKey}
                      onChange={(e) => updateGeminiConfig({ apiKey: e.target.value })}
                      placeholder="AI..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-medical-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showGeminiKey ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {!localSettings.gemini.apiKey && process.env.REACT_APP_GEMINI_API_KEY && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Using API key from environment variables
                    </p>
                  )}
                  {!process.env.REACT_APP_GEMINI_API_KEY && (
                    <p className="text-xs text-gray-500 mt-1">
                      Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-medical-600 hover:text-medical-700">Google AI Studio</a>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    value={localSettings.gemini.model}
                    onChange={(e) => updateGeminiConfig({ model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  >
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recommended)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-pro">Gemini Pro</option>
                  </select>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4">
              Your API keys are stored locally and never sent to our servers
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Anonymization Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Names</label>
                  <p className="text-xs text-gray-500">Remove patient and provider names</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.anonymizationConfig.anonymizeNames}
                  onChange={(e) => updateAnonymizationConfig({ anonymizeNames: e.target.checked })}
                  className="h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Dates</label>
                  <p className="text-xs text-gray-500">Remove specific dates and timestamps</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.anonymizationConfig.anonymizeDates}
                  onChange={(e) => updateAnonymizationConfig({ anonymizeDates: e.target.checked })}
                  className="h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Addresses</label>
                  <p className="text-xs text-gray-500">Remove street addresses and locations</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.anonymizationConfig.anonymizeAddresses}
                  onChange={(e) => updateAnonymizationConfig({ anonymizeAddresses: e.target.checked })}
                  className="h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Numbers</label>
                  <p className="text-xs text-gray-500">Remove phone and fax numbers</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.anonymizationConfig.anonymizePhoneNumbers}
                  onChange={(e) => updateAnonymizationConfig({ anonymizePhoneNumbers: e.target.checked })}
                  className="h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">ID Numbers</label>
                  <p className="text-xs text-gray-500">Remove MRN, SSN, and other identifiers</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.anonymizationConfig.anonymizeIds}
                  onChange={(e) => updateAnonymizationConfig({ anonymizeIds: e.target.checked })}
                  className="h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Addresses</label>
                  <p className="text-xs text-gray-500">Remove email addresses</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.anonymizationConfig.anonymizeEmails}
                  onChange={(e) => updateAnonymizationConfig({ anonymizeEmails: e.target.checked })}
                  className="h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {hasChanges && (
              <span className="text-amber-600">• Unsaved changes</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isConfigured}
              className="flex items-center space-x-2 px-4 py-2 bg-medical-600 text-white rounded-md hover:bg-medical-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};