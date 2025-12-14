"use client"

import { motion, type Variants, type Transition } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, Users, CalendarDays } from "lucide-react"
import { CountdownTimer } from "@/components/countdown-timer"

interface AnimatedHeroProps {
  eventDate: Date
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
}

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
  },
}

// Decorative floating elements
const FloatingElement = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.3, 0.6, 0.3], 
      scale: 1,
      y: [0, -20, 0],
    }}
    transition={{
      opacity: { duration: 3, repeat: Infinity, delay },
      scale: { duration: 0.5, delay },
      y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
    }}
  />
)

export function AnimatedHero({ eventDate }: AnimatedHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-accent to-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(22,163,74,0.1),transparent_50%)]" />
      
      {/* Floating decorative elements */}
      <FloatingElement 
        className="absolute top-20 left-[10%] h-20 w-20 rounded-full bg-primary/5 blur-xl" 
        delay={0} 
      />
      <FloatingElement 
        className="absolute top-40 right-[15%] h-32 w-32 rounded-full bg-primary/10 blur-2xl" 
        delay={0.5} 
      />
      <FloatingElement 
        className="absolute bottom-20 left-[20%] h-24 w-24 rounded-full bg-green-500/10 blur-xl" 
        delay={1} 
      />
      <FloatingElement 
        className="absolute bottom-40 right-[10%] h-16 w-16 rounded-full bg-primary/5 blur-lg" 
        delay={1.5} 
      />

      {/* Main Content */}
      <div className="container relative mx-auto px-3 py-12 lg:px-4 lg:py-24">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Event Badge */}
          <motion.div
            variants={badgeVariants}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary lg:mb-6 lg:gap-2 lg:px-4 lg:py-2 lg:text-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <CalendarDays className="h-3 w-3 lg:h-4 lg:w-4" />
            </motion.div>
            <span>Event Day: January 10, 2026 • 9:00 AM</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            variants={itemVariants}
            className="mb-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-4xl lg:mb-6 lg:text-5xl xl:text-6xl"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Welcome to the{" "}
            </motion.span>
            <motion.span
              className="bg-gradient-to-r from-primary via-green-500 to-primary bg-clip-text text-transparent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              SLT Trainees Cricket Fiesta
            </motion.span>
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="mb-6 text-balance text-sm leading-relaxed text-muted-foreground sm:text-base lg:mb-8 lg:text-xl"
          >
            Comprehensive event management system for 200+ participants. Handle registrations, food distribution,
            match scheduling, and live scoring all in one place.
          </motion.p>

          {/* Countdown Timer with animation wrapper */}
          <motion.div
            variants={itemVariants}
            className="mb-6 lg:mb-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <CountdownTimer targetDate={eventDate} eventName="Cricket Fiesta 2026" />
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3 lg:gap-4"
          >
            <motion.a
              href="https://linktr.ee/CricketFiestaRegistrationLinks"
              target="_blank"
              rel="noopener noreferrer"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button size="sm" className="gap-1.5 text-xs lg:gap-2 lg:text-sm">
                <Users className="h-4 w-4 lg:h-5 lg:w-5" />
                Register Now
              </Button>
            </motion.a>
            
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link href="/login">
                <Button size="sm" variant="outline" className="gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm">
                  <Trophy className="h-4 w-4 lg:h-5 lg:w-5" />
                  Live Scores
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Animated underline decoration */}
          <motion.div
            className="mx-auto mt-8 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent lg:mt-12"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          />
        </motion.div>
      </div>

      {/* Bottom wave decoration */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
    </section>
  )
}
