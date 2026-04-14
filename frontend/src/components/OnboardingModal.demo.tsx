'use client';

import React, { useState } from 'react';
import { OnboardingModal } from './OnboardingModal';

/**
 * Demo page for Profile Setup Onboarding Wizard.
 * Simulates a new user (user.isNew = true) triggering the onboarding flow.
 */
export default function OnboardingDemo(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Setup Onboarding Wizard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Multi-step onboarding with Framer Motion slide transitions.
        </p>
      </div>

      {/* Trigger */}
      <div className="flex gap-3 p-6 bg-white rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          ✨ Start Onboarding
        </button>
        <p className="text-sm text-gray-500 flex items-center">
          Simulates user.isNew = true → opens wizard automatically
        </p>
      </div>

      {/* Modal */}
      <OnboardingModal
        isOpen={isOpen}
        isNew={true}
        onClose={() => setIsOpen(false)}
        onComplete={(data) => {
          console.log('[Demo] Onboarding complete:', data);
          alert(`Profile setup complete!\n\nName: ${data.displayName}\nTags: ${data.tags.join(', ')}`);
        }}
      />
    </div>
  );
}
