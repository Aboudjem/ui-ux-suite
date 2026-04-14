# Design Psychology

> Behavioral science applied to UI. Each concept: definition, UI implications, examples, misuse risks.

---

## Cognitive Principles

### Cognitive Load Theory
Three types: intrinsic (task complexity), extraneous (poor design adding friction), germane (learning/understanding).
- **UI implication:** Reduce extraneous load — remove unnecessary elements, simplify forms, use progressive disclosure
- **Example:** A 20-field signup form has high extraneous load. Progressive profiling (3 fields now, rest later) reduces it.
- **Misuse risk:** Over-simplifying to the point of hiding needed information

### Hick's Law
Decision time increases logarithmically with the number of choices.
- **UI implication:** Limit visible choices to 5-7. Use categories, search, and progressive disclosure for more.
- **Example:** A settings page with 50 toggles vs grouped sections with 4-5 settings each
- **Misuse risk:** Removing legitimate options to "simplify" when users actually need them

### Miller's Law
Working memory holds 4-7 chunks (updated from the original 7+-2).
- **UI implication:** Group information into 4-7 chunks. Navigation items, form sections, dashboard widgets.
- **Example:** Phone numbers chunked as (555) 123-4567, not 5551234567
- **Misuse risk:** Arbitrary grouping that doesn't match user mental models

### Fitts's Law
Target acquisition time depends on distance and size. Larger + closer = faster.
- **UI implication:** Important targets (CTAs) should be large and close to the cursor/thumb. Destructive actions should be small and far from common actions.
- **Example:** Primary button larger than secondary. Delete button far from Save.
- **Misuse risk:** Making everything large defeats the purpose

### Serial Position Effect
First and last items in a list are remembered best.
- **UI implication:** Place most important nav items first and last. Middle items are less noticed.
- **Example:** Mobile bottom nav: Home (first) and Profile (last) are best remembered

### Von Restorff Effect (Isolation Effect)
Distinctive items are remembered. Something that stands out from its surroundings gets attention.
- **UI implication:** Use visual breaks for key CTAs. A colored button among gray ones gets clicked.
- **Example:** Pricing page with one "recommended" plan visually highlighted

---

## Behavioral Principles

### Habit Loops (Cue -> Routine -> Reward)
Consistent placement + reduced friction + satisfying completion = habit formation.
- **UI implication:** Keep primary actions in the same place always. Reduce steps for repeated actions. Provide satisfying feedback on completion.
- **Example:** Instagram's bottom nav never moves. Pull-to-refresh is always available. Heart animation rewards engagement.

### Loss Aversion
People fear losing more than they desire gaining (2x more motivating).
- **UI implication:** Frame around what users keep, not what they gain. "Don't lose your progress" > "Save to continue later"
- **Example:** "Your trial expires in 3 days" (loss frame) vs "Upgrade for premium features" (gain frame)
- **Misuse risk:** Confirmshaming ("No thanks, I don't want to save money") — NEVER do this

### Endowment Effect
People value what they already have more than equivalent alternatives.
- **UI implication:** Let users customize early. Show their data, progress, creations. Makes switching harder.
- **Example:** Customized dashboard, saved preferences, accumulated history

### Anchoring
First number/option seen sets expectations for all subsequent judgments.
- **UI implication:** Show the most expensive plan first (makes middle plan seem reasonable). Show original price before discount.
- **Example:** Pricing page: Enterprise ($99) → Pro ($49) → Starter ($19). The $49 feels reasonable anchored against $99.
- **Misuse risk:** Inflated anchor prices that don't reflect real value

### Social Proof
People look to others' behavior when uncertain.
- **UI implication:** Show real usage counts, testimonials, customer logos, activity feeds. Must be real data.
- **Example:** "Join 50,000+ teams" with recognizable logos
- **Misuse risk:** Fake reviews, inflated numbers, manufactured urgency — destroys trust when discovered

---

## Trust & Emotion

### Trust Formation
- **Consistency:** Same action = same result, every time
- **Transparency:** Clear about data use, pricing, terms
- **Social proof:** Real numbers, testimonials, recognizable logos
- **Professional polish:** Aesthetic-usability effect — beautiful = perceived as more usable
- **Error recovery:** Graceful errors with clear resolution paths

### Aesthetic-Usability Effect
Beautiful designs are perceived as more usable and more trustworthy. Users forgive more usability issues in visually appealing interfaces.
- **UI implication:** Polish matters. Visual quality directly affects perceived usability and trust.
- **Caution:** Beauty doesn't replace usability — it amplifies it

### Peak-End Rule
Experiences are judged by the peak moment and the ending, not the average.
- **UI implication:** Nail the key moment (first value achieved) and the farewell (subscription confirmation, export complete, session end)
- **Example:** Notion's satisfying checkmark animation when completing a task

### Paradox of Choice
Too many options = anxiety and decision paralysis.
- **UI implication:** Curate, recommend, simplify. Default selections. "Most popular" badges. Progressive disclosure.
- **Example:** 3 pricing tiers with one recommended, not 7 tiers with 30 feature rows

### Zeigarnik Effect
Incomplete tasks are remembered and create tension until completed.
- **UI implication:** Progress bars, incomplete profile indicators, "3 of 5 steps complete"
- **Example:** LinkedIn profile completeness bar, onboarding checklists
- **Misuse risk:** Artificial incompleteness that pressures rather than guides

---

## Dark Pattern Warnings

| Pattern | Description | Rule |
|---------|-------------|------|
| Confirmshaming | Guilt-tripping users who decline | NEVER acceptable |
| Roach motel | Easy signup, hard cancellation | Cancellation must match signup effort |
| Hidden costs | Surprise fees revealed late | Be transparent upfront |
| Forced continuity | Auto-renewing without clear notice | Always notify before renewal |
| Misdirection | Using hierarchy to trick choices | Hierarchy should serve user goals |
| Privacy zuckering | Complex settings that expose data | Simple, safe defaults |
| Pre-checked boxes | Opting users in without consent | All optional features unchecked by default |
