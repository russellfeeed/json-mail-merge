/**
 * Determines if a cursor position is inside a JSON array structure.
 * This parses the text character by character, tracking bracket depth
 * while properly handling string literals.
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
 * Finds all row input placeholders that are positioned outside of array structures.
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

/**
 * Finds all array regions in JSON text for visual highlighting.
 * Returns an array of { start, end } positions for each array bracket pair.
 */
export function findArrayRegions(text: string): { start: number; end: number }[] {
  const regions: { start: number; end: number }[] = [];
  const stack: number[] = [];
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < text.length; i++) {
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
      if (char === '[') {
        stack.push(i);
      } else if (char === ']' && stack.length > 0) {
        const start = stack.pop()!;
        regions.push({ start, end: i + 1 });
      }
    }
  }
  
  return regions;
}
