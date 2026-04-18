const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  extractClassesFromJSX,
  bucketByBreakpoint,
  flagArbitraryValues,
  analyzeResponsiveCoverage,
} = require('../lib/tailwind-parser');

describe('extractClassesFromJSX — v1.1 enhancements', () => {
  it('extracts from a plain string className', () => {
    const content = `<div className="p-4 md:p-6 text-sm">x</div>`;
    const classes = extractClassesFromJSX(content);
    assert.ok(classes.includes('p-4'));
    assert.ok(classes.includes('md:p-6'));
    assert.ok(classes.includes('text-sm'));
  });

  it('extracts from a ternary className expression', () => {
    const content = `<div className={isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}>x</div>`;
    const classes = extractClassesFromJSX(content);
    assert.ok(classes.includes('bg-blue-500'));
    assert.ok(classes.includes('text-white'));
    assert.ok(classes.includes('bg-gray-200'));
    assert.ok(classes.includes('text-gray-900'));
  });

  it('extracts from template literals', () => {
    const content = '<div className={`p-4 ${size === "lg" ? "text-lg" : "text-sm"}`}>x</div>';
    const classes = extractClassesFromJSX(content);
    assert.ok(classes.includes('p-4'));
    assert.ok(classes.includes('text-lg'));
    assert.ok(classes.includes('text-sm'));
  });

  it('extracts from cn()/clsx()/cva()/twMerge()/tv() calls', () => {
    const content = `
      cn("p-4", isOpen && "ring-2 ring-blue-500");
      clsx("text-sm", { "font-bold": isActive });
      cva("inline-flex items-center", { variants: { size: { lg: "text-lg px-6" } } });
      twMerge("p-4", "p-6");
      tv({ base: "flex gap-2" });
    `;
    const classes = extractClassesFromJSX(content);
    assert.ok(classes.includes('p-4'));
    assert.ok(classes.includes('ring-2'));
    assert.ok(classes.includes('ring-blue-500'));
    assert.ok(classes.includes('text-sm'));
    assert.ok(classes.includes('font-bold'));
    assert.ok(classes.includes('inline-flex'));
    assert.ok(classes.includes('items-center'));
    assert.ok(classes.includes('text-lg'));
    assert.ok(classes.includes('px-6'));
    assert.ok(classes.includes('p-6'));
    assert.ok(classes.includes('flex'));
    assert.ok(classes.includes('gap-2'));
  });

  it('extracts from Vue :class binding', () => {
    const content = `<div :class="['p-4', isOpen ? 'ring-2' : 'ring-0']">x</div>`;
    const classes = extractClassesFromJSX(content);
    assert.ok(classes.includes('p-4'));
    assert.ok(classes.includes('ring-2'));
    assert.ok(classes.includes('ring-0'));
  });

  it('extracts from Svelte class: directives', () => {
    const content = `<div class="p-4" class:active={isActive} class:md:block={isDesktop}>x</div>`;
    const classes = extractClassesFromJSX(content);
    assert.ok(classes.includes('p-4'));
    assert.ok(classes.includes('active'));
  });

  it('captures arbitrary values', () => {
    const content = `<div className="text-[10px] bg-[#ff0] p-[13px] md:mt-[clamp(1rem,2vw,2rem)]">x</div>`;
    const classes = extractClassesFromJSX(content);
    assert.ok(classes.includes('text-[10px]'));
    assert.ok(classes.includes('bg-[#ff0]'));
    assert.ok(classes.includes('p-[13px]'));
  });
});

describe('bucketByBreakpoint', () => {
  it('sorts classes into base / sm / md / lg / xl / 2xl', () => {
    const classes = ['p-4', 'text-sm', 'md:p-6', 'md:text-base', 'lg:p-8', 'xl:flex', '2xl:gap-10', 'sm:block'];
    const r = bucketByBreakpoint(classes);
    assert.equal(r.buckets.base.length, 2);
    assert.equal(r.buckets.sm.length, 1);
    assert.equal(r.buckets.md.length, 2);
    assert.equal(r.buckets.lg.length, 1);
    assert.equal(r.buckets.xl.length, 1);
    assert.equal(r.buckets['2xl'].length, 1);
    assert.deepEqual(r.distinctBreakpoints.sort(), ['2xl', 'lg', 'md', 'sm', 'xl']);
  });

  it('handles mixed hover: and md: variants correctly', () => {
    const classes = ['hover:bg-blue-500', 'md:hover:bg-red-500', 'md:p-6'];
    const r = bucketByBreakpoint(classes);
    assert.equal(r.buckets.base.length, 1);
    assert.equal(r.buckets.md.length, 2);
  });

  it('returns all-zero coverage for empty input', () => {
    const r = bucketByBreakpoint([]);
    assert.equal(r.buckets.base.length, 0);
    assert.deepEqual(r.distinctBreakpoints, []);
  });
});

describe('flagArbitraryValues', () => {
  it('flags text-[10px] and p-[13px]', () => {
    const flagged = flagArbitraryValues(['text-[10px]', 'p-[13px]', 'p-4', 'text-sm']);
    assert.equal(flagged.length, 2);
    const families = flagged.map(f => f.family).sort();
    assert.deepEqual(families, ['p', 'text']);
    assert.ok(flagged[0].hint.includes('arbitrary value') || flagged[0].hint.toLowerCase().includes('arbitrary'));
  });

  it('flags arbitrary values with : variants (md:text-[10px])', () => {
    const flagged = flagArbitraryValues(['md:text-[10px]', 'hover:bg-[#ff0]']);
    assert.equal(flagged.length, 2);
    const classNames = flagged.map(f => f.class).sort();
    assert.deepEqual(classNames, ['hover:bg-[#ff0]', 'md:text-[10px]']);
  });

  it('returns empty for scaled classes only', () => {
    const flagged = flagArbitraryValues(['p-4', 'text-sm', 'bg-blue-500', 'rounded-md']);
    assert.equal(flagged.length, 0);
  });
});

describe('analyzeResponsiveCoverage', () => {
  it('reports ratios and coverage', () => {
    const classes = ['p-4', 'text-sm', 'md:p-6', 'lg:p-8'];
    const r = analyzeResponsiveCoverage(classes);
    assert.equal(r.totalResponsive, 2);
    assert.equal(r.baseOnly, 2);
    assert.equal(r.ratioResponsive, 0.5);
    assert.deepEqual(r.distinctBreakpoints.sort(), ['lg', 'md']);
  });

  it('flags no responsive coverage', () => {
    const r = analyzeResponsiveCoverage(['p-4', 'text-sm', 'bg-white']);
    assert.equal(r.totalResponsive, 0);
    assert.deepEqual(r.distinctBreakpoints, []);
  });
});
