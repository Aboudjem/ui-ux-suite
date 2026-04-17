/**
 * UI/UX Suite — MCP Bridge Server
 * Provides tools for project scanning, extraction, scoring, and generation.
 * Implements MCP JSON-RPC 2.0 over stdin/stdout (zero dependencies).
 */

const fs = require('fs');
const path = require('path');
const { createProjectProfile, createScoreCard, calculateOverall, createFinding, DIMENSIONS } = require('./schema');
const { extractColorsFromCSS, extractColorsFromTailwindConfig, extractTypographyFromCSS, extractSpacingFromCSS, extractBorderRadiusFromCSS, extractShadowsFromCSS, detectFramework, detectStyling, detectComponentLib, detectThemeSystem, extractTailwindClasses } = require('./extractors');
const { hexToRgb, contrastRatio, wcagLevel, apcaContrast, apcaLevel, findNearDuplicates, generateNeutralScale, generateSemanticColor, generateDarkSurfaces, generateLightSurfaces, rgbToHsl } = require('./color-engine');
const { generateTypeScale, generateFluidTypeScale, detectTypeScale, recommendWeightStrategy, SCALE_RATIOS } = require('./type-engine');
const { generateSpacingScale, analyzeSpacingConsistency, detectGridSystem, extractBreakpoints, analyzeContainerWidths } = require('./spacing-engine');
const { runFullScoring, formatScoreCard } = require('./scoring');
const { queryKnowledge, searchKnowledge, KNOWLEDGE } = require('./knowledge');

// --- Tool definitions ---

