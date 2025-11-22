import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { cn } from '@/lib/utils';

interface SmartSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: string) => void;
  placeholder?: string;
  className?: string;
}

const SmartSearchInput = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search businesses, services, or categories...",
  className
}: SmartSearchInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { suggestions, loading, trackSearch } = useSmartSearch(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    trackSearch(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    onSelect?.(suggestion);
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("pl-10 pr-10", className)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-md transition-colors flex items-center gap-3 group",
                  highlightedIndex === index
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                  highlightedIndex === index
                    ? "bg-primary/20"
                    : "bg-muted group-hover:bg-muted-foreground/10"
                )}>
                  {index === 0 ? (
                    <TrendingUp className="h-4 w-4 text-primary" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span className="flex-1 text-sm font-medium">{suggestion}</span>
              </button>
            ))}
          </div>
          <div className="px-4 py-2 bg-muted/50 border-t border-border">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AI-powered suggestions
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearchInput;
