"use client";

import React, { useState } from "react";
import { Shield, Smartphone, Phone, Copy, Check, Eye, EyeOff } from "lucide-react";
import { useSecurity } from "@/hooks/useSecurity";
import { TwoFactorProvider } from "@/features/security/types";

export const TwoFactorSetup: React.FC = () => {
    const { twoFactor, isTwoFactorEnabled, enableTwoFactor, disableTwoFactor } =
        useSecurity();
    const [showCodes, setShowCodes] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [confirmDisable, setConfirmDisable] = useState(false);

    const handleEnable = (provider: TwoFactorProvider) => {
        enableTwoFactor(provider);
    };

    const handleDisable = () => {
        if (!confirmDisable) {
            setConfirmDisable(true);
            return;
        }
        disableTwoFactor();
        setConfirmDisable(false);
    };

    const copyCode = (code: string, index: number) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between rounded-xl border border-stellar-lightNavy bg-stellar-darkNavy p-5">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${isTwoFactorEnabled
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                    >
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-medium text-stellar-white">
                            Two-Factor Authentication
                        </p>
                        <p className="text-sm text-stellar-slate">
                            {isTwoFactorEnabled
                                ? `Enabled via ${twoFactor.provider}`
                                : "Not enabled — your account is less secure"}
                        </p>
                    </div>
                </div>
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${isTwoFactorEnabled
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                >
                    {isTwoFactorEnabled ? "Active" : "Inactive"}
                </span>
            </div>

            {/* Enable / Disable */}
            {!isTwoFactorEnabled ? (
                <div className="space-y-3">
                    <p className="text-sm text-stellar-slate">
                        Choose a two-factor authentication method:
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <button
                            onClick={() => handleEnable("authenticator")}
                            className="flex items-center gap-3 rounded-lg border border-stellar-lightNavy bg-stellar-lightNavy p-4 text-left transition-colors hover:border-gold-500/50"
                        >
                            <Smartphone className="h-5 w-5 text-gold-400" />
                            <div>
                                <p className="text-sm font-medium text-stellar-white">
                                    Authenticator App
                                </p>
                                <p className="text-xs text-stellar-slate">
                                    Google Authenticator, Authy, etc.
                                </p>
                            </div>
                        </button>
                        <button
                            onClick={() => handleEnable("sms")}
                            className="flex items-center gap-3 rounded-lg border border-stellar-lightNavy bg-stellar-lightNavy p-4 text-left transition-colors hover:border-gold-500/50"
                        >
                            <Phone className="h-5 w-5 text-gold-400" />
                            <div>
                                <p className="text-sm font-medium text-stellar-white">
                                    SMS Verification
                                </p>
                                <p className="text-xs text-stellar-slate">
                                    Receive codes via text message
                                </p>
                            </div>
                        </button>
                        <button
                            onClick={() => handleEnable("email")}
                            className="flex items-center gap-3 rounded-lg border border-stellar-lightNavy bg-stellar-lightNavy p-4 text-left transition-colors hover:border-gold-500/50"
                        >
                            <Shield className="h-5 w-5 text-gold-400" />
                            <div>
                                <p className="text-sm font-medium text-stellar-white">
                                    Email Verification
                                </p>
                                <p className="text-xs text-stellar-slate">
                                    Receive codes via email
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleDisable}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${confirmDisable
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                        }`}
                >
                    {confirmDisable ? "Confirm Disable 2FA" : "Disable 2FA"}
                </button>
            )}

            {/* Recovery Codes */}
            <div className="rounded-xl border border-stellar-lightNavy bg-stellar-darkNavy p-5">
                <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-medium text-stellar-white">
                        Recovery Codes
                    </h4>
                    <button
                        onClick={() => setShowCodes(!showCodes)}
                        className="flex items-center gap-1 text-xs text-stellar-slate transition-colors hover:text-stellar-white"
                    >
                        {showCodes ? (
                            <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                            <Eye className="h-3.5 w-3.5" />
                        )}
                        {showCodes ? "Hide" : "Show"}
                    </button>
                </div>
                <p className="mb-3 text-xs text-stellar-slate">
                    Store these codes in a secure location. Each code can only be used
                    once.
                </p>
                {showCodes && (
                    <div className="grid grid-cols-2 gap-2">
                        {twoFactor.recoveryCodes.map((code, i) => (
                            <button
                                key={code}
                                onClick={() => copyCode(code, i)}
                                className="flex items-center justify-between rounded-md bg-stellar-navy px-3 py-2 font-mono text-xs text-stellar-lightSlate transition-colors hover:bg-stellar-lightNavy"
                            >
                                <span>{code}</span>
                                {copiedIndex === i ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
