import { useCallback, useState, useRef, KeyboardEvent } from 'react';
import { Upload, FileJson, AlertCircle, Check, Download, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlaceholderAutocomplete } from './PlaceholderAutocomplete';
import { getSystemPlaceholderNames, systemPlaceholders, dateTimePlaceholderNames } from '@/lib/systemPlaceholders';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getAvailableMethods, parsePlaceholder } from '@/lib/placeholderMethods';
import { isInsideJsonArray, findArrayRegions } from '@/lib/jsonArrayDetection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const presetTemplates = [
  {
    id: 'cleardown',
    name: 'Cleardown',
    content: `{
    "RunId": "Cleardown_Run",
    "Device": "PrintDB",
    "Version": 1,
    "OutputType": "print",
    "TimeStamp": "{{currentDatetime}}",
    "Destination": "ClearDown_123456789",
    "ServerName": "HO-CLOUDMIG03",
    "Status": "Delete",
    "Settings": {
        "intra-run": false
    },
    "Files": [
        {
            "FileName": "{{FileName}}",
            "Duplex": "simplex",
            "InfoField": "Cleardown",
            "Status": "Delete",
            "Bin": 0,
            "DocumentIds": [
                "0"
            ]
        }
    ]
}`
  }
];

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
    startPos: 0,
    isMethodMode: false,
    currentPlaceholder: '',
    isInsideArray: false
  });

  const systemPlaceholderNames = getSystemPlaceholderNames();
  const availableMethods = getAvailableMethods();

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

  const handleDownload = useCallback(() => {
    if (!value) return;
    const blob = new Blob([value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [value]);

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
        // Check if we're in method mode (after a dot)
        const lastDot = textAfterBrace.lastIndexOf('.');
        
        if (lastDot !== -1) {
          // Method mode - show method suggestions
          const placeholderName = textAfterBrace.substring(0, lastDot);
          const methodFilter = textAfterBrace.substring(lastDot + 1);
          
          // Validate that the placeholder name exists
          const baseName = placeholderName.split('.')[0];
          const isValidPlaceholder = systemPlaceholderNames.includes(baseName) || csvHeaders.includes(baseName);
          
          if (isValidPlaceholder) {
            setAutocomplete({
              isOpen: true,
              position: getCaretCoordinates(),
              filter: methodFilter,
              selectedIndex: 0,
              startPos: lastDoubleBrace,
              isMethodMode: true,
              currentPlaceholder: placeholderName,
              isInsideArray: isInsideJsonArray(newValue, cursorPos)
            });
            return;
          }
        }
        
        // Regular placeholder mode
        const filter = textAfterBrace;
        setAutocomplete({
          isOpen: true,
          position: getCaretCoordinates(),
          filter,
          selectedIndex: 0,
          startPos: lastDoubleBrace,
          isMethodMode: false,
          currentPlaceholder: '',
          isInsideArray: isInsideJsonArray(newValue, cursorPos)
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
    
    let newValue: string;
    let newCursorPos: number;
    
    if (autocomplete.isMethodMode) {
      // Insert method after the current placeholder
      const textAfterBrace = textBeforeCursor.substring(lastDoubleBrace + 2);
      const lastDot = textAfterBrace.lastIndexOf('.');
      const insertPos = lastDoubleBrace + 2 + lastDot + 1;
      
      newValue = 
        value.substring(0, insertPos) + 
        placeholder + 
        value.substring(cursorPos);
      
      newCursorPos = insertPos + placeholder.length;
    } else {
      // Insert regular placeholder
      newValue = 
        value.substring(0, lastDoubleBrace) + 
        `{{${placeholder}}}` + 
        value.substring(cursorPos);
      
      newCursorPos = lastDoubleBrace + placeholder.length + 4;
    }
    
    onChange(newValue);
    setAutocomplete(prev => ({ ...prev, isOpen: false }));

    // Set cursor position after the inserted placeholder
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!autocomplete.isOpen) return;

    const allSuggestions = autocomplete.isMethodMode
      ? availableMethods.map(m => m.name.replace('()', '')).filter(s => s.toLowerCase().includes(autocomplete.filter.toLowerCase()))
      : [
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
        const selected = allSuggestions[autocomplete.selectedIndex];
        handleSelect(autocomplete.isMethodMode ? `${selected}()` : selected);
      }
    } else if (e.key === 'Escape') {
      setAutocomplete(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = presetTemplates.find(t => t.id === templateId);
    if (template) {
      onChange(template.content);
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
          <Select onValueChange={handleTemplateSelect}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Load template..." />
            </SelectTrigger>
            <SelectContent>
              {presetTemplates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {value && (
            <>
              <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!isValid}>
                <Download className="h-4 w-4" />
              </Button>
              <span className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded",
                isValid ? "bg-emerald-500/20 text-emerald-400" : "bg-destructive/20 text-destructive"
              )}>
                {isValid ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {isValid ? 'Valid JSON' : 'Invalid JSON'}
              </span>
            </>
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
        <div 
          className="absolute inset-0 p-4 font-mono text-sm pointer-events-none overflow-hidden whitespace-pre-wrap break-words border border-transparent rounded-lg bg-muted"
          aria-hidden="true"
        >
          {(() => {
            const arrayRegions = findArrayRegions(value);
            
            // Build segments with array region info
            const segments: { text: string; isPlaceholder: boolean; inArray: boolean }[] = [];
            const parts = value.split(/(\{\{[^}]*\}\})/);
            let pos = 0;
            
            for (const part of parts) {
              const isPlaceholder = /\{\{[^}]*\}\}/.test(part);
              // Check if start of this segment is inside an array
              const inArray = arrayRegions.some(r => pos >= r.start && pos < r.end);
              segments.push({ text: part, isPlaceholder, inArray });
              pos += part.length;
            }
            
            return segments.map((seg, i) => {
              if (seg.isPlaceholder) {
                return (
                  <mark key={i} className="bg-primary/40 text-primary rounded px-0.5">{seg.text}</mark>
                );
              }
              if (seg.inArray) {
                return (
                  <span key={i} className="text-foreground array-region">{seg.text}</span>
                );
              }
              return (
                <span key={i} className="text-foreground">{seg.text}</span>
              );
            });
          })()}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setAutocomplete(prev => ({ ...prev, isOpen: false })), 150)}
          placeholder={`{\n  "name": "{{name}}",\n  "email": "{{email}}",\n  "createdAt": "{{currentDatetime}}"\n}`}
          className="code-editor w-full min-h-[250px] resize-y bg-transparent border border-border rounded-lg p-4 font-mono text-sm text-transparent caret-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring scrollbar-thin relative z-10"
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
          isMethodMode={autocomplete.isMethodMode}
          currentPlaceholder={autocomplete.currentPlaceholder}
          isInsideArray={autocomplete.isInsideArray}
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
            {placeholders.map((p) => {
              const parsed = parsePlaceholder(p);
              const baseName = parsed.baseName;
              const isDateTime = dateTimePlaceholderNames.includes(baseName);
              const systemPlaceholder = systemPlaceholders.find(sp => sp.name === baseName);
              const isSystemPlaceholder = systemPlaceholderNames.includes(baseName);
              const hasMethods = parsed.methods.length > 0;
              
              return (
                <span 
                  key={p} 
                  className={cn(
                    "placeholder-tag group relative",
                    isSystemPlaceholder && "border-primary/50 bg-primary/10"
                  )}
                >
                  {`{{${p}}}`}
                  {isSystemPlaceholder && (
                    <span className="ml-1 text-[10px] text-primary">SYS</span>
                  )}
                  {hasMethods && (
                    <span className="ml-1 text-[10px] text-accent-foreground">+{parsed.methods.length}</span>
                  )}
                  {isDateTime && systemPlaceholder && !hasMethods && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button 
                          className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
                          title="Replace with fixed value"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" align="start">
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">Replace with fixed value:</p>
                          <code className="block px-2 py-1 bg-muted rounded text-sm font-mono">
                            {systemPlaceholder.getValue()}
                          </code>
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              const fixedValue = systemPlaceholder.getValue();
                              const regex = new RegExp(`\\{\\{\\s*${p}\\s*\\}\\}`, 'g');
                              onChange(value.replace(regex, fixedValue));
                            }}
                          >
                            Use current value
                          </Button>
                          {(p === 'currentDatetime' || p === 'currentDate' || p === 'timestamp') && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1 text-xs"
                                onClick={() => {
                                  const now = new Date();
                                  now.setHours(now.getHours() + 1);
                                  let fixedValue: string;
                                  if (p === 'timestamp') {
                                    fixedValue = now.getTime().toString();
                                  } else if (p === 'currentDate') {
                                    fixedValue = now.toISOString().slice(0, 10);
                                  } else {
                                    fixedValue = now.toISOString().slice(0, 23);
                                  }
                                  const regex = new RegExp(`\\{\\{\\s*${p}\\s*\\}\\}`, 'g');
                                  onChange(value.replace(regex, fixedValue));
                                }}
                              >
                                +1 hour
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1 text-xs"
                                onClick={() => {
                                  const now = new Date();
                                  now.setDate(now.getDate() + 1);
                                  let fixedValue: string;
                                  if (p === 'timestamp') {
                                    fixedValue = now.getTime().toString();
                                  } else if (p === 'currentDate') {
                                    fixedValue = now.toISOString().slice(0, 10);
                                  } else {
                                    fixedValue = now.toISOString().slice(0, 23);
                                  }
                                  const regex = new RegExp(`\\{\\{\\s*${p}\\s*\\}\\}`, 'g');
                                  onChange(value.replace(regex, fixedValue));
                                }}
                              >
                                +1 day
                              </Button>
                            </div>
                          )}
                          {p === 'currentTime' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full text-xs"
                              onClick={() => {
                                const now = new Date();
                                now.setHours(now.getHours() + 1);
                                const fixedValue = now.toTimeString().slice(0, 8);
                                const regex = new RegExp(`\\{\\{\\s*${p}\\s*\\}\\}`, 'g');
                                onChange(value.replace(regex, fixedValue));
                              }}
                            >
                              +1 hour
                            </Button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
