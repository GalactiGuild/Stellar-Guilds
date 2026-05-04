'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const INVITE_STORAGE_PREFIX = 'stellar-guild-invite:'

interface StoredInvite {
  guildId: string
  guildName: string
  createdAt: string
}

export default function InvitePage() {
  const params = useParams()
  const inviteId = params.id as string
  const [invite, setInvite] = useState<StoredInvite | null>(null)
  const [hasCheckedInvite, setHasCheckedInvite] = useState(false)

  useEffect(() => {
    const storedInvite = localStorage.getItem(`${INVITE_STORAGE_PREFIX}${inviteId}`)

    if (storedInvite) {
      try {
        setInvite(JSON.parse(storedInvite) as StoredInvite)
      } catch {
        setInvite(null)
      }
    }

    setHasCheckedInvite(true)
  }, [inviteId])

  const guildName = invite?.guildName ?? 'this guild'

  const handleJoin = () => {
    console.log('Joining guild from invite:', {
      inviteId,
      guildId: invite?.guildId,
      guildName,
    })
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
          <UserPlus className="h-7 w-7" />
        </div>

        <p className="mb-3 text-sm uppercase tracking-[0.25em] text-slate-500">
          Guild Invitation
        </p>
        <h1 className="mb-4 text-3xl font-bold text-white">
          You have been invited to join {guildName}
        </h1>
        <p className="mb-8 text-slate-400">
          {hasCheckedInvite && invite
            ? 'This mock invite was generated locally from Guild Settings.'
            : 'This mock invite can be validated locally once the generator stores its guild details in this browser.'}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={handleJoin} leftIcon={<UserPlus className="h-4 w-4" />}>
            Join
          </Button>
          <Link href="/guilds">
            <Button variant="outline">Browse Guilds</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
