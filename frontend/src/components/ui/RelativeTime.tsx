"use client";

import { formatDistanceToNow } from "date-fns";
import * as Tooltip from "@radix-ui/react-tooltip";

type RelativeTimeProps = {
  date: Date | string;
  className?: string;
  invalidLabel?: string;
};

function parseDate(date: Date | string): Date | null {
  const parsed = date instanceof Date ? date : new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatExactDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);
}

export function RelativeTime({
  date,
  className,
  invalidLabel = "Invalid date",
}: RelativeTimeProps) {
  const parsedDate = parseDate(date);

  if (!parsedDate) {
    return (
      <time className={className} aria-label={invalidLabel}>
        {invalidLabel}
      </time>
    );
  }

  const relativeLabel = formatDistanceToNow(parsedDate, { addSuffix: true });
  const exactLabel = formatExactDate(parsedDate);

  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <time
            className={className}
            dateTime={parsedDate.toISOString()}
            aria-label={exactLabel}
          >
            {relativeLabel}
          </time>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            align="center"
            className="z-50 rounded-md bg-slate-950 px-3 py-1.5 text-xs text-white shadow-md"
          >
            {exactLabel}
            <Tooltip.Arrow className="fill-slate-950" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
