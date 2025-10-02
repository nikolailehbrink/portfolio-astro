type LegalSite = {
  name: string;
  href: string;
};

export const LEGAL_SITES = [
  {
    name: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    name: "Legal Notice",
    href: "/legal-notice",
  },
] as const satisfies LegalSite[];
