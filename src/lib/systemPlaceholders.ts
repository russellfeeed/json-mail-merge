export interface SystemPlaceholder {
  name: string;
  description: string;
  getValue: () => string;
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

export function getSystemPlaceholderNames(): string[] {
  return systemPlaceholders.map(p => p.name);
}

export function resolveSystemPlaceholders(jsonString: string): string {
  let result = jsonString;
  
  for (const placeholder of systemPlaceholders) {
    const regex = new RegExp(`\\{\\{\\s*${placeholder.name}\\s*\\}\\}`, 'g');
    result = result.replace(regex, placeholder.getValue());
  }
  
  return result;
}
