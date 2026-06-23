export type LegalPage = "privacy" | "terms" | "cookies";

export interface LegalSection {
  title: string;
  paragraphs: string[];
  list?: string[];
}

export interface LegalDocument {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const LEGAL_PAGES: Record<LegalPage, { path: string; label: string }> = {
  privacy: { path: "/privacy", label: "Privacy Policy" },
  terms: { path: "/terms", label: "Terms of Service" },
  cookies: { path: "/cookies", label: "Cookie Policy" },
};

export const LEGAL_CONTENT: Record<LegalPage, LegalDocument> = {
  privacy: {
    title: "Privacy Policy",
    description: "How Licitor handles information when you use our website and application.",
    lastUpdated: "June 24, 2026",
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "Licitor is a decentralized auction application built on Stellar testnet. We do not operate traditional user accounts. When you use Licitor, you interact with your own wallet and with public blockchain infrastructure.",
          "This Privacy Policy explains what information may be processed when you visit licitor.app or use the application, and how that information is used.",
        ],
      },
      {
        title: "Information we do not collect",
        paragraphs: [
          "Licitor does not require registration with an email address, password, or phone number. We do not intentionally collect government identification, payment card numbers, or other traditional personal account data through the application interface.",
        ],
      },
      {
        title: "Information that may be processed",
        paragraphs: [
          "When you use Licitor, the following information may be generated or displayed:",
        ],
        list: [
          "Your public Stellar wallet address when you connect a wallet.",
          "Transaction data that you submit to Stellar testnet, including bids, auction creation, and finalization.",
          "Public on-chain auction and bid history accessible through Soroban RPC and block explorers.",
          "Basic technical data such as browser type, device type, and approximate usage patterns if analytics are enabled in the future.",
          "Local browser storage used to remember UI preferences or wallet connection state.",
        ],
      },
      {
        title: "Blockchain data is public",
        paragraphs: [
          "Transactions signed through your wallet are recorded on Stellar testnet and are publicly visible. Wallet addresses, bid amounts, auction metadata, and timestamps may be indexed by third-party services such as Stellar Expert, RPC providers, and other blockchain analytics tools.",
          "Licitor cannot delete or modify data that has already been confirmed on-chain.",
        ],
      },
      {
        title: "Third-party services",
        paragraphs: [
          "Licitor relies on third-party infrastructure, including wallet extensions such as Freighter, Stellar RPC endpoints, and block explorers. Those services have their own privacy policies and data practices. We encourage you to review them before connecting a wallet or signing transactions.",
        ],
      },
      {
        title: "How we use information",
        paragraphs: [
          "We use available information only to operate and improve Licitor, display auction state, provide transaction feedback, maintain security, and comply with applicable legal obligations.",
          "We do not sell personal information.",
        ],
      },
      {
        title: "Data retention",
        paragraphs: [
          "On-chain data persists according to the Stellar network rules. Local browser data may remain until you clear your browser storage or disconnect your wallet.",
        ],
      },
      {
        title: "Your choices",
        paragraphs: [
          "You may stop using Licitor at any time. You may disconnect your wallet, clear browser storage, and avoid signing transactions. Because blockchain data is public, previously confirmed transactions will remain visible on-chain.",
        ],
      },
      {
        title: "Children",
        paragraphs: [
          "Licitor is not directed to children under 13, and we do not knowingly collect personal information from children.",
        ],
      },
      {
        title: "Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy from time to time. The date at the top of this page indicates when it was last revised. Continued use of Licitor after changes become effective constitutes acceptance of the updated policy.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          "If you have questions about this Privacy Policy, contact us at legal@licitor.app.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    description: "Rules and conditions for using the Licitor application.",
    lastUpdated: "June 24, 2026",
    sections: [
      {
        title: "Agreement",
        paragraphs: [
          "By accessing or using Licitor, you agree to these Terms of Service. If you do not agree, do not use the application.",
        ],
      },
      {
        title: "Testnet only",
        paragraphs: [
          "Licitor currently operates on Stellar testnet. Assets used in the application are test assets and have no real-world monetary value unless explicitly stated otherwise by a third party.",
          "You are responsible for confirming that you are connected to the intended network before signing any transaction.",
        ],
      },
      {
        title: "No custody",
        paragraphs: [
          "Licitor does not custody your assets or private keys. You connect your own wallet and approve each transaction yourself. We cannot reverse, cancel, or recover transactions after they are submitted to the network.",
        ],
      },
      {
        title: "Auction rules",
        paragraphs: [
          "Auction behavior is enforced by a Soroban smart contract. Bids must exceed the current highest offer. Auctions end according to on-chain timing rules and must be finalized after bidding closes.",
          "Licitor displays contract state but does not guarantee listing accuracy, item delivery, or seller performance for off-chain goods or services.",
        ],
      },
      {
        title: "User responsibilities",
        paragraphs: [
          "You are solely responsible for your wallet security, transaction review, tax obligations, and compliance with applicable laws. You agree not to use Licitor for unlawful, fraudulent, or abusive activity.",
        ],
      },
      {
        title: "No professional advice",
        paragraphs: [
          "Licitor provides software tooling only. Nothing on the site or in the application constitutes financial, legal, tax, or investment advice.",
        ],
      },
      {
        title: "Disclaimers",
        paragraphs: [
          'Licitor is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement.',
          "We do not warrant uninterrupted access, error-free operation, or that contract logic will meet your expectations in every scenario.",
        ],
      },
      {
        title: "Limitation of liability",
        paragraphs: [
          "To the fullest extent permitted by law, Licitor and its contributors will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of funds, profits, data, or goodwill arising from your use of the application or reliance on on-chain results.",
        ],
      },
      {
        title: "Intellectual property",
        paragraphs: [
          "The Licitor name, branding, interface, and related materials are protected by applicable intellectual property laws. You may not misrepresent affiliation with Licitor or copy the service in a way that creates confusion.",
        ],
      },
      {
        title: "Changes and termination",
        paragraphs: [
          "We may modify, suspend, or discontinue any part of Licitor at any time. We may update these Terms by posting a revised version on this page. Your continued use after changes become effective constitutes acceptance.",
        ],
      },
      {
        title: "Governing law",
        paragraphs: [
          "These Terms are governed by applicable law in the jurisdiction where Licitor is operated, without regard to conflict of law principles, except where mandatory local consumer protections apply.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          "Questions about these Terms may be sent to legal@licitor.app.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    description: "How Licitor uses cookies and similar browser technologies.",
    lastUpdated: "June 24, 2026",
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "This Cookie Policy explains how Licitor uses cookies, local storage, and similar technologies when you visit our website or use the application.",
        ],
      },
      {
        title: "What are cookies and local storage?",
        paragraphs: [
          "Cookies are small text files stored in your browser. Local storage and session storage are browser mechanisms that allow websites to save data on your device. These technologies help websites remember preferences and maintain basic functionality.",
        ],
      },
      {
        title: "How Licitor uses these technologies",
        paragraphs: [
          "Licitor may use strictly necessary browser storage to support core functionality, such as:",
        ],
        list: [
          "Remembering wallet connection state during a session.",
          "Preserving UI or routing preferences needed for the application to function.",
          "Caching non-sensitive technical state required for performance.",
        ],
      },
      {
        title: "Analytics and marketing cookies",
        paragraphs: [
          "Licitor does not currently use advertising cookies. If analytics or performance tools are added in the future, this policy will be updated to describe what is collected and how you can opt out where required.",
        ],
      },
      {
        title: "Third-party technologies",
        paragraphs: [
          "Wallet providers, hosting providers, font providers, and blockchain infrastructure services may set their own cookies or collect technical data under their own policies. Licitor does not control those third-party technologies.",
        ],
      },
      {
        title: "Managing cookies and storage",
        paragraphs: [
          "You can control cookies and local storage through your browser settings. Blocking or deleting storage may prevent wallet connection, routing, or other features from working correctly.",
        ],
      },
      {
        title: "Updates",
        paragraphs: [
          "We may update this Cookie Policy when our technology stack changes. Please review this page periodically for the latest information.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          "Questions about this Cookie Policy may be sent to legal@licitor.app.",
        ],
      },
    ],
  },
};
