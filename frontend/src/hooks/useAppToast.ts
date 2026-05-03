'use client'

import { toast } from 'sonner'

const DEFAULT_DURATION_MS = 4000

export type AppToastOptions = {
  description?: string
  duration?: number
}

export function useAppToast() {
  return {
    success: (message: string, options?: AppToastOptions) =>
      toast.success(message, {
        description: options?.description,
        duration: options?.duration ?? DEFAULT_DURATION_MS,
      }),
    error: (message: string, options?: AppToastOptions) =>
      toast.error(message, {
        description: options?.description,
        duration: options?.duration ?? DEFAULT_DURATION_MS,
      }),
    info: (message: string, options?: AppToastOptions) =>
      toast.info(message, {
        description: options?.description,
        duration: options?.duration ?? DEFAULT_DURATION_MS,
      }),
  }
}
