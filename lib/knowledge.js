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

  // --- Laws of UX ---
  laws: {
    'hicks-law': {
      name: "Hick's Law",
      slug: 'hicks-law',
      definition: 'The time to make a decision grows logarithmically with the number of equally probable choices presented.',
      whenItApplies: 'Any screen where the user must pick one option from a visible list: nav menus, settings, pricing tiers, quick-action dropdowns.',
      violationExample: 'A 12-item top navigation with no categorization forces the user to scan all 12 labels before committing to a click.',
      fixExample: 'Collapse 12 items into 3 or 4 labeled sections. Surface the top 5 to 7 tasks at the top level; hide the long tail behind a "More" expander.',
      tags: {
        dimension: ['flows', 'hierarchy'],
        cognitiveProcess: 'decision-making',
        surface: ['navigation', 'forms', 'content'],
      },
      source: 'Hick, W. E. (1952). On the rate of gain of information. Quarterly Journal of Experimental Psychology, 4(1), 11-26.',
    },
    'fittss-law': {
      name: "Fitts's Law",
      slug: 'fittss-law',
      definition: 'The time to acquire a target is a function of the distance to and size of the target; closer and bigger targets are faster to hit.',
      whenItApplies: 'Any interactive control the user must click, tap, or hover: buttons, links, form fields, touch targets, menu items.',
      violationExample: 'A 16x16 pixel icon-only close button in the top corner of a modal, far from the user pointer, is slow and error-prone to hit.',
      fixExample: 'Use a 44x44 CSS pixel minimum touch target, place primary actions near the user last focus, and make the click area larger than the visible icon.',
      tags: {
        dimension: ['accessibility', 'interaction', 'responsive'],
        cognitiveProcess: 'motor',
        surface: ['navigation', 'forms', 'layout'],
      },
      source: 'Fitts, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement. Journal of Experimental Psychology, 47(6), 381-391.',
    },
    'millers-law': {
      name: "Miller's Law",
      slug: 'millers-law',
      definition: 'Working memory holds roughly seven (plus or minus two) discrete items before recall degrades.',
      whenItApplies: 'Lists, navigation menus, form sections, feature grids, any UI that asks the user to hold information in mind while acting.',
      violationExample: 'A single-page form with 20 unlabeled fields in one column overwhelms working memory and produces abandonment.',
      fixExample: 'Chunk the 20 fields into 3 to 4 labeled groups of 5 to 7 fields each. Use progressive disclosure so the user only sees one chunk at a time.',
      tags: {
        dimension: ['flows', 'typography', 'layout'],
        cognitiveProcess: 'memory',
        surface: ['forms', 'navigation', 'content'],
      },
      source: 'Miller, G. A. (1956). The magical number seven, plus or minus two: Some limits on our capacity for processing information. Psychological Review, 63(2), 81-97.',
    },
    'jakobs-law': {
      name: "Jakob's Law",
      slug: 'jakobs-law',
      definition: 'Users spend most of their time on other sites, so they expect your site to work the same way as the sites they already know.',
      whenItApplies: 'Any platform-level convention: cart icons, logo placement, nav bars, search icons, form layouts, back-button behavior, dark-mode toggles.',
      violationExample: 'Moving the cart icon from the top right to the bottom left because it "looks nicer" forces repeat e-commerce users to hunt.',
      fixExample: 'Keep the cart icon top-right. Invent only where it earns attention; copy convention where it lowers load.',
      tags: {
        dimension: ['components', 'platform', 'responsive'],
        cognitiveProcess: 'decision-making',
        surface: ['navigation', 'layout', 'forms'],
      },
      source: 'Nielsen, J. (2000). End of Web Design. Nielsen Norman Group Alertbox.',
    },
    'doherty-threshold': {
      name: 'Doherty Threshold',
      slug: 'doherty-threshold',
      definition: 'Productivity rises sharply when system response time drops below 400 milliseconds because the user stays in flow.',
      whenItApplies: 'Any interaction with perceptible latency: search, filter, sort, upload, save, navigate, autocomplete.',
      violationExample: 'A type-ahead search that waits 1200ms after each keystroke breaks flow and encourages the user to stop typing.',
      fixExample: 'Debounce to 150ms, render results optimistically, show a skeleton within 100ms, and stream results as they arrive.',
      tags: {
        dimension: ['performance', 'interaction'],
        cognitiveProcess: 'attention',
        surface: ['timing', 'motion', 'data-display'],
      },
      source: 'Doherty, W. J., & Thadhani, A. J. (1982). The Economic Value of Rapid Response Time. IBM Report GE20-0752-0.',
    },
    'peak-end-rule': {
      name: 'Peak-End Rule',
      slug: 'peak-end-rule',
      definition: 'People judge an experience largely by how they felt at its peak and at its end, not by the sum or average of every moment.',
      whenItApplies: 'Onboarding, checkout, upgrade flows, error recovery, account cancellation, any multi-step flow with a memorable outcome.',
      violationExample: 'A checkout that succeeds but ends on a plain "Thank you" page misses the chance to lift the memory of the purchase.',
      fixExample: 'End with a delightful confirmation: order summary, estimated arrival, a small celebratory animation, and a clear next action.',
      tags: {
        dimension: ['interaction', 'polish', 'performance'],
        cognitiveProcess: 'memory',
        surface: ['onboarding', 'content', 'motion'],
      },
      source: 'Kahneman, D., Fredrickson, B. L., Schreiber, C. A., & Redelmeier, D. A. (1993). When more pain is preferred to less: Adding a better end. Psychological Science, 4(6), 401-405.',
    },
    'goal-gradient-effect': {
      name: 'Goal-Gradient Effect',
      slug: 'goal-gradient-effect',
      definition: 'Motivation increases as people approach a goal; progress near the finish line accelerates behavior.',
      whenItApplies: 'Multi-step forms, onboarding, profile completion, loyalty programs, download progress, upload progress.',
      violationExample: 'A 5-step signup with no progress indicator leaves the user unsure whether the next click is the last or the midpoint.',
      fixExample: 'Show a progress bar with step counts ("3 of 5") and preload the final step so the user can see the goal approaching.',
      tags: {
        dimension: ['interaction', 'flows', 'performance'],
        cognitiveProcess: 'decision-making',
        surface: ['onboarding', 'forms', 'timing'],
      },
      source: 'Hull, C. L. (1932). The goal-gradient hypothesis and maze learning. Psychological Review, 39(1), 25-43.',
    },
    'aesthetic-usability-effect': {
      name: 'Aesthetic-Usability Effect',
      slug: 'aesthetic-usability-effect',
      definition: 'Users perceive more aesthetically pleasing designs as easier to use, even when objective usability is the same.',
      whenItApplies: 'Any first-impression surface: landing pages, onboarding, marketing sites, app stores, product demos.',
      violationExample: 'A powerful tool with a cluttered, unstyled interface scores lower on perceived usability in user tests than a weaker, polished tool.',
      fixExample: 'Invest in typography, consistent spacing, and a calm palette before adding features. Polish raises tolerance for friction.',
      tags: {
        dimension: ['polish', 'color', 'typography', 'accessibility'],
        cognitiveProcess: 'perception',
        surface: ['layout', 'content', 'onboarding'],
      },
      source: 'Kurosu, M., & Kashimura, K. (1995). Apparent usability vs. inherent usability: Experimental analysis on the determinants of the apparent usability. CHI 95 Conference Companion, 292-293.',
    },
    'serial-position-effect': {
      name: 'Serial Position Effect',
      slug: 'serial-position-effect',
      definition: 'Items at the beginning and end of a list are recalled more accurately than items in the middle.',
      whenItApplies: 'Nav menus, pricing tables, feature lists, FAQ, onboarding steps, long dropdowns, any ordered list the user must remember.',
      violationExample: 'Placing the most important nav item in the middle of a 9-item menu buries it below less-critical options.',
      fixExample: 'Anchor the most memorable items first and last. Place the top task at position 1 and the secondary priority at position N.',
      tags: {
        dimension: ['hierarchy', 'flows'],
        cognitiveProcess: 'memory',
        surface: ['navigation', 'content', 'data-display'],
      },
      source: 'Ebbinghaus, H. (1913). Memory: A Contribution to Experimental Psychology. (trans. Ruger & Bussenius). Teachers College, Columbia University.',
    },
    'von-restorff-effect': {
      name: 'Von Restorff Effect',
      slug: 'von-restorff-effect',
      definition: 'An item that stands out from its peers is remembered better than items that blend in.',
      whenItApplies: 'Primary CTAs, feature callouts, pricing recommendations, notifications, error states, destructive actions.',
      violationExample: 'A "Buy now" button styled identically to five secondary actions in the same row fails to draw the eye.',
      fixExample: 'Give the primary action one distinctive color, weight, or size. Reserve that treatment for the one action you want remembered.',
      tags: {
        dimension: ['hierarchy', 'color', 'components'],
        cognitiveProcess: 'attention',
        surface: ['layout', 'navigation', 'content'],
      },
      source: 'von Restorff, H. (1933). Uber die Wirkung von Bereichsbildungen im Spurenfeld. Psychologische Forschung, 18, 299-342.',
    },
    'zeigarnik-effect': {
      name: 'Zeigarnik Effect',
      slug: 'zeigarnik-effect',
      definition: 'People remember uncompleted tasks better than completed ones; unfinished work holds attention.',
      whenItApplies: 'Onboarding checklists, profile completion, unsent drafts, tutorial progress, cart abandonment, half-finished forms.',
      violationExample: 'Hiding a half-complete profile behind a settings page lets the user forget it and never finish.',
      fixExample: 'Surface a visible "2 of 5 steps done" indicator on the dashboard until the checklist is complete.',
      tags: {
        dimension: ['interaction', 'flows'],
        cognitiveProcess: 'attention',
        surface: ['onboarding', 'forms', 'data-display'],
      },
      source: 'Zeigarnik, B. (1927). Uber das Behalten von erledigten und unerledigten Handlungen. Psychologische Forschung, 9, 1-85.',
    },
    'pareto-principle': {
      name: 'Pareto Principle',
      slug: 'pareto-principle',
      definition: 'Roughly 80 percent of outcomes come from 20 percent of causes; a small fraction of features drives most value.',
      whenItApplies: 'Feature prioritization, IA decisions, nav surfacing, dashboard layout, settings defaults, support triage.',
      violationExample: 'Giving every feature equal weight in the main nav dilutes attention on the few features most users actually need.',
      fixExample: 'Identify the top 20 percent of features by usage. Surface them in the primary nav and push the long tail behind a secondary layer.',
      tags: {
        dimension: ['flows', 'hierarchy'],
        cognitiveProcess: 'decision-making',
        surface: ['navigation', 'layout', 'content'],
      },
      source: 'Pareto, V. (1896). Cours d economie politique. Lausanne. Popularized by Juran, J. M. (1951). Quality Control Handbook.',
    },
    'parkinsons-law': {
      name: "Parkinson's Law",
      slug: 'parkinsons-law',
      definition: 'Work expands to fill the time available for its completion; users will spend whatever time or space you give them.',
      whenItApplies: 'Input fields, time pickers, meeting scheduling, upload limits, onboarding pacing, comment boxes.',
      violationExample: 'A 2000-character comment box invites 2000-character comments even when 100 would serve the thread better.',
      fixExample: 'Set a visible 280-character limit with a live counter to nudge concise input. Size fields to fit expected content.',
      tags: {
        dimension: ['flows', 'interaction'],
        cognitiveProcess: 'decision-making',
        surface: ['forms', 'timing', 'content'],
      },
      source: 'Parkinson, C. N. (1955). Parkinson s Law. The Economist, November 19.',
    },
    'postels-law': {
      name: "Postel's Law",
      slug: 'postels-law',
      definition: 'Be conservative in what you do, be liberal in what you accept from others; tolerate varied input but emit strict output.',
      whenItApplies: 'Form validation, search input, file upload, URL parsing, data import, copy-paste, international formatting.',
      violationExample: 'Rejecting a phone number with spaces or dashes forces the user to reformat instead of accepting any valid pattern.',
      fixExample: 'Normalize the input server-side: strip spaces, dashes, and parentheses, then validate. Accept several formats, store one canonical form.',
      tags: {
        dimension: ['components', 'accessibility', 'platform'],
        cognitiveProcess: 'decision-making',
        surface: ['forms', 'data-display', 'content'],
      },
      source: 'Postel, J. (1980). RFC 761: Transmission Control Protocol. IETF.',
    },
    'teslers-law': {
      name: "Tesler's Law of Conservation of Complexity",
      slug: 'teslers-law',
      definition: 'Every application has an irreducible amount of complexity; either the user deals with it or the system does.',
      whenItApplies: 'Onboarding, advanced settings, power-user features, migration flows, import/export, permissions models.',
      violationExample: 'A blank timezone field asks every user to discover and configure their own offset string instead of defaulting from the browser.',
      fixExample: 'Default timezone from the browser. Hide the raw offset behind an "Advanced" toggle for the users who need to override it.',
      tags: {
        dimension: ['components', 'flows'],
        cognitiveProcess: 'decision-making',
        surface: ['forms', 'onboarding', 'navigation'],
      },
      source: 'Saffer, D. (2010). Designing for Interaction (2nd ed.). New Riders.',
    },
    'occams-razor': {
      name: "Occam's Razor",
      slug: 'occams-razor',
      definition: 'Among competing designs, prefer the one with fewer moving parts; simpler explanations and interfaces win.',
      whenItApplies: 'Feature decisions, component API, settings, dialogs, nav structure, empty states, error messages.',
      violationExample: 'A settings panel with 40 toggles where 5 presets would cover 90 percent of users buries the few that matter.',
      fixExample: 'Ship 3 to 5 named presets. Hide the 40 toggles behind "Customize" for the 10 percent who actually need them.',
      tags: {
        dimension: ['flows', 'platform'],
        cognitiveProcess: 'decision-making',
        surface: ['layout', 'content', 'navigation'],
      },
      source: 'William of Ockham, c. 1323. Summa Logicae. Modern UX framing: Nielsen, J. (1994). Usability Engineering. Academic Press.',
    },
    'law-of-proximity': {
      name: 'Law of Proximity',
      slug: 'law-of-proximity',
      definition: 'Objects near each other are perceived as related; spatial grouping communicates logical grouping.',
      whenItApplies: 'Forms, nav, card grids, list items, labels, tooltips, any layout where relationships matter.',
      violationExample: 'A label placed 40px from its input but 16px from the next field tells the eye the label belongs to the wrong input.',
      fixExample: 'Keep label-to-input spacing tight (4 to 8px) and input-to-next-field loose (24 to 32px). Use the spacing scale to signal grouping.',
      tags: {
        dimension: ['layout', 'hierarchy'],
        cognitiveProcess: 'perception',
        surface: ['forms', 'layout', 'content'],
      },
      source: 'Wertheimer, M. (1923). Untersuchungen zur Lehre von der Gestalt II. Psychologische Forschung, 4, 301-350.',
    },
    'law-of-common-region': {
      name: 'Law of Common Region',
      slug: 'law-of-common-region',
      definition: 'Objects inside a shared bounded region are perceived as a group, even when distant from one another.',
      whenItApplies: 'Cards, panels, fieldset borders, grouped list items, modal content, sidebar sections.',
      violationExample: 'Placing a Save button outside the card it logically belongs to disconnects it visually from its form.',
      fixExample: 'Put the Save button inside the card border. Use a subtle background or outline to bind related controls into one region.',
      tags: {
        dimension: ['layout', 'components', 'hierarchy'],
        cognitiveProcess: 'perception',
        surface: ['layout', 'forms', 'content'],
      },
      source: 'Palmer, S. E. (1992). Common region: A new principle of perceptual grouping. Cognitive Psychology, 24(3), 436-447.',
    },
    'law-of-pragnanz': {
      name: 'Law of Pragnanz',
      slug: 'law-of-pragnanz',
      definition: 'People perceive ambiguous or complex images in their simplest possible form; the eye prefers regularity and order.',
      whenItApplies: 'Icon design, logo placement, illustration, dashboard charts, navigation diagrams, empty states.',
      violationExample: 'An icon with 8 tiny embellishments reads as noise at 16px; the eye simplifies it to a blob.',
      fixExample: 'Strip the icon to 2 to 3 strokes. Test at the smallest size it will ship; if the simplified shape still reads, ship it.',
      tags: {
        dimension: ['hierarchy', 'polish', 'typography'],
        cognitiveProcess: 'perception',
        surface: ['media', 'layout', 'content'],
      },
      source: 'Koffka, K. (1935). Principles of Gestalt Psychology. Harcourt, Brace and World.',
    },
    'law-of-similarity': {
      name: 'Law of Similarity',
      slug: 'law-of-similarity',
      definition: 'Elements that look alike are perceived as related, even when separated in space.',
      whenItApplies: 'Button systems, status badges, link styles, list items, tag pills, color-coded categories.',
      violationExample: 'Using identical red styling for both destructive actions and error states blurs the meaning of the signal.',
      fixExample: 'Reserve one color ramp per meaning. Use red for destructive actions only; use a separate treatment (icon, copy) for errors.',
      tags: {
        dimension: ['color', 'components', 'hierarchy'],
        cognitiveProcess: 'perception',
        surface: ['layout', 'content', 'navigation'],
      },
      source: 'Wertheimer, M. (1923). Untersuchungen zur Lehre von der Gestalt II. Psychologische Forschung, 4, 301-350.',
    },
    'law-of-uniform-connectedness': {
      name: 'Law of Uniform Connectedness',
      slug: 'law-of-uniform-connectedness',
      definition: 'Elements connected by uniform visual properties (lines, borders, shared background) are perceived as a single unit.',
      whenItApplies: 'Tab groups, breadcrumbs, stepper flows, connected form fields, segmented controls, nav rails.',
      violationExample: 'A 4-step wizard with disconnected step circles fails to communicate the linear progression.',
      fixExample: 'Join the step circles with a continuous line so the flow reads as one connected sequence.',
      tags: {
        dimension: ['layout', 'interaction', 'hierarchy'],
        cognitiveProcess: 'perception',
        surface: ['navigation', 'onboarding', 'forms'],
      },
      source: 'Palmer, S. E., & Rock, I. (1994). Rethinking perceptual organization: The role of uniform connectedness. Psychonomic Bulletin & Review, 1(1), 29-55.',
    },
    'chunking': {
      name: 'Chunking',
      slug: 'chunking',
      definition: 'Grouping individual items into meaningful units expands effective working-memory capacity.',
      whenItApplies: 'Phone numbers, credit card fields, long lists, nav IA, settings pages, pricing comparison tables.',
      violationExample: 'A 16-digit card number shown as one uninterrupted string makes verification slow and error-prone.',
      fixExample: 'Format the card number as 4-4-4-4 with visible spaces. The eye parses 4 chunks faster than 16 digits.',
      tags: {
        dimension: ['flows', 'typography', 'layout'],
        cognitiveProcess: 'memory',
        surface: ['forms', 'content', 'data-display'],
      },
      source: 'Miller, G. A. (1956). The magical number seven, plus or minus two: Some limits on our capacity for processing information. Psychological Review, 63(2), 81-97.',
    },
    'choice-overload': {
      name: 'Choice Overload',
      slug: 'choice-overload',
      definition: 'Too many options can reduce satisfaction, delay decisions, and increase regret, even when every option is good.',
      whenItApplies: 'Pricing tiers, feature menus, template galleries, onboarding questions, product catalogs, filters.',
      violationExample: 'A pricing page with 9 tiers forces the user to compare permutations instead of picking the right plan.',
      fixExample: 'Offer 3 tiers: Free, Pro, Team. Recommend one with a clear badge. Hide edge-case plans behind "See all plans".',
      tags: {
        dimension: ['flows', 'hierarchy'],
        cognitiveProcess: 'decision-making',
        surface: ['navigation', 'content', 'onboarding'],
      },
      source: 'Iyengar, S. S., & Lepper, M. R. (2000). When choice is demotivating: Can one desire too much of a good thing? Journal of Personality and Social Psychology, 79(6), 995-1006.',
    },
    'cognitive-load': {
      name: 'Cognitive Load',
      slug: 'cognitive-load',
      definition: 'The total mental effort a task demands; working memory has a fixed budget and overloading it degrades performance.',
      whenItApplies: 'Dense data tables, technical forms, settings pages, error messages, multi-step flows, dashboards.',
      violationExample: 'A dashboard with 40 metrics, 8 filters, and no grouping forces the user to parse everything before acting.',
      fixExample: 'Show 4 to 6 primary KPIs on the main view. Park everything else behind tabs or "Show more" with a persistent filter memory.',
      tags: {
        dimension: ['flows', 'hierarchy', 'performance'],
        cognitiveProcess: 'memory',
        surface: ['data-display', 'forms', 'content'],
      },
      source: 'Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. Cognitive Science, 12(2), 257-285.',
    },
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
