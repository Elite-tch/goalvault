"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, parseEther } from "viem";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertTriangle, Clock, Coins } from "lucide-react";
import Link from "next/link";
import { TASKVAULT_ADDRESS, TASKVAULT_ABI, PENALTY_RECEIVER } from "@/lib/contracts-new";

export default function JoinTaskPage() {
    const params = useParams();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const inviteCode = params?.code as string;

    const [taskInfo, setTaskInfo] = useState<any>(null);
    const [memberInfo, setMemberInfo] = useState<any>(null);

    // Read task ID from invite code
    const { data: taskId } = useReadContract({
        address: TASKVAULT_ADDRESS,
        abi: TASKVAULT_ABI,
        functionName: "inviteCodeToTaskId",
        args: [inviteCode as `0x${string}`]
    });

    // Read task details
    const { data: task, isLoading: isLoadingTask } = useReadContract({
        address: TASKVAULT_ADDRESS,
        abi: TASKVAULT_ABI,
        functionName: "getTask",
        args: taskId ? [taskId] : undefined,
        query: { enabled: !!taskId }
    });

    // Read member info
    const { data: member, refetch: refetchMember } = useReadContract({
        address: TASKVAULT_ADDRESS,
        abi: TASKVAULT_ABI,
        functionName: "getMemberInfo",
        args: taskId && address ? [taskId, address] : undefined,
        query: { enabled: !!taskId && !!address }
    });

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (task) {
            const [id, description, creator, stakeAmount, deadline, isActive, memberCount] = task;
            setTaskInfo({ id, description, creator, stakeAmount, deadline, isActive, memberCount });
        }
    }, [task]);

    useEffect(() => {
        if (member) {
            const [wallet, stakedAmount, hasStaked, hasCompleted, completedAt, inviteCode] = member;
            setMemberInfo({ wallet, stakedAmount, hasStaked, hasCompleted, completedAt, inviteCode });
        }
    }, [member]);

    const handleStake = async () => {
        if (!isConnected) {
            toast.error("Please connect your wallet!");
            return;
        }

        if (!taskInfo) {
            toast.error("Task information not loaded!");
            return;
        }

        try {
            writeContract({
                address: TASKVAULT_ADDRESS,
                abi: TASKVAULT_ABI,
                functionName: "stakeWithInvite",
                args: [inviteCode as `0x${string}`],
                value: taskInfo.stakeAmount
            });

            toast.loading("Staking...");
        } catch (error: any) {
            toast.error(error.message || "Failed to stake");
        }
    };

    const handleCompleteTask = async () => {
        if (!taskId) return;

        try {
            writeContract({
                address: TASKVAULT_ADDRESS,
                abi: TASKVAULT_ABI,
                functionName: "completeTask",
                args: [taskId]
            });

            toast.loading("Marking task as complete...");
        } catch (error: any) {
            toast.error(error.message || "Failed to complete task");
        }
    };

    const handleClaim = async () => {
        if (!taskId) return;

        try {
            writeContract({
                address: TASKVAULT_ADDRESS,
                abi: TASKVAULT_ABI,
                functionName: "claimAfterDeadline",
                args: [taskId]
            });

            toast.loading("Claiming refund...");
        } catch (error: any) {
            toast.error(error.message || "Failed to claim");
        }
    };

    useEffect(() => {
        if (isSuccess) {
            toast.dismiss();
            toast.success("Transaction successful!");
            refetchMember();
        }
    }, [isSuccess]);

    if (isLoadingTask) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!taskInfo || !taskInfo.isActive) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6">
                <div className="text-center">
                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
                    <h2 className="mb-2 text-2xl font-bold text-white">Invalid or Inactive Task</h2>
                    <Link href="/dashboard" className="text-primary hover:underline">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeLeft = taskInfo.deadline > now ? taskInfo.deadline - now : 0n;
    const hasExpired = timeLeft === 0n;

    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-2 text-3xl font-bold text-white">Task Invite</h1>
                <p className="mb-8 text-zinc-400">Review the task and stake to participate</p>

                <div className="space-y-6">
                    {/* Task Details */}
                    <div className="rounded-2xl border border-zinc-800 bg-card p-6">
                        <h3 className="mb-4 text-xl font-bold text-white">Task Details</h3>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-zinc-500">Description</p>
                                <p className="text-white">{taskInfo.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-zinc-500">Stake Required</p>
                                    <p className="text-lg font-bold text-primary">{formatEther(taskInfo.stakeAmount)} ETH</p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">Deadline</p>
                                    <p className="text-white">
                                        {hasExpired ? "Expired" : `${Math.floor(Number(timeLeft) / 86400)}d ${Math.floor((Number(timeLeft) % 86400) / 3600)}h left`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stake Status */}
                    {memberInfo && memberInfo.hasStaked ? (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-green-800 bg-green-900/20 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                    <div>
                                        <h3 className="font-bold text-white">You've Staked!</h3>
                                        <p className="text-sm text-green-400">Amount: {formatEther(memberInfo.stakedAmount)} ETH</p>
                                    </div>
                                </div>

                                {memberInfo.hasCompleted ? (
                                    <div className="rounded-lg border border-green-700 bg-green-900/30 p-4">
                                        <p className="text-sm text-green-400">✓ Task Completed! You can claim your full refund after deadline.</p>
                                    </div>
                                ) : hasExpired ? (
                                    <div className="rounded-lg border border-red-700 bg-red-900/30 p-4">
                                        <p className="text-sm text-red-400">⚠️ Deadline passed without completion. You'll receive refund minus 10% penalty.</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleCompleteTask}
                                        disabled={isPending || isConfirming}
                                        className="w-full mt-4 rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {isPending || isConfirming ? (
                                            <><Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Completing...</>
                                        ) : (
                                            "Mark Task as Complete"
                                        )}
                                    </button>
                                )}

                                {hasExpired && (
                                    <button
                                        onClick={handleClaim}
                                        disabled={isPending || isConfirming}
                                        className="w-full mt-4 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                    >
                                        {isPending || isConfirming ? (
                                            <><Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Claiming...</>
                                        ) : (
                                            "Claim Refund"
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="rounded-lg border border-yellow-900 bg-yellow-900/10 p-4">
                                <p className="text-xs text-yellow-500">
                                    ℹ️ <strong>Penalty:</strong> If you don't complete before deadline, 10% of your stake goes to {PENALTY_RECEIVER.slice(0, 8)}...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-zinc-800 bg-card p-6">
                            <h3 className="mb-4 text-xl font-bold text-white">Stake to Participate</h3>

                            <div className="mb-6 rounded-lg border border-yellow-900 bg-yellow-900/10 p-4">
                                <p className="text-sm text-yellow-500">
                                    ⚠️ You must stake <strong>exactly {formatEther(taskInfo.stakeAmount)} ETH</strong> to join this task.
                                    Complete before deadline for full refund, or face 10% penalty!
                                </p>
                            </div>

                            {!isConnected ? (
                                <div className="text-center py-8">
                                    <p className="text-zinc-400 mb-4">Please connect your wallet to stake</p>
                                </div>
                            ) : hasExpired ? (
                                <div className="text-center py-8">
                                    <Clock className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                                    <p className="text-zinc-400">This task has expired</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleStake}
                                    disabled={isPending || isConfirming}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground transition-all hover:bg-yellow-400 disabled:opacity-50"
                                >
                                    {isPending || isConfirming ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Staking...
                                        </>
                                    ) : (
                                        <>
                                            <Coins className="h-5 w-5" />
                                            Stake {formatEther(taskInfo.stakeAmount)} ETH
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
