import React from "react";

interface LogoIconProps {
  size?: number;
  className?: string;
  variant?: "default" | "white";
}

export function LogoIcon({ size = 40, className = "", variant = "default" }: LogoIconProps) {
  const bgColor = variant === "white" ? "rgba(255,255,255,0.15)" : "#10b981";
  const accentColor = variant === "white" ? "white" : "#065f46";
  const lineColor = variant === "white" ? "rgba(255,255,255,0.5)" : "#a7f3d0";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded background */}
      <rect width="100" height="100" rx="24" fill={bgColor} />

      {/* Receipt paper */}
      <rect x="20" y="14" width="50" height="62" rx="5" fill={variant === "white" ? "rgba(255,255,255,0.95)" : "white"} />

      {/* Zigzag bottom of receipt */}
      <path
        d="M20 72 L25 66 L30 72 L35 66 L40 72 L45 66 L50 72 L55 66 L60 72 L65 66 L70 72 L70 76 L20 76 Z"
        fill={variant === "white" ? "rgba(255,255,255,0.95)" : "white"}
      />

      {/* Receipt header line – brand color */}
      <rect x="28" y="22" width="20" height="5" rx="2.5" fill={accentColor} />

      {/* Receipt data lines */}
      <rect x="28" y="32" width="30" height="3" rx="1.5" fill={lineColor} />
      <rect x="28" y="39" width="26" height="3" rx="1.5" fill={lineColor} />
      <rect x="28" y="46" width="28" height="3" rx="1.5" fill={lineColor} />
      <rect x="28" y="53" width="22" height="3" rx="1.5" fill={lineColor} />

      {/* Total line */}
      <rect x="28" y="60" width="18" height="4" rx="2" fill={accentColor} />

      {/* Magnifying glass */}
      <circle cx="73" cy="73" r="17" fill={accentColor} />
      <circle cx="73" cy="73" r="12" fill={variant === "white" ? "rgba(255,255,255,0.15)" : "white"} />
      <circle cx="73" cy="73" r="7" fill="none" stroke={variant === "white" ? "rgba(255,255,255,0.9)" : accentColor} strokeWidth="2.5" />
      <line x1="78" y1="79" x2="86" y2="87" stroke={variant === "white" ? "rgba(255,255,255,0.9)" : accentColor} strokeWidth="4" strokeLinecap="round" />
      <rect x="69" y="72" width="8" height="2" rx="1" fill={variant === "white" ? "rgba(255,255,255,0.9)" : accentColor} />
      <rect x="69" y="75.5" width="5.5" height="2" rx="1" fill={variant === "white" ? "rgba(255,255,255,0.9)" : accentColor} />
    </svg>
  );
}

interface LogoWithTextProps {
  iconSize?: number;
  className?: string;
  textSize?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "white";
}

export function LogoWithText({ iconSize = 36, className = "", textSize = "md", variant = "default" }: LogoWithTextProps) {
  const textClass = {
    sm: "text-lg font-bold tracking-tight",
    md: "text-xl font-bold tracking-tight",
    lg: "text-2xl font-bold tracking-tight",
    xl: "text-3xl font-bold tracking-tight",
  }[textSize];

  const textColor = variant === "white" ? "text-white" : "text-emerald-700";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon size={iconSize} variant={variant} />
      <span className={`${textClass} ${textColor}`}>Spezo</span>
    </div>
  );
}