const TOOLS = [
  {
    name: 'uiux_scan_project',
    description: 'Scan project files and build a design profile: framework, styling approach, component library, theme system, design maturity.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string', description: 'Root path of the project to scan' },
      },
      required: ['projectPath'],
    },
    handler: handleScanProject,
  },
  {
    name: 'uiux_extract_colors',
    description: 'Extract all color values from project CSS, Tailwind config, token files, and component styles.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string', description: 'Root path of the project' },
      },
      required: ['projectPath'],
    },
    handler: handleExtractColors,
  },
  {
    name: 'uiux_extract_typography',
    description: 'Extract all typography values: fonts, sizes, weights, line heights, letter spacing.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string', description: 'Root path of the project' },
      },
      required: ['projectPath'],
    },
    handler: handleExtractTypography,
  },
  {
    name: 'uiux_extract_spacing',
    description: 'Extract all spacing values: padding, margin, gap from project styles.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string', description: 'Root path of the project' },
      },
      required: ['projectPath'],
    },
    handler: handleExtractSpacing,
  },
  {
    name: 'uiux_check_contrast',
    description: 'Check contrast ratios for foreground/background color pairs. Returns WCAG and APCA scores.',
    inputSchema: {
      type: 'object',
      properties: {
        pairs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              fg: { type: 'string', description: 'Foreground color (hex)' },
              bg: { type: 'string', description: 'Background color (hex)' },
              context: { type: 'string', description: 'Where this pair is used' },
            },
          },
          description: 'Array of color pairs to check',
        },
      },
      required: ['pairs'],
    },
    handler: handleCheckContrast,
  },
  {
    name: 'uiux_score_dimension',
    description: 'Score a specific design dimension (1-10) with findings.',
    inputSchema: {
      type: 'object',
      properties: {
        dimension: { type: 'string', enum: DIMENSIONS.map(d => d.id), description: 'Which dimension to score' },
        data: { type: 'object', description: 'Extracted data for this dimension' },
      },
      required: ['dimension', 'data'],
    },
    handler: handleScoreDimension,
  },
  {
    name: 'uiux_score_overall',
    description: 'Calculate overall weighted design score from dimension scores.',
    inputSchema: {
      type: 'object',
      properties: {
        scores: {
          type: 'object',
          description: 'Object mapping dimension IDs to scores (1-10)',
        },
      },
      required: ['scores'],
    },
    handler: handleScoreOverall,
  },
  {
    name: 'uiux_generate_palette',
    description: 'Generate a color palette from a base/brand color with semantic roles, surfaces, and dark mode.',
    inputSchema: {
      type: 'object',
      properties: {
        brandColor: { type: 'string', description: 'Primary brand color (hex)' },
        style: { type: 'string', enum: ['warm', 'cool', 'neutral'], description: 'Neutral palette temperature' },
        includeDarkMode: { type: 'boolean', description: 'Generate dark mode palette too' },
      },
      required: ['brandColor'],
    },
    handler: handleGeneratePalette,
  },
  {
    name: 'uiux_generate_type_scale',
    description: 'Generate a type scale from base size and ratio.',
    inputSchema: {
      type: 'object',
      properties: {
        baseSize: { type: 'number', description: 'Base font size in px (default 16)' },
        ratio: { type: 'string', enum: Object.keys(SCALE_RATIOS), description: 'Scale ratio name' },
        fluid: { type: 'boolean', description: 'Generate fluid clamp() values' },
      },
    },
    handler: handleGenerateTypeScale,
  },
  {
    name: 'uiux_generate_spacing_scale',
    description: 'Generate a spacing scale from a base unit.',
    inputSchema: {
      type: 'object',
      properties: {
        baseUnit: { type: 'number', description: 'Base spacing unit in px (default 4)' },
        steps: { type: 'number', description: 'Number of steps (default 16)' },
      },
    },
    handler: handleGenerateSpacingScale,
  },
  {
    name: 'uiux_generate_tokens',
    description: 'Generate a complete design token set: color, typography, spacing, border-radius, shadows, motion.',
    inputSchema: {
      type: 'object',
      properties: {
        brandColor: { type: 'string', description: 'Primary brand color (hex)' },
        style: { type: 'string', enum: Object.keys(KNOWLEDGE.styleDirections), description: 'Visual style direction' },
        format: { type: 'string', enum: ['css-vars', 'tailwind', 'json', 'js'], description: 'Output format' },
      },
      required: ['brandColor'],
    },
    handler: handleGenerateTokens,
  },
  {
    name: 'uiux_knowledge_query',
    description: 'Query the design knowledge base. Searches both the structured knowledge object and 19 markdown knowledge documents (3,081 lines of curated design intelligence).',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['color', 'typography', 'components', 'accessibility', 'layout', 'interaction', 'styleDirections'], description: 'Knowledge category (structured data)' },
        key: { type: 'string', description: 'Dot-separated key path (e.g., "harmony.complementary")' },
        search: { type: 'string', description: 'Free-text search across all knowledge (structured + markdown files)' },
        file: { type: 'string', description: 'Load a specific knowledge file by name (e.g., "color-theory" or "evidence-base")' },
        listFiles: { type: 'boolean', description: 'List all available knowledge files with descriptions' },
      },
    },
    handler: handleKnowledgeQuery,
  },
  {
    name: 'uiux_laws_query',
    description: 'Query the Laws of UX knowledge base. Returns entries for Hicks Law, Fittss Law, Millers Law, Jakobs Law, Doherty Threshold, Peak-End Rule, Gestalt laws, and 18 others. Filters (all optional) compose with AND semantics.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Match by law slug (e.g., "hicks-law") or substring of the law name',
        },
        dimension: {
          type: 'string',
          enum: DIMENSIONS.map(d => d.id),
          description: 'Filter laws that tag this scoring dimension',
        },
        surface: {
          type: 'string',
          description: 'Filter by surface tag: navigation, forms, content, motion, timing, layout, copy, media, data-display, onboarding',
        },
        cognitiveProcess: {
          type: 'string',
          enum: ['perception', 'attention', 'memory', 'decision-making', 'motor', 'emotion'],
          description: 'Filter by cognitive process tag',
        },
      },
    },
    handler: handleLawsQuery,
  },
  {
    name: 'uiux_audit_log',
    description: 'Append a finding to the current audit log.',
    inputSchema: {
      type: 'object',
      properties: {
        dimension: { type: 'string', description: 'Design dimension' },
        severity: { type: 'string', enum: ['critical', 'important', 'suggestion', 'nice-to-have'] },
        title: { type: 'string' },
        description: { type: 'string' },
        impact: { type: 'string' },
        fix: { type: 'string' },
        effort: { type: 'string', enum: ['trivial', 'small', 'medium', 'large', 'major'] },
        before: { type: 'string', description: 'Current code/state' },
        after: { type: 'string', description: 'Recommended code/state' },
        laws: {
          type: 'array',
          items: { type: 'string' },
          description: 'Slugs of UX laws this finding cites (e.g., ["hicks-law", "choice-overload"])',
        },
      },
      required: ['dimension', 'severity', 'title', 'description'],
    },
    handler: handleAuditLog,
  },
  {
    name: 'uiux_audit_report',
    description: 'Generate a formatted markdown audit report from the current audit log.',
    inputSchema: {
      type: 'object',
      properties: {
        format: { type: 'string', enum: ['full', 'summary', 'scorecard'], description: 'Report format' },
      },
    },
    handler: handleAuditReport,
  },
];

