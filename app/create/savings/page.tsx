"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseEther, decodeEventLog, isAddress } from "viem";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, X, Loader2, CheckCircle, Link2 } from "lucide-react";
import Link from "next/link";
import TimeUnitSelector, { TIME_UNITS, type TimeUnit } from "@/components/TimeUnitSelector";
import InviteLink from "@/components/InviteLink";
import SafetyRulesCard from "@/components/SafetyRulesCard";
import { GOALVAULT_ABI } from "@/lib/contracts";
import { useCreateVault } from "@/lib/hooks/useGoalVault";

interface Member {
    address: string;
    name: string;
}

export default function CreateSavingsPage() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const publicClient = usePublicClient();

    const [vaultName, setVaultName] = useState("");
    const [savingsGoal, setSavingsGoal] = useState("");
    const [payoutAddress, setPayoutAddress] = useState("");
    const [durationValue, setDurationValue] = useState(30);
    const [timeUnit, setTimeUnit] = useState<TimeUnit>("days");
    const [members, setMembers] = useState<Member[]>([{ address: "", name: "" }]);

    const [inviteLinks, setInviteLinks] = useState<Array<{ memberAddress: string; inviteCode: string; memberName: string; queryParams?: Record<string, string> }>>([]);

    const { createVault, isPending, isSuccess, hash, error } = useCreateVault();
    // note: useCreateVault already handles the writeContract call

    const addMember = () => {
        setMembers([...members, { address: "", name: "" }]);
    };

    const removeMember = (index: number) => {
        if (members.length > 1) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const updateMember = (index: number, field: 'address' | 'name', value: string) => {
        const newMembers = [...members];
        newMembers[index][field] = value;
        setMembers(newMembers);
    };

    // Extract invite codes from transaction
    useEffect(() => {
        if (isSuccess && hash && publicClient) {
            const fetchInviteCodes = async () => {
                try {
                    const receipt = await publicClient.waitForTransactionReceipt({ hash });

                    const createdEvents = receipt.logs
                        .map(log => {
                            try {
                                return decodeEventLog({
                                    abi: GOALVAULT_ABI,
                                    data: log.data,
                                    topics: log.topics,
                                });
                            } catch {
                                return null;
                            }
                        })
                        .filter(event => event && event.eventName === 'VaultCreated');

                    if (createdEvents.length > 0 && createdEvents[0]) {
                        const args = createdEvents[0].args as { vaultId: bigint };
                        const vaultId = args.vaultId;

                        // Suggest equal split for savings
                        const splitAmount = members.length > 0
                            ? (Number(savingsGoal) / members.length).toFixed(4)
                            : "0";

                        // Generate links for each member based on Vault ID
                        const links = members.map((m, i) => ({
                            memberAddress: m.address,
                            memberName: m.name || `Member ${i + 1}`,
                            inviteCode: vaultId.toString(),
                            queryParams: {
                                invitee: m.address,
                                amount: splitAmount
                            }
                        }));
                        setInviteLinks(links);
                    }

                } catch (error) {
                    console.error("Error fetching vault id:", error);
                }
            };

            fetchInviteCodes();
        }
    }, [isSuccess, hash, publicClient, members, savingsGoal]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            toast.error("Please connect your wallet!");
            return;
        }

        if (!isAddress(payoutAddress)) {
            toast.error("Invalid payout address!");
            return;
        }

        const validMembers = members.filter(m => m.address.trim() !== "");
        // GoalVault doesn't strictly need members array at creation if we just share link, 
        // but user workflow expects adding members.
        // We will just use these for generating the "invite list" locally.

        if (validMembers.length === 0) {
            toast.error("Add at least one member to invite!");
            return;
        }

        // 0 tasks for Savings Vault
        const durationInSeconds = durationValue * TIME_UNITS[timeUnit];
        const memberAddresses = validMembers.map(m => m.address);

        await createVault(
            vaultName,
            savingsGoal,
            durationInSeconds,
            0, // requiredTasksPerMember
            [], // taskDescriptions
            payoutAddress,
            memberAddresses // Allowed members
        );
    };

    useEffect(() => {
        if (isSuccess) {
            toast.dismiss();
            toast.success("Savings vault created successfully!");
        }
    }, [isSuccess]);

    useEffect(() => {
        if (error) {
            toast.dismiss();
            toast.error("Failed to create savings vault");
        }
    }, [error]);

    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12">
            <div className="mx-auto max-w-3xl">
                <Link href="/create" className="mb-8 inline-flex items-center text-sm text-zinc-500 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Mode Selection
                </Link>

                <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-white">Create Savings Vault</h1>
                <p className="mb-8 text-zinc-400">
                    Set a savings goal. Members contribute flexibly. Funds locked until deadline.
                </p>

                {!inviteLinks.length ? (
                    <form onSubmit={handleCreate} className="space-y-6 rounded-2xl border border-zinc-800 bg-card p-8">
                        <div className="space-y-2">
                            <label className="text-sm  font-medium text-zinc-300">Vault Name</label>
                            <input
                                type="text"
                                value={vaultName}
                                onChange={(e) => setVaultName(e.target.value)}
                                placeholder="e.g., Team Trip Fund 2025"
                                className="w-full rounded-lg mt-3 border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm  font-medium text-zinc-300">Savings Goal (ETH)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={savingsGoal}
                                onChange={(e) => setSavingsGoal(e.target.value)}
                                placeholder="1.0"
                                className="w-full rounded-lg mt-3 border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                required
                                disabled={isPending}
                            />
                            <p className="text-xs text-zinc-500">Total amount you want to save together</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm  font-medium text-zinc-300">Payout Address</label>
                            <input
                                type="text"
                                value={payoutAddress}
                                onChange={(e) => setPayoutAddress(e.target.value)}
                                placeholder="0x... where funds go if goal is met"
                                className="w-full rounded-lg mt-3 border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                required
                                disabled={isPending}
                            />
                            <p className="text-xs text-zinc-500">Where funds will be sent if goal is reached</p>
                        </div>

                        <TimeUnitSelector
                            value={durationValue}
                            unit={timeUnit}
                            onValueChange={setDurationValue}
                            onUnitChange={setTimeUnit}
                            disabled={isPending}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Team Members</label>
                            <p className="text-xs text-zinc-500 mb-3">Add members to generate invite links for them</p>

                            <div className="space-y-3">
                                {members.map((member, index) => (
                                    <div key={index} className="flex md:flex-row flex-col gap-2">
                                        <input
                                            type="text"
                                            value={member.name}
                                            onChange={(e) => updateMember(index, 'name', e.target.value)}
                                            placeholder="Name (optional)"
                                            className="w-32 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                                            disabled={isPending}
                                        />
                                        <input
                                            type="text"
                                            value={member.address}
                                            onChange={(e) => updateMember(index, 'address', e.target.value)}
                                            placeholder="0x... wallet address"
                                            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            required
                                            disabled={isPending}
                                        />
                                        {members.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMember(index)}
                                                className="flex h-[50px] w-[50px] items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 hover:border-red-900 hover:bg-red-900/20 hover:text-red-500"
                                                disabled={isPending}
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addMember}
                                className="mt-2 text-sm font-medium text-primary hover:text-yellow-400 hover:underline"
                                disabled={isPending}
                            >
                                + Add another member
                            </button>
                        </div>

                        <div className="rounded-lg border border-green-900 bg-green-900/10 p-4">
                            <p className="text-sm text-green-500">
                                💰 <strong>Note:</strong> Members can contribute any amount.
                                Funds are locked until deadline. Goal met = sent to payout address. Goal not met = refunded.
                            </p>
                        </div>

                        {savingsGoal && parseFloat(savingsGoal) > 0 && (
                            <SafetyRulesCard type="savings" stakeAmount={savingsGoal} />
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-4 text-lg font-bold text-white transition-all hover:bg-green-700 disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Creating Vault...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    Create Savings Vault & Generate Links
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-green-800 bg-green-900/20 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                <div>
                                    <h3 className="text-lg font-bold text-white">Savings Vault Created!</h3>
                                    <p className="text-sm text-green-400">Share this link with your team to join.</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-card p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Link2 className="h-5 w-5" />
                                    Invite Links
                                </h3>
                                <span className="text-sm text-zinc-500">{inviteLinks.length} members</span>
                            </div>

                            <div className="space-y-3">
                                {inviteLinks.map((link, index) => (
                                    <InviteLink
                                        key={index}
                                        // Use Vault ID as the "code" so the link is /vault/[id]
                                        inviteCode={link.inviteCode}
                                        memberAddress={link.memberAddress}
                                        memberName={link.memberName}
                                        type="savings"
                                        queryParams={link.queryParams}
                                    />
                                ))}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Link href="/dashboard" className="flex-1">
                                    <button className="w-full rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors">
                                        Go to Dashboard
                                    </button>
                                </Link>
                                <button
                                    onClick={() => {
                                        setInviteLinks([]);
                                        setVaultName("");
                                        setSavingsGoal("");
                                        setPayoutAddress("");
                                        setMembers([{ address: "", name: "" }]);
                                    }}
                                    className="rounded-lg border border-zinc-800 px-6 py-3 font-medium text-white hover:bg-zinc-800 transition-colors"
                                >
                                    Create Another
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
