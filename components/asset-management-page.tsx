"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, LayoutGrid } from "lucide-react";
import { BillboardCards } from "@/components/billboard-cards";
import { AssetTable } from "@/components/asset-table";
import { SaveViewDialog } from "@/components/save-view-dialog";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import { useSavedViews, type SavedView } from "@/lib/saved-views-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
    getViewUrl,
  } = useSavedViews();

  const selectedView = savedViews.find((v) => v.id === selectedViewId);

  const [activeTab, setActiveTab] = useState("All assets");
  const [search, setSearch] = useState("");
  const [viewModified, setViewModified] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedView) {
      setActiveTab(selectedView.tab);
      setSearch(selectedView.search);
      setViewModified(false);
    }
  }, [selectedView]);

  const markAsModified = () => {
    if (selectedView) setViewModified(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    markAsModified();
  };

  const handleSaveClick = () => {
    if (selectedView) {
      updateView(selectedView.id, { tab: activeTab, search });
      setViewModified(false);
    } else {
      setSaveDialogOpen(true);
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

  return (
    <TooltipProvider>
      <main className="flex flex-col flex-1 min-h-screen overflow-y-auto overflow-x-hidden bg-background">
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
        <div className="flex flex-col gap-4 px-6 pt-6 pb-8 flex-1">
          {/* Controls bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1" />
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

          {/* Data table — sticky so it never scrolls below the viewport */}
          <div
            className="sticky top-0 flex flex-col"
            style={{ height: "calc(100vh - 56px - 2rem)" }}
          >
            <AssetTable search={search} />
          </div>
        </div>

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
