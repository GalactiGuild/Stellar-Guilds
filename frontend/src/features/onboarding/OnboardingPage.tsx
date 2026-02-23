'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import OnboardingProgressIndicator from './components/OnboardingProgressIndicator';
import WelcomeStep from './components/WelcomeStep';
import WalletSetupStep from './components/WalletSetupStep';
import ProfileSetupStep from './components/ProfileSetupStep';
import GuildsIntroductionStep from './components/GuildsIntroductionStep';
import BountiesIntroductionStep from './components/BountiesIntroductionStep';
import CompletionStep from './components/CompletionStep';

const OnboardingPage = () => {
  const { currentStep, isOnboardingComplete, initializeOnboarding } = useOnboardingStore();

  useEffect(() => {
    initializeOnboarding();
  }, [initializeOnboarding]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep />;
      case 'wallet':
        return <WalletSetupStep />;
      case 'profile':
        return <ProfileSetupStep />;
      case 'guilds':
        return <GuildsIntroductionStep />;
      case 'bounties':
        return <BountiesIntroductionStep />;
      case 'completed':
        return <CompletionStep />;
      default:
        return <WelcomeStep />;
    }
  };

  if (isOnboardingComplete) {
    // If onboarding is complete, redirect or show completion screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-stellar-navy via-stellar-darkNavy to-stellar-lightNavy flex items-center justify-center p-4">
        <CompletionStep />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stellar-navy via-stellar-darkNavy to-stellar-lightNavy flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <OnboardingProgressIndicator />

        <p className="text-xl text-stellar-slate max-w-2xl mx-auto">
          We&apos;re excited to have you join our community of builders and explorers.
          Let&apos;s get you set up in just a few minutes.
        </p>
        <div className="mt-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;