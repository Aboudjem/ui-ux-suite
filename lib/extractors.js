/**
 * UI/UX Suite — File Extractors
 * Parses CSS, Tailwind configs, SCSS, design tokens, and component files
 * to extract color values, typography settings, spacing, and component patterns.
 */

const fs = require('fs');
const path = require('path');

// --- Color extraction ---

const COLOR_REGEX = {
  hex: /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g,
  rgb: /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/g,
  hsl: /hsla?\(\s*\d+(?:deg)?\s*,?\s*\d+%?\s*,?\s*\d+%?(?:\s*[/,]\s*[\d.]+%?)?\s*\)/g,
  oklch: /oklch\(\s*[\d.]+%?\s+[\d.]+\s+[\d.]+(?:\s*\/\s*[\d.]+%?)?\s*\)/g,
  cssVar: /var\(\s*--[\w-]+\s*(?:,\s*[^)]+)?\)/g,
  namedColor: /\b(?:transparent|currentColor|inherit)\b/g,
};

const CSS_VAR_DEF_REGEX = /--([\w-]+)\s*:\s*([^;]+)/g;

function extractColorsFromCSS(content) {
  const colors = [];
  const varDefs = {};

  // Extract CSS variable definitions
  let match;
  const varRegex = new RegExp(CSS_VAR_DEF_REGEX.source, 'g');
  while ((match = varRegex.exec(content)) !== null) {
    varDefs[`--${match[1]}`] = match[2].trim();
  }

  // Extract raw color values
  for (const [type, regex] of Object.entries(COLOR_REGEX)) {
    const re = new RegExp(regex.source, 'g');
    while ((match = re.exec(content)) !== null) {
      colors.push({ value: match[0], type, source: 'css' });
    }
  }

  return { colors, varDefs };
}

