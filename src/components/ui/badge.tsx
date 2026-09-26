import { cn } from "@/lib/cn";

type Tone = "green" | "amber" | "gray" | "blue" | "red" | "neutral";

const tones: Record<Tone, string> = {
  green: "bg-trust-50 text-trust-700 border-trust-100",
  amber: "bg-amber-50 text-amber-800 border-amber-100",
  gray: "bg-surface-100 text-ink-500 border-surface-200",
  blue: "bg-brand-50 text-brand-700 border-brand-100",
  red: "bg-red-50 text-red-700 border-red-100",
  neutral: "bg-white text-ink-700 border-surface-300",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
