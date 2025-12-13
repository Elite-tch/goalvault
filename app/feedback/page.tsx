"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Send, CheckCircle, Loader2, X, MessageSquare, Paperclip } from "lucide-react";
import toast from "react-hot-toast";

export default function FeedbackPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        // access_key is required by Web3Forms
        formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                toast.success("Feedback submitted successfully!");
            } else {
                toast.error(data.message || "Something went wrong. Please try again.");
            }
        } catch (error) {
            toast.error("Failed to submit feedback. Please try again later.");
            console.error("Feedback error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit check (common for free tiers)
                toast.error("File size should be less than 5MB");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setFileName(file.name);
        } else {
            setFileName(null);
        }
    };

    const clearFile = () => {
        setFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (isSuccess) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex max-w-md flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center backdrop-blur-md"
                >
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h2 className="mb-3 text-2xl font-bold text-white">Thank You!</h2>
                    <p className="mb-8 text-zinc-400">
                        Your feedback has been received. We appreciate your contribution to making SyncVault better.
                    </p>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="rounded-xl bg-zinc-800 px-6 py-2 font-medium text-white transition-colors hover:bg-zinc-700"
                    >
                        Return Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <section className="flex min-h-screen  items-center justify-center bg-[#0a0a0a] px-4 pt-20 pb-12">

            {/* Background Effects */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#0a0a0a] to-[#0a0a0a]" />
            <div className="absolute top-1/4 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl filter" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-lg"
            >
                <div className="mb-8 pt-8 text-center">
                    <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
                        Send <span className="text-gradient-gold">Feedback</span>
                    </h1>
                    <p className="text-zinc-400">
                        Encountered a bug or have a suggestion? Let us know!
                    </p>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <input type="hidden" name="subject" value="New Feedback from SyncVault Form" />

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Your Name"
                                    className="w-full rounded-xl mt-3 border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-white placeholder-zinc-600 transition-colors focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    placeholder="your@email.com"
                                    className="w-full rounded-xl mt-3 border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-white placeholder-zinc-600 transition-colors focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium text-zinc-300">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows={4}
                                placeholder="Describe your experience, report a bug, or suggest a feature..."
                                className="w-full resize-none mt-3 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-white placeholder-zinc-600 transition-colors focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Attachment (Optional)
                            </label>

                            <div
                                className={`relative flex items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950/30 px-6 py-8 transition-colors ${!fileName ? 'hover:border-zinc-500 hover:bg-zinc-900/50' : ''}`}
                            >
                                <input
                                    type="file"
                                    name="attachment"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                    className="absolute inset-0 mt-3 cursor-pointer opacity-0"
                                />

                                {fileName ? (
                                    <div className="flex items-center gap-2 text-primary z-10">
                                        <Paperclip className="h-5 w-5" />
                                        <span className="truncate max-w-[200px] text-sm font-medium">{fileName}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                clearFile();
                                            }}
                                            className="ml-2 rounded-full p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                                        <Upload className="h-6 w-6" />
                                        <div className="text-center text-sm">
                                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                            <br />
                                            <span className="text-xs text-zinc-600">Images or docs (Max 5MB)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-base font-bold text-primary-foreground transition-all hover:bg-[#ffdf91] hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    Send Feedback
                                    <Send className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </section>
    );
}
