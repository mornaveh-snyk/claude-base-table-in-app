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
import { SimpleFilterBar, QueryDisplay } from "@/components/filter-pills";
import { AdvancedFilterPopover } from "@/components/advanced-filter-popover";
import { 
  cn, 
  type FilterState, 
  type FilterCondition, 
  type AdvancedFilterQuery,
  type SimpleFilterState,
  createInitialFilterState,
  createEmptyAdvancedQuery,
  simpleToAdvanced,
  generateQuerySummary,
  hasValidConditions,
} from "@/lib/utils";
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
  const [filterState, setFilterState] = useState<FilterState>(createInitialFilterState());
  const [viewModified, setViewModified] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveAsMode, setSaveAsMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [advancedPopoverOpen, setAdvancedPopoverOpen] = useState(false);

  // Apply selected view settings
  useEffect(() => {
    if (selectedView) {
      setActiveTab(selectedView.tab);
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

  // Simple filter handlers
  const handleSimpleFiltersChange = useCallback((filters: SimpleFilterState) => {
    setFilterState(prev => ({
      ...prev,
      mode: "simple",
      simple: filters,
    }));
    markAsModified();
  }, []);

  // Add a single simple filter
  const handleAddSimpleFilter = useCallback((condition: FilterCondition) => {
    setFilterState(prev => ({
      ...prev,
      mode: "simple",
      simple: [...prev.simple, condition],
    }));
    markAsModified();
  }, []);

  // Apply advanced query (from AI or from popover)
  const handleApplyAdvancedQuery = useCallback((query: AdvancedFilterQuery) => {
    setFilterState(prev => ({
      ...prev,
      mode: "advanced",
      advanced: query,
    }));
    markAsModified();
  }, []);

  // Open advanced popover
  const handleOpenAdvanced = useCallback(() => {
    // If we have simple filters, convert them to advanced
    if (filterState.mode === "simple" && filterState.simple.length > 0) {
      const advancedQuery = simpleToAdvanced(filterState.simple);
      setFilterState(prev => ({
        ...prev,
        mode: "advanced",
        advanced: advancedQuery,
        simple: [], // Clear simple filters when switching to advanced
      }));
    } else if (!filterState.advanced || filterState.advanced.groups.length === 0) {
      // No filters - create empty advanced query
      setFilterState(prev => ({
        ...prev,
        mode: "advanced",
        advanced: createEmptyAdvancedQuery(),
      }));
    }
    setAdvancedPopoverOpen(true);
  }, [filterState]);

  // Handle advanced popover apply
  const handleAdvancedApply = useCallback((query: AdvancedFilterQuery) => {
    if (hasValidConditions(query)) {
      setFilterState(prev => ({
        ...prev,
        mode: "advanced",
        advanced: query,
      }));
    } else {
      // No valid conditions - revert to simple mode
      setFilterState(createInitialFilterState());
    }
    setAdvancedPopoverOpen(false);
    markAsModified();
  }, []);

  // Handle advanced popover cancel
  const handleAdvancedCancel = useCallback(() => {
    // If we were switching from simple and cancel, keep simple filters
    // Otherwise just close the popover
    setAdvancedPopoverOpen(false);
  }, []);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setFilterState(createInitialFilterState());
    markAsModified();
  }, []);

  // Edit the advanced query
  const handleEditAdvancedQuery = useCallback(() => {
    setAdvancedPopoverOpen(true);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    markAsModified();
  };

  const handleSaveClick = () => {
    if (selectedView) {
      // Save to existing view
      updateView(selectedView.id, {
        tab: activeTab,
        filters: [], // Would need to convert filter state to legacy format
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
      filters: data.filters,
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

  // Check if we have any active filters
  const hasActiveFilters = filterState.mode === "simple" 
    ? filterState.simple.length > 0 
    : filterState.advanced && hasValidConditions(filterState.advanced);

  // Get query summary for advanced mode display
  const querySummary = filterState.mode === "advanced" && filterState.advanced 
    ? generateQuerySummary(filterState.advanced)
    : "";

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
            {/* Filter UI - depends on mode */}
            {filterState.mode === "simple" ? (
              <>
                {/* Simple mode: show filter rows */}
                <SimpleFilterBar
                  filters={filterState.simple}
                  onFiltersChange={handleSimpleFiltersChange}
                  onAdvancedClick={handleOpenAdvanced}
                  showAdvancedLink={true}
                />
              </>
            ) : (
              <>
                {/* Advanced mode: show query display */}
                {querySummary && (
                  <QueryDisplay
                    summary={querySummary}
                    onEdit={handleEditAdvancedQuery}
                    onClear={handleClearAllFilters}
                  />
                )}
                
                {/* Show advanced filter link when query is empty but in advanced mode */}
                {!querySummary && (
                  <button
                    onClick={handleOpenAdvanced}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Advanced filter ›
                  </button>
                )}
              </>
            )}

            {/* AI Filter dropdown — always visible, next to filter controls */}
            <AIFilterCommand 
              onAddSimpleFilter={handleAddSimpleFilter}
              onApplyAdvancedQuery={handleApplyAdvancedQuery}
            />

            {/* Clear filters button - only in simple mode with filters */}
            {filterState.mode === "simple" && filterState.simple.length > 0 && (
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
          <AssetTable filterState={filterState} search={search} />
        </div>

        {/* Advanced Filter Popover - rendered as a controlled modal overlay */}
        {advancedPopoverOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-background/50"
              onClick={() => {
                handleAdvancedCancel();
              }}
            />
            {/* Popover content positioned near filters */}
            <div className="fixed left-6 top-[180px] z-50">
              <AdvancedFilterPopover
                open={advancedPopoverOpen}
                onOpenChange={setAdvancedPopoverOpen}
                query={filterState.advanced || createEmptyAdvancedQuery()}
                onApply={handleAdvancedApply}
                onCancel={handleAdvancedCancel}
              />
            </div>
          </>
        )}

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
