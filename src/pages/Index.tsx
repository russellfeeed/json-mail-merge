import { useState, useMemo, useEffect } from 'react';
import { Wand2, ArrowRight, Sparkles, List, Trash2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JsonEditor } from '@/components/JsonEditor';
import { CsvEditor } from '@/components/CsvEditor';
import { MergeResults } from '@/components/MergeResults';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseCSV, extractPlaceholders, mergePlaceholders, validateJSON, formatJSON } from '@/lib/jsonMerge';
import { resolveSystemPlaceholders, getSystemPlaceholderNames } from '@/lib/systemPlaceholders';
import { findArraysInJson, mergeAsArray } from '@/lib/arrayMerge';
import { GuidedTour, useTour } from '@/components/GuidedTour';

const sampleJsonTemplate = `{
  "id": "{{uuid}}",
  "name": "{{name}}",
  "email": "{{email}}",
  "role": "{{role}}",
  "createdAt": "{{currentDatetime}}",
  "active": true
}`;

const sampleArrayTemplate = `{
  "generatedAt": "{{currentDatetime}}",
  "users": [
    {
      "id": "{{uuid}}",
      "name": "{{name}}",
      "email": "{{email}}",
      "role": "{{role}}"
    }
  ]
}`;

const sampleCsvData = `name,email,role
John Smith,john@example.com,Admin
Jane Doe,jane@example.com,Editor
Bob Wilson,bob@example.com,Viewer`;

