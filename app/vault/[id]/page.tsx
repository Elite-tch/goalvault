"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Users, CheckCircle, Clock, Wallet, Plus, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import {
    useVault,
    useVaultMembers,
    useMemberTask,
    useJoinVault,
    useCompleteTask,
    useVerifyTask,
    useReleaseFunds,
    useCanReleaseFunds
} from "@/lib/hooks/useGoalVault";
import { formatEther } from "viem";
import { useState } from "react";
import { VaultStatus } from "@/lib/contracts";

export default function VaultDetailsPage() {
    const params = useParams();
    const vaultId = BigInt(params?.id as string || "0");
    const { address, isConnected } = useAccount();

    const { vault, isLoading: vaultLoading, refetch: refetchVault } = useVault(vaultId);
    const { members, isLoading: membersLoading, refetch: refetchMembers } = useVaultMembers(vaultId);
    const { canRelease, refetch: refetchCanRelease } = useCanReleaseFunds(vaultId);

    const { joinVault, isPending: isJoining } = useJoinVault();
    const { completeTask, isPending: isCompletingTask } = useCompleteTask();
    const { verifyTask, isPending: isVerifyingTask } = useVerifyTask();
    const { releaseFunds, isPending: isReleasingFunds } = useReleaseFunds();

    const [depositAmount, setDepositAmount] = useState("");
    const [selectedMemberForVerification, setSelectedMemberForVerification] = useState<string>("");

    if (vaultLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!vault) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
                <div className="text-center">
                    <h2 className="mb-2 text-2xl font-bold text-white">Vault Not Found</h2>
                    <Link href="/dashboard" className="text-primary hover:underline">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const progress = vault.financialGoal > 0n
        ? Math.min(100, Number((vault.totalDeposited * 100n) / vault.financialGoal))
        : 0;

    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeLeft = vault.deadline > now ? vault.deadline - now : 0n;
    const daysLeft = timeLeft > 0n ? Number(timeLeft) / 86400 : 0;

    const isCreator = vault.creator.toLowerCase() === address?.toLowerCase();
    const isMember = members?.some(m => m.toLowerCase() === address?.toLowerCase());
    const statusText = vault.status === VaultStatus.Active ? "Active" :
        vault.status === VaultStatus.Completed ? "Completed" :
            vault.status === VaultStatus.Failed ? "Failed" : "Cancelled";

    const handleJoinVault = async () => {
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
            alert("Please enter a valid deposit amount");
            return;
        }

        try {
            await joinVault(vaultId, depositAmount);
            setTimeout(() => {
                refetchVault();
                refetchMembers();
            }, 2000);
        } catch (error) {
            console.error("Error joining vault:", error);
        }
    };

    const handleCompleteTask = async (taskId: number) => {
        try {
            await completeTask(vaultId, BigInt(taskId));
            setTimeout(() => refetchVault(), 2000);
        } catch (error) {
            console.error("Error completing task:", error);
        }
    };

    const handleVerifyTask = async (memberAddress: string, taskId: number) => {
        try {
            await verifyTask(vaultId, memberAddress, BigInt(taskId));
            setTimeout(() => refetchVault(), 2000);
        } catch (error) {
            console.error("Error verifying task:", error);
        }
    };

    const handleReleaseFunds = async () => {
        try {
            await releaseFunds(vaultId);
            setTimeout(() => refetchVault(), 2000);
        } catch (error) {
            console.error("Error releasing funds:", error);
        }
    };

    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12 text-foreground">
            <div className="mx-auto max-w-5xl">
                <Link href="/dashboard" className="mb-8 inline-flex items-center text-sm text-zinc-500 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-white">{vault.name || `Vault #${vaultId}`}</h1>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusText === "Active" ? "bg-primary/10 text-primary" :
                                statusText === "Completed" ? "bg-green-500/10 text-green-500" :
                                    "bg-zinc-500/10 text-zinc-500"
                            }`}>
                            {statusText}
                        </span>
                    </div>
                    <p className="text-zinc-400">
                        Created by {isCreator ? "You" : `${vault.creator.slice(0, 6)}...${vault.creator.slice(-4)}`}
                    </p>
                </div>

                {/* Stats */}
                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Financial Goal"
                        value={`${formatEther(vault.financialGoal)} ETH`}
                        icon={<Wallet className="h-5 w-5 text-primary" />}
                    />
                    <StatCard
                        label="Total Deposited"
                        value={`${formatEther(vault.totalDeposited)} ETH`}
                        subValue={`${progress}% of goal`}
                        icon={<CheckCircle className="h-5 w-5 text-green-400" />}
                    />
                    <StatCard
                        label="Time Remaining"
                        value={daysLeft > 1 ? `${Math.ceil(daysLeft)} days` : daysLeft > 0 ? "< 1 day" : "Expired"}
                        icon={<Clock className="h-5 w-5 text-yellow-500" />}
                    />
                </div>

                {/* Progress Bar */}
                <div className="mb-8 rounded-2xl border border-zinc-800 bg-card p-6">
                    <div className="mb-4 flex justify-between">
                        <span className="text-sm font-medium text-white">Savings Progress</span>
                        <span className="text-sm text-zinc-400">{progress}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-900">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                        />
                    </div>
                </div>

                {/* Join Vault Section */}
                {!isMember && vault.isActive && !vault.fundsReleased && (
                    <div className="mb-8 rounded-2xl border border-zinc-800 bg-card p-6">
                        <h2 className="mb-4 text-xl font-bold text-white">Join This Vault</h2>
                        <div className="flex gap-3">
                            <input
                                type="number"
                                step="0.01"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                placeholder="Enter amount (ETH)"
                                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                                onClick={handleJoinVault}
                                disabled={isJoining || !isConnected}
                                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition-all hover:bg-yellow-400 disabled:opacity-50"
                            >
                                {isJoining ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Join Vault
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-zinc-500">
                            You'll need to complete {vault.requiredTasksPerMember.toString()} tasks to unlock funds
                        </p>
                    </div>
                )}

                {/* Members & Tasks */}
                {isMember && (
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-white">Your Tasks</h2>
                        <div className="space-y-3">
                            {Array.from({ length: Number(vault.requiredTasksPerMember) }, (_, i) => (
                                <TaskCard
                                    key={i}
                                    vaultId={vaultId}
                                    memberAddress={address!}
                                    taskId={i}
                                    onComplete={() => handleCompleteTask(i)}
                                    isCompletingTask={isCompletingTask}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Members List */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-bold text-white">Members ({vault.memberCount.toString()})</h2>
                    <div className="space-y-3">
                        {membersLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : members && members.length > 0 ? (
                            members.map((member, idx) => (
                                <MemberCard
                                    key={member}
                                    vaultId={vaultId}
                                    memberAddress={member}
                                    requiredTasks={Number(vault.requiredTasksPerMember)}
                                    isCreator={isCreator}
                                    onVerifyTask={(taskId) => handleVerifyTask(member, taskId)}
                                    isVerifying={isVerifyingTask}
                                />
                            ))
                        ) : (
                            <p className="text-center text-zinc-500 py-8">No members yet</p>
                        )}
                    </div>
                </div>

                {/* Release Funds Button */}
                {isCreator && canRelease && vault.isActive && !vault.fundsReleased && (
                    <div className="rounded-2xl border border-green-800 bg-green-900/20 p-6">
                        <h3 className="mb-2 text-lg font-bold text-green-400">Ready to Release Funds</h3>
                        <p className="mb-4 text-sm text-green-300">
                            All conditions met! Financial goal reached and all tasks verified.
                        </p>
                        <button
                            onClick={handleReleaseFunds}
                            disabled={isReleasingFunds}
                            className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-bold text-white transition-all hover:bg-green-600 disabled:opacity-50"
                        >
                            {isReleasingFunds ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Releasing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    Release Funds
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, subValue, icon }: { label: string; value: string; subValue?: string; icon: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-card p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-white">{value}</p>
                    {subValue && <p className="mt-1 text-xs text-zinc-600">{subValue}</p>}
                </div>
                <div className="rounded-full bg-zinc-900 p-3">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function TaskCard({ vaultId, memberAddress, taskId, onComplete, isCompletingTask }: any) {
    const { task, isLoading } = useMemberTask(vaultId, memberAddress, BigInt(taskId));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (!task) return null;

    return (
        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center gap-3">
                {task.isVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                ) : task.isCompleted ? (
                    <Clock className="h-5 w-5 text-yellow-500" />
                ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-zinc-700" />
                )}
                <div>
                    <p className="font-medium text-white">{task.description || `Task #${taskId + 1}`}</p>
                    <p className="text-xs text-zinc-500">
                        {task.isVerified ? "Verified ✓" : task.isCompleted ? "Awaiting verification" : "Not completed"}
                    </p>
                </div>
            </div>
            {!task.isCompleted && (
                <button
                    onClick={onComplete}
                    disabled={isCompletingTask}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-yellow-400 disabled:opacity-50"
                >
                    {isCompletingTask ? "Completing..." : "Mark Complete"}
                </button>
            )}
        </div>
    );
}

