# Notification Permission: Optimal Timing & Pre-Permission Patterns

## The Problem

The worst thing you can do is show the permission dialog as soon as users land on your site. This burns the native prompt (browser remembers the dismissal) and trains users to reflexively deny all permission requests.

## The Pre-Permission (Double-Permission) Pattern

### How It Works
1. **Custom dialog first**: Show your own in-app message explaining the value proposition
2. **User agrees**: Only THEN trigger the native browser/OS permission prompt
3. **User declines**: Respect the decision, try again at a more appropriate moment later

### Benefits
- Preserves the native prompt for when users are actually ready
- Allows custom messaging explaining specific value
- No wasted permission prompts on cold users
- Better opt-in rates because users are pre-qualified

## Optimal Timing

### Good Moments to Ask
| Trigger | Why It Works |
|---------|-------------|
| After completing a purchase | User wants delivery updates |
| After following someone | User expects activity notifications |
| After tapping an "alert bell" | User explicitly expressed interest |
| After submitting a food order | User needs real-time delivery tracking |
| After booking an appointment | User needs reminders |
| After setting a goal/reminder | User created the need themselves |

### Bad Moments to Ask
- First page load (before any engagement)
- During onboarding (before user understands the product)
- While user is mid-task (interruption)
- Immediately after another permission request (fatigue)

## Design Principles

### Cost-Benefit Analysis
Users mentally weigh: "What will I gain vs what will I give up?" Design must communicate:
- **Specific value**: "Get notified when your order ships" not "Enable notifications"
- **Control**: "You can change this anytime in settings"
- **Frequency expectation**: "We'll only notify you about X" (and mean it)

### NN/g Guidelines (3 Key Considerations)
1. **Context**: Ask when the benefit is self-evident from the user's current action
2. **Explanation**: Tell users WHY you need permission and WHAT they get
3. **Timing**: High chance of acceptance = right moment to ask

### Mobile-Specific
- iOS: Only one chance for native prompt per app install (critical to time correctly)
- Android 13+: Runtime notification permission required, similar timing principles
- Both: Pre-permission dialog is essential on mobile

## Anti-Patterns to Avoid

- Permission prompt on app launch with no context
- Requesting notification + location + camera in rapid succession
- Vague messaging: "Allow notifications?" with no explanation
- Dark pattern: Showing benefits of allowing but hiding the dismiss option
- Repeated nagging after user declined (respect the decision)

## Sources

- [Smashing Magazine: Privacy UX](https://www.smashingmagazine.com/2019/04/privacy-better-notifications-ux-permission-requests/)
- [web.dev: Permission UX](https://web.dev/articles/push-notifications-permissions-ux)
- [NN/g: Permission Requests](https://www.nngroup.com/articles/permission-requests/)
- [UserOnboard: Permission Priming](https://www.useronboard.com/onboarding-ux-patterns/permission-priming/)
