#!/usr/bin/env node
// Builds the README hero (dark and light) and the social preview SVG from one layout.
// Render the PNG with: rsvg-convert -w 1280 -h 640 .github/assets/social-preview.svg -o .github/assets/social-preview.png
// Every value in the picture is real: lines 117 to 119 of the planted fixture,
// the contrast the audit measures (1.75:1) and the fix it prints (#6d7882, 4.51:1).
'use strict';
const fs = require('fs');
const path = require('path');

const THEMES = {
  dark: {
    bg: '#0A0F1C', panel: '#111A2C', panelLine: '#22304A', text: '#F2F6FF', sub: '#C2CDE4',
    muted: '#93A2BE', accent: '#00D4FF', accent2: '#5B9DFF', bad: '#FF6B81', good: '#4BE3A0',
    chipBg: '#0F1A2E', chipLine: '#2A3E62', mark: 'rgba(0,212,255,0.14)',
  },
  light: {
    bg: '#FFFFFF', panel: '#F4F6FA', panelLine: '#D5DBE6', text: '#0B1220', sub: '#2A3550',
    muted: '#4A5670', accent: '#006A80', accent2: '#0959D1', bad: '#B4232F', good: '#0B7A4B',
    chipBg: '#F2F7FB', chipLine: '#B9C7DA', mark: 'rgba(0,106,128,0.10)',
  },
};

const SANS = "-apple-system, 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

function chip(x, label, t) {
  const w = Math.round(label.length * 13.6 + 44);
  return {
    w,
    svg: `<rect x="${x}" y="0" width="${w}" height="48" rx="24" fill="${t.chipBg}" stroke="${t.chipLine}" stroke-width="1.5"/>` +
      `<circle cx="${x + 24}" cy="24" r="5" fill="${t.accent}"/>` +
      `<text x="${x + 40}" y="32" font-family="${SANS}" font-size="23" font-weight="600" fill="${t.text}">${label}</text>`,
  };
}

function build(theme) {
  const t = THEMES[theme];
  let chips = '';
  let x = 96;
  for (const label of ['Exact line to fix', 'WCAG rule cited', 'Fix value given']) {
    const c = chip(x, label, t);
    chips += c.svg;
    x += c.w + 16;
  }
  const code = [
    ['117', '.swatch-25 { color: #a4b5c6; }', false],
    ['118', '.swatch-26 { color: #b5c6d7; }', true],
    ['119', '.swatch-27 { color: #c6d7e8; }', false],
  ];
  let lines = '';
  code.forEach(([n, src, hit], i) => {
    const y = 52 + i * 44;
    if (hit) lines += `<rect x="1" y="${y - 30}" width="598" height="44" fill="${t.mark}"/><rect x="1" y="${y - 30}" width="4" height="44" fill="${t.accent}"/>`;
    lines += `<text x="26" y="${y}" font-family="${MONO}" font-size="22" font-weight="${hit ? 700 : 400}" fill="${hit ? t.accent : t.muted}">${n}</text>`;
    lines += `<text x="90" y="${y}" font-family="${MONO}" font-size="22" fill="${hit ? t.text : t.muted}">${src}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 640" width="1280" height="640" role="img"
     aria-label="ui-ux-suite: design bugs by line number. Line 118 of styles.css has text color #b5c6d7 at 1.75 to 1 contrast; the fix is #6d7882 at 4.51 to 1. Run npx ui-ux-suite dot.">
  <title>ui-ux-suite: design bugs, by line number</title>
  <!-- Built by scripts/build-hero.js. Do not edit by hand. -->
  <rect width="1280" height="640" fill="${t.bg}"/>
  <text x="96" y="84" font-family="${MONO}" font-size="24" font-weight="700" fill="${t.accent}">ui-ux-suite</text>
  <text x="96" y="160" font-family="${SANS}" font-size="64" font-weight="800" letter-spacing="-1.5" fill="${t.text}">Design bugs, by line number</text>
  <g transform="translate(0,196)">${chips}</g>

  <g transform="translate(96,292)">
    <rect x="0" y="0" width="600" height="160" rx="14" fill="${t.panel}" stroke="${t.panelLine}" stroke-width="1.5"/>
    <text x="26" y="-12" font-family="${MONO}" font-size="18" fill="${t.muted}">src/styles.css</text>
    ${lines}
  </g>

  <g transform="translate(744,292)" font-family="${MONO}">
    <rect x="0" y="0" width="160" height="112" rx="12" fill="#FFFFFF" stroke="${t.panelLine}" stroke-width="1.5"/>
    <text x="80" y="74" text-anchor="middle" font-family="${SANS}" font-size="48" font-weight="700" fill="#b5c6d7">Aa</text>
    <text x="80" y="140" text-anchor="middle" font-size="20" fill="${t.sub}">#b5c6d7</text>
    <text x="80" y="168" text-anchor="middle" font-size="20" font-weight="700" fill="${t.bad}">1.75:1 fail</text>
    <path d="M176 56 H 248" stroke="${t.accent}" stroke-width="4" stroke-linecap="round"/>
    <path d="M236 44 L 250 56 L 236 68" fill="none" stroke="${t.accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="266" y="0" width="160" height="112" rx="12" fill="#FFFFFF" stroke="${t.panelLine}" stroke-width="1.5"/>
    <text x="346" y="74" text-anchor="middle" font-family="${SANS}" font-size="48" font-weight="700" fill="#6d7882">Aa</text>
    <text x="346" y="140" text-anchor="middle" font-size="20" fill="${t.sub}">#6d7882</text>
    <text x="346" y="168" text-anchor="middle" font-size="20" font-weight="700" fill="${t.good}">4.51:1 pass</text>
  </g>

  <g transform="translate(96,500)">
    <rect x="0" y="0" width="372" height="56" rx="10" fill="${t.panel}" stroke="${t.accent}" stroke-width="1.5"/>
    <text x="24" y="37" font-family="${MONO}" font-size="26" fill="${t.text}"><tspan fill="${t.accent}">$</tspan> npx ui-ux-suite .</text>
  </g>
  <text x="96" y="604" font-family="${MONO}" font-size="18" fill="${t.muted}">Any MCP client · Agent skills · CLI · Tested: Claude Code, Cursor, Codex, Gemini CLI, OpenCode</text>
</svg>
`;
}

const dir = path.join(__dirname, '..', '.github', 'assets');
fs.writeFileSync(path.join(dir, 'hero-dark.svg'), build('dark'));
fs.writeFileSync(path.join(dir, 'hero-light.svg'), build('light'));
fs.writeFileSync(path.join(dir, 'social-preview.svg'), build('dark'));
console.log('wrote hero-dark.svg, hero-light.svg, social-preview.svg');
