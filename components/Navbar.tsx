"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Wait, I need to create lib/utils for clsx/tailwind-merge

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between px-6">
                <div className="flex items-center w-full justify-between gap-8">
                    <Link href="/" className="text-xl font-bold tracking-tighter text-white">
                        📜 GoalVault
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="text-md font-medium text-zinc-400 transition-colors hover:text-primary"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/create"
                            className="text-md font-medium text-zinc-400 transition-colors hover:text-primary"
                        >
                            Create
                        </Link>
                        <Link
                            href="/docs"
                            className="text-md font-medium text-zinc-400 transition-colors hover:text-primary"
                        >
                            Docs
                        </Link>

                         <Link
                            href="/feedback"
                            className="text-md font-medium text-zinc-400 transition-colors hover:text-primary"
                        >
                            Feedback
                        </Link>
                    </div>
              

                <div className="flex items-center gap-4">
                    <ConnectButton
                        accountStatus="avatar"
                        chainStatus="icon"
                        showBalance={false}
                    />
                </div>
                  </div>
            </div>
        </nav>
    );
}
