# Chrome Web Store reviewer instructions

No extension account, API key, payment, or special credentials are required. A reviewer may use their own ChatGPT or Gemini account and any conversation containing an AI response.

## Primary test

1. Install the extension and reload an open `https://chatgpt.com/` or `https://gemini.google.com/` conversation.
2. Select a phrase inside an AI-generated response.
3. Choose **＋ Add to question** beside the selection.
4. In the passage-local editor, optionally enter `What evidence supports this?` and press Enter.
5. Confirm that the editor minimizes to numbered marker **1** beside the selected passage.
6. Select a second phrase in the same or another AI response and add it.
7. Click either number to confirm its editor reopens with the saved text.
8. Place the cursor in the provider's normal composer and enter `Compare these claims.`
9. Use the provider's normal Send button or Enter shortcut.
10. Confirm that the outgoing message contains the original question plus a numbered “Referenced passages from earlier responses” section.
11. Confirm that the markers clear after the provider accepts the message.

## Reference-only test

1. Add one passage as described above.
2. Leave the normal provider composer empty.
3. Focus the composer and press Enter.
4. Confirm that a message containing only the numbered reference section is sent without an error.

## Privacy verification

- The extension has no toolbar popup or account flow.
- It runs only on the three domains declared in the manifest.
- It creates no developer-originated network requests.
- Pending selections are lost on a full page reload because version 0.1.0 uses in-memory state only.
