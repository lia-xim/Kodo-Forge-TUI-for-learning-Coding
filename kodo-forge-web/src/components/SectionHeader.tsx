import type { ReactNode } from "react";

interface SectionHeaderProps {
  /** Two-digit section number, e.g. "01", "02". */
  index: string;
  /** Section label, rendered uppercase. */
  label: string;
  /** Optional trailing element (e.g. version pill). */
  children?: ReactNode;
  /** Extra Tailwind classes on the wrapping <div>. */
  className?: string;
}

/**
 * Renders an ASCII-style section header:
 *
 *   ── 01 ────── LABEL ──────────────────
 *
 * Monospace, amber phosphor. Single line on all breakpoints — the trailing
 * dashes are clipped with overflow-hidden so the component adapts to any
 * container width without wrapping.
 */
export default function SectionHeader({
  index,
  label,
  children,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-center gap-3 font-mono text-amber-500 ${className}`}
      aria-label={label}
    >
      <span aria-hidden="true" className="select-none">──</span>
      <span className="text-xs font-bold tracking-[0.2em]" aria-hidden="true">
        {index}
      </span>
      <span aria-hidden="true" className="select-none">──────</span>
      <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.3em]">
        {label}
      </span>
      <span
        aria-hidden="true"
        className="flex-1 select-none overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {"─".repeat(80)}
      </span>
      {children}
    </div>
  );
}
