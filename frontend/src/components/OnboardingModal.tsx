'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  User,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ---------- Types ---------- */

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => complete;
  /** If true, the onboarding modal renders */
  isNew?: boolean;
  onComplete?: (data: OnboardingData) => void;
}

interface OnboardingData {
  displayName: string;
  avatar: File | null;
  tags: string[];
}

/* ---------- Tags ---------- */

const availableTags = [
  'Rust',
  'Design',
  'Marketing',
  'TypeScript',
  'Smart Contracts',
  'DevOps',
  'UI/UX',
  'Community',
  'Writing',
  'Security',
];

const MAX_DISPLAY_NAME_LENGTH = 30;
const MAX_TAGS = 3;

/* ---------- Step Config ---------- */

const steps = [
  { id: 1, label: 'Display Name', icon: User },
  { id: 2, label: 'Avatar', icon: Upload },
  { id: 3, label: 'Interests', icon: Sparkles },
] as const;

/* ---------- Animation Variants ---------- */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

/* ---------- Component ---------- */

/**
 * Profile Setup Onboarding Wizard
 *
 * Multi-step modal for first-time user profile setup.
 * Steps: Display Name → Avatar Upload → Tag Selection
 * Uses Framer Motion AnimatePresence with X-axis slide transitions.
 */
export function OnboardingModal({
  isOpen,
  onClose,
  isNew = true,
  onComplete,
}: OnboardingModalProps): JSX.Element | null {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!isOpen || !isNew) return null;

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return displayName.trim().length >= 2;
      case 1:
        return true; // Avatar is optional
      case 2:
        return selectedTags.length >= MAX_TAGS;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete
      onComplete?.({ displayName, avatar, tags: selectedTags });
      console.log('[Onboarding] Complete:', { displayName, avatar, tags: selectedTags });
      onClose();
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < MAX_TAGS
          ? [...prev, tag]
          : prev,
    );
  };

  /* ---- Step 1: Display Name ---- */
  const stepDisplayName = (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          What&apos;s your name?
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          This is how others will see you on the platform.
        </p>
      </div>
      <div>
        <label
          htmlFor="display-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Display Name
        </label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) =>
            setDisplayName(e.target.value.slice(0, MAX_DISPLAY_NAME_LENGTH))
          }
          placeholder="Enter your display name"
          maxLength={MAX_DISPLAY_NAME_LENGTH}
          autoFocus
          className={cn(
            'w-full rounded-xl border px-4 py-3 text-base outline-none transition-all',
            'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-white',
          )}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400">
            {displayName.length === 0
              ? 'At least 2 characters'
              : displayName.length < 2
                ? `Need ${2 - displayName.length} more`
                : '✓ Looks good'}
          </span>
          <span className="text-xs text-gray-400">
            {displayName.length}/{MAX_DISPLAY_NAME_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );

  /* ---- Step 2: Avatar Upload ---- */
  const stepAvatar = (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Add a photo
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Help others recognize you. You can skip this for now.
        </p>
      </div>
      <div className="flex justify-center">
        <label
          className={cn(
            'relative flex flex-col items-center justify-center w-36 h-36 rounded-full cursor-pointer transition-colors',
            avatar
              ? 'bg-blue-50 border-2 border-blue-300'
              : 'bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50',
            'dark:bg-gray-800 dark:border-gray-600',
          )}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setAvatar(file);
            }}
          />
          {avatar ? (
            <img
              src={URL.createObjectURL(avatar)}
              alt="Avatar preview"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Upload size={28} />
              <span className="text-xs font-medium">Upload Photo</span>
            </div>
          )}
        </label>
      </div>
      {avatar && (
        <p className="text-center text-xs text-gray-500">
          {avatar.name} ({(avatar.size / 1024).toFixed(1)} KB)
        </p>
      )}
    </div>
  );

  /* ---- Step 3: Tag Selection ---- */
  const stepTags = (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          What are you into?
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Pick {MAX_TAGS} topics to personalize your experience.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const isDisabled = !isSelected && selectedTags.length >= MAX_TAGS;
          return (
            <button
              key={tag}
              type="button"
              disabled={isDisabled}
              onClick={() => toggleTag(tag)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30'
                  : isDisabled
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
              )}
            >
              {isSelected && <Check size={14} className="inline mr-1" />}
              {tag}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400">
        {selectedTags.length}/{MAX_TAGS} selected
        {selectedTags.length < MAX_TAGS &&
          ` — pick ${MAX_TAGS - selectedTags.length} more`}
      </p>
    </div>
  );

  const stepContent = [stepDisplayName, stepAvatar, stepTags][currentStep];

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {}}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden dark:bg-gray-900">
        {/* Progress bar */}
        <div className="flex h-1 bg-gray-100 dark:bg-gray-800">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 transition-colors duration-300',
                i <= currentStep ? 'bg-blue-600' : 'bg-transparent',
              )}
            />
          ))}
        </div>

        {/* Content area */}
        <div className="p-8 min-h-[360px] relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {stepContent}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-8 pb-8 pt-2">
          <button
            onClick={goBack}
            disabled={currentStep === 0}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              currentStep === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800',
            )}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Step indicators */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  i === currentStep
                    ? 'bg-blue-600'
                    : i < currentStep
                      ? 'bg-blue-300'
                      : 'bg-gray-200 dark:bg-gray-700',
                )}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={!canGoNext()}
            className={cn(
              'inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-lg transition-colors',
              canGoNext()
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600',
            )}
          >
            {isLastStep ? (
              <>
                <Check size={16} /> Complete
              </>
            ) : (
              <>
                Next <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
