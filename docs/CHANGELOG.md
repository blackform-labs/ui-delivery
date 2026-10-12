# Version notes

## 0.12.1, October 11, 2026

When a required choice remains unresolved, current agent help now remains visible while that choice is open. Stale help does not override the pending state; pause, answer requirements and result acceptance retain their existing behavior.

## 0.12.0, October 11, 2026

Active browser sessions can deliver submitted answers and feedback to an agent that is servicing a foreground listener. The agent reads the current handoff, applies authorized work, registers a result and listens again. The local implementation includes session ownership, recoverable delivery acknowledgements, stale-revision checks and visible connection states.

This path was exercised in a Codex foreground-execution host. It cannot launch an agent or wake a closed conversation. Other hosts need their own trial; saved manual handoff remains available. Interrupted application edits require reconciliation before retrying.

## 0.11.0, October 11, 2026

Design critique and refinement now has conditional guidance for turning ordinary feedback into a bounded, reviewable change. It diagnoses the observed cause, distinguishes task defects and accessibility requirements from taste, and retains scoped decisions. Examples cover generic appearance, calmer expression, density, action clarity, phone use and changing style while retaining layout.

The [roadmap](ROADMAP.md) includes optional Figma, richer contextual collaboration and reliable continuation. Figma is future work; no integration or automatic agent launcher is included.

The portable package remains compatible with the existing schema-1 records and interaction runtime. Browser/GSAP support is retained. Local fictional marketing, data and consumer trials provide bounded rendered evidence and independent agent review; human acceptance remains pending. See [testing limits](TESTING.md).

Installed copies require an update; see [peer updates](UPDATES.md). Existing project sessions and application data belong to their projects and should be retained.

## 0.10.0

Conditional visual-direction guidance, comparable choices and reusable visual roles for new apps without an established system. Existing-system discovery and the manual browser-to-agent handoff remained in place.
