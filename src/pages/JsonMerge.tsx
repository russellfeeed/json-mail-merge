import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Wand2, ArrowRight, ArrowLeft, Sparkles, List, Trash2, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JsonEditor } from '@/components/JsonEditor';
import { CsvEditor } from '@/components/CsvEditor';
import { MergeResults } from '@/components/MergeResults';
import { AppTour, AppTourRef } from '@/components/AppTour';
import { UserInputPrompt } from '@/components/UserInputPrompt';
import { RowInputPrompt } from '@/components/RowInputPrompt';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseCSV, extractPlaceholders, extractFullPlaceholders, mergePlaceholders, validateJSON, formatJSON } from '@/lib/jsonMerge';
import { resolveSystemPlaceholders, getSystemPlaceholderNames, getUserInputPlaceholderNames, getRowInputPlaceholderNames, userInputPlaceholders, rowInputPlaceholders } from '@/lib/systemPlaceholders';
import { findArraysInJson, mergeAsArray } from '@/lib/arrayMerge';
import { findRowInputsOutsideArrays } from '@/lib/jsonArrayDetection';

const sampleJsonTemplate = `{
  "id": "{{uuid}}",
  "name": "{{name}}",
  "nameUpper": "{{name.toUpperCase()}}",
  "email": "{{email}}",
  "emailSlug": "{{email.slugify()}}",
  "role": "{{role.capitalize()}}",
  "createdAt": "{{currentDatetime}}",
  "active": true
}`;

