import { describe, it, expect } from 'vitest';
import { isInsideJsonArray, findRowInputsOutsideArrays } from './jsonArrayDetection';

describe('jsonArrayDetection', () => {
  describe('isInsideJsonArray', () => {
    it('should detect position inside array', () => {
      const json = '{"users": [{"name": "test"}]}';
      const position = json.indexOf('"test"');
      const result = isInsideJsonArray(json, position);
      
      expect(result).toBe(true);
    });

    it('should detect position outside array', () => {
      const json = '{"name": "test", "users": []}';
      const position = json.indexOf('"test"');
      const result = isInsideJsonArray(json, position);
      
      expect(result).toBe(false);
    });

    it('should handle nested arrays', () => {
      const json = '{"data": {"users": [{"profile": {"name": "test"}}]}}';
      const position = json.indexOf('"test"');
      const result = isInsideJsonArray(json, position);
      
      expect(result).toBe(true);
    });

    it('should handle multiple arrays', () => {
      const json = '{"users": [{"name": "user"}], "posts": [{"title": "post"}]}';
      
      const userPos = json.indexOf('"user"');
      const postPos = json.indexOf('"post"');
      
      expect(isInsideJsonArray(json, userPos)).toBe(true);
      expect(isInsideJsonArray(json, postPos)).toBe(true);
    });

    it('should handle position at start', () => {
      const json = '{"name": "John"}';
      const result = isInsideJsonArray(json, 0);
      
      expect(result).toBe(false);
    });

    it('should handle position beyond string length', () => {
      const json = '{"name": "test"}';
      const result = isInsideJsonArray(json, 1000);
      
      expect(result).toBe(false);
    });
  });

  describe('findRowInputsOutsideArrays', () => {
    it('should find row inputs outside arrays', () => {
      const json = '{"name": "{{rowInputString}}", "users": [{"id": "{{rowInputNumber}}"}]}';
      const result = findRowInputsOutsideArrays(json);
      
      expect(result).toHaveLength(1);
      expect(result[0].placeholder).toBe('rowInputString');
    });

    it('should return empty array when all row inputs are inside arrays', () => {
      const json = '{"users": [{"name": "{{rowInputString}}", "id": "{{rowInputNumber}}"}]}';
      const result = findRowInputsOutsideArrays(json);
      
      expect(result).toHaveLength(0);
    });

    it('should handle no row inputs', () => {
      const json = '{"name": "{{regularPlaceholder}}"}';
      const result = findRowInputsOutsideArrays(json);
      
      expect(result).toHaveLength(0);
    });

    it('should handle invalid JSON', () => {
      const json = '{"name": invalid}';
      const result = findRowInputsOutsideArrays(json);
      
      expect(result).toHaveLength(0);
    });

    it('should handle empty JSON', () => {
      const result = findRowInputsOutsideArrays('');
      expect(result).toHaveLength(0);
    });
  });
});