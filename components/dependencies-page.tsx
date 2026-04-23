"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Package,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  GitBranch,
  Search,
  SlidersHorizontal,
  Columns3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useSavedViews } from "@/lib/saved-views-context";
import { PageHeader } from "@/components/page-header";

const tabs = ["All", "Internal package", "External package"];

const dependencyData = [
  { id: 1, name: "react", type: "External package", version: "18.2.0", latest: "18.2.0", status: "up-to-date", vulnerabilities: 0, usedBy: 45, trend: "stable" },
  { id: 2, name: "lodash", type: "External package", version: "4.17.19", latest: "4.17.21", status: "outdated", vulnerabilities: 2, usedBy: 38, trend: "down" },
  { id: 3, name: "@acme/ui-kit", type: "Internal package", version: "3.1.0", latest: "3.2.0", status: "outdated", vulnerabilities: 0, usedBy: 32, trend: "up" },
  { id: 4, name: "express", type: "External package", version: "4.18.2", latest: "4.18.2", status: "up-to-date", vulnerabilities: 0, usedBy: 28, trend: "stable" },
  { id: 5, name: "moment", type: "External package", version: "2.29.1", latest: "2.30.1", status: "vulnerable", vulnerabilities: 3, usedBy: 24, trend: "down" },
  { id: 6, name: "@acme/auth-utils", type: "Internal package", version: "1.5.1", latest: "2.0.0", status: "vulnerable", vulnerabilities: 1, usedBy: 22, trend: "down" },
  { id: 7, name: "typescript", type: "External package", version: "5.3.2", latest: "5.3.3", status: "outdated", vulnerabilities: 0, usedBy: 56, trend: "up" },
  { id: 8, name: "@acme/data-models", type: "Internal package", version: "2.0.0", latest: "2.0.0", status: "up-to-date", vulnerabilities: 0, usedBy: 18, trend: "stable" },
  { id: 9, name: "prisma", type: "External package", version: "5.7.0", latest: "5.7.1", status: "outdated", vulnerabilities: 0, usedBy: 12, trend: "up" },
  { id: 10, name: "@acme/api-client", type: "Internal package", version: "4.2.0", latest: "4.2.0", status: "up-to-date", vulnerabilities: 0, usedBy: 8, trend: "up" },
];

function StatusBadge({ status }: { status: string }) {
  const config = {
    "up-to-date": "text-green-600 bg-green-50 border-green-200",
    "outdated": "text-yellow-600 bg-yellow-50 border-yellow-200",
    "vulnerable": "text-red-600 bg-red-50 border-red-200",
  }[status] || "text-muted-foreground bg-muted";

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", config)}>
      {status === "vulnerable" && <AlertTriangle className="w-3 h-3 mr-1" />}
      {status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
    </span>
  );
}

function TrendIndicator({ trend }: { trend: string }) {
  const config = {
    up: { icon: ArrowUpRight, color: "text-green-600" },
    down: { icon: ArrowDownRight, color: "text-red-600" },
    stable: { icon: Minus, color: "text-muted-foreground" },
  }[trend] || { icon: Minus, color: "text-muted-foreground" };

  const Icon = config.icon;
  return <Icon className={cn("w-4 h-4", config.color)} />;
}

export function DependenciesPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isModified, setIsModified] = useState(false);

  const { selectedViewId, savedViews, selectView, createView, updateView } = useSavedViews();
  const selectedView = savedViews.find((v) => v.id === selectedViewId);

  const filteredData = dependencyData.filter((item) => {
    const matchesTab = activeTab === "All" || item.type === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? filteredData.map((d) => d.id) : []);
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    setSelectedRows((prev) => (checked ? [...prev, id] : prev.filter((r) => r !== id)));
  };

  const handleSave = () => {
    if (selectedView) {
      updateView(selectedView.id, { tab: activeTab, search: searchQuery });
      setIsModified(false);
    }
  };

  const handleCreateView = (data: { name: string; permission: any; addToFavorites: boolean }) => {
    const newView = createView({
      name: data.name,
      page: "Dependencies",
      tab: activeTab,
      isFavorite: data.addToFavorites,
      permission: data.permission,
      filters: [],
      search: searchQuery,
      columns: [],
      groupBy: null,
    });
    selectView(newView.id);
    setIsModified(false);
  };

  const totalVulnerabilities = dependencyData.reduce((acc, d) => acc + d.vulnerabilities, 0);
  const outdatedCount = dependencyData.filter(d => d.status === "outdated").length;
  const vulnerableCount = dependencyData.filter(d => d.status === "vulnerable").length;

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background">
      <PageHeader
        icon={<GitBranch className="w-5 h-5" />}
        pageName="Dependencies"
        pageKey="Dependencies"
        isModified={isModified}
        onSave={handleSave}
        onCreateView={handleCreateView}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pt-4 border-b" style={{ borderColor: "var(--border)" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 px-6 py-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search dependencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
        <Button variant="outline" size="sm">
          <Columns3 className="w-4 h-4 mr-2" />
          Columns
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-foreground">{dependencyData.length}</div>
          <div className="text-sm text-muted-foreground">Total Packages</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-2xl font-bold text-foreground">{dependencyData.filter(d => d.type === "Internal package").length}</div>
          <div className="text-sm text-muted-foreground">Internal Packages</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-2xl font-bold text-foreground">{dependencyData.filter(d => d.type === "External package").length}</div>
          <div className="text-sm text-muted-foreground">External Packages</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div className="text-2xl font-bold text-red-600">{totalVulnerabilities}</div>
          </div>
          <div className="text-sm text-muted-foreground">Total Vulnerabilities</div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Latest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vulnerabilities</TableHead>
                <TableHead>Used By</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id} className={cn(selectedRows.includes(row.id) && "bg-accent/50")}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={(checked) => handleSelectRow(row.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{row.type}</TableCell>
                  <TableCell className="font-mono text-sm">{row.version}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{row.latest}</TableCell>
                  <TableCell><StatusBadge status={row.status} /></TableCell>
                  <TableCell>
                    {row.vulnerabilities > 0 ? (
                      <span className="text-red-600 font-medium">{row.vulnerabilities}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.usedBy} repos</TableCell>
                  <TableCell><TrendIndicator trend={row.trend} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
