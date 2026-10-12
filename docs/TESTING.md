# Peer testing

Try one fresh app with no project history, then ask for one specific correction. The practical success condition is that you can complete onboarding, get a working app based on your answers, and review a correction without the author coaching each step.

Record whether the agent opened the actual onboarding tool, asked useful questions, consumed your answers, explained delegated choices, returned a working app, and retained the earlier decisions after correction. Note confusing transitions between the browser and chat. Do not submit acceptance just to complete a test.

## Evidence and known limits

The source delivery was evaluated on macOS arm64 with Node 26.8.1, Chrome 154.0.8037.98, Playwright 1.64.0, and axe-core 4.13.0. Node 22 is the documented minimum but was not directly exercised in that evaluation. Other agent hosts and operating systems need their own first-use trials.

Local development receipts report protocol, rendering, portability and independent agent checks. They include an actual-agent build/correction trial with simulated user inputs and a separate owner trial with a saved result acceptance. These receipts are retained in the author's local development workspace, not bundled with personal session state here. This document summarizes their scope; it is not a claim those checks ran on your machine.

The 0.9.2 acceptance-confirmation correction reports 15 focused checks and 25 interaction regressions. Other historical suites have overlapping coverage and should not be summed into a single quality score. Earlier shell checks included actual 200% Chrome zoom; that is not proof for every generated app.

The local 0.10.0 visual-direction receipt reports 98 final app browser checks, actual 200% Chrome zoom, package/contract regressions, and independent guidance/rendered review. That evaluation used synthetic answers; it does not establish human acceptance. Those browser suites were not rerun for this repository synchronization. The separate dating-site screenshots in [the example](EXAMPLE.md) are presentation evidence, not a replay of those tests.

The local 0.11.0 critique/refinement slice evaluated three isolated fictional projects (marketing, data and consumer), with targeted before/after changes, 139 final fixture checks, actual 200% Chrome zoom for all three and independent design/mechanical review. Synthetic browser feedback was consumed before agent-authored revisions; it is not human acceptance or controlled evidence of general skill effectiveness. Six incomplete fixture axe contrast instances were retained with scoped follow-up measurements. Saved review summaries were corrected for narrow overflow without changing interaction code. Package/source/archive checks are repeated for this synchronization; app suites are not repeated here.

Still unverified: screen-reader speech, physical touch devices, other browser engines, native app runtimes, representative-device performance, and real-service integrations. An earlier review-shell test did not establish complete keyboard-only feedback-target selection. Accessibility automation does not establish complete conformance. These limits should guide peer testing, not be silently marked passed.

Browser submissions require manual continuation in the agent conversation. Review previews are scriptless. The local server binds to loopback and trusts local OS users; it is not a shared hosted application.

## Report a finding

Open an issue using the peer feedback template. Include the intended task, what happened, expected behavior, and reproduction steps. Remove credentials, private app data, and personal session content from screenshots or logs before sharing. A fictional reproduction is preferred where practical.

## Repository checks

From the repository root:

```sh
python3 packages/ui-delivery/scripts/validate.py
node packages/ui-delivery/scripts/ui-delivery.mjs help
python3 scripts/check_distribution.py
```

These check package structure, CLI startup, hashes, archive contents, and relative documentation links. They do not replace the human trial or browser regression suites. Full historical test harnesses are not included in this initial peer package.
