"use client";

import { motion } from "framer-motion";
import { Plus, Users, Wallet, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useVaultCounter, useVault } from "@/lib/hooks/useGoalVault";
import { formatEther } from "viem";
import { useEffect, useState } from "react";
import type { Vault } from "@/lib/contracts";

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const { vaultCounter, isLoading: isLoadingCounter } = useVaultCounter();
    const [vaults, setVaults] = useState<(Vault & { id: bigint })[]>([]);

    // Fetch all vaults when counter is available
    useEffect(() => {
        if (vaultCounter && vaultCounter > 0n) {
            // Fetch vaults from 1 to vaultCounter
            const vaultIds = Array.from({ length: Number(vaultCounter) }, (_, i) => BigInt(i + 1));
            // We'll load vault data in individual VaultCard components
            setVaults(vaultIds.map(id => ({ id } as Vault & { id: bigint })));
        }
    }, [vaultCounter]);

    if (!isConnected) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
                    <h2 className="mb-2 text-2xl font-bold text-white">Wallet Not Connected</h2>
                    <p className="text-zinc-400">Please connect your wallet to view your vaults</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12 text-foreground">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Your Vaults</h1>
                        <p className="mt-2 text-zinc-400">
                            {vaultCounter ? `${vaultCounter.toString()} total vault${Number(vaultCounter) !== 1 ? 's' : ''} on Scroll GoalVault` : "Loading..."}
                        </p>
                    </div>
                    <Link href="/dashboard/create">
                        <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition-all hover:bg-yellow-400 shadow-[0_0_20px_-5px_rgba(255,214,117,0.3)]">
                            <Plus className="h-5 w-5" />
                            Create New Vault
                        </button>
                    </Link>
                </div>

                {/* Vaults Grid */}
                {isLoadingCounter ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : vaults.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="mb-4 text-zinc-400">No vaults yet. Create one to get started!</p>
                        <Link href="/dashboard/create">
                            <button className="rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground transition-all hover:bg-yellow-400">
                                Create First Vault
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {vaults.map((vault) => (
                            <VaultCard key={vault.id.toString()} vaultId={vault.id} />
                        ))}

                        {/* Create Placeholder Card */}
                        <Link href="/dashboard/create" className="group flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 transition-all hover:border-zinc-700 hover:bg-zinc-900/40">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 group-hover:bg-zinc-700">
                                <Plus className="h-8 w-8 text-zinc-500 group-hover:text-zinc-300" />
                            </div>
                            <p className="font-medium text-zinc-500 group-hover:text-zinc-300">Create New Vault</p>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function VaultCard({ vaultId }: { vaultId: bigint }) {
    const { vault, isLoading, error } = useVault(vaultId);

    if (isLoading) {
        return (
            <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-zinc-800 bg-card">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !vault) {
        return null;
    }

    const progress = vault.financialGoal > 0n
        ? Math.min(100, Number((vault.totalDeposited * 100n) / vault.financialGoal))
        : 0;

    const isCompleted = progress === 100;
    const statusText = vault.status === 0 ? "Active" : vault.status === 1 ? "Completed" : vault.status === 2 ? "Failed" : "Cancelled";

    // Calculate deadline
    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeLeft = vault.deadline > now ? vault.deadline - now : 0n;
    const daysLeft = timeLeft > 0n ? Number(timeLeft) / 86400 : 0;
    const deadlineText = daysLeft > 1 ? `${Math.ceil(daysLeft)} Days Left` : daysLeft > 0 ? "< 1 Day Left" : "Ended";

    return (
        <Link href={`/vault/${vaultId}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-card p-6 transition-all hover:border-zinc-700 hover:shadow-lg cursor-pointer"
            >
                <div className="mb-4 flex items-start justify-between">
                    <div className={`rounded-full px-3 py-1 text-xs font-medium ${statusText === "Active" ? "bg-primary/10 text-primary" :
                            statusText === "Completed" ? "bg-green-500/10 text-green-500" :
                                "bg-zinc-500/10 text-zinc-500"
                        }`}>
                        {statusText}
                    </div>
                    <span className="text-xs text-zinc-500">{deadlineText}</span>
                </div>

                <h3 className="mb-2 text-xl font-bold text-white truncate">{vault.name || `Vault #${vaultId}`}</h3>
                <p className="mb-6 text-sm text-zinc-400">
                    Goal: <span className="text-white">{formatEther(vault.financialGoal)} ETH</span>
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="mb-2 flex justify-between text-xs">
                        <span className="text-zinc-500">Progress</span>
                        <span className={isCompleted ? "text-green-400" : "text-white"}>{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Users className="h-4 w-4" />
                        <span>{vault.memberCount.toString()} members</span>
                    </div>
                    <div className="text-xs text-zinc-500">
                        {vault.requiredTasksPerMember.toString()} tasks each
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
