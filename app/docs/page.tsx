"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    BookOpen, ChevronRight, Wallet, Plus, Users, CheckCircle,
    Key, Target, Shield, Gift, AlertTriangle, Menu, X
} from "lucide-react";

// Helper component for rendering formatted text with links
function FormattedText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <p className={`mb-3 text-zinc-300 ${className}`}>{children}</p>;
}

function BulletPoint({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`ml-4 flex gap-2 text-zinc-300 ${className}`}>
            <span className="text-primary">•</span>
            <span>{children}</span>
        </div>
    );
}

function NumberedItem({ number, children }: { number: number; children: React.ReactNode }) {
    return (
        <div className="ml-4 flex gap-2 text-zinc-300">
            <span className="font-bold text-primary">{number}.</span>
            <span>{children}</span>
        </div>
    );
}

function Bold({ children }: { children: React.ReactNode }) {
    return <strong className="font-bold text-white">{children}</strong>;
}

function PageLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="font-medium text-zinc-400 underline decoration-zinc-600 hover:text-zinc-300 hover:decoration-zinc-500"
        >
            {children}
        </Link>
    );
}

const docsContent = {
    "getting-started": {
        title: "Getting Started",
        icon: BookOpen,
        content: (
            <>
                <FormattedText>
                    GoalVault is a decentralized platform built on Scroll that helps teams achieve financial goals through collaborative savings and task accountability. There are two types of vaults you can create or join:
                </FormattedText>

                <div className="my-6 space-y-4">
                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">1. Savings Vault</h3>
                        <FormattedText>
                            A collaborative savings vault where team members contribute funds toward a shared financial goal. Features include:
                        </FormattedText>
                        <div className="space-y-2">
                            <BulletPoint><Bold>Shared Goal:</Bold> Set a collective savings target</BulletPoint>
                            <BulletPoint><Bold>Member Contributions:</Bold> Each member can contribute any amount up to the remaining goal</BulletPoint>
                            <BulletPoint><Bold>Deadline:</Bold> Set a time limit for reaching your goal</BulletPoint>
                            <BulletPoint><Bold>Penalty System:</Bold> If the goal isn't met by the deadline, a 10% penalty is deducted from refunds</BulletPoint>
                            <BulletPoint><Bold>Invite System:</Bold> Easy member onboarding with unique invite codes</BulletPoint>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">2. Goal Vault (Task + Savings)</h3>
                        <FormattedText>
                            Combines savings with task accountability. Perfect for teams working toward a goal that requires both financial commitment and completing specific actions:
                        </FormattedText>
                        <div className="space-y-2">
                            <BulletPoint><Bold>Financial Goal:</Bold> Set a total amount to be saved</BulletPoint>
                            <BulletPoint><Bold>Task Requirements:</Bold> Define how many tasks each member must complete</BulletPoint>
                            <BulletPoint><Bold>Task Verification:</Bold> Vault creator verifies completed tasks</BulletPoint>
                            <BulletPoint><Bold>Dual Requirements:</Bold> Funds are only released when BOTH the financial goal is met AND all members' tasks are verified</BulletPoint>
                            <BulletPoint><Bold>Accountability:</Bold> Ensures everyone contributes both financially and through actions</BulletPoint>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Prerequisites</h3>
                        <FormattedText>Before you start, make sure you have:</FormattedText>
                        <div className="space-y-2">
                            <NumberedItem number={1}><Bold>A Web3 Wallet</Bold> (MetaMask, Rainbow, WalletConnect supported)</NumberedItem>
                            <NumberedItem number={2}><Bold>Scroll Sepolia ETH</Bold> for testing (get from Scroll faucet)</NumberedItem>
                            <NumberedItem number={3}><Bold>Basic understanding</Bold> of blockchain transactions</NumberedItem>
                        </div>
                    </div>
                </div>
            </>
        )
    },
    "create-savings-vault": {
        title: "Creating a Savings Vault",
        icon: Plus,
        content: (
            <>
                <div className="space-y-6">
                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Step 1: Navigate to Create Page</h3>
                        <FormattedText>
                            Click on <PageLink href="/create">"Create"</PageLink> in the navigation bar, then select "Savings Vault" from the vault type options.
                        </FormattedText>
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Step 2: Set Vault Details</h3>
                        <FormattedText>Fill in the following information:</FormattedText>

                        <div className="mt-4 space-y-4">
                            <div>
                                <p className="mb-2 font-bold text-white">Vault Name (Required)</p>
                                <BulletPoint>Give your vault a descriptive name</BulletPoint>
                                <BulletPoint>Example: "Summer Vacation Fund" or "Team Equipment Fund"</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Savings Goal (Required)</p>
                                <BulletPoint>Enter the total amount you want to save in ETH</BulletPoint>
                                <BulletPoint>Example: 1.0 ETH</BulletPoint>
                                <BulletPoint>This is the collective target for all members</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Deadline (Required)</p>
                                <BulletPoint>Set the date by which the goal should be reached</BulletPoint>
                                <BulletPoint>Use the date picker to select your target date</BulletPoint>
                                <BulletPoint>Format: YYYY-MM-DD</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Payout Address (Required)</p>
                                <BulletPoint>Enter the Ethereum address where funds will be sent when the goal is met</BulletPoint>
                                <BulletPoint>This could be a project wallet, team treasury, or organizer's address</BulletPoint>
                                <BulletPoint className="my-2 rounded-lg bg-zinc-900 p-3">⚠️ Double-check this address - it cannot be changed later!</BulletPoint>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Step 3: Create the Vault</h3>
                        <div className="space-y-2">
                            <NumberedItem number={1}>Review all your inputs carefully</NumberedItem>
                            <NumberedItem number={2}>Click "Create Savings Vault"</NumberedItem>
                            <NumberedItem number={3}>Approve the transaction in your wallet</NumberedItem>
                            <NumberedItem number={4}>Wait for confirmation (should take a few seconds on Scroll Sepolia)</NumberedItem>
                            <NumberedItem number={5}>You'll see a success message with your vault details</NumberedItem>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Step 4: Share Invite Code</h3>
                        <FormattedText>After creation, you'll receive a unique invite code. Share this code with team members so they can join:</FormattedText>
                        <div className="space-y-2">
                            <BulletPoint>Copy the invite link from the success dialog</BulletPoint>
                            <BulletPoint>Share via messaging apps, email, or social media</BulletPoint>
                            <BulletPoint>Members can join by visiting the provided link</BulletPoint>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Important Notes</h3>
                        <div className="space-y-3">
                            <div className="rounded-lg bg-zinc-900 p-3 text-zinc-300">
                                <p className="font-bold text-yellow-500">⚠️ Penalty System:</p>
                                <p>If the savings goal is not reached by the deadline:</p>
                                <BulletPoint>Members can request refunds</BulletPoint>
                                <BulletPoint>A 10% penalty will be deducted from each refund</BulletPoint>
                                <BulletPoint>The penalty helps ensure serious commitment</BulletPoint>
                            </div>
                            <div className="rounded-lg bg-zinc-900 p-3 text-zinc-300">
                                <p className="font-bold text-green-500">✅ Success Path:</p>
                                <p>When the goal IS reached by the deadline:</p>
                                <BulletPoint>All funds are automatically sent to the payout address</BulletPoint>
                                <BulletPoint>Members cannot withdraw their individual contributions</BulletPoint>
                                <BulletPoint>The vault is considered completed</BulletPoint>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    },
    "create-goal-vault": {
        title: "Creating a Goal Vault",
        icon: Target,
        content: (
            <>
                <div className="space-y-6">
                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Step 1: Navigate to Create Page</h3>
                        <FormattedText>
                            Click on <PageLink href="/create">"Create"</PageLink> in the navigation bar, then select "Goal Vault (Task + Savings)" from the vault type options.
                        </FormattedText>
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Step 2: Set Financial Details</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <p className="mb-2 font-bold text-white">Vault Name (Required)</p>
                                <BulletPoint>Choose a name that reflects both the savings goal and tasks</BulletPoint>
                                <BulletPoint>Example: "Fitness Challenge Fund" or "Skill Development Pool"</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Financial Goal (Required)</p>
                                <BulletPoint>Total amount to be saved collectively in ETH</BulletPoint>
                                <BulletPoint>Example: 0.5 ETH</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Deposit Amount Per Member (Required)</p>
                                <BulletPoint>Fixed amount each member must deposit to join</BulletPoint>
                                <BulletPoint>Example: 0.1 ETH</BulletPoint>
                                <BulletPoint>This ensures equal commitment from all members</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Deadline (Required)</p>
                                <BulletPoint>Date by which both financial and task goals must be met</BulletPoint>
                                <BulletPoint>Tasks must be completed AND verified before this date</BulletPoint>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Step 3: Set Task Requirements</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <p className="mb-2 font-bold text-white">Required Tasks Per Member (Required)</p>
                                <BulletPoint>Number of tasks each member must complete</BulletPoint>
                                <BulletPoint>Example: 3 tasks</BulletPoint>
                                <BulletPoint>All tasks must be verified by you (the creator)</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Task Descriptions (Optional but Recommended)</p>
                                <BulletPoint>Provide clear descriptions for each task</BulletPoint>
                                <BulletPoint>Be specific about requirements</BulletPoint>
                                <FormattedText className="ml-8">Examples:</FormattedText>
                                <div className="ml-12 space-y-1">
                                    <p className="text-zinc-400">- "Complete 10 workout sessions"</p>
                                    <p className="text-zinc-400">- "Submit weekly progress report"</p>
                                    <p className="text-zinc-400">- "Attend all team meetings"</p>
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Verification Criteria</p>
                                <BulletPoint>Define how you'll verify task completion</BulletPoint>
                                <BulletPoint>Could be through photos, reports, check-ins, etc.</BulletPoint>
                                <BulletPoint>Make sure members understand the requirements</BulletPoint>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Step 4: Set Payout Address</h3>
                        <p className="mb-2 font-bold text-white">Payout Address (Required)</p>
                        <FormattedText>Where funds go when ALL conditions are met:</FormattedText>
                        <div className="ml-4 space-y-1">
                            <p className="text-green-400">✅ Financial goal reached</p>
                            <p className="text-green-400">✅ All members' tasks verified</p>
                        </div>
                        <div className="my-3 rounded-lg bg-zinc-900 p-3 text-yellow-500">
                            ⚠️ Cannot be changed after creation!
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Step 5: Create and Share</h3>
                        <div className="space-y-2">
                            <NumberedItem number={1}>Review all settings</NumberedItem>
                            <NumberedItem number={2}>Click "Create Goal Vault"</NumberedItem>
                            <NumberedItem number={3}>Approve the transaction</NumberedItem>
                            <NumberedItem number={4}>Share the invite code with team members</NumberedItem>
                            <NumberedItem number={5}>Monitor progress on the <PageLink href="/dashboard">dashboard</PageLink></NumberedItem>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Your Responsibilities as Creator</h3>
                        <FormattedText>As the vault creator, you have important responsibilities:</FormattedText>

                        <div className="mt-4 space-y-4">
                            <div>
                                <p className="mb-2 font-bold text-white">Task Verification</p>
                                <BulletPoint>Review and verify each member's completed tasks</BulletPoint>
                                <BulletPoint>Be fair and consistent in your verification</BulletPoint>
                                <BulletPoint>Members can't get their deposits back if tasks aren't verified</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Communication</p>
                                <BulletPoint>Keep members informed of verification status</BulletPoint>
                                <BulletPoint>Provide feedback on incomplete tasks</BulletPoint>
                                <BulletPoint>Answer questions about requirements</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Monitoring</p>
                                <BulletPoint>Check vault progress regularly</BulletPoint>
                                <BulletPoint>Ensure all verifications happen before deadline</BulletPoint>
                                <BulletPoint>Release funds when all conditions are met</BulletPoint>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    },
    "join-vault": {
        title: "Joining a Vault",
        icon: Users,
        content: (
            <>
                <div className="space-y-6">
                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">Joining a Savings Vault</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 font-bold text-white">Step 1: Get the Invite Link</p>
                                <BulletPoint>The vault creator will share an invite link</BulletPoint>
                                <BulletPoint>Link will take you to the vault join page</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Step 2: Review Vault Details</p>
                                <BulletPoint>Vault name and savings goal</BulletPoint>
                                <BulletPoint>Current contributions and progress</BulletPoint>
                                <BulletPoint>Deadline for reaching the goal</BulletPoint>
                                <BulletPoint>Payout address</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Step 3: Choose Your Contribution</p>
                                <BulletPoint>Enter the amount you want to contribute (in ETH)</BulletPoint>
                                <BulletPoint>You can contribute any amount up to the remaining goal</BulletPoint>
                                <BulletPoint>Example: If goal is 1 ETH and 0.3 ETH is contributed, you can contribute up to 0.7 ETH</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Step 4: Confirm and Join</p>
                                <NumberedItem number={1}>Click "Contribute to Goal"</NumberedItem>
                                <NumberedItem number={2}>Approve the transaction in your wallet</NumberedItem>
                                <NumberedItem number={3}>Wait for confirmation</NumberedItem>
                                <NumberedItem number={4}>You're now a member!</NumberedItem>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Step 5: Additional Contributions</p>
                                <BulletPoint>You can contribute more at any time</BulletPoint>
                                <BulletPoint>Visit the same invite link</BulletPoint>
                                <BulletPoint>Add additional funds toward the goal</BulletPoint>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="mb-3 text-lg font-bold text-white">Joining a Goal Vault</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 font-bold text-white">Step 1: Access the Invite</p>
                                <BulletPoint>Get the invite link from the creator</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Step 2: Review Requirements</p>
                                <FormattedText>Before joining, review:</FormattedText>
                                <BulletPoint><Bold>Fixed deposit amount</Bold> you must contribute</BulletPoint>
                                <BulletPoint><Bold>Number of tasks</Bold> you must complete</BulletPoint>
                                <BulletPoint><Bold>Task descriptions</Bold> and requirements</BulletPoint>
                                <BulletPoint><Bold>Deadline</Bold> for completion</BulletPoint>
                                <BulletPoint><Bold>Financial goal</Bold> total</BulletPoint>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Step 3: Deposit and Join</p>
                                <NumberedItem number={1}>The deposit amount is fixed (set by creator)</NumberedItem>
                                <NumberedItem number={2}>Click "Join Vault"</NumberedItem>
                                <NumberedItem number={3}>Approve the transaction for the full deposit amount</NumberedItem>
                                <NumberedItem number={4}>Wait for confirmation</NumberedItem>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Step 4: Start Completing Tasks</p>
                                <BulletPoint>Navigate to your <PageLink href="/dashboard">vault dashboard</PageLink></BulletPoint>
                                <BulletPoint>View your assigned tasks</BulletPoint>
                                <BulletPoint>Start working on task requirements</BulletPoint>
                                <BulletPoint>Mark tasks as complete when done</BulletPoint>
                                <BulletPoint>Wait for creator verification</BulletPoint>
                            </div>

                            <div className="rounded-lg bg-zinc-900 p-3 text-zinc-300">
                                <Bold>Important:</Bold> You must complete AND get verified for all your tasks to be eligible for fund release!
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    },
    "tips-best-practices": {
        title: "Tips & Best Practices",
        icon: Key,
        content: (
            <>
                <div className="space-y-6">
                    <div>
                        <h3 className="mb-3 text-lg font-bold text-white">For Vault Creators</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 font-bold text-white">Planning Your Vault:</p>
                                <div className="space-y-1">
                                    <p className="text-green-400">✅ Set realistic goals and deadlines</p>
                                    <p className="text-green-400">✅ Make task requirements crystal clear</p>
                                    <p className="text-green-400">✅ Choose appropriate deposit amounts</p>
                                    <p className="text-green-400">✅ Invite committed team members</p>
                                    <p className="text-green-400">✅ Plan for regular check-ins</p>
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">During the Vault:</p>
                                <div className="space-y-1">
                                    <p className="text-green-400">✅ Verify tasks promptly and fairly</p>
                                    <p className="text-green-400">✅ Communicate progress updates</p>
                                    <p className="text-green-400">✅ Provide feedback on incomplete work</p>
                                    <p className="text-green-400">✅ Keep members motivated</p>
                                    <p className="text-green-400">✅ Monitor approaching deadlines</p>
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Financial Safety:</p>
                                <div className="space-y-1">
                                    <p className="text-green-400">✅ Triple-check the payout address</p>
                                    <p className="text-green-400">✅ Test with small amounts first</p>
                                    <p className="text-green-400">✅ Use a multi-sig wallet for large amounts</p>
                                    <p className="text-green-400">✅ Keep records of all transactions</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="mb-3 text-lg font-bold text-white">For Vault Members</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 font-bold text-white">Before Joining:</p>
                                <div className="space-y-1">
                                    <p className="text-green-400">✅ Read ALL vault details carefully</p>
                                    <p className="text-green-400">✅ Understand task requirements</p>
                                    <p className="text-green-400">✅ Check the deadline</p>
                                    <p className="text-green-400">✅ Verify you can commit the deposit amount</p>
                                    <p className="text-green-400">✅ Know the penalty terms</p>
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">After Joining:</p>
                                <div className="space-y-1">
                                    <p className="text-green-400">✅ Start tasks immediately</p>
                                    <p className="text-green-400">✅ Document your progress</p>
                                    <p className="text-green-400">✅ Mark tasks complete as you finish them</p>
                                    <p className="text-green-400">✅ Follow up on verification status</p>
                                    <p className="text-green-400">✅ Communicate with the creator</p>
                                    <p className="text-green-400">✅ Help teammates stay on track</p>
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Financial Safety:</p>
                                <div className="space-y-1">
                                    <p className="text-green-400">✅ Only deposit what you can afford</p>
                                    <p className="text-green-400">✅ Keep transaction receipts</p>
                                    <p className="text-green-400">✅ Monitor your vault status regularly</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="mb-3 text-lg font-bold text-white">Security Best Practices</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 font-bold text-white">Wallet Security:</p>
                                <div className="space-y-1">
                                    <p className="text-red-400">⚠️ Never share your private keys</p>
                                    <p className="text-red-400">⚠️ Use hardware wallets for large amounts</p>
                                    <p className="text-red-400">⚠️ Enable 2FA on wallet apps</p>
                                    <p className="text-red-400">⚠️ Verify addresses before transactions</p>
                                    <p className="text-red-400">⚠️ Keep wallet software updated</p>
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Smart Contract Interactions:</p>
                                <div className="space-y-1">
                                    <p className="text-green-400">✅ Always review transaction details before approving</p>
                                    <p className="text-green-400">✅ Check the contract address matches GoalVault</p>
                                    <p className="text-green-400">✅ Verify gas estimates are reasonable</p>
                                    <p className="text-green-400">✅ Don't rush through wallet prompts</p>
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 font-bold text-white">Scam Protection:</p>
                                <div className="space-y-1">
                                    <p className="text-red-400">🚫 Don't trust unsolicited vault invites</p>
                                    <p className="text-red-400">🚫 Verify invite links are from trusted sources</p>
                                    <p className="text-red-400">🚫 Be cautious of vaults with unrealistic rewards</p>
                                    <p className="text-red-400">🚫 Don't join vaults with unclear terms</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="mb-3 text-lg font-bold text-white">Maximizing Success</h3>
                        <FormattedText>
                            Check your <PageLink href="/dashboard">dashboard</PageLink> regularly to monitor progress, complete tasks, and stay on track toward your goals!
                        </FormattedText>
                    </div>
                </div>
            </>
        )
    }
};

const menuItems = [
    { id: "getting-started", label: "Getting Started", icon: BookOpen },
    { id: "create-savings-vault", label: "Create Savings Vault", icon: Plus },
    { id: "create-goal-vault", label: "Create Goal Vault", icon: Target },
    { id: "join-vault", label: "Join a Vault", icon: Users },
    { id: "tips-best-practices", label: "Tips & Best Practices", icon: Key },
];

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState("getting-started");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const currentContent = docsContent[activeSection as keyof typeof docsContent];
    const IconComponent = currentContent.icon;

    return (
        <div className="min-h-screen bg-background pt-16">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
            >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div className="flex">
                {/* Sidebar */}
                <AnimatePresence>
                    {(sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72 overflow-y-auto border-r border-zinc-800 bg-zinc-950 shadow-xl p-6 md:sticky"
                        >
                            <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-zinc-500">
                                Documentation
                            </h2>
                            <nav className="space-y-1">
                                {menuItems.map((item) => {
                                    const ItemIcon = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveSection(item.id);
                                                setSidebarOpen(false);
                                            }}
                                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${activeSection === item.id
                                                ? "bg-primary/10 text-primary"
                                                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                                }`}
                                        >
                                            <ItemIcon className="h-4 w-4 flex-shrink-0" />
                                            <span>{item.label}</span>
                                            {activeSection === item.id && (
                                                <ChevronRight className="ml-auto h-4 w-4" />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 px-6 py-12 md:px-12 lg:px-20">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mx-auto max-w-4xl"
                    >
                        {/* Header */}
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <IconComponent className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">{currentContent.title}</h1>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="rounded-2xl border border-zinc-800 bg-card p-8">
                            {currentContent.content}
                        </div>

                        {/* Navigation Footer */}
                        <div className="mt-12 flex items-center justify-between border-t border-zinc-800 pt-8">
                            {menuItems.findIndex(item => item.id === activeSection) > 0 && (
                                <button
                                    onClick={() => {
                                        const currentIndex = menuItems.findIndex(item => item.id === activeSection);
                                        setActiveSection(menuItems[currentIndex - 1].id);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-primary"
                                >
                                    <ChevronRight className="h-4 w-4 rotate-180" />
                                    Previous
                                </button>
                            )}
                            <div className="flex-1" />
                            {menuItems.findIndex(item => item.id === activeSection) < menuItems.length - 1 && (
                                <button
                                    onClick={() => {
                                        const currentIndex = menuItems.findIndex(item => item.id === activeSection);
                                        setActiveSection(menuItems[currentIndex + 1].id);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-primary"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
