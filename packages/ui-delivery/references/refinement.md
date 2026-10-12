# Critique and refinement

Read for design critique, material polishing or feedback such as “generic,” “calmer,” “more information,” or “better on my phone.” Start from the current brief, working interface and scoped decisions. Use the existing loop: understand → establish direction → build → inspect → gather feedback → refine. A correction reuses that context; it need not reopen direction selection.

## Diagnose in context

Attempt the primary journey and inspect the relevant rendered states before prescribing a style. Identify what works and should survive the change. Match criticism to an observed element, state, width and consequence; a source-only concern remains a hypothesis until rendering is available.

Distinguish a usability defect (an action is difficult to find), an adopted accessibility requirement (text contrast), a product constraint (required comparison or supplied assets), and an aesthetic preference (quieter expression). Prioritize by task impact and evidence. Explain preference tradeoffs without presenting taste as a failed standard. A design can use dense rows, expressive type, cards or long pages when they serve its audience.

Inspect the relationships that explain the concern, selecting only relevant ones:

| Relationship | Useful diagnostic question |
| --- | --- |
| Task hierarchy and composition | What attracts attention first, and does that help the user decide or act? Does supporting content compete with the needed action or evidence? |
| Typography | Do size, weight, line height and measure distinguish content roles with real copy? Check wrapping, long labels, numerals and language; a font change alone may leave the hierarchy unresolved. |
| Spacing, alignment and density | Do proximity and shared anchors make groups recognizable? Can the needed facts be scanned together? Compact within related groups before removing information or shrinking every label. Use [layout.md](layout.md) for width and responsive decisions. |
| Color, imagery and icons | Do contrast and emphasis preserve meaning across states? Do available assets explain this product or merely occupy space? Preserve their provenance, text alternatives and consistent icon semantics. Use suitable real assets or an explicit asset gap when the brief calls for them. |
| Product identity and consistency | Which choices carry the product's character? Compare related screens and variants through [visual-system.md](visual-system.md); keep intentional task differences. |
| Motion | Does movement explain a transition, relationship or state? Keep content and controls available with reduced motion. Use [gsap.md](gsap.md) only for actual GSAP work. |
| Complete experiences | Inspect the states the journey actually has: loading, empty, partial, error, success and recovery. A polished populated screen cannot establish their quality. Preserve truthful outcomes and retained input through [forms-and-actions.md](forms-and-actions.md). |

## Translate feedback into a bounded change

Connect the user's words to an observed cause and a change they can review. Preserve explicitly accepted decisions within their scope; label observed conventions and agent choices accurately. A compact task note or existing result summary can hold the feedback target, interpretation, change, retained decisions and expected task effect. Use existing profile/session fields where reusable context is needed, rather than introducing another decision store.

| Feedback | Possible interpretation after inspection | Reviewable correction and preservation check |
| --- | --- | --- |
| “This feels generic.” | The screen lacks product-specific hierarchy, content or asset relationships. | Strengthen the relevant composition or identity detail; show how it fits the audience. Retain confirmed facts and assets. Avoid assuming a new font or unusual effect is the answer. |
| “Make it calmer.” | Too many elements claim equal emphasis, or motion interrupts reading. | Reduce competing emphasis or unnecessary movement while retaining status distinctions, contrast and findable actions. |
| “Show more information without making it overwhelming.” | The comparison needs more simultaneous facts or tighter grouping. | Adjust density and grouping, or expose genuinely secondary detail. Keep essential values, coverage and comparisons accessible; [data-presentation.md](data-presentation.md) owns meaning and truthful data. |
| “Make the main action clearer.” | Wording, placement or visual emphasis fails to express the next step. | Name and emphasize that action in its task context; preserve other necessary controls and outcomes. |
| “Make this work better on my phone.” | Wrapping, control spacing or order makes the journey harder at narrow widths. | Adapt the affected composition and test the same journey at narrow width and by keyboard; preserve useful desktop behavior and required facts. |
| “Keep the layout, but change the visual style.” | The structure is settled; visual roles remain open. | Change scoped type, color, borders or imagery through existing styling mechanisms, retaining composition, semantics and behavior. Make any necessary structural exception explicit. |

These are hypotheses, not automatic recipes. Proceed from a sufficiently complete request or delegated decision and explain your interpretation. Ask a focused question only when plausible interpretations materially change the work. Offer comparable visual alternatives when that resolves an open choice, without a fixed count. Honor chat, skipped onboarding and delegated design through [interactive.md](interactive.md).

## Return an inspectable revision

Keep the working preview available when tooling permits. Compare the initial and revised result with the same content, data, viewport and state; also inspect affected states and related consumers. Explain the task improvement and any tradeoff. Separate observed behavior and measurements from agent design judgment and participant evidence. A compact control fitting on a phone is observable; a claim that users find it easier needs human evidence.

Resolve each submitted feedback target through the existing handoff and result registration in [interactive.md](interactive.md). It owns draft lifetime, revisions, resume and acceptance. Browser submission saves context; it does not launch or notify an agent. Return the runtime URL and review result, then leave acceptance to the user. Selection, requested correction and finished-result acceptance retain separate meanings. Synthetic submissions test mechanics; they do not establish understanding, design quality or human acceptance.

Finish the bounded correction once affected checks pass and material findings are resolved or reported. Preserve failed attempts and remaining weaknesses through [evidence.md](evidence.md). Further preference changes belong to the next feedback loop.

Attribution: `impeccable-refinement` in [sources.json](sources.json) informs task-specific critique and focused refinements; this workflow and diagnostic questions are original package guidance. `wcag-critique-contrast` and existing `wcag-form-status` distinguish testable accessibility concerns from taste. Publisher examples, aesthetics and scoring thresholds are not universal gates.
