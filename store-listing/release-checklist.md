# Release checklist

## Automated gate

- [ ] `npm ci`
- [ ] `npx playwright install chromium`
- [ ] `npm run release:check`
- [ ] `npm audit` reports no known vulnerabilities
- [ ] `unzip -t release/ai-chat-annotations-0.1.0.zip` passes
- [ ] ZIP root contains `manifest.json`, `content.js`, and `icons/` only

## Manual browser gate

- [ ] Load `dist` in a clean Chrome profile
- [ ] ChatGPT: collect, edit, minimize, reopen, remove, and send two references
- [ ] ChatGPT: send a reference-only message
- [ ] Gemini: collect, edit, minimize, reopen, remove, and send two references
- [ ] Navigate between conversations and confirm pending references remain isolated
- [ ] Confirm no extension errors appear in `chrome://extensions`
- [ ] Confirm no extension-originated requests appear in DevTools Network

## GitHub gate

- [ ] Create `spwahaha/ai-chat-annotations` as a public repository without generated starter files
- [ ] Push `main`
- [ ] Confirm CI passes
- [ ] Confirm the privacy, support, and homepage URLs resolve publicly
- [ ] Tag `v0.1.0`
- [ ] Confirm the GitHub release contains the ZIP and SHA-256 file

## Chrome Web Store gate

- [ ] Enable two-step verification on the publisher Google account
- [ ] Register the developer account and pay the one-time registration fee
- [ ] Verify the publisher contact email
- [ ] Upload the versioned ZIP
- [ ] Complete Store Listing using `listing.md`
- [ ] Complete Privacy using `privacy-practices.md`
- [ ] Upload assets using `assets.md`
- [ ] Add reviewer steps from `test-instructions.md`
- [ ] Select public, free, all supported regions, and deferred publishing
- [ ] Submit for review

## After approval

- [ ] Install the approved package in a clean profile
- [ ] Repeat the primary smoke test
- [ ] Publish within the staged-submission window
- [ ] Add the Chrome Web Store URL to the README and GitHub repository description
