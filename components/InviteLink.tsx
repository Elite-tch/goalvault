"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface InviteLinkProps {
    inviteCode: string;
    memberAddress: string;
    type: "task" | "savings";
    memberName?: string;
}

export default function InviteLink({ inviteCode, memberAddress, type, memberName }: InviteLinkProps) {
    const [copied, setCopied] = useState(false);

    // Generate full invite link
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/join/${type}/${inviteCode}`;

    const copyLink = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success(`Invite link copied for ${memberName || memberAddress.slice(0, 8)}!`);
        setTimeout(() => setCopied(false), 2000);
    };

    const openLink = () => {
        window.open(link, '_blank');
    };

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    {memberName && (
                        <p className="text-sm font-medium text-white mb-1">{memberName}</p>
                    )}
                    <span className="text-xs text-zinc-500">
                        {memberAddress.slice(0, 6)}...{memberAddress.slice(-4)}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={openLink}
                        className="flex items-center gap-1 rounded-md bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
                        title="Open in new tab"
                    >
                        <ExternalLink className="h-3 w-3" />
                    </button>
                    <button
                        onClick={copyLink}
                        className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs transition-colors ${copied
                                ? 'bg-green-600 text-white'
                                : 'bg-primary text-primary-foreground hover:bg-yellow-400'
                            }`}
                    >
                        {copied ? (
                            <>
                                <Check className="h-3 w-3" /> Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-3 w-3" /> Copy Link
                            </>
                        )}
                    </button>
                </div>
            </div>
            <div className="rounded-md bg-zinc-950 p-2">
                <p className="text-xs text-zinc-600 break-all font-mono">{link}</p>
            </div>
        </div>
    );
}
