# Laws of UX

> 24 named laws of user experience, each with definition, applicability, a violation example, a fix example, and a primary-source citation. Tags route each law to scoring dimensions and cognitive processes so agents and the MCP `uiux_laws_query` tool can look them up.

This file lists 24 UX laws with original prose and primary-source citations. Law names are factual references. Prose and examples are authored fresh under the project's MIT license. No text is copied from external UX reference sites; each `Source:` line points to a primary academic paper, IETF RFC, or canonical book.

---

## Perception

### Law of Proximity
Objects near each other are perceived as related; spatial grouping communicates logical grouping.
- **When it applies:** Forms, nav, card grids, list items, labels, tooltips, any layout where relationships matter.
- **Violation example:** A label placed 40px from its input but 16px from the next field tells the eye the label belongs to the wrong input.
- **Fix example:** Keep label-to-input spacing tight (4 to 8px) and input-to-next-field loose (24 to 32px). Use the spacing scale to signal grouping.
- **Source:** Wertheimer, M. (1923). Untersuchungen zur Lehre von der Gestalt II. Psychologische Forschung, 4, 301-350.

See also: `principles.md` (spacing section), `anti-patterns.md` (ungrouped-forms entry).

### Law of Similarity
Elements that look alike are perceived as related, even when separated in space.
- **When it applies:** Button systems, status badges, link styles, list items, tag pills, color-coded categories.
- **Violation example:** Using identical red styling for both destructive actions and error states blurs the meaning of the signal.
- **Fix example:** Reserve one color ramp per meaning. Use red for destructive actions only; use a separate treatment (icon, copy) for errors.
- **Source:** Wertheimer, M. (1923). Untersuchungen zur Lehre von der Gestalt II. Psychologische Forschung, 4, 301-350.

See also: `principles.md` (visual hierarchy), `anti-patterns.md` (inconsistent-button-styles).

### Law of Common Region
Objects inside a shared bounded region are perceived as a group, even when distant from one another.
- **When it applies:** Cards, panels, fieldset borders, grouped list items, modal content, sidebar sections.
- **Violation example:** Placing a Save button outside the card it logically belongs to disconnects it visually from its form.
- **Fix example:** Put the Save button inside the card border. Use a subtle background or outline to bind related controls into one region.
- **Source:** Palmer, S. E. (1992). Common region: A new principle of perceptual grouping. Cognitive Psychology, 24(3), 436-447.

See also: `principles.md` (grouping patterns).

### Law of Uniform Connectedness
Elements connected by uniform visual properties (lines, borders, shared background) are perceived as a single unit.
- **When it applies:** Tab groups, breadcrumbs, stepper flows, connected form fields, segmented controls, nav rails.
- **Violation example:** A 4-step wizard with disconnected step circles fails to communicate the linear progression.
- **Fix example:** Join the step circles with a continuous line so the flow reads as one connected sequence.
- **Source:** Palmer, S. E., & Rock, I. (1994). Rethinking perceptual organization: The role of uniform connectedness. Psychonomic Bulletin & Review, 1(1), 29-55.

### Law of Pragnanz
People perceive ambiguous or complex images in their simplest possible form; the eye prefers regularity and order.
- **When it applies:** Icon design, logo placement, illustration, dashboard charts, navigation diagrams, empty states.
- **Violation example:** An icon with 8 tiny embellishments reads as noise at 16px; the eye simplifies it to a blob.
- **Fix example:** Strip the icon to 2 to 3 strokes. Test at the smallest size it will ship; if the simplified shape still reads, ship it.
- **Source:** Koffka, K. (1935). Principles of Gestalt Psychology. Harcourt, Brace and World.

See also: `principles.md` (simplicity rules).

### Aesthetic-Usability Effect
Users perceive more aesthetically pleasing designs as easier to use, even when objective usability is the same.
- **When it applies:** Any first-impression surface: landing pages, onboarding, marketing sites, app stores, product demos.
- **Violation example:** A powerful tool with a cluttered, unstyled interface scores lower on perceived usability in user tests than a weaker, polished tool.
- **Fix example:** Invest in typography, consistent spacing, and a calm palette before adding features. Polish raises tolerance for friction.
- **Source:** Kurosu, M., & Kashimura, K. (1995). Apparent usability vs. inherent usability: Experimental analysis on the determinants of the apparent usability. CHI 95 Conference Companion, 292-293.

