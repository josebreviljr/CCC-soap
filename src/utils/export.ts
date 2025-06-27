import { ConversationEntry } from '../types';

export function exportConversations(conversations: ConversationEntry[]): void {
  if (conversations.length === 0) {
    alert('No conversations to export');
    return;
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    totalConversations: conversations.length,
    conversations: conversations.map(entry => ({
      id: entry.id,
      timestamp: entry.timestamp.toISOString(),
      originalText: entry.originalText,
      anonymizedText: entry.anonymizedText,
      analysis: entry.analysis,
      replacements: entry.replacements,
    }))
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `soap-note-conversations-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

export function exportAsText(conversations: ConversationEntry[]): void {
  if (conversations.length === 0) {
    alert('No conversations to export');
    return;
  }

  let textContent = `SOAP Note Refiner - Conversation Export\n`;
  textContent += `Export Date: ${new Date().toLocaleString()}\n`;
  textContent += `Total Conversations: ${conversations.length}\n`;
  textContent += `${'='.repeat(60)}\n\n`;

  conversations.forEach((entry, index) => {
    textContent += `Conversation ${index + 1}\n`;
    textContent += `Date: ${entry.timestamp.toLocaleString()}\n`;
    textContent += `${'-'.repeat(40)}\n\n`;
    
    textContent += `ORIGINAL SOAP NOTE:\n`;
    textContent += `${entry.originalText}\n\n`;
    
    textContent += `ANONYMIZED SOAP NOTE:\n`;
    textContent += `${entry.anonymizedText}\n\n`;
    
    textContent += `ANALYSIS:\n`;
    textContent += `${entry.analysis}\n\n`;
    
    if (entry.replacements.length > 0) {
      textContent += `ANONYMIZATION DETAILS (${entry.replacements.length} replacements):\n`;
      entry.replacements.forEach((replacement, idx) => {
        textContent += `${idx + 1}. ${replacement.type.toUpperCase()}: "${replacement.original}" → "${replacement.replacement}"\n`;
      });
      textContent += `\n`;
    }
    
    textContent += `${'='.repeat(60)}\n\n`;
  });

  const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent);
  const exportFileDefaultName = `soap-note-conversations-${new Date().toISOString().split('T')[0]}.txt`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}