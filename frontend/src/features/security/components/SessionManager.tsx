"use client";

import React from "react";
import { Monitor, Smartphone, Laptop, X, LogOut } from "lucide-react";
import { useSecurity } from "@/hooks/useSecurity";
import { SessionEntry, SessionTimeout } from "@/features/security/types";

const deviceIcon = (device: string) => {
    const lower = device.toLowerCase();
    if (lower.includes("iphone") || lower.includes("android"))
        return <Smartphone className="h-5 w-5" />;
    if (lower.includes("macbook") || lower.includes("laptop"))
        return <Laptop className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
};

const timeoutOptions: { value: SessionTimeout; label: string }[] = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 480, label: "8 hours" },
];

const formatLastActive = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const SessionRow: React.FC<{
    session: SessionEntry;
    onRevoke: (id: string) => void;
}> = ({ session, onRevoke }) => (
    <div className="flex items-center justify-between rounded-lg border border-stellar-lightNavy bg-stellar-darkNavy p-4">
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stellar-lightNavy text-stellar-slate">
                {deviceIcon(session.device)}
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-stellar-white">
                        {session.device}
                    </p>
                    {session.isCurrent && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            Current
                        </span>
                    )}
                </div>
                <p className="text-xs text-stellar-slate">
                    {session.browser} · {session.location} ·{" "}
                    {formatLastActive(session.lastActive)}
                </p>
            </div>
        </div>
        {!session.isCurrent && (
            <button
                onClick={() => onRevoke(session.id)}
                className="rounded-md p-2 text-stellar-slate transition-colors hover:bg-red-500/10 hover:text-red-400"
                title="Revoke session"
            >
                <X className="h-4 w-4" />
            </button>
        )}
    </div>
);

export const SessionManager: React.FC = () => {
    const {
        sessions,
        sessionTimeout,
        revokeSession,
        revokeAllOtherSessions,
        setSessionTimeout,
    } = useSecurity();

    const otherSessions = sessions.filter((s) => !s.isCurrent);

    return (
        <div className="space-y-6">
            {/* Timeout config */}
            <div className="rounded-xl border border-stellar-lightNavy bg-stellar-darkNavy p-5">
                <h4 className="mb-2 text-sm font-medium text-stellar-white">
                    Session Timeout
                </h4>
                <p className="mb-3 text-xs text-stellar-slate">
                    Automatically sign out after a period of inactivity.
                </p>
                <select
                    value={sessionTimeout}
                    onChange={(e) =>
                        setSessionTimeout(Number(e.target.value) as SessionTimeout)
                    }
                    className="w-full rounded-lg border border-stellar-lightNavy bg-stellar-navy px-3 py-2 text-sm text-stellar-white focus:outline-none focus:ring-2 focus:ring-gold-500 sm:w-auto"
                >
                    {timeoutOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Session list */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-medium text-stellar-white">
                        Active Sessions ({sessions.length})
                    </h4>
                    {otherSessions.length > 0 && (
                        <button
                            onClick={revokeAllOtherSessions}
                            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Revoke All Others
                        </button>
                    )}
                </div>
                <div className="space-y-2">
                    {sessions.map((session) => (
                        <SessionRow
                            key={session.id}
                            session={session}
                            onRevoke={revokeSession}
                        />
                    ))}
                    {sessions.length === 0 && (
                        <p className="py-4 text-center text-sm text-stellar-slate">
                            No active sessions
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
