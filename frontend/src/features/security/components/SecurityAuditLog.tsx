"use client";

import React from "react";
import {
    LogIn,
    LogOut,
    Shield,
    ShieldOff,
    Eye,
    Download,
    Trash2,
    Key,
} from "lucide-react";
import { useSecurity } from "@/hooks/useSecurity";
import { AuditEventType } from "@/features/security/types";

const eventMeta: Record<
    AuditEventType,
    { icon: React.ReactNode; color: string }
> = {
    login: {
        icon: <LogIn className="h-4 w-4" />,
        color: "text-emerald-400",
    },
    logout: {
        icon: <LogOut className="h-4 w-4" />,
        color: "text-stellar-slate",
    },
    two_factor_enabled: {
        icon: <Shield className="h-4 w-4" />,
        color: "text-emerald-400",
    },
    two_factor_disabled: {
        icon: <ShieldOff className="h-4 w-4" />,
        color: "text-amber-400",
    },
    session_revoked: {
        icon: <LogOut className="h-4 w-4" />,
        color: "text-red-400",
    },
    privacy_updated: {
        icon: <Eye className="h-4 w-4" />,
        color: "text-blue-400",
    },
    data_export_requested: {
        icon: <Download className="h-4 w-4" />,
        color: "text-gold-400",
    },
    data_deletion_requested: {
        icon: <Trash2 className="h-4 w-4" />,
        color: "text-red-400",
    },
    password_changed: {
        icon: <Key className="h-4 w-4" />,
        color: "text-blue-400",
    },
};

const formatTimestamp = (iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const SecurityAuditLog: React.FC = () => {
    const { auditLog } = useSecurity();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-stellar-white">
                    Security Events
                </h4>
                <span className="text-xs text-stellar-slate">
                    {auditLog.length} events
                </span>
            </div>

            <div className="space-y-1">
                {auditLog.map((entry) => {
                    const meta = eventMeta[entry.event];
                    return (
                        <div
                            key={entry.id}
                            className="flex items-start gap-3 rounded-lg border border-stellar-lightNavy bg-stellar-darkNavy p-3"
                        >
                            <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stellar-lightNavy ${meta.color}`}
                            >
                                {meta.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-stellar-white">
                                    {entry.description}
                                </p>
                                <div className="mt-0.5 flex items-center gap-2 text-xs text-stellar-slate">
                                    <span>{formatTimestamp(entry.timestamp)}</span>
                                    <span>·</span>
                                    <span>{entry.ipAddress}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {auditLog.length === 0 && (
                    <p className="py-8 text-center text-sm text-stellar-slate">
                        No security events recorded
                    </p>
                )}
            </div>
        </div>
    );
};
