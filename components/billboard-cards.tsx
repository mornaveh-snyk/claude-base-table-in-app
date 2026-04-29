"use client";

import { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type MetricKey =
  | "total_assets"
  | "high_risk"
  | "critical_risk"
  | "unmonitored"
  | "packages"
  | "repositories"
  | "container_images"
  | "web_apps"
  | "apis"
  | "dependencies"
  | "monitored"
  | "no_controls"
  | "active_issues"
  | "resolved_issues";

export interface Metric {
  key: MetricKey;
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean | null;
}

const ALL_METRICS: Metric[] = [
  { key: "total_assets",     label: "Total Assets",       value: "1,842", delta: "+24 this week",      deltaPositive: false },
  { key: "critical_risk",    label: "Critical Risk",      value: "48",    delta: "+5 since last scan",  deltaPositive: false },
  { key: "high_risk",        label: "High Risk",          value: "137",   delta: "+8 since last scan",  deltaPositive: false },
  { key: "unmonitored",      label: "Unmonitored",        value: "58",    delta: "-12 resolved",        deltaPositive: true  },
  { key: "packages",         label: "Packages",           value: "4,291", delta: "Across all repos",    deltaPositive: null  },
  { key: "repositories",     label: "Repositories",       value: "428",   delta: "+3 this week",        deltaPositive: false },
  { key: "container_images", label: "Container Images",   value: "241",   delta: "+11 this week",       deltaPositive: false },
  { key: "web_apps",         label: "Web Applications",   value: "76",    delta: "No change",           deltaPositive: null  },
  { key: "apis",             label: "APIs",               value: "124",   delta: "+2 this week",        deltaPositive: false },
  { key: "dependencies",     label: "Dependencies",       value: "2,092", delta: "Direct libraries",    deltaPositive: null  },
  { key: "monitored",        label: "Monitored",          value: "1,784", delta: "96% coverage",        deltaPositive: true  },
  { key: "no_controls",      label: "No Controls",        value: "203",   delta: "+17 this week",       deltaPositive: false },
  { key: "active_issues",    label: "Active Issues",      value: "93",    delta: "Across all assets",   deltaPositive: null  },
  { key: "resolved_issues",  label: "Resolved Issues",    value: "312",   delta: "+44 this month",      deltaPositive: true  },
];

const DEFAULT_VISIBLE: MetricKey[] = [
  "total_assets",
  "high_risk",
  "unmonitored",
  "packages",
];

const MAX_CARDS = 4;

export function BillboardCards() {
  const [visibleKeys, setVisibleKeys] = useState<MetricKey[]>(DEFAULT_VISIBLE);

  const visibleMetrics = visibleKeys
    .map((k) => ALL_METRICS.find((m) => m.key === k))
    .filter(Boolean) as Metric[];

  const availableToAdd = ALL_METRICS.filter((m) => !visibleKeys.includes(m.key));

  function removeCard(key: MetricKey) {
    setVisibleKeys((prev) => prev.filter((k) => k !== key));
  }

  function addCard(key: MetricKey) {
    if (visibleKeys.length >= MAX_CARDS) return;
    setVisibleKeys((prev) => [...prev, key]);
  }

  function replaceCard(oldKey: MetricKey, newKey: MetricKey) {
    setVisibleKeys((prev) => prev.map((k) => (k === oldKey ? newKey : k)));
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {visibleMetrics.map(({ key, label, value, delta, deltaPositive }) => (
        <div
          key={key}
          className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 group relative"
        >
          {/* Per-card replace dropdown — absolutely positioned so it takes no flow space */}
          <DropdownMenu>
            <div className="absolute top-2 right-2">
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={`Change ${label} metric`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary text-muted-foreground flex items-center gap-0.5"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Replace with</div>
                <DropdownMenuSeparator />
                {ALL_METRICS.filter((m) => m.key !== key && !visibleKeys.includes(m.key)).map((m) => (
                  <DropdownMenuItem key={m.key} onClick={() => replaceCard(key, m.key)}>
                    {m.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => removeCard(key)}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                  Remove card
                </DropdownMenuItem>
              </DropdownMenuContent>
            </div>
          </DropdownMenu>

          <div>
            <div className="text-2xl font-semibold text-foreground tabular-nums">{value}</div>
            <div className="text-xs font-medium text-muted-foreground mt-0.5">{label}</div>
          </div>

          <div
            className={cn(
              "text-xs font-medium",
              deltaPositive === true
                ? "text-green-700"
                : deltaPositive === false
                ? "text-red-600"
                : "text-muted-foreground"
            )}
          >
            {delta}
          </div>
        </div>
      ))}

      {/* Add card slot */}
      {visibleKeys.length < MAX_CARDS && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="bg-card border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border transition-colors group min-h-[120px]">
              <Plus className="w-5 h-5" />
              <span className="text-xs font-medium">Add metric</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Add a metric card</div>
            <DropdownMenuSeparator />
            {availableToAdd.map((m) => (
              <DropdownMenuItem key={m.key} onClick={() => addCard(m.key)}>
                {m.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
