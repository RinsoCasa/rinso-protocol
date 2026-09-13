// Single source of truth for every external fact on the site.
// Each record states one of: "stated" | "absent" | "unconfirmed".
// Nothing outside this file may hardcode a count, address, or link derived
// from these records — read the record, derive the render.

export const REGISTRY = {
  chain: {
    status: "stated",
    name: "Robinhood Chain",
    chainIdHex: "0x1237",
    chainIdDec: 4663,
    rpc: "https://rpc.mainnet.chain.robinhood.com",
    source: "client statement, 2026-09-02 (batch-level)",
  },

  contract: {
    status: "absent",
    address: null,
    statedAt: null,
    source: null,
  },

  socials: [
    {
      id: "x",
      label: "X",
      status: "unconfirmed",
      url: null,
    },
    {
      id: "github",
      label: "GitHub",
      status: "unconfirmed",
      url: null,
    },
  ],

  tokenStats: {
    status: "absent",
    fields: ["price", "fdv", "liquidity", "24hVolume", "totalSupply", "burned", "holders"],
  },

  changelog: [
    {
      date: "2026-09-12",
      text: "Site published. No contract deployed yet — the contract-address slot and both social icons render inert until each is stated and verified.",
    },
  ],

  faq: [
    {
      q: "Is there a contract address yet?",
      a: "No. The slot at the top of this page is wired to go live the moment one is stated, but right now it is inert on purpose. Anything claiming to be Rinso's contract before that slot lights up is not ours.",
    },
    {
      q: "What chain does Rinso launch on?",
      a: "Robinhood Chain — chain id 4663 (0x1237). That detail is fixed and came from a client statement on 2026-09-02; everything else about the token is still unstated.",
    },
    {
      q: "Where are the X and GitHub links?",
      a: "Both icons are in the top-right of the header, on every screen size. Neither has a destination yet — they turn into real links only once a URL is given and checked.",
    },
    {
      q: "Is any of the supply, price, or holder data on this page real?",
      a: "Not yet. Every field in that shape is marked absent rather than filled with a placeholder number, because there is no deployed contract to read it from.",
    },
    {
      q: "How will I know when something here changes?",
      a: "The log below only grows when a fact actually changes state — it does not restate the same thing twice.",
    },
  ],
};
