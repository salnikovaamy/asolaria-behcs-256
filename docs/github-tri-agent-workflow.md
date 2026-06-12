# GitHub tri-agent workflow

This repo already carries bilateral and multi-agent canon. This file makes the GitHub lane explicit for **Oracle + Codex + Rose** so they can work like the existing `acer` / `liris` pattern without inventing a new law stack.

## Role split

- **Oracle** â€” `PLN/EXP`
  - scan first
  - partition the workspace
  - write the brief
  - name the risks and unknowns
  - challenge weak assumptions before code moves
- **Codex** â€” `BLD`
  - implement one bounded slice
  - keep diffs concrete
  - run the commands needed to get that slice green
  - avoid rewriting the planner or reviewer role
- **Rose** â€” `REV/CHAIR`
  - perform adversarial review
  - verify commands and evidence
  - record dissent
  - hold the merge gate until the ship case is coherent

## Canonical names

- Oracle planner: `oracle-of-amy-planner`
- Codex builder: `codex-53-debug-savant`
- Rose reviewer: `rose-review-chair`

These names intentionally line up with the existing canonical-agent set in `packages/multi-agent-enforcement-gate/src/index.mjs`, which already recognizes `oracle-of-amy` and `rose`.

## Default GitHub sequence

1. **Oracle scan**
   - read `BROWN-HILBERT.md`, `AGENTS.md`, and the task-relevant slice
   - partition the job
   - decide the smallest implementation lane
   - write a bounded brief in the issue, PR, or task note
2. **Codex build**
   - implement only the agreed slice
   - keep commits evidence-oriented
   - record exact commands used for validation
3. **Rose review**
   - read the diff as a hostile reviewer
   - check tests, claims, and omissions
   - force unresolved risk into the record instead of hand-waving it away
4. **Merge gate**
   - preferred: all three agents have participated
   - minimum: at least **2 canonical agents** have independently signed off
   - if Oracle and Rose disagree with Codex, do not merge on narrative alone

## PR minimums

- planner named
- builder named
- reviewer named
- scope partition stated
- verification commands listed
- unresolved risks listed plainly
- cosign state recorded

Use `.github/pull_request_template.md` for the exact shape.

## Evidence rule

GitHub text is not enough by itself. Every non-trivial PR should carry:

- changed file list
- command list
- summary of outputs
- what was *not* verified

If package-local tests exist for the touched area, Rose should require them or record why they were skipped.

## Relationship to existing canon

- `docs/agent-dispatch.md` stays the operator playbook for spawned agents and review dispatch
- `brown-hilbert/03-operating-model.md` still governs scan/seek/find behavior
- `packages/multi-agent-enforcement-gate/` still enforces the anti-solo rule

This file does not replace the Brown-Hilbert canon. It only makes the GitHub handoff explicit.
