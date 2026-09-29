# calibar

Keyboard-first desktop command bar for macOS and Windows. Press a hotkey, type a sentence, and the bar turns into the right card or action while you type. TypeSafe's Jev model picks the meaning; deterministic Rust code extracts values, computes results and runs actions; a risk tier (T0–T3) decides whether Enter runs, asks first, or refuses. Thesis: **AI decides meaning. Code owns facts. Risk determines autonomy.** Stack: Tauri 2 + Rust core, React 19 UI, Python eval harness.

**Now:** M0 Foundations (v0.1). Nothing is built yet. Work from step 1 of "Suggested path to the M2 stopping point" in the backlog. *(Update this line when a milestone starts.)*

## Docs: read the section, not the whole file

The spec and backlog are **local-only on purpose**: git-ignored, never committed or pushed. If they're missing (fresh clone, worktree), ask the user for them instead of guessing.

| Need | Go to |
|---|---|
| Next task, its **Do** and **Done when**; the M2 path | [calibar-v1-tasks.md](calibar-v1-tasks.md) |
| Goals, non-goals, prohibited actions P1–P7 | [calibar-v1-spec.md](calibar-v1-spec.md) §2 |
| Verified facts F1–F21, facts to verify V2–V15 | spec §3.2, §3.3 |
| Trust boundary, where Tauri stops | spec §5.2 |
| Tickets, `select` and pinning, T3 timing | spec §5.2.1 |
| Crates and modules; repo layout | spec §5.3; §5.14 |
| Manifest, IPC surface (19 commands), Executor and provider traits | spec §5.4 |
| Registry invariants I1–I11 | spec §5.5 |
| Classification pipeline, pre-check, offline scoring, question set | spec §5.6 |
| Decision engine D1–D4 | spec §5.7 |
| Tiers, egress classes, gate rule, provenance, previous-app target | spec §5.8 |
| Providers, cache, LLM handoff | spec §5.9 |
| Security rules and threat model | spec §5.10 |
| Dependency policy and chosen libraries | spec §5.16 |
| Commands: tier, egress, release | spec §6 |
| Datasets, metrics, safety invariants S1–S6, eval bridge | spec §9 |
| Milestones and exit criteria; cut order | spec §10 |
| Open questions OQ1–OQ9; ADR index | spec §12; App. A |
| Contracts: traits, fakes, views, item cards, run files, manifest fields, eval environments | spec App. F |
| Why a rule exists (review history R1–R60) | spec App. D |

**When docs conflict:** the spec wins over the backlog. Fix both in the same change and add a change-log line to the spec.

## Six rules (every task)

1. **The core decides; the UI renders.** Every decision, argument, computed value and piece of evidence lives in the Rust core. The UI holds only ticket IDs and runs actions only through `execute(ticket)`, which takes no arguments (A3, §5.2.1).
2. **Jev picks; code computes.** The model chooses among options. Parsers and code-generated candidate lists supply every argument. Never ask Jev to extract values, do math, compare dates, count or judge hex colors (A1, A2, F4).
3. **Code against contracts, not other tasks.** Each contract in App. F has one fake and one contract-test suite that the fake and every real implementation run. If a dependency isn't built, fake it in a `testing/` module. Changing a contract means a spec change-log entry and an updated fake in the same PR.
4. **Tauri lives only in `calibar-app`** (I11). Plugin-backed implementations (notifications, dialogs, autostart, hotkey, single instance, tray, updater) live there too. `calibar-platform` is native-only. The core reaches the app only through `AppControl` and `ViewSink`.
5. **Every network request leaves through `calibar-egress`** (I9). The one exception is the updater. No HTTP client crate or `std::net` socket anywhere else; cargo-deny and clippy enforce this.
6. **No command-specific branches in core code** (A5, G5). A new command is a manifest, a parser and an executor. Precedence is `suppresses` data. Thresholds are eval output, never hand-tuned numbers (A6, D2).

## Silent-failure traps

- **Offline softmax.** Unmatched *and* suppressed commands are removed from the softmax. A score of 0 still gets e⁰ of the probability mass and quietly shrinks p1 and margin (§5.6).
- **Frontmost app.** While the bar is open, calibar is the frontmost app. Window and paste actions must act on the `Target` captured when the hotkey fired (§5.8.6).
- **The T3 dialog steals focus.** Don't treat that as the bar closing, because closing the bar expires every ticket. Expiry is frozen while the dialog is open, and gate rules 2 and 3 run again after confirmation (§5.2.1).
- **Cache keys.**
  - The provider cache is keyed by the exact request hash, which includes the candidate options. Never key it on (schema hash, text).
  - The eval harness caches raw provider responses only and recomputes decisions on every run (§5.9, §9.4).
