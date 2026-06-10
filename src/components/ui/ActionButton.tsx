import Link from "next/link";
import type { ReactNode } from "react";

type ActionButtonProps = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "dark" | "ghost";
  className?: string;
};

const tones = {
  primary: "bg-[#0f6b4f] text-white hover:bg-[#0b543f]",
  secondary: "bg-[#f1c979] text-[#241124] hover:bg-[#e8b85d]",
  dark: "bg-[#241124] text-white hover:bg-[#341932]",
  ghost: "border border-[#d8cdbd] bg-white/70 text-[#241124] hover:border-[#0f6b4f]",
};

export function ActionButton({ children, href, type = "button", onClick, disabled, tone = "primary", className = "" }: ActionButtonProps) {
  const classes = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:bg-slate-300 ${tones[tone]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
