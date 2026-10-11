# Select guidance by surface

Inspect manifests, imports, renderer configuration, and user context. Record facts and uncertainty; a dependency alone may be unused. Choose all relevant layers, not a language-wide default. Exact matching records and evidence gaps live in [adapters.json](adapters.json).

| Observed surface | Candidate | Evidence boundary |
| --- | --- | --- |
| Browser-rendered frontend | browser | Actual browser content, keyboard/focus, semantics, zoom/resizing, relevant states |
| SwiftUI, UIKit, or AppKit targeting Apple | apple-native | Target OS/SDK runtime, native input, text sizing, accessibility and reduced motion |
| Wails plus web frontend | wails | Web-content checks plus separate packaged window/menu/bridge checks |
| Fyne widgets/canvas | fyne | Toolkit runtime and scaling/input checks; browser DOM tests do not cover it |
| Bubble Tea or other terminal renderer | terminal | Key interactions, terminal sizes and state output; assistive-technology limits explicit |
| GSAP selected for actual web motion | gsap, in addition to browser/webview | Installed-version API review, motion purpose, preference changes, lifecycle cleanup and runtime performance |
| Service/CLI with no interactive interface work | none | Continue backend task without UI ceremony |
| Other/unknown surface | no established candidate | Use applicable shared reasoning; record missing guidance and runtime checks |

Browser and GSAP procedures are implemented in [browser.md](browser.md) and [gsap.md](gsap.md). Their tested scope is recorded in [adapters.json](adapters.json); procedures alone do not establish runtime support. Other candidates remain documentation-only. Missing tools narrow the result: mark relevant checks not-run. Browser evidence never substitutes for native window, toolkit, terminal or assistive-technology evidence. Local evaluation dependencies may be added within an authorized project; global installation and adoption are separate scope.
