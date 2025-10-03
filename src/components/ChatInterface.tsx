import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ChatMessage } from './ChatMessage';

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

export const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const thinkingSoundRef = useRef<HTMLAudioElement | null>(null);
  const responseSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio elements for sound effects
    thinkingSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSSJ0fDTgjMGHm7A7+OZSA0OVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHa');
    responseSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSSJ0fDTgjMGHm7A7+OZSA0OVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHaizUIG2u87+KdSwwOVqzn8apfGAg+l9zvxnMlBSKBzvHa');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Play thinking sound
    thinkingSoundRef.current?.play().catch(() => {});

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rag-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ message: userMessage.text }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Play response sound
      responseSoundRef.current?.play().catch(() => {});

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        isUser: false,
        sources: data.sources,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen relative z-10">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            RAG NUTRITIONAL CHATBOT: BUILD FROM SCRATCH
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Presented by sarvesh</p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-block p-8 border border-primary/20 bg-card">
                <h2 className="text-xl font-bold text-primary mb-4">
                  WELCOME TO THE RAG SYSTEM
                </h2>
                <p className="text-muted-foreground mb-2">
                  Ask questions about human nutrition
                </p>
                <p className="text-sm text-muted-foreground">
                  Example: "What are the essential functions of water in the body?"
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Processing query...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 bg-input border-border font-mono"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