const Index = () => {
  const [jsonTemplate, setJsonTemplate] = useState('');
  const [csvData, setCsvData] = useState('');
  const [arrayMode, setArrayMode] = useState(false);
  const [selectedArrayPath, setSelectedArrayPath] = useState<string>('');
  const { showTour, hasSeenTour, startTour, completeTour } = useTour();

  // Show tour on first visit
  useEffect(() => {
    if (!hasSeenTour) {
      const timer = setTimeout(() => startTour(), 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, startTour]);

  const loadExample = () => {
    setJsonTemplate(arrayMode ? sampleArrayTemplate : sampleJsonTemplate);
    setCsvData(sampleCsvData);
  };

  const clearAll = () => {
    setJsonTemplate('');
    setCsvData('');
    setSelectedArrayPath('');
  };

  const jsonValidation = useMemo(() => validateJSON(jsonTemplate), [jsonTemplate]);
  const placeholders = useMemo(() => extractPlaceholders(jsonTemplate), [jsonTemplate]);
  const systemPlaceholderNames = useMemo(() => getSystemPlaceholderNames(), []);
  const csvPlaceholders = useMemo(() => placeholders.filter(p => !systemPlaceholderNames.includes(p)), [placeholders, systemPlaceholderNames]);
  const parsedCsv = useMemo(() => parseCSV(csvData), [csvData]);
  
  const availableArrays = useMemo(() => {
    if (!jsonValidation.valid) return [];
    return findArraysInJson(jsonTemplate);
  }, [jsonTemplate, jsonValidation.valid]);

  // Auto-select first array when available
  useEffect(() => {
    if (arrayMode && availableArrays.length > 0 && !selectedArrayPath) {
      setSelectedArrayPath(availableArrays[0].path);
    }
    if (!arrayMode) {
      setSelectedArrayPath('');
    }
  }, [arrayMode, availableArrays, selectedArrayPath]);

  const canMerge = jsonValidation.valid && parsedCsv.rows.length > 0 && (!arrayMode || selectedArrayPath);

  const mergedResults = useMemo(() => {
    if (!canMerge) return [];
    
    if (arrayMode && selectedArrayPath) {
      const result = mergeAsArray(jsonTemplate, parsedCsv.rows, selectedArrayPath);
      return [result];
    }
    
    const formattedTemplate = formatJSON(jsonTemplate);
    return parsedCsv.rows.map(row => {
      const merged = mergePlaceholders(formattedTemplate, row);
      const withSystemPlaceholders = resolveSystemPlaceholders(merged);
      return formatJSON(withSystemPlaceholders);
    });
  }, [jsonTemplate, parsedCsv, canMerge, arrayMode, selectedArrayPath]);

  const resultCount = arrayMode ? 1 : mergedResults.length;

  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wand2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">JSON Data Merge</h1>
                <p className="text-xs text-muted-foreground">
                  Merge CSV data into JSON templates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={loadExample}>
                <Sparkles className="h-4 w-4 mr-1" />
                Load Example
              </Button>
              {(jsonTemplate || csvData) && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={startTour} title="Start guided tour">
                <HelpCircle className="h-4 w-4" />
              </Button>
              {canMerge && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-medium">{resultCount}</span>
                <span>{resultCount === 1 ? 'file' : 'files'} ready</span>
              </div>}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Inputs */}
          <div className="space-y-8">
            {/* JSON Template */}
            <div className="bg-card rounded-xl p-6 border border-border" data-tour="json-editor">
              <JsonEditor value={jsonTemplate} onChange={setJsonTemplate} isValid={jsonValidation.valid} error={jsonValidation.error} placeholders={placeholders} csvHeaders={parsedCsv.headers} />
            </div>

            {/* CSV Data */}
            <div className="bg-card rounded-xl p-6 border border-border" data-tour="csv-editor">
              <CsvEditor value={csvData} onChange={setCsvData} parsedData={parsedCsv} requiredHeaders={csvPlaceholders} />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            {/* Array Mode Toggle */}
            <div className="bg-card rounded-xl p-6 border border-border" data-tour="array-mode">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <List className="h-5 w-5 text-primary" />
                    <Label htmlFor="array-mode" className="font-medium">Array Mode</Label>
                  </div>
                  <Switch
                    id="array-mode"
                    checked={arrayMode}
                    onCheckedChange={setArrayMode}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {arrayMode 
                    ? 'Generate a single JSON with an array containing all CSV rows'
                    : 'Generate separate JSON files for each CSV row'
                  }
                </p>
                
                {arrayMode && jsonValidation.valid && (
                  <div className="pt-2 border-t border-border">
                    {availableArrays.length > 0 ? (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Select array to populate</Label>
                        <Select value={selectedArrayPath} onValueChange={setSelectedArrayPath}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an array..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableArrays.map(arr => (
                              <SelectItem key={arr.path} value={arr.path}>
                                <span className="font-mono text-primary">{arr.path}</span>
                                <span className="text-muted-foreground ml-2 text-xs">{arr.preview}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-400">
                        No arrays found in template. Add an array with at least one item as a template.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Status Banner */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-medium">Merge Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {!jsonTemplate && 'Add a JSON template to get started'}
                    {jsonTemplate && !jsonValidation.valid && 'Fix JSON errors to continue'}
                    {jsonTemplate && jsonValidation.valid && parsedCsv.rows.length === 0 && 'Add CSV data to merge'}
                    {jsonTemplate && jsonValidation.valid && parsedCsv.rows.length > 0 && arrayMode && !selectedArrayPath && 'Select an array to populate'}
                    {canMerge && (arrayMode 
                      ? `Ready to generate 1 JSON file with ${parsedCsv.rows.length} array items`
                      : `Ready to generate ${parsedCsv.rows.length} merged JSON files`
                    )}
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
            <div data-tour="results">
            {mergedResults.length > 0 ? <div className="bg-card rounded-xl p-6 border border-border">
                <MergeResults results={mergedResults} csvRows={arrayMode ? [{ _arrayMode: 'combined' }] : parsedCsv.rows} />
              </div> : <div className="bg-card rounded-xl p-6 border border-border">
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">No Results Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Upload a JSON template with {`{{placeholders}}`} and CSV data to see merged results here.
                  </p>
                </div>
              </div>}
            </div>

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
                  {arrayMode 
                    ? 'Enable Array Mode to combine all rows into a single JSON array'
                    : 'Download individual or all merged JSON files'
                  }
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      
      {showTour && <GuidedTour onComplete={completeTour} />}
    </div>;
};
export default Index;
