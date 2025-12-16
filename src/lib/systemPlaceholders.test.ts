import { describe, it, expect } from 'vitest';
import { 
  resolveSystemPlaceholders,
  getSystemPlaceholderNames,
  getUserInputPlaceholderNames,
  getRowInputPlaceholderNames,
  getAllPlaceholderNames
} from './systemPlaceholders';

describe('systemPlaceholders', () => {
  describe('resolveSystemPlaceholders', () => {
    it('should resolve uuid placeholder', () => {
      const template = '{"id": "{{uuid}}"}';
      const result = resolveSystemPlaceholders(template);
      
      expect(result).toMatch(/"id": "[a-f0-9-]{36}"/);
    });

    it('should resolve currentDatetime placeholder', () => {
      const template = '{"timestamp": "{{currentDatetime}}"}';
      const result = resolveSystemPlaceholders(template);
      
      expect(result).toMatch(/"timestamp": "\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should resolve currentDate placeholder', () => {
      const template = '{"date": "{{currentDate}}"}';
      const result = resolveSystemPlaceholders(template);
      
      expect(result).toMatch(/"date": "\d{4}-\d{2}-\d{2}"/);
    });

    it('should resolve currentTime placeholder', () => {
      const template = '{"time": "{{currentTime}}"}';
      const result = resolveSystemPlaceholders(template);
      
      expect(result).toMatch(/"time": "\d{2}:\d{2}:\d{2}"/);
    });

    it('should resolve randomNumber placeholder', () => {
      const template = '{"random": "{{randomNumber}}"}';
      const result = resolveSystemPlaceholders(template);
      
      expect(result).toMatch(/"random": "\d+"/);
    });

    it('should resolve timestamp placeholder', () => {
      const template = '{"ts": "{{timestamp}}"}';
      const result = resolveSystemPlaceholders(template);
      
      expect(result).toMatch(/"ts": "\d+"/);
    });

    it('should handle multiple system placeholders', () => {
      const template = '{"id": "{{uuid}}", "created": "{{currentDatetime}}"}';
      const result = resolveSystemPlaceholders(template);
      
      expect(result).toMatch(/"id": "[a-f0-9-]{36}"/);
      expect(result).toMatch(/"created": "\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should leave non-system placeholders unchanged', () => {
      const template = '{"name": "{{name}}", "id": "{{uuid}}"}';
      const result = resolveSystemPlaceholders(template);
      
      expect(result).toContain('"name": "{{name}}"');
      expect(result).toMatch(/"id": "[a-f0-9-]{36}"/);
    });
  });

  describe('getSystemPlaceholderNames', () => {
    it('should return all system placeholder names', () => {
      const names = getSystemPlaceholderNames();
      
      expect(names).toContain('uuid');
      expect(names).toContain('currentDatetime');
      expect(names).toContain('currentDate');
      expect(names).toContain('currentTime');
      expect(names).toContain('randomNumber');
      expect(names).toContain('timestamp');
    });
  });

  describe('getUserInputPlaceholderNames', () => {
    it('should return user input placeholder names', () => {
      const names = getUserInputPlaceholderNames();
      
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
    });
  });

  describe('getRowInputPlaceholderNames', () => {
    it('should return row input placeholder names', () => {
      const names = getRowInputPlaceholderNames();
      
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
    });
  });

  describe('getAllPlaceholderNames', () => {
    it('should return all placeholder names combined', () => {
      const names = getAllPlaceholderNames();
      
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
      
      // Should include system placeholders
      expect(names).toContain('uuid');
      expect(names).toContain('currentDatetime');
    });
  });
});