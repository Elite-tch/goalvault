"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
    targetDate: bigint; // Unix timestamp in seconds
    className?: string;
    onExpire?: () => void;
}

export default function CountdownTimer({ targetDate, className, onExpire }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isExpired: boolean;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Math.floor(Date.now() / 1000);
            const difference = Number(targetDate) - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
                if (onExpire) onExpire();
                return;
            }

            const days = Math.floor(difference / (60 * 60 * 24));
            const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
            const minutes = Math.floor((difference % (60 * 60)) / 60);
            const seconds = Math.floor(difference % 60);

            setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onExpire]);

    if (timeLeft.isExpired) {
        return <span className="font-bold text-red-500">Expired</span>;
    }

    return (
        <div className={`flex items-center gap-1 font-mono ${className || ""}`}>
            <Clock className="w-4 h-4 mr-1 text-zinc-500" />
            <div className="flex items-baseline gap-1">
                {timeLeft.days > 0 && (
                    <>
                        <span className="font-bold text-white">{timeLeft.days}</span>
                        <span className="text-xs text-zinc-500">d</span>
                    </>
                )}
                <span className="font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs text-zinc-500">h</span>
                <span className="font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs text-zinc-500">m</span>
                <span className="font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs text-zinc-500">s</span>
            </div>
        </div>
    );
}
