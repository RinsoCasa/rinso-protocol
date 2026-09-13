// Structural gate check on the static markup: confirms the gates are
// anchored to data- attributes (not hardcoded classes) and that nothing
// with an unstated/unverified record ships a live href or an enabled
// copy control at build time.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.join(dir, "..", "index.html"), "utf8");

test("contract gate element exists and is anchored via data-gate", () => {
  assert.match(html, /data-gate="contract"/);
  assert.match(html, /data-gate-status="absent"/);
});

test("contract copy button ships disabled in markup (JS only ever enables it from a stated+valid record)", () => {
  const btnMatch = html.match(/<button class="ca-value"[^>]*data-ca-button[^>]*>/);
  assert.ok(btnMatch, "expected the CA button element");
  assert.match(btnMatch[0], /disabled/);
});

test("both social icons are anchored via data-gate=\"social\" and ship with no real href", () => {
  const anchors = [...html.matchAll(/<a class="social-link"[^>]*>/g)].map((m) => m[0]);
  assert.equal(anchors.length, 2, "expected exactly two social icons (X and GitHub)");
  for (const a of anchors) {
    assert.match(a, /data-gate="social"/);
    assert.match(a, /aria-disabled="true"/);
    assert.doesNotMatch(a, /href="https?:\/\//);
  }
});

test("social icons cover both required ids", () => {
  assert.match(html, /data-social-id="x"/);
  assert.match(html, /data-social-id="github"/);
});

test("no hardcoded fabricated numbers in the token stat tiles (rendered as em-dash placeholders)", () => {
  const statSection = html.slice(html.indexOf('id="token"'), html.indexOf('id="faq"'));
  assert.doesNotMatch(statSection, /\$[0-9]/, "no dollar figures should be hardcoded in markup");
  assert.match(statSection, /stat-value">—</);
});
