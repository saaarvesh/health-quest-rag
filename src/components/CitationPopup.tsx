import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Source {
  id: number;
  content: string;
  similarity: number;
  metadata: {
    source: string;
    page: number;
  };
}

interface CitationPopupProps {
  source: Source;
  onClose: () => void;
}

export const CitationPopup = ({ source, onClose }: CitationPopupProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full bg-card border border-primary/30 p-6 shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="space-y-4">
          <div className="flex items-center justify-between pr-8">
            <h3 className="text-lg font-bold text-primary">SOURCE CITATION</h3>
            <span className="text-sm text-muted-foreground">
              Page {source.metadata.page}
            </span>
          </div>

          <div className="border-l-2 border-primary/50 pl-4">
            <p className="text-sm font-mono leading-relaxed text-foreground/90">
              {source.content}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span>Similarity: {(source.similarity * 100).toFixed(1)}%</span>
            <span className="font-mono">{source.metadata.source}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