function MemberCard({ vaultId, memberAddress, requiredTasks, isCreator, onVerifyTask, isVerifying }: any) {
    const [showTasks, setShowTasks] = useState(false);

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                        {memberAddress.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium text-white">
                            {memberAddress.slice(0, 6)}...{memberAddress.slice(-4)}
                        </p>
                        <a
                            href={`https://sepolia.scrollscan.com/address/${memberAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zinc-500 hover:text-primary flex items-center gap-1"
                        >
                            View on Explorer <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
                <button
                    onClick={() => setShowTasks(!showTasks)}
                    className="text-sm text-primary hover:underline"
                >
                    {showTasks ? "Hide" : "View"} Tasks
                </button>
            </div>

            {showTasks && (
                <div className="mt-4 space-y-2 border-t border-zinc-800 pt-4">
                    {Array.from({ length: requiredTasks }, (_, i) => (
                        <MemberTaskItem
                            key={i}
                            vaultId={vaultId}
                            memberAddress={memberAddress}
                            taskId={i}
                            isCreator={isCreator}
                            onVerify={() => onVerifyTask(i)}
                            isVerifying={isVerifying}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function MemberTaskItem({ vaultId, memberAddress, taskId, isCreator, onVerify, isVerifying }: any) {
    const { task, isLoading } = useMemberTask(vaultId, memberAddress, BigInt(taskId));

    if (isLoading || !task) return null;

    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
                {task.isVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                ) : task.isCompleted ? (
                    <Clock className="h-4 w-4 text-yellow-500" />
                ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                )}
                <span className="text-zinc-300">{task.description || `Task #${taskId + 1}`}</span>
            </div>
            {isCreator && task.isCompleted && !task.isVerified && (
                <button
                    onClick={onVerify}
                    disabled={isVerifying}
                    className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                    {isVerifying ? "Verifying..." : "Verify"}
                </button>
            )}
        </div>
    );
}
