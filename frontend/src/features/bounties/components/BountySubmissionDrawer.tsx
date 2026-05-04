'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, ExternalLink, FileText, Plus, Send, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

const submissionSchema = z.object({
  githubPrUrl: z.string().url('Enter a valid GitHub PR URL'),
  notes: z.string().min(1, 'Additional notes are required'),
  externalLinks: z
    .array(
      z.object({
        url: z.string().url('Enter a valid URL'),
      })
    )
    .default([]),
})

type SubmissionFormData = z.infer<typeof submissionSchema>

interface BountySubmissionDrawerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  bountyTitle?: string
}

export function BountySubmissionDrawer({
  isOpen,
  onOpenChange,
  bountyTitle = 'Selected bounty',
}: BountySubmissionDrawerProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      githubPrUrl: '',
      notes: '',
      externalLinks: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'externalLinks',
  })

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen)

    if (!nextOpen) {
      setIsConfirming(false)
      reset()
    }
  }

  const onSubmit = async (data: SubmissionFormData) => {
    console.log('Bounty submission proof:', {
      bountyTitle,
      ...data,
    })
    handleClose(false)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-slate-800 bg-slate-950 shadow-2xl shadow-black/40 focus:outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-6">
            <div>
              <Dialog.Title className="text-2xl font-bold text-white">
                Submit Bounty Proof
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-slate-400">
                Share completion evidence for <span className="text-slate-200">{bountyTitle}</span>.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-md p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white" aria-label="Close submission drawer">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {!isConfirming ? (
                <>
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-200">
                      <FileText className="h-4 w-4" />
                      Submission Evidence
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      Add your PR, notes, and any external resources guild admins should review.
                    </p>
                  </div>

                  <Input
                    {...register('githubPrUrl')}
                    type="url"
                    label="GitHub PR URL"
                    placeholder="https://github.com/org/repo/pull/123"
                    error={errors.githubPrUrl?.message}
                  />

                  <Textarea
                    {...register('notes')}
                    label="Additional Notes"
                    placeholder="Summarize what changed, how it was tested, and anything reviewers should know."
                    rows={6}
                    error={errors.notes?.message}
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-medium text-stellar-slate">External Links</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        leftIcon={<Plus className="h-4 w-4" />}
                        onClick={() => append({ url: '' })}
                      >
                        Add Link
                      </Button>
                    </div>

                    {fields.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-slate-700 px-4 py-3 text-sm text-slate-500">
                        No extra links yet. Add docs, demos, test logs, or deployment previews if useful.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex items-start gap-2">
                            <div className="flex-1">
                              <Input
                                {...register(`externalLinks.${index}.url`)}
                                type="url"
                                placeholder="https://..."
                                error={errors.externalLinks?.[index]?.url?.message}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="mt-1 text-red-300 hover:text-red-200"
                              onClick={() => remove(index)}
                              aria-label="Remove link"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                  <div className="flex items-center gap-3 text-amber-200">
                    <CheckCircle2 className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">Are you sure?</h3>
                  </div>
                  <p className="text-sm text-slate-300">
                    This is the final review step before submitting your bounty proof. Confirm the PR URL and notes are complete.
                  </p>
                  <div className="space-y-2 rounded-lg bg-slate-950/60 p-4 text-sm text-slate-300">
                    <p className="flex items-center gap-2 truncate">
                      <ExternalLink className="h-4 w-4 text-amber-300" />
                      {getValues('githubPrUrl') || 'No PR URL provided'}
                    </p>
                    <p className="line-clamp-4 whitespace-pre-wrap text-slate-400">
                      {getValues('notes') || 'No notes provided'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-800 p-6">
              {isConfirming ? (
                <>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsConfirming(false)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" leftIcon={<Send className="h-4 w-4" />} isLoading={isSubmitting}>
                    Confirm Submit
                  </Button>
                </>
              ) : (
                <>
                  <Dialog.Close asChild>
                    <Button type="button" variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </Dialog.Close>
                  <Button type="button" className="flex-1" onClick={() => setIsConfirming(true)}>
                    Review Submission
                  </Button>
                </>
              )}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