// --- State ---
let auditLog = [];
let currentProfile = null;

// --- Handlers ---

async function handleScanProject({ projectPath }) {
  const profile = createProjectProfile();

  const pkgPath = path.join(projectPath, 'package.json');
  let packageJson = null;
  try {
    packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {}

  profile.framework = detectFramework(packageJson);
  profile.componentLib = detectComponentLib(packageJson);

  try {
    fs.accessSync(path.join(projectPath, 'components.json'));
    profile.componentLib = 'shadcn';
  } catch {}

  const tokenFiles = ['tokens.json', 'design-tokens.json', 'theme.json', 'tokens.js', 'tokens.ts'];
  for (const tf of tokenFiles) {
    try {
      fs.accessSync(path.join(projectPath, tf));
      profile.hasDesignTokens = true;
      break;
    } catch {}
  }

  currentProfile = profile;
  return { success: true, profile };
}

async function handleExtractColors({ projectPath }) {
  const allColors = [];
  const allVarDefs = {};

  const cssFiles = findFiles(projectPath, ['.css', '.scss']);
  for (const file of cssFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const { colors, varDefs } = extractColorsFromCSS(content);
      allColors.push(...colors.map(c => ({ ...c, file: path.relative(projectPath, file) })));
      Object.assign(allVarDefs, varDefs);
    } catch {}
  }

  const twConfigs = ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.mjs'];
  for (const tc of twConfigs) {
    try {
      const content = fs.readFileSync(path.join(projectPath, tc), 'utf8');
      const twColors = extractColorsFromTailwindConfig(content);
      allColors.push(...twColors);
    } catch {}
  }

  const uniqueHexColors = [...new Set(allColors.filter(c => c.type === 'hex').map(c => c.value.toLowerCase()))];
  const rgbColors = uniqueHexColors.map(hex => ({ hex, rgb: hexToRgb(hex) }));
  const nearDuplicates = findNearDuplicates(rgbColors);

  return {
    success: true,
    totalFound: allColors.length,
    uniqueColors: uniqueHexColors.length,
    colors: allColors.slice(0, 100),
    cssVariables: allVarDefs,
    nearDuplicates: nearDuplicates.slice(0, 20),
  };
}

async function handleExtractTypography({ projectPath }) {
  const allType = { fonts: new Set(), sizes: new Set(), weights: new Set(), lineHeights: new Set(), letterSpacings: new Set() };

  const cssFiles = findFiles(projectPath, ['.css', '.scss']);
  for (const file of cssFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const type = extractTypographyFromCSS(content);
      type.fonts.forEach(f => allType.fonts.add(f));
      type.sizes.forEach(s => allType.sizes.add(s));
      type.weights.forEach(w => allType.weights.add(w));
      type.lineHeights.forEach(lh => allType.lineHeights.add(lh));
      type.letterSpacings.forEach(ls => allType.letterSpacings.add(ls));
    } catch {}
  }

  const sizes = [...allType.sizes].map(s => parseFloat(s)).filter(n => !isNaN(n)).sort((a, b) => a - b);
  const scaleInfo = detectTypeScale(sizes);

  return {
    success: true,
    fonts: [...allType.fonts],
    sizes: [...allType.sizes],
    weights: [...allType.weights],
    lineHeights: [...allType.lineHeights],
    letterSpacings: [...allType.letterSpacings],
    scaleDetection: scaleInfo,
    weightStrategy: recommendWeightStrategy([...allType.weights]),
  };
}

