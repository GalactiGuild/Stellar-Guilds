'use client'

import React from 'react'
import { AlertTriangle, CheckCircle2, Info, Sparkles } from 'lucide-react'
import { useAppToast } from '@/hooks/useAppToast'

export default function ToastSandboxPage() {
  const appToast = useAppToast()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 rounded-[32px] border border-violet-500/20 bg-slate-900/80 p-8 shadow-[0_0_60px_rgba(139,92,246,0.08)]">
          <div className="mb-4 flex items-center gap-3 text-violet-300">
            <Sparkles size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.35em]">
              Toast Sandbox
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Notification Toast Manager</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
            Trigger standardized success, error, and info notifications using the global Sonner provider.
            Each toast uses the shared 4-second timeout and dark Stellar Guilds styling.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ToastButton
            icon={<CheckCircle2 size={20} />}
            title="Success"
            description="Simulate a copied key or submitted form."
            className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            onClick={() =>
              appToast.success('Action completed', {
                description: 'Your changes were saved successfully.',
              })
            }
          />
          <ToastButton
            icon={<AlertTriangle size={20} />}
            title="Error"
            description="Simulate a validation or network failure."
            className="border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
            onClick={() =>
              appToast.error('Action failed', {
                description: 'Please check the request and try again.',
              })
            }
          />
          <ToastButton
            icon={<Info size={20} />}
            title="Info"
            description="Simulate neutral non-blocking feedback."
            className="border-sky-500/20 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
            onClick={() =>
              appToast.info('Heads up', {
                description: 'This is an informational notification.',
              })
            }
          />
        </div>
      </div>
    </main>
  )
}

function ToastButton({
  icon,
  title,
  description,
  className,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  className: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-6 text-left transition-all ${className}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20">
        {icon}
      </div>
      <h2 className="text-xl font-black text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </button>
  )
}
