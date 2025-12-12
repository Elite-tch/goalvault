"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckSquare, PiggyBank, ArrowRight, ArrowLeft } from "lucide-react";

export default function CreateModePage() {
    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12">
            <div className="mx-auto max-w-4xl">
                <Link href="/dashboard" className="mb-8 inline-flex items-center text-sm text-zinc-500 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                <h1 className="mb-4 text-4xl font-bold text-white text-center">
                    Choose Your Mode
                </h1>
                <p className="mb-12 text-center text-zinc-400">
                    Select how you want to use Scroll GoalVault
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Task Mode */}
                    <Link href="/create/task">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="group cursor-pointer rounded-2xl border border-zinc-800 bg-gradient-to-br from-primary/5 to-transparent p-8 transition-all hover:border-primary/50"
                        >
                            <CheckSquare className="mb-4 h-12 w-12 text-primary" />
                            <h2 className="mb-2 text-2xl font-bold text-white">
                                Task Accountability
                            </h2>
                            <p className="mb-6 text-zinc-400">
                                Create tasks with fixed stakes. Members complete before deadline or face penalties.
                            </p>
                            <ul className="mb-6 space-y-2 text-sm text-zinc-500">
                                <li>✓ Fixed stake per task</li>
                                <li>✓ Complete on time = full refund</li>
                                <li>✓ Miss deadline = 10% penalty</li>
                                <li>✓ Unique invite links per member</li>
                            </ul>
                            <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                                Create Task Vault <ArrowRight className="h-4 w-4" />
                            </div>
                        </motion.div>
                    </Link>

                    {/* Savings Mode */}
                    <Link href="/create/savings">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="group cursor-pointer rounded-2xl border border-zinc-800 bg-gradient-to-br from-green-500/5 to-transparent p-8 transition-all hover:border-green-500/50"
                        >
                            <PiggyBank className="mb-4 h-12 w-12 text-green-500" />
                            <h2 className="mb-2 text-2xl font-bold text-white">
                                Group Savings
                            </h2>
                            <p className="mb-6 text-zinc-400">
                                Set a savings goal. Members contribute flexibly. Funds locked until deadline.
                            </p>
                            <ul className="mb-6 space-y-2 text-sm text-zinc-500">
                                <li>✓ Flexible contribution amounts</li>
                                <li>✓ Funds locked until deadline</li>
                                <li>✓ Goal met = payout to address</li>
                                <li>✓ Goal not met = refund with penalty</li>
                            </ul>
                            <div className="flex items-center gap-2 text-green-500 font-medium group-hover:gap-3 transition-all">
                                Create Savings Vault <ArrowRight className="h-4 w-4" />
                            </div>
                        </motion.div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
