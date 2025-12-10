import { parsePlaceholder, applyMethods } from './placeholderMethods';

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCSV(csvText: string): ParsedCSV {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse headers
  const headers = parseCSVLine(lines[0]);
  
  // Parse rows
  const rows = lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });

  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let wasQuoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        if (inQuotes) {
          wasQuoted = true;
        }
      }
    } else if (char === ',' && !inQuotes) {
      // Only trim unquoted fields
      result.push(wasQuoted ? current : current.trim());
      current = '';
      wasQuoted = false;
    } else {
      current += char;
    }
  }
  
  // Only trim unquoted fields
  result.push(wasQuoted ? current : current.trim());
  return result;
}

// Extract placeholders and return base names for CSV matching
export function extractPlaceholders(jsonString: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = new Set<string>();
  let match;
  
  while ((match = regex.exec(jsonString)) !== null) {
    const parsed = parsePlaceholder(match[1].trim());
    matches.add(parsed.baseName);
  }
  
  return Array.from(matches);
}

// Extract full placeholders including methods
export function extractFullPlaceholders(jsonString: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = new Set<string>();
  let match;
  
  while ((match = regex.exec(jsonString)) !== null) {
    matches.add(match[1].trim());
  }
  
  return Array.from(matches);
}

export function mergePlaceholders(
  jsonTemplate: string,
  data: Record<string, string>,
  userInputs?: Record<string, string>,
  rowInputs?: Record<string, string>,
  numberPlaceholders?: string[]
): string {
  let result = jsonTemplate;
  const allData = { ...data, ...userInputs, ...rowInputs };
  
  // Find all placeholders with their methods
  const regex = /\{\{([^}]+)\}\}/g;
  const placeholders: { full: string; baseName: string; methods: string[] }[] = [];
  let match;
  
  while ((match = regex.exec(jsonTemplate)) !== null) {
    const parsed = parsePlaceholder(match[1].trim());
    placeholders.push(parsed);
  }
  
  // Replace each placeholder
  for (const placeholder of placeholders) {
    const value = allData[placeholder.baseName];
    if (value !== undefined) {
      const transformedValue = applyMethods(value, placeholder.methods);
      const isNumberPlaceholder = numberPlaceholders?.includes(placeholder.baseName);
      
      // Build regex for this placeholder
      const escapedBase = escapeRegex(placeholder.baseName);
      const methodsPattern = placeholder.methods.length > 0
        ? `\\.${placeholder.methods.map(m => escapeRegex(m) + '\\(\\)').join('\\.')}`
        : '';
      
      // For number placeholders, also match quoted versions and replace with unquoted number
      if (isNumberPlaceholder && !isNaN(Number(transformedValue))) {
        // Match both quoted and unquoted placeholder
        const quotedRegex = new RegExp(`"\\{\\{\\s*${escapedBase}${methodsPattern}\\s*\\}\\}"`, 'g');
        const unquotedRegex = new RegExp(`\\{\\{\\s*${escapedBase}${methodsPattern}\\s*\\}\\}`, 'g');
        result = result.replace(quotedRegex, transformedValue);
        result = result.replace(unquotedRegex, transformedValue);
      } else {
        // For string placeholders, escape JSON special characters
        const escapedValue = escapeJsonString(transformedValue);
        const placeholderRegex = new RegExp(`\\{\\{\\s*${escapedBase}${methodsPattern}\\s*\\}\\}`, 'g');
        result = result.replace(placeholderRegex, escapedValue);
      }
    }
  }
  
  return result;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeJsonString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/"/g, '\\"')    // Escape double quotes
    .replace(/\n/g, '\\n')   // Escape newlines
    .replace(/\r/g, '\\r')   // Escape carriage returns
    .replace(/\t/g, '\\t')   // Escape tabs
    .replace(/\f/g, '\\f')   // Escape form feeds
    .replace(/\x08/g, '\\b'); // Escape actual backspace characters (ASCII 8)
}

export function validateJSON(jsonString: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

export function formatJSON(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
}
