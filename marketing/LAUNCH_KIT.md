# AI Chat Annotations launch kit

## Positioning

**Category:** AI chat productivity extension

**One-line promise:** Ask one precise follow-up about several parts of a ChatGPT or Gemini answer—without repeatedly copying, pasting, or losing context.

**Distinctive wedge:** Most adjacent extensions open a side chat or act on one selection. AI Chat Annotations collects multiple source-anchored passages, lets the user attach a separate note to each, and sends them together in one structured follow-up.

**Trust points:** Free, open source, no API key, no extension account, no analytics, no advertising, no developer-operated server, and no extension-originated network requests.

## Primary audiences

1. Researchers and analysts comparing claims or requesting a synthesis from several passages.
2. Developers reviewing multiple code fragments, tradeoffs, or proposed changes in a long answer.
3. Students attaching separate questions to several parts of an explanation.
4. ChatGPT and Gemini power users who regularly quote earlier responses by hand.

## Canonical links

- Chrome Web Store: https://chromewebstore.google.com/detail/ai-chat-annotations/ekekngbagjjcipociafmplgehljjniel
- Source and documentation: https://github.com/spwahaha/ai-chat-annotations
- Support and feedback: https://github.com/spwahaha/ai-chat-annotations/issues
- Privacy policy: https://github.com/spwahaha/ai-chat-annotations/blob/main/PRIVACY.md

## Launch prerequisites

- Upload version 0.1.1 to the Chrome Web Store before directing new users to the listing. The public listing currently reports version 0.1.0, while 0.1.1 contains current ChatGPT compatibility fixes.
- Replace the live listing copy with `store-listing/listing.md`.
- Put `01-add-to-question.png` first and `03-multiple-references.png` second; together they explain the action and the multi-reference advantage.
- Use a dedicated public support email rather than a personal email when the publisher account permits it.
- Test installation and the core flow in a clean Chrome profile immediately before outreach.

## 30-day campaign

### Days 1–2: repair conversion surfaces

- Publish version 0.1.1 and the revised Store listing.
- Confirm the Store page, GitHub homepage, privacy page, and support link all resolve.
- Ask three trusted users to install it without guidance and report where they hesitate.
- Collect one short screen recording showing: select passage, add note, collect a second passage, send one follow-up.

### Days 3–7: feedback-first launch

- Post to one relevant community at a time, beginning with `r/chrome_extensions` or `r/SideProject`.
- Adapt the post to each community instead of cross-posting identical copy on the same day.
- Ask for workflow feedback, not upvotes or five-star reviews.
- Reply to every substantive comment and turn recurring friction into GitHub issues.

### Week 2: reach intent-rich users

- Share a developer-focused example in `r/ChatGPTCoding` or a relevant programming community if its self-promotion rules allow it.
- Share a research/study example in a productivity or learning community only when the example genuinely fits.
- Launch on Product Hunt after a short demo is available and the listing has survived the first feedback round.
- Contact 10 small AI-workflow creators or newsletter writers with a personalized, one-paragraph note and a concrete use case from their work.

### Weeks 3–4: compound search and trust

- Publish a tutorial titled “How to ask one follow-up about multiple parts of a ChatGPT answer.”
- Turn the strongest real use case into a second tutorial for Gemini.
- Improve the first Store screenshot or summary based on questions from real users.
- Ask active users for an honest Store review after they have completed the workflow successfully.

## Channel-ready copy

### Reddit / community post

**Title:** I built a free extension to ask one follow-up about multiple parts of a ChatGPT or Gemini answer

I kept running into the same problem with long AI answers: I wanted to question three different claims together, but the normal workflow was to copy each passage manually or ask three separate follow-ups.

So I built AI Chat Annotations. You select a passage, choose **Add to question**, optionally attach a note, and keep selecting. When you send your next message, all of the numbered references are included together.

It works on ChatGPT and Gemini, uses the normal chat composer, and needs no API key or extension account. It is open source and has no analytics or developer-operated server.

