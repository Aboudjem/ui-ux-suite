const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { KNOWLEDGE, queryKnowledge, searchKnowledge } = require('../lib/knowledge');

describe('Knowledge Base', () => {
  describe('KNOWLEDGE structure', () => {
    it('has all major categories', () => {
      assert.ok(KNOWLEDGE.color);
      assert.ok(KNOWLEDGE.typography);
      assert.ok(KNOWLEDGE.components);
      assert.ok(KNOWLEDGE.accessibility);
      assert.ok(KNOWLEDGE.layout);
      assert.ok(KNOWLEDGE.interaction);
      assert.ok(KNOWLEDGE.styleDirections);
    });

    it('has color harmony types', () => {
      assert.ok(KNOWLEDGE.color.harmony.complementary);
      assert.ok(KNOWLEDGE.color.harmony.analogous);
      assert.ok(KNOWLEDGE.color.harmony.triadic);
    });

    it('has accessibility minimums', () => {
      assert.ok(KNOWLEDGE.accessibility.contrastMinimums['WCAG AA normal text']);
    });
  });

  describe('queryKnowledge', () => {
    it('queries top-level category', () => {
      const result = queryKnowledge('color');
      assert.ok(result);
      assert.ok(result.harmony);
    });

    it('queries nested path', () => {
      const result = queryKnowledge('color', 'harmony.complementary');
      assert.ok(typeof result === 'string');
      assert.ok(result.includes('opposite'));
    });

    it('returns null for invalid path', () => {
      assert.equal(queryKnowledge('color', 'nonexistent.path'), null);
    });
  });

  describe('searchKnowledge', () => {
    it('finds results for common terms', () => {
      const results = searchKnowledge('contrast');
      assert.ok(results.length > 0);
    });

    it('finds results for accessibility terms', () => {
      const results = searchKnowledge('focus');
      assert.ok(results.length > 0);
    });

    it('returns empty for nonsense', () => {
      const results = searchKnowledge('xyznonexistent12345');
      assert.equal(results.length, 0);
    });
  });
});