const sampleArrayTemplate = `{
  "generatedAt": "{{currentDatetime}}",
  "users": [
    {
      "id": "{{uuid}}",
      "name": "{{name.titleCase()}}",
      "email": "{{email.toLowerCase()}}",
      "role": "{{role.toUpperCase()}}",
      "slug": "{{name.slugify()}}"
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
  const [userInputValues, setUserInputValues] = useState<Record<string, string>>({});
  const [rowInputValues, setRowInputValues] = useState<Record<number, Record<string, string>>>({});
  const tourRef = useRef<AppTourRef>(null);

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
  const fullPlaceholders = useMemo(() => extractFullPlaceholders(jsonTemplate), [jsonTemplate]);
  const systemPlaceholderNames = useMemo(() => getSystemPlaceholderNames(), []);
  const userInputPlaceholderNames = useMemo(() => getUserInputPlaceholderNames(), []);
  const rowInputPlaceholderNames = useMemo(() => getRowInputPlaceholderNames(), []);
  const allSystemNames = useMemo(() => [...systemPlaceholderNames, ...userInputPlaceholderNames, ...rowInputPlaceholderNames], [systemPlaceholderNames, userInputPlaceholderNames, rowInputPlaceholderNames]);
  const csvPlaceholders = useMemo(() => placeholders.filter(p => !allSystemNames.includes(p)), [placeholders, allSystemNames]);
  const parsedCsv = useMemo(() => parseCSV(csvData), [csvData]);
  
  // Detect which user input placeholders are used
  const requiredUserInputs = useMemo(() => {
    return placeholders.filter(p => userInputPlaceholderNames.includes(p));
  }, [placeholders, userInputPlaceholderNames]);

  // Detect which row input placeholders are used
  const requiredRowInputs = useMemo(() => {
    return placeholders.filter(p => rowInputPlaceholderNames.includes(p));
  }, [placeholders, rowInputPlaceholderNames]);

  // Validate row inputs are inside arrays
  const rowInputPlacementErrors = useMemo(() => {
    if (!jsonTemplate || requiredRowInputs.length === 0) return [];
    return findRowInputsOutsideArrays(jsonTemplate);
  }, [jsonTemplate, requiredRowInputs]);

  const hasRowInputPlacementErrors = rowInputPlacementErrors.length > 0;

  // Get number placeholder names for proper JSON formatting
  const numberPlaceholderNames = useMemo(() => {
    const userNumbers = userInputPlaceholders.filter(p => p.type === 'number').map(p => p.name);
    const rowNumbers = rowInputPlaceholders.filter(p => p.type === 'number').map(p => p.name);
    return [...userNumbers, ...rowNumbers];
  }, []);

  // Check if all user inputs are valid
  const userInputsValid = useMemo(() => {
    return requiredUserInputs.every(inputName => {
      const value = userInputValues[inputName];
      if (!value) return false;
      const config = userInputPlaceholders.find(p => p.name === inputName);
      if (config?.type === 'number') {
        return !isNaN(Number(value)) && value.trim() !== '';
      }
      return true;
    });
  }, [requiredUserInputs, userInputValues]);

  // Check if all row inputs are valid
  const rowInputsValid = useMemo(() => {
    if (requiredRowInputs.length === 0) return true;
    return parsedCsv.rows.every((_, rowIndex) => {
      return requiredRowInputs.every(inputName => {
        const value = rowInputValues[rowIndex]?.[inputName];
        if (!value) return false;
        const config = rowInputPlaceholders.find(p => p.name === inputName);
        if (config?.type === 'number') {
          return !isNaN(Number(value)) && value.trim() !== '';
        }
        return true;
      });
    });
  }, [requiredRowInputs, rowInputValues, parsedCsv.rows]);
  
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

  const canMerge = jsonValidation.valid && parsedCsv.rows.length > 0 && (!arrayMode || selectedArrayPath) && (requiredUserInputs.length === 0 || userInputsValid) && (requiredRowInputs.length === 0 || rowInputsValid) && !hasRowInputPlacementErrors;

  const mergedResults = useMemo(() => {
    if (!canMerge) return [];
    
    if (arrayMode && selectedArrayPath) {
      const result = mergeAsArray(jsonTemplate, parsedCsv.rows, selectedArrayPath, userInputValues, rowInputValues, numberPlaceholderNames);
      return [result];
    }
    
    const formattedTemplate = formatJSON(jsonTemplate);
    return parsedCsv.rows.map((row, rowIndex) => {
      const rowInputs = rowInputValues[rowIndex] || {};
      const merged = mergePlaceholders(formattedTemplate, row, userInputValues, rowInputs, numberPlaceholderNames);
      const withSystemPlaceholders = resolveSystemPlaceholders(merged);
      return formatJSON(withSystemPlaceholders);
    });
  }, [jsonTemplate, parsedCsv, canMerge, arrayMode, selectedArrayPath, userInputValues, rowInputValues, numberPlaceholderNames]);

  const resultCount = arrayMode ? 1 : mergedResults.length;

  return <div className="min-h-screen bg-background">
      <AppTour ref={tourRef} />
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors" title="Back to Tools">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Link>
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
              <Button variant="ghost" size="sm" onClick={() => tourRef.current?.startTour()}>
                <HelpCircle className="h-4 w-4 mr-1" />
                Take Tour
              </Button>
              <Button variant="outline" size="sm" onClick={loadExample} data-tour="load-example">
                <Sparkles className="h-4 w-4 mr-1" />
                Load Example
              </Button>
              {(jsonTemplate || csvData) && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
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
              <JsonEditor value={jsonTemplate} onChange={setJsonTemplate} isValid={jsonValidation.valid} error={jsonValidation.error} placeholders={fullPlaceholders} csvHeaders={parsedCsv.headers} />
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

            {/* User Inputs Section */}
            {requiredUserInputs.length > 0 && (
              <UserInputPrompt
                requiredInputs={requiredUserInputs}
                values={userInputValues}
                onChange={setUserInputValues}
              />
            )}

            {/* Row Input Placement Error */}
            {hasRowInputPlacementErrors && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-destructive">Invalid Placeholder Position</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Row input placeholders can only be used inside JSON arrays.
                      Move the following to an array structure:
                    </p>
                    <ul className="mt-2 space-y-1">
                      {rowInputPlacementErrors.map((err, i) => (
                        <li key={i} className="text-sm font-mono text-destructive">
                          {`{{${err.placeholder}}}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Row Inputs Section - only show if properly placed */}
            {requiredRowInputs.length > 0 && parsedCsv.rows.length > 0 && !hasRowInputPlacementErrors && (
              <RowInputPrompt
                requiredInputs={requiredRowInputs}
                csvRows={parsedCsv.rows}
                values={rowInputValues}
                onChange={setRowInputValues}
              />
            )}

            {/* Status Banner */}
            <div className="bg-card rounded-xl p-6 border border-border" data-tour="merge-status">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-medium">Merge Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {!jsonTemplate && 'Add a JSON template to get started'}
                    {jsonTemplate && !jsonValidation.valid && 'Fix JSON errors to continue'}
                    {jsonTemplate && jsonValidation.valid && parsedCsv.rows.length === 0 && 'Add CSV data to merge'}
                    {jsonTemplate && jsonValidation.valid && parsedCsv.rows.length > 0 && arrayMode && !selectedArrayPath && 'Select an array to populate'}
                    {jsonTemplate && jsonValidation.valid && parsedCsv.rows.length > 0 && requiredUserInputs.length > 0 && !userInputsValid && 'Fill in required user inputs'}
                    {jsonTemplate && jsonValidation.valid && parsedCsv.rows.length > 0 && userInputsValid && requiredRowInputs.length > 0 && !rowInputsValid && !hasRowInputPlacementErrors && 'Fill in row inputs for each CSV row'}
                    {jsonTemplate && jsonValidation.valid && hasRowInputPlacementErrors && 'Row input placeholders must be inside arrays'}
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
            {mergedResults.length > 0 ? <div className="bg-card rounded-xl p-6 border border-border" data-tour="results">
                <MergeResults results={mergedResults} csvRows={arrayMode ? [{ _arrayMode: 'combined' }] : parsedCsv.rows} />
              </div> : <div className="bg-card rounded-xl p-6 border border-border" data-tour="results">
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
    </div>;
};
export default Index;
