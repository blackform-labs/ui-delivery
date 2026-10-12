# Package maintenance

Revision 0.11.0 adds conditional [critique and refinement guidance](refinement.md), three isolated before/after evaluations and a local roadmap. Existing schemas, interaction runtime, browser/GSAP support and accepted-decision semantics are preserved. Agent continuation remains manual. Figma and richer collaboration are roadmap work only.

Revision 0.10.0 adds conditional [new-app visual direction guidance](visual-direction.md). Existing profile fields, interaction contracts, browser/GSAP support and optional motion remain unchanged. Selection, feedback and result acceptance retain their separate meanings.

Revision 0.9.2 makes submission receipts and actual agent activity visible in the browser. Read-only polling offers new results without discarding drafts. Explicit agent work events distinguish waiting, working, blocked and stale updates; no background agent launcher is added. Existing records remain readable; sessions with work events require 0.9.2 or newer.

Revision 0.9.0 makes browser collaboration the default for new apps and journeys, with proportionate chat/autonomous/tiny/specified exceptions. The existing local tool adds explicit unsure answers, truthful handoff status and save-time draft protection. Schema-1 history remains readable; sessions using unsure require 0.9.0 or newer. No live agent watcher is installed.

Revision 0.8.0 adds conditional [existing visual system guidance](visual-system.md) and an isolated two-screen reuse evaluation. Existing layout policy, rules, schemas, interaction tooling and adapter support are unchanged.

Revision 0.7.0 adds conditional [navigation and context guidance](navigation-and-context.md) and a separate finding-and-returning evaluation. Existing rules, schemas, interaction tooling and adapter support are unchanged.

Revision 0.6.0 adds conditional [forms and actions guidance](forms-and-actions.md) and an isolated local service simulation for recovery evaluation. Existing rules, schemas, interaction tooling and adapter support are unchanged.

Revision 0.5.1 clarifies that data displays inherit the product layout policy, with prose measure independent of application width.

Revision 0.5.0 adds conditional [data-presentation guidance](data-presentation.md), with a separate local evaluation. Existing rules, record schemas and adapter support are unchanged.

Revision 0.4.0 added the local [briefing/review workflow](interactive.md), optional schema-1 interaction context and conditional [product-copy guidance](product-copy.md). Node 22 or newer runs the dependency-free local tool. Existing browser adapter 3 and all other adapter records remain unchanged. No native support, installation or publication is added. Legacy profiles remain valid; historical evidence retains its original package revision.

Package revision: **0.11.0**, experimental local browser/GSAP slice. Record schema: **1**. The structured [rule catalog](rules.json) is canonical for this package; the Phase 1 prose catalog is a historical input. The bundled [source registry](sources.json) is the package's pinned authority; it preserves earlier retrieval scope and records targeted Phase 3A source refreshes. No upstream manuals or third-party skill bodies are bundled.

Resolve conflicts by applicability, adopted commitments, and installed versions. Preserve compatible product decisions; expose unresolved incompatibilities. Product preferences cannot turn a failed accessibility criterion into a pass. Recheck version-sensitive APIs against the installed runtime before using them; summaries and landing pages do not certify an entire platform. Live source changes require a reviewed package revision and targeted evaluation, not silent replacement of accepted decisions. Review sources quarterly or when upstream changes invalidate guidance; no scheduler is installed.

Authoring used skill-creator and writing-for-agents. Discover optional Impeccable task-shaping/critique and verify-and-stop guidance by name in the host when useful; read chosen instructions before use. The core has no skill dependency. Missing optional skills are an authoring gap to record, not an installation request. Preserve the host's current skill schema and default automatic discovery. Impeccable's task/audience/state framing is useful; its scoring thresholds or visual tastes are not universal core requirements.

Validate with `python3 scripts/validate.py` from this package. For profile/evidence files, run `python3 scripts/validate.py --profile path/to/profile.json --evidence path/to/evidence.json --artifact-root path/to/artifacts`. Paths in records are portable and relative to the explicit artifact root; use canonical HTTPS URLs for external references. Validation reads only local files and never fetches links. Run the installed skill-creator structural validator separately; it does not measure behavioral quality.

Schema changes that break stored records require migration notes and a new schema version; reject unknown versions. Source-derived rules reference registry IDs; team policies carry rationale. Preserve rule IDs when revising meaning and increment revisions. Evaluations stay outside the package. Record package and registry hashes, actual artifacts, failed runs and limitations; agent trials remain simulations. Human acceptance requires an actual actor decision, never inferred test success. Distribution/license selection, installation and CI integration require their own scope.
