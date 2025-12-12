"use client";

import { useParams } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Users, TrendingUp, Calendar, Wallet, ExternalLink, Copy, Check } from "lucide-react";
import Link from "next/link";
import { SAVINGSVAULT_ADDRESS, SAVINGSVAULT_ABI } from "@/lib/contracts-new";

export default function SavingsDetailsPage() {
    const params = useParams();
    const vaultId = BigInt(params?.id as string);
    const { address, isConnected } = useAccount();

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Read vault details
    const { data: vault, refetch: refetchVault } = useReadContract({
        address: SAVINGSVAULT_ADDRESS,
        abi: SAVINGSVAULT_ABI,
        functionName: "getVault",
        args: [vaultId],
    });

    // Read member list
    const { data: memberList } = useReadContract({
        address: SAVINGSVAULT_ADDRESS,
        abi: SAVINGSVAULT_ABI,
        functionName: "getVaultMembers",
        args: [vaultId],
    });

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSuccess) {
            toast.dismiss();
            toast.success("Funds released!");
            refetchVault();
        }
    }, [isSuccess]);

    const handleReleaseFunds = async () => {
        try {
            writeContract({
                address: SAVINGSVAULT_ADDRESS,
                abi: SAVINGSVAULT_ABI,
                functionName: "releaseFunds",
                args: [vaultId],
            });
            toast.loading("Releasing funds...");
        } catch (error: any) {
            toast.error(error.message || "Failed to release funds");
        }
    };

    const copyInviteLink = (inviteCode: string, index: number) => {
        const link = `${window.location.origin}/join/savings/${inviteCode}`;
        navigator.clipboard.writeText(link);
        setCopiedIndex(index);
        toast.success("Invite link copied!");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (!vault || !memberList) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const [id, name, creator, savingsGoal, totalContributed, deadline, payoutAddress, isActive, fundsReleased, memberCount] = vault;

    const now = BigInt(Math.floor(Date.now() / 1000));
    const hasExpired = deadline < now;
    const progress = savingsGoal > 0n ? Math.min(100, Number((totalContributed * 100n) / savingsGoal)) : 0;
    const isCreator = address?.toLowerCase() === creator.toLowerCase();
    const goalMet = totalContributed >= savingsGoal;

    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12">
            <div className="mx-auto max-w-4xl">
                <Link href="/dashboard" className="mb-8 inline-flex items-center text-sm text-zinc-500 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="mb-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-green-500/10 to-transparent p-8">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-white">{name}</h1>
                            <p className="text-zinc-400">Savings Vault #{id.toString()}</p>
                        </div>
                        <span className={`rounded-full px-4 py-2 text-sm font-medium ${isActive ? 'bg-green-900/30 text-green-500' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                            {fundsReleased ? 'Completed' : isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="text-zinc-400">Progress</span>
                            <span className="font-medium text-white">{progress}%</span>
                        </div>
                        <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-900">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1 }}
                                className={`h-full ${progress >= 100 ? 'bg-green-500' : 'bg-green-600'}`}
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                            <p className="text-sm text-zinc-500">Goal</p>
                            <p className="text-xl font-bold text-green-500">{formatEther(savingsGoal)} ETH</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Contributed</p>
                            <p className="text-xl font-bold text-white">{formatEther(totalContributed)} ETH</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Members</p>
                            <p className="text-xl font-bold text-white">{Number(memberCount)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Deadline</p>
                            <p className="text-xl font-bold text-white">
                                {hasExpired ? 'Expired' : `${Math.floor(Number(deadline - now) / 86400)}d`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payout Address */}
                <div className="mb-6 rounded-xl border border-zinc-800 bg-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="mb-1 text-sm text-zinc-500">Payout Address</p>
                            <p className="font-mono text-sm text-white">{payoutAddress}</p>
                        </div>
                        <a
                            href={`https://sepolia.scrollscan.com/address/${payoutAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-yellow-400"
                        >
                            <ExternalLink className="h-5 w-5" />
                        </a>
                    </div>
                </div>

                {/* Members & Contributions */}
                <div className="mb-6 rounded-2xl border border-zinc-800 bg-card p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                        <Users className="h-5 w-5" />
                        Members & Contributions
                    </h2>

                    <div className="space-y-3">
                        {(memberList as `0x${string}`[]).map((memberAddress, index) => (
                            <MemberRow
                                key={index}
                                vaultId={vaultId}
                                memberAddress={memberAddress}
                                index={index}
                                copiedIndex={copiedIndex}
                                onCopyLink={copyInviteLink}
                            />
                        ))}
                    </div>
                </div>

                {/* Actions */}
                {isCreator && hasExpired && !fundsReleased && (
                    <div className="rounded-2xl border border-primary/50 bg-primary/10 p-6">
                        <h3 className="mb-2 text-lg font-bold text-white">Ready to Release</h3>
                        <p className="mb-4 text-sm text-zinc-400">
                            {goalMet
                                ? `Goal reached! Release ${formatEther(totalContributed)} ETH to payout address.`
                                : `Goal not met. Members will receive refunds minus 10% penalty.`}
                        </p>
                        <button
                            onClick={handleReleaseFunds}
                            disabled={isPending || isConfirming}
                            className="w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            {isPending || isConfirming ? (
                                <><Loader2 className="inline h-5 w-5 animate-spin mr-2" /> Releasing...</>
                            ) : (
                                'Release Funds'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Member Row Component
function MemberRow({
    vaultId,
    memberAddress,
    index,
    copiedIndex,
    onCopyLink
}: {
    vaultId: bigint;
    memberAddress: `0x${string}`;
    index: number;
    copiedIndex: number | null;
    onCopyLink: (code: string, index: number) => void;
}) {
    const { data: memberInfo } = useReadContract({
        address: SAVINGSVAULT_ADDRESS,
        abi: SAVINGSVAULT_ABI,
        functionName: "getMemberInfo",
        args: [vaultId, memberAddress],
    });

    if (!memberInfo) return null;

    const [wallet, contributed, hasJoined, inviteCode] = memberInfo;

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                        <Wallet className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                        <p className="font-mono text-sm text-white">
                            {wallet.slice(0, 6)}...{wallet.slice(-4)}
                        </p>
                        <p className="text-xs text-zinc-500">Member #{index + 1}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-green-500">{formatEther(contributed)} ETH</p>
                    <p className="text-xs text-zinc-500">{hasJoined ? 'Contributed' : 'Not joined'}</p>
                </div>
            </div>

            {/* Invite Link */}
            <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md bg-zinc-950 px-3 py-2">
                    <p className="truncate font-mono text-xs text-zinc-600">
                        {window.location.origin}/join/savings/{inviteCode}
                    </p>
                </div>
                <button
                    onClick={() => onCopyLink(inviteCode, index)}
                    className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700"
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
