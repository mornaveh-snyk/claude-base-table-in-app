"use client";

import { useState, useMemo } from "react";
import {
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  GitFork,
  Container,
  Package,
  Globe,
  Cpu,
  MoreHorizontal,
} from "lucide-react";
import { cn, applyFilters, type FilterGroup } from "@/lib/utils";

type SortDir = "asc" | "desc" | null;
type SortKey = "name" | "type" | "risk" | "lastSeen";

const riskConfig: Record<string, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-red-100 text-red-700 border-red-200" },
  high:     { label: "High",     className: "bg-orange-100 text-orange-700 border-orange-200" },
  medium:   { label: "Medium",   className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  low:      { label: "Low",      className: "bg-green-100 text-green-700 border-green-200" },
};

const typeIcons: Record<string, React.ReactNode> = {
  Repository:       <GitFork className="w-3.5 h-3.5" />,
  "Container Image": <Container className="w-3.5 h-3.5" />,
  Package:          <Package className="w-3.5 h-3.5" />,
  API:              <Globe className="w-3.5 h-3.5" />,
  Service:          <Cpu className="w-3.5 h-3.5" />,
};

const ASSETS = [
  { id: 1, name: "api-gateway-service",   type: "Repository",        risk: "critical", lastSeen: "2 min ago",   owner: "platform-team" },
  { id: 2, name: "auth-service:latest",   type: "Container Image",   risk: "high",     lastSeen: "11 min ago",  owner: "security-team" },
  { id: 3, name: "lodash@4.17.19",        type: "Package",           risk: "high",     lastSeen: "1 hr ago",    owner: "frontend-team" },
  { id: 4, name: "payments-api",          type: "API",               risk: "critical", lastSeen: "5 min ago",   owner: "billing-team" },
  { id: 5, name: "data-pipeline",         type: "Service",           risk: "medium",   lastSeen: "32 min ago",  owner: "data-team" },
  { id: 6, name: "user-profiles-service", type: "Repository",        risk: "low",      lastSeen: "3 hr ago",    owner: "backend-team" },
  { id: 7, name: "nginx:1.23-alpine",     type: "Container Image",   risk: "medium",   lastSeen: "6 hr ago",    owner: "infra-team" },
  { id: 8, name: "react@18.2.0",          type: "Package",           risk: "low",      lastSeen: "2 days ago",  owner: "frontend-team" },
  { id: 9, name: "inventory-api",         type: "API",               risk: "medium",   lastSeen: "45 min ago",  owner: "product-team" },
  { id: 10, name: "ml-model-service",     type: "Service",           risk: "low",      lastSeen: "12 hr ago",   owner: "ml-team" },
];

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground opacity-50" />;
  if (sortDir === "asc") return <ChevronUp className="w-3.5 h-3.5 text-foreground" />;
  return <ChevronDown className="w-3.5 h-3.5 text-foreground" />;
}

interface AssetTableProps {
  filterGroup?: FilterGroup;
  search?: string;
}

export function AssetTable({ filterGroup, search }: AssetTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Apply filters and search
  const filteredAssets = useMemo(() => {
    let result = ASSETS;

    // Apply AI filters
    if (filterGroup && filterGroup.items.length > 0) {
      result = applyFilters(result, filterGroup);
    }

    // Apply text search
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchLower) ||
          asset.type.toLowerCase().includes(searchLower) ||
          asset.owner.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [filterGroup, search]);

  const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...filteredAssets].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name")    cmp = a.name.localeCompare(b.name);
    if (sortKey === "type")    cmp = a.type.localeCompare(b.type);
    if (sortKey === "risk")    cmp = riskOrder[a.risk as keyof typeof riskOrder] - riskOrder[b.risk as keyof typeof riskOrder];
    if (sortKey === "lastSeen") cmp = a.lastSeen.localeCompare(b.lastSeen);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const allSelected = selected.size === ASSETS.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(ASSETS.map((a) => a.id)));
  const toggleRow = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const columns: { key: SortKey; label: string; className?: string }[] = [
    { key: "name",    label: "Name" },
    { key: "type",    label: "Type",       className: "w-40" },
    { key: "risk",    label: "Risk Level", className: "w-36" },
    { key: "lastSeen", label: "Last Seen", className: "w-36" },
  ];

  return (
    <div className="bg-card border border-border rounded overflow-hidden">
      <table className="w-full text-sm" role="grid">
        <thead>
          <tr className="border-b border-border bg-secondary">
            {/* Checkbox */}
            <th className="w-10 pl-4 pr-2 py-3">
              <input
                type="checkbox"
                aria-label="Select all rows"
                checked={allSelected}
                onChange={toggleAll}
                className="rounded border-muted text-primary focus:ring-primary/30 cursor-pointer"
              />
            </th>
            {columns.map(({ key, label, className }) => (
              <th
                key={key}
                className={cn("text-left py-3 pr-4 font-medium text-foreground text-xs uppercase tracking-wide", className)}
              >
                <button
                  onClick={() => handleSort(key)}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  {label}
                  <SortIcon column={key} sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
            ))}
            {/* Actions col */}
            <th className="w-12 py-3 pr-4" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((asset, idx) => {
            const isSelected = selected.has(asset.id);
            const risk = riskConfig[asset.risk];
            return (
              <tr
                key={asset.id}
                className={cn(
                  "border-b border-border last:border-b-0 transition-colors hover:bg-secondary/50",
                  isSelected && "bg-primary/5"
                )}
              >
                <td className="pl-4 pr-2 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${asset.name}`}
                    checked={isSelected}
                    onChange={() => toggleRow(asset.id)}
                    className="rounded border-muted text-primary focus:ring-primary/30 cursor-pointer"
                  />
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{asset.name}</span>
                    <span className="text-xs text-muted-foreground">{asset.owner}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    {typeIcons[asset.type]}
                    <span>{asset.type}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold", risk.className)}>
                    {risk.label}
                  </span>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{asset.lastSeen}</td>
                <td className="py-3 pr-4">
                  <button
                    aria-label={`More options for ${asset.name}`}
                    className="p-1 rounded hover:bg-accent text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination footer */}
      <div
        className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground"
        style={{ borderColor: "var(--border)" }}
      >
        <span>Showing <strong className="text-foreground">{filteredAssets.length}</strong> of <strong className="text-foreground">{ASSETS.length}</strong> assets</span>
        <div className="flex items-center gap-1">
          <button className="px-2.5 py-1 rounded border hover:bg-accent transition-colors" style={{ borderColor: "var(--border)" }}>
            Previous
          </button>
          <button className="px-2.5 py-1 rounded border bg-blue-600 text-white border-blue-600">1</button>
          <button className="px-2.5 py-1 rounded border hover:bg-accent transition-colors" style={{ borderColor: "var(--border)" }}>2</button>
          <button className="px-2.5 py-1 rounded border hover:bg-accent transition-colors" style={{ borderColor: "var(--border)" }}>3</button>
          <button className="px-2.5 py-1 rounded border hover:bg-accent transition-colors" style={{ borderColor: "var(--border)" }}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
