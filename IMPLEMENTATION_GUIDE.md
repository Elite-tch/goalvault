# 🎯 Scroll GoalVault v2 - Complete Implementation Guide

## ✅ What's Been Completed

### 1. Smart Contracts Deployed
- **TaskVault**: `0x58a0f21cfbeac4cb8e8220b8d3955bc6349079fd`
- **SavingsVault**: `0x9818512cce53c0b6e5838b3238587e81b5e7fae7`
- Both verified and live on Scroll Sepolia

### 2. Core Features Implemented

#### Feature 1: Task Accountability System ✅
- Fixed stake amounts per task
- Unique invite codes per member
- Complete before deadline = full refund
- Miss deadline = 10% penalty to `0x2B6AEdfBacAFff4b393E534f7c1e512a4930dA12`
- Time unit selector (seconds, minutes, hours, days, years)

#### Feature 2: Group Savings ✅
- Flexible contribution amounts
- Money locked until deadline
- Goal met = funds go to payout address
- Goal not met = 10% penalty, rest refunded
- Unique invite codes per member

### 3. Frontend Setup ✅
- React-hot-toast installed and configured
- Toaster added to layout
- Contract addresses and ABIs ready

## 📋 Next Steps: Frontend Implementation

You need to create these pages/components:

### 1. Mode Selection Page (`/app/create/page.tsx`)
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckSquare, PiggyBank, ArrowRight } from "lucide-react";

