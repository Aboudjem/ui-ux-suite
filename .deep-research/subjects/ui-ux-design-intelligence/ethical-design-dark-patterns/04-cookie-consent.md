# Cookie Consent UX & Compliance

## The Problem

- **93%** of users never go past the first cookie banner screen (CNIL data)
- **70%+** of real cookie banners use dark patterns
- Less than **1%** of users customize cookie settings
- EU estimated cookie pop-ups waste **575 million hours per year**
- Do Not Track (DNT) removed from Firefox (early 2025) and Safari -- voluntary signal failed

## GDPR/ePrivacy Requirements

### EDPB Cookie Banner Taskforce (Jan 2023, updated Oct 2024)

1. **Equal prominence**: Accept and Reject buttons must have similar size, color prominence, and position
2. **Equal interaction cost**: Both options require the same number of clicks
3. **First-screen parity**: If "Accept All" is on first screen, "Reject All" must be too
4. **No pre-ticked boxes**: Pre-selected consent checkboxes violate GDPR
5. **Withdrawal icon**: Permanent hovering button or visible icon for consent management
6. **Granular consent**: Unbundled per-purpose choices (functional, analytics, marketing separately)
7. **No cookie walls**: Cannot force acceptance to access basic site functions

### Technical Requirements

- **Prior blocking**: All non-essential cookies must be blocked until explicit consent
- **Scope extends beyond cookies**: tracking pixels, fingerprinting, IoT reporting, IP tracking all covered
- **Audit trails**: Maintain records of consent collection

## Compliant Design Patterns

### Minimal Banner (Recommended)
```
[Accept All] [Reject All] [Customize]
Brief explanation: "We use cookies for [purposes]."
```

### Category Consent
```
Essential cookies (always on)
[ ] Analytics cookies -- help us understand usage
[ ] Marketing cookies -- personalized ads
[Save preferences] [Accept All] [Reject All]
```

### Key Principles
- Clear, simple language (no legal jargon)
- Mobile-responsive with touch-friendly controls
- Explain what cookies actually do in plain terms
- Easy access to settings at any time
- No dark color contrast tricks (accept bright, reject gray)

## The Regulatory Fix Attempt

### EU Digital Omnibus (Nov 2025)
- Commission acknowledges system is "long overdue" for fix
- Article 88b: Websites must accept machine-readable consent signals from browsers
- Concerns from NOYB/BEUC: no mandate for reject-as-default, may repeat DNT failure
- Tilburg Law Review (2022) argument: non-essential cookies should be OFF by default

### The DNT Lesson
- Do Not Track proposed ~2009, built into every browser
- DNT only signaled preference, didn't block anything
- Effectiveness depended on advertiser acceptance (which never came)
- Firefox removed 2025, Safari followed
- Key lesson: voluntary signals without enforcement teeth always fail

## Open-Source Consent Management Platforms

| Platform | License | Scale | Features |
|----------|---------|-------|----------|
| Klaro | BSD-3 | Developer-friendly | Lightweight, fully customizable |
| Cookie Consent (Osano) | Open | 2B+ monthly impressions | Most widely adopted, battle-tested |
| Silktide | Free forever | Full-featured | Google Consent V2, GDPR support |
| consent.io | Open source | Developer-first | Runs entirely on your domain |

### Browser Extensions (User-Side)
- **CookieBlock** (ETH Zurich): ML classifier, 87% accuracy, auto-classifies cookies by purpose
- **Consent-O-Matic**: Auto-fills consent forms based on user preferences
- **Auto-reject-cookies**: Firefox addon, auto-declines all cookies

## Sources

- [GDPR Cookie Requirements 2025](https://secureprivacy.ai/blog/gdpr-cookie-consent-requirements-2025)
- [EDPB Cookie Banner Taskforce Report](https://www.edpb.europa.eu/our-work-tools/our-documents/other/report-work-undertaken-cookie-banner-taskforce_en)
- [EDPB Guidelines 2/2023](https://www.edpb.europa.eu/news/news/2022/edpb-adopts-guidelines-right-access-and-letter-cookie-consent_en)
- [Klaro Privacy Manager](https://github.com/kiprotect/klaro)
- [Cookie Consent by Osano](https://github.com/osano/cookieconsent)
