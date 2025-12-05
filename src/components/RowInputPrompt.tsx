import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RowsIcon, CheckCircle2 } from 'lucide-react';
import { rowInputPlaceholders } from '@/lib/systemPlaceholders';

interface RowInputPromptProps {
  requiredInputs: string[];
  csvRows: Record<string, string>[];
  values: Record<number, Record<string, string>>;
  onChange: (values: Record<number, Record<string, string>>) => void;
}

export function RowInputPrompt({ requiredInputs, csvRows, values, onChange }: RowInputPromptProps) {
  const handleInputChange = (rowIndex: number, inputName: string, value: string) => {
    onChange({
      ...values,
      [rowIndex]: {
        ...(values[rowIndex] || {}),
        [inputName]: value
      }
    });
  };

  const getRowContext = (row: Record<string, string>) => {
    const keys = Object.keys(row).slice(0, 2);
    return keys.map(k => row[k]).filter(Boolean).join(', ');
  };

  const isNumberInput = (inputName: string) => {
    return rowInputPlaceholders.find(p => p.name === inputName)?.type === 'number';
  };

  const isValidNumber = (value: string) => {
    return value !== '' && !isNaN(Number(value));
  };

  const isRowComplete = (rowIndex: number) => {
    return requiredInputs.every(inputName => {
      const value = values[rowIndex]?.[inputName];
      if (!value) return false;
      if (isNumberInput(inputName)) {
        return isValidNumber(value);
      }
      return true;
    });
  };

  const completedRows = csvRows.filter((_, i) => isRowComplete(i)).length;

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RowsIcon className="h-5 w-5 text-primary" />
            <Label className="font-medium">Row Inputs</Label>
          </div>
          <span className="text-xs text-muted-foreground">
            {completedRows}/{csvRows.length} rows complete
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter values for each row. These will be merged individually with each CSV row.
        </p>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Row Context</TableHead>
                {requiredInputs.map(inputName => (
                  <TableHead key={inputName}>
                    <span className="font-mono text-primary text-xs">{`{{${inputName}}}`}</span>
                  </TableHead>
                ))}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="text-muted-foreground text-xs">{rowIndex + 1}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-32 truncate">
                    {getRowContext(row)}
                  </TableCell>
                  {requiredInputs.map(inputName => {
                    const isNumber = isNumberInput(inputName);
                    const value = values[rowIndex]?.[inputName] || '';
                    const hasError = isNumber && value && !isValidNumber(value);
                    
                    return (
                      <TableCell key={inputName}>
                        <Input
                          type={isNumber ? 'number' : 'text'}
                          value={value}
                          onChange={(e) => handleInputChange(rowIndex, inputName, e.target.value)}
                          placeholder={isNumber ? '0' : 'Enter value...'}
                          className={`h-8 text-sm ${hasError ? 'border-destructive' : ''}`}
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    {isRowComplete(rowIndex) && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}