export default function CreateModePage() {
  return (
    <div className="min-h-screen bg-background px-6 pt-24 pb-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold text-white text-center">
          Choose Your Mode
        </h1>
        <p className="mb-12 text-center text-zinc-400">
          Select how you want to use Scroll GoalVault
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Task Mode */}
          <Link href="/create/task">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer rounded-2xl border border-zinc-800 bg-gradient-to-br from-primary/5 to-transparent p-8 transition-all hover:border-primary/50"
            >
              <CheckSquare className="mb-4 h-12 w-12 text-primary" />
              <h2 className="mb-2 text-2xl font-bold text-white">
                Task Accountability
              </h2>
              <p className="mb-6 text-zinc-400">
                Create tasks with fixed stakes. Members complete before deadline or face penalties.
              </p>
              <ul className="mb-6 space-y-2 text-sm text-zinc-500">
                <li>✓ Fixed stake per task</li>
                <li>✓ Complete on time = full refund</li>
                <li>✓ Miss deadline = 10% penalty</li>
                <li>✓ Unique invite links</li>
              </ul>
              <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                Create Task Vault <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
          </Link>

          {/* Savings Mode */}
          <Link href="/create/savings">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer rounded-2xl border border-zinc-800 bg-gradient-to-br from-green-500/5 to-transparent p-8 transition-all hover:border-green-500/50"
            >
              <PiggyBank className="mb-4 h-12 w-12 text-green-500" />
              <h2 className="mb-2 text-2xl font-bold text-white">
                Group Savings
              </h2>
              <p className="mb-6 text-zinc-400">
                Set a savings goal. Members contribute flexibly. Funds locked until deadline.
              </p>
              <ul className="mb-6 space-y-2 text-sm text-zinc-500">
                <li>✓ Flexible contribution amounts</li>
                <li>✓ Funds locked until deadline</li>
                <li>✓ Goal met = payout to address</li>
                <li>✓ Goal not met = refund with penalty</li>
              </ul>
              <div className="flex items-center gap-2 text-green-500 font-medium group-hover:gap-3 transition-all">
                Create Savings Vault <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 2. Time Unit Selector Component (`/components/TimeUnitSelector.tsx`)
```tsx
"use client";

import { TIME_UNITS, type TimeUnit } from "@/lib/contracts-new";

interface TimeUnitSelectorProps {
  value: number;
  unit: TimeUnit;
  onValueChange: (value: number) => void;
  onUnitChange: (unit: TimeUnit) => void;
}

export default function TimeUnitSelector({
  value,
  unit,
  onValueChange,
  onUnitChange
}: TimeUnitSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">Duration</label>
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          value={value}
          onChange={(e) => onValueChange(parseInt(e.target.value) || 1)}
          className="w-24 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
          placeholder="1"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as TimeUnit)}
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
        >
          <option value="seconds">Seconds</option>
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
          <option value="years">Years</option>
        </select>
      </div>
      <p className="text-xs text-zinc-500">
        Total: {value * TIME_UNITS[unit]} seconds
      </p>
    </div>
  );
}
```

### 3. Invite Link Component (`/components/InviteLink.tsx`)
```tsx
"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

interface InviteLinkProps {
  inviteCode: string;
  memberAddress: string;
  type: "task" | "savings";
}

export default function InviteLink({ inviteCode, memberAddress, type }: InviteLinkProps) {
  const [copied, setCopied] = useState(false);
  
  const link = `${window.location.origin}/join/${type}/${inviteCode}`;
  
  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-zinc-400">
          {memberAddress.slice(0, 6)}...{memberAddress.slice(-4)}
        </span>
        <button
          onClick={copyLink}
          className="flex items-center gap-1 text-xs text-primary hover:text-yellow-400"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy Link
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-zinc-600 break-all font-mono">{link}</p>
    </div>
  );
}
```

## 🔧 Key Implementation Notes

### Converting Time to Seconds
```typescript
import { TIME_UNITS, type TimeUnit } from "@/lib/contracts-new";

const durationValue = 7; // user input
const timeUnit: TimeUnit = "days"; // user selection

const durationInSeconds = durationValue * TIME_UNITS[timeUnit];
// For 7 days: 7 * 86400 = 604800 seconds
```

### Creating Task with Invite Codes
```typescript
import { useWriteContract } from "wagmi";
import { TASKVAULT_ADDRESS, TASKVAULT_ABI } from "@/lib/contracts-new";
import { parseEther } from "viem";
import toast from "react-hot-toast";

const { writeContract } = useWriteContract();

const createTask = async () => {
  const memberAddresses = ["0x123...", "0x456..."];
  const stakeAmount = parseEther("0.01"); // 0.01 ETH per member
  const duration = 7 * 86400; // 7 days in seconds
  
  try {
    const hash = await writeContract({
      address: TASKVAULT_ADDRESS,
      abi: TASKVAULT_ABI,
      functionName: "createTask",
      args: [
        "Complete landing page",
        stakeAmount,
        BigInt(duration),
        memberAddresses
      ]
    });
    
    toast.success("Task created! Generating invite links...");
    
    // Listen for TaskCreated event to get invite codes
    // Then display invite links to user
  } catch (error) {
    toast.error("Failed to create task");
  }
};
```

### Member Staking with Invite Code
```typescript
// When member clicks invite link: /join/task/0x1234abcd...
const inviteCode = "0x1234abcd..." as `0x${string}`;
const stakeAmount = parseEther("0.01");

const stake = async () => {
  try {
    const hash = await writeContract({
      address: TASKVAULT_ADDRESS,
      abi: TASKVAULT_ABI,
      functionName: "stakeWithInvite",
      args: [inviteCode],
      value: stakeAmount
    });
    
    toast.success("Staked successfully!");
  } catch (error: any) {
    if (error.message.includes("Must stake exact amount")) {
      toast.error("You must stake exactly the required amount!");
    } else {
      toast.error("Staking failed");
    }
  }
};
```

### Preventing Overpayment in Savings
```typescript
// In savings vault, check before contribution
const contributeToSavings = async (amount: bigint) => {
  const vault = await readContract({
    address: SAVINGSVAULT_ADDRESS,
    abi: SAVINGSVAULT_ABI,
    functionName: "getVault",
    args: [vaultId]
  });
  
  const remaining = vault.savingsGoal - vault.totalContributed;
  
  if (amount > remaining) {
    toast.error(`Cannot contribute more than ${formatEther(remaining)} ETH. Goal almost reached!`);
    return;
  }
  
  // Proceed with contribution
  try {
    await writeContract({
      address: SAVINGSVAULT_ADDRESS,
      abi: SAVINGSVAULT_ABI,
      functionName: "contributeWithInvite",
      args: [inviteCode],
      value: amount
    });
    
    toast.success("Contribution successful!");
  } catch (error) {
    toast.error("Contribution failed");
  }
};
```

## 📂 File Structure

```
syncvault/
├── contracts/
│   ├── TaskVault.sol         ✅ Deployed
│   ├── SavingsVault.sol      ✅ Deployed
│   └── GoalVault.sol         (old - keeping)
├── app/
│   ├── create/
│   │   ├── page.tsx          (mode selector)
│   │   ├── task/
│   │   │   └── page.tsx      (create task)
│   │   └── savings/
│   │       └── page.tsx      (create savings)
│   ├── join/
│   │   ├── task/
│   │   │   └── [code]/
│   │   │       └── page.tsx  (stake with invite)
│   │   └── savings/
│   │       └── [code]/
│   │           └── page.tsx  (contribute with invite)
│   └── dashboard/
│       └── page.tsx          (view all tasks/vaults)
├── components/
│   ├── TimeUnitSelector.tsx
│   ├── InviteLink.tsx
│   └── MemberList.tsx
└── lib/
    ├── contracts-new.ts      ✅ Created
    └── hooks/
        ├── useTaskVault.ts   (create this)
        └── useSavingsVault.ts (create this)
```

## 🎯 To Win the Hackathon

### Critical Features to Polish:
1. **Unique Link UX** - Make copying links super easy
2. **Real-time Updates** - Show live progress as members stake/contribute
3. **Countdown Timers** - Visual countdown to deadline
4. **Penalty Warnings** - Clear warnings about 10% penalty
5. **Mobile Responsive** - Works perfectly on mobile
6. **Error Messages** - Clear toast notifications for all errors
7. **Success Animations** - Celebrate when goals are met
8. **Dashboard** - Beautiful overview of all tasks/vaults

### Demo Flow:
1. Show mode selection (Task vs Savings)
2. Create a task with 2 members
3. Show generated invite links
4. Simulate member joining via link
5. Show countdown timer
6. Complete task before deadline
7. Show automatic refund
8. Repeat for savings mode

### Presentation Points:
- ✅ Two distinct use cases solved
- ✅ Unique invite link system (no manual address entry)
- ✅ Flexible time units (seconds to years)
- ✅ Automatic penalty system
- ✅ Locked funds until deadline
- ✅ Built on Scroll zkEVM
- ✅ Production-ready smart contracts

## 🚀 Deploy & Test

All contracts are deployed and verified. Just build the frontend following this guide!

**Contracts Live:**
- TaskVault: https://sepolia.scrollscan.com/address/0x58a0f21cfbeac4cb8e8220b8d3955bc6349079fd
- SavingsVault: https://sepolia.scrollscan.com/address/0x9818512cce53c0b6e5838b3238587e81b5e7fae7

Good luck with the hackathon! 🏆
