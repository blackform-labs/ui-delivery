# Product layout policy

Use when changing width or establishing consistency across related screens. Record the policy in the existing schema-1 profile's optional `constraints.layout_policy`, or a compact task note for a small change. Finish when each affected layout role and intentional exception has a reason and a verification method.

| Role | Product decision |
| --- | --- |
| Application | Allocate the space remaining after navigation, panels and platform insets. Define shared responsive margins and alignment anchors across related screens, with content capacity appropriate to the task. |
| Reading | Constrain prose measure independently of the application shell. Choose it for actual type, language and reading task; inspect rendered lines. |
| Comparison/data | Provide enough width to compare needed attributes together. At narrow sizes choose usable reflow, a paired attribute layout, or justified local scrolling; retain names, facts, relationships and keyboard access. |
| Exceptions | Record scope, rationale, owner decision, remaining risk and review trigger/date. Preserve an explicit pending decision where approval has not been given. |

When adding a data presentation, inherit the established application shell, margins and alignment anchors. Keep reading-measure constraints on prose; an inner chart or table must not impose a new page-wide maximum. If no width policy exists, choose and record one for the task, then inspect its use of narrow, standard and wide space. A local plot-size limit may be justified for legibility without narrowing the surrounding report.

The template uses three descriptive strings (`application`, `reading`, `comparison`) and an `exceptions` array with the five fields above. Omit the optional object on valid legacy records. An empty exception array means none recorded; it does not approve a design. Keep provenance in the profile's existing `provenance` field, and accepted decisions in `accepted_patterns` only when actually accepted.

`ui-layout-policy` is a team policy informed by `carbon-grid` and `govuk-layout`; their grid sizes, columns and maximum widths remain design-system conventions. Choose values for the product. Neither 85% width, a fixed maximum width, identical widths across separate products, nor a scrolling ban is universal. A reading column and a wider comparison can share an alignment anchor without sharing a width.

Route measurements through the actual platform adapter. Browser CSS units, zoom and WCAG checks belong to [browser.md](browser.md); native layouts require their own runtime, units, conventions and accessibility evidence. This policy adds no native implementation support.

Verify narrow, standard and wide layouts and relevant scaling. Record actual available space, margins, text measure and comparison behavior. Pair mechanical geometry/overflow observations with rendered task judgment; a width ratio, character-unit setting or no-overflow result is not proof of readability. Preserve normal document scrolling where the task benefits from continuous content.
