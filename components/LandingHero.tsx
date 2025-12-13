"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

export default function LandingHero() {
    return (
        <section className="relative flex min-h-screen  flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-[#0a0a0a] to-[#0a0a0a]" />
            <div className="absolute top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl filter" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8 flex items-center mt-10 gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400 backdrop-blur-md"
            >
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                Now Live on Scroll Sepolia
            </motion.div>

            <motion.h1
                className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
            >
                Turn Shared Goals into <br />
                <span className="text-gradient-gold">Guaranteed Wins</span>
            </motion.h1>

            <motion.p
                className="mt-6 max-w-2xl text-lg text-zinc-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
            >
                Scroll GoalVault is the first collaborative savings protocol where funds are locked until everyone completes their tasks. accountability meets DeFi.
            </motion.p>

            <motion.div
                className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
            >
                <Link href="/create" className="group border border-zinc-800 z-50 flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:bg-yellow-400">
                    Start a Vault
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/dashboard" className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition-colors hover:bg-zinc-800">
                    View Dashboard
                </Link>
            </motion.div>

            {/* Feature Grid */}
            <motion.div
                className="mt-24 grid w-full max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
            >
                <FeatureCard
                    icon={<Users className="h-6 w-6 text-primary" />}
                    title="Group Accountability"
                    description="Invite friends. Everyone commits funds. Everyone works."
                />
                <FeatureCard
                    icon={<Lock className="h-6 w-6 text-primary" />}
                    title="Trustless Escrow"
                    description="Funds are locked on Scroll zkEVM until the goal is met."
                />
                <FeatureCard
                    icon={<ShieldCheck className="h-6 w-6 text-primary" />}
                    title="Verifiable Success"
                    description="Tasks must be verified before the vault unlocks."
                />
            </motion.div>
        </section>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 text-center backdrop-blur-sm transition-colors hover:border-zinc-700">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {icon}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
            <p className="text-sm text-zinc-400">{description}</p>
        </div>
    );
}
