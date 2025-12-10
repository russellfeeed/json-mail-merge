import { systemPlaceholders, userInputPlaceholders, rowInputPlaceholders } from '@/lib/systemPlaceholders';
import { getAvailableMethods } from '@/lib/placeholderMethods';

export interface Suggestion {
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  isMethod: boolean;
  isUserInput: boolean;
  isRowInput: boolean;
}

export function buildMethodSuggestions(): Suggestion[] {
  return getAvailableMethods().map(m => ({
    name: m.name.replace('()', ''),
    displayName: m.name,
    description: m.description,
    isSystem: false,
    isMethod: true,
    isUserInput: false,
    isRowInput: false
  }));
}

export function buildSystemSuggestions(): Suggestion[] {
  return systemPlaceholders.map(p => ({
    name: p.name,
    displayName: p.name,
    description: p.description,
    isSystem: true,
    isMethod: false,
    isUserInput: false,
    isRowInput: false
  }));
}

export function buildUserInputSuggestions(): Suggestion[] {
  return userInputPlaceholders.map(p => ({
    name: p.name,
    displayName: p.name,
    description: `${p.description} (${p.type})`,
    isSystem: false,
    isMethod: false,
    isUserInput: true,
    isRowInput: false
  }));
}

export function buildRowInputSuggestions(): Suggestion[] {
  return rowInputPlaceholders.map(p => ({
    name: p.name,
    displayName: p.name,
    description: `${p.description} (${p.type}) - Array only`,
    isSystem: false,
    isMethod: false,
    isUserInput: false,
    isRowInput: true
  }));
}

export function buildCsvHeaderSuggestions(csvHeaders: string[]): Suggestion[] {
  return csvHeaders.map(h => ({
    name: h,
    displayName: h,
    description: 'CSV column',
    isSystem: false,
    isMethod: false,
    isUserInput: false,
    isRowInput: false
  }));
}

export function buildAllSuggestions(
  isMethodMode: boolean,
  isInsideArray: boolean,
  csvHeaders: string[]
): Suggestion[] {
  if (isMethodMode) {
    return buildMethodSuggestions();
  }

  return [
    ...buildSystemSuggestions(),
    ...buildUserInputSuggestions(),
    ...(isInsideArray ? buildRowInputSuggestions() : []),
    ...buildCsvHeaderSuggestions(csvHeaders)
  ];
}

export function filterSuggestions(suggestions: Suggestion[], filter: string): Suggestion[] {
  const lowerFilter = filter.toLowerCase();
  return suggestions.filter(s => s.name.toLowerCase().includes(lowerFilter));
}
