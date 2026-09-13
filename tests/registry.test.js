import { test } from "node:test";
import assert from "node:assert/strict";
import { REGISTRY } from "../js/registry.js";
import { isContractGateActive, isSocialGateActive } from "../js/gate.js";

test("contract record status matches its gate: absent/unconfirmed stay inert, stated requires a valid address to be active", () => {
  const record = REGISTRY.contract;
  assert.ok(
    ["absent", "unconfirmed", "stated"].includes(record.status),
    `unexpected contract status: ${record.status}`
  );

  if (record.status !== "stated") {
    assert.equal(isContractGateActive(record), false);
    return;
  }

  // status is "stated": the gate must only be active if the address is
  // actually well-formed, never just because status says so.
  const isValidShape = typeof record.address === "string" && /^0x[0-9a-fA-F]{40}$/.test(record.address);
  assert.equal(isContractGateActive(record), isValidShape);
});

test("every social record is currently unconfirmed", () => {
  for (const record of REGISTRY.socials) {
    assert.equal(record.status, "unconfirmed");
    assert.equal(isSocialGateActive(record), false);
  }
});

test("chain record is stated and carries a source citation", () => {
  assert.equal(REGISTRY.chain.status, "stated");
  assert.ok(REGISTRY.chain.source && REGISTRY.chain.source.length > 0);
  assert.equal(REGISTRY.chain.chainIdDec, 4663);
  assert.equal(REGISTRY.chain.chainIdHex, "0x1237");
});

test("faq and changelog are non-empty arrays (counts must come from .length)", () => {
  assert.ok(Array.isArray(REGISTRY.faq) && REGISTRY.faq.length > 0);
  assert.ok(Array.isArray(REGISTRY.changelog) && REGISTRY.changelog.length > 0);
});
