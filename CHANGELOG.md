# Changelog

All notable changes to AI Chat Annotations are documented here.

## 0.1.1 — 2026-10-03

- Restore ChatGPT compatibility with its current `data-message-role` transcript markup.
- Support the current `mobile-composer-prompt` textarea and `data-composer-submit` Send control.
- Recognize signed-out `/uc/` conversation routes while retaining the legacy ChatGPT interface fallback.
- Add regression coverage for both current and legacy ChatGPT DOM contracts.
- Capture selected passages synchronously before ChatGPT's native “Ask ChatGPT” action can clear the browser selection.
- Retain the captured passage through the extension action instead of reading the selection again on click.
- Prevent stale keyboard-selection retries from hiding a newer passage action.
- Add unit and browser regression coverage for the authenticated ChatGPT selection race.
- Activate the corrected content script in already-open supported tabs when the extension is installed, updated, or reloaded.
- Guard content-script startup so automatic reinjection cannot create duplicate annotation controllers.

## 0.1.0 — 2026-09-20

Initial public release.

- Select multiple passages from ChatGPT and Gemini responses.
- Add an optional question or note to each passage.
- Keep references visible as numbered, source-anchored markers.
- Reopen, edit, remove, or clear pending references.
- Include references automatically with the next normal Send or Enter action.
- Support reference-only messages without requiring a separate composer question.
- Keep all reference state local and in-memory with no analytics or external service.
