'use client';

import React, { useState } from 'react';
import { BountySubmitModal } from './BountySubmitModal';

/**
 * Demo page for Bounty Submission UI Flow.
 * Shows a button that opens the submission modal.
 */
export default function BountySubmitDemo(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Interactive Bounty Submission
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Multi-step form with dynamic link management and confirmation step.
        </p>
      </div>

      {/* Trigger button */}
      <div className="flex gap-3 p-6 bg-white rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          📝 Open Submission Form
        </button>
        <p className="text-sm text-gray-500 flex items-center">
          Click to open the bounty submission modal
        </p>
      </div>

      {/* The modal */}
      <BountySubmitModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        bountyTitle="Implement User Authentication"
      />
    </div>
  );
}
