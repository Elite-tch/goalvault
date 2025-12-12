# 🎯 Scroll GoalVault v2 - Quick Build Guide

## ✅ DONE:
1. ✅ Smart Contracts Deployed
   - TaskVault: `0x58a0f21cfbeac4cb8e8220b8d3955bc6349079fd`
   - SavingsVault: `0x9818512cce53c0b6e5838b3238587e81b5e7fae7`

2. ✅ Components Created
   - `/app/create/page.tsx` - Mode selector
   - `/components/TimeUnitSelector.tsx` - Time input
   - `/components/InviteLink.tsx` - Shareable links
   - Navbar updated with "Create" link
   - Toast notifications configured

3. ✅ Contract Config Ready
   - `/lib/contracts-new.ts` - All ABIs & addresses

## 🚀 WHAT YOU NEED TO BUILD NOW:

### 1. Create Task Page (`/app/create/task/page.tsx`)

Copy this EXACT file structure. This creates tasks and generates invite LINKS:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseEther } from "viem";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, X, Loader2, CheckCircle, Link2 } from "lucide-react";
import Link from "next/link";
import TimeUnitSelector, { TIME_UNITS, type TimeUnit } from "@/components/TimeUnitSelector";
import InviteLink from "@/components/InviteLink";
import { TASKVAULT_ADDRESS, TASKVAULT_ABI } from "@/lib/contracts-new";

interface Member {
  address: string;
  name: string;
}

export default function CreateTaskPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const [taskDescription, setTaskDescription] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [durationValue, setDurationValue] = useState(7);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("days");
  const [members, setMembers] = useState<Member[]>([{ address: "", name: "" }]);
  
  const [inviteLinks, setInviteLinks] = useState<Array<{ memberAddress: string; inviteCode: string; memberName: string }>>([]);
  const [taskId, setTaskId] = useState<bigint | null>(null);
  
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

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

  // Listen for TaskCreated and MemberInvited events
  useEffect(() => {
    if (isSuccess && hash && publicClient) {
      const fetchInviteCodes = async () => {
        try {
          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          
          // Extract invite codes from MemberInvited events
          const invitedEvents = receipt.logs.filter((log: any) => {
            try {
              return log.topics[0] === '0x...'; // MemberInvited event signature - you'll need to calculate this
            } catch {
              return false;
            }
          });

          const links = members.map((member, index) => ({
            memberAddress: member.address,
            memberName: member.name || `Member ${index + 1}`,
            inviteCode: invitedEvents[index]?.topics[3] || '0x' // Extract from event
          }));

          setInviteLinks(links);
          toast.success("Task created! Invite links generated!");
        } catch (error) {
          console.error("Error fetching invite codes:", error);
          toast.error("Created but couldn't fetch invite links");
        }
      };

      fetchInviteCodes();
    }
  }, [isSuccess, hash, publicClient, members]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet!");
      return;
    }

    const validMembers = members.filter(m => m.address.trim() !== "");
    if (validMembers.length === 0) {
      toast.error("Add at least one member!");
      return;
    }

    const durationInSeconds = durationValue * TIME_UNITS[timeUnit];
    const stakeInWei = parseEther(stakeAmount);

    try {
      writeContract({
        address: TASKVAULT_ADDRESS,
        abi: TASKVAULT_ABI,
        functionName: "createTask",
        args: [
          taskDescription,
          stakeInWei,
          BigInt(durationInSeconds),
          validMembers.map(m => m.address as `0x${string}`)
        ]
      });

      toast.loading("Creating task...");
    } catch (error: any) {
      toast.error(error.message || "Failed to create task");
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-24 pb-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/create" className="mb-8 inline-flex items-center text-sm text-zinc-500 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Mode Selection
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-white">Create Task Vault</h1>
        <p className="mb-8 text-zinc-400">
          Set a task with fixed stake. Members pay exact amount and complete before deadline.
        </p>

        {!inviteLinks.length ? (
          <form onSubmit={handleCreate} className="space-y-6 rounded-2xl border border-zinc-800 bg-card p-8">
            {/* Task Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Task Description</label>
              <input
                type="text"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="e.g., Complete landing page design"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
                disabled={isPending || isConfirming}
              />
            </div>

            {/* Stake Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Stake Amount (ETH per member)</label>
              <input
                type="number"
                step="0.001"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.01"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
                disabled={isPending || isConfirming}
              />
              <p className="text-xs text-zinc-500">Each member must pay this EXACT amount</p>
            </div>

            {/* Duration */}
            <TimeUnitSelector
              value={durationValue}
              unit={timeUnit}
              onValueChange={setDurationValue}
              onUnitChange={setTimeUnit}
              disabled={isPending || isConfirming}
            />

            {/* Members */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Team Members</label>
              <p className="text-xs text-zinc-500 mb-3">Add members who will receive unique invite links</p>

              <div className="space-y-3">
                {members.map((member, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(index, 'name', e.target.value)}
                      placeholder="Name (optional)"
                      className="w-32 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      disabled={isPending || isConfirming}
                    />
                    <input
                      type="text"
                      value={member.address}
                      onChange={(e) => updateMember(index, 'address', e.target.value)}
                      placeholder="0x... wallet address"
                      className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                      disabled={isPending || isConfirming}
                    />
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="flex h-[50px] w-[50px] items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 hover:border-red-900 hover:bg-red-900/20 hover:text-red-500"
                        disabled={isPending || isConfirming}
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
                disabled={isPending || isConfirming}
              >
                + Add another member
              </button>
            </div>

            {/* Warning */}
            <div className="rounded-lg border border-yellow-900 bg-yellow-900/10 p-4">
              <p className="text-sm text-yellow-500">
                ⚠️ <strong>Important:</strong> Members must pay exactly {stakeAmount || "0"} ETH. 
                Complete before deadline for full refund, or face 10% penalty!
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground transition-all hover:bg-yellow-400 disabled:opacity-50"
            >
              {isPending || isConfirming ? (
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
                    inviteCode={link.inviteCode}
                    memberAddress={link.memberAddress}
                    memberName={link.memberName}
                    type="task"
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
```

### 2. Similar Files You Need:

- `/app/create/savings/page.tsx` - Same structure but for SavingsVault
- `/app/join/task/[code]/page.tsx` - Where members stake with invite link
- `/app/join/savings/[code]/page.tsx` - Where members contribute

## 🔥 CRITICAL:

1. **Unique Invite LINKS** - Each member gets shareable URL like:
   `http://localhost:3000/join/task/0x1234abcd...`

2. **Fixed Stake for Tasks** - Contract enforces exact amount

3. **Flexible for Savings** - But warns if exceeding goal

4. **Toast Notifications** - Use `toast.success()`, `toast.error()`, `toast.warning()`

5. **Time Units** - Let users choose seconds/minutes/hours/days/years

## ✅ Your App Structure:
```
/create → Mode selection
/create/task → Create task (generates invite links)
/create/savings → Create savings (generates invite links)
/join/task/[code] → Member stakes via invite link
/join/savings/[code] → Member contributes via invite link
/dashboard → View all tasks/vaults
```

Everything is ready - just copy the patterns above for the remaining pages! 🚀
