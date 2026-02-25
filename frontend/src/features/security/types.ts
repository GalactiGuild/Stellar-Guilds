export type TwoFactorProvider = 'authenticator' | 'sms' | 'email'

export type TwoFactorStatus = 'disabled' | 'pending' | 'enabled'

export interface TwoFactorState {
  status: TwoFactorStatus
  provider: TwoFactorProvider | null
  enabledAt: string | null
  recoveryCodes: string[]
}

export interface SessionEntry {
  id: string
  device: string
  browser: string
  location: string
  ipAddress: string
  lastActive: string
  isCurrent: boolean
}

export type SessionTimeout = 15 | 30 | 60 | 120 | 480

export type PrivacyLevel = 'public' | 'guild-only' | 'private'

export interface PrivacySettings {
  profileVisibility: PrivacyLevel
  showActivityFeed: boolean
  showReputationScore: boolean
  showGuildMemberships: boolean
  allowDirectMessages: boolean
  dataTrackingConsent: boolean
  marketingConsent: boolean
  consentUpdatedAt: string | null
}

export type AuditEventType =
  | 'login'
  | 'logout'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'session_revoked'
  | 'privacy_updated'
  | 'data_export_requested'
  | 'data_deletion_requested'
  | 'password_changed'

export interface AuditLogEntry {
  id: string
  event: AuditEventType
  description: string
  ipAddress: string
  timestamp: string
}

export type DataExportFormat = 'json' | 'csv'

export type DataExportStatus = 'idle' | 'processing' | 'ready' | 'expired'

export interface DataExportRequest {
  id: string
  format: DataExportFormat
  status: DataExportStatus
  requestedAt: string
  completedAt: string | null
}
