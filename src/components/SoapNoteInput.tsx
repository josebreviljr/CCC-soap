import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, Send } from 'lucide-react';

interface SoapNoteInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export const SoapNoteInput: React.FC<SoapNoteInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleTextSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
      setText('');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadStatus(`Reading ${file.name}...`);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
        setUploadStatus('');
      };
      
      reader.onerror = () => {
        setUploadStatus('Error reading file');
        setTimeout(() => setUploadStatus(''), 3000);
      };
      
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">SOAP Note Input</h2>
      
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-medical-500 bg-medical-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {uploadStatus ? (
            <p className="text-sm text-medical-600">{uploadStatus}</p>
          ) : (
            <div>
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'Drop the file here...'
                  : 'Drag & drop a SOAP note file here, or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports .txt, .doc, .docx files
              </p>
            </div>
          )}
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Or paste your SOAP note here..."
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