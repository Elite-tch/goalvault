"use client";

import { useAccount, useReadContract } from "wagmi";
import { motion } from "framer-motion";
import { Target, Loader2, PlusCircle, CheckSquare, PiggyBank } from "lucide-react";
import Link from "next/link";
import { TASKVAULT_ADDRESS, TASKVAULT_ABI, SAVINGSVAULT_ADDRESS, SAVINGSVAULT_ABI } from "@/lib/contracts-new";
import { formatEther } from "viem";

export default function DashboardPage() {
    const { address, isConnected } = useAccount();

    // Read task counter
    const { data: taskCount } = useReadContract({
        address: TASKVAULT_ADDRESS,
        abi: TASKVAULT_ABI,
        functionName: "taskCounter",
    });

    // Read savings vault counter
    const { data: vaultCount } = useReadContract({
        address: SAVINGSVAULT_ADDRESS,
        abi: SAVINGSVAULT_ABI,
        functionName: "vaultCounter",
    });

    const totalTasks = Number(taskCount || 0);
    const totalVaults = Number(vaultCount || 0);

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
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-zinc-400">Manage your tasks and savings vaults</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/create/task">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition-colors hover:bg-yellow-400"
                            >
                                <CheckSquare className="h-5 w-5" />
                                Create Task
                            </motion.button>
                        </Link>
                        <Link href="/create/savings">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition-colors hover:bg-green-700"
                            >
                                <PiggyBank className="h-5 w-5" />
                                Create Savings
                            </motion.button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-8 grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-primary/10 to-transparent p-6">
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-lg bg-primary/20 p-3">
                                <CheckSquare className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-400">Total Tasks</p>
                                <p className="text-3xl font-bold text-white">{totalTasks}</p>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-500">Active task accountability vaults</p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-green-500/10 to-transparent p-6">
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-lg bg-green-500/20 p-3">
                                <PiggyBank className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-400">Total Savings</p>
                                <p className="text-3xl font-bold text-white">{totalVaults}</p>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-500">Active group savings vaults</p>
                    </div>
                </div>

                {/* Tasks Section */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <CheckSquare className="h-6 w-6 text-primary" />
                            My Tasks
                        </h2>
                        <Link href="/create/task" className="text-sm text-primary hover:underline">
                            Create New →
                        </Link>
                    </div>

                    {totalTasks === 0 ? (
                        <div className="rounded-2xl border border-zinc-800 bg-card p-12 text-center">
                            <CheckSquare className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                            <h3 className="mb-2 text-xl font-bold text-white">No Tasks Yet</h3>
                            <p className="mb-6 text-zinc-400">Create your first task accountability vault</p>
                            <Link href="/create/task">
                                <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-yellow-400">
                                    <PlusCircle className="h-5 w-5" />
                                    Create Task
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: totalTasks }, (_, i) => i + 1).map((taskId) => (
                                <TaskCard key={taskId} taskId={BigInt(taskId)} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Savings Section */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <PiggyBank className="h-6 w-6 text-green-500" />
                            My Savings Vaults
                        </h2>
                        <Link href="/create/savings" className="text-sm text-green-500 hover:underline">
                            Create New →
                        </Link>
                    </div>

                    {totalVaults === 0 ? (
                        <div className="rounded-2xl border border-zinc-800 bg-card p-12 text-center">
                            <PiggyBank className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                            <h3 className="mb-2 text-xl font-bold text-white">No Savings Vaults Yet</h3>
                            <p className="mb-6 text-zinc-400">Create your first group savings vault</p>
                            <Link href="/create/savings">
                                <button className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700">
                                    <PlusCircle className="h-5 w-5" />
                                    Create Savings
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: totalVaults }, (_, i) => i + 1).map((vaultId) => (
                                <SavingsCard key={vaultId} vaultId={BigInt(vaultId)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Task Card Component
function TaskCard({ taskId }: { taskId: bigint }) {
    const { data: task } = useReadContract({
        address: TASKVAULT_ADDRESS,
        abi: TASKVAULT_ABI,
        functionName: "getTask",
        args: [taskId],
    });

    if (!task) {
        return (
            <div className="rounded-2xl border border-zinc-800 bg-card p-6">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const [id, description, creator, stakeAmount, deadline, isActive, memberCount] = task;
    const now = BigInt(Math.floor(Date.now() / 1000));
    const hasExpired = deadline < now;

    return (
        <Link href={`/task/${id}`}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-primary/5 to-transparent p-6 transition-all hover:border-primary/50 cursor-pointer"
            >
                <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg bg-primary/20 p-2">
                        <CheckSquare className="h-5 w-5 text-primary" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-green-900/30 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                <h3 className="mb-2 text-lg font-bold text-white line-clamp-2">{description}</h3>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Stake:</span>
                        <span className="font-medium text-primary">{formatEther(stakeAmount)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Members:</span>
                        <span className="text-white">{Number(memberCount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Status:</span>
                        <span className={hasExpired ? 'text-red-500' : 'text-green-500'}>
                            {hasExpired ? 'Expired' : 'Active'}
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

// Savings Card Component
function SavingsCard({ vaultId }: { vaultId: bigint }) {
    const { data: vault } = useReadContract({
        address: SAVINGSVAULT_ADDRESS,
        abi: SAVINGSVAULT_ABI,
        functionName: "getVault",
        args: [vaultId],
    });

    if (!vault) {
        return (
            <div className="rounded-2xl border border-zinc-800 bg-card p-6">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-500" />
            </div>
        );
    }

    const [id, name, creator, savingsGoal, totalContributed, deadline, payoutAddress, isActive, fundsReleased, memberCount] = vault;
    const progress = savingsGoal > 0n ? Math.min(100, Number((totalContributed * 100n) / savingsGoal)) : 0;
    const now = BigInt(Math.floor(Date.now() / 1000));
    const hasExpired = deadline < now;

    return (
        <Link href={`/savings/${id}`}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-green-500/5 to-transparent p-6 transition-all hover:border-green-500/50 cursor-pointer"
            >
                <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg bg-green-500/20 p-2">
                        <PiggyBank className="h-5 w-5 text-green-500" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-green-900/30 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                        {isActive ? 'Active' : 'Completed'}
                    </span>
                </div>

                <h3 className="mb-3 text-lg font-bold text-white line-clamp-1">{name}</h3>

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

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Goal:</span>
                        <span className="font-medium text-green-500">{formatEther(savingsGoal)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Contributed:</span>
                        <span className="text-white">{formatEther(totalContributed)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Members:</span>
                        <span className="text-white">{Number(memberCount)}</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
