# Keep your skill current

The README installs a copy of `ui-delivery`. A GitHub push changes the source, not the files already installed on your computer. There is no installed updater, scheduler or remote management service. The unpublished Blackform installer draft is not part of this repository delivery.

## Update an existing installation

Read [version notes](CHANGELOG.md), finish active work, and back up any changes you made to your installed skill before updating. Keep application files and saved project sessions in place.

For a tracked account installation:

```sh
npx skills@1.7.2 update ui-delivery --global
```

For a tracked project installation, run from that app's project directory:

```sh
npx skills@1.7.2 update ui-delivery --project
```

These are write operations. The skill name and scope limit which installation records the [skills CLI](https://github.com/vercel-labs/skills) updates; the dependency performs its own installation. The pinned 1.7.2 implementation supports these arguments and authenticated private-repository checking. It does not supply our proposed local-edit guard or run ownership, and this delivery does not run updates on a peer's machine. If tracking/source information is missing or inaccessible, resolve the reported problem; do not treat a zero exit without a changed version as an update.

For a copy obtained manually, retain a backup and use the original installation instructions to replace that selected copy. For a checkout used directly by path, review local changes before pulling the repository. Your GitHub account still needs access to this private repository.

Check `metadata.version` near the top of the installed `ui-delivery/SKILL.md`; it should be 0.11.0 for this delivery. [Official OpenAI guidance](https://learn.chatgpt.com/docs/build-skills) says to restart Codex if an updated skill does not appear. Use a fresh conversation for the separate peer trial.

## Updates without the author messaging each peer

Notification and installation are separate steps. One practical route is to publish a GitHub Release for each reviewed package version and have peers opt into Watch → Custom → Releases once. GitHub then sends notifications according to their settings. A code push is not a Release, and this push does not configure anyone's watch settings. See [GitHub notification settings](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications).

Fully automatic installation needs a one-time opt-in setup on each peer's computer. A future updater could check the private repository's manifest at startup or on a schedule, then update only ui-delivery when there is a reviewed newer version and no active run. It should compare the installed bytes with the last installed manifest, preserve local edits, download and validate a complete replacement, retain a backup, switch it atomically, verify the version and offer rollback. Authentication uses the peer's own repository access; the author cannot refresh unconfigured peer machines remotely.

That updater is a proposal, not an implemented capability. Notification-only checks could precede automatic replacement. The current manual update commands remain available without it. Plugin packaging is another distribution route to evaluate; official OpenAI documentation still requires a new package upload for bundled skill changes, so a GitHub push alone is not a plugin update.
