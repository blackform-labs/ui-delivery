# Blackform UI Delivery

An experimental skill that helps a coding agent shape, build, review, and verify an app's interface with its user.

Skill identifier: `ui-delivery`. Package version: **0.11.0**. This repository is for invited peer testing. It contains the portable skill and distribution tools; personal project sessions and development-workspace evidence are excluded.

## Example: hello, you

A dating-site demo from a separate user trial, with an “Interactive dating demo” scope and a “Warm and playful” direction saved in the onboarder. Profiles are fictional adults, portraits are illustrative, and matches are simulated.

![hello, you dating demo with a lavender hero, interest filters and profile cards](docs/screenshots/hello-you-discover.jpg)

See [the onboarding and review screenshot](docs/EXAMPLE.md) for the saved choices and result. These captures show the local example; they are not a hosted demo or a claim of production readiness.

## Start a first project

You need a coding agent that can read local skill instructions and edit/run a local project. The browser onboarding tool requires **Node.js 22 or newer**. Python 3 is used for package validation and building the ZIP. The skill tools use standard libraries. The optional npm installer below requires Node.js 22.20.0 or newer. Generated apps may have their own dependencies.

### Install for your Codex account

Use your own GitHub account with access to this private repository. If needed, run `gh auth login` first. Install with the [skills CLI](https://github.com/vercel-labs/skills):

```sh
npx --yes skills@1.7.2 add https://github.com/blackform-labs/ui-delivery/tree/main/packages/ui-delivery --skill ui-delivery --agent codex --global --copy
```

Review the installer prompts. `--global` means your user account, across projects; it does not install for other users of your computer. The CLI installs Codex skills under `~/.agents/skills`. The version above pins the installer; the skill comes from this repository's current `main` branch. Repository access is still required. No separate Blackform npm package is needed.

On your next Codex turn, invoke `$ui-delivery`. If it does not appear, restart Codex. In a separate app project, try:

```text
Use $ui-delivery to build a simple website to track my farts during the day.
Treat this as a new project. Start the real local onboarder, give me its verified
URL, and wait for my submissions before dependent implementation. Keep the app
local and return a working preview for review.
```

The installation copies the skill; it does not start onboarding or a background agent. A new-app request invokes that workflow. Keep project/session files in your app directory. Installation does not update automatically: review newer versions before reinstalling, and back up any edits made to the installed copy. To uninstall, ask your agent to remove only the installed `ui-delivery` folder; keep app and session data if you want to resume later.

For a project-only install, run the command from that project and omit `--global`. Other agents have their own `--agent` values; only Codex installation has been checked here.

### Use by path without installing

Clone this repository using your own GitHub account with access:

```sh
git clone https://github.com/blackform-labs/ui-delivery.git
cd ui-delivery
python3 packages/ui-delivery/scripts/validate.py
node packages/ui-delivery/scripts/ui-delivery.mjs help
```

Alternatively, use the skill directly by path without account-wide installation. Create a separate empty app directory and give your coding agent this prompt, replacing both placeholders with actual paths:

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

## Your first onboarding session

Open a separate project folder and start a conversation with your coding agent using the prompt above. Describe what you want to build, who will use it, and anything you already know about the design. You can include screenshots, reference sites, or existing brand assets. You do not need to know the framework or choose a component library first.

For a new app, the agent starts a local onboarding page and gives you its URL. That page belongs to your project and session. Keep the agent conversation open alongside it: you will move between the browser and chat as the work progresses.

### Answer the questions that affect your app

The page shows the project context and any open questions. The agent should reuse information you have already provided and ask only about choices that affect the work. In the dating-site example, the user chose an interactive demo and a warm, playful feel. Your project may need different questions.

You can select an option, write your own answer, say you are unsure, or explicitly let the agent decide. If the visual direction is still open, the agent can show alternatives with comparable content and explain their tradeoffs. If you already have a design or a clear preference, it should use that direction without making you choose again.

Press Submit or Save to record each answer. A highlighted recommendation, a typed draft, or an unanswered question does not count as a decision. “I'm unsure” keeps that question open; delegation tells the agent it may choose and explain why.

### Return to chat to start the build

After submitting, return to the same agent conversation and ask it to continue with your saved answers. If you have several sessions, name the one you mean. The agent reads the current submissions before doing work that depends on them.

The browser does not start or notify a coding agent. “Waiting for the agent” means your answers are saved and you need to continue the conversation. Progress messages appear when the agent records a work update. If the page says “No recent agent update,” check the conversation; that message does not mean the build has finished.

### Try the app, then give feedback

The agent returns a working app URL and registers a result on the review page. The review page checks for updates and offers View new result when another result is available. Its embedded preview shows the design in a scriptless sandbox. Open the separate app URL to try buttons, navigation, forms, and other behavior.

When something needs changing, choose the relevant screen, option, or result in the feedback form. Describe what happened and what you want instead, then press Send feedback. For example, explain which text is hard to read or where you expected an action to take you. Return to chat and ask the agent to apply that feedback. It should retain your earlier decisions, make the requested correction, and return a new result for review.

![Onboarding page with saved answers, the dating-site result and feedback controls](docs/screenshots/onboarding-review.jpg)

The screenshot shows a result ready for review with acceptance still pending. Choosing a visual direction and sending feedback are separate from accepting the finished result.

### Accept a result when you are satisfied

Use Accept this result after reviewing the current work. The page shows the saved decision and timestamp. If you reject it, add specific feedback so the agent knows what to change. Revised answers, new feedback, or a new result require another review; an earlier acceptance does not carry forward.

Acceptance applies to that result. It does not publish the app, deploy anything, or accept the whole ui-delivery framework.

### Leave and resume without starting over

Submitted answers, feedback, and results survive a server restart. Unsaved drafts stay on the current page while you submit other answers or pause and resume, but reloading or closing the page discards those drafts. Save anything you want to keep before leaving.

Ask the agent to resume the same project and session. It should provide the exact startup and resume commands for your trial and reuse the saved context. If you paused the session, use Resume session before continuing. Closing the page, stopping its server, or leaving a question unanswered supplies no decision or approval.

Keep session files in your app's local working area. The agent should report the project, session, URLs, and start/stop/resume commands so another conversation can pick up the work. The CLI details are in [interactive.md](packages/ui-delivery/references/interactive.md), and `help` prints its interface.

### When browser onboarding is unnecessary

You can ask to answer in chat or explicitly delegate design decisions. Tiny edits and fully specified tasks can proceed directly to implementation and review. The agent should explain a concrete limitation if it cannot run the local browser tool, and use your actual chat answers to continue within the agreed scope.

## What is covered

- Task hierarchy, product identity, new-app visual direction, existing components and visual systems.
- Contextual design critique and ordinary-language feedback: calmness, density, action clarity, phone use and style changes.
- Forms, saving, recovery, navigation, and context restoration.
- Metrics, tables, charts, truthful data states, and optional motion.
- Product copy, browser accessibility checks, and scoped verification.
- Browser and GSAP guidance; native candidates are documentation-only.

See [testing notes](docs/TESTING.md) for evidence boundaries and the peer trial. Reports of success should name the environment and task; package validation checks integrity, not design quality or accessibility conformance.

## Distribution and changes

See [version notes](docs/CHANGELOG.md), [peer updates](docs/UPDATES.md), and the [roadmap](docs/ROADMAP.md). Pushing this repository does not replace an already installed skill.

The versioned ZIP and SHA-256 manifest are in [dist](dist/). To rebuild locally:

```sh
python3 scripts/build.py
python3 scripts/check_distribution.py
```

The ZIP contains only `ui-delivery/`. All 28 package files match the local 0.11.0 delivery. Previous versioned archives are retained; `dist/manifest.json` identifies the current distribution. Repository documentation and the distribution check are separate additions.

No open-source license has been selected or included in this peer-test package. A private testing repository is not an announcement of an open-source release. Source attribution and retrieval limits are preserved in [the source registry](packages/ui-delivery/references/sources.json).

The account installation above persists until removed. To stop testing, stop your local servers with the reported commands. Retain your app and session data if you want to resume later; removing this checkout does not remove a separately created app.
