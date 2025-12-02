import { useState } from 'react';
import { Download, Copy, Check, ChevronDown, ChevronRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MergeResultsProps {
  results: string[];
  csvRows: Record<string, string>[];
}

export function MergeResults({ results, csvRows }: MergeResultsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadSingle = (content: string, index: number) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged_${index + 1}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    const combined = results.map((r, i) => ({
      index: i + 1,
      data: JSON.parse(r)
    }));
    const blob = new Blob([JSON.stringify(combined, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged_all.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRowPreview = (row: Record<string, string>) => {
    const entries = Object.entries(row);
    if (entries.length === 0) return 'Row';
    const first = entries[0];
    return `${first[1]}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            Merged Results ({results.length})
          </h2>
        </div>
        <Button onClick={downloadAll} variant="glow" size="sm">
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
        {results.map((result, index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedIndex === index ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  #{index + 1}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getRowPreview(csvRows[index])}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(result, index);
                  }}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSingle(result, index);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                expandedIndex === index ? "max-h-[500px]" : "max-h-0"
              )}
            >
              <pre className="p-4 bg-muted font-mono text-xs overflow-auto max-h-[480px] scrollbar-thin">
                <code>{result}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