- **Two hashes.** The schema hash covers the static Jev question set only, not per-input candidates. Offline rules, categories and parser versions have their own offline hash (CON-37). Changing a weight without retuning falls back to the default thresholds.
- **Question set.** It is fixed per release. Commands hidden on a machine stay in the set (D4), otherwise the hash differs per machine. Follow-up commands (`files.open`, `files.reveal`) are never in the set and never get golden rows.
- **EG0 means content never leaves.** It does not mean the typed text stays local. Typed text stays local only when the secret guard fires or the command is `sensitive_input` (§5.6, I7).
- **Provenance.** Content (clipboard text, file names, LLM output) never selects a T2/T3 command or fills one of its arguments unless the user picks it (§5.8.3).
- **`Instant` never crosses IPC or serde.** Wire timestamps are epoch milliseconds (UTC).
- **No frontend event listening.** It needs `core:event` permissions (F19), which I8 forbids. Views go down the `decide` channel (F20; V14 still open).
- **Release-aware scoring.** Dataset rows keep the true intent. Mapping to a release happens at scoring time (§9.2), so never relabel rows for a release.
- **Golden data.** Rows never copy manifest `examples`. The test split is frozen and is never used to write criteria or tune thresholds.
- **macOS permission grants.** Ad-hoc-signed rebuilds may lose Accessibility and Automation grants (V15). Sign dev builds with the stable identity (DIST-00) before debugging a "permission denied".

## Security, privacy, secrets

- No telemetry. Label logging is opt-in and exported by hand.
- Provider keys live in the OS keychain through `calibar-secrets`. They are write-only from the UI, never logged and never cross into the webview. No keys in the repo or in `.env` files that get committed.
- **Webview.**
  - The CSP allows only IPC and bundled assets.
  - The capability grants only the §5.4 IPC commands (I8): no shell, filesystem, opener, HTTP, window, event or updater permissions.
- Clipboard text, file names and LLM drafts are rendered as text, never as HTML.
- `files.open` opens only core-generated result paths and refuses executables and scripts. `web.*` accepts only `http` and `https`.
- The denylist P1–P7 is enforced in the core, not by leaving features out.
- Receipts that hold clipboard content stay in memory and never reach disk.
- Never describe online mode as zero-retention (F12).
- Online provider calls never run in PR CI; the nightly job uses a CI secret. Eval runs pace under the documented limits (F11).
- The updater signing key lives in a password manager and a CI secret. Losing it strands every install (F16).

## Commands

Planned. Each line becomes true when its REPO task lands. Keep this block in sync with CI.

```bash
cargo build && cargo test                   # Rust workspace, root apps/desktop/src-tauri (REPO-02)
cargo clippy --all-targets -- -D warnings   # REPO-05
cargo deny --workspace check                # licenses, advisories, HTTP and Tauri bans (REPO-08, REPO-12)
bun install && bun test                     # UI and packages (REPO-06)
bun run check                               # typecheck, lint, manifest and invariant checks
bun tauri dev                               # run the app (REPO-03)
uv sync --locked                            # eval harness, tools/eval (REPO-04)
uv run calibar-eval run --changed               # required eval diff when criteria or questions change
```

## Workflow

- Branch from `main` and open a PR. Commit only when the user asks. Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`), with the task ID in the body (`REPO-02`).
- **Task IDs are permanent.** Never renumber or reuse one; retire it with a note. Tick the backlog checkbox only after its **Done when** passes.
- **A PR needs:**
  - a one-line justification for any new runtime dependency (§5.16, license allowlist);
  - an eval diff when criteria, questions or the model change (I6, §9.6);
  - a spec change-log entry when a contract changes.
- Decisions are ADRs in `docs/adr/` (App. A). A fact backed only by a Tier 3 or 4 source is tagged [VERIFY] and can't gate a milestone.
- **If behind,** cut commands first, then providers, then platforms. Never cut the eval harness, calibration, risk–coverage analysis, adversarial tests or safety invariants (§10).
- Shapeshift ports start from pinned commit `5e24166` (F21, REPO-13). Keep its MIT notice.

## Name

The project is **calibar** ("Calibrated command bar") everywhere: repo, product, UI. Crates are `calibar-*`, the Tauri crate is `calibar-app`, the Python package is `calibar_eval` and the CLI is `calibar-eval`. Never use "Cue" or `cue-*`.

## Keeping this file useful

Stay under 200 lines. Add a trap only after it has bitten or the spec names it. Link to sections instead of copying them. Update the **Now** line at each milestone. When a directory builds up its own traps (for example `calibar-decide/` or `tools/eval/`), give it its own `CLAUDE.md`.
