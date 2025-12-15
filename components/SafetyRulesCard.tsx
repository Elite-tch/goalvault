"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function SafetyRulesCard({ type, stakeAmount }: { type: "task" | "savings", stakeAmount: string }) {
    return (
        <div className="space-y-4">
            {/* The Hook: Flake Tax */}
            <div className="rounded-xl border border-red-900/50 bg-red-900/10 p-4">
                <div className="flex items-start gap-3">
                    <div className="rounded-full bg-red-900/20 p-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-red-400">The "Flake Tax" Rule 🩸</h4>
                        <p className="mt-1 text-xs text-zinc-400">
                            By joining, you agree to stake exactly <strong>{stakeAmount} ETH</strong>.
                            If you fail to {type === "task" ? "complete your task" : "reach the goal"} by the deadline,
                            <strong> 10% of your stake</strong> will be forfeited to the active members.
                        </p>
                    </div>
                </div>
            </div>

            {/* The Safety Hatch */}
            <div className="rounded-xl border border-blue-900/50 bg-blue-900/10 p-4">
                <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-900/20 p-2">
                        <ShieldCheck className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-400">Emergency Safety Hatch 🛡️</h4>
                        <p className="mt-1 text-xs text-zinc-400">
                            Your funds are never stuck forever. If the creator goes missing, you can activate the
                            <strong> Emergency Refund</strong> function 30 days after the deadline to recover your funds.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
