import { useCallback, useState, useRef, KeyboardEvent } from 'react';
import { Upload, FileJson, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceholderAutocomplete } from './PlaceholderAutocomplete';
import { getSystemPlaceholderNames } from '@/lib/systemPlaceholders';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  error?: string;
  placeholders: string[];
  csvHeaders?: string[];
}

export function JsonEditor({ value, onChange, isValid, error, placeholders, csvHeaders = [] }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [autocomplete, setAutocomplete] = useState({
    isOpen: false,
    position: { top: 0, left: 0 },
    filter: '',
    selectedIndex: 0,
    startPos: 0
  });

  const systemPlaceholderNames = getSystemPlaceholderNames();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onChange(content);
      };
      reader.readAsText(file);
    }
  }, [onChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onChange(content);
      };
      reader.readAsText(file);
    }
  }, [onChange]);

  const getCaretCoordinates = () => {
    const textarea = textareaRef.current;
    if (!textarea) return { top: 0, left: 0 };

    const { selectionStart } = textarea;
    const textBeforeCaret = value.substring(0, selectionStart);
    const lines = textBeforeCaret.split('\n');
    const currentLineIndex = lines.length - 1;
    const currentLineLength = lines[currentLineIndex].length;

    // Approximate position
    const lineHeight = 20;
    const charWidth = 8.5;
    const top = (currentLineIndex + 1) * lineHeight + 8;
    const left = Math.min(currentLineLength * charWidth + 16, textarea.offsetWidth - 280);

    return { top, left };
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    onChange(newValue);

    // Check for {{ trigger
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastDoubleBrace = textBeforeCursor.lastIndexOf('{{');
    
    if (lastDoubleBrace !== -1) {
      const textAfterBrace = textBeforeCursor.substring(lastDoubleBrace + 2);
      // Check if there's no closing brace and no newline
      if (!textAfterBrace.includes('}}') && !textAfterBrace.includes('\n')) {
        const filter = textAfterBrace;
        setAutocomplete({
          isOpen: true,
          position: getCaretCoordinates(),
          filter,
          selectedIndex: 0,
          startPos: lastDoubleBrace
        });
        return;
      }
    }
    
    setAutocomplete(prev => ({ ...prev, isOpen: false }));
  };

  const handleSelect = (placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastDoubleBrace = textBeforeCursor.lastIndexOf('{{');
    
    const newValue = 
      value.substring(0, lastDoubleBrace) + 
      `{{${placeholder}}}` + 
      value.substring(cursorPos);
    
    onChange(newValue);
    setAutocomplete(prev => ({ ...prev, isOpen: false }));

    // Set cursor position after the inserted placeholder
    setTimeout(() => {
      const newPos = lastDoubleBrace + placeholder.length + 4;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!autocomplete.isOpen) return;

    const allSuggestions = [
      ...systemPlaceholderNames,
      ...csvHeaders
    ].filter(s => s.toLowerCase().includes(autocomplete.filter.toLowerCase()));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAutocomplete(prev => ({
        ...prev,
        selectedIndex: Math.min(prev.selectedIndex + 1, allSuggestions.length - 1)
      }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAutocomplete(prev => ({
        ...prev,
        selectedIndex: Math.max(prev.selectedIndex - 1, 0)
      }));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (allSuggestions.length > 0) {
        e.preventDefault();
        handleSelect(allSuggestions[autocomplete.selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setAutocomplete(prev => ({ ...prev, isOpen: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">JSON Template</h2>
        </div>
        <div className="flex items-center gap-2">
          {value && (
            <span className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded",
              isValid ? "bg-emerald-500/20 text-emerald-400" : "bg-destructive/20 text-destructive"
            )}>
              {isValid ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {isValid ? 'Valid JSON' : 'Invalid JSON'}
            </span>
          )}
        </div>
      </div>

      <div
        className="drop-zone cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('json-upload')?.click()}
      >
        <input
          id="json-upload"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drop a JSON file here or click to upload
        </p>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setAutocomplete(prev => ({ ...prev, isOpen: false })), 150)}
          placeholder={`{\n  "name": "{{name}}",\n  "email": "{{email}}",\n  "createdAt": "{{currentDatetime}}"\n}`}
          className="code-editor w-full min-h-[250px] resize-y bg-muted border border-border rounded-lg p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring scrollbar-thin"
          spellCheck={false}
        />
        <PlaceholderAutocomplete
          isOpen={autocomplete.isOpen}
          position={autocomplete.position}
          filter={autocomplete.filter}
          csvHeaders={csvHeaders}
          onSelect={handleSelect}
          onClose={() => setAutocomplete(prev => ({ ...prev, isOpen: false }))}
          selectedIndex={autocomplete.selectedIndex}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {placeholders.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Detected Placeholders
          </p>
          <div className="flex flex-wrap gap-2">
            {placeholders.map((p) => (
              <span 
                key={p} 
                className={cn(
                  "placeholder-tag",
                  systemPlaceholderNames.includes(p) && "border-primary/50 bg-primary/10"
                )}
              >
                {`{{${p}}}`}
                {systemPlaceholderNames.includes(p) && (
                  <span className="ml-1 text-[10px] text-primary">SYS</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