See also: `evidence-base.md` (polish-and-trust citations).

### Von Restorff Effect
An item that stands out from its peers is remembered better than items that blend in.
- **When it applies:** Primary CTAs, feature callouts, pricing recommendations, notifications, error states, destructive actions.
- **Violation example:** A "Buy now" button styled identically to five secondary actions in the same row fails to draw the eye.
- **Fix example:** Give the primary action one distinctive color, weight, or size. Reserve that treatment for the one action you want remembered.
- **Source:** von Restorff, H. (1933). Uber die Wirkung von Bereichsbildungen im Spurenfeld. Psychologische Forschung, 18, 299-342.

See also: `psychology.md` (attention, isolation effect).

---

## Attention

### Serial Position Effect
Items at the beginning and end of a list are recalled more accurately than items in the middle.
- **When it applies:** Nav menus, pricing tables, feature lists, FAQ, onboarding steps, long dropdowns, any ordered list the user must remember.
- **Violation example:** Placing the most important nav item in the middle of a 9-item menu buries it below less-critical options.
- **Fix example:** Anchor the most memorable items first and last. Place the top task at position 1 and the secondary priority at position N.
- **Source:** Ebbinghaus, H. (1913). Memory: A Contribution to Experimental Psychology. (trans. Ruger & Bussenius). Teachers College, Columbia University.

See also: `psychology.md` (memory, primacy and recency).

### Zeigarnik Effect
People remember uncompleted tasks better than completed ones; unfinished work holds attention.
- **When it applies:** Onboarding checklists, profile completion, unsent drafts, tutorial progress, cart abandonment, half-finished forms.
- **Violation example:** Hiding a half-complete profile behind a settings page lets the user forget it and never finish.
- **Fix example:** Surface a visible "2 of 5 steps done" indicator on the dashboard until the checklist is complete.
- **Source:** Zeigarnik, B. (1927). Uber das Behalten von erledigten und unerledigten Handlungen. Psychologische Forschung, 9, 1-85.

See also: `anti-patterns.md` (hidden-progress entry).

---

## Memory

### Miller's Law
Working memory holds roughly seven (plus or minus two) discrete items before recall degrades.
- **When it applies:** Lists, navigation menus, form sections, feature grids, any UI that asks the user to hold information in mind while acting.
- **Violation example:** A single-page form with 20 unlabeled fields in one column overwhelms working memory and produces abandonment.
- **Fix example:** Chunk the 20 fields into 3 to 4 labeled groups of 5 to 7 fields each. Use progressive disclosure so the user only sees one chunk at a time.
- **Source:** Miller, G. A. (1956). The magical number seven, plus or minus two: Some limits on our capacity for processing information. Psychological Review, 63(2), 81-97.

See also: `psychology.md` (working memory section).

### Chunking
Grouping individual items into meaningful units expands effective working-memory capacity.
- **When it applies:** Phone numbers, credit card fields, long lists, nav IA, settings pages, pricing comparison tables.
- **Violation example:** A 16-digit card number shown as one uninterrupted string makes verification slow and error-prone.
- **Fix example:** Format the card number as 4-4-4-4 with visible spaces. The eye parses 4 chunks faster than 16 digits.
- **Source:** Miller, G. A. (1956). The magical number seven, plus or minus two: Some limits on our capacity for processing information. Psychological Review, 63(2), 81-97.

See also: `psychology.md` (chunking), `principles.md` (progressive disclosure).

### Cognitive Load
The total mental effort a task demands; working memory has a fixed budget and overloading it degrades performance.
- **When it applies:** Dense data tables, technical forms, settings pages, error messages, multi-step flows, dashboards.
- **Violation example:** A dashboard with 40 metrics, 8 filters, and no grouping forces the user to parse everything before acting.
- **Fix example:** Show 4 to 6 primary KPIs on the main view. Park everything else behind tabs or "Show more" with a persistent filter memory.
- **Source:** Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. Cognitive Science, 12(2), 257-285.

