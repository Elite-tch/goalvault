"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertTriangle, PiggyBank, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useVault, useVaultMembers, useJoinVault } from "@/lib/hooks/useGoalVault";
import { VaultStatus } from "@/lib/contracts";
import CountdownTimer from "@/components/CountdownTimer";

export default function JoinSavingsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const vaultIdString = params?.code as string;
    const vaultId = vaultIdString ? BigInt(vaultIdString) : undefined;

    const invitee = searchParams?.get("invitee");
    const suggestedAmount = searchParams?.get("amount");

    const [contributionAmount, setContributionAmount] = useState("");

    useEffect(() => {
        if (suggestedAmount) {
            setContributionAmount(suggestedAmount);
        }
    }, [suggestedAmount]);

    const { vault, isLoading: isLoadingVault, refetch: refetchVault } = useVault(vaultId);
    const { members, isLoading: isLoadingMembers, refetch: refetchMembers } = useVaultMembers(vaultId);
    const { joinVault, isPending, isSuccess, error } = useJoinVault();

    const isMember = members?.some(m => m.toLowerCase() === address?.toLowerCase());
    const isWrongWallet = isConnected && invitee && address && invitee.toLowerCase() !== address.toLowerCase();

    useEffect(() => {
        if (isSuccess) {
            toast.success("Contribution successful!");
            setContributionAmount("");
            refetchVault();
            refetchMembers();
            // Optional: Redirect to dashboard after delay if it's the first join? 
            // Or just stay here to let them contribute more.
        }
    }, [isSuccess, refetchMembers, refetchVault]);

    useEffect(() => {
        if (error) {
            toast.error("Failed to contribute. Check console.");
            console.error(error);
        }
    }, [error]);

    const handleContribute = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            toast.error("Please connect your wallet!");
            return;
        }

        if (!vault || !vaultId) {
            toast.error("Vault information not loaded!");
            return;
        }

        // Check if amount is entered
        if (!contributionAmount || contributionAmount === "" || parseFloat(contributionAmount) <= 0) {
            toast.error("Please enter a valid contribution amount!");
            return;
        }

        const amount = parseEther(contributionAmount);
        const remaining = vault.financialGoal - vault.totalDeposited;

        if (amount > remaining) {
            toast.error(`Cannot contribute more than ${formatEther(remaining)} ETH. Goal almost reached!`);
            return;
        }

        await joinVault(vaultId, contributionAmount);
    };

    if (isLoadingVault) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!vault || vaultIdString === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6">
                <div className="text-center">
                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
                    <h2 className="mb-2 text-2xl font-bold text-white">Vault Not Found</h2>
                    <Link href="/dashboard" className="text-primary hover:underline">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const now = BigInt(Math.floor(Date.now() / 1000));
    const isExpired = vault.deadline < now;
    const isActive = vault.status === VaultStatus.Active && !isExpired;

    const progress = vault.financialGoal > 0n
        ? Math.min(100, Number((vault.totalDeposited * 100n) / vault.financialGoal))
        : 0;
    const remaining = vault.financialGoal > vault.totalDeposited ? vault.financialGoal - vault.totalDeposited : 0n;

    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-2 text-3xl font-bold text-white">Join Savings Goal</h1>
                <p className="mb-8 text-zinc-400">Contribute to the team's target</p>

                <div className="space-y-6">
                    {/* Vault Details */}
                    <div className="rounded-2xl border border-zinc-800 bg-card p-6">
                        <h3 className="mb-4 text-xl font-bold text-white">{vault.name}</h3>

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
                                <p className="text-lg font-bold text-green-500">{formatEther(vault.financialGoal)} ETH</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500">Total Contributed</p>
                                <p className="text-lg font-bold text-white">{formatEther(vault.totalDeposited)} ETH</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500">Remaining Needed</p>
                                <p className="text-white">{formatEther(remaining)} ETH</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500">Deadline</p>
                                <div className="text-white mt-1">
                                    <CountdownTimer targetDate={vault.deadline} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500">Target Address</p>
                                <a
                                    href={`https://sepolia.scrollscan.com/address/${vault.payoutAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                                >
                                    {vault.payoutAddress.slice(0, 6)}...{vault.payoutAddress.slice(-4)} <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Join / Contribute */}
                    {isWrongWallet ? (
                        <div className="rounded-2xl border border-red-800 bg-red-900/10 p-6 text-center">
                            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                            <h3 className="mb-2 text-xl font-bold text-white">Wrong Wallet Connected</h3>
                            <p className="text-zinc-400 mb-2">This invite is for a specific wallet.</p>
                            <div className="mb-6 rounded bg-black/30 p-3 font-mono text-sm text-zinc-300">
                                Expected: <span className="text-yellow-500">{invitee?.slice(0, 8)}...{invitee?.slice(-6)}</span>
                                <br />
                                Connected: <span className="text-red-400">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
                            </div>
                            <p className="text-sm text-zinc-500">Please switch accounts in your wallet.</p>
                        </div>
                    ) : isMember ? (
                        <div className="rounded-2xl border border-green-800 bg-green-900/20 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                <div>
                                    <h3 className="font-bold text-white">You are a Contributor!</h3>
                                    <p className="text-sm text-green-400">You have joined this savings vault.</p>
                                </div>
                            </div>

                            {isActive && remaining > 0n && (
                                <div className="mt-4">
                                    <p className="text-sm text-zinc-400 mb-3">Want to contribute more?</p>
                                    <form onSubmit={handleContribute} className="space-y-3">
                                        <input
                                            type="number"
                                            step="0.000000000000000001"
                                            value={contributionAmount}
                                           onChange={(e) => setContributionAmount(e.target.value)}
                                            placeholder="Additional amount (ETH)"
                                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                            required
                                            disabled={isPending}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isPending}
                                            className="w-full rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {isPending ? (
                                                <><Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Contributing...</>
                                            ) : (
                                                <>Add More</>
                                            )}
                                        </button>
                                    </form>
                                    <Link href={`/vault/${vaultIdString}`} className="block mt-4 text-center text-sm text-green-500 hover:text-green-400">
                                        Go to Vault Dashboard
                                    </Link>
                                </div>
                            )}
                            {(!isActive || remaining === 0n) && (
                                <Link href={`/vault/${vaultIdString}`}>
                                    <button className="w-full rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700">
                                        Go to Vault Dashboard
                                    </button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-zinc-800 bg-card p-6">
                            <h3 className="mb-4 text-xl font-bold text-white">Make a Contribution</h3>

                            {/* Information Banner Removed */}

                            {!isConnected ? (
                                <div className="text-center py-8">
                                    <p className="text-zinc-400 mb-4">Please connect your wallet to contribute</p>
                                </div>
                            ) : !isActive ? (
                                <div className="text-center py-8">
                                    <PiggyBank className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                                    <p className="text-zinc-400">This savings vault is closed.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleContribute} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Contribution Amount (ETH)</label>
                                        <input
                                            type="number"
                                             step="0.000000000000000001"
                                           
                                            value={contributionAmount}
                                            onChange={(e) => setContributionAmount(e.target.value)}
                                            placeholder="0.1"
                                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                            required
                                            disabled={isPending}
                                        />
                                        <p className="text-xs text-zinc-500">
                                            Max: {formatEther(remaining)} ETH
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-4 text-lg font-bold text-white transition-all hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Contributing...
                                            </>
                                        ) : (
                                            <>
                                                <TrendingUp className="h-5 w-5" />
                                                Contribute & Join
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
