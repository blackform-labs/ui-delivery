# Blackform UI Delivery

An experimental skill that helps a coding agent shape, build, review, and verify an app's interface with its user.

Skill identifier: `ui-delivery`. Package version: **0.9.2**. This repository is for invited peer testing. It contains the portable skill and distribution tools; personal project sessions and development-workspace evidence are excluded.

## Start a first project

You need a coding agent that can read local skill instructions and edit/run a local project. The browser onboarding tool requires **Node.js 22 or newer**. Python 3 is used for package validation and building the ZIP. These tools use standard libraries; there is no npm install step for the skill. Generated apps may have their own dependencies.

Clone this repository using your own GitHub account with access:

```sh
git clone https://github.com/blackform-labs/ui-delivery.git
cd ui-delivery
python3 packages/ui-delivery/scripts/validate.py
node packages/ui-delivery/scripts/ui-delivery.mjs help
```

For the first trial, use the skill directly by path. No global installation is required. Create a separate empty app directory and give your coding agent this prompt, replacing both placeholders with actual paths:

```text
Read and use the ui-delivery skill at <checkout>/packages/ui-delivery/SKILL.md.

Build my app inside <new-empty-app-directory>. Treat this as a new project.
I want a simple website to track my farts during the day. Make it easy and a little funny.

Use the skill's real local onboarding flow to resolve material questions.
Give me the verified onboarding URL and wait for my actual submissions before
dependent implementation. Use a fresh project/session; do not reuse another person's answers.
Then build a working local app from those answers and return it for review.
Keep the skill checkout unchanged. Do not deploy or publish the app.
```

You can replace the app idea with your own. The agent should ask only questions that affect the work. Tiny or fully specified tasks can skip redundant interviews. You can request chat instead of browser onboarding or explicitly delegate a design decision.

## How collaboration works

1. The agent prepares the project context and starts a local onboarding page.
2. Submit each answer in the page. Typing a draft or seeing a recommendation does not submit an answer.
3. Return to the coding-agent conversation and ask it to continue the named session. **Submitting browser answers does not launch or wake a coding agent.**
4. The agent reads the saved handoff, builds the app, and supplies a runnable app URL plus a review result. The embedded review preview is scriptless; use the separate app URL to test behavior.
5. Submit feedback against the result and return to chat to request the correction. The agent reads fresh feedback and registers the revised result.
6. Accepting a result applies to that result. It does not accept the framework or publish the app.

Saved submissions survive server restarts. Unsaved drafts are lost on reload or page closure. “I'm unsure” leaves a decision pending; explicit delegation lets the agent choose and explain. Agent progress shown in the page reflects recorded work updates, not a background agent service.

The agent must report the exact project, session, URL, and start/stop/resume commands for your trial. Commands and payloads are documented in [interactive.md](packages/ui-delivery/references/interactive.md), and `help` prints the CLI interface. Keep session files in your app's local working area, not in this repository.

## What is covered

- Task hierarchy, product identity, existing components and visual systems.
- Forms, saving, recovery, navigation, and context restoration.
- Metrics, tables, charts, truthful data states, and optional motion.
- Product copy, browser accessibility checks, and scoped verification.
- Browser and GSAP guidance; native candidates are documentation-only.

See [testing notes](docs/TESTING.md) for evidence boundaries and the peer trial. Reports of success should name the environment and task; package validation checks integrity, not design quality or accessibility conformance.

## Distribution and changes

The versioned ZIP and SHA-256 manifest are in [dist](dist/). To rebuild locally:

```sh
python3 scripts/build.py
python3 scripts/check_distribution.py
```

The ZIP contains only `ui-delivery/`. All 26 package files are unchanged from the local 0.9.2 delivery. Repository documentation and the distribution check are separate additions.

No open-source license has been selected or included in this peer-test package. A private testing repository is not an announcement of an open-source release. Source attribution and retrieval limits are preserved in [the source registry](packages/ui-delivery/references/sources.json).

No global installation is performed by these steps. To stop testing, stop your local servers with the reported commands. Retain your app and session data if you want to resume later; removing this checkout does not remove a separately created app.
