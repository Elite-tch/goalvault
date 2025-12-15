"use client";

import { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Download, Award, Shield, CheckCircle } from "lucide-react";

interface CertificateCardProps {
    projectName: string; // was vaultName
    memberName: string;
    memberAddress: string;
    taskDescription: string;
    amount: string;
    date: string;
}

export default function CertificateCard({
    projectName,
    memberName,
    memberAddress,
    taskDescription,
    amount,
    date
}: CertificateCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = useCallback(() => {
        if (cardRef.current === null) {
            return;
        }

        toPng(cardRef.current, { cacheBust: true, })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `Certificate-${projectName.slice(0, 10)}-${memberName || 'Member'}.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error("Certificate generation failed", err);
            });
    }, [projectName, memberName]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                ref={cardRef}
                className="relative w-full max-w-2xl overflow-hidden rounded-xl border-4 border-[#FFD700] bg-zinc-950 p-12 text-center shadow-2xl"
                style={{ fontFamily: 'serif' }} // Use serif for certificate look
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, #FFD700 1px, transparent 0)',
                        backgroundSize: '24px 24px'
                    }}
                />

                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 h-16 w-16 border-t-4 border-l-4 border-[#FFD700]" />
                <div className="absolute top-0 right-0 h-16 w-16 border-t-4 border-r-4 border-[#FFD700]" />
                <div className="absolute bottom-0 left-0 h-16 w-16 border-b-4 border-l-4 border-[#FFD700]" />
                <div className="absolute bottom-0 right-0 h-16 w-16 border-b-4 border-r-4 border-[#FFD700]" />

                <div className="relative z-10 flex flex-col items-center text-[#FFD700]">
                    {/* Logo / Icon */}
                    <div className="mb-6 rounded-full border-2 border-[#FFD700] p-4 bg-black/50">
                        <Award className="h-12 w-12" />
                    </div>

                    <h1 className="mb-2 text-4xl font-bold uppercase tracking-widest text-white font-sans">
                        Certificate of Completion
                    </h1>
                    <p className="mb-8 text-sm uppercase tracking-wider text-zinc-400 font-sans">
                        Scroll GoalVault Secure Protocol
                    </p>

                    <p className="mb-4 text-lg italic text-zinc-300">This certifies that</p>

                    <h2 className="mb-2 text-3xl font-bold text-white font-sans border-b border-[#FFD700] pb-2 px-8">
                        {memberName || "Valued Member"}
                    </h2>
                    <p className="mb-8 text-xs font-mono text-zinc-500">{memberAddress}</p>

                    <p className="mb-4 text-zinc-300">Has successfully completed the assigned task:</p>

                    <div className="mb-8 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 p-4 w-full max-w-lg">
                        <p className="text-xl font-bold text-white font-sans">"{taskDescription}"</p>
                    </div>

                    <div className="mb-12 grid grid-cols-2 gap-12 w-full max-w-lg text-left">
                        <div>
                            <p className="text-xs uppercase text-zinc-500 font-sans mb-1">Project</p>
                            <p className="text-lg font-bold text-white font-sans">{projectName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase text-zinc-500 font-sans mb-1">Stake Returned</p>
                            <p className="text-lg font-bold text-white font-sans">{amount} ETH</p>
                        </div>
                    </div>

                    <div className="flex w-full items-end justify-between border-t border-zinc-800 pt-6">
                        <div className="text-left">
                            <div className="flex items-center gap-2 text-[#FFD700]">
                                <Shield className="h-5 w-5" />
                                <span className="font-bold font-sans">Verified On-Chain</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1 font-mono">Scroll Sepolia Network</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-white font-sans">{date}</p>
                            <p className="text-xs text-zinc-500 uppercase font-sans">Completion Date</p>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-lg bg-[#FFD700] px-8 py-3 font-bold text-black transition-all hover:bg-yellow-400 hover:scale-105 shadow-lg shadow-yellow-900/20"
            >
                <Download className="h-5 w-5" />
                Download Certificate
            </button>
        </div>
    );
}
