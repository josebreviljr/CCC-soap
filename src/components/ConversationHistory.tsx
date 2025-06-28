import React, { useState, useRef, useEffect } from 'react';
import { Download, Trash2, MessageSquare, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ConversationEntry } from '../types';

interface ConversationHistoryProps {
  currentConversation: ConversationEntry | null;
  conversationHistory: ConversationEntry[];
  onExport: () => void;
  onClear: () => void;
  onClearCurrent: () => void;
  loading?: boolean;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  currentConversation,
  conversationHistory,
  onExport,
  onClear,
  onClearCurrent,
  loading = false,
}) => {
  const [showOriginal, setShowOriginal] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleOriginal = (id: string) => {
    setShowOriginal(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Auto-scroll to bottom when new messages are added or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.exchanges.length, loading]);

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const hasNoConversations = !currentConversation && conversationHistory.length === 0;
  const totalExchanges = currentConversation ? currentConversation.exchanges.length : 0;

  if (hasNoConversations) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome to Vivaria</h3>
            <p className="text-gray-500">Start a conversation by typing a message below</p>
            <p className="text-sm mt-2 text-gray-400">You can ask questions, analyze SOAP notes, or have a general conversation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">
          Vivaria {currentConversation && `• ${totalExchanges} messages`}
        </h2>
        <div className="flex space-x-2">
          {currentConversation && (
            <button
              onClick={onClearCurrent}
              className="flex items-center space-x-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>New Chat</span>
            </button>
          )}
          <button
            onClick={onExport}
            className="flex items-center space-x-1 text-sm bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={onClear}
            className="flex items-center space-x-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {currentConversation?.exchanges.slice().reverse().map((exchange) => (
          <div key={exchange.id} className="space-y-4">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-3">
                <div className="text-sm font-medium mb-1 flex items-center space-x-2">
                  <span>You</span>
                  {exchange.messageType === 'soap_note' && (
                    <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs font-normal">
                      SOAP Note
                    </span>
                  )}
                  {exchange.replacements.length > 0 && (
                    <span className="bg-orange-400 bg-opacity-80 px-2 py-0.5 rounded-full text-xs font-normal">
                      Anonymized
                    </span>
                  )}
                </div>
                <div className="whitespace-pre-wrap text-sm">
                  {showOriginal[exchange.id] ? exchange.originalText : exchange.anonymizedText}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-blue-100">
                  <span>{formatTimestamp(exchange.timestamp)}</span>
                  {exchange.replacements.length > 0 && (
                    <button
                      onClick={() => toggleOriginal(exchange.id)}
                      className="hover:text-white transition-colors"
                    >
                      {showOriginal[exchange.id] ? 'Hide Original' : 'Show Original'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* AI response */}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="text-sm font-medium mb-2 text-gray-700">Vivaria</div>
                {exchange.analysis ? (
                  <div className="text-sm text-gray-800 prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2">
                    <ReactMarkdown>
                      {exchange.analysis}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span>Thinking...</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  {formatTimestamp(exchange.timestamp)}
                </div>
              </div>
            </div>

            {/* Anonymization details */}
            {exchange.replacements.length > 0 && (
              <div className="flex justify-center">
                <details className="text-xs max-w-md w-full">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700 text-center py-2 px-4 bg-gray-50 rounded-lg">
                    View anonymization details ({exchange.replacements.length} replacements)
                  </summary>
                  <div className="mt-2 space-y-1 bg-white border border-gray-200 rounded-lg p-3">
                    {exchange.replacements.map((replacement, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs">
                        <span className="font-mono text-red-600 flex-1 truncate">{replacement.original}</span>
                        <span className="mx-2">→</span>
                        <span className="font-mono text-green-600 flex-1 truncate">{replacement.replacement}</span>
                        <span className="text-gray-500 uppercase text-xs ml-2">{replacement.type}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        ))}
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="text-sm font-medium mb-2 text-gray-700">Vivaria</div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible div for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

    </div>
  );
};