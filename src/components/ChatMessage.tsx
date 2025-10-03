import { useState } from 'react';
import { CitationPopup } from './CitationPopup';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  sources?: Source[];
}

interface Source {
  id: number;
  content: string;
  similarity: number;
  metadata: {
    source: string;
    page: number;
  };
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const [selectedCitation, setSelectedCitation] = useState<Source | null>(null);

  const renderTextWithCitations = (text: string, sources?: Source[]) => {
    if (!sources || sources.length === 0) return text;

    // Find all citation patterns like [1], [2], etc.
    const citationPattern = /\[(\d+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = citationPattern.exec(text)) !== null) {
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }

      // Add citation
      const citationNumber = parseInt(match[1]);
      const source = sources[citationNumber - 1];
      
      parts.push({
        type: 'citation',
        content: match[0],
        source: source,
        number: citationNumber,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    return parts.map((part, index) => {
      if (part.type === 'text') {
        return <span key={index}>{part.content}</span>;
      } else {
        return (
          <button
            key={index}
            onClick={() => setSelectedCitation(part.source)}
            className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 mx-0.5 text-xs font-bold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors cursor-pointer"
          >
            {part.number}
          </button>
        );
      }
    });
  };

  return (
    <>
      <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-3xl p-4 border ${
            message.isUser
              ? 'bg-secondary border-border'
              : 'bg-card border-primary/20'
          }`}
        >
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {message.isUser
              ? message.text
              : renderTextWithCitations(message.text, message.sources)}
          </div>
        </div>
      </div>

      {selectedCitation && (
        <CitationPopup
          source={selectedCitation}
          onClose={() => setSelectedCitation(null)}
        />
      )}
    </>
  );
};
