import { describe, it, expect } from 'vitest';
import { applyMethods, getAvailableMethods, getMethodNames, parsePlaceholder } from './placeholderMethods';

describe('placeholderMethods', () => {
  describe('applyMethods', () => {
    it('should apply toUpperCase method', () => {
      const result = applyMethods('hello world', ['toUpperCase']);
      expect(result).toBe('HELLO WORLD');
    });

    it('should apply toLowerCase method', () => {
      const result = applyMethods('HELLO WORLD', ['toLowerCase']);
      expect(result).toBe('hello world');
    });

    it('should apply capitalize method', () => {
      const result = applyMethods('hello world', ['capitalize']);
      expect(result).toBe('Hello world');
    });

    it('should apply titleCase method', () => {
      const result = applyMethods('hello world', ['titleCase']);
      expect(result).toBe('Hello World');
    });

    it('should apply slugify method', () => {
      const result = applyMethods('Hello World!', ['slugify']);
      expect(result).toBe('hello-world');
    });

    it('should apply trim method', () => {
      const result = applyMethods('  hello world  ', ['trim']);
      expect(result).toBe('hello world');
    });

    it('should apply reverse method', () => {
      const result = applyMethods('hello', ['reverse']);
      expect(result).toBe('olleh');
    });

    it('should apply length method', () => {
      const result = applyMethods('hello', ['length']);
      expect(result).toBe('5');
    });

    it('should chain multiple methods', () => {
      const result = applyMethods('  Hello World  ', ['trim', 'toLowerCase', 'slugify']);
      expect(result).toBe('hello-world');
    });

    it('should handle unknown methods gracefully', () => {
      const result = applyMethods('hello', ['unknownMethod']);
      expect(result).toBe('hello');
    });

    it('should handle empty method array', () => {
      const result = applyMethods('hello', []);
      expect(result).toBe('hello');
    });
  });

  describe('parsePlaceholder', () => {
    it('should parse placeholder with methods', () => {
      const result = parsePlaceholder('{{name.toUpperCase().trim()}}');
      expect(result.baseName).toBe('name');
      expect(result.methods).toEqual(['toUpperCase', 'trim']);
    });

    it('should parse placeholder without methods', () => {
      const result = parsePlaceholder('{{name}}');
      expect(result.baseName).toBe('name');
      expect(result.methods).toEqual([]);
    });
  });

  describe('getAvailableMethods', () => {
    it('should return array of available methods', () => {
      const methods = getAvailableMethods();
      
      expect(Array.isArray(methods)).toBe(true);
      expect(methods.length).toBeGreaterThan(0);
      
      // Check for expected methods
      const methodNames = methods.map(m => m.name);
      expect(methodNames).toContain('toUpperCase()');
      expect(methodNames).toContain('toLowerCase()');
      expect(methodNames).toContain('capitalize()');
      expect(methodNames).toContain('titleCase()');
      expect(methodNames).toContain('slugify()');
    });

    it('should return methods with descriptions', () => {
      const methods = getAvailableMethods();
      
      methods.forEach(method => {
        expect(method).toHaveProperty('name');
        expect(method).toHaveProperty('description');
        expect(typeof method.name).toBe('string');
        expect(typeof method.description).toBe('string');
      });
    });
  });

  describe('getMethodNames', () => {
    it('should return array of method names', () => {
      const names = getMethodNames();
      
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
      
      expect(names).toContain('toUpperCase');
      expect(names).toContain('toLowerCase');
      expect(names).toContain('capitalize');
    });
  });
});