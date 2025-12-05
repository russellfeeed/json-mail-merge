import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Keyboard, Hash, AlertCircle } from 'lucide-react';
import { userInputPlaceholders } from '@/lib/systemPlaceholders';

interface UserInputPromptProps {
  requiredInputs: string[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function UserInputPrompt({ requiredInputs, values, onChange }: UserInputPromptProps) {
  const handleChange = (name: string, value: string) => {
    onChange({ ...values, [name]: value });
  };

  const getPlaceholderConfig = (name: string) => {
    return userInputPlaceholders.find(p => p.name === name);
  };

  const isValidNumber = (value: string) => {
    if (!value) return true;
    return !isNaN(Number(value)) && value.trim() !== '';
  };

  if (requiredInputs.length === 0) return null;

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Keyboard className="h-5 w-5 text-primary" />
        <h3 className="font-medium">User Inputs</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        These values will be applied to all rows during merge
      </p>
      <div className="space-y-4">
        {requiredInputs.map(inputName => {
          const config = getPlaceholderConfig(inputName);
          const isNumber = config?.type === 'number';
          const value = values[inputName] || '';
          const hasError = isNumber && value && !isValidNumber(value);

          return (
            <div key={inputName} className="space-y-2">
              <div className="flex items-center gap-2">
                {isNumber ? (
                  <Hash className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Keyboard className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor={inputName} className="font-mono text-sm">
                  {`{{${inputName}}}`}
                </Label>
                <span className="text-xs text-muted-foreground">
                  ({isNumber ? 'number' : 'text'})
                </span>
              </div>
              <Input
                id={inputName}
                type={isNumber ? 'text' : 'text'}
                inputMode={isNumber ? 'decimal' : 'text'}
                placeholder={isNumber ? 'Enter a number...' : 'Enter text...'}
                value={value}
                onChange={(e) => handleChange(inputName, e.target.value)}
                className={hasError ? 'border-destructive' : ''}
              />
              {hasError && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>Please enter a valid number</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
