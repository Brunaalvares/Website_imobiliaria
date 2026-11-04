import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "navy",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "navy" | "ice" | "success" | "muted";
}) {
  const tones = {
    navy: "bg-navy text-white",
    ice: "bg-ice text-navy border border-gray-light",
    success: "bg-[#E8F5EE] text-[#2F6F4E]",
    muted: "bg-gray-light text-gray-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
