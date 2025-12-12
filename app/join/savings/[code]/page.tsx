"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, parseEther } from "viem";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertTriangle, PiggyBank, TrendingUp } from "lucide-react";
import Link from "next/link";
import { SAVINGSVAULT_ADDRESS, SAVINGSVAULT_ABI } from "@/lib/contracts-new";

interface VaultInfo {
    id: bigint;
    name: string;
    creator: string;
    savingsGoal: bigint;
    totalContributed: bigint;
    deadline: bigint;
    payoutAddress: string;
    isActive: boolean;
    fundsReleased: boolean;
    memberCount: bigint;
}

interface MemberInfo {
    wallet: string;
    contributed: bigint;
    hasJoined: boolean;
    inviteCode: string;
}

export default function JoinSavingsPage() {
    const params = useParams();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const inviteCode = params?.code as string;

    const [contributionAmount, setContributionAmount] = useState("");
    const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
    const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);

    // Read vault ID from invite code
    const { data: vaultId } = useReadContract({
        address: SAVINGSVAULT_ADDRESS,
        abi: SAVINGSVAULT_ABI,
        functionName: "inviteCodeToVaultId",
        args: [inviteCode as `0x${string}`]
    });

    // Read vault details
    const { data: vault, isLoading: isLoadingVault, refetch: refetchVault } = useReadContract({
        address: SAVINGSVAULT_ADDRESS,
        abi: SAVINGSVAULT_ABI,
        functionName: "getVault",
        args: vaultId ? [vaultId] : undefined,
        query: { enabled: !!vaultId }
    });

    // Read member info
    const { data: member, refetch: refetchMember } = useReadContract({
        address: SAVINGSVAULT_ADDRESS,
        abi: SAVINGSVAULT_ABI,
        functionName: "getMemberInfo",
        args: vaultId && address ? [vaultId, address] : undefined,
        query: { enabled: !!vaultId && !!address }
    });

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (vault) {
            const [id, name, creator, savingsGoal, totalContributed, deadline, payoutAddress, isActive, fundsReleased, memberCount] = vault;
            setVaultInfo({ id, name, creator, savingsGoal, totalContributed, deadline, payoutAddress, isActive, fundsReleased, memberCount });
        }
    }, [vault]);

    useEffect(() => {
        if (member) {
            const [wallet, contributed, hasJoined, inviteCode] = member;
            setMemberInfo({ wallet, contributed, hasJoined, inviteCode });
        }
    }, [member]);

    const handleContribute = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            toast.error("Please connect your wallet!");
            return;
        }

        if (!vaultInfo) {
            toast.error("Vault information not loaded!");
            return;
        }

        // Check if amount is entered
        if (!contributionAmount || contributionAmount === "" || parseFloat(contributionAmount) <= 0) {
            toast.error("Please enter a valid contribution amount!");
            return;
        }

        const amount = parseEther(contributionAmount);
        const remaining: bigint = vaultInfo.savingsGoal - vaultInfo.totalContributed;

        if (amount > remaining) {
            toast.error(`Cannot contribute more than ${formatEther(remaining)} ETH. Goal almost reached!`);
            return;
        }

        if (amount <= 0n) {
            toast.error("Please enter a valid amount!");
            return;
        }

        try {
            writeContract({
                address: SAVINGSVAULT_ADDRESS,
                abi: SAVINGSVAULT_ABI,
                functionName: "contributeWithInvite",
                args: [inviteCode as `0x${string}`],
                value: amount
            });

            toast.loading("Contributing...");
        } catch (error: any) {
            toast.error(error.message || "Failed to contribute");
        }
    };

    useEffect(() => {
        if (isSuccess) {
            toast.dismiss();
            toast.success("Contribution successful!");
            setContributionAmount("");
            refetchVault();
            refetchMember();
        }
    }, [isSuccess]);

    if (isLoadingVault) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!vaultInfo || !vaultInfo.isActive) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6">
                <div className="text-center">
                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
                    <h2 className="mb-2 text-2xl font-bold text-white">Invalid or Inactive Vault</h2>
                    <Link href="/dashboard" className="text-primary hover:underline">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeLeft = vaultInfo.deadline > now ? vaultInfo.deadline - now : 0n;
    const hasExpired = timeLeft === 0n;
    const progress = vaultInfo.savingsGoal > 0n
        ? Math.min(100, Number((vaultInfo.totalContributed * 100n) / vaultInfo.savingsGoal))
        : 0;
    const remaining: bigint = vaultInfo.savingsGoal - vaultInfo.totalContributed;

    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-2 text-3xl font-bold text-white">Savings Vault Invite</h1>
                <p className="mb-8 text-zinc-400">Join your team's savings goal</p>

                <div className="space-y-6">
                    {/* Vault Details */}
                    <div className="rounded-2xl border border-zinc-800 bg-card p-6">
                        <h3 className="mb-4 text-xl font-bold text-white">{vaultInfo.name}</h3>

                        <div className="mb-6">
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="text-zinc-500">Progress</span>
                                <span className="text-white">{progress}%</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-900">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1 }}
                                    className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-green-600'}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-zinc-500">Goal</p>
                                <p className="text-lg font-bold text-green-500">{formatEther(vaultInfo.savingsGoal)} ETH</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500">Contributed</p>
                                <p className="text-lg font-bold text-white">{formatEther(vaultInfo.totalContributed)} ETH</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500">Remaining</p>
                                <p className="text-white">{formatEther(remaining)} ETH</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500">Deadline</p>
                                <p className="text-white">
                                    {hasExpired ? "Expired" : `${Math.floor(Number(timeLeft) / 86400)}d ${Math.floor((Number(timeLeft) % 86400) / 3600)}h left`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Your Contribution */}
                    {memberInfo && memberInfo.hasJoined && memberInfo.contributed > 0n ? (
                        <div className="rounded-2xl border border-green-800 bg-green-900/20 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                <div>
                                    <h3 className="font-bold text-white">Your Contribution</h3>
                                    <p className="text-sm text-green-400">{formatEther(memberInfo.contributed)} ETH contributed</p>
                                </div>
                            </div>

                            {!hasExpired && remaining > 0n && (
                                <div className="mt-4">
                                    <p className="text-sm text-zinc-400 mb-3">Want to contribute more?</p>
                                    <form onSubmit={handleContribute} className="space-y-3">
                                        <input
                                            type="number"
                                            step="0.001"
                                            min="0.001"
                                            value={contributionAmount}
                                            onChange={(e) => setContributionAmount(e.target.value)}
                                            placeholder="Additional amount (ETH)"
                                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                            required
                                            disabled={isPending || isConfirming}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isPending || isConfirming}
                                            className="w-full rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {isPending || isConfirming ? (
                                                <><Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Contributing...</>
                                            ) : (
                                                <>Add More</>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-zinc-800 bg-card p-6">
                            <h3 className="mb-4 text-xl font-bold text-white">Make Your Contribution</h3>

                            <div className="mb-6 rounded-lg border border-green-900 bg-green-900/10 p-4">
                                <p className="text-sm text-green-500">
                                    💰 You can contribute any amount up to the remaining goal.
                                    Funds are locked until deadline.
                                </p>
                            </div>

                            {!isConnected ? (
                                <div className="text-center py-8">
                                    <p className="text-zinc-400 mb-4">Please connect your wallet to contribute</p>
                                </div>
                            ) : hasExpired ? (
                                <div className="text-center py-8">
                                    <PiggyBank className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                                    <p className="text-zinc-400">This savings vault has expired</p>
                                </div>
                            ) : (
                                <form onSubmit={handleContribute} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Contribution Amount (ETH)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            min="0.001"
                                            value={contributionAmount}
                                            onChange={(e) => setContributionAmount(e.target.value)}
                                            placeholder="0.1"
                                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                            required
                                            disabled={isPending || isConfirming}
                                        />
                                        <p className="text-xs text-zinc-500">
                                            Max: {formatEther(remaining)} ETH
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isPending || isConfirming}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-4 text-lg font-bold text-white transition-all hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {isPending || isConfirming ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Contributing...
                                            </>
                                        ) : (
                                            <>
                                                <TrendingUp className="h-5 w-5" />
                                                Contribute to Goal
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Info */}
                    <div className="rounded-lg border border-yellow-900 bg-yellow-900/10 p-4">
                        <p className="text-xs text-yellow-500">
                            ℹ️ <strong>Important:</strong> Funds are locked until deadline.
                            If goal is met, funds go to payout address. If not met, you'll get refund minus 10% penalty.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
