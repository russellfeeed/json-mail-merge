import { describe, it, expect } from 'vitest';
import { 
  buildMethodSuggestions,
  buildSystemSuggestions,
  buildUserInputSuggestions,
  buildRowInputSuggestions,
  buildCsvHeaderSuggestions,
  buildAllSuggestions,
  filterSuggestions
} from './placeholderSuggestions';

describe('placeholderSuggestions', () => {
  describe('buildMethodSuggestions', () => {
    it('should build method suggestions', () => {
      const suggestions = buildMethodSuggestions();
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Check structure of suggestions
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('name');
        expect(suggestion).toHaveProperty('displayName');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('isMethod');
      });
    });
  });

  describe('buildSystemSuggestions', () => {
    it('should build system placeholder suggestions', () => {
      const suggestions = buildSystemSuggestions();
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Should include common system placeholders
      const names = suggestions.map(s => s.name);
      expect(names).toContain('uuid');
      expect(names).toContain('currentDatetime');
    });
  });

  describe('buildUserInputSuggestions', () => {
    it('should build user input suggestions', () => {
      const suggestions = buildUserInputSuggestions();
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('buildRowInputSuggestions', () => {
    it('should build row input suggestions', () => {
      const suggestions = buildRowInputSuggestions();
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('buildCsvHeaderSuggestions', () => {
    it('should build CSV header suggestions', () => {
      const headers = ['name', 'email', 'role'];
      const suggestions = buildCsvHeaderSuggestions(headers);
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(3);
      
      const names = suggestions.map(s => s.name);
      expect(names).toContain('name');
      expect(names).toContain('email');
      expect(names).toContain('role');
    });

    it('should handle empty headers', () => {
      const suggestions = buildCsvHeaderSuggestions([]);
      expect(suggestions).toEqual([]);
    });
  });

  describe('buildAllSuggestions', () => {
    it('should combine all suggestion types', () => {
      const csvHeaders = ['name', 'email'];
      const suggestions = buildAllSuggestions(csvHeaders);
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should handle undefined CSV headers', () => {
      const suggestions = buildAllSuggestions([]);
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('filterSuggestions', () => {
    it('should filter suggestions by query', () => {
      const allSuggestions = buildAllSuggestions(['name', 'email']);
      const filtered = filterSuggestions(allSuggestions, 'name');
      
      expect(Array.isArray(filtered)).toBe(true);
      
      // All results should contain 'name'
      filtered.forEach(suggestion => {
        expect(suggestion.name.toLowerCase()).toContain('name');
      });
    });

    it('should return all suggestions for empty query', () => {
      const allSuggestions = buildAllSuggestions(['name']);
      const filtered = filterSuggestions(allSuggestions, '');
      
      expect(filtered).toEqual(allSuggestions);
    });

    it('should handle filtering', () => {
      const allSuggestions = buildAllSuggestions(['name', 'email']);
      const filtered = filterSuggestions(allSuggestions, '');
      
      // Empty query should return all suggestions
      expect(filtered.length).toBe(allSuggestions.length);
    });
  });
});