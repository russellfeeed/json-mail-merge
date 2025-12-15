import { describe, it, expect } from 'vitest'
import { findArraysInJson, mergeAsArray } from './arrayMerge'

describe('arrayMerge', () => {
  describe('findArraysInJson', () => {
    it('should find arrays in JSON object', () => {
      const json = '{"items": [{"name": "test"}], "other": "value"}'
      const result = findArraysInJson(json)
      
      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('items')
      expect(result[0].preview).toContain('name')
    })

    it('should return empty array for invalid JSON', () => {
      const result = findArraysInJson('invalid json')
      expect(result).toEqual([])
    })
  })

  describe('mergeAsArray', () => {
    it('should merge simple array template', () => {
      const template = '{"items": [{"name": "{{name}}"}]}'
      const rows = [{ name: 'John' }, { name: 'Jane' }]
      
      const result = mergeAsArray(template, rows, 'items')
      const parsed = JSON.parse(result)
      
      expect(parsed.items).toHaveLength(2)
      expect(parsed.items[0].name).toBe('John')
      expect(parsed.items[1].name).toBe('Jane')
    })

    // This test intentionally doesn't cover all branches to show coverage gaps
  })
})