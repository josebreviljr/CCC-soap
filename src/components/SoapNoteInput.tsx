import React, { useState } from 'react';
import { FileText, Loader2, Send } from 'lucide-react';

interface SoapNoteInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export const SoapNoteInput: React.FC<SoapNoteInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleTextSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
      setText('');
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat</h2>
      
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your note here..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
            disabled={isLoading}
          />
          {text && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {text.length} characters
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span>Content will be automatically anonymized before analysis</span>
          </div>
          
          <button
            onClick={handleTextSubmit}
            disabled={!text.trim() || isLoading}
            className="flex items-center space-x-2 bg-medical-600 text-white px-6 py-2 rounded-lg hover:bg-medical-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Analyzing...' : 'Analyze'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};