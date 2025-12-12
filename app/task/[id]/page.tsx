"use client";

import { useParams } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Users, CheckCircle, XCircle, Clock, Copy, Check, ExternalLink, Wallet } from "lucide-react";
import Link from "next/link";
import { TASKVAULT_ADDRESS, TASKVAULT_ABI } from "@/lib/contracts-new";

export default function TaskDetailsPage() {
    const params = useParams();
    const taskId = BigInt(params?.id as string);
    const { address, isConnected } = useAccount();

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Read task details
    const { data: task } = useReadContract({
        address: TASKVAULT_ADDRESS,
        abi: TASKVAULT_ABI,
        functionName: "getTask",
        args: [taskId],
    });

    // Read member list
    const { data: memberList } = useReadContract({
        address: TASKVAULT_ADDRESS,
        abi: TASKVAULT_ABI,
        functionName: "getTaskMembers",
        args: [taskId],
    });

    const copyInviteLink = (inviteCode: string, index: number) => {
        const link = `${window.location.origin}/join/task/${inviteCode}`;
        navigator.clipboard.writeText(link);
        setCopiedIndex(index);
        toast.success("Invite link copied!");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (!task || !memberList) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const [id, description, creator, stakeAmount, deadline, isActive, memberCount] = task;

    const now = BigInt(Math.floor(Date.now() / 1000));
    const hasExpired = deadline < now;
    const timeLeft = hasExpired ? 0n : deadline - now;

    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12">
            <div className="mx-auto max-w-4xl">
                <Link href="/dashboard" className="mb-8 inline-flex items-center text-sm text-zinc-500 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="mb-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-primary/10 to-transparent p-8">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-white">{description}</h1>
                            <p className="text-zinc-400">Task #{id.toString()}</p>
                        </div>
                        <span className={`rounded-full px-4 py-2 text-sm font-medium ${isActive ? 'bg-green-900/30 text-green-500' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                            <p className="text-sm text-zinc-500">Stake Amount</p>
                            <p className="text-xl font-bold text-primary">{formatEther(stakeAmount)} ETH</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Members</p>
                            <p className="text-xl font-bold text-white">{Number(memberCount)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Deadline</p>
                            <p className="text-xl font-bold text-white">
                                {hasExpired ? 'Expired' : `${Math.floor(Number(timeLeft) / 86400)}d ${Math.floor((Number(timeLeft) % 86400) / 3600)}h`}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Status</p>
                            <p className={`text-xl font-bold ${hasExpired ? 'text-red-500' : 'text-green-500'}`}>
                                {hasExpired ? 'Expired' : 'Active'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Deadline Warning */}
                {!hasExpired && timeLeft < 86400n && (
                    <div className="mb-6 rounded-xl border border-yellow-900 bg-yellow-900/20 p-4">
                        <div className="flex items-center gap-2 text-yellow-500">
                            <Clock className="h-5 w-5" />
                            <p className="text-sm font-medium">
                                Less than 24 hours remaining! Complete your tasks before deadline.
                            </p>
                        </div>
                    </div>
                )}

                {/* Members & Status */}
                <div className="mb-6 rounded-2xl border border-zinc-800 bg-card p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                        <Users className="h-5 w-5" />
                        Members & Task Status
                    </h2>

                    <div className="space-y-3">
                        {(memberList as `0x${string}`[]).map((memberAddress, index) => (
                            <TaskMemberRow
                                key={index}
                                taskId={taskId}
                                memberAddress={memberAddress}
                                stakeAmount={stakeAmount}
                                index={index}
                                copiedIndex={copiedIndex}
                                onCopyLink={copyInviteLink}
                            />
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="rounded-lg border border-yellow-900 bg-yellow-900/10 p-4">
                    <p className="text-xs text-yellow-500">
                        ℹ️ <strong>Reminder:</strong> Each member must stake exactly {formatEther(stakeAmount)} ETH.
                        Complete tasks before deadline for full refund. Miss deadline = 10% penalty.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Task Member Row Component
function TaskMemberRow({
    taskId,
    memberAddress,
    stakeAmount,
    index,
    copiedIndex,
    onCopyLink
}: {
    taskId: bigint;
    memberAddress: `0x${string}`;
    stakeAmount: bigint;
    index: number;
    copiedIndex: number | null;
    onCopyLink: (code: string, index: number) => void;
}) {
    const { data: memberInfo } = useReadContract({
        address: TASKVAULT_ADDRESS,
        abi: TASKVAULT_ABI,
        functionName: "getMemberInfo",
        args: [taskId, memberAddress],
    });

    if (!memberInfo) return null;

    const [wallet, stakedAmount, hasStaked, hasCompleted, completedAt, inviteCode] = memberInfo;

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${hasCompleted ? 'bg-green-500/20' : hasStaked ? 'bg-primary/20' : 'bg-zinc-800'
                        }`}>
                        {hasCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : hasStaked ? (
                            <Wallet className="h-5 w-5 text-primary" />
                        ) : (
                            <XCircle className="h-5 w-5 text-zinc-600" />
                        )}
                    </div>
                    <div>
                        <p className="font-mono text-sm text-white">
                            {wallet.slice(0, 6)}...{wallet.slice(-4)}
                        </p>
                        <p className="text-xs text-zinc-500">Member #{index + 1}</p>
                    </div>
                </div>
                <div className="text-right">
                    {hasStaked ? (
                        <>
                            <p className="text-lg font-bold text-primary">{formatEther(stakedAmount)} ETH</p>
                            <p className={`text-xs ${hasCompleted ? 'text-green-500' : 'text-yellow-500'}`}>
                                {hasCompleted ? '✓ Completed' : 'In Progress'}
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-lg font-bold text-zinc-600">0 ETH</p>
                            <p className="text-xs text-zinc-500">Not Staked</p>
                        </>
                    )}
                </div>
            </div>

            {/* Status Badge */}
            <div className="mb-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${hasCompleted
                        ? 'bg-green-900/30 text-green-500'
                        : hasStaked
                            ? 'bg-yellow-900/30 text-yellow-500'
                            : 'bg-zinc-800 text-zinc-500'
                    }`}>
                    {hasCompleted ? (
                        <><CheckCircle className="h-3 w-3" /> Task Completed</>
                    ) : hasStaked ? (
                        <><Clock className="h-3 w-3" /> Waiting for completion</>
                    ) : (
                        <><XCircle className="h-3 w-3" /> Awaiting stake</>
                    )}
                </span>
            </div>

            {/* Invite Link */}
            <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md bg-zinc-950 px-3 py-2">
                    <p className="truncate font-mono text-xs text-zinc-600">
                        {window.location.origin}/join/task/{inviteCode}
                    </p>
                </div>
                <button
                    onClick={() => onCopyLink(inviteCode, index)}
                    className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground hover:bg-yellow-400"
                >
                    {copiedIndex === index ? (
                        <><Check className="h-3 w-3" /> Copied</>
                    ) : (
                        <><Copy className="h-3 w-3" /> Copy</>
                    )}
                </button>
            </div>
        </div>
    );
}
