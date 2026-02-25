import {
    TwoFactorState,
    SessionEntry,
    PrivacySettings,
    AuditLogEntry,
    DataExportRequest,
} from './types'

export const mockTwoFactor: TwoFactorState = {
    status: 'disabled',
    provider: null,
    enabledAt: null,
    recoveryCodes: [
        'ABCD-1234-EFGH',
        'IJKL-5678-MNOP',
        'QRST-9012-UVWX',
        'YZAB-3456-CDEF',
        'GHIJ-7890-KLMN',
        'OPQR-1234-STUV',
        'WXYZ-5678-ABCD',
        'EFGH-9012-IJKL',
    ],
}

export const mockSessions: SessionEntry[] = [
    {
        id: 'sess-1',
        device: 'Windows 11 Desktop',
        browser: 'Chrome 121',
        location: 'Lagos, Nigeria',
        ipAddress: '102.89.xx.xx',
        lastActive: '2026-02-22T20:30:00Z',
        isCurrent: true,
    },
    {
        id: 'sess-2',
        device: 'iPhone 15 Pro',
        browser: 'Safari Mobile',
        location: 'Lagos, Nigeria',
        ipAddress: '102.89.xx.xx',
        lastActive: '2026-02-22T18:15:00Z',
        isCurrent: false,
    },
    {
        id: 'sess-3',
        device: 'MacBook Pro',
        browser: 'Firefox 122',
        location: 'Abuja, Nigeria',
        ipAddress: '105.112.xx.xx',
        lastActive: '2026-02-21T09:45:00Z',
        isCurrent: false,
    },
]

export const mockPrivacy: PrivacySettings = {
    profileVisibility: 'public',
    showActivityFeed: true,
    showReputationScore: true,
    showGuildMemberships: true,
    allowDirectMessages: false,
    dataTrackingConsent: true,
    marketingConsent: false,
    consentUpdatedAt: '2026-01-15T10:00:00Z',
}

export const mockAuditLog: AuditLogEntry[] = [
    {
        id: 'audit-1',
        event: 'login',
        description: 'Signed in via Freighter wallet',
        ipAddress: '102.89.xx.xx',
        timestamp: '2026-02-22T20:30:00Z',
    },
    {
        id: 'audit-2',
        event: 'privacy_updated',
        description: 'Updated profile visibility to public',
        ipAddress: '102.89.xx.xx',
        timestamp: '2026-02-20T14:22:00Z',
    },
    {
        id: 'audit-3',
        event: 'session_revoked',
        description: 'Revoked session from unknown device',
        ipAddress: '105.112.xx.xx',
        timestamp: '2026-02-18T08:10:00Z',
    },
    {
        id: 'audit-4',
        event: 'two_factor_enabled',
        description: 'Enabled 2FA via authenticator app',
        ipAddress: '102.89.xx.xx',
        timestamp: '2026-02-15T16:45:00Z',
    },
    {
        id: 'audit-5',
        event: 'data_export_requested',
        description: 'Requested data export in JSON format',
        ipAddress: '102.89.xx.xx',
        timestamp: '2026-02-10T11:30:00Z',
    },
]

export const mockDataExports: DataExportRequest[] = [
    {
        id: 'export-1',
        format: 'json',
        status: 'ready',
        requestedAt: '2026-02-10T11:30:00Z',
        completedAt: '2026-02-10T11:35:00Z',
    },
]
