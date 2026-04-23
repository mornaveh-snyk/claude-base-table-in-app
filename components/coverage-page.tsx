"use client";

import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Columns3,
  TrendingUp,
  TrendingDown,
  Minus,
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
import { Progress } from "@/components/ui/progress";
import { useSavedViews } from "@/lib/saved-views-context";
import { PageHeader } from "@/components/page-header";

const tabs = ["All", "High Risk", "Medium Risk", "Low Risk"];

const coverageData = [
  { id: 1, repository: "frontend-app", coverage: 87, trend: "up", criticalIssues: 2, highIssues: 5, mediumIssues: 12, lowIssues: 28, lastScan: "2h ago", riskLevel: "Medium Risk" },
  { id: 2, repository: "api-gateway", coverage: 94, trend: "stable", criticalIssues: 0, highIssues: 1, mediumIssues: 4, lowIssues: 15, lastScan: "1h ago", riskLevel: "Low Risk" },
  { id: 3, repository: "auth-service", coverage: 72, trend: "down", criticalIssues: 5, highIssues: 8, mediumIssues: 18, lowIssues: 32, lastScan: "30m ago", riskLevel: "High Risk" },
  { id: 4, repository: "payment-processor", coverage: 91, trend: "up", criticalIssues: 1, highIssues: 2, mediumIssues: 6, lowIssues: 10, lastScan: "4h ago", riskLevel: "Low Risk" },
  { id: 5, repository: "data-pipeline", coverage: 65, trend: "down", criticalIssues: 8, highIssues: 12, mediumIssues: 25, lowIssues: 45, lastScan: "15m ago", riskLevel: "High Risk" },
  { id: 6, repository: "notification-service", coverage: 82, trend: "stable", criticalIssues: 3, highIssues: 6, mediumIssues: 14, lowIssues: 22, lastScan: "3h ago", riskLevel: "Medium Risk" },
  { id: 7, repository: "user-management", coverage: 88, trend: "up", criticalIssues: 1, highIssues: 3, mediumIssues: 8, lowIssues: 18, lastScan: "1h ago", riskLevel: "Low Risk" },
  { id: 8, repository: "analytics-engine", coverage: 78, trend: "down", criticalIssues: 4, highIssues: 7, mediumIssues: 16, lowIssues: 30, lastScan: "45m ago", riskLevel: "Medium Risk" },
  { id: 9, repository: "cms-backend", coverage: 58, trend: "down", criticalIssues: 10, highIssues: 15, mediumIssues: 28, lowIssues: 52, lastScan: "20m ago", riskLevel: "High Risk" },
  { id: 10, repository: "mobile-api", coverage: 95, trend: "up", criticalIssues: 0, highIssues: 0, mediumIssues: 3, lowIssues: 8, lastScan: "2h ago", riskLevel: "Low Risk" },
];

function CoverageBar({ coverage }: { coverage: number }) {
  const color = coverage >= 90 ? "bg-green-500" : coverage >= 75 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <Progress value={coverage} className="h-2 w-24" indicatorClassName={color} />
      <span className="text-sm font-medium w-10">{coverage}%</span>
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const config = {
    "Low Risk": "text-green-600 bg-green-50 border-green-200",
    "Medium Risk": "text-yellow-600 bg-yellow-50 border-yellow-200",
    "High Risk": "text-red-600 bg-red-50 border-red-200",
  }[risk] || "text-muted-foreground bg-muted";

  const Icon = risk === "High Risk" ? ShieldX : risk === "Medium Risk" ? ShieldAlert : ShieldCheck;

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", config)}>
      <Icon className="w-3 h-3" />
      {risk}
    </span>
  );
}

function TrendIndicator({ trend }: { trend: string }) {
  const config = {
    up: { icon: TrendingUp, color: "text-green-600" },
    down: { icon: TrendingDown, color: "text-red-600" },
    stable: { icon: Minus, color: "text-muted-foreground" },
  }[trend] || { icon: Minus, color: "text-muted-foreground" };

  const Icon = config.icon;
  return <Icon className={cn("w-4 h-4", config.color)} />;
}

export function CoveragePage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isModified, setIsModified] = useState(false);

  const { selectedViewId, savedViews, selectView, createView, updateView } = useSavedViews();
  const selectedView = savedViews.find((v) => v.id === selectedViewId);

  const filteredData = coverageData.filter((item) => {
    const matchesTab = activeTab === "All" || item.riskLevel === activeTab;
    const matchesSearch = item.repository.toLowerCase().includes(searchQuery.toLowerCase());
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
      page: "Coverage",
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

  const averageCoverage = Math.round(coverageData.reduce((acc, d) => acc + d.coverage, 0) / coverageData.length);
  const totalCritical = coverageData.reduce((acc, d) => acc + d.criticalIssues, 0);
  const totalHigh = coverageData.reduce((acc, d) => acc + d.highIssues, 0);
  const highRiskCount = coverageData.filter(d => d.riskLevel === "High Risk").length;

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background">
      <PageHeader
        icon={<Shield className="w-5 h-5" />}
        pageName="Coverage"
        pageKey="Coverage"
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
            placeholder="Search repositories..."
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
            <Shield className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-foreground">{averageCoverage}%</div>
          <div className="text-sm text-muted-foreground">Average Coverage</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-2xl font-bold text-foreground">{coverageData.length}</div>
          <div className="text-sm text-muted-foreground">Total Repositories</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2">
            <ShieldX className="w-5 h-5 text-red-600" />
            <div className="text-2xl font-bold text-red-600">{totalCritical}</div>
          </div>
          <div className="text-sm text-muted-foreground">Critical Issues</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">{highRiskCount}</div>
          </div>
          <div className="text-sm text-muted-foreground">High Risk Repos</div>
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
                <TableHead>Repository</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Critical</TableHead>
                <TableHead>High</TableHead>
                <TableHead>Medium</TableHead>
                <TableHead>Low</TableHead>
                <TableHead>Last Scan</TableHead>
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
                  <TableCell className="font-medium">{row.repository}</TableCell>
                  <TableCell><CoverageBar coverage={row.coverage} /></TableCell>
                  <TableCell><TrendIndicator trend={row.trend} /></TableCell>
                  <TableCell><RiskBadge risk={row.riskLevel} /></TableCell>
                  <TableCell>
                    {row.criticalIssues > 0 ? (
                      <span className="text-red-600 font-medium">{row.criticalIssues}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.highIssues > 0 ? (
                      <span className="text-orange-600 font-medium">{row.highIssues}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.mediumIssues}</TableCell>
                  <TableCell className="text-muted-foreground">{row.lowIssues}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{row.lastScan}</TableCell>
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
