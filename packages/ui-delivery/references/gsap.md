# GSAP technology adapter

Load only when GSAP is actually used. Pair with [browser.md](browser.md); motion does not replace semantics or keyboard checks. Inspect the installed dependency, lockfile and runtime `gsap.version`; compare the APIs used with the version-scoped official source records in [sources.json](sources.json).

1. State the motion's task purpose. Essential content and controls remain available without animation. Choose a reduced-motion result that removes unnecessary spatial motion; do not merely slow it down.
2. For preference-responsive motion, `gsap.matchMedia()` collects animations in a context, reruns matching conditions on change and reverts old animations. Include matching coverage for both preference values. It was added in 3.11.0; this slice exercises 3.15.0 only.
3. Scope selectors to the component. Record animations created by delayed event handlers through the context. Custom listeners/timers need explicit cleanup; GSAP reversion does not remove arbitrary listeners. On unmount invoke the owned MatchMedia's `revert()`. Avoid duplicate ownership and global kills that can affect another component.
4. Test initial reduce/no-preference loads, both live transitions (including during motion), keyboard activation, repeated remounts and unmount during animation. Observe styles/content, animation counts, listener effects and stale callbacks after unmount. A cleanup function's existence is not runtime proof.
5. Preserve browser results and exact dependency hash/version. Check performance on representative hardware before making performance claims. A desktop animation completion test does not prove smoothness on mobile or low-power devices.

Sources: `gsap-media` (conditions, interactivity and cleanup) and `gsap-context` (scoped recording and reversion). Official skill repository overview is not an audited dependency and is not required. Human motion comfort, real device performance, other frameworks' lifecycle integration and native reduced-motion behavior remain separate evidence gaps.
