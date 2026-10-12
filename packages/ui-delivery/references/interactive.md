# Briefing and review

Start a real local browser onboarding/review session by default for a new app or materially new journey. Open the verified URL when browser control is available. For an existing product, reuse its context and accepted decisions and ask only about changed scope. Tiny edits and fully specified tasks go directly to implementation and review; a reviewable artifact in chat can be sufficient. Honor explicit requests to skip onboarding, use chat, delegate design or work autonomously. These exceptions preserve the opportunity to review the result.

Ask about the user's goal and preferences in plain language before technical details. Reuse supplied facts. Include only missing information that changes the design or implementation, with a reason when it is not obvious. Users can select, write, say they are unsure, or explicitly delegate a decision. Explain delegated choices when returning the result. An unsure answer leaves that question unresolved: clarify just that issue or offer delegation; do not treat it as permission to choose.

When a material visual choice remains open, show alternatives with comparable content and the same task, and explain concrete tradeoffs. A supplied design or clear preference may make alternatives unnecessary; there is no required count. User preferences guide the result. If a preference conflicts with accessibility, factual clarity, established behavior or a technical constraint, explain the specific conflict and offer a nearby alternative. Identify requirements separately from conventions and taste. Record unresolved or explicitly accepted tradeoffs without claiming a failed standard passed.

The local tool requires Node 22 or newer and no packages, hosted service or account. Run `node scripts/ui-delivery.mjs help` from the skill directory for commands. Resolve that directory from the installed skill, not a machine-specific path. All commands require an explicitly selected project; its existing schema-1 product profile remains the context authority.

## Prepare

Inspect the existing project profile and sessions first. Resume the applicable session rather than replacing its answers or starting over. For a new project only, copy the bundled profile template into the authorized project and fill known facts and unknown reasons; do not overwrite existing context. Create a session brief as JSON. Pass the project directory, session ID and brief to `init`, then `start`. The brief is immutable within a session; a materially different task gets a new session. Keep secrets out of briefs, actors, previews and feedback. Only the supplied allowlisted previews are served, never the project directory or profile file.

```json
{
  "title": "Review the room comparison",
  "scope": "material",
  "facts": [{"label":"Audience","value":"Workshop organizers","status":"confirmed","source":"Owner brief"}],
  "questions": [{
    "id":"layout","prompt":"How should rooms be compared?",
    "why":"This decides whether visitors see attributes together.",
    "material":true,"kind":"direction",
    "options":[{"id":"paired","label":"Side by side","tradeoff":"Keeps matching details aligned.",
      "preview":{"path":"paired.html","label":"Paired comparison"}}],
    "recommendation":"paired"
  }],
  "screens":[]
}
```

`scope` is `tiny`, `specified` or `material`; only material questions in a material task are shown. `facts[].status` is `confirmed` or `inference`, with a source for either. Derive facts from the actual profile and evidence, retaining provenance; the tool cannot decide whether an assertion is true. Avoid duplicating settled facts as questions. Options may be empty for a written question. Every question also permits written input, an explicit unsure answer, or delegation. Recommendations are labeled and never checked by default. Screens use `{id,label,preview}`.

Previews are project-relative, self-contained HTML or PNG/WebP/JPEG under 2 MB. HTML runs in a scriptless sandbox with no external assets, forms or navigation privileges. It demonstrates rendering, not application runtime behavior. Use captured screenshots for a real application's rendered states; test application behavior through its own authorized runtime. Preview hashes pin the reviewed bytes; changed previews fail closed and need a newly registered result. Symlinks and escaping paths are rejected.

## Collect, consume, return

