# Establish a visual direction

Use when an app needs a visual direction and inspection finds no established system. Missing design documentation alone is insufficient: coherent components and rendered screens can already supply one. Use [visual-system.md](visual-system.md) to discover and extend that system. A local addition inherits its surroundings unless the authorized task changes the direction.

## Ground the direction

Reuse the brief, audience, primary task, supplied assets and constraints already known through [interactive.md](interactive.md). Ask only for missing information that materially changes the result. Identify where and how often the audience uses the app, what they need to notice or do, and which assets or brand commitments must carry through. Keep uncertain assumptions explicit; a simple app need not complete a design questionnaire.

Interpret supplied references through observable qualities: hierarchy, typography, color relationships, spacing, density, imagery and motion. Explain how a useful quality serves this app's task. Separate the user's stated preference from your interpretation: “You asked for the reference's compact rows; I infer that its muted palette may also suit frequent logging.” An attractive reference is not blanket permission to copy its identity, assets or every design decision. Retain confirmed assets and mark unavailable assets as unavailable.

## Resolve material choices

Use the existing browser collaboration loop when the direction remains materially open. Show meaningfully different directions with the same task, content, data and relevant state so the user can compare their effects. A palette swap may suffice when color is the only open decision; otherwise make the structural or typographic difference visible. Choose as many alternatives as the unresolved choice warrants, without a fixed count or a preferred aesthetic imposed by the framework.

Explain practical tradeoffs in plain language: a compact log exposes more entries at once; a spacious tally gives the current count and logging action greater emphasis. Distinguish an agent recommendation from an explicit selection. Allow written feedback, uncertainty and delegation through the existing controls. Skip alternatives when the direction is supplied, accepted within this scope or explicitly delegated. For delegation, record the choice and rationale as the agent's decision.

Name the basis of a conflict. An adopted accessibility requirement, a runtime or asset constraint, an observed convention and a matter of taste carry different weight. Describe the concrete effect and propose a suitable alternative that preserves the intended quality, such as retaining a pale accent on a surface while using a darker text role. Conventions can be reconsidered within scope; taste does not certify a failed requirement. Use the applicable adapter and existing exception/evidence rules instead of inventing aesthetic gates.

## Turn the selection into a reusable system

Consume the saved submission before dependent work. Translate the selected qualities into a small set of roles in the project's actual styling mechanisms: text hierarchy, surfaces and text colors, action emphasis, spacing and density, and any needed border, imagery or motion roles. Reuse theme configuration, CSS variables, utilities or components already available; a small app needs only the roles it uses. Explain which selected quality each consequential role carries and where it appears.

Apply these relationships across related screens and interaction states while letting each task determine its layout. Share action and state meaning; a history view can be denser than the logging view. Width and reading measure belong to [layout.md](layout.md); copy, data, forms and navigation retain their existing references. Motion remains optional. If used, preserve equivalent content, completion feedback and operation under reduced motion; use [gsap.md](gsap.md) only when GSAP is selected.

Reuse `identity_references` for reference qualities, `provenance` for explicit versus inferred or delegated decisions, `existing_components` for implemented roles, and the existing constraints/layout policy. Keep candidate directions and the selected rationale in the session's brief, submissions and result decisions. Reserve `accepted_patterns` for actual scoped acceptance. No extra profile schema or separate onboarding is needed.

## Review the result

Register the working result and explain how the submission changed it. Use [browser.md](browser.md) and [evidence.md](evidence.md) to inspect rendered wide/narrow layouts, visible keyboard focus and relevant empty, populated and action states. Consume feedback against its named target, resolve it in a revision, and return that revision for review.

Direction selection authorizes the direction within the task; feedback requests a correction; finished-result acceptance records an explicit decision about that result. Preserve these meanings through saved-state resume. Silence, cancellation, defaults and uncertainty supply no consent. Synthetic submissions and deterministic fixtures prove mechanics only and stay labeled separately from human preference, task success and acceptance. The interaction reference owns the transaction and acceptance lifecycle.
