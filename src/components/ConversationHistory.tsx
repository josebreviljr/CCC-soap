import React, { useState } from 'react';
import { Clock, Eye, EyeOff, Download, Trash2, MessageSquare, RotateCcw, FileText, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ConversationEntry } from '../types';

interface ConversationHistoryProps {
  currentConversation: ConversationEntry | null;
  conversationHistory: ConversationEntry[];
  onExport: () => void;
  onClear: () => void;
  onClearCurrent: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  currentConversation,
  conversationHistory,
  onExport,
  onClear,
  onClearCurrent,
}) => {
  const [showOriginal, setShowOriginal] = useState<{ [key: string]: boolean }>({});
  const [expandedEntries, setExpandedEntries] = useState<{ [key: string]: boolean }>({});

  const toggleOriginal = (id: string) => {
    setShowOriginal(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpanded = (id: string) => {
    setExpandedEntries(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Conversation</h2>
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No conversation started</p>
          <p className="text-sm mt-2">Submit a SOAP note to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Current Conversation {currentConversation && `(${totalExchanges} exchanges)`}
        </h2>
        <div className="flex space-x-2">
          {currentConversation && (
            <button
              onClick={onClearCurrent}
              className="flex items-center space-x-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>New</span>
            </button>
          )}
          <button
            onClick={onExport}
            className="flex items-center space-x-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={onClear}
            className="flex items-center space-x-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {currentConversation?.exchanges.map((exchange) => (
          <div key={exchange.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatTimestamp(exchange.timestamp)}</span>
                {exchange.messageType === 'soap_note' ? (
                  <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    <FileText className="h-3 w-3" />
                    <span>SOAP Note</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    <MessageCircle className="h-3 w-3" />
                    <span>Chat</span>
                  </div>
                )}
                {exchange.replacements.length > 0 && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                    {exchange.replacements.length} items anonymized
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleOriginal(exchange.id)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {showOriginal[exchange.id] ? (
                  <>
                    <EyeOff className="h-3 w-3" />
                    <span>Hide Original</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Show Original</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  {exchange.messageType === 'soap_note' ? 'SOAP Note Input:' : 'User Message:'}
                </h4>
                <div 
                  className={`text-sm bg-gray-50 p-3 rounded border ${
                    expandedEntries[exchange.id] ? '' : 'max-h-20 overflow-hidden'
                  }`}
                >
                  {showOriginal[exchange.id] ? exchange.originalText : exchange.anonymizedText}
                </div>
                {(showOriginal[exchange.id] ? exchange.originalText : exchange.anonymizedText).length > 200 && (
                  <button
                    onClick={() => toggleExpanded(exchange.id)}
                    className="text-xs text-medical-600 hover:text-medical-700 mt-1"
                  >
                    {expandedEntries[exchange.id] ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  {exchange.messageType === 'soap_note' ? 'SOAP Analysis:' : 'AI Response:'}
                </h4>
                <div className="text-sm text-gray-800 bg-blue-50 p-3 rounded border prose prose-sm max-w-none markdown-content">
                  <ReactMarkdown>
                    {exchange.analysis}
                  </ReactMarkdown>
                </div>
              </div>

              {exchange.replacements.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    View anonymization details ({exchange.replacements.length} replacements)
                  </summary>
                  <div className="mt-2 space-y-1">
                    {exchange.replacements.map((replacement, idx) => (
                      <div key={idx} className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="font-mono text-red-600">{replacement.original}</span>
                        <span>→</span>
                        <span className="font-mono text-green-600">{replacement.replacement}</span>
                        <span className="text-gray-500 uppercase">{replacement.type}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>

      {conversationHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Past Conversations ({conversationHistory.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {conversationHistory.map((conversation) => (
              <div key={conversation.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MessageSquare className="h-4 w-4" />
                    <span>{conversation.title || "Untitled Conversation"}</span>
                    <span className="text-xs">({conversation.exchanges.length} exchanges)</span>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {formatTimestamp(conversation.lastUpdated)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};