"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Users, CheckCircle, Clock, Wallet, Plus, Loader2, ExternalLink, AlertTriangle, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import CertificateCard from "@/components/CertificateCard";
import CountdownTimer from "@/components/CountdownTimer";
import { useAccount } from "wagmi";
import {
    useVault,
    useVaultMembers,
    useMemberTask,
    useJoinVault,
    useCompleteTask,
    useVerifyTask,
    useCanReleaseFunds,
    useFinalizeVault
} from "@/lib/hooks/useGoalVault";
import { formatEther } from "viem";
import { useState, useEffect } from "react";
import { VaultStatus } from "@/lib/contracts";
import SocialShare from "@/components/SocialShare";

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
    const { finalizeVault, isPending: isFinalizing, isSuccess: isFinalizeSuccess, hash: finalizeHash } = useFinalizeVault();
    // Get current user's task to check for certificate eligibility
    const { task: myTask } = useMemberTask(vaultId, address || "0x0000000000000000000000000000000000000000", 0n);

    useEffect(() => {
        if (isFinalizeSuccess) {
            // Wait slightly for indexer
            const timer = setTimeout(() => {
                refetchVault();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isFinalizeSuccess, refetchVault]);

    const [depositAmount, setDepositAmount] = useState("");

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
    const isExpired = now > vault.deadline;

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

    const handleFinalizeVault = async () => {
        try {
            await finalizeVault(vaultId);
        } catch (error) {
            console.error("Error finalizing:", error);
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
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-2xl break-words sm:text-3xl font-bold text-white">{vault.name || `Vault #${vaultId}`}</h1>
                        </div>
                        <span className={`self-start rounded-full px-3 py-1 text-xs font-medium ${statusText === "Active" ? "bg-primary/10 text-primary" :
                            statusText === "Completed" ? "bg-green-500/10 text-green-500" :
                                "bg-zinc-500/10 text-zinc-500"
                            }`}>
                            {statusText}
                        </span>
                    </div>


                    <p className="text-zinc-400">
                        Created by {isCreator ? "You" : `${vault.creator.slice(0, 6)}...${vault.creator.slice(-4)}`}
                    </p>
                    {vault.payoutAddress !== "0x0000000000000000000000000000000000000000" && (
                        <p className="text-zinc-500 text-xs mt-1">
                            Payout Target: {vault.payoutAddress.slice(0, 6)}...{vault.payoutAddress.slice(-4)}
                        </p>
                    )}
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
                    <div className="rounded-2xl border border-zinc-800 bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Time Remaining</p>
                                <div className="mt-2 text-2xl font-bold text-white">
                                    <CountdownTimer targetDate={vault.deadline} />
                                </div>
                            </div>
                            <div className="rounded-full bg-zinc-900 p-3">
                                <Clock className="h-5 w-5 text-yellow-500" />
                            </div>
                        </div>
                    </div>
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



                {/* Settlement & Certificate Section */}
                {(isExpired || vault.fundsReleased) && (
                    <div className="mb-8 space-y-6">
                        <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-6">
                            <div className="flex items-start gap-4">
                                <RefreshCcw className="h-6 w-6 text-primary shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-2">Vault Period Ended</h3>
                                    <p className="text-zinc-400 mb-4">
                                        The deadline has passed. Please finalize the vault to settle all accounts.
                                        <br />
                                        <span className="text-sm text-zinc-500">
                                            • If Goal met & Tasks verified: Funds released to payout/members.
                                            <br />
                                            • If Goal missed or Tasks failed: Funds refunded (minus 10% penalty).
                                        </span>
                                    </p>

                                    {(vault.fundsReleased || isFinalizeSuccess) ? (
                                        <div className="rounded bg-green-500/10 border border-green-500/20 p-4">
                                            <p className="font-bold text-green-500 flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5" />
                                                Vault Finalized Successfully!
                                            </p>
                                            <p className="text-sm text-zinc-400 mt-1">
                                                All funds have been distributed according to vault rules.
                                            </p>
                                            {finalizeHash && (
                                                <a
                                                    href={`https://sepolia.scrollscan.com/tx/${finalizeHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
                                                >
                                                    View Settlement Transaction <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleFinalizeVault}
                                            disabled={isFinalizing}
                                            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition-all hover:bg-yellow-400 disabled:opacity-50"
                                        >
                                            {isFinalizing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Finalizing...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCcw className="h-4 w-4" />
                                                    Settle Vault & Distribute Funds
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Certificate Block */}
                        {(vault.fundsReleased || isFinalizeSuccess) && myTask?.isVerified && (
                            <div className="flex flex-col items-center pt-4 border-t border-zinc-800 mt-6 pt-6">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <CheckCircle className="h-6 w-6 text-[#FFD700]" />
                                    Your Achievement
                                </h2>
                                <CertificateCard
                                    projectName={vault.name}
                                    memberName="Valued Member"
                                    memberAddress={address || ""}
                                    taskDescription={myTask.description}
                                    amount={formatEther(vault.financialGoal / (BigInt(members?.length || 1) > 0n ? BigInt(members?.length || 1) : 1n))}
                                    date={new Date().toLocaleDateString()}
                                />
                                <div className="mt-4 w-full max-w-2xl">
                                    <SocialShare
                                        type="task"
                                        goalOrStake={formatEther(vault.financialGoal / (BigInt(members?.length || 1) > 0n ? BigInt(members?.length || 1) : 1n))}
                                        description={myTask.description}
                                        vaultId={vaultId.toString()}
                                        hasCertificate={true}
                                        projectName={vault.name}
                                        txHash={finalizeHash}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Join Vault Section */}
                {!isMember && vault.isActive && !isExpired && (
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
                        {Number(vault.requiredTasksPerMember) > 0 && (
                            <p className="mt-2 text-xs text-zinc-500">
                                You'll need to complete {vault.requiredTasksPerMember.toString()} tasks to unlock funds.
                            </p>
                        )}
                    </div>
                )}

                {/* Members & Tasks */}
                {isMember && Number(vault.requiredTasksPerMember) > 0 && (
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

                {/* Social Share for Members */}
                {isMember && vault.isActive && !vault.fundsReleased && (
                    <SocialShare
                        type={Number(vault.requiredTasksPerMember) > 0 ? "task" : "savings"}
                        goalOrStake={formatEther(vault.financialGoal)}
                        description={vault.name}
                        vaultId={vaultId.toString()}
                    />
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
                                    isCreator={vault.creator.toLowerCase() === member.toLowerCase()}
                                    isCurrentUser={address?.toLowerCase() === member.toLowerCase()}
                                    onVerifyTask={(taskId: number) => handleVerifyTask(member, taskId)}
                                    isVerifying={isVerifyingTask}
                                    canVerify={isMember && vault.isActive && !isExpired}
                                    currentViewer={address}
                                    memberCount={Number(vault.memberCount)}
                                />
                            ))
                        ) : (
                            <p className="text-center text-zinc-500 py-8">No members yet</p>
                        )}
                    </div>
                </div>

                {/* Release Funds Button */}

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
                    <p className="text-[10px] text-zinc-600 mt-1">Votes: {task.voteCount?.toString()} </p>
                </div>
            </div>
            {!task.isCompleted && !task.isVerified && (
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

function MemberCard({ vaultId, memberAddress, requiredTasks, isCreator, isCurrentUser, onVerifyTask, isVerifying, canVerify, currentViewer, memberCount }: any) {
    const [showTasks, setShowTasks] = useState(false);

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                        {memberAddress.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-white">
                                {memberAddress.slice(0, 6)}...{memberAddress.slice(-4)}
                            </p>
                            {isCreator && (
                                <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-500 border border-yellow-500/20">
                                    👑 Creator
                                </span>
                            )}
                            {isCurrentUser && (
                                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                                    You
                                </span>
                            )}
                        </div>
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
                {requiredTasks > 0 && (
                    <button
                        onClick={() => setShowTasks(!showTasks)}
                        className="text-sm text-primary hover:underline"
                    >
                        {showTasks ? "Hide" : "View"} Tasks
                    </button>
                )}
            </div>

            {showTasks && (
                <div className="mt-4 space-y-2 border-t border-zinc-800 pt-4">
                    {Array.from({ length: requiredTasks }, (_, i) => (
                        <MemberTaskItem
                            key={i}
                            vaultId={vaultId}
                            memberAddress={memberAddress}
                            taskId={i}
                            canVerify={canVerify}
                            onVerify={() => onVerifyTask(i)}
                            isVerifying={isVerifying}
                            currentViewer={currentViewer}
                            memberCount={memberCount}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function MemberTaskItem({ vaultId, memberAddress, taskId, canVerify, onVerify, isVerifying, currentViewer, memberCount }: any) {
    const { task, isLoading } = useMemberTask(vaultId, memberAddress, BigInt(taskId));

    if (isLoading || !task) return null;

    const voteCount = task.voteCount ? Number(task.voteCount) : 0;
    const requiredVotes = memberCount;

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
                <div>
                    <span className="text-zinc-300 block">{task.description || `Task #${taskId + 1}`}</span>
                    <span className="text-[10px] text-zinc-500">
                        {task.isVerified ? "Verified" : `Votes: ${voteCount}/${requiredVotes}`}
                    </span>
                </div>
            </div>

            {!task.isVerified && task.isCompleted && canVerify && (
                <button
                    onClick={onVerify}
                    disabled={isVerifying}
                    className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                    {isVerifying ? "Verifying..." : "Verify Task"}
                </button>
            )}
        </div>
    );
}
