const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { TOOLS } = require('../lib/mcp-server');

function findTool(name) {
  return TOOLS.find(t => t.name === name);
}

describe('uiux_laws_query MCP tool', () => {
  it('is registered in TOOLS', () => {
    const tool = findTool('uiux_laws_query');
    assert.ok(tool, 'uiux_laws_query not registered');
    assert.equal(typeof tool.handler, 'function');
  });

  it('inputSchema has exactly the 4 expected optional properties', () => {
    const tool = findTool('uiux_laws_query');
    const keys = Object.keys(tool.inputSchema.properties).sort();
    assert.deepEqual(keys, ['cognitiveProcess', 'dimension', 'name', 'surface']);
    assert.ok(!tool.inputSchema.required || tool.inputSchema.required.length === 0, 'no filters should be required');
  });

  it('cognitiveProcess enum lists the 6 canonical values', () => {
    const tool = findTool('uiux_laws_query');
    const enumVals = tool.inputSchema.properties.cognitiveProcess.enum.slice().sort();
    assert.deepEqual(enumVals, ['attention', 'decision-making', 'emotion', 'memory', 'motor', 'perception']);
  });

  it('empty filters return all 24 laws', async () => {
    const tool = findTool('uiux_laws_query');
    const r = await tool.handler({});
    assert.ok(r.success);
    assert.equal(r.count, 24);
    assert.equal(r.laws.length, 24);
  });

  it('name filter returns exact slug match', async () => {
    const tool = findTool('uiux_laws_query');
    const r = await tool.handler({ name: 'hicks-law' });
    assert.ok(r.success);
    assert.equal(r.count, 1);
    assert.equal(r.laws[0].slug, 'hicks-law');
  });

  it('dimension filter narrows to laws tagging that dimension', async () => {
    const tool = findTool('uiux_laws_query');
    const r = await tool.handler({ dimension: 'flows' });
    assert.ok(r.success);
    assert.ok(r.count >= 1);
    for (const law of r.laws) {
      assert.ok(law.tags.dimension.includes('flows'), `${law.slug} does not tag flows`);
    }
  });

  it('cognitiveProcess filter narrows to matching process (AND composition)', async () => {
    const tool = findTool('uiux_laws_query');
    const r = await tool.handler({ cognitiveProcess: 'motor' });
    assert.ok(r.success);
    assert.ok(r.count >= 1);
    assert.ok(r.laws.some(l => l.slug === 'fittss-law'), 'fittss-law should be under motor');
    for (const law of r.laws) {
      assert.equal(law.tags.cognitiveProcess, 'motor');
    }
  });

  it('AND composition across filters', async () => {
    const tool = findTool('uiux_laws_query');
    const r = await tool.handler({ dimension: 'flows', cognitiveProcess: 'decision-making' });
    assert.ok(r.success);
    for (const law of r.laws) {
      assert.ok(law.tags.dimension.includes('flows'), `${law.slug} missing flows`);
      assert.equal(law.tags.cognitiveProcess, 'decision-making', `${law.slug} wrong process`);
    }
  });

  it('nonexistent slug returns empty result', async () => {
    const tool = findTool('uiux_laws_query');
    const r = await tool.handler({ name: 'bogus-slug-xyz' });
    assert.ok(r.success);
    assert.equal(r.count, 0);
  });
});

describe('uiux_audit_log accepts laws', () => {
  it('inputSchema exposes laws as optional string array', () => {
    const tool = findTool('uiux_audit_log');
    assert.ok(tool, 'uiux_audit_log not found');
    const prop = tool.inputSchema.properties.laws;
    assert.ok(prop, 'laws property missing on uiux_audit_log');
    assert.equal(prop.type, 'array');
    assert.equal(prop.items.type, 'string');
    assert.ok(!tool.inputSchema.required.includes('laws'), 'laws must stay optional');
  });

  it('end-to-end: handler preserves laws through createFinding', async () => {
    const tool = findTool('uiux_audit_log');
    const result = await tool.handler({
      dimension: 'flows',
      severity: 'important',
      title: 't',
      description: 'd',
      laws: ['hicks-law', 'choice-overload'],
    });
    const finding = result.finding || result;
    assert.ok(finding, 'handler did not return a finding');
    assert.deepEqual(finding.laws, ['hicks-law', 'choice-overload']);
  });
});
