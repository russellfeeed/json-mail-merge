/**
 * Detects if a cursor position is inside a JSON array
 */
export function isInsideJsonArray(text: string, cursorPosition: number): boolean {
  let arrayDepth = 0;
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < cursorPosition && i < text.length; i++) {
    const char = text[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '[') arrayDepth++;
      if (char === ']') arrayDepth = Math.max(0, arrayDepth - 1);
    }
  }
  
  return arrayDepth > 0;
}

/**
 * Finds all row input placeholders that are placed outside of JSON arrays
 */
export function findRowInputsOutsideArrays(jsonText: string): { placeholder: string; position: number }[] {
  const errors: { placeholder: string; position: number }[] = [];
  const regex = /\{\{(rowInput(?:String|Number)(?:\.[^}]*)?)\}\}/g;
  let match;
  
  while ((match = regex.exec(jsonText)) !== null) {
    if (!isInsideJsonArray(jsonText, match.index)) {
      errors.push({
        placeholder: match[1],
        position: match.index
      });
    }
  }
  
  return errors;
}
