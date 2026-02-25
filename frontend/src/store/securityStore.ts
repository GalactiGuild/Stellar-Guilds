import { create } from 'zustand'
import {
    TwoFactorState,
    TwoFactorProvider,
    SessionEntry,
    SessionTimeout,
    PrivacySettings,
    PrivacyLevel,
    AuditLogEntry,
    AuditEventType,
    DataExportRequest,
    DataExportFormat,
} from '@/features/security/types'
import {
    mockTwoFactor,
    mockSessions,
    mockPrivacy,
    mockAuditLog,
    mockDataExports,
} from '@/features/security/mockData'

interface SecurityState {
    twoFactor: TwoFactorState
    sessions: SessionEntry[]
    sessionTimeout: SessionTimeout
    privacy: PrivacySettings
    auditLog: AuditLogEntry[]
    dataExports: DataExportRequest[]

    // 2FA
    enableTwoFactor: (provider: TwoFactorProvider) => void
    disableTwoFactor: () => void

    // Sessions
    revokeSession: (sessionId: string) => void
    revokeAllOtherSessions: () => void
    setSessionTimeout: (timeout: SessionTimeout) => void

    // Privacy
    updatePrivacy: (updates: Partial<PrivacySettings>) => void
    setProfileVisibility: (level: PrivacyLevel) => void

    // Audit
    addAuditEntry: (event: AuditEventType, description: string) => void

    // Data export
    requestDataExport: (format: DataExportFormat) => void
    requestAccountDeletion: () => void
}

export const useSecurityStore = create<SecurityState>((set, get) => ({
    twoFactor: mockTwoFactor,
    sessions: mockSessions,
    sessionTimeout: 60,
    privacy: mockPrivacy,
    auditLog: mockAuditLog,
    dataExports: mockDataExports,

    enableTwoFactor: (provider: TwoFactorProvider) => {
        set({
            twoFactor: {
                status: 'enabled',
                provider,
                enabledAt: new Date().toISOString(),
                recoveryCodes: get().twoFactor.recoveryCodes,
            },
        })
        get().addAuditEntry('two_factor_enabled', `Enabled 2FA via ${provider}`)
    },

    disableTwoFactor: () => {
        set({
            twoFactor: {
                status: 'disabled',
                provider: null,
                enabledAt: null,
                recoveryCodes: get().twoFactor.recoveryCodes,
            },
        })
        get().addAuditEntry('two_factor_disabled', 'Disabled two-factor authentication')
    },

    revokeSession: (sessionId: string) => {
        set({
            sessions: get().sessions.filter((s) => s.id !== sessionId),
        })
        get().addAuditEntry('session_revoked', `Revoked session ${sessionId}`)
    },

    revokeAllOtherSessions: () => {
        set({
            sessions: get().sessions.filter((s) => s.isCurrent),
        })
        get().addAuditEntry('session_revoked', 'Revoked all other sessions')
    },

    setSessionTimeout: (timeout: SessionTimeout) => {
        set({ sessionTimeout: timeout })
    },

    updatePrivacy: (updates: Partial<PrivacySettings>) => {
        set({
            privacy: {
                ...get().privacy,
                ...updates,
                consentUpdatedAt: new Date().toISOString(),
            },
        })
        get().addAuditEntry('privacy_updated', 'Updated privacy settings')
    },

    setProfileVisibility: (level: PrivacyLevel) => {
        get().updatePrivacy({ profileVisibility: level })
    },

    addAuditEntry: (event: AuditEventType, description: string) => {
        const entry: AuditLogEntry = {
            id: `audit-${Date.now()}`,
            event,
            description,
            ipAddress: '—',
            timestamp: new Date().toISOString(),
        }
        set({ auditLog: [entry, ...get().auditLog] })
    },

    requestDataExport: (format: DataExportFormat) => {
        const request: DataExportRequest = {
            id: `export-${Date.now()}`,
            format,
            status: 'processing',
            requestedAt: new Date().toISOString(),
            completedAt: null,
        }
        set({ dataExports: [request, ...get().dataExports] })
        get().addAuditEntry('data_export_requested', `Requested data export in ${format.toUpperCase()} format`)

        // Simulate processing
        setTimeout(() => {
            set({
                dataExports: get().dataExports.map((e) =>
                    e.id === request.id
                        ? { ...e, status: 'ready' as const, completedAt: new Date().toISOString() }
                        : e
                ),
            })
        }, 3000)
    },

    requestAccountDeletion: () => {
        get().addAuditEntry('data_deletion_requested', 'Account deletion requested')
    },
}))
