import { useCallback, useState } from 'react';
import { Upload, Table, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ParsedCSV } from '@/lib/jsonMerge';

interface CsvEditorProps {
  value: string;
  onChange: (value: string) => void;
  parsedData: ParsedCSV;
  requiredHeaders: string[];
}

export function CsvEditor({ value, onChange, parsedData, requiredHeaders }: CsvEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('text');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
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
    const blob = new Blob([value], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [value]);

  const generateSampleCSV = () => {
    if (requiredHeaders.length === 0) return;
    const headers = requiredHeaders.join(',');
    const sampleRow = requiredHeaders.map((h) => `sample_${h}`).join(',');
    onChange(`${headers}\n${sampleRow}`);
  };

  const missingHeaders = requiredHeaders.filter(
    (h) => !parsedData.headers.includes(h)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">CSV Data</h2>
        </div>
        <div className="flex items-center gap-2">
          {value && (
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          {requiredHeaders.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={generateSampleCSV}
            >
              Generate Sample
            </Button>
          )}
        </div>
      </div>

      <div
        className="drop-zone cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('csv-upload')?.click()}
      >
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drop a CSV file here or click to upload
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Raw Text</TabsTrigger>
          <TabsTrigger value="preview" disabled={parsedData.rows.length === 0}>
            Preview ({parsedData.rows.length} rows)
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="mt-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={requiredHeaders.length > 0 
              ? `${requiredHeaders.join(',')}\nvalue1,value2,...`
              : 'name,email\nJohn,john@example.com\nJane,jane@example.com'
            }
            className="code-editor w-full min-h-[200px] resize-y bg-muted border border-border rounded-lg p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring scrollbar-thin"
            spellCheck={false}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div className="overflow-auto rounded-lg border border-border max-h-[300px] scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="bg-secondary sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    #
                  </th>
                  {parsedData.headers.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      <span className={requiredHeaders.includes(header) ? 'text-primary' : 'text-muted-foreground'}>
                        {header}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parsedData.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    {parsedData.headers.map((header) => (
                      <td key={header} className="px-4 py-2 font-mono text-xs">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {missingHeaders.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-400">
            Missing columns: {missingHeaders.map(h => `{{${h}}}`).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