See also: `psychology.md` (cognitive load), `evidence-base.md` (abandonment statistics).

### Peak-End Rule
People judge an experience largely by how they felt at its peak and at its end, not by the sum or average of every moment.
- **When it applies:** Onboarding, checkout, upgrade flows, error recovery, account cancellation, any multi-step flow with a memorable outcome.
- **Violation example:** A checkout that succeeds but ends on a plain "Thank you" page misses the chance to lift the memory of the purchase.
- **Fix example:** End with a delightful confirmation: order summary, estimated arrival, a small celebratory animation, and a clear next action.
- **Source:** Kahneman, D., Fredrickson, B. L., Schreiber, C. A., & Redelmeier, D. A. (1993). When more pain is preferred to less: Adding a better end. Psychological Science, 4(6), 401-405.

See also: `psychology.md` (memory effects).

---

## Decision-making

### Hick's Law
Decision time grows logarithmically with the number of equally probable choices presented.
- **When it applies:** Navigation menus, pricing tiers, settings screens, any list the user scans before acting.
- **Violation example:** A 12-item top nav with no grouping forces the user to scan all 12 before clicking.
- **Fix example:** Group the 12 items into 3 or 4 labeled sections. Show 5 to 7 top-level items; hide the long tail behind a "More" expander.
- **Source:** Hick, W. E. (1952). On the rate of gain of information. Quarterly Journal of Experimental Psychology, 4(1), 11-26.

See also: `anti-patterns.md` (nav-overload entry), `evidence-base.md` (decision-time statistics).

### Choice Overload
Too many options can reduce satisfaction, delay decisions, and increase regret, even when every option is good.
- **When it applies:** Pricing tiers, feature menus, template galleries, onboarding questions, product catalogs, filters.
- **Violation example:** A pricing page with 9 tiers forces the user to compare permutations instead of picking the right plan.
- **Fix example:** Offer 3 tiers: Free, Pro, Team. Recommend one with a clear badge. Hide edge-case plans behind "See all plans".
- **Source:** Iyengar, S. S., & Lepper, M. R. (2000). When choice is demotivating: Can one desire too much of a good thing? Journal of Personality and Social Psychology, 79(6), 995-1006.

See also: `psychology.md` (paradox of choice), `evidence-base.md` (Iyengar jam study).

### Goal-Gradient Effect
Motivation increases as people approach a goal; progress near the finish line accelerates behavior.
- **When it applies:** Multi-step forms, onboarding, profile completion, loyalty programs, download progress, upload progress.
- **Violation example:** A 5-step signup with no progress indicator leaves the user unsure whether the next click is the last or the midpoint.
- **Fix example:** Show a progress bar with step counts ("3 of 5") and preload the final step so the user can see the goal approaching.
- **Source:** Hull, C. L. (1932). The goal-gradient hypothesis and maze learning. Psychological Review, 39(1), 25-43.

### Occam's Razor
Among competing designs, prefer the one with fewer moving parts; simpler explanations and interfaces win.
- **When it applies:** Feature decisions, component API, settings, dialogs, nav structure, empty states, error messages.
- **Violation example:** A settings panel with 40 toggles where 5 presets would cover 90 percent of users buries the few that matter.
- **Fix example:** Ship 3 to 5 named presets. Hide the 40 toggles behind "Customize" for the 10 percent who actually need them.
- **Source:** William of Ockham, c. 1323. Summa Logicae. Modern UX framing: Nielsen, J. (1994). Usability Engineering. Academic Press.

### Pareto Principle
Roughly 80 percent of outcomes come from 20 percent of causes; a small fraction of features drives most value.
- **When it applies:** Feature prioritization, IA decisions, nav surfacing, dashboard layout, settings defaults, support triage.
- **Violation example:** Giving every feature equal weight in the main nav dilutes attention on the few features most users actually need.
- **Fix example:** Identify the top 20 percent of features by usage. Surface them in the primary nav and push the long tail behind a secondary layer.
- **Source:** Pareto, V. (1896). Cours d economie politique. Lausanne. Popularized by Juran, J. M. (1951). Quality Control Handbook.