function extractColorsFromTailwindConfig(content) {
  const colors = [];
  // Match color definitions in Tailwind config
  const colorBlockRegex = /colors?\s*:\s*\{([\s\S]*?)\}/g;
  let match;
  while ((match = colorBlockRegex.exec(content)) !== null) {
    const block = match[1];
    const kvRegex = /['"]?([\w-]+)['"]?\s*:\s*['"]([^'"]+)['"]/g;
    let kv;
    while ((kv = kvRegex.exec(block)) !== null) {
      colors.push({ name: kv[1], value: kv[2], source: 'tailwind-config' });
    }
  }
  return colors;
}

// --- Typography extraction ---

function extractTypographyFromCSS(content) {
  const fonts = new Set();
  const sizes = new Set();
  const weights = new Set();
  const lineHeights = new Set();
  const letterSpacings = new Set();

  // Font families
  const fontFamilyRegex = /font-family\s*:\s*([^;]+)/g;
  let match;
  while ((match = fontFamilyRegex.exec(content)) !== null) {
    fonts.add(match[1].trim());
  }

  // Font sizes
  const fontSizeRegex = /font-size\s*:\s*([^;]+)/g;
  while ((match = fontSizeRegex.exec(content)) !== null) {
    sizes.add(match[1].trim());
  }

  // Font weights
  const fontWeightRegex = /font-weight\s*:\s*([^;]+)/g;
  while ((match = fontWeightRegex.exec(content)) !== null) {
    weights.add(match[1].trim());
  }

  // Line heights
  const lineHeightRegex = /line-height\s*:\s*([^;]+)/g;
  while ((match = lineHeightRegex.exec(content)) !== null) {
    lineHeights.add(match[1].trim());
  }

  // Letter spacing
  const letterSpacingRegex = /letter-spacing\s*:\s*([^;]+)/g;
  while ((match = letterSpacingRegex.exec(content)) !== null) {
    letterSpacings.add(match[1].trim());
  }

  return {
    fonts: [...fonts],
    sizes: [...sizes],
    weights: [...weights],
    lineHeights: [...lineHeights],
    letterSpacings: [...letterSpacings],
  };
}

// --- Spacing extraction ---

function extractSpacingFromCSS(content) {
  const spacings = new Set();
  const properties = ['padding', 'margin', 'gap', 'padding-top', 'padding-right',
    'padding-bottom', 'padding-left', 'margin-top', 'margin-right',
    'margin-bottom', 'margin-left', 'row-gap', 'column-gap'];

  for (const prop of properties) {
    const regex = new RegExp(`${prop}\\s*:\\s*([^;]+)`, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const values = match[1].trim().split(/\s+/);
      for (const v of values) {
        if (/^\d/.test(v)) spacings.add(v);
      }
    }
  }

  return [...spacings];
}

// --- Border radius extraction ---

function extractBorderRadiusFromCSS(content) {
  const radii = new Set();
  const regex = /border-radius\s*:\s*([^;]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    radii.add(match[1].trim());
  }
  return [...radii];
}

// --- Shadow extraction ---

function extractShadowsFromCSS(content) {
  const shadows = new Set();
  const regex = /box-shadow\s*:\s*([^;]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    shadows.add(match[1].trim());
  }
  return [...shadows];
}

// --- Project detection ---

function detectFramework(packageJson) {
  if (!packageJson) return null;
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  if (deps['next']) return 'next';
  if (deps['nuxt'] || deps['nuxt3']) return 'nuxt';
  if (deps['@angular/core']) return 'angular';
  if (deps['svelte'] || deps['@sveltejs/kit']) return 'svelte';
  if (deps['vue']) return 'vue';
  if (deps['react']) return 'react';
  if (deps['react-native']) return 'react-native';
  return 'vanilla';
}

function detectStyling(packageJson, files) {
  if (!packageJson) return null;
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  if (deps['tailwindcss']) {
    const v = deps['tailwindcss'].replace(/^[\^~><=*\s]+/, '');
    const major = parseInt(v.split('.')[0], 10);
    if (!isNaN(major) && major >= 4) return 'tailwind-v4';
    return 'tailwind-v3';
  }
  if (deps['@pandacss/dev'] || deps['@pandacss/parser']) return 'panda-css';
  if (deps['@vanilla-extract/css']) return 'vanilla-extract';
  if (deps['styled-components']) return 'styled-components';
  if (deps['@emotion/react'] || deps['@emotion/styled']) return 'emotion';
  if (deps['@stitches/react']) return 'stitches';
  if (deps['sass'] || deps['node-sass']) return 'scss';
  if (files.some(f => f.endsWith('.module.css'))) return 'css-modules';
  return 'vanilla-css';
}

function detectAnimationLib(packageJson) {
  if (!packageJson) return null;
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const libs = [];
  if (deps['motion'] || deps['framer-motion']) libs.push('motion');
  if (deps['tailwindcss-animate']) libs.push('tailwindcss-animate');
  if (deps['@formkit/auto-animate']) libs.push('auto-animate');
  if (deps['react-spring'] || deps['@react-spring/web']) libs.push('react-spring');
  if (deps['gsap']) libs.push('gsap');
  if (deps['lottie-react'] || deps['@lottiefiles/react-lottie-player']) libs.push('lottie');
  return libs.length > 0 ? libs : null;
}

function detectIconLib(packageJson) {
  if (!packageJson) return null;
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const libs = [];
  if (deps['lucide-react']) libs.push('lucide-react');
  if (deps['@heroicons/react']) libs.push('heroicons');
  if (deps['@phosphor-icons/react'] || deps['phosphor-react']) libs.push('phosphor-icons');
  if (deps['react-icons']) libs.push('react-icons');
  if (deps['@radix-ui/react-icons']) libs.push('radix-icons');
  if (deps['@tabler/icons-react']) libs.push('tabler-icons');
  return libs.length > 0 ? libs : null;
}

function detectThemeSystemDetails(packageJson, cssContent) {
  if (!packageJson) return { system: null, signals: [] };
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const signals = [];
  if (deps['next-themes']) signals.push('next-themes');
  if (deps['class-variance-authority']) signals.push('class-variance-authority');
  if (deps['tailwindcss-animate']) signals.push('tailwindcss-animate');
  if (deps['clsx'] || deps['classnames']) signals.push('class-util');
  if (deps['tailwind-merge']) signals.push('tailwind-merge');
  if (deps['cmdk']) signals.push('cmdk');

  let system = null;
  if (cssContent) {
    if (/@theme\b/.test(cssContent)) system = 'tailwind-v4-theme';
    else if (/:root\s*\{[^}]*--/.test(cssContent)) system = 'css-vars';
  }
  if (!system && signals.includes('next-themes')) system = 'next-themes';
  return { system, signals };
}

function detectComponentLib(packageJson) {
  if (!packageJson) return null;
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  if (deps['@mui/material']) return 'mui';
  if (deps['@chakra-ui/react']) return 'chakra';
  if (deps['antd']) return 'ant-design';
  if (deps['@mantine/core']) return 'mantine';
  if (deps['@radix-ui/react-dialog'] || deps['@radix-ui/themes']) return 'radix';
  if (deps['@headlessui/react']) return 'headless-ui';
  if (deps['@ark-ui/react']) return 'ark-ui';
  // shadcn detection via components.json
  return null;
}

function detectThemeSystem(files, cssContent) {
  if (cssContent && cssContent.includes(':root') && /--[\w-]+\s*:/.test(cssContent)) {
    return 'css-vars';
  }
  if (files.some(f => /tailwind\.config/.test(f))) return 'tailwind-config';
  if (files.some(f => /tokens?\.(json|js|ts)/.test(f))) return 'token-files';
  if (files.some(f => /theme\.(js|ts|json)/.test(f))) return 'theme-provider';
  return 'none';
}

// --- Tailwind class extraction ---

function extractTailwindClasses(content) {
  const classRegex = /(?:className|class)\s*=\s*(?:{[^}]*}|"[^"]*"|'[^']*'|`[^`]*`)/g;
  const classes = new Set();
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    const classStr = match[0];
    const twClasses = classStr.match(/[\w-]+(?::[\w-]+)*/g) || [];
    for (const cls of twClasses) {
      if (/^(bg-|text-|border-|ring-|outline-|fill-|stroke-|from-|via-|to-|placeholder-)/.test(cls)) {
        classes.add(cls);
      }
    }
  }
  return [...classes];
}

module.exports = {
  extractColorsFromCSS,
  extractColorsFromTailwindConfig,
  extractTypographyFromCSS,
  extractSpacingFromCSS,
  extractBorderRadiusFromCSS,
  extractShadowsFromCSS,
  detectFramework,
  detectStyling,
  detectComponentLib,
  detectThemeSystem,
  detectAnimationLib,
  detectIconLib,
  detectThemeSystemDetails,
  extractTailwindClasses,
};