async function handleExtractSpacing({ projectPath }) {
  const allSpacing = [];

  const cssFiles = findFiles(projectPath, ['.css', '.scss']);
  for (const file of cssFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      allSpacing.push(...extractSpacingFromCSS(content));
    } catch {}
  }

  const analysis = analyzeSpacingConsistency(allSpacing);

  return { success: true, rawValues: allSpacing.length, analysis };
}

async function handleCheckContrast({ pairs }) {
  return {
    success: true,
    results: pairs.map(pair => {
      const fgRgb = hexToRgb(pair.fg);
      const bgRgb = hexToRgb(pair.bg);
      const ratio = contrastRatio(fgRgb, bgRgb);
      const apca = apcaContrast(fgRgb, bgRgb);
      return {
        fg: pair.fg,
        bg: pair.bg,
        context: pair.context || '',
        wcag: {
          ratio: Math.round(ratio * 100) / 100,
          normalText: wcagLevel(ratio, false),
          largeText: wcagLevel(ratio, true),
        },
        apca: {
          lc: Math.round(apca * 10) / 10,
          level: apcaLevel(apca),
        },
      };
    }),
  };
}

async function handleScoreDimension({ dimension, data }) {
  const { scoreColorSystem, scoreTypography, scoreLayout, scoreAccessibility } = require('./scoring');
  const scorers = { color: scoreColorSystem, typography: scoreTypography, layout: scoreLayout, accessibility: scoreAccessibility };
  const scorer = scorers[dimension];
  if (!scorer) return { success: false, error: `No scorer for dimension: ${dimension}` };
  return { success: true, ...scorer(data) };
}

async function handleScoreOverall({ scores }) {
  const scoreCard = createScoreCard();
  for (const dim of scoreCard.dimensions) {
    if (scores[dim.id] !== undefined) {
      dim.score = scores[dim.id];
    }
  }
  calculateOverall(scoreCard);
  return { success: true, scoreCard, formatted: formatScoreCard(scoreCard) };
}

