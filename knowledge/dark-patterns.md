# Ethical Design & Dark Pattern Detection

> Source: Deep research campaign, 30 validated evidence chunks, 11 clusters.
> Taxonomy, detection signals, regulatory landscape, ethical alternatives.

---

## Dark Pattern Taxonomy (Brignull + CHI 2024)

### The 16 Practitioner Types (Brignull)
| Pattern | Description | Detection Signal in Code |
|---------|-------------|------------------------|
| Confirmshaming | Guilt-tripping decline options | Button text with negative framing ("No thanks, I hate saving") |
| Roach motel | Easy in, hard out | Signup: 1-2 steps. Cancel: 5+ steps, phone call required |
| Hidden costs | Surprise fees revealed late | Price changes between cart and checkout |
| Forced continuity | Auto-renew without clear notice | No pre-renewal notification, buried cancellation |
| Misdirection | Visual tricks to push unwanted choice | Primary styling on unwanted option, ghost style on preferred |
| Privacy zuckering | Complex settings exposing data | Privacy settings default to share, require opt-out |
| Bait and switch | Promising one thing, delivering another | Marketing copy vs actual feature set mismatch |
| Disguised ads | Ads looking like content | Native ad styling matching editorial content |
| Friend spam | Using contacts without clear consent | Contact import without explicit scope explanation |
| Trick questions | Confusing language | Double negatives, "uncheck to not unsubscribe" |
| Sneak into basket | Adding items without consent | Pre-checked add-on checkboxes in checkout |
| Nagging | Repeated interruption to push action | Modal frequency > 1/session for same ask |
| Obstruction | Making unwanted action difficult | Delete account hidden in nested menus |
| Urgency | Fake time pressure | Countdown timers that reset, "only X left" without real inventory |
| Social proof | Fake or misleading proof | "Y people are viewing this" without real data |
| Preselection | Pre-checked unwanted options | Checked checkboxes for newsletters, upgrades |

### Academic Expansion (CHI 2024)
64-68 types across 3 levels and 6 categories. The academic taxonomy captures subtler patterns like:
- Interface interference (manipulating UI to push choices)
- Forced action (requiring unrelated action to proceed)
- Sneaking (hidden information or costs)
- Social engineering (leveraging social pressure)

---

## Programmatic Detection Signals

### What to grep for in code:

**Confirmshaming:**
```
Grep: "No thanks|I don't want|I prefer not|I'll pass on"
```
Check if decline button text uses negative/shame framing.

**Subscription parity:**
```
Grep: "cancel|unsubscribe|delete.*account|close.*account"
```
Compare steps to sign up vs steps to cancel. Cancellation should be <= signup effort.

**Pre-checked options:**
```
Grep: "defaultChecked|checked={true}|checked=\"checked\""
```
Optional features (newsletter, marketing, upgrades) should default to unchecked.

**Hidden costs:**
```
Grep: "shipping|fee|tax|surcharge|service.*charge"
```
Check if all costs are visible before final checkout step.

**Fake urgency:**
```
Grep: "countdown|timer|only.*left|limited.*time|expires.*in"
```
Check if timer resets on page refresh (fake) or is server-driven (potentially real).

**Deceptive hierarchy:**
```
Check: Is the user's preferred action (decline, cancel, close) styled as ghost/text while the business-preferred action (accept, upgrade, continue) is styled as primary?
```

---

## Regulatory Landscape (April 2026)

### EU Digital Services Act (DSA)
- **Article 25:** First explicit dark pattern prohibition (Feb 2024)
- Covers: deceptive interfaces that distort or impair user autonomy
- Digital Fairness Act expected Q4 2026 to consolidate enforcement
- Fines: up to 6% of annual worldwide turnover

### California CPRA
- Dark patterns legally defined as "user interface designed to subvert or impair user autonomy"
- $2,500-$7,500 per violation
- CPPA signaled active enforcement Sept 2024

### FTC (US Federal)
- $2.5B Amazon Prime settlement (largest ever dark pattern case)
- Click-to-Cancel rule (vacated by 8th Circuit, enforcement continues under ROSCA/Section 5)
- 5 new cases since Jan 2025
- accessiBe fined $1M for false advertising

### UK / Other
- UK Online Safety Act covers manipulative design
- Australia, Japan, South Korea developing frameworks
- Global trend toward regulation — dark patterns are legal risk

---

## Cookie Consent UX

- 93% of users never go past the first consent screen
- GDPR requires: equal prominence for accept and reject
- Reject must be as easy as accept (same number of clicks)
- Pre-checked non-essential cookies = violation
- Best practice: banner with Accept All / Reject All / Customize (3 buttons, equal style)
- Open-source CMPs: Klaro, Osano, CookieConsent

---

## Ethical Alternatives

| Dark Pattern | Ethical Alternative |
|-------------|-------------------|
| Confirmshaming | Neutral decline: "No thanks" or "Maybe later" |
| Hidden costs | Show total cost from the first screen |
| Fake urgency | Real inventory/time limits with honest data |
| Pre-checked boxes | All optional features unchecked by default |
| Roach motel | Cancellation matches signup effort (2 clicks max) |
| Deceptive hierarchy | User's preferred action gets equal or primary styling |
| Forced continuity | Email notification 7+ days before renewal with 1-click cancel |
| Privacy zuckering | Privacy defaults to most restrictive; opt-in for sharing |
| Nagging | Ask once per session max, remember dismissal |

---

## Trust Architecture

Building trust through design:
1. **Transparency:** Show what data you collect and why, upfront
2. **Consistency:** Same action produces same result everywhere
3. **Error recovery:** Graceful errors with clear resolution paths
4. **Honest communication:** No exaggeration, no manufactured urgency
5. **Easy exit:** Account deletion in 2-3 clicks with data export option
6. **Privacy-first defaults:** Most restrictive settings by default

---

## Account Deletion Requirements

- **GDPR Article 17:** Right to erasure — 30-day maximum response time
- **EDPB 2025:** Enforcement focus area
- **Best practice:**
  - Accessible in 2-3 clicks from account settings
  - Data export available before deletion
  - 30-day grace period with ability to recover
  - Clear confirmation of what will be deleted
  - Email confirmation after deletion completes
