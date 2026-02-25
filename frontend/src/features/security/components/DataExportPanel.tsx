"use client";

import React, { useState } from "react";
import { Download, Trash2, FileJson, FileSpreadsheet, Loader2, CheckCircle } from "lucide-react";
import { useSecurity } from "@/hooks/useSecurity";
import { DataExportFormat } from "@/features/security/types";

export const DataExportPanel: React.FC = () => {
    const { dataExports, requestDataExport, requestAccountDeletion } =
        useSecurity();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");

    const handleExport = (format: DataExportFormat) => {
        requestDataExport(format);
    };

    const handleDeleteRequest = () => {
        if (deleteInput !== "DELETE") return;
        requestAccountDeletion();
        setShowDeleteConfirm(false);
        setDeleteInput("");
    };

    return (
        <div className="space-y-6">
            {/* Export */}
            <div className="rounded-xl border border-stellar-lightNavy bg-stellar-darkNavy p-5">
                <div className="mb-1 flex items-center gap-2">
                    <Download className="h-4 w-4 text-stellar-slate" />
                    <h4 className="text-sm font-medium text-stellar-white">
                        Export Your Data
                    </h4>
                </div>
                <p className="mb-4 text-xs text-stellar-slate">
                    Download a copy of your personal data including profile, activity, and
                    guild membership history.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleExport("json")}
                        className="flex items-center gap-2 rounded-lg border border-stellar-lightNavy bg-stellar-navy px-4 py-2 text-sm font-medium text-stellar-white transition-colors hover:border-gold-500/50"
                    >
                        <FileJson className="h-4 w-4 text-gold-400" />
                        Export JSON
                    </button>
                    <button
                        onClick={() => handleExport("csv")}
                        className="flex items-center gap-2 rounded-lg border border-stellar-lightNavy bg-stellar-navy px-4 py-2 text-sm font-medium text-stellar-white transition-colors hover:border-gold-500/50"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-gold-400" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Export History */}
            {dataExports.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-stellar-white">
                        Export History
                    </h4>
                    {dataExports.map((exp) => (
                        <div
                            key={exp.id}
                            className="flex items-center justify-between rounded-lg border border-stellar-lightNavy bg-stellar-darkNavy p-3"
                        >
                            <div className="flex items-center gap-3">
                                {exp.status === "processing" ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-gold-400" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                                )}
                                <div>
                                    <p className="text-sm text-stellar-white">
                                        {exp.format.toUpperCase()} Export
                                    </p>
                                    <p className="text-xs text-stellar-slate">
                                        {new Date(exp.requestedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${exp.status === "ready"
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : exp.status === "processing"
                                            ? "bg-gold-500/20 text-gold-400"
                                            : "bg-stellar-lightNavy text-stellar-slate"
                                    }`}
                            >
                                {exp.status === "ready"
                                    ? "Ready"
                                    : exp.status === "processing"
                                        ? "Processing"
                                        : exp.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Account Deletion */}
            <div className="rounded-xl border border-red-500/20 bg-stellar-darkNavy p-5">
                <div className="mb-1 flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-400" />
                    <h4 className="text-sm font-medium text-red-400">
                        Delete Account
                    </h4>
                </div>
                <p className="mb-4 text-xs text-stellar-slate">
                    Permanently delete your account and all associated data. This action
                    cannot be undone.
                </p>
                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                    >
                        Request Account Deletion
                    </button>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-red-400">
                            Type <strong>DELETE</strong> to confirm:
                        </p>
                        <input
                            type="text"
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            placeholder="DELETE"
                            className="w-full rounded-lg border border-red-500/30 bg-stellar-navy px-3 py-2 text-sm text-stellar-white placeholder:text-stellar-slate focus:outline-none focus:ring-2 focus:ring-red-500 sm:w-48"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleDeleteRequest}
                                disabled={deleteInput !== "DELETE"}
                                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Confirm Deletion
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteInput("");
                                }}
                                className="rounded-lg border border-stellar-lightNavy px-4 py-2 text-sm font-medium text-stellar-slate transition-colors hover:text-stellar-white"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
