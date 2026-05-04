'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CopyableKeyProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  publicKey: string
  leadingChars?: number
  trailingChars?: number
}

function truncatePublicKey(
  publicKey: string,
  leadingChars: number,
  trailingChars: number
): string {
  if (publicKey.length <= leadingChars + trailingChars + 3) {
    return publicKey
  }

  return `${publicKey.slice(0, leadingChars)}...${publicKey.slice(-trailingChars)}`
}

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

export function CopyableKey({
  publicKey,
  leadingChars = 6,
  trailingChars = 6,
  className,
  disabled,
  onClick,
  ...props
}: CopyableKeyProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const displayKey = useMemo(
    () => truncatePublicKey(publicKey, leadingChars, trailingChars),
    [leadingChars, publicKey, trailingChars]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)

    if (event.defaultPrevented || disabled) {
      return
    }

    try {
      await copyText(publicKey)
      setCopied(true)
      toast.success('Address Copied!')

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setCopied(false)
        timeoutRef.current = null
      }, 2000)
    } catch {
      toast.error('Unable to copy address')
    }
  }

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-mono text-sm text-stellar-lightSlate transition-colors',
        'hover:text-stellar-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stellar-darkNavy',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      disabled={disabled}
      title={publicKey}
      aria-label="Copy public key"
      onClick={handleCopy}
      {...props}
    >
      <span>{displayKey}</span>
      {copied ? (
        <Check aria-hidden="true" className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy aria-hidden="true" className="h-4 w-4 text-stellar-slate" />
      )}
    </button>
  )
}
