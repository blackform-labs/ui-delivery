# UI delivery roadmap

Current source: 0.11.0, experimental. Checked October 11, 2026. This roadmap describes the next development stages. Browser/GSAP support remains limited to recorded runtimes; human task validation and framework acceptance are pending.

## A. Design critique and refinement

Purpose: help people describe an idea or concern in ordinary language, try a working interface, and review a focused revision. Build on existing visual direction, visual-system reuse, product-copy and interaction guidance.

Dependencies: runnable scoped fixtures, applicable accessibility checks, preserved decision provenance and independent review. The current slice adds contextual diagnosis and a comparison protocol to those existing capabilities.

Local completion criteria: a marketing site, data application and consumer application each have a documented brief, initial rendering, specific feedback, revised rendering, preserved decisions and limitations; meaningful journeys work at desktop and narrow widths. Structural verification, rendered observations and independent agent judgment are reported separately. Human completion requires actual participant task evidence and explicit scoped acceptance; synthetic submissions cannot meet it.

## B. Optional Figma integration

Purpose: let users bring an existing design or collaborate visually while retaining a complete account-free workflow through descriptions, references, screenshots and working previews.

Dependencies: a separately authorized integration, actual callable tool inventory, account/file access, rate/seat limits and a selected design scope. No installation, connection or implementation occurs in this slice.

Plan: read selected design context, screenshots, variables/styles and component information where the available tools support them. Mark the design as inspiration or a fidelity target. Reconcile it with product components/tokens and accessibility requirements; trace significant choices from file/node and inspected design revision to implemented component, token and rendered evidence. Compare matching content, viewport and state, documenting intentional differences. Recheck the design's freshness before later refinements.

Official capability review: Figma documents selection context, screenshots and variable definitions in its [MCP tools](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/). [Code Connect](https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/) can supply component mappings and usage details when configured. These are upstream capabilities; no Figma tool is connected or verified here.

Editable handoff/write-back is a separate exploration. The official [write-to-canvas documentation](https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/) describes native writes via remote `use_figma`, a Full seat and file edit permission, with current asset/font limitations. Availability in the intended host/account must be verified before promising it. Define explicit authorization for the exact file, nodes and operations, preservation and undo before any write.

Completion criteria: an authorized read-only trial reproduces inspected selection context, uses existing product roles, retains traceability and compares implementation against the intended design; missing tools/permissions produce an honest fallback. Account-free work passes the same task journey. Any write-back milestone needs its own supported-tool proof, scoped authorization and restoration test.

## C. More interactive collaboration

Purpose: make feedback easier to locate and compare in the working interface. Reuse current screen/result targets, feedback events, drafts, revisions and acceptance semantics.

Dependencies: Stage A's observed feedback problems and the existing interaction contract. Explore richer contextual feedback and state-matched visual comparisons. Evaluate annotation tools only after a trial shows that naming a screen/result or explaining the issue in chat is insufficient. Animation may explain a transition or comparison; preserve equivalent reduced-motion behavior.

Completion criteria: a participant can identify the target, describe a change, inspect the revision and retain settled decisions with fewer unresolved targeting errors. Verify keyboard access, narrow layouts, session isolation, draft lifetime, stale revisions and restart/resume. Do not infer acceptance from a default, silence or cancellation.

## D. Reliable continuation

Purpose: close the preview-to-revision loop when the host supports it. Today the browser saves answers/feedback and polls saved status; it does not notify, launch or wake a coding agent. Users return to chat with the named project/session. [interactive.md](../packages/ui-delivery/references/interactive.md) remains the handoff authority.

Dependencies: verified host notification/continuation capabilities and explicit ownership of a run. Investigate a submission signal, one authorized consumer per project/session, durable run identity, duplicate prevention, cancellation, crash recovery and resume against the current decision revision. Preserve immutable events and prior results. A notification alone is not execution proof; a work event alone is not completion proof.

Completion criteria: an actual supported host submission reaches its owned consumer once, the consumer applies the saved feedback, a fresh result is registered, and duplicates/cancellation/stale input/crash/restart behave as specified. Test isolation, unsaved drafts, visible progress and manual fallback end to end. Keep `continuation.automatic` false until this path is implemented and verified. Automatic execution still provides no human acceptance or expanded authorization.