Chrome Web Store: https://chromewebstore.google.com/detail/ai-chat-annotations/ekekngbagjjcipociafmplgehljjniel

Source: https://github.com/spwahaha/ai-chat-annotations

I would especially value feedback on whether the numbered markers and per-passage notes feel natural in real research, coding, or study workflows.

### Show HN

**Title:** Show HN: AI Chat Annotations – ask about multiple passages in one follow-up

AI Chat Annotations is a small open-source Chrome extension for a narrow workflow: select several passages from earlier ChatGPT or Gemini responses, attach an optional note to each, and include them together with the next normal message.

I built it because one-at-a-time follow-ups lose the relationship between claims, while manual quoting gets tedious in long answers. It does not call an AI API, operate a server, or collect analytics; it works through the existing provider composer.

Store: https://chromewebstore.google.com/detail/ai-chat-annotations/ekekngbagjjcipociafmplgehljjniel

Source: https://github.com/spwahaha/ai-chat-annotations

### Product Hunt

**Tagline:** Ask about multiple parts of an AI answer at once

**Description:** Select passages in ChatGPT or Gemini, attach a note to each one, and send a single precise follow-up with every reference included. Free, open source, and private by design—no API key, account, analytics, or developer server.

**Maker comment:** I built AI Chat Annotations after repeatedly copying several pieces of a long AI answer into one follow-up. The extension keeps numbered references beside their source passages and waits until the user sends normally. I would love feedback from people who use AI chats for research, coding, and learning.

### LinkedIn

Long AI answers create a surprisingly awkward follow-up problem: what if you want to question three different passages together?

I built a small open-source Chrome extension for that workflow. AI Chat Annotations lets you select several passages in ChatGPT or Gemini, add an optional note to each one, and send them together with one precise follow-up.

There is no API key, extension account, analytics, or developer-operated server. It works through the normal chat composer.

I am looking for practical feedback from researchers, developers, and students who regularly work through long AI responses.

Chrome Web Store: https://chromewebstore.google.com/detail/ai-chat-annotations/ekekngbagjjcipociafmplgehljjniel

Source: https://github.com/spwahaha/ai-chat-annotations

### Short social post

I built a free Chrome extension for one awkward AI-chat workflow: select several passages in a ChatGPT or Gemini answer, attach a note to each, then ask one follow-up with all the context included. Open source, no API key, no analytics. Feedback welcome: https://chromewebstore.google.com/detail/ai-chat-annotations/ekekngbagjjcipociafmplgehljjniel

### Creator or newsletter outreach

**Subject:** A small multi-reference workflow for ChatGPT and Gemini

Hi — I built a free, open-source Chrome extension that lets people select several passages in a ChatGPT or Gemini answer, attach a separate note to each one, and send them together in one follow-up. It is designed for research, coding review, and learning workflows where one-at-a-time follow-ups lose context. There is no API key, extension account, analytics, or developer server. If this fits something you cover, I would value candid feedback; no obligation to share it. Store: https://chromewebstore.google.com/detail/ai-chat-annotations/ekekngbagjjcipociafmplgehljjniel

## Measurement without product analytics

Keep the extension analytics-free. Use only aggregate surfaces already available:

- Chrome Web Store impressions, installs, uninstalls, users, and ratings;
- GitHub traffic, stars, clones, issues, and release downloads; and
- a simple weekly log of posts, referral source, qualitative feedback, and resulting fixes.

Initial validation targets for the first 30 days:

- 10 substantive feedback conversations;
- 50 qualified installs from clearly attributable outreach;
- 5 honest Store ratings or written reviews;
- at least 3 users returning with a real use case or feature request; and
- no sustained uninstall spike after a specific campaign.

## Guardrails

- Check each community's self-promotion rules before posting.
- Do not buy reviews, incentivize ratings, or ask only satisfied users for positive reviews.
- Do not post the same copy across many communities at once.
- Do not claim user counts, productivity gains, or privacy properties that cannot be verified.
- Lead with a concrete workflow and invite criticism; avoid generic AI-product hype.
