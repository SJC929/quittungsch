import React from "react";

interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 40, className = "" }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Green rounded background */}
      <rect width="100" height="100" rx="22" fill="#34D399" />

      {/* Receipt paper */}
      <rect x="18" y="14" width="52" height="64" rx="4" fill="white" />

      {/* Zigzag bottom of receipt */}
      <path
        d="M18 74 L23 68 L28 74 L33 68 L38 74 L43 68 L48 74 L53 68 L58 74 L63 68 L68 74 L70 74 L70 78 L18 78 Z"
        fill="white"
      />

      {/* Receipt lines */}
      <rect x="26" y="23" width="22" height="5" rx="2.5" fill="#059669" />
      <rect x="26" y="33" width="32" height="3" rx="1.5" fill="#D1FAE5" />
      <rect x="26" y="40" width="28" height="3" rx="1.5" fill="#D1FAE5" />
      <rect x="26" y="47" width="30" height="3" rx="1.5" fill="#D1FAE5" />
      <rect x="26" y="54" width="24" height="3" rx="1.5" fill="#D1FAE5" />
      <rect x="26" y="61" width="20" height="4" rx="2" fill="#059669" />

      {/* Magnifying glass circle */}
      <circle cx="72" cy="74" r="18" fill="#047857" />
      <circle cx="72" cy="74" r="13" fill="white" />
      <circle cx="72" cy="74" r="8" fill="none" stroke="#047857" strokeWidth="3" />

      {/* Magnifying glass handle */}
      <line x1="78" y1="80" x2="86" y2="88" stroke="#047857" strokeWidth="4" strokeLinecap="round" />

      {/* Lines inside magnifying glass */}
      <rect x="67" y="72" width="10" height="2" rx="1" fill="#047857" />
      <rect x="67" y="76" width="7" height="2" rx="1" fill="#047857" />
    </svg>
  );
}

interface LogoWithTextProps {
  iconSize?: number;
  className?: string;
  textSize?: "sm" | "md" | "lg" | "xl";
}

export function LogoWithText({ iconSize = 36, className = "", textSize = "md" }: LogoWithTextProps) {
  const textClass = {
    sm: "text-lg font-bold",
    md: "text-xl font-bold",
    lg: "text-2xl font-bold",
    xl: "text-3xl font-bold",
  }[textSize];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={iconSize} />
      <span className={`${textClass} text-emerald-700`}>QuittungsCH</span>
    </div>
  );
}
