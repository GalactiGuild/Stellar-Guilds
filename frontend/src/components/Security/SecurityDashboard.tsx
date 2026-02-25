"use client";

import React, { useState } from "react";
import { Shield, Monitor, Eye, ScrollText, Database, FileText } from "lucide-react";
import { TwoFactorSetup } from "@/features/security/components/TwoFactorSetup";
import { SessionManager } from "@/features/security/components/SessionManager";
import { PrivacyControls } from "@/features/security/components/PrivacyControls";
import { SecurityAuditLog } from "@/features/security/components/SecurityAuditLog";
import { DataExportPanel } from "@/features/security/components/DataExportPanel";
import { CompliancePanel } from "@/features/security/components/CompliancePanel";

type SecurityTab =
    | "two-factor"
    | "sessions"
    | "privacy"
    | "audit-log"
    | "data"
    | "compliance";

const tabs: { id: SecurityTab; label: string; icon: React.ReactNode }[] = [
    { id: "two-factor", label: "Two-Factor Auth", icon: <Shield className="h-4 w-4" /> },
    { id: "sessions", label: "Sessions", icon: <Monitor className="h-4 w-4" /> },
    { id: "privacy", label: "Privacy", icon: <Eye className="h-4 w-4" /> },
    { id: "audit-log", label: "Audit Log", icon: <ScrollText className="h-4 w-4" /> },
    { id: "data", label: "Data Management", icon: <Database className="h-4 w-4" /> },
    { id: "compliance", label: "Compliance", icon: <FileText className="h-4 w-4" /> },
];

const tabContent: Record<SecurityTab, React.ReactNode> = {
    "two-factor": <TwoFactorSetup />,
    sessions: <SessionManager />,
    privacy: <PrivacyControls />,
    "audit-log": <SecurityAuditLog />,
    data: <DataExportPanel />,
    compliance: <CompliancePanel />,
};

export const SecurityDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SecurityTab>("two-factor");

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-stellar-lightNavy bg-stellar-darkNavy p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? "bg-stellar-lightNavy text-gold-400"
                                : "text-stellar-slate hover:text-stellar-white"
                            }`}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>{tabContent[activeTab]}</div>
        </div>
    );
};
