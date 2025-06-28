import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (text: string, messageType: 'soap_note' | 'chat') => Promise<void>;
  loading: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  loading,
  placeholder = "Enter your message or SOAP note..."
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const textToSubmit = inputText.trim();
    setInputText('');
    
    try {
      await onSubmit(textToSubmit, 'chat');
    } catch (error) {
      console.error('Error submitting message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 160); // max height 160px
    textarea.style.height = newHeight + 'px';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <textarea
            value={inputText}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 bg-transparent p-4 pr-12 resize-none border-0 focus:ring-0 focus:outline-none placeholder-gray-500 max-h-40 min-h-[60px]"
            rows={1}
            disabled={loading}
            style={{ resize: 'none' }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all ${
              !inputText.trim() || loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>

      <div className="mt-3 text-xs text-gray-500">
        <p>💬 Press Enter to send, Shift+Enter for new line. SOAP notes are automatically detected and analyzed.</p>
      </div>
    </div>
  );
}; 