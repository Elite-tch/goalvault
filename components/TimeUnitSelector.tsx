"use client";

const TIME_UNITS = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
    days: 86400,
    years: 31536000
} as const;

export type TimeUnit = keyof typeof TIME_UNITS;

interface TimeUnitSelectorProps {
    value: number;
    unit: TimeUnit;
    onValueChange: (value: number) => void;
    onUnitChange: (unit: TimeUnit) => void;
    disabled?: boolean;
}

export default function TimeUnitSelector({
    value,
    unit,
    onValueChange,
    onUnitChange,
    disabled = false
}: TimeUnitSelectorProps) {
    const totalSeconds = value * TIME_UNITS[unit];

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Duration</label>
            <div className="flex gap-2">
                <input
                    type="number"
                    min="1"
                    value={value}
                    onChange={(e) => onValueChange(parseInt(e.target.value) || 1)}
                    className="w-24 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="1"
                    disabled={disabled}
                />
                <select
                    value={unit}
                    onChange={(e) => onUnitChange(e.target.value as TimeUnit)}
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={disabled}
                >
                    <option value="seconds">Seconds</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="years">Years</option>
                </select>
            </div>
            <p className="text-xs text-zinc-500">
                Total: {totalSeconds.toLocaleString()} seconds
                {unit === 'days' && ` (${value} day${value !== 1 ? 's' : ''})`}
                {unit === 'hours' && ` (${value} hour${value !== 1 ? 's' : ''})`}
                {unit === 'minutes' && ` (${value} minute${value !== 1 ? 's' : ''})`}
            </p>
        </div>
    );
}

export { TIME_UNITS };
