# Forms and actions

Read when the affected interface collects input, submits a change, or recovers from an unsuccessful or uncertain action. Select the decisions relevant to the actual product and service contract. A tiny label edit needs its affected behavior checked; a fully specified form needs no interview. Apply existing `ui-state-truth`, `ui-web-access`, `ui-scope` and `ui-task-proof` rules. This reference adds no schema or backend requirement.

## Establish what an action means

Inspect the existing fields, validation, permissions, write contract and completion evidence before changing the UI. Identify what is edited locally, what is sent, and what response or read-back establishes completion. A queued job may confirm receipt while its work remains pending. A local draft, an attempted submission and a confirmed save need distinct language. An optimistic display is not proof that a write succeeded.

Preserve the product's components, layout policy and authorization. Use [product-copy.md](product-copy.md) for prose and [browser.md](browser.md) for renderer-specific accessibility checks. [Interactive.md](interactive.md) governs agent briefing and acceptance; an ordinary product form does not need that protocol.

## Help users supply usable information

Group fields by the task and meaningful relationships. Use native controls matching the value: a quantity differs from a numeric identifier; a checkbox differs from a one-of-many choice. Give fields persistent labels, associate instructions where needed, and explain required versus optional information before submission. Place formats or limits where they affect entry; a placeholder cannot carry the only label or instruction. In browser forms use associated labels, and fieldsets/legends when a group needs a shared question (`wai-form-labels`, `wai-form-groups`). Keep the product's visual identity.

Choose validation timing deliberately. Submission or advancing a step is a useful default; avoid interrupting unfinished entry. Earlier feedback needs a task-specific benefit, such as preventing substantial work beyond a known limit. After a failed attempt, recheck corrected fields at a useful point without moving focus on each keystroke. Accept unambiguous formats the contract supports. Native browser validation may suffice; disabling it requires a complete accessible replacement, not merely hiding its messages (`wai-form-validation`, `govuk-form-validation`).

## Match recovery to the cause

| Observed result | User-facing response and next action |
| --- | --- |
| Input cannot be used | Name the affected field and the correction. Keep entered values, associate the error with its control, and provide a direct route back. |
| Service definitely rejected the write without applying it | Explain that the change was not saved, retain the draft, and offer retry when the contract makes that safe. A generic HTTP error alone may not establish absence of side effects. |
| Permission or business constraint | Explain the restriction and available next step. Do not mark correctly formatted input invalid or suggest retyping it will grant permission. |
| Conflicting newer data | Preserve the draft and expose the conflict. Follow the product's reconciliation behavior rather than overwriting newer work. |
| Timeout, lost response or interrupted connection | State that completion is unknown. Preserve the submitted values and available operation reference. Check authoritative status or reconcile before offering another consequential write. |

Field errors should identify the correction using the field's vocabulary. For several or distant errors, a focused summary with links can make recovery easier; a small form may focus the first erroneous control. Preserve useful context as well as values, including selected options and earlier steps. Avoid clearing the form on error. If a sensitive field or file cannot be retained, explain exactly what needs re-entry (`govuk-form-errors`, `wai-form-notifications`).

## Make the save lifecycle observable

Track the submitted snapshot separately from any later edits. During submission, provide a stable pending state and guard every activation path, including Enter and repeated clicks. If editing remains possible, a response may acknowledge only the submitted snapshot; newer edits stay unsaved. Alternatively, temporarily restrict editing without losing values or stranding focus. After confirmation, show the saved values or a retrievable result and any next step that actually follows. Editing a confirmed value must return the draft to an unsaved state (`govuk-form-confirmation`).

Frontend disabling prevents some duplicate activations; it does not establish server-side idempotency. Inspect existing operation IDs, idempotency keys, revision checks, status lookup and their retention/conflict semantics before relying on them. A retry must follow that contract, including whether to reuse an operation identity for the same intent. Never assume a new request ID deduplicates a previous write. RFC 9110 §9.2.2 (`http-retry-semantics`) limits automatic non-idempotent retries to known-safe semantics or evidence the first attempt was not applied. Backend changes require their own authorized scope. If the contract cannot support safe recovery, expose the limit instead of inventing a frontend guarantee.

## Leaving, cancelling and confirming

Define whether Cancel closes editing, discards a draft, or requests cancellation of work. Aborting a browser request does not prove the service cancelled its action. Preserve a path to discover the outcome after interruption; prevent stale callbacks from changing a replacement screen. Release owned timers/listeners on teardown.

Use existing draft retention where appropriate to the data's sensitivity and storage policy. Explain what survives leaving or reload. Warn only when meaningful unsaved work is at risk; restore focus after dismissing a dialog. Browser `beforeunload` is a limited supplement: it needs prior interaction and is unreliable on some lifecycle paths, especially mobile (`web-beforeunload`). Do not claim it guarantees recovery.

Match confirmation to consequences. Routine reversible saves usually need clear completion feedback, not a pre-save dialog. For consequential changes, show the affected object and scope before commitment; use review, correction or supported undo according to the contract. Offer undo only when it reverses the actual effect, with any expiry or partial reversal visible. WCAG SC 3.3.4 is Level AA with a defined legal/financial/data/test scope and alternative safeguards; it does not require every form to open a confirmation dialog (`wcag-form-prevention`).

## Verify the recovery journey

Exercise realistic values through the relevant transitions: edit, invalid submission, correction, service rejection, safe retry and independently inspected saved result. Compare exact strings and selections after each failure, including whitespace or punctuation where meaningful. Count actual service attempts and effects while repeating activation, and edit again after success. For uncertain outcomes, model a lost acknowledgement separately from definite rejection and prove status reconciliation does not create another write.

Complete the journey by keyboard. Inspect associated errors, useful focus after validation/failure, restoration after cancellation, and stable focus during pending changes. Use concise status semantics for updates that do not take focus; avoid duplicate announcements from focused errors and live regions (`wcag-form-status`). DOM semantics and automated accessibility scans do not prove screen-reader speech. Inspect error wrapping and control availability at narrow/desktop widths and relevant actual zoom through [browser.md](browser.md). Test introduced interruption/cleanup behavior and retain failed attempts and incomplete checks.

Use a deterministic service simulation only in isolated evaluation tooling, disclose it in demo documentation, and keep its controls outside the product interface. Exercise runtime behavior in its own browser, preserving scriptless review previews. If agent review is used, give a raw goal without the expected clicks; record agent findings separately from human usability evidence. Finish with [evidence.md](evidence.md), including unavailable devices, engines, screen readers and real-service checks.

Source IDs resolve to direct links, inspected passages, retrieval dates, applicability and limits in [sources.json](sources.json). These are original summaries; publisher branding and editorial conventions are not product requirements.
