# Existing visual system

Read when extending or correcting an existing interface, or reconciling inconsistent related screens. For a tiny edit, inspect the affected component, nearest comparable use and relevant states; keep the correction and receipt local. Apply existing scope, layout, accessibility and evidence rules.

## Discover what the product uses

Inspect applicable design documentation and recorded decisions, theme configuration, CSS variables or other tokens, shared components and variants, representative related screens, and their rendered behavior. Trace a visible style to its actual owner: a theme mapping, component default, variant, utility or local override. A token name alone does not show which style wins in the runtime.

Distinguish the evidence:

| Evidence | How to use it |
| --- | --- |
| Documented or explicitly accepted decision | Retain its scope, rationale, owner and provenance. A design document records guidance; claim acceptance only when an actual decision supports it. |
| Consistent implementation convention | Reuse when compatible with the task and adopted commitments; label it as observed, without inventing owner approval. |
| Isolated deviation | Check whether it is intentional, stale or a defect before copying or removing it. |
| Unknown or conflicting evidence | Name the conflict and its effect on this task. Resolve using applicability, recorded intent, current runtime and existing authorization; ask only when the unresolved choice materially changes the result. |

There is no universal documentation-versus-code authority order. Inspect dates, scope and actual consumers when evidence disagrees. Existing accessibility commitments still apply; documenting an exception cannot turn a failure into a pass. If no established system is found, state that absence and use a proportionate local convention for the authorized change. A small feature does not authorize a comprehensive design system or product redesign.

## Choose the reuse boundary

Locate suitable components and variants before creating a new one. Reuse typography roles, spacing, colors, borders, radii, elevation, icons and interaction states through the product's existing mechanisms. Semantic tokens can retain a role across supported themes (`carbon-visual-tokens`); use the product's mappings, names and values, without importing Carbon's palette or scale.

| Choice | Useful when | Check |
| --- | --- | --- |
| Existing variant | Its action, content and states fit the task | Use its supported API and semantics; verify the rendered result. |
| Shared extension or correction | The need belongs to the component's reusable contract | Inspect call sites and other consumers first. Preserve defaults when adding a variant; check representative consumers, themes and affected states after any shared change. |
| Local exception | A specific task needs a different composition or narrowly scoped behavior | Keep the scope explicit, reuse underlying roles, and record rationale and decision status. Avoid silently changing every consumer. |

Component modifications can affect maintenance and accessibility (`govuk-visual-extension`). Use existing extension points where suitable; the publisher's BEM, fork and naming conventions are contextual examples, not mandatory architecture.

Preserve semantic distinctions. A destination link, an operation button, a selected toggle and a status label can look similar while meaning different things. Keep labels, accessible names, state semantics and behavior aligned with each action. WCAG AA SC 3.2.4 concerns consistent identification of recurring components with the same functionality; it does not require identical visuals or labels for every similar control (`wcag-visual-identification`).

## Apply across screens and verify

Maintain consistent roles and relationships across affected screens: heading hierarchy, action emphasis, alignment anchors and state meaning. Content density, reading width and comparison capacity can differ. Use [layout.md](layout.md) for dimensions and documented exceptions; preserve an intentional exception within its recorded scope and rationale.

Inspect hover, focus, active, disabled, loading, error and selected states where they exist, including supported themes. Do not add themes or artificial states to complete a checklist. A shared style correction must preserve behavior and usable states for other consumers as well as the target.

Use [browser.md](browser.md) or the actual adapter for desktop/narrow rendering, relevant zoom, hierarchy, alignment, contrast, visible keyboard focus and affected behavior. Compare representative consumers after shared edits. Inspect the output, not merely matching token strings. Keep failed attempts and unavailable checks; separate mechanical observations, visual judgment and human acceptance through [evidence.md](evidence.md).

Reuse `identity_references`, `existing_components`, `provenance`, `accepted_patterns` and optional layout policy in the existing profile when reusable context is warranted. A compact task note suffices for small work. Record proposed exceptions as proposed; do not promote observations or agent recommendations into accepted patterns. Copy, action recovery and navigation remain in their existing references.

Source IDs resolve to direct primary links, retrieval dates, original summaries, applicability and limits in [sources.json](sources.json). Discovery and reuse choices above are package guidance, not a new conformance standard or permission to adopt another product's visual identity.