async function handleGeneratePalette({ brandColor, style = 'neutral', includeDarkMode = true }) {
  const rgb = hexToRgb(brandColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const neutralHue = style === 'warm' ? 30 : style === 'cool' ? 220 : hsl.h;
  const neutralScale = generateNeutralScale(neutralHue, 5);

  const palette = {
    brand: { primary: brandColor, hsl },
    neutral: neutralScale,
    semantic: {
      success: generateSemanticColor(145, 'success'),
      error: generateSemanticColor(0, 'error'),
      warning: generateSemanticColor(38, 'warning'),
      info: generateSemanticColor(210, 'info'),
    },
    surfaces: {
      light: generateLightSurfaces(),
      ...(includeDarkMode ? { dark: generateDarkSurfaces(hsl.h) } : {}),
    },
  };

  return { success: true, palette };
}

async function handleGenerateTypeScale({ baseSize = 16, ratio = 'minor-third', fluid = false }) {
  const ratioConfig = SCALE_RATIOS[ratio] || SCALE_RATIOS['minor-third'];
  const scale = fluid
    ? generateFluidTypeScale(baseSize, ratioConfig.ratio)
    : generateTypeScale(baseSize, ratioConfig.ratio);

  return { success: true, ratio: ratioConfig, scale };
}

async function handleGenerateSpacingScale({ baseUnit = 4, steps = 16 }) {
  const scale = generateSpacingScale(baseUnit, steps);
  return {
    success: true,
    baseUnit,
    scale: scale.map(v => ({ px: v, rem: Math.round((v / 16) * 1000) / 1000, token: `space-${v}` })),
  };
}

async function handleGenerateTokens({ brandColor, style = 'neo-minimal', format = 'css-vars' }) {
  const palette = (await handleGeneratePalette({ brandColor, includeDarkMode: true })).palette;
  const typeScale = (await handleGenerateTypeScale({ baseSize: 16, ratio: 'minor-third', fluid: true })).scale;
  const spacingScale = (await handleGenerateSpacingScale({ baseUnit: 4, steps: 16 })).scale;

  const tokens = { color: palette, typography: typeScale, spacing: spacingScale };

  if (format === 'css-vars') {
    tokens.css = generateCSSVars(palette, typeScale, spacingScale);
  }

  return { success: true, tokens, format };
}

async function handleKnowledgeQuery({ category, key, search, file, listFiles }) {
  const knowledgeDir = path.join(__dirname, '..', 'knowledge');

  if (listFiles) {
    try {
      const files = fs.readdirSync(knowledgeDir)
        .filter(f => f.endsWith('.md') && f !== 'INDEX.md')
        .map(f => {
          const content = fs.readFileSync(path.join(knowledgeDir, f), 'utf8');
          const firstLine = content.split('\n').find(l => l.startsWith('# ')) || f;
          const lines = content.split('\n').length;
          return { file: f, title: firstLine.replace(/^#\s*/, ''), lines };
        });
      return { success: true, files, totalFiles: files.length };
    } catch (e) {
      return { success: false, error: 'Could not read knowledge directory: ' + e.message };
    }
  }

  if (file) {
    const filename = file.endsWith('.md') ? file : file + '.md';
    const filePath = path.join(knowledgeDir, filename);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return { success: true, file: filename, lines: content.split('\n').length, content };
    } catch (e) {
      return { success: false, error: 'File not found: ' + filename };
    }
  }

  if (search) {
    const structuredResults = searchKnowledge(search);
    const mdResults = [];
    try {
      const files = fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
      const q = search.toLowerCase();
      for (const f of files) {
        const content = fs.readFileSync(path.join(knowledgeDir, f), 'utf8');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(q)) {
            mdResults.push({ file: f, line: i + 1, content: lines[i].trim() });
          }
        }
      }
    } catch (e) { /* knowledge dir not found, skip */ }
    return { success: true, structured: structuredResults, markdown: mdResults.slice(0, 50) };
  }

  if (category) {
    const result = queryKnowledge(category, key);
    return { success: true, result };
  }

  return { success: false, error: 'Provide category+key, search, file, or listFiles' };
}

async function handleLawsQuery({ name, dimension, surface, cognitiveProcess }) {
  if (!KNOWLEDGE.laws) {
    return { success: false, error: 'KNOWLEDGE.laws not populated' };
  }
  const entries = Object.values(KNOWLEDGE.laws);
  const q = (name || '').toLowerCase();

  const matches = entries.filter(law => {
    if (name) {
      if (law.slug.toLowerCase() !== q && !law.name.toLowerCase().includes(q)) return false;
    }
    if (dimension && !((law.tags && law.tags.dimension) || []).includes(dimension)) return false;
    if (surface && !((law.tags && law.tags.surface) || []).includes(surface)) return false;
    if (cognitiveProcess && (law.tags && law.tags.cognitiveProcess) !== cognitiveProcess) return false;
    return true;
  });

  return { success: true, count: matches.length, laws: matches };
}

async function handleAuditLog(params) {
  const finding = createFinding(params);
  auditLog.push(finding);
  return { success: true, findingId: finding.id, totalFindings: auditLog.length, finding };
}

async function handleAuditReport({ format = 'full' }) {
  const grouped = {};
  for (const f of auditLog) {
    if (!grouped[f.severity]) grouped[f.severity] = [];
    grouped[f.severity].push(f);
  }
  return { success: true, format, totalFindings: auditLog.length, findings: grouped };
}

// --- Helpers ---

function findFiles(dir, extensions, maxDepth = 4) {
  const results = [];
  const ignored = ['node_modules', '.git', '.next', 'dist', 'build', '.cache', 'coverage'];

  function walk(current, depth) {
    if (depth > maxDepth) return;
    try {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        if (ignored.includes(entry.name)) continue;
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath, depth + 1);
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          results.push(fullPath);
        }
      }
    } catch {}
  }

  walk(dir, 0);
  return results;
}

