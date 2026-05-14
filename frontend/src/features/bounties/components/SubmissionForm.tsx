'use client';

import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { CheckCircle2, ExternalLink, Link2, Plus, Trash2, X } from 'lucide-react';

type SubmissionFormValues = {
  githubPrUrl: string;
  notes: string;
  links: { url: string }[];
};

interface SubmissionFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bountyTitle: string;
  onSubmitted: () => void;
}

export const SubmissionForm = ({
  isOpen,
  onOpenChange,
  bountyTitle,
  onSubmitted,
}: SubmissionFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SubmissionFormValues>({
    defaultValues: {
      githubPrUrl: '',
      notes: '',
      links: [{ url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'links',
  });

  const [step, setStep] = React.useState<'details' | 'confirm'>('details');
  const values = watch();

  const closeDrawer = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setStep('details');
    }
  };

  const submit = (data: SubmissionFormValues) => {
    console.log('Bounty submission', {
      ...data,
      links: data.links.map((link) => link.url).filter(Boolean),
    });
    reset();
    setStep('details');
    onOpenChange(false);
    onSubmitted();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={closeDrawer}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-slate-800 bg-slate-950 text-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-800 p-6">
            <div>
              <Dialog.Title className="text-xl font-black uppercase tracking-tight">
                Submit Bounty Work
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-slate-400">
                {bountyTitle}
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white">
              <X size={20} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-4 text-xs font-black uppercase tracking-widest">
              <StepBadge active={step === 'details'} complete={step === 'confirm'}>
                1
              </StepBadge>
              <span className={step === 'details' ? 'text-white' : 'text-slate-500'}>
                Proof
              </span>
              <div className="h-px flex-1 bg-slate-800" />
              <StepBadge active={step === 'confirm'}>2</StepBadge>
              <span className={step === 'confirm' ? 'text-white' : 'text-slate-500'}>
                Confirm
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {step === 'details' ? (
                <div className="space-y-6">
                  <FieldLabel htmlFor="githubPrUrl" label="GitHub PR URL" />
                  <div>
                    <div className="relative">
                      <ExternalLink
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400"
                      />
                      <input
                        id="githubPrUrl"
                        className="w-full rounded-xl border border-slate-800 bg-white/5 py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-slate-600 focus:border-violet-500"
                        placeholder="https://github.com/org/repo/pull/123"
                        {...register('githubPrUrl', {
                          required: 'GitHub PR URL is required.',
                          pattern: {
                            value: /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+\/?$/,
                            message: 'Enter a valid GitHub pull request URL.',
                          },
                        })}
                      />
                    </div>
                    {errors.githubPrUrl && (
                      <p className="mt-2 text-xs text-red-400">
                        {errors.githubPrUrl.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <FieldLabel htmlFor="notes" label="Additional Notes" />
                    <textarea
                      id="notes"
                      rows={5}
                      className="mt-2 w-full resize-none rounded-xl border border-slate-800 bg-white/5 p-4 text-sm outline-none transition-colors placeholder:text-slate-600 focus:border-violet-500"
                      placeholder="Summarize what changed, how it was verified, and anything reviewers should know."
                      {...register('notes')}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FieldLabel label="External Links" />
                      <button
                        type="button"
                        onClick={() => append({ url: '' })}
                        className="inline-flex items-center gap-2 rounded-lg border border-violet-500/30 px-3 py-2 text-xs font-bold uppercase tracking-widest text-violet-300 transition-colors hover:bg-violet-500/10"
                      >
                        <Plus size={14} />
                        Add Link
                      </button>
                    </div>

                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <div className="relative flex-1">
                          <Link2
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                          />
                          <input
                            className="w-full rounded-xl border border-slate-800 bg-white/5 py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-slate-600 focus:border-violet-500"
                            placeholder="Docs, demo, screenshots, or deployment URL"
                            {...register(`links.${index}.url` as const)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="rounded-xl border border-slate-800 px-3 text-slate-500 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Remove external link"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
                    <div className="mb-3 flex items-center gap-2 text-violet-300">
                      <CheckCircle2 size={18} />
                      <h3 className="text-sm font-black uppercase tracking-widest">
                        Review Before Submission
                      </h3>
                    </div>
                    <p className="text-sm leading-6 text-slate-300">
                      This records your proof for guild review. Confirm only after the PR and
                      supporting links are final.
                    </p>
                  </div>

                  <ReviewRow label="GitHub PR URL" value={values.githubPrUrl} />
                  <ReviewRow label="Notes" value={values.notes || 'No notes provided.'} />
                  <ReviewRow
                    label="External Links"
                    value={
                      values.links.map((link) => link.url).filter(Boolean).join('\n') ||
                      'No external links provided.'
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-800 p-6">
              <button
                type="button"
                onClick={() => (step === 'confirm' ? setStep('details') : closeDrawer(false))}
                className="rounded-xl border border-slate-800 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                {step === 'confirm' ? 'Back' : 'Cancel'}
              </button>

              {step === 'details' ? (
                <button
                  type="button"
                  onClick={handleSubmit(() => setStep('confirm'))}
                  className="rounded-xl bg-violet-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-violet-400"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-violet-200"
                >
                  Confirm Submission
                </button>
              )}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const FieldLabel = ({ htmlFor, label }: { htmlFor?: string; label: string }) => (
  <label
    htmlFor={htmlFor}
    className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500"
  >
    {label}
  </label>
);

const StepBadge = ({
  active,
  complete,
  children,
}: {
  active: boolean;
  complete?: boolean;
  children: React.ReactNode;
}) => (
  <span
    className={[
      'grid h-7 w-7 place-items-center rounded-full border text-[10px]',
      active
        ? 'border-violet-400 bg-violet-500 text-black'
        : complete
          ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
          : 'border-slate-800 text-slate-500',
    ].join(' ')}
  >
    {children}
  </span>
);

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-800 bg-white/[0.03] p-4">
    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
      {label}
    </p>
    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
      {value}
    </p>
  </div>
);
