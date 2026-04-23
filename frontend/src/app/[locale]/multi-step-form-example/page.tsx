'use client'

import { useState } from 'react'
import { StepWizard, type Step } from '@/components/ui/StepWizard'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'

const steps: Step[] = [
  { id: 1, label: 'Info', description: 'Basic information' },
  { id: 2, label: 'Security', description: 'Security settings' },
  { id: 3, label: 'Profile', description: 'Profile setup' },
  { id: 4, label: 'Finalize', description: 'Review & submit' }
]

export default function MultiStepFormExample() {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (index: number) => {
    setCurrentStep(index)
  }

  const isComplete = currentStep === steps.length - 1

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Multi-Step Form Example
          </h1>
          <p className="text-slate-400">
            Complete all steps to finish the setup
          </p>
        </div>

        {/* Step Wizard */}
        <div className="mb-12">
          <StepWizard
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            showLabels={true}
            showDescriptions={true}
            size="lg"
          />
        </div>

        {/* Step Content */}
        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50 min-h-[400px]">
          {/* Step 1: Info */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Basic Information</h2>
              <p className="text-slate-400">
                Enter your basic information to get started.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Security */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Security Settings</h2>
              <p className="text-slate-400">
                Configure your security preferences.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Two-Factor Authentication
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-slate-300">Enable 2FA</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Profile */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Profile Setup</h2>
              <p className="text-slate-400">
                Customize your profile information.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Finalize */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Review & Submit
                </h2>
                <p className="text-slate-400">
                  Review your information and submit the form.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6 space-y-3">
                <p className="text-slate-300">
                  <strong>Name:</strong> John Doe
                </p>
                <p className="text-slate-300">
                  <strong>Email:</strong> john@example.com
                </p>
                <p className="text-slate-300">
                  <strong>2FA:</strong> Enabled
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 0}
            variant="outline"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Previous
          </Button>

          {isComplete ? (
            <Button
              onClick={() => alert('Form submitted!')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              rightIcon={<CheckCircle className="w-4 h-4" />}
            >
              Submit
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
