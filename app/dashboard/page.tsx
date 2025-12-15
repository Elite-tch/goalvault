"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Target, Loader2, PlusCircle, CheckSquare, PiggyBank, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { formatEther } from "viem";
import CountdownTimer from "@/components/CountdownTimer";
import { useVaultCounter, useVault } from "@/lib/hooks/useGoalVault";
import { VaultStatus } from "@/lib/contracts";

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<"tasks" | "savings">("tasks");

    // Read total vault count from unified contract
    const { vaultCounter, isLoading } = useVaultCounter();
    const totalVaults = Number(vaultCounter || 0);

    if (!isConnected) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6">
                <div className="text-center">
                    <Target className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
                    <h2 className="mb-2 text-2xl font-bold text-white">Connect Your Wallet</h2>
                    <p className="text-zinc-400">Please connect your wallet to view your dashboard</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-zinc-400">Manage your commitments</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/create/task">
                            <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition-colors hover:bg-yellow-400">
                                <CheckSquare className="h-5 w-5" />
                                Create Task
                            </button>
                        </Link>
                        <Link href="/create/savings">
                            <button className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition-colors hover:bg-green-700">
                                <PiggyBank className="h-5 w-5" />
                                Create Savings
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8 flex space-x-4 border-b border-zinc-800">
                    <button
                        onClick={() => setActiveTab("tasks")}
                        className={`flex items-center gap-2 border-b-2 px-6 py-3 font-medium transition-colors ${activeTab === "tasks"
                            ? "border-primary text-primary"
                            : "border-transparent text-zinc-400 hover:text-white"
                            }`}
                    >
                        <CheckSquare className="h-5 w-5" />
                        My Tasks
                    </button>
                    <button
                        onClick={() => setActiveTab("savings")}
                        className={`flex items-center gap-2 border-b-2 px-6 py-3 font-medium transition-colors ${activeTab === "savings"
                            ? "border-green-500 text-green-500"
                            : "border-transparent text-zinc-400 hover:text-white"
                            }`}
                    >
                        <PiggyBank className="h-5 w-5" />
                        My Savings
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                        </div>
                    ) : (
                        <VaultList
                            totalVaults={totalVaults}
                            currentAddress={address}
                            type={activeTab}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function VaultList({ totalVaults, currentAddress, type }: { totalVaults: number; currentAddress?: string, type: "tasks" | "savings" }) {
    if (totalVaults === 0) return <EmptyState type={type === "tasks" ? "task" : "savings"} />;

    // Iterate in reverse to show newest first
    const vaultIds = Array.from({ length: totalVaults }, (_, i) => BigInt(totalVaults - i));

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vaultIds.map((vaultId) => (
                <VaultCardWrapper
                    key={vaultId.toString()}
                    vaultId={vaultId}
                    currentAddress={currentAddress}
                    type={type}
                />
            ))}
        </div>
    );
}

function VaultCardWrapper({ vaultId, currentAddress, type }: { vaultId: bigint; currentAddress?: string; type: "tasks" | "savings" }) {
    const { vault, isLoading } = useVault(vaultId);

    if (isLoading) return null; // Or a skeleton
    if (!vault) return null;

    // Filter by Creator
    if (vault.creator.toLowerCase() !== currentAddress?.toLowerCase()) {
        return null; // Don't render if not creator
    }

    // Determine Type
    const isTaskVault = vault.requiredTasksPerMember > 0n;

    // Filter by Tab Type using the derived property
    if (type === "tasks" && !isTaskVault) return null;
    if (type === "savings" && isTaskVault) return null;

    // Render appropriate card
    if (isTaskVault) {
        return <TaskCard vault={vault} />;
    } else {
        return <SavingsCard vault={vault} />;
    }
}

function EmptyState({ type }: { type: "task" | "savings" }) {
    const isTask = type === "task";
    return (
        <div className="rounded-2xl border border-zinc-800 bg-card p-12 text-center">
            {isTask ? (
                <CheckSquare className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
            ) : (
                <PiggyBank className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
            )}
            <h3 className="mb-2 text-xl font-bold text-white">No {isTask ? "Tasks" : "Savings Vaults"} Yet</h3>
            <p className="mb-6 text-zinc-400">Create your first {isTask ? "task accountability" : "group savings"} vault</p>
            <Link href={isTask ? "/create/task" : "/create/savings"}>
                <button className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white ${isTask ? "bg-primary text-primary-foreground" : "bg-green-600"}`}>
                    <PlusCircle className="h-5 w-5" />
                    Create {isTask ? "Task" : "Savings"}
                </button>
            </Link>
        </div>
    );
}

function TaskCard({ vault }: { vault: any }) {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const hasExpired = vault.deadline < now;
    const isActive = vault.status === VaultStatus.Active && !hasExpired;

    return (
        <Link href={`/vault/${vault.id}`}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-primary/5 to-transparent p-6 transition-all hover:border-primary/50 cursor-pointer h-full"
            >
                <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg bg-primary/20 p-2">
                        <CheckSquare className="h-5 w-5 text-primary" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-green-900/30 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                <h3 className="mb-2 text-lg font-bold text-white line-clamp-2">{vault.name}</h3>

                <div className="mb-4 flex items-center text-sm text-zinc-400">
                    <CountdownTimer targetDate={vault.deadline} className="text-zinc-300" />
                </div>

                <div className="space-y-2 text-sm border-t border-zinc-800 pt-4">
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Goal:</span>
                        <span className="font-medium text-primary">{formatEther(vault.financialGoal)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Deposited:</span>
                        <span className="text-white">{formatEther(vault.totalDeposited)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Members:</span>
                        <span className="text-white">{Number(vault.memberCount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Status:</span>
                        <span className={hasExpired ? 'text-red-500' : 'text-green-500'}>
                            {vault.status === VaultStatus.Completed ? 'Completed' :
                                vault.status === VaultStatus.Failed ? 'Failed' :
                                    vault.status === VaultStatus.Cancelled ? 'Cancelled' :
                                        hasExpired ? 'Expired' : 'Active'}
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

function SavingsCard({ vault }: { vault: any }) {
    const progress = vault.financialGoal > 0n ? Math.min(100, Number((vault.totalDeposited * 100n) / vault.financialGoal)) : 0;
    const now = BigInt(Math.floor(Date.now() / 1000));
    const hasExpired = vault.deadline < now;
    const isActive = vault.status === VaultStatus.Active && !hasExpired;

    return (
        <Link href={`/vault/${vault.id}`}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-green-500/5 to-transparent p-6 transition-all hover:border-green-500/50 cursor-pointer h-full"
            >
                <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg bg-green-500/20 p-2">
                        <PiggyBank className="h-5 w-5 text-green-500" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-green-900/30 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                        {isActive ? 'Active' : 'Completed'}
                    </span>
                </div>

                <h3 className="mb-3 text-lg font-bold text-white line-clamp-1">{vault.name}</h3>

                <div className="mb-4 flex items-center text-sm text-zinc-400">
                    <CountdownTimer targetDate={vault.deadline} className="text-zinc-300" />
                </div>

                <div className="mb-3">
                    <div className="mb-1 flex justify-between text-xs">
                        <span className="text-zinc-500">Progress</span>
                        <span className="text-white">{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-2 text-sm border-t border-zinc-800 pt-4">
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Goal:</span>
                        <span className="font-medium text-green-500">{formatEther(vault.financialGoal)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Contributed:</span>
                        <span className="text-white">{formatEther(vault.totalDeposited)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Members:</span>
                        <span className="text-white">{Number(vault.memberCount)}</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