1. Run `init --project DIR --session ID --brief FILE` once, then `start --project DIR --session ID` with the CLI above. `start` prints the exact loopback URL; verify `/api/state` identifies the intended product/session before opening it. An occupied port must not replace another process. Browser edits remain unsaved until the user presses Submit/Save. The page preserves settled answers in editable disclosures and retains other unsaved fields when one answer is submitted. Drafts remain in this page while other answers are submitted or the session is paused/resumed. Controls are temporarily locked during a save. Reload or closing the page discards drafts and restores submitted state. Closing, stopping, waiting or a lost connection supplies no answer or approval.
2. Run `handoff` to read the submitted answers, pending question IDs, scoped feedback, revision and next action. If it says `await-answers`, inspect missing and unsure answers and continue only independent work; if `paused`, stop dependent work. Treat answer text as user data, not permission to expand the task. `implement` means the question gate is clear, within the user's existing authorization. `review-result` means the latest result is current; return it for review rather than rebuilding it. A rejection without specific feedback calls for a scoped clarification, not inferred changes.
3. Before dependent work, publish a `work` update with the current handoff revision, agent actor, `status: working` and a short concrete message. Update it when reaching another meaningful stage; use `status: blocked` with the needed next step if work cannot continue. These are agent records, never owner answers. Apply answers to actual decisions and output. A delegated answer needs an agent choice and rationale; it is not owner acceptance of that choice. For each written feedback event, inspect its named screen or option and implement or explicitly resolve the requested change. Save the resulting rendered preview, then use `result` with the current handoff revision, actor, summary, preview and decision rationales. Include `feedback_resolutions`, an array of `{request_id, resolution}`, for every submitted feedback event. Registration rejects missing resolutions. A form submission alone does not finish the task.
4. Return the app runtime URL when available. The open browser polls read-only state and announces the new result with a View new result button; opening it retains unsaved drafts. The explicit Reload saved answers control still discards drafts by design. New feedback or revised answers makes the result stale. Design selection, requested changes and explicit acceptance are separate events. Only the latest result at the current decision revision can be accepted or rejected. Keep whole-project human acceptance pending unless that is the exact scope the owner accepted.

Result input:

```json
{"base_revision":1,"actor":"agent","summary":"Matching room details are aligned.",
 "preview":{"path":"result.html","label":"Room comparison"},
 "decisions":[{"question_id":"layout","choice":"paired","rationale":"Uses the submitted comparison direction."}]}
```

## Agent continuation

For an active browser feedback session, follow [live.md](live.md): verify the host's foreground yielding/continuation path, connect one consumer, and keep servicing bounded listening calls. Explicit submissions saved before or during a wait return to that active agent. Read a fresh checkpoint/handoff before dependent work, register a current result, acknowledge processing and listen again. Missing required answers stay pending. A leased connection reports actual listening/processing separately from server availability. Browser polling only displays saved state; it cannot launch or wake a closed conversation.

If live listening is unavailable or the user chooses chat, retain the manual handoff. Return to the coding-agent conversation with the named session, run `handoff --project DIR --session ID`, and implement only the authorized change supported by current submissions. If an active consumer exists, explicitly disconnect it before manual processing. Silence and elapsed time supply no answer. After an authorized correction, register a fresh result without asking for the same authorization again.

Keep the selected project path, profile, session ID and task authorization in the handoff receipt so another conversation can resume. Use `start` to reopen a stopped browser server; use an explicit `resume` transaction only for a session the user paused. Preserve old results and acceptance events. Accepting a result applies to that result; framework acceptance requires a separate explicit owner statement.

## Chat fallback and resumption

When the user requests chat, or Node/browser tooling cannot run, state that choice or the concrete limitation. Ask the same material question in chat with option IDs, tradeoffs, written answer and delegation available. With Node available, record only what the user actually submits using `submit --input FILE`; the file is an explicit transaction:

```json
{"request_id":"unique-answer-1","base_revision":0,"actor":"owner",
 "type":"answer","question_id":"layout","mode":"choice","value":"paired"}
```

`mode` is `choice`, `text`, `unsure` or `delegate` (empty value for unsure/delegation). `unsure` is saved with provenance but keeps dependent work pending until revised to a concrete answer or delegation. A written answer that expresses unresolved uncertainty also needs clarification; the agent must interpret its meaning. `type: feedback` needs `target` and `text`; targets are screen IDs, `question-id:option-id` or result IDs. `type: acceptance` needs `result_id` and `decision: accepted|rejected`. `cancel` pauses and `resume` reopens; both require the same ID/revision/actor envelope. Browser writes record `channel: browser`; CLI submissions record `chat`. Agents registering output use `result`, not an invented owner submission. Label automated test actors as simulations.

