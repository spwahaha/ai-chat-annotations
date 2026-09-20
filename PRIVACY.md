# Privacy Policy for AI Chat Annotations

Effective date: September 20, 2026

AI Chat Annotations is a local browser extension that lets users select and annotate passages in supported AI chats and include those passages with a later user-initiated message.

## Data the extension handles

The extension handles only the information needed for this user-facing feature:

- text passages that the user explicitly selects in a ChatGPT or Gemini response;
- optional notes the user writes for those passages;
- the supported provider and conversation path needed to keep pending references separated while the page remains open; and
- the outgoing composer content when the user chooses to send the message.

This information can include website content, user-generated content, or personal communications depending on what appears in the selected chat.

## How data is used

Selected passages and notes are kept in memory inside the current browser tab. When the user initiates a normal send action, the extension adds the selected passages and notes to that provider's composer. The provider receives that content as part of the user's message under the provider's own terms and privacy policy.

Pending references are cleared after a successful send and are lost when the page is fully reloaded or closed. AI Chat Annotations does not use persistent browser storage in version 0.1.0.

## Collection, sharing, and sale

The extension has no developer-operated server, account system, analytics, advertising, or telemetry. The developer does not collect, store, sell, rent, or share chat content, selected passages, annotations, browsing activity, or personal information.

The extension makes no network requests of its own. It does not allow the developer or any third party other than the AI provider selected by the user to read the handled content.

## Site access

The extension runs only on these supported sites:

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`
- `https://gemini.google.com/*`

Access is used only to detect user selections in AI responses, show the annotation interface, and add references to a user-initiated message. The extension does not read cookies, authentication tokens, unrelated tabs, or browsing history.

## Limited Use

AI Chat Annotations' use of information is limited to providing its disclosed annotation and reference feature. Its handling of data complies with the Chrome Web Store User Data Policy, including the Limited Use requirements.

## Changes

If a future version changes these practices, this policy and the Chrome Web Store privacy disclosures will be updated before that version is published.

## Contact

Questions or privacy requests can be submitted through the project's public support tracker:

https://github.com/spwahaha/ai-chat-annotations/issues
