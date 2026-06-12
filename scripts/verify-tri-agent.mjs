#!/usr/bin/env node
import { existsSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL: ${message}`);
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function mustExist(rel) {
  const abs = join(repo, rel);
  if (!existsSync(abs)) {
    fail(`missing required file: ${rel}`);
    return false;
  }
  ok(`present: ${rel}`);
  return true;
}

function readText(rel) {
  return readFileSync(join(repo, rel), "utf8");
}

function readJson(rel) {
  try {
    return JSON.parse(readText(rel));
  } catch (error) {
    fail(`invalid JSON: ${rel} (${error.message})`);
    return null;
  }
}

function checkIncludes(rel, needle) {
  const text = readText(rel);
  if (!text.includes(needle)) {
    fail(`${rel} does not mention ${needle}`);
    return;
  }
  ok(`${rel} mentions ${needle}`);
}

function validateProfile(rel, expectedRole, expectedPrefix) {
  const profile = readJson(rel);
  if (!profile) return;

  const validRoles = new Set(["PLN", "EXP", "BLD", "REV", "CHAIR", "SUPERVISOR"]);
  if (profile.role !== expectedRole) fail(`${rel} role expected ${expectedRole} but got ${profile.role}`);
  else ok(`${rel} role = ${expectedRole}`);

  if (!validRoles.has(profile.role)) fail(`${rel} role is outside schema enum`);
  if (typeof profile.named_agent !== "string" || !profile.named_agent.startsWith(expectedPrefix)) {
    fail(`${rel} named_agent must start with ${expectedPrefix}`);
  } else ok(`${rel} named_agent starts with ${expectedPrefix}`);

  if (!Array.isArray(profile.tools) || profile.tools.length === 0) fail(`${rel} tools must be a non-empty array`);
  else ok(`${rel} tools declared`);

  if (!profile.colony_prefix || !/^COL-[A-Z]+$/.test(profile.colony_prefix)) {
    fail(`${rel} colony_prefix must match COL-[A-Z]+`);
  } else ok(`${rel} colony_prefix shape valid`);

  if (!profile.limits || typeof profile.limits !== "object") fail(`${rel} limits missing`);
  else {
    if (!(profile.limits.max_concurrent >= 1)) fail(`${rel} max_concurrent must be >= 1`);
    if (!(profile.limits.max_tokens_per_request >= 1)) fail(`${rel} max_tokens_per_request must be >= 1`);
    if (!(profile.limits.wall_timeout_seconds >= 1)) fail(`${rel} wall_timeout_seconds must be >= 1`);
    else ok(`${rel} limits look sane`);
  }
}

function runNode(rel) {
  console.log(`RUN: node ${rel}`);
  const isolatedMistakesDir = join(repo, "tmp-ci-mistakes");
  const result = spawnSync(process.execPath, [rel], {
    cwd: repo,
    stdio: "inherit",
    env: { ...process.env, ASOLARIA_MISTAKES_DIR: isolatedMistakesDir },
  });
  try { rmSync(isolatedMistakesDir, { recursive: true, force: true }); } catch {}
  if (result.status !== 0) fail(`command failed: node ${rel}`);
  else ok(`command passed: node ${rel}`);
}

[
  "BROWN-HILBERT.md",
  "AGENTS.md",
  "CODEX.md",
  "CLAUDE.md",
  "ORACLE.md",
  "ROSE.md",
  "docs/github-tri-agent-workflow.md",
  ".github/pull_request_template.md",
  ".github/workflows/verify.yml",
  "agents/codex-53.profile.json",
  "agents/oracle-of-amy.profile.json",
  "agents/rose.profile.json",
  "tests/agent/smoke.test.js",
  "packages/multi-agent-enforcement-gate/src/index.mjs",
].forEach(mustExist);

checkIncludes("AGENTS.md", "ORACLE.md");
checkIncludes("AGENTS.md", "ROSE.md");
checkIncludes("BROWN-HILBERT.md", "ORACLE.md");
checkIncludes("BROWN-HILBERT.md", "ROSE.md");
checkIncludes("docs/github-tri-agent-workflow.md", "at least **2 canonical agents**");
checkIncludes(".github/pull_request_template.md", "Oracle");
checkIncludes(".github/pull_request_template.md", "Codex");
checkIncludes(".github/pull_request_template.md", "Rose");
checkIncludes("packages/multi-agent-enforcement-gate/src/index.mjs", "\"rose\"");
checkIncludes("packages/multi-agent-enforcement-gate/src/index.mjs", "\"oracle-of-amy\"");

validateProfile("agents/codex-53.profile.json", "BLD", "codex-53");
validateProfile("agents/oracle-of-amy.profile.json", "PLN", "oracle-of-amy");
validateProfile("agents/rose.profile.json", "REV", "rose");

runNode("tests/agent/smoke.test.js");

if (failures.length) {
  console.error(`\ntri-agent verification failed with ${failures.length} issue(s)`);
  process.exit(1);
}

console.log("\ntri-agent verification passed");
