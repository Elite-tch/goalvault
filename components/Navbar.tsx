"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between px-6">
                <div className="flex items-center w-full justify-between gap-8">
                    <Link href="/" className="text-xl font-bold tracking-tighter text-white">
                        📜 GoalVault
                    </Link>

                    {/* Desktop Navigation */}
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
                        {/* Desktop Connect Button */}
                        <div className="hidden md:block">
                            <ConnectButton
                                accountStatus="avatar"
                                chainStatus="icon"
                                showBalance={false}
                            />
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="flex md:hidden items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-zinc-800 bg-black md:hidden"
                    >
                        <div className="flex flex-col space-y-4 p-6">
                            <Link
                                href="/dashboard"
                                className="text-lg font-medium text-zinc-400 transition-colors hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/create"
                                className="text-lg font-medium text-zinc-400 transition-colors hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Create
                            </Link>
                            <Link
                                href="/docs"
                                className="text-lg font-medium text-zinc-400 transition-colors hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Docs
                            </Link>
                            <Link
                                href="/feedback"
                                className="text-lg font-medium text-zinc-400 transition-colors hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Feedback
                            </Link>

                            <div className="pt-4 border-t border-zinc-900">
                                <ConnectButton
                                    accountStatus="avatar"
                                    chainStatus="icon"
                                    showBalance={false}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
