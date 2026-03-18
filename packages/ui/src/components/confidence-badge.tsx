import * as React from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
  showLabel?: boolean;
}

/**
 * Displays OCR confidence level with appropriate colour:
 *  >= 0.90 → green checkmark
 *  0.75–0.89 → yellow warning
 *  < 0.75 → red alert
 */
export function ConfidenceBadge({
  confidence,
  className,
  showLabel = true,
}: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100);

  if (confidence >= 0.9) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-green-700 font-medium text-sm",
          className
        )}
      >
        <CheckCircle className="h-4 w-4 text-green-500" />
        {showLabel && `${pct}%`}
      </span>
    );
  }

  if (confidence >= 0.75) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-yellow-700 font-medium text-sm",
          className
        )}
      >
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        {showLabel && `${pct}%`}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-red-700 font-medium text-sm",
        className
      )}
    >
      <XCircle className="h-4 w-4 text-red-500" />
      {showLabel && `${pct}%`}
    </span>
  );
}
