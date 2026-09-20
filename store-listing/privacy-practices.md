# Chrome Web Store privacy practices

Use this document while completing the Privacy tab. Match the dashboard wording shown at submission time and do not claim less access than the extension actually has.

## Single purpose description

Allow users to select and annotate multiple passages in supported AI chat responses and include those references with the next user-initiated message.

## Host permission justification

The content script runs only on ChatGPT and Gemini to detect text the user explicitly selects in AI responses, display source-anchored annotation controls, locate the provider's composer and Send control, and insert the selected references only when the user initiates sending. No other sites are accessed. The extension does not request `activeTab`, `tabs`, `cookies`, `webRequest`, browsing-history, background, or broad all-sites access.

Supported match patterns:

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`
- `https://gemini.google.com/*`

## Remote code

Select **No, I am not using Remote code**.

If the dashboard requests a justification, use:

All JavaScript is bundled in the extension package. The extension does not load or execute external scripts, modules, WebAssembly, or evaluated code.

## Data usage

Select only:

- Website content: passages the user explicitly selects from AI responses.
- Personal communications: selected chat passages, optional annotations, and outgoing composer content handled for the user-initiated send action.

Do not select personally identifiable information, health information, financial and payment information, authentication information, location, web history, or user activity. The extension does not collect those categories for its feature.

The extension does not collect this information for the developer or transmit it independently to a developer-operated server. It is processed in memory inside the current tab. Only when the user initiates a send does it become part of the message sent to the currently selected AI provider.

## Required certifications

- Certify that user data is not sold or transferred outside the approved use cases.
- Certify that user data is not used or transferred for purposes unrelated to the extension's single purpose.
- Certify that user data is not used or transferred to determine creditworthiness or for lending purposes.
- Humans are not allowed to read user data because the developer never receives it.
- The extension has no analytics or telemetry.
- The extension does not use remote code.
- The extension's use of information complies with the Chrome Web Store User Data Policy, including the Limited Use requirements.

## Privacy policy URL

https://github.com/spwahaha/ai-chat-annotations/blob/main/PRIVACY.md
