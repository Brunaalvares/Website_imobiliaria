import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  className,
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <h2 className="text-3xl font-bold tracking-tight text-navy md:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="mt-3 text-base leading-relaxed text-gray-muted md:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
