'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Copy, Link as LinkIcon, Trash2, UserPlus } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { useGuildStore } from '@/store/guildStore'
import { GuildForm } from '@/features/guilds/components/GuildForm'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { CreateGuildFormData } from '@/features/guilds/types'

const INVITE_STORAGE_PREFIX = 'stellar-guild-invite:'

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, value.length)

  try {
    const copied = document.execCommand('copy')
    if (!copied) {
      throw new Error('Copy command was rejected')
    }
  } finally {
    document.body.removeChild(textarea)
  }
}

function createInviteId(): string {
  if (crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

export default function GuildSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const guildId = params.id as string
  const { currentGuild, fetchGuildById, updateGuild, isLoading } = useGuildStore()
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copiedInviteLink, setCopiedInviteLink] = useState(false)

  useEffect(() => {
    if (guildId) {
      fetchGuildById(guildId)
    }
  }, [guildId, fetchGuildById])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading guild settings...</p>
        </div>
      </div>
    )
  }

  if (!currentGuild) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Guild Not Found
          </h2>
          <p className="text-slate-400 mb-4">
            The guild you&apos;re looking for doesn&apos;t exist
          </p>
          <Link href="/guilds">
            <Button variant="primary">Back to Guilds</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: CreateGuildFormData) => {
    setIsSaving(true)

    try {
      updateGuild(guildId, data)
      setShowSuccessMessage(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    } catch (error) {
      console.error('Failed to update guild:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteGuild = () => {
    // Simulate delete - in production this would call an API
    console.log('Deleting guild:', guildId)
    setShowDeleteModal(false)
    router.push('/guilds')
  }

  const handleGenerateInviteLink = () => {
    const inviteId = createInviteId()
    const nextInviteLink = `https://stellar-guilds.com/invite/${inviteId}`

    localStorage.setItem(
      `${INVITE_STORAGE_PREFIX}${inviteId}`,
      JSON.stringify({ guildId, guildName: currentGuild.name, createdAt: new Date().toISOString() })
    )
    setInviteLink(nextInviteLink)
    setCopiedInviteLink(false)
  }

  const handleCopyInviteLink = async () => {
    if (!inviteLink) return

    try {
      await copyText(inviteLink)
      setCopiedInviteLink(true)
      toast.success('Invite link copied!')
      setTimeout(() => setCopiedInviteLink(false), 2000)
    } catch {
      toast.error('Unable to copy invite link')
    }
  }

  const initialData: Partial<CreateGuildFormData> = {
    name: currentGuild.name,
    description: currentGuild.description,
    logo: currentGuild.logo || '',
    category: currentGuild.category
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Toaster theme="dark" position="bottom-right" richColors />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href={`/guilds/${guildId}`}>
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} className="mb-6">
            Back to Guild
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Guild Settings
          </h1>
          <p className="text-slate-400">
            Manage your guild&apos;s information and preferences
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200 font-medium">
              Guild settings updated successfully!
            </p>
          </div>
        )}

        {/* Invite Members */}
        <div className="bg-slate-900/40 rounded-lg shadow-sm border border-slate-800/50 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Invite Members
              </h2>
              <p className="text-sm text-slate-400">
                Generate a mock invite link that new members can use to join this guild.
              </p>
            </div>
            <Button
              variant="secondary"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={handleGenerateInviteLink}
            >
              Invite Member
            </Button>
          </div>

          {inviteLink && (
            <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <LinkIcon className="h-4 w-4" />
                Share this invite link
              </div>
              <div className="flex items-center gap-3">
                <code className="min-w-0 flex-1 truncate rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-200">
                  {inviteLink}
                </code>
                <Button
                  variant="outline"
                  leftIcon={
                    copiedInviteLink ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )
                  }
                  onClick={handleCopyInviteLink}
                >
                  Copy Link
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Form */}
        <div className="bg-slate-900/40 rounded-lg shadow-sm border border-slate-800/50 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Basic Information
          </h2>
          <GuildForm
            onSubmit={handleSubmit}
            initialData={initialData}
            isLoading={isSaving}
            submitLabel="Save Changes"
          />
        </div>

        {/* Danger Zone */}
        <div className="bg-slate-900/40 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
            Danger Zone
          </h2>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-white mb-1">
                Delete Guild
              </h3>
              <p className="text-sm text-slate-400">
                Once you delete a guild, there is no going back. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Guild
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Guild"
        >
          <div className="space-y-4">
            <p className="text-slate-400">
              Are you sure you want to delete <strong>{currentGuild.name}</strong>? This action
              cannot be undone and all guild data will be permanently removed.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                This will permanently delete:
              </h4>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                <li>• All guild members and roles</li>
                <li>• Guild activity history</li>
                <li>• All associated bounties</li>
                <li>• Guild reputation and stats</li>
              </ul>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteGuild}
                className="flex-1"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
