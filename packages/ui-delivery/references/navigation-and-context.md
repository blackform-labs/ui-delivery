# Navigation and context

Read when choosing destinations or related views, finding records, or returning from details. Start with the user's task and established product conventions. Apply existing `ui-primary-task`, `ui-comparison`, `ui-state-truth`, `ui-web-access`, `ui-layout-policy` and evidence rules; no new router, schema or storage architecture is required.

## Choose the boundary

| Need | Useful starting point | Tradeoff to resolve |
| --- | --- | --- |
| Reach a distinct destination or independently useful record | Page/route with a meaningful heading and stable address | Supports direct entry and browser history; carry the context needed to return. A route need not imply a full document reload. |
| Switch related views of the same object or task | Tabs when users benefit from switching | Hidden panels impede continuous reading and simultaneous comparison. Keep content visible or use headings when that better serves the task. Route links styled as tabs remain links; a real tabs widget needs tab/panel relationships, selection and keyboard behavior. |
| Inspect supporting information | Native disclosure or the product's accessible equivalent | Label what it reveals; keep essential outcomes and required next steps visible. Expansion is an operation, not a new destination. |
| Find a known record | Search with a clear scope | Explain searchable attributes when useful. Choose explicit submission or live search by the task, latency and cost. |
| Narrow or order a collection | Meaningful filters and sorting | Show applied values, combination semantics and ordering. Sort the relevant result set before slicing pages, with stable ties. |
| Traverse a longer result set | Pagination when bounded pages help | Retain criteria across pages. An all-results view can suit a short list; infinite scrolling needs reachable controls/footer, keyboard continuity and return restoration. Neither is universal. |

Tabs and disclosures are conditional choices (`apg-navigation-tabs`, `apg-navigation-disclosure`, `govuk-navigation-tabs`). Preserve the product's labels, hierarchy and responsive shell through [layout.md](layout.md). Breadcrumbs can explain ancestry in a deeper hierarchy; they do not necessarily return to a filtered list. Add them only when that distinction helps.

Use destination links and operation buttons according to the actual platform. In browsers prefer real anchors with usable `href`s; preserve open-in-new-tab, copy-link, modified clicks and ordinary Back/Forward. A link role alone supplies none of those behaviors (`apg-navigation-links`). Give navigation regions meaningful names where multiple regions exist. Expose location/current page, selected tab or applied filter with the correct semantics and a visible cue that does not depend on color alone (`wai-navigation-structure`). Keep selected styles from shifting neighboring controls.

## Place only the state the task needs

Decide restoration scope before adding persistence. Same-session return behavior differs from reopening the product days later.

| State owner | Suitable state when needed | Boundary |
| --- | --- | --- |
| URL | Stable destination identity; non-sensitive committed query, filters, sort, page or shareable view | Direct entry and refresh must reconstruct a meaningful view. URLs reach history, logs, copied links and potentially referrers; keep secrets and sensitive search data out. Encode values with URL APIs and validate them against the product contract. |
| Browser history entry | Context associated with a particular visit: return origin, stable focus target, scroll anchor/offset | Entry state is not durable storage or an authorization boundary. Respect the router's existing history contract. Preserve native history behavior where it already works. |
| Temporary view state | Unsubmitted search text, transient selection, expanded support or pending work | Keep it local when sharing or persistence adds no task value. Make loss on leaving clear if consequential. |
| Existing persistent storage | A deliberately retained preference or draft justified by recurrent use and the product's storage policy | Reuse existing ownership, scope and retention. Handle denied/unavailable storage. Persist only necessary non-sensitive context; avoid a new storage layer merely to restore a return trip. |

Sensitive committed searches may need existing policy-approved short-lived context instead of URL or history state; expose any resulting direct-entry or restoration limits. History state can be serialized by browsers and is not a private scratch store.

This is a decision aid, not a prescribed mapping. Inspect the actual router only if one is used. History `pushState` adds an entry; `replaceState` updates the current entry. Meaningful destinations and committed search/page changes may deserve entries; transient typing usually does not. Define Back behavior so it does not walk every keystroke. In a same-document implementation initialize the first entry as needed, handle `popstate`, and reconstruct the view from validated URL/history data (`web-navigation-history`). A detail opened directly needs a useful collection link even with no origin entry; blindly calling Back can leave the product.

