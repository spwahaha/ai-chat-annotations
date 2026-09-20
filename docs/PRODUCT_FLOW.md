# Product flow and interaction contract

## Primary flow

### Collect

When the user selects text inside a model response, a compact **＋ Add to question** action appears beside the selection. Choosing it creates a persistent highlight, places a numbered marker next to that passage, and opens its focused editor.

The action's meaning is intentionally specific: it tells the user where the passage will go and when it will be used. “Attach” was rejected because it could imply a file, a permanent relationship, or an immediate send.

### Annotate and minimize

Only one small editor is open at a time, beside the selected passage rather than over the composer or unrelated content. It supports:

- a stable number used in the outgoing message;
- a compact excerpt;
- an optional question or instruction;
- individual removal;
- clearing the whole collection.

Enter, Escape, or clicking elsewhere minimizes the editor to its numbered marker. Selecting the marker reopens it with the saved text. Other passages remain unobstructed; the full-screen overlay host does not receive pointer events outside the markers and active editor.

References are isolated by conversation. Navigating to another conversation shows that conversation's collection; returning restores the earlier collection for as long as the page remains loaded.

### Ask

The user may write an additional question in the provider's normal composer, but it is optional. The provider's normal Send button or Enter shortcut works even when the outgoing message consists only of references and their per-reference questions. The extension intercepts that single submit, appends a delimited numbered reference block, then continues the original send action. There is no second confirmation or “Insert excerpts” button.

The markers lock briefly during preparation to prevent their contents from diverging from the outgoing payload. They clear only after the composer clears, which is the provider-independent success signal. If insertion or submission does not complete, the collection is retained and the user receives an actionable compact status.

## Provider architecture

The product behavior is shared, while provider-specific DOM behavior is isolated:

```text
AnnotationController
  ├─ ReferenceStore
  ├─ HighlightManager
  ├─ SelectionAction
  ├─ ReferenceShelf
  └─ ProviderAdapter
       ├─ ChatGPTAdapter
       └─ GeminiAdapter
```

This avoids pretending the providers have identical web implementations. Each adapter owns response discovery, composer discovery, send-control discovery, conversation identity, and content insertion. The shared controller owns the user-visible state machine.

## Outgoing message contract

When present, the user's draft stays first, followed by a clearly delimited reference section. With no separate draft, the reference section becomes the whole outgoing message:

```text
Compare the approaches and explain the disagreement.

---
Referenced passages from earlier responses:

[1]
> First selected passage

Note: Treat this as the earlier recommendation.

[2]
> Second selected passage
```

This transport works through each provider's supported composer and normal send action. Private internal endpoints are intentionally not coupled to the MVP: they are undocumented, change without notice, may depend on account experiments, and would make Gemini parity harder. A future adapter may use a first-party structured-reference API when a stable public contract exists, without changing the collection and shelf UX.

## Usability and failure rules

- Do not show the action for collapsed selections, cross-response selections, or passages outside a model response.
- Do not add an identical occurrence twice; identical words in different positions remain valid separate references.
- Keep the original selection highlighted while it is queued.
- Keep each minimized marker anchored to its selected passage and never cover unrelated content with a collection-wide panel.
- Never discard queued references because a provider control cannot be found.
- Never send automatically except as the continuation of the user's own submit action.
- Keep provider-specific breakage local to one adapter.

## Roadmap

### Next hardening

- Persist queued references across reloads with narrowly scoped local storage.
- Add adapter health diagnostics and selector-contract fixtures from current provider markup.
- Add drag reordering and keyboard-first collection.
- Add provider-version telemetry only if it can be fully opt-in and content-free.

### Dendrite direction

A future Dendrite integration could consume the same selection and anchoring primitives for more than one-shot questions. A passage could open a side conversation, become a learning card, or branch into a recursive investigation while preserving its source context. That should be a higher-level workflow built over the reference model—not bundled into the first extension release.

### Additional providers

Add providers through explicit adapters, retaining one shared product contract. The next adapter after Gemini should be chosen by user demand and DOM stability rather than by adding broad generic selectors.
