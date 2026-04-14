# Account Deletion: GDPR Right to Erasure & Implementation Patterns

## Regulatory Context

### EDPB 2025 Coordinated Enforcement Framework
- Right to erasure (Article 17 GDPR) selected as **2025 enforcement focus**
- Most frequently exercised GDPR right
- Most complained-about right to Data Protection Authorities
- Multiple DPAs (CNIL, Portuguese CNPD, Swedish IMY) will use findings for 2026 sector-specific inspections

### Legal Requirements
- **Response time**: Must respond within 1 month of request
- **Scope**: All personal data across all systems (not just the user-facing account)
- **Processor coordination**: Must ensure processors also delete data
- **Exceptions**: Legal obligations, public interest, legal claims may override

## Key Implementation Gaps Found

The EDPB enforcement action identified persistent weaknesses:

1. **No systematic data classification**: Organizations don't know where all personal data lives
2. **No automated deletion labels**: IT systems lack programmatic deletion capabilities
3. **Procedural inconsistencies**: Different teams handle requests differently
4. **Controller-processor coordination failures**: Data persists at processors after deletion
5. **Human error**: Requests misrouted, misclassified, or lost
6. **Technical constraints**: Legacy systems without delete APIs

## Implementation Best Practices

### Data Architecture
- **Data mapping**: Foundation for compliance -- know where every piece of personal data lives
- **Erasure classes**: Group data types by sensitivity and retention needs
  - Each class specifies: data covered, protection level, deletion method
- **Automated deletion**: Programmatic deletion based on retention schedules, not manual processes
- **Audit trails**: Log all deletion actions for compliance verification

### UX Design for Account Deletion

#### Accessible Flow
- Account deletion available within **2-3 clicks** from account settings
- No phone-only deletion if account was created online
- No dark patterns (confirmshaming, excessive save attempts, hidden options)

#### Clear Communication
```
Delete Account

This will permanently delete:
- Your profile and personal information
- Your content and activity history  
- Your subscription (if active, it will be cancelled)

This cannot be undone after 30 days.

[Download my data first]  [Delete my account]  [Cancel]
```

#### Grace Period
- 14-30 day grace period before permanent deletion
- Allow reactivation during grace period
- After grace period: irreversible deletion with confirmation email

#### Data Portability First
- Offer data export before deletion (GDPR Article 20 right to portability)
- Provide machine-readable format (JSON, CSV)
- Include all user-generated content and personal data

### Technical Implementation
- Soft-delete during grace period (mark as deleted, restrict access)
- Hard-delete after grace period (remove from all databases, backups within reasonable timeframe)
- Cascade to all processors via documented API calls
- Anonymize analytics data rather than delete (aggregate, remove PII)
- Handle edge cases: shared content, group memberships, public posts

## Anti-Patterns to Avoid

- Burying deletion option in deep settings hierarchies
- Requiring users to contact support via email/phone
- Multi-day "processing" with no transparency
- Confirmshaming ("We'll miss you! Are you sure?")
- Offering only "deactivation" without true deletion option
- Retaining data after confirmation of deletion

## Sources

- [EDPB Right to Erasure Enforcement](https://www.edpb.europa.eu/news/news/2025/cef-2025-launch-coordinated-enforcement-right-erasure_en)
- [EDPB CEF Report 2025](https://www.edpb.europa.eu/system/files/2026-02/edpb_cef-report_2025_right-to-erasure_en.pdf)
- [Right to be Forgotten Guide](https://complydog.com/blog/right-to-be-forgotten-gdpr-erasure-rights-guide)
- [GDPR Erasure Compliance Steps](https://www.reform.app/blog/right-to-erasure-gdpr-compliance-steps)
