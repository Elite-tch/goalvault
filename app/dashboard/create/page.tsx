"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, X, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateVault } from "@/lib/hooks/useGoalVault";
import { useAccount } from "wagmi";

export default function CreateVaultPage() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const [tasks, setTasks] = useState<string[]>([""]);
    const [vaultName, setVaultName] = useState("");
    const [financialGoal, setFinancialGoal] = useState("");
    const [duration, setDuration] = useState("7");

    const { createVault, isPending, isSuccess, hash, error } = useCreateVault();

    const addTask = () => setTasks([...tasks, ""]);
    const removeTask = (index: number) => setTasks(tasks.filter((_, i) => i !== index));
    const updateTask = (index: number, value: string) => {
        const newTasks = [...tasks];
        newTasks[index] = value;
        setTasks(newTasks);
    };

    // Redirect on success
    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        }
    }, [isSuccess, router]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            alert("Please connect your wallet first!");
            return;
        }

        // Filter out empty tasks
        const validTasks = tasks.filter(t => t.trim() !== "");

        if (validTasks.length === 0) {
            alert("Please add at least one task!");
            return;
        }

        try {
            await createVault(
                vaultName,
                financialGoal,
                parseInt(duration),
                validTasks.length,
                validTasks
            );
        } catch (err) {
            console.error("Error creating vault:", err);
        }
    };

    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12 text-foreground">
            <div className="mx-auto max-w-2xl">
                <Link href="/dashboard" className="mb-8 inline-flex items-center text-sm text-zinc-500 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="mb-2 text-3xl font-bold text-white">Create a New Vault</h1>
                    <p className="mb-8 text-zinc-400">Set a team goal, define tasks, and lock your commitment.</p>

                    <form onSubmit={handleCreate} className="space-y-6 rounded-2xl border border-zinc-800 bg-card p-8">

                        {/* Success Message */}
                        {isSuccess && (
                            <div className="flex items-center gap-3 rounded-lg bg-green-900/20 border border-green-900 px-4 py-3 text-green-400">
                                <CheckCircle className="h-5 w-5" />
                                <div>
                                    <p className="font-medium">Vault Created Successfully!</p>
                                    <p className="text-xs text-green-500">Redirecting to dashboard...</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-lg bg-red-900/20 border border-red-900 px-4 py-3 text-red-400 text-sm">
                                Error: {error.message}
                            </div>
                        )}

                        {/* Vault Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Vault Name</label>
                            <input
                                type="text"
                                value={vaultName}
                                onChange={(e) => setVaultName(e.target.value)}
                                placeholder="e.g. Hackathon Team Fund"
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                required
                                disabled={isPending || isSuccess}
                            />
                        </div>

                        {/* Financial Goal */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Total Savings Goal (ETH)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={financialGoal}
                                onChange={(e) => setFinancialGoal(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                required
                                disabled={isPending || isSuccess}
                            />
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Duration (Days)</label>
                            <input
                                type="number"
                                min="1"
                                max="365"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="7"
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                required
                                disabled={isPending || isSuccess}
                            />
                            <p className="text-xs text-zinc-500">How many days until the vault deadline</p>
                        </div>

                        {/* Tasks Section */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Required Tasks (Per Member)</label>
                            <p className="text-xs text-zinc-500">Each member must complete these to unlock funds.</p>

                            <div className="space-y-3">
                                {tasks.map((task, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={task}
                                            onChange={(e) => updateTask(index, e.target.value)}
                                            placeholder={`Task #${index + 1}`}
                                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            required
                                            disabled={isPending || isSuccess}
                                        />
                                        {tasks.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeTask(index)}
                                                className="flex h-[50px] w-[50px] items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 hover:border-red-900 hover:bg-red-900/20 hover:text-red-500"
                                                disabled={isPending || isSuccess}
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addTask}
                                className="mt-2 text-sm font-medium text-primary hover:text-yellow-400 hover:underline disabled:opacity-50"
                                disabled={isPending || isSuccess}
                            >
                                + Add another task
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending || isSuccess}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground transition-all hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Creating Vault...
                                </>
                            ) : isSuccess ? (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    Vault Created!
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    Create Vault on Scroll
                                </>
                            )}
                        </button>

                        {/* Transaction Hash */}
                        {hash && (
                            <div className="text-center">
                                <p className="text-xs text-zinc-500">Transaction Hash:</p>
                                <a
                                    href={`https://sepolia.scrollscan.com/tx/${hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline break-all"
                                >
                                    {hash}
                                </a>
                            </div>
                        )}

                    </form>
                </motion.div>
            </div>
        </div>
    );
}