Allowlist parameter names, values and record identifiers; bound query length and page numbers. Decide duplicate-parameter handling and normalize obsolete/invalid values safely, with a useful explanation when the correction changes the user's interpretation. Never use a return parameter as an unchecked external redirect or render query text as HTML (`web-navigation-params`). An unavailable destination must not masquerade as another record.

## Keep finding and returning coherent

Keep committed criteria, result count, order and displayed records in agreement (`scot-navigation-search`). Distinguish a typed draft from applied criteria if they differ. Changing a query/filter usually starts at the first page; a shrinking dataset needs a defined clamp/reset with explanation. Clear invalid selections rather than transferring them to whichever record now occupies the same index. Use stable record identity throughout sorting, pagination and detail links. [Data presentation](data-presentation.md) owns row/header/value semantics.

Before leaving a list, preserve the controls and position needed to continue this task. On return, reconstruct criteria and order, then restore the record or meaningful anchor once content is ready. Prefer stable anchors over blind pixel offsets when data or geometry changes. Let existing browser restoration work where sufficient (`web-navigation-scroll`); coordinate any custom handling so browser and application do not fight. A disappeared or filtered-out record needs a truthful notice and a usable results/nearby fallback. Do not restore an invalid selection, wrong row or obsolete page silently.

Scroll alone cannot restore the keyboard task. Where normal browser behavior does not suffice, restore focus to the originating record/control, or a meaningful result heading if it is unavailable. Keep it visible and unobscured; preserve logical Tab continuation. New route views may need heading focus in a same-document app. Avoid stealing focus on fresh document entry, routine updates or every keystroke. Coordinate `focus({preventScroll:true})` with position restoration only when both remain usable (`web-navigation-focus`); verify actual behavior through [browser.md](browser.md). DOM semantics do not establish screen-reader announcements.

## Truthful transitions and recovery

No results should name the applied scope and offer a useful way to broaden it without forcing re-entry. Loading is not an empty result. A failed request needs its own recovery path and retained criteria. If older results remain while refreshing, label their stale scope/freshness; do not pair them with the new query's count as though current. Missing, unauthorized and removed destinations should explain only what the service can truthfully establish and offer an available route onward.

If search is asynchronous, bind each response to its criteria/request generation. Cancel superseded work where supported and ignore obsolete responses even when cancellation arrives too late. Commit query, count, page and records together; prevent stale callbacks from repopulating a replaced view. Test rapid changes with reordered responses and failure after prior success. This requirement is conditional; a synchronous local list does not need an artificial service.

For navigation with meaningful unsaved edits, follow [forms-and-actions.md](forms-and-actions.md) for draft retention, leave warnings, cancellation and uncertain completion. Returning to a saved view cannot imply that unsaved work was committed.

## Verify a whole task

Give an independent reviewer a raw finding-and-returning goal using a coherent dataset. Verify the intended record and nearby continuation, not only URL strings: search, filter, order, page, open details and return. Check agreement among controls, counts and records; invalid pagination after filtering; Back/Forward; direct entry; refresh; malformed/obsolete parameters; missing records and changed datasets. Exercise keyboard focus and visible position, normal link capabilities, narrow layout and actual relevant browser zoom. Retain accessibility violations and incomplete findings, failed attempts and review corrections. Add async race checks only when async behavior exists.

Use [interactive.md](interactive.md) if unresolved questions or feedback need that workflow; keep runtime behavior in its own authorized browser and preserve scriptless review previews. A specified task needs no interview. Finish using [evidence.md](evidence.md), separating automated observations, agent judgment, screen-reader/device gaps and human acceptance.

Source IDs resolve in [sources.json](sources.json) with direct links, inspected passages, dates and limits. GOV.UK navigation, tab and pagination conventions inform choices (`govuk-navigation-service`, `govuk-navigation-pagination`); their branding, automatic first-page redirects and external-window preferences are not universal rules.
