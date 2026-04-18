const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { TOOLS, createMcpServer } = require('../lib/mcp-server');

const AUDIT_TOOL = TOOLS.find(t => t.name === 'uiux_audit_run');

function makeFixtureProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uiux-audit-fixture-'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: 'fixture-app',
    version: '0.0.0',
    dependencies: {
      next: '16.0.0',
      react: '19.0.0',
      'next-themes': '0.4.0',
      'class-variance-authority': '0.7.0',
      'lucide-react': '0.400.0',
      '@radix-ui/react-dialog': '1.1.0',
    },
    devDependencies: {
      tailwindcss: '4.0.0',
    },
  }, null, 2));
  fs.writeFileSync(path.join(dir, 'components.json'), JSON.stringify({ style: 'default' }));
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src', 'globals.css'), `
    :root {
      --color-primary: oklch(0.6 0.2 250);
      --color-destructive: #dc2626;
      --radius-md: 0.5rem;
      --shadow-color: 0 0% 0%;
    }
    @theme inline {
      --font-sans: Geist, system-ui, sans-serif;
    }
    body { font-size: 16px; line-height: 1.5; }
    .card {
      padding: 16px;
      border-radius: var(--radius-md);
      box-shadow: 0 1px 2px rgb(0 0 0 / 0.05), 0 4px 8px rgb(0 0 0 / 0.1);
    }
    @media (prefers-reduced-motion: reduce) { * { animation: none; } }
    :focus-visible { outline: 2px solid var(--color-primary); }
    @media (min-width: 768px) { .card { padding: 24px; } }
  `);
  fs.writeFileSync(path.join(dir, 'src', 'page.tsx'), `
    export default function Page() {
      return (
        <main className="p-4 md:p-6 text-base dark:bg-black hover:bg-neutral-100 focus-visible:ring-2">
          <h1 aria-label="hello">Hi</h1>
          <img src="/a.png" alt="a" />
          <button className="active:scale-95 disabled:opacity-50">Go</button>
        </main>
      );
    }
  `);
  return dir;
}

describe('uiux_audit_run MCP tool', () => {
  let fixture;
  before(() => { fixture = makeFixtureProject(); });
  after(() => { fs.rmSync(fixture, { recursive: true, force: true }); });

  it('is registered in the TOOLS array', () => {
    assert.ok(AUDIT_TOOL, 'uiux_audit_run tool should be registered');
    assert.equal(typeof AUDIT_TOOL.handler, 'function');
  });

  it('audits a real fixture project and returns structured + markdown output', async () => {
    const result = await AUDIT_TOOL.handler({ projectPath: fixture });
    assert.equal(result.success, true);
    assert.equal(result.projectPath, fixture);
    assert.equal(result.depth, 'quick');
    assert.ok(typeof result.durationMs === 'number');
    assert.ok(result.filesScanned.total >= 2, 'should scan at least css + tsx');
    assert.ok(result.overall !== null && result.overall >= 1 && result.overall <= 10, 'overall score should be in 1..10');
    assert.ok(result.grade, 'should have a grade');
    assert.equal(typeof result.markdown, 'string');
    assert.ok(result.markdown.includes('Design Audit Report'), 'markdown should contain report header');
    assert.ok(Array.isArray(result.topFindings), 'topFindings should be an array');
  });

  it('exposes all 12 dimensions in perDimension with scored status', async () => {
    const result = await AUDIT_TOOL.handler({ projectPath: fixture });
    const expected = ['color','typography','layout','components','accessibility','hierarchy','interaction','responsive','polish','performance','flows','platform'];
    for (const id of expected) {
      assert.ok(result.perDimension[id], `perDimension.${id} should exist`);
      assert.equal(result.perDimension[id].status, 'scored', `${id} should be scored (not null)`);
      assert.ok(result.perDimension[id].score >= 1 && result.perDimension[id].score <= 10, `${id} score in 1..10`);
      assert.ok(typeof result.perDimension[id].weight === 'number');
    }
  });

  it('fails loudly with a clear message when projectPath does not exist', async () => {
    const result = await AUDIT_TOOL.handler({ projectPath: '/does/not/exist/anywhere-xyz' });
    assert.equal(result.success, false);
    assert.ok(result.error.includes('not found'));
    assert.ok(result.hint && result.hint.length > 0, 'should include an actionable hint');
  });

  it('defaults projectPath to process.cwd() when omitted', async () => {
    const result = await AUDIT_TOOL.handler({});
    assert.ok(result.success === true || result.success === false);
    if (result.success) {
      assert.equal(result.projectPath, process.cwd());
    }
  });

  it('warns when depth=deep is requested without baseUrl', async () => {
    const result = await AUDIT_TOOL.handler({ projectPath: fixture, depth: 'deep' });
    assert.equal(result.success, true);
    assert.ok(Array.isArray(result.warnings));
    assert.ok(result.warnings.some(w => w.includes('baseUrl')), 'should warn about missing baseUrl');
  });

  it('warns when depth=deep + baseUrl but peer deps missing', async () => {
    const result = await AUDIT_TOOL.handler({ projectPath: fixture, depth: 'deep', baseUrl: 'http://localhost:3000' });
    assert.equal(result.success, true);
    assert.ok(Array.isArray(result.warnings));
    const peerWarn = result.warnings.find(w => w.includes('playwright-core') || w.includes('peer'));
    assert.ok(peerWarn, 'should warn about peer deps or scaffolding status');
  });

  it('restricts output to requested dimensions when dimensions param is passed', async () => {
    const result = await AUDIT_TOOL.handler({ projectPath: fixture, dimensions: ['color', 'accessibility'] });
    assert.equal(result.success, true);
    assert.ok(Object.keys(result.perDimension).length === 12, 'perDimension keeps all 12 for consistency');
    assert.ok(result.topFindings.every(f => ['color', 'accessibility'].includes(f.dimension)),
      'topFindings should be filtered to requested dimensions only');
    if (result.markdown) {
      assert.ok(result.markdown.includes('Color') || result.markdown.includes('color'));
    }
  });

  it('supports format=summary to omit the big JSON payload', async () => {
    const result = await AUDIT_TOOL.handler({ projectPath: fixture, format: 'summary' });
    assert.equal(result.success, true);
    assert.ok(result.overall !== undefined);
    assert.ok(result.perDimension);
    assert.equal(result.filesScanned, undefined, 'summary should omit filesScanned');
    assert.equal(result.colorsFound, undefined, 'summary should omit detailed extraction data');
    assert.ok(typeof result.markdown === 'string', 'summary still returns markdown');
  });

  it('supports format=json to omit markdown rendering', async () => {
    const result = await AUDIT_TOOL.handler({ projectPath: fixture, format: 'json' });
    assert.equal(result.success, true);
    assert.equal(result.markdown, undefined, 'json format should not include markdown');
    assert.ok(result.perDimension);
    assert.ok(result.overall !== null);
  });
});

describe('MCP protocol exposes uiux_audit_run via tools/list', () => {
  it('lists the tool with a valid inputSchema', async () => {
    const { handleRequest } = createMcpServer();
    const response = await handleRequest({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
    const names = response.result.tools.map(t => t.name);
    assert.ok(names.includes('uiux_audit_run'));
    const tool = response.result.tools.find(t => t.name === 'uiux_audit_run');
    assert.equal(tool.inputSchema.type, 'object');
    assert.ok(tool.inputSchema.properties.projectPath);
    assert.ok(tool.inputSchema.properties.depth);
  });

  it('invokes uiux_audit_run via tools/call and returns a JSON content block', async () => {
    const fixture = makeFixtureProject();
    try {
      const { handleRequest } = createMcpServer();
      const response = await handleRequest({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'uiux_audit_run', arguments: { projectPath: fixture } },
      });
      assert.ok(response.result.content, 'should return content blocks');
      const parsed = JSON.parse(response.result.content[0].text);
      assert.equal(parsed.success, true);
      assert.equal(parsed.projectPath, fixture);
      assert.ok(parsed.overall !== null);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });
});
