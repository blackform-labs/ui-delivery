# Data presentation

Read for metrics, tables, charts, data maps or animated data updates. Start with the reader's question, the available observations and the decision they support. Text or a table can be the finished answer. This guidance applies the existing `ui-primary-task`, `ui-comparison`, `ui-state-truth`, `ui-web-access`, `ui-motion` and `ui-layout-policy` rules; it adds no schema or mandatory renderer.

## Choose by task

| Reader needs to… | Useful starting point | Decide before drawing |
| --- | --- | --- |
| Check a value or a change | Labeled metric with unit, period and a relevant comparison | Explain the comparison basis and freshness. A sparkline earns space only if the trend matters. A larger number is not inherently better. |
| Find exact values or compare attributes | Semantic table; structured list for a few records | Preserve row identity, headers, precision and filter/sort scope. Use a chart only for a relationship the table makes hard to see. |
| Compare categories or ranks | Bars for magnitude; dots for positions or small differences | Order by the task: magnitude, natural sequence or a stable reference order. Bar lengths need a zero baseline; a clearly labeled dot scale can focus on a smaller range. Retain ties and category identity. |
| Understand time | Lines for a continuous trend, steps for values held until a change, columns for amounts per interval | Distinguish snapshots from interval totals. Position irregular dates by elapsed time. Leave missing observations as gaps; a line across them implies knowledge. |
| Assess progress or a target | Labeled fraction, progress bar or target marker | Establish the denominator/target, unit and period. Task completion and a measured level differ. Explain over-target values; unknown targets cannot yield a completion percentage. |
| Understand composition | Stacked bar; pie/donut for a few clearly different parts of a complete whole | Establish disjoint categories and the whole. Incomplete totals and overlapping responses cannot imply 100%. Bars are easier for small differences; stacked interiors lack a shared baseline. |
| Examine spread or outliers | Individual dots for small samples, histogram for frequency, box plot for compact comparisons | State sample size, bins and exclusions. Explain quartiles/whiskers and retain meaningful outliers; a summary can hide multimodality. |
| Examine a relationship or matrix | Scatterplot, or heatmap for dense paired categories | Label both variables, units and legend. Handle overlap and missing cells explicitly. Correlation does not establish cause; a heatmap sacrifices exact-value comparison. |
| Understand location or movement | Map when geography is essential; flow diagram when connections or transfers matter | A ranked location table may answer better than a map. Distinguish counts from rates, geographic coverage and normalization. Flow widths need consistent units and accounted-for inputs/outputs; sequence alone may need only a list or timeline. |

Selection sources: `ons-chart-choice`, `ons-bars`, `ons-lines`, `ons-composition`, `ft-vocabulary`. These are decision aids, not a catalog to reproduce. `carbon-data-dashboards` informs status versus exploration and stable color assignments; retain the product's identity and the audience's reading conventions.

## Preserve the observation

Keep units, time window/time zone, denominator, aggregation and filters with the displayed result or accessible supporting detail. Record source freshness separately from the measurement period. Distinguish measured, estimated, provisional and unavailable values; show ranges or other uncertainty when they change the interpretation. State what a range means and its method when known. Avoid precision unsupported by the data. Keep meaningful source errors, coverage and recovery details discoverable (`ons-uncertainty`).

Missing is not zero. A zero is an observation; an unknown is not a plotted zero or an empty success state. A partial sum is a reported subtotal, not a complete total. If known parts are shown as shares, name their restricted denominator and the omitted coverage. Preserve this distinction in tables, summaries, exports and accessible explanations.

For a rate moving from 20% to 25%, the absolute change is **5 percentage points** and the relative increase is **25%**, calculated as `(25 - 20) / 20`. State the compared populations/windows. Relative change from zero is undefined; give the absolute change. Avoid percentage comparisons between differently covered or differently aggregated samples unless the limitation is explicit and the comparison is defensible.

Use shared scales for comparisons where possible. A nonzero line/dot domain can reveal variation, but label it clearly and inspect whether it exaggerates the conclusion. Log scales need positive values and an audience that can interpret multiplicative distances. Avoid decorative 3D, area/radius confusion and unexplained dual axes. Preserve logical ordering, labels, units and stable series IDs through filtering and updates. Reassigning a color by current rank loses category identity.

## Make the meaning available

Provide a readable title, period, labels and an explanation of the important relationship, trend and gaps. Exact data alone may not communicate what the picture conveys. Associate a short accessible chart name with a visible explanation and a semantic table or structured description when the complexity needs it (`wai-complex-data`, `wai-data-tables`). Keep table headers programmatically associated; do not flatten a structured table into one long accessible name.

