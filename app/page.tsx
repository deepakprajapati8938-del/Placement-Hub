'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  BookOpen, 
  Map, 
  Trophy, 
  ChevronRight,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <nav className="container mx-auto">
          <div className="glass-card px-6 py-3 flex items-center justify-between backdrop-blur-xl border-glass-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent-purple-strong rounded-lg flex items-center justify-center">
                <Star className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-text-primary hidden sm:block">
                Placement<span className="text-accent-purple-strong">Hub</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login">
                <span className="text-sm font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-bg-surface-hover">
                  Login
                </span>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="btn-aurora px-6">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32">
        <div className="container px-4 mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-glass-border-purple text-accent-purple text-[10px] md:text-xs font-semibold mb-6 md:mb-8 backdrop-blur-sm">
              <Star className="w-3 h-3 fill-accent-purple" />
              <span>Everything you need to ace your placements</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary mb-6 md:mb-8 leading-[1.1]">
              Master Your Placement <br />
              <span className="text-accent-purple-strong">Journey with Confidence</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-base md:text-xl text-text-secondary mb-8 md:mb-12 leading-relaxed px-4">
              Placement Hub provides curated study notes, structured roadmaps, and 
              real-time progress tracking to help you land your dream job at top tech companies.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-10 group shadow-xl shadow-accent-purple/20">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/roadmap" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full h-14 px-10">
                  View Roadmap
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-5 text-text-primary">Why Choose Placement Hub?</h2>
            <p className="text-text-secondary max-w-xl mx-auto text-lg">Structured learning designed for modern engineering students.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Curated Study Notes",
                description: "Hand-picked resources covering DSA, Core Subjects, and System Design.",
                icon: BookOpen,
                link: "/notes",
                variant: "purple" as const
              },
              {
                title: "Structured Roadmaps",
                description: "Follow a proven path from foundations to interview mastery.",
                icon: Map,
                link: "/roadmap",
                variant: "teal" as const
              },
              {
                title: "Progress Tracking",
                description: "Track your growth with XP, streaks, and global leaderboards.",
                icon: Trophy,
                link: "/leaderboard",
                variant: "blue" as const
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className={cn(
                  "glass-card p-8 group hover:scale-[1.02] transition-all cursor-default",
                  feature.variant === 'purple' && "glass-card--purple",
                  feature.variant === 'teal' && "glass-card--teal",
                  feature.variant === 'blue' && "glass-card--blue"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110",
                  feature.variant === 'purple' && "bg-accent-purple/10 text-accent-purple border border-glass-border-purple",
                  feature.variant === 'teal' && "bg-accent-teal/10 text-accent-teal border border-glass-border-teal",
                  feature.variant === 'blue' && "bg-accent-blue/10 text-accent-blue border border-glass-border-blue"
                )}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-text-primary">{feature.title}</h3>
                <p className="text-text-secondary mb-8 text-base leading-relaxed">
                  {feature.description}
                </p>
                <Link 
                  href={feature.link}
                  className={cn(
                    "inline-flex items-center text-sm font-bold uppercase tracking-wider transition-all gap-2",
                    feature.variant === 'purple' && "text-accent-purple",
                    feature.variant === 'teal' && "text-accent-teal",
                    feature.variant === 'blue' && "text-accent-blue"
                  )}
                >
                  Explore <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-accent-purple/5 -z-10 skew-y-1" />
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Study Resources", value: "500+" },
              { label: "Active Students", value: "2k+" },
              { label: "Success Rate", value: "94%" },
              { label: "Company Patterns", value: "50+" }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-text-primary mb-3 transition-transform group-hover:scale-110 duration-300">{stat.value}</div>
                <div className="text-xs md:text-sm text-text-muted font-bold uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32">
        <div className="container px-4 mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto p-12 md:p-20 rounded-[2.5rem] bg-accent-purple-strong/10 border border-glass-border-purple backdrop-blur-md text-center relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-purple/20 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-teal/10 blur-[100px] rounded-full" />
            
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-text-primary">Ready to Start Your Journey?</h2>
            <p className="text-text-secondary mb-12 max-w-xl mx-auto text-lg leading-relaxed">
              Join thousands of students who are already using Placement Hub to prepare for their dream careers.
            </p>
            
            <Link href="/signup">
              <Button size="lg" className="h-16 px-12 text-lg shadow-2xl shadow-accent-purple/40">
                Join Now for Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-glass-border">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-purple-strong rounded-xl flex items-center justify-center shadow-lg shadow-accent-purple/20">
                <span className="text-white font-bold">PH</span>
              </div>
              <span className="font-bold text-xl text-text-primary tracking-tight">Placement Hub</span>
            </div>
            <p className="text-sm text-text-muted font-medium">
              © 2026 Placement Hub. Built for the next generation of engineers.
            </p>
            <div className="flex items-center gap-8 text-sm font-bold text-text-secondary">
              <a href="#" className="hover:text-accent-purple transition-colors uppercase tracking-widest">Privacy</a>
              <a href="#" className="hover:text-accent-purple transition-colors uppercase tracking-widest">Terms</a>
              <a href="#" className="hover:text-accent-purple transition-colors uppercase tracking-widest">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

