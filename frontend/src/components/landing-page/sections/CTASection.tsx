import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Github, Twitter } from "lucide-react";
import { Button } from "@/components/ui";

export default function CTASection() {
  return (
    <section className="relative py-32 bg-slate-950 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-950 to-slate-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-violet-600/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-amber-600/10 rounded-full blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Decorative element */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 border border-violet-400/30 shadow-2xl shadow-violet-500/30 mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
            Ready to Build the
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-violet-200 bg-clip-text text-transparent">
              Future of Work?
            </span>
          </h2>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of developers already earning and collaborating on
            the Stellar blockchain. Your guild awaits.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="group relative px-10 py-7 text-lg bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white border-0 rounded-xl shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Guilds
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            <Button
              size="lg"
              className="group px-10 py-7 text-lg bg-white text-white hover:bg-slate-100 rounded-xl shadow-xl transition-all duration-300"
            >
              Create Account
            </Button>
          </div>

          {/* Social links */}
          <div className="flex items-center justify-center gap-6">
            <a
              href="#"
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
            >
              <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">GitHub</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
            >
              <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Twitter</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="text-sm font-medium">Discord</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
