import { REGISTRY } from "./registry.js";
import { isContractGateActive, isSocialGateActive, deriveHandle } from "./gate.js";

function fmtRelativeAddress(addr) {
  return addr;
}

function renderContractGate() {
  const el = document.querySelector('[data-gate="contract"]');
  const record = REGISTRY.contract;
  const active = isContractGateActive(record);
  el.dataset.gateStatus = record.status;
  el.dataset.gateActive = String(active);

  const btn = el.querySelector("[data-ca-button]");
  const text = el.querySelector("[data-ca-text]");
  const hint = el.querySelector("[data-ca-hint]");

  if (active) {
    btn.disabled = false;
    text.textContent = fmtRelativeAddress(record.address);
    hint.textContent = "click to copy";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(record.address);
        hint.textContent = "copied";
        btn.classList.add("copied");
        setTimeout(() => {
          hint.textContent = "click to copy";
          btn.classList.remove("copied");
        }, 1600);
      } catch {
        hint.textContent = "copy failed — select manually";
      }
    });
  } else {
    btn.disabled = true;
    text.textContent = record.status === "absent" ? "not yet deployed" : "unconfirmed";
    hint.textContent = "renders live the moment it's stated";
  }
}

function renderSocials() {
  for (const record of REGISTRY.socials) {
    const el = document.querySelector(`[data-social-id="${record.id}"]`);
    if (!el) continue;
    const active = isSocialGateActive(record);
    el.dataset.gateStatus = record.status;
    el.dataset.gateActive = String(active);
    if (active) {
      el.href = record.url;
      el.removeAttribute("aria-disabled");
      el.removeAttribute("tabindex");
      const handle = deriveHandle(record.url);
      el.setAttribute("aria-label", `${record.label} — ${handle}`);
    } else {
      el.removeAttribute("href");
      el.setAttribute("aria-disabled", "true");
      el.setAttribute("tabindex", "-1");
    }
  }
}

function renderChain() {
  const chain = REGISTRY.chain;
  const scope = document.querySelector('[data-registry="chain"]');
  for (const [key, value] of Object.entries(chain)) {
    const field = scope.querySelector(`[data-field="${key}"]`);
    if (field) field.textContent = value;
  }
  const source = document.querySelector('#chain [data-field="source"]');
  if (source) source.textContent = `Source: ${chain.source}`;
}

function renderFaq() {
  const host = document.querySelector("[data-faq]");
  host.innerHTML = REGISTRY.faq
    .map(
      (item) => `
      <details class="faq-item">
        <summary>${item.q}</summary>
        <p>${item.a}</p>
      </details>`
    )
    .join("");
}

function renderChangelog() {
  const host = document.querySelector("[data-changelog]");
  host.innerHTML = REGISTRY.changelog
    .map(
      (entry) => `
      <li class="changelog-item">
        <time datetime="${entry.date}">${entry.date}</time>
        <p>${entry.text}</p>
      </li>`
    )
    .join("");
}

function wireTabs() {
  const root = document.querySelector("[data-tabs]");
  if (!root) return;
  const tabs = root.querySelectorAll("[data-tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");
      root.querySelectorAll("[data-tab-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.tabPanel !== tab.dataset.tab;
      });
    });
  });
}

function wireThemeToggle() {
  const btn = document.querySelector("[data-theme-toggle]");
  const stored = (() => {
    try {
      return localStorage.getItem("rinso-theme");
    } catch {
      return null;
    }
  })();
  if (stored === "light" || stored === "dark") {
    document.documentElement.setAttribute("data-theme", stored);
  }
  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const isDark =
      current === "dark" ||
      (!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("rinso-theme", next);
    } catch {}
  });
}

renderContractGate();
renderSocials();
renderChain();
renderFaq();
renderChangelog();
wireTabs();
wireThemeToggle();
