"use client";

import { useState } from "react";
import {
  Server,
  ShieldAlert,
  Eye,
  Package,
  Globe,
  GitBranch,
  Box,
  Layers,
  Activity,
  Lock,
  AlertTriangle,
  CheckCircle,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";
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
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const ALL_METRICS: Metric[] = [
  {
    key: "total_assets",
    label: "Total Assets",
    value: "1,842",
    delta: "+24 this week",
    deltaPositive: false,
    icon: Server,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    key: "critical_risk",
    label: "Critical Risk",
    value: "48",
    delta: "+5 since last scan",
    deltaPositive: false,
    icon: AlertTriangle,
    iconColor: "text-red-600",
    iconBg: "bg-red-50",
  },
  {
    key: "high_risk",
    label: "High Risk",
    value: "137",
    delta: "+8 since last scan",
    deltaPositive: false,
    icon: ShieldAlert,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
  },
  {
    key: "unmonitored",
    label: "Unmonitored",
    value: "58",
    delta: "-12 resolved",
    deltaPositive: true,
    icon: Eye,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-50",
  },
  {
    key: "packages",
    label: "Packages",
    value: "4,291",
    delta: "Across all repos",
    deltaPositive: null,
    icon: Package,
    iconColor: "text-green-700",
    iconBg: "bg-green-50",
  },
  {
    key: "repositories",
    label: "Repositories",
    value: "428",
    delta: "+3 this week",
    deltaPositive: false,
    icon: GitBranch,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
  {
    key: "container_images",
    label: "Container Images",
    value: "241",
    delta: "+11 this week",
    deltaPositive: false,
    icon: Box,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50",
  },
  {
    key: "web_apps",
    label: "Web Applications",
    value: "76",
    delta: "No change",
    deltaPositive: null,
    icon: Globe,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
  },
  {
    key: "apis",
    label: "APIs",
    value: "124",
    delta: "+2 this week",
    deltaPositive: false,
    icon: Activity,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50",
  },
  {
    key: "dependencies",
    label: "Dependencies",
    value: "2,092",
    delta: "Direct libraries",
    deltaPositive: null,
    icon: Layers,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
  },
  {
    key: "monitored",
    label: "Monitored",
    value: "1,784",
    delta: "96% coverage",
    deltaPositive: true,
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    key: "no_controls",
    label: "No Controls",
    value: "203",
    delta: "+17 this week",
    deltaPositive: false,
    icon: Lock,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
  },
  {
    key: "active_issues",
    label: "Active Issues",
    value: "93",
    delta: "Across all assets",
    deltaPositive: null,
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    key: "resolved_issues",
    label: "Resolved Issues",
    value: "312",
    delta: "+44 this month",
    deltaPositive: true,
    icon: CheckCircle,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
  },
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
      {visibleMetrics.map(({ key, label, value, delta, deltaPositive, icon: Icon, iconColor, iconBg }) => (
        <div
          key={key}
          className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 group relative"
        >
          <div className="flex items-start justify-between">
            <div className={cn("w-9 h-9 rounded-md flex items-center justify-center shrink-0", iconBg)}>
              <Icon className={cn("w-4 h-4", iconColor)} />
            </div>
            {/* Per-card replace dropdown */}
            <DropdownMenu>
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
                    <div className={cn("w-5 h-5 rounded flex items-center justify-center shrink-0", m.iconBg)}>
                      <m.icon className={cn("w-3 h-3", m.iconColor)} />
                    </div>
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
            </DropdownMenu>
          </div>

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
                <div className={cn("w-5 h-5 rounded flex items-center justify-center shrink-0", m.iconBg)}>
                  <m.icon className={cn("w-3 h-3", m.iconColor)} />
                </div>
                {m.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
