# Browser adapter

Use for observed DOM/browser content; combine with a shell adapter for embedded webviews. Identify the actual framework from imports/manifests and record browser build, OS, viewport, device scale, input, locale, fonts and fixture hash. A mobile viewport is responsive emulation, not a physical mobile device.

## Capability and evidence plan

| Capability needed | Method and completion evidence | Missing capability |
| --- | --- | --- |
| Runnable browser and relevant data states | Load affected routes; exercise loading, empty, partial, failed, unknown, success and validation states that actually exist. Preserve errors and recovery observations. | Source inspection only; rendering not-run |
| Viewport and screenshot control | Capture desktop and narrow layouts, inspect clipping, overflow, reading order and essential content. Scroll long content normally. | Responsive/visual checks not-run |
| Keyboard input and focus inspection | Tab and Shift+Tab through the journey; activate native controls; exercise widget-specific keys only where applicable. Observe visible, unobscured focus and destination/restoration after changes. | Keyboard/focus not-run |
| Browser zoom | Set actual 200% browser zoom and record before/after scale and CSS viewport; exercise content and controls. Separately check 320 CSS px reflow where applicable. CSS zoom, deviceScaleFactor and pinch scaling are not browser zoom proof. | Zoom not-run even if a narrow viewport passed |
| DOM/accessibility inspection | Check names, labels, headings, landmarks, status semantics and native controls. Use an available axe integration for the adopted target; preserve violations and incomplete/manual checks. | Name the unavailable automated or manual check |
| Assistive technology | Exercise intended screen reader/browser pair and relevant announcements/navigation. | Screen-reader behavior not-run; DOM/axe is not equivalent |
| Independent task review | Reviewer attempts raw goals with actual content and screenshots/runtime. Separate critical task failures from mechanical results. Human trials need actual participants. | Agent judgment only; human acceptance pending |

For reusable low-level observations with a caller-owned Playwright page, use [browser_probe.mjs](../scripts/browser_probe.mjs). It installs nothing, asserts no product-specific pass and does not supply an accessibility engine. The caller owns fixture states, expected behavior, axe invocation, artifacts and pass/fail decisions. Browser tooling is an optional evaluation dependency, not a dependency of the Python record validator.

## Task-specific interpretation

For `ui-layout-policy`, read [layout.md](layout.md). Measure content space after navigation and inspect shared alignment across related routes at narrow, standard-desktop and wide-desktop sizes plus actual 200% browser zoom. Record CSS viewport, device scale, zoom mechanism, font family and screenshots; inspect text measure separately from shell width and test comparison labels, values, local scrolling and keyboard access.

`carbon-grid` and `govuk-layout` supply contextual design-system guidance. `wcag-visual-presentation` explains **AAA** SC 1.4.8, including an available presentation mechanism for at most 80 characters/glyphs (40 CJK); it is not an AA whole-page cap. CSS `ch` approximates measure, not literal character count. `wcag-reflow` explains **AA** SC 1.4.10: vertical content at 320 CSS px width, or horizontal content at 256 CSS px height, without lost information/functionality or two-dimensional scrolling except where that layout is necessary. Data tables may qualify; individual cells and surrounding content still need reflow. Document the scope of any exception and verify keyboard scrolling and readable cell content. Understanding documents are informative; adopted normative criteria remain authoritative. Neither check establishes native accessibility or full web conformance.

- `ui-primary-task`, `ui-state-truth`: find the decision and next action; retain source-level gaps and truthful status. Consolidation is a possible solution, not a required layout.
- `ui-comparison`: keep needed attributes jointly accessible; test the comparison at narrow sizes without forcing recall across hidden panels.
- `ui-web-access`: apply the profile's adopted criteria. Focus order, visible focus, names, keyboard operation, text resize/reflow, contrast, target size and feedback need evidence appropriate to the changed controls. Native HTML usually avoids unnecessary custom keyboard logic.
- `ui-scope`: a small label correction preserves structure, styles and handlers; check changed intrinsic sizing and activation. Do not redesign the screen to satisfy an unrelated checklist.
- `ui-visual-proof`, `ui-task-proof`, `ui-evidence-truth`: screenshots prove only captured states. Inspect their quality before approving a baseline. Agent trials do not establish participant success.

Sources: `wcag22`, `wcag-resize`, `wcag-reflow`, `aria-apg`, `playwright-visual`, `playwright-access` in [sources.json](sources.json). APG is informative and relevant patterns must be reviewed when used. No custom widget is required by this adapter. [adapters.json](adapters.json) records the tested scope; unlisted engines, frameworks and native shells remain unverified. No full WCAG conformance claim follows from these checks.
