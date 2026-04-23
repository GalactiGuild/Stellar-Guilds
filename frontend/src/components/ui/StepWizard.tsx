'use client'

import { Check } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export interface Step {
  id: string | number
  label: string
  description?: string
}

export interface StepWizardProps {
  steps: Step[]
  currentStep: number | string
  onStepClick?: (stepIndex: number) => void
  className?: string
  showLabels?: boolean
  showDescriptions?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/**
 * StepWizard - A horizontal progress indicator for multi-step wizards
 * 
 * Features:
 * - Displays circles for each step connected by horizontal lines
 * - Highlights completed steps with checkmarks
 * - Highlights active step with distinct styling
 * - Shows labels and optional descriptions below each step
 * - Clickable steps (optional) for navigation
 * - Responsive and flexible sizing
 */
export function StepWizard({
  steps,
  currentStep,
  onStepClick,
  className = '',
  showLabels = true,
  showDescriptions = false,
  size = 'md'
}: StepWizardProps) {
  // Find the index of the current step
  const currentStepIndex = typeof currentStep === 'number'
    ? currentStep
    : steps.findIndex(s => s.id === currentStep)

  // Size configurations
  const sizeConfig = {
    sm: {
      circle: 'w-6 h-6',
      icon: 'w-3 h-3',
      text: 'text-xs',
      line: 'h-0.5'
    },
    md: {
      circle: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-sm',
      line: 'h-0.5'
    },
    lg: {
      circle: 'w-10 h-10',
      icon: 'w-5 h-5',
      text: 'text-base',
      line: 'h-1'
    }
  }

  const config = sizeConfig[size]

  return (
    <div className={twMerge('w-full', className)}>
      <div className="flex items-start justify-between relative">
        {/* Background line (connects all steps) */}
        <div
          className={twMerge(
            'absolute bg-slate-700 -z-10',
            config.line,
            size === 'sm' ? 'top-3' : size === 'md' ? 'top-4' : 'top-5'
          )}
          style={{
            left: `calc(${config.circle.split(' ')[0].replace('w-', '') === 'w-6' ? '12px' : config.circle.split(' ')[0].replace('w-', '') === 'w-8' ? '16px' : '20px'} / 2)`,
            right: `calc(${config.circle.split(' ')[0].replace('w-', '') === 'w-6' ? '12px' : config.circle.split(' ')[0].replace('w-', '') === 'w-8' ? '16px' : '20px'} / 2)`,
          }}
        />

        {/* Progress line (completed steps) */}
        <div
          className={twMerge(
            'absolute bg-gradient-to-r from-indigo-500 to-purple-500 -z-10',
            config.line,
            size === 'sm' ? 'top-3' : size === 'md' ? 'top-4' : 'top-5'
          )}
          style={{
            left: `calc(${config.circle.split(' ')[0].replace('w-', '') === 'w-6' ? '12px' : config.circle.split(' ')[0].replace('w-', '') === 'w-8' ? '16px' : '20px'} / 2)`,
            width: steps.length > 1
              ? `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - ${config.circle.split(' ')[0].replace('w-', '') === 'w-6' ? '12px' : config.circle.split(' ')[0].replace('w-', '') === 'w-8' ? '16px' : '20px'})`
              : '0px'
          }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isPending = index > currentStepIndex
          const isClickable = onStepClick && (isCompleted || isCurrent)

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10 flex-1 last:flex-none"
            >
              {/* Circle */}
              <button
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={twMerge(
                  'rounded-full flex items-center justify-center font-semibold transition-all duration-300',
                  config.circle,
                  isCompleted && 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30',
                  isCurrent && 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 ring-4 ring-indigo-600/20',
                  isPending && 'bg-slate-800 text-slate-400 border-2 border-slate-600',
                  isClickable && 'cursor-pointer hover:scale-110',
                  !isClickable && 'cursor-default'
                )}
              >
                {isCompleted ? (
                  <Check className={config.icon} />
                ) : (
                  <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}>
                    {index + 1}
                  </span>
                )}
              </button>

              {/* Label and Description */}
              {showLabels && (
                <div className="mt-3 text-center max-w-[100px]">
                  <p
                    className={twMerge(
                      'font-medium',
                      config.text,
                      isCurrent && 'text-indigo-400',
                      isCompleted && 'text-slate-200',
                      isPending && 'text-slate-500'
                    )}
                  >
                    {step.label}
                  </p>
                  {showDescriptions && step.description && (
                    <p className={twMerge(
                      'mt-1 text-slate-500',
                      size === 'sm' ? 'text-xs' : 'text-xs'
                    )}>
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * StepWizardDemo - Demonstrates all variants of the StepWizard component
 */
export function StepWizardDemo() {
  const demoSteps: Step[] = [
    { id: 1, label: 'Info', description: 'Basic information' },
    { id: 2, label: 'Security', description: 'Security settings' },
    { id: 3, label: 'Profile', description: 'Profile setup' },
    { id: 4, label: 'Finalize', description: 'Review & submit' }
  ]

  return (
    <div className="space-y-12">
      <h2 className="text-2xl font-bold text-white text-center">
        Step Wizard Component
      </h2>

      {/* Default variant */}
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
        <h3 className="text-lg font-semibold text-white mb-6">
          Default (Medium, with labels)
        </h3>
        <StepWizard
          steps={demoSteps}
          currentStep={2}
          showLabels={true}
          size="md"
        />
      </div>

      {/* Small variant */}
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
        <h3 className="text-lg font-semibold text-white mb-6">
          Small Size
        </h3>
        <StepWizard
          steps={demoSteps}
          currentStep={2}
          showLabels={true}
          size="sm"
        />
      </div>

      {/* Large variant with descriptions */}
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
        <h3 className="text-lg font-semibold text-white mb-6">
          Large Size with Descriptions
        </h3>
        <StepWizard
          steps={demoSteps}
          currentStep={2}
          showLabels={true}
          showDescriptions={true}
          size="lg"
        />
      </div>

      {/* Clickable steps */}
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
        <h3 className="text-lg font-semibold text-white mb-6">
          Clickable Steps (hover over completed/current)
        </h3>
        <StepWizard
          steps={demoSteps}
          currentStep={2}
          onStepClick={(index) => console.log('Navigate to step:', index)}
          showLabels={true}
          size="md"
        />
      </div>

      {/* Different step states */}
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
        <h3 className="text-lg font-semibold text-white mb-6">
          Different States (Step 1, 2, 4)
        </h3>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate-400 mb-2">Step 1 (First step):</p>
            <StepWizard steps={demoSteps} currentStep={0} size="md" />
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Step 2 (Middle):</p>
            <StepWizard steps={demoSteps} currentStep={1} size="md" />
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Step 4 (Last step):</p>
            <StepWizard steps={demoSteps} currentStep={3} size="md" />
          </div>
        </div>
      </div>

      {/* Minimal (no labels) */}
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
        <h3 className="text-lg font-semibold text-white mb-6">
          Minimal (No Labels)
        </h3>
        <StepWizard
          steps={demoSteps}
          currentStep={2}
          showLabels={false}
          size="md"
        />
      </div>

      {/* Usage Example */}
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
        <h3 className="text-xl font-bold text-white mb-4">
          Quick Start
        </h3>
        <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm">
          <code className="text-slate-300">{`import { StepWizard } from '@/components/ui/StepWizard'

const steps = [
  { id: 1, label: 'Info' },
  { id: 2, label: 'Security' },
  { id: 3, label: 'Profile' },
  { id: 4, label: 'Finalize' }
]

// Basic usage
<StepWizard 
  steps={steps} 
  currentStep={2} 
/>

// With navigation
<StepWizard 
  steps={steps} 
  currentStep={currentStep}
  onStepClick={(index) => setCurrentStep(index)}
/>

// Full featured
<StepWizard 
  steps={steps} 
  currentStep={2}
  showLabels={true}
  showDescriptions={true}
  size="lg"
  onStepClick={handleStepClick}
/>`}</code>
        </pre>
      </div>
    </div>
  )
}
