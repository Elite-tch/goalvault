"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import toast from "react-hot-toast";
import { Loader2, CheckCircle, AlertTriangle, Clock, Coins, Link2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useVault, useVaultMembers, useJoinVault } from "@/lib/hooks/useGoalVault";
import { VaultStatus } from "@/lib/contracts";
import CountdownTimer from "@/components/CountdownTimer";

export default function JoinTaskPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { address, isConnected } = useAccount();

    // inviteCode is effectively vaultId now
    const vaultIdString = params?.code as string;
    const vaultId = vaultIdString ? BigInt(vaultIdString) : undefined;
    const stakeAmount = searchParams?.get("amount");
    const invitee = searchParams?.get("invitee");

    const { vault, isLoading: isLoadingVault, refetch: refetchVault } = useVault(vaultId);
    const { members, isLoading: isLoadingMembers, refetch: refetchMembers } = useVaultMembers(vaultId);
    const { joinVault, isPending, isSuccess, error } = useJoinVault();

    const isMember = members?.some(m => m.toLowerCase() === address?.toLowerCase());
    const isWrongWallet = isConnected && invitee && address && invitee.toLowerCase() !== address.toLowerCase();

    useEffect(() => {
        if (isSuccess) {
            toast.success("Successfully joined the vault!");
            refetchMembers();
            refetchVault();
            setTimeout(() => {
                router.push(`/vault/${vaultIdString}`);
            }, 2000);
        }
    }, [isSuccess, refetchMembers, refetchVault, router, vaultIdString]);

    useEffect(() => {
        if (error) {
            console.error(error);
            if (error.message.includes("Not whitelisted") || error.message.includes("Not invited")) {
                toast.error("You are not invited to join this vault.");
            } else {
                toast.error("Failed to join vault. Check console for details.");
            }
        }
    }, [error]);

    const handleStake = async () => {
        if (!isConnected) {
            toast.error("Please connect your wallet!");
            return;
        }
        if (!vaultId) return;
        if (!stakeAmount) {
            toast.error("Invalid invite link: missing stake amount");
            return;
        }

        await joinVault(vaultId, stakeAmount);
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
                    <p className="text-zinc-400 mb-4">The invite link might be invalid.</p>
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

    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-2 text-3xl font-bold text-white">Join Task Vault</h1>
                <p className="mb-8 text-zinc-400">Review the commitment and stake to join</p>

                <div className="space-y-6">
                    {/* Vault Details */}
                    <div className="rounded-2xl border border-zinc-800 bg-card p-6">
                        <h3 className="mb-4 text-xl font-bold text-white">Vault Details</h3>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-zinc-500">Name</p>
                                <p className="text-white font-medium">{vault.name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-zinc-500">Required Stake</p>
                                    <p className="text-lg font-bold text-primary">
                                        {stakeAmount ? `${stakeAmount} ETH` : "???? ETH"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">Deadline</p>
                                    <div className="text-white mt-1">
                                        <CountdownTimer targetDate={vault.deadline} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-zinc-500">Host</p>
                                <a
                                    href={`https://sepolia.scrollscan.com/address/${vault.creator}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                                >
                                    {vault.creator.slice(0, 6)}...{vault.creator.slice(-4)} <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Join / Status Section */}
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
                        <div className="rounded-2xl border border-green-800 bg-green-900/20 p-6 text-center">
                            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                            <h3 className="mb-2 text-xl font-bold text-white">You have joined!</h3>
                            <p className="text-zinc-400 mb-6">You are a participant in this vault.</p>
                            <Link href={`/vault/${vaultIdString}`}>
                                <button className="w-full rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors">
                                    Go to Vault Dashboard
                                </button>
                            </Link>
                        </div>
                    ) : !isActive ? (
                        <div className="rounded-2xl border border-red-800 bg-red-900/10 p-6 text-center">
                            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                            <h3 className="mb-2 text-xl font-bold text-white">Vault Unavailable</h3>
                            <p className="text-zinc-400 mb-6">
                                {isExpired ? "This vault has expired." : "This vault is no longer active."}
                            </p>
                            <Link href="/dashboard">
                                <button className="rounded-lg border border-zinc-700 px-6 py-2 text-white hover:bg-zinc-800">
                                    Back to Dashboard
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-zinc-800 bg-card p-6">
                            <h3 className="mb-4 text-xl font-bold text-white">Stake to Join</h3>

                            <div className="mb-6 rounded-lg border border-yellow-900 bg-yellow-900/10 p-4">
                                <p className="text-sm text-yellow-500">
                                    ⚠️ You must stake <strong>exactly {stakeAmount || "???"} ETH</strong> to join.
                                    Funds are returned upon verified completion.
                                </p>
                            </div>

                            {!isConnected ? (
                                <div className="text-center py-8">
                                    <p className="text-zinc-400 mb-4">Please connect your wallet to stake</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleStake}
                                    disabled={isPending}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground transition-all hover:bg-yellow-400 disabled:opacity-50"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Staking...
                                        </>
                                    ) : (
                                        <>
                                            <Coins className="h-5 w-5" />
                                            Stake {stakeAmount} ETH
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