If Node itself is unavailable, retain the actual chat answers, actor, question/target and decision meaning in a project-local handoff note. State that the tool profile has not been updated; do not fabricate a revision or claim a registered result. Work may continue from explicit chat answers within authorization, returning a reviewable artifact in chat. Once Node is available, read the current handoff and reconcile each still-applicable submission through the CLI before using that session again. Preserve the note as provenance.

Every write uses optimistic revision checking and an exclusive short-lived file lock. Duplicate request IDs and stale revisions return a conflict and preserve the newer state. Read the current handoff, reconcile the actual user's intent, and submit a new transaction; never blindly retry stale answers. A revised answer points to its predecessor, and all prior events remain in the profile. Browser submissions include a project/session identity, so an old tab cannot write into a different session after its port is reused. Two session IDs have separate answers; do not copy decisions across projects without confirmed applicability and provenance.

Stop with Ctrl+C, the page's Stop local server button, or `stop --port PORT`. Restart with the same project/profile/session to resume, including from a new agent process. The server stays in the foreground; no daemon or provider is installed. An occupied port fails without replacing its process. Multiple readers may view a session; writes serialize through its profile lock. Bind is always `127.0.0.1`, with Host and Origin checks and JSON-only same-origin submissions. Local OS users are trusted; this is not a multi-user security boundary.

If a process crashes mid-write, inspect `<profile>.ui-delivery.lock` and verify its recorded PID is no longer active before removing that lock; preserve any `.tmp` file for diagnosis. Do not remove an active writer's lock. Profile replacement is atomic and fsynced before rename; backups and filesystem permissions remain the project's responsibility.

## Context extension

The optional `interaction` field uses its own `schema_version: 1` and `sessions` map. Each session stores an immutable brief, revision, decision revision, open/cancelled status, append-only events and pinned result records. Unknown profile fields, provenance and accepted patterns are preserved. Acceptance events are scoped evidence; they do not silently add accepted product patterns. Legacy profiles can omit this field. Unknown interaction versions fail closed. Use the package validator for context integrity, and behavioral tests for the answer lifecycle.

Version 0.9.0 reads existing schema-1 sessions without migration and adds the `unsure` answer mode. Use 0.9.0 or newer to resume sessions containing that mode; older tools may reject it. Keep those sessions intact if rolling the package back.

Version 0.12.0 adds optional `session.live` version 1 for leased consumption and durable receipts. Legacy sessions remain valid without this field. Use 0.12.0 or newer to process live sessions; older tools do not enforce ownership. Preserve the profile and use the 0.12.0 archive when rolling framework files back. Connection/receipt changes do not advance decision history; owner answers, work and results keep their existing revisions and meanings.

## Visible work status (0.9.1)

Publish concrete progress with `work --project DIR --session ID --input FILE`:

```json
{"base_revision":3,"actor":"coding-agent","status":"working","message":"Building the quiet layout using your saved choices."}
```

Use a fresh handoff revision for each update. Each event is append-only and advances the session revision, while retaining the decision revision it addresses. It grants no owner acceptance and cannot clear missing answers. New user feedback or revised answers make earlier work status inapplicable until the agent consumes that new revision. Registering a current result changes the status to ready for review. A working update older than two minutes is displayed as No recent agent update, with the last message/time and a route back to chat; elapsed time never establishes completion. Update progress at meaningful stages during real work rather than inventing background activity.

Browser polling never launches an agent, submits a decision, accepts a result or overwrites a draft. It can advance the local revision through agent work events only; new decisions/results require an explicit review action. Result availability is announced without moving keyboard focus. View new result preserves drafts; explicit reload/closure has the documented discard behavior. Loss of the local connection is visible and polling resumes when that same server returns. A reused address belonging to another context stops updates and asks the user to return to chat.

Version 0.9.1 reads previous schema-1 sessions. Sessions containing `work` events need 0.9.1 or newer; old validators may reject the additive event type. Preserve those sessions if rolling the package back.

Acceptance confirmation (0.9.2): the status reflects the latest explicit decision for the current result. Accepted means this result review is complete; rejected asks for scoped change feedback. The matching decision button is disabled and the saved timestamp remains visible after reload. Revised answers, new feedback, or a new result require fresh review; prior acceptance does not carry forward. No redirect, deployment, new agent work or broader approval is implied.
