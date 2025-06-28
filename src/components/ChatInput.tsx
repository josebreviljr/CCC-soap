import React, { useState } from 'react';
import { Send, FileText, MessageSquare } from 'lucide-react';

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
  const [messageType, setMessageType] = useState<'soap_note' | 'chat'>('chat');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const textToSubmit = inputText.trim();
    setInputText('');
    
    try {
      await onSubmit(textToSubmit, messageType);
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

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-2 mb-3">
        <button
          onClick={() => setMessageType('chat')}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
            messageType === 'chat'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => setMessageType('soap_note')}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
            messageType === 'soap_note'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>SOAP Note</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={messageType === 'soap_note' 
            ? "Enter SOAP note details for analysis..." 
            : placeholder}
          className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Send className="h-4 w-4" />
          <span>Send</span>
        </button>
      </form>

      {messageType === 'soap_note' && (
        <div className="mt-2 text-xs text-gray-600">
          <p>💡 <strong>SOAP Note Mode:</strong> Enter patient details, symptoms, or clinical observations for structured SOAP note generation.</p>
        </div>
      )}
      
      {messageType === 'chat' && (
        <div className="mt-2 text-xs text-gray-600">
          <p>💬 <strong>Chat Mode:</strong> Ask questions, get clarifications, or have a conversation with the AI assistant.</p>
        </div>
      )}
    </div>
  );
}; 