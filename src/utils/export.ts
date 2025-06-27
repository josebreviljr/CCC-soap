import { ConversationEntry } from '../types';

export function exportConversations(conversations: ConversationEntry[]): void {
  if (conversations.length === 0) {
    alert('No conversations to export');
    return;
  }

  const totalExchanges = conversations.reduce((sum, conv) => sum + conv.exchanges.length, 0);
  
  const exportData = {
    exportDate: new Date().toISOString(),
    totalConversations: conversations.length,
    totalExchanges,
    conversations: conversations.map(entry => ({
      id: entry.id,
      title: entry.title,
      startedAt: entry.startedAt.toISOString(),
      lastUpdated: entry.lastUpdated.toISOString(),
      exchanges: entry.exchanges.map(exchange => ({
        id: exchange.id,
        timestamp: exchange.timestamp.toISOString(),
        originalText: exchange.originalText,
        anonymizedText: exchange.anonymizedText,
        analysis: exchange.analysis,
        replacements: exchange.replacements,
      }))
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

  conversations.forEach((conversation, convIndex) => {
    textContent += `Conversation ${convIndex + 1}: ${conversation.title || 'Untitled'}\n`;
    textContent += `Started: ${conversation.startedAt.toLocaleString()}\n`;
    textContent += `Last Updated: ${conversation.lastUpdated.toLocaleString()}\n`;
    textContent += `Exchanges: ${conversation.exchanges.length}\n`;
    textContent += `${'-'.repeat(40)}\n\n`;
    
    conversation.exchanges.forEach((exchange, exchIndex) => {
      textContent += `  Exchange ${exchIndex + 1} (${exchange.timestamp.toLocaleString()})\n`;
      textContent += `  ${'-'.repeat(35)}\n\n`;
      
      textContent += `  ORIGINAL SOAP NOTE:\n`;
      textContent += `  ${exchange.originalText.replace(/\n/g, '\n  ')}\n\n`;
      
      textContent += `  ANONYMIZED SOAP NOTE:\n`;
      textContent += `  ${exchange.anonymizedText.replace(/\n/g, '\n  ')}\n\n`;
      
      textContent += `  ANALYSIS:\n`;
      textContent += `  ${exchange.analysis.replace(/\n/g, '\n  ')}\n\n`;
      
      if (exchange.replacements.length > 0) {
        textContent += `  ANONYMIZATION DETAILS (${exchange.replacements.length} replacements):\n`;
        exchange.replacements.forEach((replacement, idx) => {
          textContent += `  ${idx + 1}. ${replacement.type.toUpperCase()}: "${replacement.original}" → "${replacement.replacement}"\n`;
        });
        textContent += `\n`;
      }
      
      textContent += `\n`;
    });
    
    textContent += `${'='.repeat(60)}\n\n`;
  });

  const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent);
  const exportFileDefaultName = `soap-note-conversations-${new Date().toISOString().split('T')[0]}.txt`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}