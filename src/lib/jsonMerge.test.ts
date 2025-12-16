import { describe, it, expect } from 'vitest';
import { 
  parseCSV, 
  extractPlaceholders, 
  extractFullPlaceholders, 
  mergePlaceholders, 
  validateJSON, 
  formatJSON 
} from './jsonMerge';

describe('jsonMerge', () => {
  describe('parseCSV', () => {
    it('should parse simple CSV data', () => {
      const csv = 'name,email\nJohn,john@example.com\nJane,jane@example.com';
      const result = parseCSV(csv);
      
      expect(result.headers).toEqual(['name', 'email']);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({ name: 'John', email: 'john@example.com' });
      expect(result.rows[1]).toEqual({ name: 'Jane', email: 'jane@example.com' });
    });

    it('should handle empty CSV', () => {
      const result = parseCSV('');
      expect(result.headers).toEqual(['']);
      expect(result.rows).toEqual([]);
    });

    it('should handle CSV with only headers', () => {
      const result = parseCSV('name,email');
      expect(result.headers).toEqual(['name', 'email']);
      expect(result.rows).toEqual([]);
    });

    it('should handle CSV with quoted values', () => {
      const csv = 'name,description\n"John Doe","A person with, comma"\n"Jane","Normal text"';
      const result = parseCSV(csv);
      
      expect(result.rows[0]).toEqual({ 
        name: 'John Doe', 
        description: 'A person with, comma' 
      });
    });
  });

  describe('extractPlaceholders', () => {
    it('should extract simple placeholders', () => {
      const template = '{"name": "{{name}}", "email": "{{email}}"}';
      const placeholders = extractPlaceholders(template);
      
      expect(placeholders).toEqual(['name', 'email']);
    });

    it('should extract placeholders with methods', () => {
      const template = '{"name": "{{name.toUpperCase()}}", "slug": "{{name.slugify()}}"}';
      const placeholders = extractPlaceholders(template);
      
      expect(placeholders).toEqual(['name']);
    });

    it('should handle no placeholders', () => {
      const template = '{"static": "value"}';
      const placeholders = extractPlaceholders(template);
      
      expect(placeholders).toEqual([]);
    });
  });

  describe('extractFullPlaceholders', () => {
    it('should extract full placeholder syntax', () => {
      const template = '{"name": "{{name.toUpperCase()}}", "email": "{{email}}"}';
      const placeholders = extractFullPlaceholders(template);
      
      expect(placeholders).toEqual(['name.toUpperCase()', 'email']);
    });
  });

  describe('validateJSON', () => {
    it('should validate correct JSON', () => {
      const result = validateJSON('{"name": "test"}');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should detect invalid JSON', () => {
      const result = validateJSON('{"name": test}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle empty string', () => {
      const result = validateJSON('');
      expect(result.valid).toBe(false);
    });
  });

  describe('formatJSON', () => {
    it('should format valid JSON', () => {
      const result = formatJSON('{"name":"test"}');
      expect(result).toBe('{\n  "name": "test"\n}');
    });

    it('should return original for invalid JSON', () => {
      const invalid = '{"name": test}';
      const result = formatJSON(invalid);
      expect(result).toBe(invalid);
    });
  });

  describe('mergePlaceholders', () => {
    it('should merge simple placeholders', () => {
      const template = '{"name": "{{name}}", "email": "{{email}}"}';
      const row = { name: 'John', email: 'john@example.com' };
      
      const result = mergePlaceholders(template, row, {}, {}, []);
      
      expect(result).toContain('"name": "John"');
      expect(result).toContain('"email": "john@example.com"');
    });

    it('should handle missing placeholders', () => {
      const template = '{"name": "{{name}}", "missing": "{{missing}}"}';
      const row = { name: 'John' };
      
      const result = mergePlaceholders(template, row, {}, {}, []);
      
      expect(result).toContain('"name": "John"');
      expect(result).toContain('"missing": "{{missing}}"');
    });
  });
});