function generateCSSVars(palette, typeScale, spacingScale) {
  const lines = [':root {'];

  lines.push('  /* Brand */');
  lines.push(`  --color-primary: ${palette.brand.primary};`);
  lines.push('');
  lines.push('  /* Neutral */');
  for (const step of palette.neutral) {
    lines.push(`  --color-neutral-${step.step}: ${step.hex};`);
  }
  lines.push('');
  lines.push('  /* Semantic */');
  for (const [role, colors] of Object.entries(palette.semantic)) {
    lines.push(`  --color-${role}: ${colors.base};`);
    lines.push(`  --color-${role}-light: ${colors.light};`);
    lines.push(`  --color-${role}-dark: ${colors.dark};`);
  }
  lines.push('');
  lines.push('  /* Surfaces */');
  for (const [name, value] of Object.entries(palette.surfaces.light)) {
    lines.push(`  --surface-${name}: ${value};`);
  }

  lines.push('');
  lines.push('  /* Typography */');
  for (const step of typeScale) {
    if (step.clamp) {
      lines.push(`  --font-size-${step.role}: ${step.clamp};`);
    } else {
      lines.push(`  --font-size-${step.role}: ${step.rem}rem;`);
    }
  }

  lines.push('');
  lines.push('  /* Spacing */');
  for (const step of spacingScale) {
    lines.push(`  --space-${step.px}: ${step.rem}rem;`);
  }

  lines.push('}');

  if (palette.surfaces.dark) {
    lines.push('');
    lines.push('@media (prefers-color-scheme: dark) {');
    lines.push('  :root {');
    for (const [name, value] of Object.entries(palette.surfaces.dark)) {
      lines.push(`    --surface-${name}: ${value};`);
    }
    lines.push('  }');
    lines.push('}');
  }

  return lines.join('\n');
}

// --- MCP Server (JSON-RPC 2.0 over stdin/stdout) ---

function createMcpServer() {
  const toolMap = {};
  for (const tool of TOOLS) {
    toolMap[tool.name] = tool;
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

  async function handleRequest(request) {
    const { method, params, id } = request;

    // Initialize
    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'ui-ux-suite',
            version: pkg.version,
          },
        },
      };
    }

    // List tools
    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema,
          })),
        },
      };
    }

    // Call tool
    if (method === 'tools/call') {
      const { name, arguments: args } = params || {};
      const tool = toolMap[name];
      if (!tool) {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
            isError: true,
          },
        };
      }

      try {
        const result = await tool.handler(args || {});
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          },
        };
      } catch (err) {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
            isError: true,
          },
        };
      }
    }

    // Notifications (no response needed)
    if (method === 'notifications/initialized' || method === 'notifications/cancelled') {
      return null;
    }

    // Ping
    if (method === 'ping') {
      return { jsonrpc: '2.0', id, result: {} };
    }

    // Unknown method
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    };
  }

  function start() {
    let buffer = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      buffer += chunk;

      // Process complete lines (newline-delimited JSON)
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);

        if (!line) continue;

        try {
          const request = JSON.parse(line);
          handleRequest(request).then((response) => {
            if (response) {
              process.stdout.write(JSON.stringify(response) + '\n');
            }
          }).catch((err) => {
            const errorResponse = {
              jsonrpc: '2.0',
              id: request.id || null,
              error: { code: -32603, message: err.message },
            };
            process.stdout.write(JSON.stringify(errorResponse) + '\n');
          });
        } catch (parseErr) {
          const errorResponse = {
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: 'Parse error' },
          };
          process.stdout.write(JSON.stringify(errorResponse) + '\n');
        }
      }
    });

    process.stdin.on('end', () => {
      process.exit(0);
    });

    // Suppress EPIPE errors when stdout closes
    process.stdout.on('error', (err) => {
      if (err.code === 'EPIPE') process.exit(0);
    });
  }

  return { start, handleRequest };
}

// --- Entry point ---

if (require.main === module) {
  const server = createMcpServer();
  server.start();
}

module.exports = { TOOLS, findFiles, createMcpServer };
