"use client";

import { useState, useRef, useEffect } from "react";
import { Star, MoreHorizontal, Pencil, Copy, Trash2, Link as LinkIcon, ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedViews, type SavedView } from "@/lib/saved-views-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom SVG icons to match Snyk exactly
function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="10" width="4" height="10" rx="1" />
      <rect x="10" y="6" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="17" rx="1" />
    </svg>
  );
}

function InventoryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ProjectsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function IssuesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function PoliciesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8l2 2.5L12 13l-2-2.5L12 8z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ViewsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const navItems = [
  { icon: AnalyticsIcon, label: "Analytics",  active: false },
  { icon: InventoryIcon, label: "Inventory",  active: true  },
  { icon: ProjectsIcon,  label: "Projects",   active: false },
  { icon: IssuesIcon,    label: "Issues",     active: false },
  { icon: PoliciesIcon,  label: "Policies",   active: false },
];

interface PrimarySidebarProps {
  onSelectView?: (viewId: string) => void;
}

export function PrimarySidebar({ onSelectView }: PrimarySidebarProps) {
  const [viewsFlyoutOpen, setViewsFlyoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const flyoutRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { savedViews, selectedViewId, defaultViewId, selectView, setDefaultView, toggleFavorite, duplicateView, deleteView, getViewUrl } = useSavedViews();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Close flyout when clicking outside
  useEffect(() => {
    if (!viewsFlyoutOpen) {
      setSearchQuery("");
      return;
    }
    const handleClick = (e: MouseEvent) => {
      if (
        flyoutRef.current && !flyoutRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setViewsFlyoutOpen(false);
      }
    };
    // Focus search input when flyout opens
    setTimeout(() => searchRef.current?.focus(), 50);
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [viewsFlyoutOpen]);

  const handleCopyLink = async (view: SavedView, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getViewUrl(view.id);
    await navigator.clipboard.writeText(url);
    setCopiedLink(view.id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const filteredViews = searchQuery.trim()
    ? savedViews.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.page.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.tab.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : savedViews;

  const handleSelectView = (view: SavedView) => {
    selectView(view.id);
    onSelectView?.(view.id);
    setViewsFlyoutOpen(false);
  };

  return (
    <aside
      className="flex flex-col items-center w-[72px] shrink-0 h-screen border-r border-border bg-card"
      aria-label="Primary navigation"
    >
      {/* Snyk wordmark */}
      <div className="flex items-center justify-center w-full h-14 border-b border-border">
        <span className="text-lg font-bold tracking-tight text-primary">snyk</span>
      </div>

      {/* Main nav items */}
      <nav className="flex flex-col items-center gap-0.5 flex-1 pt-4 w-full px-2">
        {navItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            title={label}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className="flex flex-col items-center gap-1.5 w-full py-2 rounded transition-colors group"
          >
            <div className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
              active
                ? "border border-border bg-card shadow-sm"
                : "hover:bg-muted"
            )}>
              <Icon className={cn(
                "w-5 h-5",
                active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
            </div>
            <span className={cn(
              "text-[11px] font-medium leading-none",
              active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {label}
            </span>
          </button>
        ))}

        {/* Saved Views nav item */}
        <div className="relative w-full">
          <button
            ref={buttonRef}
            title="Saved Views"
            aria-label="Saved Views"
            aria-expanded={viewsFlyoutOpen}
            onClick={() => setViewsFlyoutOpen((v) => !v)}
            className="flex flex-col items-center gap-1.5 w-full py-2 rounded transition-colors group"
          >
            <div className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
              viewsFlyoutOpen
                ? "border border-border bg-card shadow-sm"
                : "hover:bg-muted"
            )}>
              <ViewsIcon className={cn(
                "w-5 h-5",
                viewsFlyoutOpen ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
            </div>
            <span className={cn(
              "text-[11px] font-medium leading-none",
              viewsFlyoutOpen ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}>
              Views
            </span>
          </button>

          {/* Flyout panel */}
          {viewsFlyoutOpen && (
            <div
              ref={flyoutRef}
              className="absolute left-full top-0 ml-2 z-50 w-72 rounded-lg border border-border bg-card shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Saved Views</span>
                <span className="text-xs text-muted-foreground">{savedViews.length} views</span>
              </div>

              {/* Search */}
              <div className="px-3 py-2 border-b border-border">
                <div className="relative">
                  <svg
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
                  >
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search views..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary text-foreground placeholder:text-muted-foreground"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Views list */}
              <div className="flex flex-col max-h-[calc(100vh-260px)] overflow-y-auto py-1">
                {filteredViews.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                    {searchQuery ? "No views match your search." : "No saved views yet."}
                  </p>
                ) : (
                  filteredViews.map((view) => (
                    <div
                      key={view.id}
                      className={cn(
                        "group flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors",
                        selectedViewId === view.id && "bg-accent"
                      )}
                      onClick={() => handleSelectView(view)}
                    >
                      {/* Favorite star */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(view.id); }}
                        className="shrink-0"
                        aria-label={view.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star className={cn(
                          "w-3.5 h-3.5 transition-colors",
                          view.isFavorite
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground/40 hover:text-yellow-500"
                        )} />
                      </button>

                      {/* Name + detail */}
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 w-full min-w-0">
                          <span className={cn(
                            "truncate text-sm",
                            selectedViewId === view.id ? "font-medium text-foreground" : "text-foreground"
                          )}>
                            {view.name}
                          </span>
                          {defaultViewId === view.id && (
                            <span className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                              <Home className="w-2.5 h-2.5" />
                              Default
                            </span>
                          )}
                        </div>
                        <span className="truncate w-full text-xs text-muted-foreground">
                          {view.page} · {view.tab}
                          {view.filters.length > 0 && (
                            <span className="ml-1.5">
                              · {view.filters.length} filter{view.filters.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Filter pills preview */}
                      {view.filters.length > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                          {view.filters.slice(0, 2).map((f) => (
                            <span
                              key={f.label}
                              className={cn(
                                "px-1.5 py-0.5 text-[10px] rounded border font-medium",
                                f.color || "bg-secondary text-foreground border-border"
                              )}
                            >
                              {f.label.split(":")[1]?.trim() ?? f.label}
                            </span>
                          ))}
                          {view.filters.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">+{view.filters.length - 2}</span>
                          )}
                        </div>
                      )}

                      {/* Context menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleFavorite(view.id); }}>
                            <Star className={cn("w-4 h-4", view.isFavorite && "fill-yellow-500 text-yellow-500")} />
                            {view.isFavorite ? "Remove favorite" : "Add to favorites"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDefaultView(defaultViewId === view.id ? null : view.id);
                            }}
                          >
                            <Home className={cn("w-4 h-4", defaultViewId === view.id && "text-primary")} />
                            {defaultViewId === view.id ? "Remove default" : "Set as default"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); duplicateView(view.id); }}>
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleCopyLink(view, e)}>
                            <LinkIcon className="w-4 h-4" />
                            {copiedLink === view.id ? "Copied!" : "Copy link"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => { e.stopPropagation(); deleteView(view.id); }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 py-2.5">
                <button
                  onClick={() => { onSelectView?.("all-views"); setViewsFlyoutOpen(false); }}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  See all saved views
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom icons */}
      <div className="flex flex-col items-center gap-1 pb-4 px-2 w-full">
        <button
          title="Settings"
          aria-label="Settings"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button
          title="Help"
          aria-label="Help"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <HelpIcon className="w-5 h-5" />
        </button>
        <button
          title="More"
          aria-label="More"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <MoreIcon className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
