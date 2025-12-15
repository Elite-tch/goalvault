"use client";

import { Twitter, Share2 } from "lucide-react";

interface SocialShareProps {
    type: "task" | "savings";
    goalOrStake: string;
    description?: string;
    vaultId?: string;
    hasCertificate?: boolean;
    projectName?: string;
    txHash?: string;
}

export default function SocialShare({ type, goalOrStake, description, vaultId, hasCertificate, projectName, txHash }: SocialShareProps) {
    const scrollMention = "@Scroll_ZKP";
    const appHashtag = "#GoalVault";

    let shareText = "";

    if (hasCertificate) {
        shareText = `I just earned my Completion Certificate on ${scrollMention}! 🏆\n\nProject: ${projectName}\nTask: ${description}\n\nProof: ${txHash || "Verified on-chain"}\n\n(Certificate attached) ${appHashtag}`;
    } else if (type === "task") {
        // Aggressive/Commitment style for tasks
        shareText = `I just locked ${goalOrStake} ETH on ${scrollMention} to force myself to ${description || "finish my work"}. \n\nIf I miss the deadline, the contract burns my stake. 💀\n\nWitness my commitment:`;
    } else {
        // Collaborative/Team style for savings
        shareText = `We just started a verifiable savings vault on ${scrollMention}! 💰\n\nGoal: Used smart contracts to lock ${goalOrStake} ETH until our team targets are hit.\n\nNo trust needed, just code. ${appHashtag}`;
    }

    const safeShareText = encodeURIComponent(shareText);

    // Dynamic URL generation
    const baseUrl = "https://goalvault-two.vercel.app";
    const linkUrl = vaultId ? `${baseUrl}/vault/${vaultId}` : baseUrl;
    const url = encodeURIComponent(linkUrl);

    const twitterLink = `https://twitter.com/intent/tweet?text=${safeShareText}&url=${url}`;
    // Warpcast (Farcaster) intent
    const farcasterLink = `https://warpcast.com/~/compose?text=${safeShareText}&embeds[]=${url}`;

    return (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-2 text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                {hasCertificate ? "Share Achievement" : "Public Accountability"}
            </h3>
            <p className="mb-4 text-sm text-zinc-400">
                {hasCertificate
                    ? "Celebrate your achievement! Download your certificate above and attach it to your post."
                    : "Increase your success rate by 80%? Share this commitment publicly. The internet keeps you honest."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <a
                    href={twitterLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-bold text-white hover:bg-zinc-800 transition-colors border border-zinc-800"
                >
                    <Twitter className="h-4 w-4 fill-white" />
                    Share on X
                </a>
                <a
                    href={farcasterLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#855DCD] px-4 py-3 font-bold text-white hover:bg-[#724BB7] transition-colors"
                >
                    {/* Farcaster Logo SVG */}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3333 4V4.66667H2.66667V4H13.3333ZM13.3333 2.66667H2.66667C1.93333 2.66667 1.33333 3.26667 1.33333 4V12C1.33333 12.7333 1.93333 13.3333 2.66667 13.3333H13.3333C14.0667 13.3333 14.6667 12.7333 14.6667 12V4C14.6667 3.26667 14.0667 2.66667 13.3333 2.66667ZM12.6667 10.6667H11.3333V9.33333H12.6667V10.6667ZM4.66667 10.6667H3.33333V9.33333H4.66667V10.6667ZM12.6667 7.33333H8.66667V6H12.6667V7.33333ZM7.33333 7.33333H3.33333V6H7.33333V7.33333Z" fill="white" />
                    </svg>
                    Share on Farcaster
                </a>
            </div>
        </div>
    );
}
