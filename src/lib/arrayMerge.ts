import { mergePlaceholders } from './jsonMerge';
import { resolveSystemPlaceholders } from './systemPlaceholders';

export interface ArrayPath {
  path: string;
  preview: string;
}

export function findArraysInJson(jsonString: string): ArrayPath[] {
  try {
    const obj = JSON.parse(jsonString);
    const arrays: ArrayPath[] = [];
    
    function traverse(current: any, path: string) {
      if (Array.isArray(current) && current.length > 0) {
        arrays.push({
          path,
          preview: JSON.stringify(current[0]).slice(0, 50) + (JSON.stringify(current[0]).length > 50 ? '...' : '')
        });
      }
      
      if (typeof current === 'object' && current !== null) {
        for (const key of Object.keys(current)) {
          const newPath = path ? `${path}.${key}` : key;
          traverse(current[key], newPath);
        }
      }
    }
    
    traverse(obj, '');
    return arrays;
  } catch {
    return [];
  }
}

export function mergeAsArray(
  jsonTemplate: string,
  rows: Record<string, string>[],
  arrayPath: string,
  userInputs?: Record<string, string>,
  rowInputValues?: Record<number, Record<string, string>>,
  numberPlaceholders?: string[]
): string {
  try {
    const templateObj = JSON.parse(jsonTemplate);
    
    // Get the array template item
    const pathParts = arrayPath.split('.');
    let arrayContainer = templateObj;
    for (let i = 0; i < pathParts.length - 1; i++) {
      arrayContainer = arrayContainer[pathParts[i]];
    }
    
    const arrayKey = pathParts[pathParts.length - 1];
    const itemTemplate = JSON.stringify(arrayContainer[arrayKey][0]);
    
    // Generate array items for each row
    const items = rows.map((row, rowIndex) => {
      const rowInputs = rowInputValues?.[rowIndex] || {};
      let merged = mergePlaceholders(itemTemplate, row, userInputs, rowInputs, numberPlaceholders);
      merged = resolveSystemPlaceholders(merged);
      return JSON.parse(merged);
    });
    
    // Replace the array with merged items
    arrayContainer[arrayKey] = items;
    
    // Resolve any system placeholders in the rest of the template
    let result = JSON.stringify(templateObj, null, 2);
    result = resolveSystemPlaceholders(result);
    
    return result;
  } catch (e) {
    console.error('Array merge error:', e);
    return jsonTemplate;
  }
}
