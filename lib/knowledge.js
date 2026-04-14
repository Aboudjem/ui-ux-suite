/**
 * UI/UX Suite — Built-in Design Knowledge Base
 * Queryable knowledge for agents: principles, psychology, patterns, recommendations.
 */

const KNOWLEDGE = {
  // --- Color knowledge ---
  color: {
    harmony: {
      complementary: 'Two colors opposite on the color wheel. High contrast, vibrant. Best for: primary + accent. Risk: can feel harsh if both saturated.',
      'split-complementary': 'Base color + two adjacent to its complement. Versatile, less tension than complementary. Best for: most UIs.',
      analogous: 'Colors adjacent on the wheel. Harmonious, calm. Best for: background systems, gradients. Risk: low contrast between colors.',
      triadic: 'Three colors equally spaced. Vibrant, balanced. Best for: playful/bold brands. Risk: hard to balance, can feel chaotic.',
      monochromatic: 'Single hue, varied lightness/saturation. Elegant, cohesive. Best for: minimal UIs, dark mode. Risk: can feel flat.',
    },
    semantics: {
      red: { meaning: 'Danger, error, destructive, passion, urgency', usage: 'Error states, destructive actions, alerts, sale badges' },
      orange: { meaning: 'Warning, energy, warmth, enthusiasm', usage: 'Warning states, highlights, CTAs (warm brands)' },
      yellow: { meaning: 'Caution, attention, optimism', usage: 'Warning (lighter), highlights, badges. Avoid for text — low contrast.' },
      green: { meaning: 'Success, growth, confirmation, nature', usage: 'Success states, confirmations, positive metrics, online status' },
      blue: { meaning: 'Trust, calm, professionalism, stability', usage: 'Primary in most SaaS/enterprise, info states, links, selection' },
      purple: { meaning: 'Premium, creative, wisdom, luxury', usage: 'Premium features, creative tools, luxury brands' },
      pink: { meaning: 'Playful, warm, compassionate', usage: 'Consumer apps, health/wellness, social platforms' },
      gray: { meaning: 'Neutral, professional, secondary', usage: 'Text, borders, backgrounds, disabled states, dividers' },
    },
    darkMode: {
      rules: [
        'Never just invert light mode — redesign surface hierarchy',
        'Use dark gray (#121212-#1a1a1a) not pure black (#000) for backgrounds',
        'Higher elevation = lighter surface (opposite of light mode)',
        'Reduce color saturation by 10-20% — vivid colors strain eyes on dark backgrounds',
        'Use white at 87% opacity for primary text, 60% for secondary, 38% for disabled',
        'Increase contrast ratios — aim for 15.8:1 for primary text on dark surfaces',
        'Test with actual dark mode users, not just visual preference',
      ],
    },
    byProductType: {
      saas: 'Cool neutrals, blue primary, minimal accent. Professional, trustworthy.',
      finance: 'Deep blue/green, conservative palette. Trust and stability first.',
      health: 'Teal/green primary, warm neutrals. Calming, approachable.',
      media: 'Vibrant accents, dark surfaces, high contrast. Engaging, immersive.',
      consumer: 'Warm, energetic, personality-driven. Memorable, fun.',
      enterprise: 'Muted, professional, information-dense-friendly. Neutral-heavy.',
      ecommerce: 'Brand-driven primary, orange/green CTAs. Conversion-optimized.',
    },
  },

  // --- Typography knowledge ---
  typography: {
    fontRecommendations: {
      'modern-clean': ['Inter', 'Geist', 'DM Sans', 'Outfit'],
      'friendly-warm': ['Plus Jakarta Sans', 'Nunito Sans', 'Source Sans 3'],
      'neutral-professional': ['Instrument Sans', 'General Sans', 'Satoshi'],
      'editorial-premium': ['Fraunces', 'Lora', 'Playfair Display'],
      'technical-code': ['JetBrains Mono', 'Fira Code', 'Geist Mono'],
    },
    minimumSizes: {
      body: { desktop: 16, mobile: 16, minimum: 14 },
      caption: { desktop: 12, mobile: 12, minimum: 11 },
      label: { desktop: 13, mobile: 13, minimum: 12 },
      h1: { desktop: 36, mobile: 28 },
      h2: { desktop: 28, mobile: 24 },
      h3: { desktop: 22, mobile: 20 },
      button: { desktop: 14, mobile: 16 },
    },
    lineHeightRules: {
      body: '1.5-1.7 for optimal readability',
      headings: '1.1-1.3 for visual compactness',
      captions: '1.4-1.5',
      buttons: '1.0-1.2 (single line)',
    },
    measure: {
      optimal: '45-75 characters per line for body text',
      mobile: '30-45 characters per line',
      maximum: 'Never exceed 80 characters — reading becomes laborious',
    },
  },

  // --- Component knowledge ---
  components: {
    stateChecklist: [
      'default', 'hover', 'active/pressed', 'focus', 'focus-visible',
      'disabled', 'loading', 'error', 'success', 'empty', 'skeleton',
    ],
    buttonHierarchy: {
      primary: 'Filled, brand color. One per section max. Main action.',
      secondary: 'Outlined or muted fill. Supporting action.',
      ghost: 'Text-only or very subtle. Tertiary action.',
      destructive: 'Red/danger color. Destructive actions only.',
      link: 'Looks like a link. Navigation, not form submission.',
    },
    formBestPractices: [
      'Always use visible labels — never placeholder-only',
      'Group related fields and label the groups',
      'Show validation inline as user types (debounced)',
      'Error messages should say what to fix, not just what\'s wrong',
      'Mark optional fields, not required (most fields should be required)',
      'Use appropriate input types (email, tel, url, number)',
      'Support autocomplete attributes for faster filling',
      'Multi-step forms: show progress, allow going back, save state',
    ],
    loadingPatterns: {
      skeleton: 'Best for: content areas, lists, cards. Shows layout shape before data.',
      spinner: 'Best for: single actions (button click, form submit). Quick feedback.',
      progress: 'Best for: file uploads, multi-step processes. Shows completion %.',
      optimistic: 'Best for: social actions (like, follow, comment). Instant feedback, rollback on fail.',
      progressive: 'Best for: images, heavy content. Show what you have, load more.',
    },
  },

  // --- Accessibility knowledge ---
  accessibility: {
    contrastMinimums: {
      'WCAG AA normal text': '4.5:1',
      'WCAG AA large text (18px+ or 14px bold)': '3:1',
      'WCAG AAA normal text': '7:1',
      'WCAG AAA large text': '4.5:1',
      'Non-text (icons, borders)': '3:1',
      'APCA body text recommendation': 'Lc 75+',
      'APCA large text': 'Lc 60+',
      'APCA non-text': 'Lc 30+',
    },
    touchTargets: {
      'WCAG 2.2 AA': '24x24 CSS pixels minimum',
      'iOS HIG': '44x44 points',
      'Material Design': '48x48 dp',
      'Recommendation': '44x44 CSS pixels for primary actions, 24x24 minimum for secondary',
    },
    quickWins: [
      'Add visible focus indicators (:focus-visible with brand color ring)',
      'Ensure all images have alt text (decorative images get alt="")',
      'Add skip-to-content link as first focusable element',
      'Use semantic HTML (nav, main, header, footer, article, section)',
      'Add aria-label to icon-only buttons',
      'Support prefers-reduced-motion: remove non-essential animations',
      'Ensure form inputs have associated labels',
      'Add aria-live regions for dynamic content updates',
      'Use logical tab order (avoid positive tabindex)',
      'Test with keyboard only — every action should be reachable',
    ],
  },

  // --- Layout knowledge ---
  layout: {
    spacingScale: 'Use a 4px or 8px base with multipliers: 0, 2, 4, 8, 12, 16, 24, 32, 48, 64',
    whitespace: [
      'Proximity: related items should be closer together than unrelated items',
      'Grouping: use consistent spacing to create visual groups',
      'Breathing room: key actions need surrounding whitespace to stand out',
      'Content density: match density to user expertise (power users tolerate more)',
    ],
    containerWidths: {
      'Content (reading)': '680-720px — optimal for long-form text',
      'App content': '1200-1280px — standard app layout width',
      'Wide content': '1440px — dashboards, data-heavy layouts',
      'Full width': '100% with padding — immersive layouts only',
    },
  },

  // --- Interaction knowledge ---
  interaction: {
    timing: {
      instant: '0-100ms — button state changes, toggles',
      fast: '100-200ms — micro-interactions, small element transitions',
      normal: '200-300ms — page element transitions, modal open',
      slow: '300-500ms — complex transitions, page transitions',
      avoid: '> 500ms for UI transitions (feels sluggish)',
    },
    easing: {
      'ease-out': 'Elements entering view — starts fast, decelerates (most common)',
      'ease-in': 'Elements exiting view — starts slow, accelerates',
      'ease-in-out': 'Elements that stay in view but transform',
      'linear': 'Loading bars, opacity fades only',
      'spring': 'Playful, bouncy — consumer apps, celebrations',
    },
    principles: [
      'Every action should have visible feedback within 100ms',
      'Use motion to show cause and effect (element moved because user dragged)',
      'Animate the property that changed (size, position, color — not random properties)',
      'Enter from where attention is, exit to where it came from',
      'Respect prefers-reduced-motion: keep essential feedback, remove decorative motion',
    ],
  },

  // --- Style directions ---
  styleDirections: {
    'neo-minimal': { fit: ['productivity', 'SaaS', 'tools'], durability: 'timeless', risk: 'feels empty if content sparse' },
    'soft-material': { fit: ['consumer apps', 'dashboards'], durability: 'durable', risk: 'can look generic' },
    'editorial': { fit: ['content', 'media', 'portfolios'], durability: 'durable', risk: 'hard for data-heavy UI' },
    'glass-depth': { fit: ['dashboards', 'creative tools'], durability: 'moderate', risk: 'performance, readability' },
    'dark-luxury': { fit: ['finance', 'crypto', 'media'], durability: 'niche-stable', risk: 'a11y, eye strain' },
    'warm-organic': { fit: ['health', 'wellness', 'community'], durability: 'growing', risk: 'unprofessional for B2B' },
    'dense-functional': { fit: ['enterprise', 'dev tools'], durability: 'niche-stable', risk: 'overwhelming for casual users' },
    'bold-expressive': { fit: ['consumer', 'social', 'entertainment'], durability: 'trend-dependent', risk: 'polarizing' },
    'calm-tech': { fit: ['health', 'finance', 'note-taking'], durability: 'growing', risk: 'can feel boring' },
    'system-native': { fit: ['utilities', 'system tools', 'mobile-first'], durability: 'permanent', risk: 'less distinctive' },
  },
};

// --- Query function ---

function queryKnowledge(category, key) {
  const parts = key ? key.split('.') : [];
  let result = KNOWLEDGE[category];
  for (const part of parts) {
    if (result && typeof result === 'object') {
      result = result[part];
    } else {
      return null;
    }
  }
  return result;
}

function searchKnowledge(query) {
  const results = [];
  const q = query.toLowerCase();

  function search(obj, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof value === 'string') {
        if (value.toLowerCase().includes(q) || key.toLowerCase().includes(q)) {
          results.push({ path: currentPath, content: value });
        }
      } else if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string' && item.toLowerCase().includes(q)) {
            results.push({ path: currentPath, content: item });
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        search(value, currentPath);
      }
    }
  }

  search(KNOWLEDGE);
  return results;
}

module.exports = {
  KNOWLEDGE,
  queryKnowledge,
  searchKnowledge,
};
