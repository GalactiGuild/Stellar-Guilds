'use client'

import { useCallback } from 'react'
import { useSecurityStore } from '@/store/securityStore'
import {
    TwoFactorProvider,
    SessionTimeout,
    PrivacySettings,
    PrivacyLevel,
    DataExportFormat,
} from '@/features/security/types'

export function useSecurity() {
    const store = useSecurityStore()

    const isTwoFactorEnabled = store.twoFactor.status === 'enabled'
    const activeSessionCount = store.sessions.length

    const enableTwoFactor = useCallback(
        (provider: TwoFactorProvider) => store.enableTwoFactor(provider),
        [store]
    )

    const disableTwoFactor = useCallback(
        () => store.disableTwoFactor(),
        [store]
    )

    const revokeSession = useCallback(
        (sessionId: string) => store.revokeSession(sessionId),
        [store]
    )

    const revokeAllOtherSessions = useCallback(
        () => store.revokeAllOtherSessions(),
        [store]
    )

    const setSessionTimeout = useCallback(
        (timeout: SessionTimeout) => store.setSessionTimeout(timeout),
        [store]
    )

    const updatePrivacy = useCallback(
        (updates: Partial<PrivacySettings>) => store.updatePrivacy(updates),
        [store]
    )

    const setProfileVisibility = useCallback(
        (level: PrivacyLevel) => store.setProfileVisibility(level),
        [store]
    )

    const requestDataExport = useCallback(
        (format: DataExportFormat) => store.requestDataExport(format),
        [store]
    )

    const requestAccountDeletion = useCallback(
        () => store.requestAccountDeletion(),
        [store]
    )

    return {
        // State
        twoFactor: store.twoFactor,
        sessions: store.sessions,
        sessionTimeout: store.sessionTimeout,
        privacy: store.privacy,
        auditLog: store.auditLog,
        dataExports: store.dataExports,

        // Derived
        isTwoFactorEnabled,
        activeSessionCount,

        // Actions
        enableTwoFactor,
        disableTwoFactor,
        revokeSession,
        revokeAllOtherSessions,
        setSessionTimeout,
        updatePrivacy,
        setProfileVisibility,
        requestDataExport,
        requestAccountDeletion,
    }
}
