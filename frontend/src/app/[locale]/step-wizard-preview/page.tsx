'use client'

import { StepWizard, StepWizardDemo } from '@/components/ui/StepWizard'

export default function StepWizardPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Step Wizard Component
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A flexible progress indicator for multi-step wizards and forms.
            Display horizontal steps with circles, connecting lines, and labels.
          </p>
        </div>

        {/* Interactive Demo */}
        <StepWizardDemo />
      </div>
    </div>
  )
}
