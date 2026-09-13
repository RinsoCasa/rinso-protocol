import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidAddress, isContractGateActive, isSocialGateActive, deriveHandle } from "../js/gate.js";

test("rejects throwaway short hex", () => {
  assert.equal(isValidAddress("0x123"), false);
});

test("rejects non-hex look-alike of the right length", () => {
  assert.equal(isValidAddress("0x" + "z".repeat(40)), false);
});

test("rejects an address missing the 0x prefix", () => {
  assert.equal(isValidAddress("e0fb5d77c627ba9c7950fc0d62d1d96603e7b7c6"), false);
});

test("rejects one hex digit short", () => {
  assert.equal(isValidAddress("0x" + "a".repeat(39)), false);
});

test("rejects one hex digit long", () => {
  assert.equal(isValidAddress("0x" + "a".repeat(41)), false);
});

test("accepts a well-formed 40-hex address", () => {
  assert.equal(isValidAddress("0x" + "a".repeat(40)), true);
});

test("contract gate stays inert when status is absent, even with a valid-shaped address", () => {
  assert.equal(
    isContractGateActive({ status: "absent", address: "0x" + "a".repeat(40) }),
    false
  );
});

test("contract gate stays inert when status is stated but the address is malformed", () => {
  assert.equal(isContractGateActive({ status: "stated", address: "0xnotreal" }), false);
});

test("contract gate stays inert with no record at all", () => {
  assert.equal(isContractGateActive(undefined), false);
});

test("contract gate activates only when stated AND well-formed", () => {
  assert.equal(
    isContractGateActive({ status: "stated", address: "0x" + "a".repeat(40) }),
    true
  );
});

test("social gate stays inert while unconfirmed, even with a URL present", () => {
  assert.equal(
    isSocialGateActive({ status: "unconfirmed", url: "https://x.com/rinso" }),
    false
  );
});

test("social gate stays inert while merely stated (not yet verified)", () => {
  assert.equal(
    isSocialGateActive({ status: "stated", url: "https://x.com/rinso" }),
    false
  );
});

test("social gate rejects a non-https url even when verified", () => {
  assert.equal(
    isSocialGateActive({ status: "verified", url: "http://x.com/rinso" }),
    false
  );
});

test("social gate activates only when verified AND https", () => {
  assert.equal(
    isSocialGateActive({ status: "verified", url: "https://x.com/rinso" }),
    true
  );
});

test("handle is derived from the stored url, never stored twice", () => {
  assert.equal(deriveHandle("https://x.com/rinso"), "@rinso");
  assert.equal(deriveHandle("https://github.com/rinso-labs"), "@rinso-labs");
  assert.equal(deriveHandle("not a url"), null);
});