### Parkinson's Law
Work expands to fill the time available for its completion; users will spend whatever time or space you give them.
- **When it applies:** Input fields, time pickers, meeting scheduling, upload limits, onboarding pacing, comment boxes.
- **Violation example:** A 2000-character comment box invites 2000-character comments even when 100 would serve the thread better.
- **Fix example:** Set a visible 280-character limit with a live counter to nudge concise input. Size fields to fit expected content.
- **Source:** Parkinson, C. N. (1955). Parkinson s Law. The Economist, November 19.

---

## Motor

### Fitts's Law
The time to acquire a target is a function of the distance to and size of the target; closer and bigger targets are faster to hit.
- **When it applies:** Any interactive control the user must click, tap, or hover: buttons, links, form fields, touch targets, menu items.
- **Violation example:** A 16x16 pixel icon-only close button in the top corner of a modal, far from the user pointer, is slow and error-prone to hit.
- **Fix example:** Use a 44x44 CSS pixel minimum touch target, place primary actions near the user last focus, and make the click area larger than the visible icon.
- **Source:** Fitts, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement. Journal of Experimental Psychology, 47(6), 381-391.

See also: `principles.md` (touch-target rules), `anti-patterns.md` (tiny-click-targets).

---

## Cross-cutting

### Jakob's Law
Users spend most of their time on other sites, so they expect your site to work the same way as the sites they already know.
- **When it applies:** Any platform-level convention: cart icons, logo placement, nav bars, search icons, form layouts, back-button behavior, dark-mode toggles.
- **Violation example:** Moving the cart icon from the top right to the bottom left because it "looks nicer" forces repeat e-commerce users to hunt.
- **Fix example:** Keep the cart icon top-right. Invent only where it earns attention; copy convention where it lowers load.
- **Source:** Nielsen, J. (2000). End of Web Design. Nielsen Norman Group Alertbox.

See also: `principles.md` (convention-first), `anti-patterns.md` (unexpected-placement).

### Doherty Threshold
Productivity rises sharply when system response time drops below 400 milliseconds because the user stays in flow.
- **When it applies:** Any interaction with perceptible latency: search, filter, sort, upload, save, navigate, autocomplete.
- **Violation example:** A type-ahead search that waits 1200ms after each keystroke breaks flow and encourages the user to stop typing.
- **Fix example:** Debounce to 150ms, render results optimistically, show a skeleton within 100ms, and stream results as they arrive.
- **Source:** Doherty, W. J., & Thadhani, A. J. (1982). The Economic Value of Rapid Response Time. IBM Report GE20-0752-0.

See also: `evidence-base.md` (performance statistics).

### Tesler's Law
Every application has an irreducible amount of complexity; either the user deals with it or the system does.
- **When it applies:** Onboarding, advanced settings, power-user features, migration flows, import/export, permissions models.
- **Violation example:** A blank timezone field asks every user to discover and configure their own offset string instead of defaulting from the browser.
- **Fix example:** Default timezone from the browser. Hide the raw offset behind an "Advanced" toggle for the users who need to override it.
- **Source:** Saffer, D. (2010). Designing for Interaction (2nd ed.). New Riders.

See also: `principles.md` (sensible-defaults).

### Postel's Law
Be conservative in what you do, be liberal in what you accept from others; tolerate varied input but emit strict output.
- **When it applies:** Form validation, search input, file upload, URL parsing, data import, copy-paste, international formatting.
- **Violation example:** Rejecting a phone number with spaces or dashes forces the user to reformat instead of accepting any valid pattern.
- **Fix example:** Normalize the input server-side: strip spaces, dashes, and parentheses, then validate. Accept several formats, store one canonical form.
- **Source:** Postel, J. (1980). RFC 761: Transmission Control Protocol. IETF.

See also: `principles.md` (input-forgiveness), `anti-patterns.md` (overstrict-validation).

---
