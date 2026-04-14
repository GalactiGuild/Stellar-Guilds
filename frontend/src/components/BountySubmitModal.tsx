'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, watch } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Plus, Trash2, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BountySubmissionForm {
  prUrl: string;
  notes: string;
  externalLinks: { url: string }[];
}

type Step = 'form' | 'confirm' | 'success';

interface BountySubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  bountyTitle?: string;
}

/**
 * Interactive Bounty Submission UI Flow
 *
 * Multi-step modal form for submitting bounty completion proof.
 * Uses react-hook-form with useFieldArray for dynamic link management.
 * Steps: Form → Confirmation → Success
 */
export function BountySubmitModal({
  isOpen,
  onClose,
  bountyTitle = 'Open Bounty',
}: BountySubmitModalProps): JSX.Element {
  const [step, setStep] = useState<Step>('form');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch: watchFn,
    reset,
  } = useForm<BountySubmissionForm>({
    defaultValues: {
      prUrl: '',
      notes: '',
      externalLinks: [{ url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'externalLinks',
  });

  // Watch values for confirmation step
  const watchedPrUrl = watchFn('prUrl');
  const watchedNotes = watchFn('notes');
  const watchedLinks = watchFn('externalLinks');

  const onSubmit = (data: BountySubmissionForm) => {
    console.log('[BountySubmit] Submission data:', data);
    setStep('confirm');
  };

  const confirmSubmission = () => {
    console.log('[BountySubmit] Confirmed and submitted!');
    setStep('success');
  };

  const handleClose = () => {
    setStep('form');
    reset();
    onClose();
  };

  // Success state
  if (step === 'success') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Submission Received" size="sm">
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Thank you!
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Your bounty submission has been received. Guild admins will review
            your PR and get back to you soon.
          </p>
          <button
            onClick={handleClose}
            className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 'confirm' ? 'Confirm Submission' : `Submit: ${bountyTitle}`
      }
      size="lg"
    >
      {step === 'form' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-2">
          {/* GitHub PR URL */}
          <div>
            <label htmlFor="pr-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              GitHub PR URL <span className="text-red-500">*</span>
            </label>
            <input
              id="pr-url"
              type="url"
              placeholder="https://github.com/owner/repo/pull/123"
              {...register('prUrl', {
                required: 'PR URL is required',
                pattern: {
                  value: /^https:\/\/github\.com\/.+\/.+\/pull\/\d+/i,
                  message: 'Please enter a valid GitHub PR URL',
                },
              })}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white',
                errors.prUrl
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500',
              )}
            />
            {errors.prUrl && (
              <p className="mt-1 text-xs text-red-500">{errors.prUrl.message}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Additional Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Describe what you implemented and any relevant details..."
              {...register('notes')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none"
            />
          </div>

          {/* Dynamic External Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                External Links
              </label>
              <button
                type="button"
                onClick={() => append({ url: '' })}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus size={14} /> Add Link
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    {...register(`externalLinks.${index}.url`)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove link"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Send size={16} /> Review Submission
            </button>
          </div>
        </form>
      ) : (
        /* Confirmation step */
        <div className="p-2 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 dark:bg-amber-900/10 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              ⚠️ Are you sure? Once submitted, this cannot be edited.
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-medium">PR URL:</span>{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs dark:bg-gray-800 break-all">
                {watchedPrUrl || '—'}
              </code>
            </p>
            <p>
              <span className="font-medium">Notes:</span> {watchedNotes || '—'}
            </p>
            <p>
              <span className="font-medium">External Links:</span>{' '}
              {watchedLinks?.filter((l) => l.url).length || 0} link(s)
            </p>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep('form')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={confirmSubmission}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium inline-flex items-center gap-1.5"
            >
              <CheckCircle2 size={16} /> Confirm & Submit
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
