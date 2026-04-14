/**
 * UI/UX Suite — Color Engine
 * Color math: contrast ratios, harmony, APCA, palette generation, near-duplicate detection.
 */

// --- Color parsing ---

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255),
  };
}

// --- Luminance & Contrast ---

function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagLevel(ratio, isLargeText = false) {
  if (isLargeText) {
    if (ratio >= 4.5) return 'AAA';
    if (ratio >= 3) return 'AA';
    return 'FAIL';
  }
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'FAIL';
}

// --- APCA (Accessible Perceptual Contrast Algorithm) ---
// Simplified implementation based on APCA-W3 0.1.9

function sRGBtoY(r, g, b) {
  const linearize = c => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126729 * linearize(r) + 0.7151522 * linearize(g) + 0.0721750 * linearize(b);
}

function apcaContrast(textRgb, bgRgb) {
  let txtY = sRGBtoY(textRgb.r, textRgb.g, textRgb.b);
  let bgY = sRGBtoY(bgRgb.r, bgRgb.g, bgRgb.b);

  // Clamp
  txtY = txtY > 0 ? txtY : 0;
  bgY = bgY > 0 ? bgY : 0;

  const normBG = 0.56;
  const normTXT = 0.57;
  const revBG = 0.62;
  const revTXT = 0.65;
  const scaleBoW = 1.14;
  const scaleWoB = 1.14;
  const loClip = 0.1;
  const loBoWoffset = 0.027;
  const loWoBoffset = 0.027;

  let SAPC;
  if (bgY > txtY) {
    SAPC = (Math.pow(bgY, normBG) - Math.pow(txtY, normTXT)) * scaleBoW;
    return SAPC < loClip ? 0 : (SAPC - loBoWoffset) * 100;
  } else {
    SAPC = (Math.pow(bgY, revBG) - Math.pow(txtY, revTXT)) * scaleWoB;
    return SAPC > -loClip ? 0 : (SAPC + loWoBoffset) * 100;
  }
}

function apcaLevel(lc) {
  const abs = Math.abs(lc);
  if (abs >= 90) return 'Fluent — body text OK';
  if (abs >= 75) return 'Readable — 18px+ body text';
  if (abs >= 60) return 'Large text — 24px+';
  if (abs >= 45) return 'Headlines — 36px+';
  if (abs >= 30) return 'Non-text — icons, borders';
  if (abs >= 15) return 'Minimum — decorative only';
  return 'Invisible — insufficient contrast';
}

// --- Color distance (deltaE simplified CIE76) ---

function deltaE(rgb1, rgb2) {
  // Simplified perceptual distance using weighted RGB
  const rMean = (rgb1.r + rgb2.r) / 2;
  const dR = rgb1.r - rgb2.r;
  const dG = rgb1.g - rgb2.g;
  const dB = rgb1.b - rgb2.b;
  return Math.sqrt(
    (2 + rMean / 256) * dR * dR +
    4 * dG * dG +
    (2 + (255 - rMean) / 256) * dB * dB
  );
}

function findNearDuplicates(colors, threshold = 15) {
  const duplicates = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const d = deltaE(colors[i].rgb, colors[j].rgb);
      if (d < threshold && d > 0) {
        duplicates.push({
          color1: colors[i],
          color2: colors[j],
          distance: Math.round(d * 10) / 10,
        });
      }
    }
  }
  return duplicates;
}

// --- Palette generation ---

function generateNeutralScale(baseHue, baseSat, steps = 11) {
  const scale = [];
  const lightnesses = [98, 95, 90, 82, 70, 55, 42, 32, 24, 18, 10];
  for (let i = 0; i < steps; i++) {
    const s = Math.max(1, baseSat * (1 - lightnesses[i] / 120));
    const { r, g, b } = hslToRgb(baseHue, s, lightnesses[i]);
    scale.push({
      step: (i + 1) * 100,
      hex: rgbToHex(r, g, b),
      hsl: { h: baseHue, s: Math.round(s), l: lightnesses[i] },
    });
  }
  return scale;
}

function generateSemanticColor(hue, role) {
  const configs = {
    success: { s: 70, l: 45 },
    error: { s: 75, l: 48 },
    warning: { s: 85, l: 50 },
    info: { s: 65, l: 50 },
  };
  const config = configs[role] || { s: 60, l: 50 };
  const { r, g, b } = hslToRgb(hue, config.s, config.l);
  return {
    base: rgbToHex(r, g, b),
    light: rgbToHex(...Object.values(hslToRgb(hue, config.s * 0.6, 92))),
    dark: rgbToHex(...Object.values(hslToRgb(hue, config.s, config.l * 0.7))),
  };
}

function generateComplementary(hue) {
  return (hue + 180) % 360;
}

function generateSplitComplementary(hue) {
  return [(hue + 150) % 360, (hue + 210) % 360];
}

function generateAnalogous(hue) {
  return [(hue + 330) % 360, (hue + 30) % 360];
}

function generateTriadic(hue) {
  return [(hue + 120) % 360, (hue + 240) % 360];
}

// --- Dark mode surface generation ---

function generateDarkSurfaces(accentHue) {
  // Proper dark mode: not pure black, slight warm/cool tint, elevation = lighter
  const tint = accentHue || 220; // default blue-ish
  return {
    background: rgbToHex(...Object.values(hslToRgb(tint, 10, 7))),     // deepest
    surface:    rgbToHex(...Object.values(hslToRgb(tint, 10, 11))),    // cards
    elevated:   rgbToHex(...Object.values(hslToRgb(tint, 10, 15))),    // popovers
    overlay:    rgbToHex(...Object.values(hslToRgb(tint, 10, 20))),    // modals
  };
}

function generateLightSurfaces() {
  return {
    background: '#ffffff',
    surface:    '#f9fafb',
    elevated:   '#ffffff',
    overlay:    '#ffffff',
  };
}

module.exports = {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  relativeLuminance,
  contrastRatio,
  wcagLevel,
  sRGBtoY,
  apcaContrast,
  apcaLevel,
  deltaE,
  findNearDuplicates,
  generateNeutralScale,
  generateSemanticColor,
  generateComplementary,
  generateSplitComplementary,
  generateAnalogous,
  generateTriadic,
  generateDarkSurfaces,
  generateLightSurfaces,
};
