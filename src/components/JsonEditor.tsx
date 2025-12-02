import { useCallback } from 'react';
import { Upload, FileJson, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  error?: string;
  placeholders: string[];
}

export function JsonEditor({ value, onChange, isValid, error, placeholders }: JsonEditorProps) {
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

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`{\n  "name": "{{name}}",\n  "email": "{{email}}",\n  "message": "Hello {{name}}!"\n}`}
        className="code-editor w-full min-h-[250px] resize-y bg-muted border border-border rounded-lg p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring scrollbar-thin"
        spellCheck={false}
      />

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
              <span key={p} className="placeholder-tag">
                {`{{${p}}}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
