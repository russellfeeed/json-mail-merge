import { parsePlaceholder, applyMethods } from './placeholderMethods';

export interface SystemPlaceholder {
  name: string;
  description: string;
  getValue: () => string;
}

export interface UserInputPlaceholder {
  name: string;
  description: string;
  type: 'string' | 'number';
}

export const systemPlaceholders: SystemPlaceholder[] = [
  {
    name: 'currentDatetime',
    description: 'Current datetime (YYYY-MM-DDTHH:mm:ss.SSS)',
    getValue: () => {
      const now = new Date();
      return now.toISOString().slice(0, 23);
    }
  },
  {
    name: 'currentDate',
    description: 'Current date (YYYY-MM-DD)',
    getValue: () => {
      const now = new Date();
      return now.toISOString().slice(0, 10);
    }
  },
  {
    name: 'currentTime',
    description: 'Current time (HH:mm:ss)',
    getValue: () => {
      const now = new Date();
      return now.toTimeString().slice(0, 8);
    }
  },
  {
    name: 'timestamp',
    description: 'Unix timestamp in milliseconds',
    getValue: () => Date.now().toString()
  },
  {
    name: 'uuid',
    description: 'Random UUID v4',
    getValue: () => crypto.randomUUID()
  },
  {
    name: 'randomNumber',
    description: 'Random number (0-999999)',
    getValue: () => Math.floor(Math.random() * 1000000).toString()
  }
];

export const userInputPlaceholders: UserInputPlaceholder[] = [
  {
    name: 'userInputString',
    description: 'Prompts for a text input',
    type: 'string'
  },
  {
    name: 'userInputNumber',
    description: 'Prompts for a numeric input',
    type: 'number'
  }
];

export const rowInputPlaceholders: UserInputPlaceholder[] = [
  {
    name: 'rowInputString',
    description: 'Prompts for text input per row',
    type: 'string'
  },
  {
    name: 'rowInputNumber',
    description: 'Prompts for numeric input per row',
    type: 'number'
  }
];

export const dateTimePlaceholderNames = ['currentDatetime', 'currentDate', 'currentTime', 'timestamp'];

export function getSystemPlaceholderNames(): string[] {
  return systemPlaceholders.map(p => p.name);
}

export function getUserInputPlaceholderNames(): string[] {
  return userInputPlaceholders.map(p => p.name);
}

export function getRowInputPlaceholderNames(): string[] {
  return rowInputPlaceholders.map(p => p.name);
}

export function getAllPlaceholderNames(): string[] {
  return [...getSystemPlaceholderNames(), ...getUserInputPlaceholderNames(), ...getRowInputPlaceholderNames()];
}

export function resolveSystemPlaceholders(jsonString: string): string {
  let result = jsonString;
  
  // Find all system placeholders with their methods
  const regex = /\{\{([^}]+)\}\}/g;
  let match;
  
  while ((match = regex.exec(jsonString)) !== null) {
    const parsed = parsePlaceholder(match[1].trim());
    const systemPlaceholder = systemPlaceholders.find(p => p.name === parsed.baseName);
    
    if (systemPlaceholder) {
      let value = systemPlaceholder.getValue();
      value = applyMethods(value, parsed.methods);
      
      // Build the exact regex for this placeholder
      const escapedBase = parsed.baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const methodsPattern = parsed.methods.length > 0
        ? `\\.${parsed.methods.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\(\\)').join('\\.')}`
        : '';
      const placeholderRegex = new RegExp(`\\{\\{\\s*${escapedBase}${methodsPattern}\\s*\\}\\}`, 'g');
      result = result.replace(placeholderRegex, value);
    }
  }
  
  return result;
}
