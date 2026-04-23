"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import { BillboardCards } from "@/components/billboard-cards";
import { AssetTable } from "@/components/asset-table";
import { SaveViewDialog } from "@/components/save-view-dialog";
import { PageHeader } from "@/components/page-header";
import { AIFilterCommand } from "@/components/ai-filter-command";
import { FilterPills } from "@/components/filter-pills";
import { cn, type FilterGroup, type LogicalOperator } from "@/lib/utils";
import { useSavedViews, type SavedView } from "@/lib/saved-views-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";

const TABS = [
  "All assets",
  "Repositories",
  "Container images",
  "Packages",
  "API",
  "Web applications",
];

const DEFAULT_FILTER_GROUP: FilterGroup = {
  items: [],
  betweenGroupOperator: "and",
};

export function AssetManagementPage() {
  const {
    savedViews,
    selectedViewId,
    selectView,
    createView,
    updateView,
    duplicateView,
    getViewUrl,
  } = useSavedViews();

  const selectedView = savedViews.find((v) => v.id === selectedViewId);

  const [activeTab, setActiveTab] = useState("All assets");
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState<FilterGroup>(DEFAULT_FILTER_GROUP);
  const [viewModified, setViewModified] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveAsMode, setSaveAsMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Apply selected view settings
  useEffect(() => {
    if (selectedView) {
      setActiveTab(selectedView.tab);
      // Convert legacy filters to FilterGroup format if needed
      setSearch(selectedView.search);
      setViewModified(false);
    }
  }, [selectedView]);

  // Track view modifications
  const markAsModified = () => {
    if (selectedView) {
      setViewModified(true);
    }
  };

  // AI Filter handlers
  const handleApplyAIFilters = useCallback((newFilterGroup: FilterGroup) => {
    setFilterGroup((prev) => {
      if (newFilterGroup.items.length === 0) return prev;
      
      // Add new filter group(s) as a new item to the existing group structure
      return {
        items: [...prev.items, ...newFilterGroup.items],
        betweenGroupOperator: prev.items.length > 0 ? prev.betweenGroupOperator : newFilterGroup.betweenGroupOperator,
      };
    });
    markAsModified();
  }, []);

  const handleRemoveFilter = useCallback((itemId: string, filterId: string) => {
    setFilterGroup((prev) => {
      const newItems = prev.items
        .map((item) =>
          item.id === itemId
            ? { ...item, filters: item.filters.filter((f) => f.id !== filterId) }
            : item
        )
        .filter((item) => item.filters.length > 0); // Remove empty items

      return { ...prev, items: newItems };
    });
    markAsModified();
  }, []);

  const handleToggleBetweenGroupOperator = useCallback(() => {
    setFilterGroup((prev) => ({
      ...prev,
      betweenGroupOperator: prev.betweenGroupOperator === "and" ? "or" : "and",
    }));
    markAsModified();
  }, []);

  const handleToggleGroupOperator = useCallback((itemId: string) => {
    setFilterGroup((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? { ...item, groupOperator: item.groupOperator === "and" ? "or" : "and" }
          : item
      ),
    }));
    markAsModified();
  }, []);

  const handleUpdateFilter = useCallback(
    (itemId: string, filterId: string, changes: Partial<{ value: string; operator: import("@/lib/utils").FilterOperator }>) => {
      setFilterGroup((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                filters: item.filters.map((f) =>
                  f.id === filterId ? { ...f, ...changes } : f
                ),
              }
            : item
        ),
      }));
      markAsModified();
    },
    []
  );

  const handleAddFilterToGroup = useCallback(
    (itemId: string, filter: import("@/lib/utils").Filter) => {
      setFilterGroup((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId
            ? { ...item, filters: [...item.filters, filter] }
            : item
        ),
      }));
      markAsModified();
    },
    []
  );

  const handleClearAllFilters = useCallback(() => {
    setFilterGroup(DEFAULT_FILTER_GROUP);
    markAsModified();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    markAsModified();
  };

  const handleSaveClick = () => {
    if (selectedView) {
      // Save to existing view
      const allFilters = filterGroup.items.flatMap(item => item.filters);
      updateView(selectedView.id, {
        tab: activeTab,
        filters: allFilters.map(f => ({ label: f.displayLabel, color: f.color || "" })),
        search,
      });
      setViewModified(false);
    } else {
      // Open save dialog for new view
      setSaveAsMode(false);
      setSaveDialogOpen(true);
    }
  };

  const handleSaveAs = () => {
    setSaveAsMode(true);
    setSaveDialogOpen(true);
  };

  const handleDuplicate = () => {
    if (selectedView) {
      const newView = duplicateView(selectedView.id);
      selectView(newView.id);
    }
  };

  const handleSaveDialogSave = (data: {
    name: string;
    permission: SavedView["permission"];
    addToFavorites: boolean;
    filters: Array<{ label: string; color: string }>;
  }) => {
    const newView = createView({
      name: data.name,
      page: "Asset Management",
      tab: activeTab,
      isFavorite: data.addToFavorites,
      permission: data.permission,
      filters: data.filters.length > 0 ? data.filters : filterGroup.items.flatMap(item => item.filters).map(f => ({ label: f.displayLabel, color: f.color || "" })),
      search,
      columns: ["name", "risk", "owner", "lastScan"],
      groupBy: null,
    });
    selectView(newView.id);
    setViewModified(false);
  };

  const handleCopyLink = async () => {
    const url = selectedView ? getViewUrl(selectedView.id) : window.location.href;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <TooltipProvider>
      <main className="flex flex-col flex-1 min-h-screen overflow-auto bg-background">
        <PageHeader
          icon={<LayoutGrid className="w-5 h-5" />}
          pageName="Asset Management"
          pageKey="Asset Management"
          isModified={viewModified}
          onSave={handleSaveClick}
          onCreateView={handleSaveDialogSave}
        />

        {/* Tabs */}
        <div className="flex items-center gap-0 px-6 bg-card border-b border-border shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex flex-col gap-4 p-6 flex-1">
          {/* Controls bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter pills with AND/OR toggles */}
            <FilterPills
              filterGroup={filterGroup}
              onRemoveFilter={handleRemoveFilter}
              onToggleBetweenGroupOperator={handleToggleBetweenGroupOperator}
              onToggleGroupOperator={handleToggleGroupOperator}
              onUpdateFilter={handleUpdateFilter}
              onAddFilterToGroup={handleAddFilterToGroup}
              onClearAll={handleClearAllFilters}
            />

            {/* AI Filter dropdown — always to the right of pills */}
            <AIFilterCommand onApplyFilters={handleApplyAIFilters} />

            {/* Clear filters button */}
            {filterGroup.items.length > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Clear filters
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  markAsModified();
                }}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Billboards */}
          <BillboardCards />

          {/* Table controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Group by:
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1">
                    Asset class
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Asset class</DropdownMenuItem>
                  <DropdownMenuItem>Organization</DropdownMenuItem>
                  <DropdownMenuItem>Deployment stage</DropdownMenuItem>
                  <DropdownMenuItem>None</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <span className="text-sm text-muted-foreground tabular-nums">
              1,842 assets
            </span>
          </div>

          {/* Data table */}
          <AssetTable filterGroup={filterGroup} search={search} />
        </div>

        {/* Save View Dialog */}
        <SaveViewDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          onSave={handleSaveDialogSave}
          mode="create"
        />


      </main>
    </TooltipProvider>
  );
}
