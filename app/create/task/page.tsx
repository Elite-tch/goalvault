"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseEther, decodeEventLog } from "viem";
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
    specificTask: string;
}

export default function CreateTaskPage() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const publicClient = usePublicClient();

    const [projectName, setProjectName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [stakeAmount, setStakeAmount] = useState("");
    const [durationValue, setDurationValue] = useState(7);
    const [timeUnit, setTimeUnit] = useState<TimeUnit>("days");
    const [members, setMembers] = useState<Member[]>([{ address: "", name: "", specificTask: "" }]);

    const [inviteLinks, setInviteLinks] = useState<Array<{ memberAddress: string; vaultId: string; memberName: string; queryParams: any }>>([]);

    // Use GoalVault hook
    const { createVault, isPending, isSuccess, hash, error } = useCreateVault();

    const addMember = () => {
        setMembers([...members, { address: "", name: "", specificTask: "" }]);
    };

    const removeMember = (index: number) => {
        if (members.length > 1) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const updateMember = (index: number, field: 'address' | 'name' | 'specificTask', value: string) => {
        const newMembers = [...members];
        newMembers[index][field] = value;
        setMembers(newMembers);
    };
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
                        const vaultId = args.vaultId.toString();
                        const amount = stakeAmount; // Assuming same amount for all

                        const links = members.map((m, i) => ({
                            memberAddress: m.address,
                            memberName: m.name || `Member ${i + 1}`,
                            vaultId: vaultId,
                            queryParams: { invitee: m.address, amount: amount }
                        }));
                        setInviteLinks(links);
                    }
                } catch (error) {
                    console.error("Error fetching vault id:", error);
                }
            };

            fetchInviteCodes();
        }
    }, [isSuccess, hash, publicClient, members, stakeAmount]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            toast.error("Please connect your wallet!");
            return;
        }

        if (!projectName.trim()) {
            toast.error("Please enter a Project Name!");
            return;
        }

        const validMembers = members.filter(m => m.address.trim() !== "");
        if (validMembers.length === 0) {
            toast.error("Add at least one member!");
            return;
        }

        // Calculate Total Financial Goal
        const totalGoalEth = (parseFloat(stakeAmount) * validMembers.length).toString();

        const durationInSeconds = durationValue * TIME_UNITS[timeUnit];
        const memberAddresses = validMembers.map(m => m.address);

        let specificTasks: string[] = [];
        const hasSpecificTasks = validMembers.some(m => m.specificTask.trim() !== "");

        if (hasSpecificTasks) {
            // Check if ALL members have a specific task or fallback to description
            specificTasks = validMembers.map(m => {
                const t = m.specificTask.trim() || taskDescription;
                if (!t) throw new Error("Missing task for member " + m.name);
                return t;
            });
        } else {
            if (!taskDescription.trim()) {
                toast.error("Please provide a task description!");
                return;
            }
        }

        try {
            await createVault(
                projectName, // Use Project Name
                totalGoalEth,
                durationInSeconds,
                1,
                hasSpecificTasks ? [] : [taskDescription],
                "0x0000000000000000000000000000000000000000",
                memberAddresses,
                true, // Task vaults are always private by default (whitelist needed for task assignment)
                specificTasks
            );
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Validation Error");
        }
    };

    useEffect(() => {
        if (isSuccess) {
            toast.dismiss();
            toast.success("Task created successfully!");
        }
    }, [isSuccess]);

    useEffect(() => {
        if (error) {
            toast.dismiss();
            toast.error("Failed to create task");
        }
    }, [error]);

    return (
        <div className="min-h-screen bg-background px-6 pt-24 pb-12">
            <div className="mx-auto max-w-3xl">
                <Link href="/create" className="mb-8 inline-flex items-center text-sm text-zinc-500 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Mode Selection
                </Link>

                <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-white">Create Task Vault</h1>
                <p className="mb-8 text-zinc-400">
                    Set a task with fixed stake. Members pay exact amount and complete before deadline.
                </p>

                {!inviteLinks.length ? (
                    <form onSubmit={handleCreate} className="space-y-6 rounded-2xl border border-zinc-800 bg-card p-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Project Name</label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="e.g. FlareStudio Frontend"
                                className="w-full mt-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Task Description (Global Template)</label>
                            <input
                                type="text"
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                placeholder="e.g., Complete assigned module"
                                className="w-full mt-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                disabled={isPending}
                            />
                            <p className="text-xs text-zinc-500">Optional: Used if a member has no specific task assigned.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Stake Amount (ETH per member)</label>
                            <input
                                type="number"
                                step="0.001"
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(e.target.value)}
                                placeholder="0.01"
                                className="w-full mt-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                required
                                disabled={isPending}
                            />
                            <p className="text-xs text-zinc-500">Each member must pay this EXACT amount</p>
                        </div>

                        <TimeUnitSelector
                            value={durationValue}
                            unit={timeUnit}
                            onValueChange={setDurationValue}
                            onUnitChange={setTimeUnit}
                            disabled={isPending}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Team Members & Tasks</label>
                            <p className="text-xs text-zinc-500 mb-3">Assign specific tasks to each member.</p>

                            <div className="space-y-3">
                                {members.map((member, index) => (
                                    <div key={index} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                                        <div className="flex md:flex-row flex-col gap-2">
                                            <input
                                                type="text"
                                                value={member.name}
                                                onChange={(e) => updateMember(index, 'name', e.target.value)}
                                                placeholder="Member Name"
                                                className="w-full md:w-1/3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-600 focus:border-primary focus:outline-none text-sm"
                                                disabled={isPending}
                                            />
                                            <input
                                                type="text"
                                                value={member.address}
                                                onChange={(e) => updateMember(index, 'address', e.target.value)}
                                                placeholder="0x... Wallet Address"
                                                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-600 focus:border-primary focus:outline-none text-sm font-mono"
                                                required
                                                disabled={isPending}
                                            />
                                            {members.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMember(index)}
                                                    className="p-2 text-zinc-500 hover:text-red-500"
                                                    disabled={isPending}
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={member.specificTask}
                                            onChange={(e) => updateMember(index, 'specificTask', e.target.value)}
                                            placeholder={`Specific Task for ${member.name || 'Member'} (e.g. Build Hero Section)`}
                                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-primary placeholder-zinc-600 focus:border-primary focus:outline-none text-sm"
                                            disabled={isPending}
                                        />
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

                        <div className="rounded-lg border border-yellow-900 bg-yellow-900/10 p-4">
                            <p className="text-sm text-yellow-500">
                                ⚠️ <strong>Important:</strong> Members must pay exactly {stakeAmount || "0"} ETH.
                                Complete before deadline for full refund.
                            </p>
                        </div>

                        {stakeAmount && parseFloat(stakeAmount) > 0 && (
                            <SafetyRulesCard type="task" stakeAmount={stakeAmount} />
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground transition-all hover:bg-yellow-400 disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Creating Task...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    Create Task & Generate Links
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
                                    <h3 className="text-lg font-bold text-white">Task Created Successfully!</h3>
                                    <p className="text-sm text-green-400">Share these unique invite links with your team</p>
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
                                        inviteCode={link.vaultId}
                                        memberAddress={link.memberAddress}
                                        memberName={link.memberName}
                                        type="task"
                                        queryParams={link.queryParams}
                                    />
                                ))}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Link href="/dashboard" className="flex-1">
                                    <button className="w-full rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-yellow-400 transition-colors">
                                        Go to Dashboard
                                    </button>
                                </Link>
                                <button
                                    onClick={() => {
                                        setInviteLinks([]);
                                        setTaskDescription("");
                                        setStakeAmount("");
                                        setMembers([{ address: "", name: "", specificTask: "" }]);
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