Use the adopted contrast criteria for text and essential marks, plus labels, shapes or patterns where color carries meaning. Provide keyboard and touch access to any information or controls exposed on hover; persistent labels or a nearby table often remove the need for tooltips. If a tooltip is used, verify focus, dismissal and persistence as applicable. Preserve focus through updates and announce a concise committed change only when useful, never every animation frame.

Inherit the product’s application width, margins and comparison policy from [layout.md](layout.md) before sizing data displays. Keep prose measure separate; verify that added charts and tables do not introduce an arbitrary page-width cap or overflow their assigned region. Use [browser.md](browser.md) for narrow layouts, actual zoom, reflow and keyboard verification. Check label clipping, legend wrapping, table scrolling and readable chart geometry at the actual target size; shrinking an entire SVG can make every label illegible. Record unavailable screen-reader/device checks explicitly.

## Choose motion ownership

Animate only when it helps a reader follow a changed observation, annotation or sequence. Immediate updates are appropriate for static reports, frequent data and reduced motion. Keep essential values available immediately.

| Need | Owner |
| --- | --- |
| Simple control/state feedback | CSS transition on the relevant property |
| Lightweight programmatic playback or cancellation | Web Animations API (`web-animate`, `web-animation-cancel`) |
| Updating marks owned by an existing chart library | That library's supported update/transition API; inspect the installed version (`chartjs-updates` is one example) |
| Coordinated annotations, surrounding UI, explanatory sequences or application-owned SVG | GSAP when its coordination helps; use [gsap.md](gsap.md) for lifecycle, context and preference handling |

Inspect existing dependencies first. Each animated property has one owner. A library-owned mark must not simultaneously receive CSS, WAAPI and GSAP mutations. A chart update can commit immediately while an independently owned annotation briefly highlights what changed. No charting or animation library is required by this package.

Committed data and tweened presentation are separate. Tables, labels, exports, saved state and announcements read committed observations. Intermediate positions or numbers are presentation only; never save, export or repeatedly announce them as measurements. Use bounded easing for quantitative position/length; overshoot implies an unmeasured value. Stable record IDs preserve correspondence when marks move; reordering or scale changes must not look like new measurements. Prefer a direct update with an explicit scale annotation when a transition would confuse domain changes with data changes.

Define interruption before implementing: a newer update supersedes the old presentation, cancels its callbacks and renders the newest committed state. For rapid updates, coalesce presentation without losing required records. On cleanup cancel owned animations and remove listeners/timers. With WAAPI, `cancel()` removes its effect; underlying styles must already represent the committed result, and any awaited `finished` rejection needs handling. Observe live preference changes (`web-media-change`); switching to reduce settles immediately and switching back must not replay stale motion. GSAP-specific mechanics remain in [gsap.md](gsap.md).

WCAG scope: SC 2.2.2 is Level A. Automatically starting moving/blinking/scrolling information lasting over five seconds alongside other content needs pause/stop/hide unless essential. Automatically starting updating information alongside other content needs pause/stop/hide or update-frequency control unless essential; this clause has no five-second exception. SC 2.3.3 is Level AAA: interaction-triggered motion can be disabled unless essential. Recommending reduced motion more broadly is this package's product policy, not a claim that 2.3.3 is AA (`wcag-pause-data`, `wcag-interaction-motion`).

## Verify the chosen presentation

Use one coherent fixture and realistic questions: which category needs attention, what was the exact value, what changed, and what cannot be concluded? Compare marks, labels, tables and derived metrics against the source, including missing, zero, partial and estimated states when present. Verify scale, order, units, time and denominators as well as arithmetic.

For motion exercise initial reduce/no-preference, both live preference changes, interruption and rapid repeated updates, scale changes when supported, and cleanup during playback. Inspect immediate committed values and the final equivalent reduced-motion result. Inspect rendered desktop/narrow states, keyboard/touch access and relevant zoom using [browser.md](browser.md). Preserve failures and corrections. Independent task review is agent judgment unless actual participants supplied the evidence.

Keep runtime tests outside scriptless interactive previews; [interactive.md](interactive.md) can review captured states without weakening its sandbox. If that workflow is used, prove submission → agent consumption → changed result, with separate direction, feedback and acceptance records. Fully specified fixture work can skip it. Finish with evidence and limits through [evidence.md](evidence.md); package checks do not certify accessibility, motion comfort or human acceptance.

All source IDs above resolve in [sources.json](sources.json), with direct links, reviewed sections, retrieval dates and limits. Guidance is original synthesis; no third-party poster, manual or code is bundled.
