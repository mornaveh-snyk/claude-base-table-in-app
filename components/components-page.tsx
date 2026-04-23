"use client";

import { useState } from "react";
import {
  Box,
  MoreHorizontal,
  Puzzle,
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

const tabs = ["All", "Applications", "Libraries", "Plugins", "Metadata"];

const componentData = [
  { id: 1, name: "customer-portal", type: "Applications", version: "2.1.0", usedIn: 128, lastUpdated: "2 days ago", owner: "Platform Team" },
  { id: 2, name: "admin-dashboard", type: "Applications", version: "3.0.2", usedIn: 45, lastUpdated: "1 week ago", owner: "Platform Team" },
  { id: 3, name: "@acme/ui-components", type: "Libraries", version: "1.8.0", usedIn: 67, lastUpdated: "3 days ago", owner: "Design System" },
  { id: 4, name: "@acme/auth-lib", type: "Libraries", version: "4.2.1", usedIn: 89, lastUpdated: "5 days ago", owner: "Security Team" },
  { id: 5, name: "snyk-ide-plugin", type: "Plugins", version: "2.0.0", usedIn: 78, lastUpdated: "1 day ago", owner: "Integrations Team" },
  { id: 6, name: "github-actions-plugin", type: "Plugins", version: "1.5.3", usedIn: 156, lastUpdated: "2 weeks ago", owner: "DevOps Team" },
  { id: 7, name: "package.json schema", type: "Metadata", version: "3.1.0", usedIn: 34, lastUpdated: "4 days ago", owner: "Platform Team" },
  { id: 8, name: "openapi-spec", type: "Metadata", version: "2.3.1", usedIn: 92, lastUpdated: "6 days ago", owner: "API Team" },
  { id: 9, name: "jira-plugin", type: "Plugins", version: "1.2.0", usedIn: 23, lastUpdated: "1 month ago", owner: "Integrations Team" },
  { id: 10, name: "sbom-manifest", type: "Metadata", version: "1.0.0", usedIn: 12, lastUpdated: "3 days ago", owner: "Security Team" },
];

function TypeBadge({ type }: { type: string }) {
  const config = {
    Applications: "text-blue-600 bg-blue-50 border-blue-200",
    Libraries: "text-purple-600 bg-purple-50 border-purple-200",
    Plugins: "text-orange-600 bg-orange-50 border-orange-200",
    Metadata: "text-green-600 bg-green-50 border-green-200",
  }[type] || "text-muted-foreground bg-muted";

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize", config)}>
      {type}
    </span>
  );
}

export function ComponentsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isModified, setIsModified] = useState(false);

  const { selectedViewId, savedViews, selectView, createView, updateView } = useSavedViews();
  const selectedView = savedViews.find((v) => v.id === selectedViewId);

  const filteredData = componentData.filter((item) => {
    const matchesTab = activeTab === "All" || item.type.toLowerCase() === activeTab.toLowerCase();
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
      page: "Components",
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

  const totalUsage = componentData.reduce((acc, c) => acc + c.usedIn, 0);

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background">
      <PageHeader
        icon={<Puzzle className="w-5 h-5" />}
        pageName="Components"
        pageKey="Components"
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
            placeholder="Search components..."
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
          <div className="text-2xl font-bold text-foreground">{componentData.length}</div>
          <div className="text-sm text-muted-foreground">Total Components</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-2xl font-bold text-foreground">{componentData.filter(c => c.type === "Applications").length}</div>
          <div className="text-sm text-muted-foreground">Applications</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-2xl font-bold text-foreground">{componentData.filter(c => c.type === "Libraries").length}</div>
          <div className="text-sm text-muted-foreground">Libraries</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-2xl font-bold text-foreground">{componentData.filter(c => c.type === "Plugins").length}</div>
          <div className="text-sm text-muted-foreground">Plugins</div>
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
                <TableHead>Component</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Used In</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Last Updated</TableHead>
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
                  <TableCell><TypeBadge type={row.type} /></TableCell>
                  <TableCell className="font-mono text-sm">{row.version}</TableCell>
                  <TableCell>{row.usedIn} repos</TableCell>
                  <TableCell className="text-muted-foreground">{row.owner}</TableCell>
                  <TableCell className="text-muted-foreground">{row.lastUpdated}</TableCell>
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
