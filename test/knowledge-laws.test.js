const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { KNOWLEDGE, queryKnowledge } = require('../lib/knowledge');

const EXPECTED_SLUGS = [
  'hicks-law', 'fittss-law', 'millers-law', 'jakobs-law', 'doherty-threshold',
  'peak-end-rule', 'goal-gradient-effect', 'aesthetic-usability-effect',
  'serial-position-effect', 'von-restorff-effect', 'zeigarnik-effect',
  'pareto-principle', 'parkinsons-law', 'postels-law', 'teslers-law', 'occams-razor',
  'law-of-proximity', 'law-of-common-region', 'law-of-pragnanz', 'law-of-similarity',
  'law-of-uniform-connectedness', 'chunking', 'choice-overload', 'cognitive-load',
];
const REQUIRED_FIELDS = ['name', 'slug', 'definition', 'whenItApplies', 'violationExample', 'fixExample', 'tags', 'source'];
const VALID_PROCESSES = ['perception', 'attention', 'memory', 'decision-making', 'motor', 'emotion'];
const VALID_DIMENSIONS = ['color', 'typography', 'layout', 'components', 'accessibility', 'hierarchy', 'interaction', 'responsive', 'polish', 'performance', 'flows', 'platform'];
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe('KNOWLEDGE.laws', () => {
  it('KNOWLEDGE.laws object is defined', () => {
    assert.ok(KNOWLEDGE.laws, 'KNOWLEDGE.laws must be a non-null object');
    assert.equal(typeof KNOWLEDGE.laws, 'object');
  });

  it('has all 24 expected slugs', () => {
    for (const slug of EXPECTED_SLUGS) {
      assert.ok(KNOWLEDGE.laws[slug], `Missing law: ${slug}`);
    }
    assert.equal(Object.keys(KNOWLEDGE.laws).length, 24, 'KNOWLEDGE.laws must contain exactly 24 entries');
  });

  it('entries have all required fields', () => {
    for (const [slug, entry] of Object.entries(KNOWLEDGE.laws)) {
      for (const field of REQUIRED_FIELDS) {
        assert.ok(entry[field], `${slug}: missing field ${field}`);
      }
      assert.ok(typeof entry.tags === 'object', `${slug}: tags is not object`);
    }
  });

  it('slugs are unique kebab-case', () => {
    const seen = new Set();
    for (const slug of Object.keys(KNOWLEDGE.laws)) {
      assert.match(slug, SLUG_REGEX, `Invalid slug format: ${slug}`);
      assert.ok(!seen.has(slug), `Duplicate slug: ${slug}`);
      seen.add(slug);
    }
  });

  it('entry slug matches key', () => {
    for (const [slug, entry] of Object.entries(KNOWLEDGE.laws)) {
      assert.equal(entry.slug, slug, `${slug}: entry.slug !== key`);
    }
  });

  it('tags use valid dimensions/process/surface', () => {
    for (const [slug, entry] of Object.entries(KNOWLEDGE.laws)) {
      assert.ok(Array.isArray(entry.tags.dimension), `${slug}: tags.dimension not array`);
      assert.ok(entry.tags.dimension.length >= 1, `${slug}: tags.dimension empty`);
      for (const d of entry.tags.dimension) {
        assert.ok(VALID_DIMENSIONS.includes(d), `${slug}: invalid dimension "${d}"`);
      }
      assert.ok(VALID_PROCESSES.includes(entry.tags.cognitiveProcess), `${slug}: invalid process "${entry.tags.cognitiveProcess}"`);
      assert.ok(Array.isArray(entry.tags.surface) && entry.tags.surface.length >= 1, `${slug}: tags.surface empty`);
    }
  });

  it('source is not a lawsofux.com URL (licensing guard)', () => {
    for (const [slug, entry] of Object.entries(KNOWLEDGE.laws)) {
      assert.ok(!entry.source.toLowerCase().includes('lawsofux.com'),
        `${slug}: source must be a primary source, not lawsofux.com`);
    }
  });

  it('queryKnowledge returns entry by slug', () => {
    const result = queryKnowledge('laws', 'hicks-law');
    assert.ok(result, 'queryKnowledge(laws, hicks-law) returned null');
    assert.equal(result.slug, 'hicks-law');
  });
});
