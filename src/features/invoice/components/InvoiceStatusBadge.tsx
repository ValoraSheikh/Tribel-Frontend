"use client";

import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  GENERATED: {
    label: "Generated",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  FAILED: {
    label: "Failed",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export function InvoiceStatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  if (!status) {
    return (
      <Badge
        variant="outline"
        className="bg-background/80 text-foreground border-border shadow-md backdrop-blur-md border-none"
      >
        N/A
      </Badge>
    );
  }

  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={`shadow-md backdrop-blur-md bg-background/80 text-foreground border-none capitalize ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}
