// Pure gating predicates. No DOM, no fetch — testable in isolation so the
// gate's fail path is provable, not just its happy path.

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

// Never blanket-reject "looks like 0x hex" — only reject shapes that don't
// match a real 20-byte EVM address, and only ever compare against a
// registry record, never against arbitrary page text.
export function isValidAddress(str) {
  return typeof str === "string" && ADDRESS_RE.test(str);
}

export function isContractGateActive(record) {
  if (!record) return false;
  if (record.status !== "stated") return false;
  return isValidAddress(record.address);
}

// Social gate: unconfirmed/stated are both inert. Only "verified" plus a
// non-empty https url renders a real href.
export function isSocialGateActive(record) {
  if (!record) return false;
  if (record.status !== "verified") return false;
  return typeof record.url === "string" && /^https:\/\//.test(record.url);
}

// Derive a handle from a stored URL rather than storing the handle twice.
export function deriveHandle(url) {
  if (typeof url !== "string") return null;
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.length ? "@" + parts[parts.length - 1] : u.hostname;
  } catch {
    return null;
  }
}
