import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Target, Shield, Zap, Users } from "lucide-react";
import ParticleBackground from "@/components/landing-page/ui/ParticleBackground";
import Link from "next/link";
import HeroTypewriter from "../ui/HeroTypewriter";
import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('hero');
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Multi-layer gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Particle animation */}
      <ParticleBackground />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-300 text-sm font-medium">
              {t('secure')}
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl flex flex-col gap-2 lg:text-7xl font-black font-hero text-white leading-tight mb-6"
          >
            {t('title')}
            <br />
            <span className="inline-block bg-gradient-to-r min-h-[90px] font-hero from-violet-400 to-violet-200 bg-clip-text text-transparent">
              <HeroTypewriter words={[t('subtitle')]} />
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            {t('tagline')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/guilds"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white border-0 rounded-xl shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/40 transition-all duration-300 gap-2"
            >
              {t('exploreGuilds')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/bounties"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg bg-white/5 border border-slate-700 hover:border-violet-500/50 hover:bg-white/10 text-white rounded-xl backdrop-blur-sm transition-all duration-300 gap-2"
            >
              <Target className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              {t('joinBounties')}
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 text-slate-500"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-400" />
              <span className="text-sm">{t('secure')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-400" />
              <span className="text-sm">{t('payments')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              <span className="text-sm">{t('governed')}</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-slate-700 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-violet-400"
            />
          </div>
        </motion.div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
}
