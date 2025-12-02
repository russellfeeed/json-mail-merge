import { useState, useMemo } from 'react';
import { Wand2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JsonEditor } from '@/components/JsonEditor';
import { CsvEditor } from '@/components/CsvEditor';
import { MergeResults } from '@/components/MergeResults';
import {
  parseCSV,
  extractPlaceholders,
  mergePlaceholders,
  validateJSON,
  formatJSON,
} from '@/lib/jsonMerge';

const Index = () => {
  const [jsonTemplate, setJsonTemplate] = useState('');
  const [csvData, setCsvData] = useState('');

  const jsonValidation = useMemo(() => validateJSON(jsonTemplate), [jsonTemplate]);
  const placeholders = useMemo(() => extractPlaceholders(jsonTemplate), [jsonTemplate]);
  const parsedCsv = useMemo(() => parseCSV(csvData), [csvData]);

  const canMerge = jsonValidation.valid && parsedCsv.rows.length > 0;

  const mergedResults = useMemo(() => {
    if (!canMerge) return [];
    
    const formattedTemplate = formatJSON(jsonTemplate);
    return parsedCsv.rows.map((row) => {
      const merged = mergePlaceholders(formattedTemplate, row);
      return formatJSON(merged);
    });
  }, [jsonTemplate, parsedCsv, canMerge]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wand2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">JSON Mail Merge</h1>
                <p className="text-xs text-muted-foreground">
                  Merge CSV data into JSON templates
                </p>
              </div>
            </div>
            {canMerge && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-medium">{mergedResults.length}</span>
                <span>files ready</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Inputs */}
          <div className="space-y-8">
            {/* JSON Template */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <JsonEditor
                value={jsonTemplate}
                onChange={setJsonTemplate}
                isValid={jsonValidation.valid}
                error={jsonValidation.error}
                placeholders={placeholders}
              />
            </div>

            {/* CSV Data */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <CsvEditor
                value={csvData}
                onChange={setCsvData}
                parsedData={parsedCsv}
                requiredHeaders={placeholders}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            {/* Status Banner */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-medium">Merge Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {!jsonTemplate && 'Add a JSON template to get started'}
                    {jsonTemplate && !jsonValidation.valid && 'Fix JSON errors to continue'}
                    {jsonTemplate && jsonValidation.valid && parsedCsv.rows.length === 0 && 'Add CSV data to merge'}
                    {canMerge && `Ready to generate ${parsedCsv.rows.length} merged JSON files`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${jsonValidation.valid && jsonTemplate ? 'bg-emerald-500' : 'bg-muted'}`} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className={`h-3 w-3 rounded-full ${parsedCsv.rows.length > 0 ? 'bg-emerald-500' : 'bg-muted'}`} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className={`h-3 w-3 rounded-full ${canMerge ? 'bg-primary animate-pulse-glow' : 'bg-muted'}`} />
                </div>
              </div>
            </div>

            {/* Results */}
            {mergedResults.length > 0 ? (
              <div className="bg-card rounded-xl p-6 border border-border">
                <MergeResults results={mergedResults} csvRows={parsedCsv.rows} />
              </div>
            ) : (
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">No Results Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Upload a JSON template with {`{{placeholders}}`} and CSV data to see merged results here.
                  </p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-muted/50 rounded-xl p-6 border border-border">
              <h3 className="font-medium mb-3">How it works</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-mono">1.</span>
                  Upload or paste a JSON template with placeholders like {`{{name}}`}
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-mono">2.</span>
                  Add CSV data with columns matching your placeholders
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-mono">3.</span>
                  Download individual or all merged JSON files
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
