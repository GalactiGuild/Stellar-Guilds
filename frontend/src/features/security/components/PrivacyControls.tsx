"use client";

import React from "react";
import { Eye, MessageSquare, Trophy, Users, BarChart3 } from "lucide-react";
import { useSecurity } from "@/hooks/useSecurity";
import { PrivacyLevel } from "@/features/security/types";

const visibilityOptions: { value: PrivacyLevel; label: string; desc: string }[] = [
    { value: "public", label: "Public", desc: "Anyone can view your profile" },
    { value: "guild-only", label: "Guild Members Only", desc: "Only guild members can view" },
    { value: "private", label: "Private", desc: "Only you can view your profile" },
];

interface ToggleRowProps {
    icon: React.ReactNode;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
    icon,
    label,
    description,
    checked,
    onChange,
}) => (
    <div className="flex items-center justify-between rounded-lg border border-stellar-lightNavy bg-stellar-darkNavy p-4">
        <div className="flex items-center gap-3">
            <div className="text-stellar-slate">{icon}</div>
            <div>
                <p className="text-sm font-medium text-stellar-white">{label}</p>
                <p className="text-xs text-stellar-slate">{description}</p>
            </div>
        </div>
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-gold-500" : "bg-stellar-lightNavy"
                }`}
        >
            <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"
                    }`}
            />
        </button>
    </div>
);

export const PrivacyControls: React.FC = () => {
    const { privacy, updatePrivacy, setProfileVisibility } = useSecurity();

    return (
        <div className="space-y-6">
            {/* Profile Visibility */}
            <div className="rounded-xl border border-stellar-lightNavy bg-stellar-darkNavy p-5">
                <div className="mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-stellar-slate" />
                    <h4 className="text-sm font-medium text-stellar-white">
                        Profile Visibility
                    </h4>
                </div>
                <div className="space-y-2">
                    {visibilityOptions.map((opt) => (
                        <label
                            key={opt.value}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${privacy.profileVisibility === opt.value
                                    ? "border-gold-500/50 bg-gold-500/5"
                                    : "border-stellar-lightNavy hover:border-stellar-slate/30"
                                }`}
                        >
                            <input
                                type="radio"
                                name="visibility"
                                value={opt.value}
                                checked={privacy.profileVisibility === opt.value}
                                onChange={() => setProfileVisibility(opt.value)}
                                className="sr-only"
                            />
                            <div
                                className={`flex h-4 w-4 items-center justify-center rounded-full border ${privacy.profileVisibility === opt.value
                                        ? "border-gold-500 bg-gold-500"
                                        : "border-stellar-slate"
                                    }`}
                            >
                                {privacy.profileVisibility === opt.value && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-stellar-navy" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-stellar-white">
                                    {opt.label}
                                </p>
                                <p className="text-xs text-stellar-slate">{opt.desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Privacy Toggles */}
            <div className="space-y-2">
                <ToggleRow
                    icon={<BarChart3 className="h-4 w-4" />}
                    label="Show Activity Feed"
                    description="Display your recent actions publicly"
                    checked={privacy.showActivityFeed}
                    onChange={(v) => updatePrivacy({ showActivityFeed: v })}
                />
                <ToggleRow
                    icon={<Trophy className="h-4 w-4" />}
                    label="Show Reputation Score"
                    description="Display your reputation score on your profile"
                    checked={privacy.showReputationScore}
                    onChange={(v) => updatePrivacy({ showReputationScore: v })}
                />
                <ToggleRow
                    icon={<Users className="h-4 w-4" />}
                    label="Show Guild Memberships"
                    description="List your guild memberships publicly"
                    checked={privacy.showGuildMemberships}
                    onChange={(v) => updatePrivacy({ showGuildMemberships: v })}
                />
                <ToggleRow
                    icon={<MessageSquare className="h-4 w-4" />}
                    label="Allow Direct Messages"
                    description="Let anyone send you messages"
                    checked={privacy.allowDirectMessages}
                    onChange={(v) => updatePrivacy({ allowDirectMessages: v })}
                />
            </div>

            {/* Consent Management */}
            <div className="rounded-xl border border-stellar-lightNavy bg-stellar-darkNavy p-5">
                <h4 className="mb-3 text-sm font-medium text-stellar-white">
                    Data Consent
                </h4>
                <div className="space-y-3">
                    <ToggleRow
                        icon={<BarChart3 className="h-4 w-4" />}
                        label="Analytics & Tracking"
                        description="Allow usage data collection to improve the platform"
                        checked={privacy.dataTrackingConsent}
                        onChange={(v) => updatePrivacy({ dataTrackingConsent: v })}
                    />
                    <ToggleRow
                        icon={<MessageSquare className="h-4 w-4" />}
                        label="Marketing Communications"
                        description="Receive updates about new features and events"
                        checked={privacy.marketingConsent}
                        onChange={(v) => updatePrivacy({ marketingConsent: v })}
                    />
                </div>
                {privacy.consentUpdatedAt && (
                    <p className="mt-3 text-xs text-stellar-slate">
                        Last updated:{" "}
                        {new Date(privacy.consentUpdatedAt).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    );
};
