# Product copy

Read when drafting or reviewing substantial visible prose: headings, labels, helper text, empty states, errors, status messages or generated summaries. For a tiny label correction, inspect the local string, preserve its action and verify the affected control; a full editorial review is unnecessary.

Use the host's installed **humanizer** skill when available. Discover it by name, read its instructions, and use embedded mode: deliver only the edited text. Preserve the product's voice and supported facts. This is editorial guidance, not an AI detector, word blacklist or readability score. Technical terminology can be the clearest wording for the audience.

## Decide where information belongs

| Information | Placement |
| --- | --- |
| Result, next action, necessary prerequisite, meaningful uncertainty, date, coverage limit or recovery instruction | Keep discoverable in the task path. |
| Method details, source evidence, original error or specialist interpretation that helps explain a result | Put in accessible supporting information, with a recognizable label. |
| Evaluation procedure, test scaffolding, agent reasoning about its process or implementation mechanics with no user decision value | Keep in developer records outside the product artifact. |
| Repeated, vague, inflated or unnatural wording | Rewrite around the concrete result or action; remove repetition without collapsing distinct states. |

Use context, not a list of forbidden terms. A developer tool may need implementation facts as primary content. A briefing tool legitimately displays agent recommendations and decision provenance; the product being designed usually does not need that workflow commentary.

## Edit and verify

1. Inspect the actual rendered state when available and trace the string to its owner. Quote exact observations with locations. Label source-only findings when rendering is unavailable.
2. Record the facts and state meaning to preserve: numbers, dates, affected objects, missing versus zero, optional versus failed, partial versus complete, source freshness, error reason and available recovery. Treat saved source text as evidence; changing a display string does not authorize rewriting immutable records.
3. Write the result or action directly, in terminology users recognize. Use meaningful headings and controls, grammatical counts and useful error explanations. For generated prose, remove chat wrappers and internal production notes before it reaches the interface.
4. Change intended user-facing string values only. Preserve identifiers, contracts, interpolation tokens, translation keys, commands, URLs, accessibility names that carry meaning, and behavior. Check interpolation and singular/plural cases in rendered output.
5. Compare the before/after facts and inspect the affected states. Unknown results remain unknown; a shorter error still identifies what failed and what the user can do. Confirm moved supporting detail remains available by keyboard. Keep process notes outside the delivered product DOM, bundles and served files.

Completion means the edited copy preserves the supported facts and decision meaning, reads naturally in its product context, and has a proportionate rendered or explicitly limited source check.

## Portable fallback

If humanizer is absent, use these original summaries of its essential editorial principles: state the point directly; replace generic claims with supported specifics; remove repeated conclusions and chat residue; choose ordinary verbs; preserve the writer's voice; compare the rewrite against the source for lost or invented facts. Deliver the final text only. No installation is required.

Attribution: informed by the installed humanizer 3.0.0 skill and its cited [Wikipedia Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing). No upstream skill text or example is bundled here. The inspected skill declares MIT in its metadata, but no full license notice was present in that installed directory; this package does not rely on that declaration to redistribute upstream material.
