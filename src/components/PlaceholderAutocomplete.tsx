import { useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { buildAllSuggestions, filterSuggestions } from '@/lib/placeholderSuggestions';

interface PlaceholderAutocompleteProps {
  isOpen: boolean;
  position: { top: number; left: number };
  filter: string;
  csvHeaders: string[];
  onSelect: (placeholder: string) => void;
  onClose: () => void;
  selectedIndex: number;
  isMethodMode?: boolean;
  currentPlaceholder?: string;
  isInsideArray?: boolean;
}

export function PlaceholderAutocomplete({
  isOpen,
  position,
  filter,
  csvHeaders,
  onSelect,
  onClose,
  selectedIndex,
  isMethodMode = false,
  currentPlaceholder = '',
  isInsideArray = false
}: PlaceholderAutocompleteProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const allSuggestions = useMemo(
    () => buildAllSuggestions(isMethodMode, isInsideArray, csvHeaders),
    [isMethodMode, isInsideArray, csvHeaders]
  );

  const filteredSuggestions = useMemo(
    () => filterSuggestions(allSuggestions, filter),
    [allSuggestions, filter]
  );

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const selected = menuRef.current.querySelector('[data-selected="true"]');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen || filteredSuggestions.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto min-w-[250px]"
      style={{ top: position.top, left: position.left }}
    >
      {isMethodMode && (
        <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border bg-muted/50">
          Methods for <span className="font-mono text-primary">{currentPlaceholder}</span>
        </div>
      )}
      <div className="p-1">
        {filteredSuggestions.map((suggestion, index) => (
          <button
            key={suggestion.name}
            data-selected={index === selectedIndex}
            className={cn(
              "w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between gap-2 transition-colors",
              index === selectedIndex
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            onClick={() => onSelect(suggestion.isMethod ? suggestion.displayName : suggestion.name)}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="flex flex-col">
              <span className="font-mono">
                {suggestion.isMethod ? `.${suggestion.displayName}` : `{{${suggestion.displayName}}}`}
              </span>
              <span className={cn(
                "text-xs",
                index === selectedIndex ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {suggestion.description}
              </span>
            </div>
            {suggestion.isSystem && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide",
                index === selectedIndex
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary/20 text-primary"
              )}>
                System
              </span>
            )}
            {suggestion.isUserInput && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide",
                index === selectedIndex
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-amber-500/20 text-amber-600"
              )}>
                Input
              </span>
            )}
            {suggestion.isMethod && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide",
                index === selectedIndex
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-accent/50 text-accent-foreground"
              )}>
                Method
              </span>
            )}
            {suggestion.isRowInput && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide",
                index === selectedIndex
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-cyan-500/20 text-cyan-600"
              )}>
                Row
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
