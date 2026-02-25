"use client";

import React, { useState } from "react";
import {
    FileText,
    CheckCircle,
    Clock,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Shield,
    Globe,
} from "lucide-react";

interface PolicySection {
    id: string;
    title: string;
    summary: string;
    lastUpdated: string;
    content: string[];
}

const policies: PolicySection[] = [
    {
        id: "privacy-policy",
        title: "Privacy Policy",
        summary:
            "How we collect, use, and protect your personal data on the Stellar Guilds platform.",
        lastUpdated: "2026-01-15",
        content: [
            "We collect only the minimum data necessary to operate the platform: wallet address, profile information you provide, and usage analytics (if consented).",
            "Your data is stored securely and is never sold to third parties.",
            "You may request a full export or deletion of your data at any time via the Data Management tab.",
            "On-chain activity (transactions, guild interactions) is public by nature of the Stellar blockchain and cannot be deleted.",
        ],
    },
    {
        id: "data-processing",
        title: "Data Processing Agreement",
        summary:
            "Legal basis and purposes for processing your personal information.",
        lastUpdated: "2026-01-15",
        content: [
            "Personal data is processed under legitimate interest (platform operation) and explicit consent (analytics, marketing).",
            "Data processors include infrastructure providers bound by equivalent data protection standards.",
            "Processing activities are logged and auditable via the Security Audit Log.",
            "You may withdraw consent for optional processing at any time through Privacy settings without affecting core platform access.",
        ],
    },
    {
        id: "gdpr",
        title: "GDPR Compliance",
        summary:
            "Your rights under the General Data Protection Regulation.",
        lastUpdated: "2026-01-15",
        content: [
            "Right to Access — Export your data via the Data Management tab.",
            "Right to Rectification — Update your profile information at any time.",
            "Right to Erasure — Request account deletion to remove all personal data.",
            "Right to Restrict Processing — Disable analytics and marketing consent in Privacy settings.",
            "Right to Data Portability — Download your data in JSON or CSV format.",
            "Right to Object — Opt out of non-essential data processing at any time.",
        ],
    },
    {
        id: "cookie-policy",
        title: "Cookie & Storage Policy",
        summary:
            "How we use browser storage to maintain your session and preferences.",
        lastUpdated: "2026-01-15",
        content: [
            "Essential cookies are used for session management and authentication state.",
            "Preference cookies store your theme, language, and layout selections.",
            "Analytics cookies are only set when you explicitly consent to data tracking.",
            "No third-party advertising cookies are used on this platform.",
        ],
    },
];

interface ComplianceStatus {
    id: string;
    label: string;
    status: "compliant" | "pending";
    description: string;
}

const complianceChecks: ComplianceStatus[] = [
    {
        id: "consent-management",
        label: "Consent Management",
        status: "compliant",
        description: "Granular consent controls available in Privacy settings",
    },
    {
        id: "data-export",
        label: "Data Portability",
        status: "compliant",
        description: "JSON and CSV export available in Data Management",
    },
    {
        id: "data-deletion",
        label: "Right to Erasure",
        status: "compliant",
        description: "Account deletion with confirmation safeguard",
    },
    {
        id: "audit-logging",
        label: "Audit Logging",
        status: "compliant",
        description: "All security events recorded with timestamps and IP addresses",
    },
    {
        id: "two-factor-auth",
        label: "Two-Factor Authentication",
        status: "compliant",
        description: "Multiple 2FA providers with recovery codes",
    },
    {
        id: "session-management",
        label: "Session Security",
        status: "compliant",
        description: "Configurable timeouts and session revocation",
    },
];

const PolicyAccordion: React.FC<{ policy: PolicySection }> = ({ policy }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="rounded-lg border border-stellar-lightNavy bg-stellar-darkNavy">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-between p-4 text-left"
            >
                <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gold-400" />
                    <div>
                        <p className="text-sm font-medium text-stellar-white">
                            {policy.title}
                        </p>
                        <p className="text-xs text-stellar-slate">
                            {policy.summary}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-stellar-slate sm:inline">
                        Updated {new Date(policy.lastUpdated).toLocaleDateString()}
                    </span>
                    {expanded ? (
                        <ChevronUp className="h-4 w-4 text-stellar-slate" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-stellar-slate" />
                    )}
                </div>
            </button>
            {expanded && (
                <div className="border-t border-stellar-lightNavy px-4 pb-4 pt-3">
                    <ul className="space-y-2">
                        {policy.content.map((item, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-stellar-lightSlate"
                            >
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export const CompliancePanel: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Compliance Status Overview */}
            <div className="rounded-xl border border-stellar-lightNavy bg-stellar-darkNavy p-5">
                <div className="mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <h4 className="text-sm font-medium text-stellar-white">
                        Compliance Status
                    </h4>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                    {complianceChecks.map((check) => (
                        <div
                            key={check.id}
                            className="flex items-start gap-2 rounded-lg border border-stellar-lightNavy p-3"
                        >
                            {check.status === "compliant" ? (
                                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                            ) : (
                                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                            )}
                            <div>
                                <p className="text-xs font-medium text-stellar-white">
                                    {check.label}
                                </p>
                                <p className="text-xs text-stellar-slate">
                                    {check.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Jurisdiction Notice */}
            <div className="flex items-start gap-3 rounded-xl border border-stellar-lightNavy bg-stellar-darkNavy p-4">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <div>
                    <p className="text-sm font-medium text-stellar-white">
                        Multi-Jurisdiction Notice
                    </p>
                    <p className="text-xs text-stellar-slate">
                        Stellar Guilds applies the strictest applicable standard across
                        GDPR (EU), CCPA (California), LGPD (Brazil), and POPIA (South Africa).
                        Your rights are honored regardless of location.
                    </p>
                </div>
            </div>

            {/* Policy Documents */}
            <div>
                <h4 className="mb-3 text-sm font-medium text-stellar-white">
                    Policy Documents
                </h4>
                <div className="space-y-2">
                    {policies.map((policy) => (
                        <PolicyAccordion key={policy.id} policy={policy} />
                    ))}
                </div>
            </div>

            {/* Contact */}
            <div className="rounded-xl border border-stellar-lightNavy bg-stellar-darkNavy p-5">
                <h4 className="mb-2 text-sm font-medium text-stellar-white">
                    Data Protection Contact
                </h4>
                <p className="text-xs text-stellar-slate">
                    For privacy inquiries, data subject requests, or to report a security
                    concern, contact the data protection team via the platform&apos;s support
                    channel or open an issue on the project repository.
                </p>
                <a
                    href="https://github.com/GalactiGuild/Stellar-Guilds/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold-400 transition-colors hover:text-gold-300"
                >
                    Open an Issue
                    <ExternalLink className="h-3 w-3" />
                </a>
            </div>
        </div>
    );
};
