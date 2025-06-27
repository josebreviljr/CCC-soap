import React, { useState } from 'react';
import { Clock, Eye, EyeOff, Download, Trash2 } from 'lucide-react';
import { ConversationEntry } from '../types';

interface ConversationHistoryProps {
  conversations: ConversationEntry[];
  onExport: () => void;
  onClear: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  conversations,
  onExport,
  onClear,
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

  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Conversation History</h2>
        <div className="text-center py-8 text-gray-500">
          <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No conversations yet</p>
          <p className="text-sm mt-2">Submit a SOAP note to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Conversation History ({conversations.length})
        </h2>
        <div className="flex space-x-2">
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
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {conversations.map((entry) => (
          <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatTimestamp(entry.timestamp)}</span>
                {entry.replacements.length > 0 && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    {entry.replacements.length} items anonymized
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleOriginal(entry.id)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {showOriginal[entry.id] ? (
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
                  {showOriginal[entry.id] ? 'Original SOAP Note:' : 'Anonymized SOAP Note:'}
                </h4>
                <div 
                  className={`text-sm bg-gray-50 p-3 rounded border ${
                    expandedEntries[entry.id] ? '' : 'max-h-20 overflow-hidden'
                  }`}
                >
                  {showOriginal[entry.id] ? entry.originalText : entry.anonymizedText}
                </div>
                {(showOriginal[entry.id] ? entry.originalText : entry.anonymizedText).length > 200 && (
                  <button
                    onClick={() => toggleExpanded(entry.id)}
                    className="text-xs text-medical-600 hover:text-medical-700 mt-1"
                  >
                    {expandedEntries[entry.id] ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Analysis:</h4>
                <div className="text-sm text-gray-800 bg-blue-50 p-3 rounded border prose prose-sm max-w-none">
                  {entry.analysis.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-2 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {entry.replacements.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    View anonymization details ({entry.replacements.length} replacements)
                  </summary>
                  <div className="mt-2 space-y-1">
                    {entry.replacements.map((replacement, idx) => (
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
    </div>
  );
};