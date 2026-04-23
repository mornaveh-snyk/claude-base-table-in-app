"use client";

import { useState } from "react";
import { Link as LinkIcon, Check, BookmarkPlus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SaveViewDialog } from "@/components/save-view-dialog";
import { cn } from "@/lib/utils";
import { useSavedViews, type SavedView, type SavedViewFilter } from "@/lib/saved-views-context";

interface PageHeaderProps {
  /** Icon shown before the page name */
  icon: React.ReactNode;
  /** The static page name, e.g. "Asset Management" */
  pageName: string;
  /** Snyk page identifier used when creating a new view */
  pageKey: string;
  /** Whether state has been modified since last save */
  isModified: boolean;
  /** Called when the user confirms saving an existing view's changes */
  onSave: () => void;
  /** Called after a new view is created (receives the name + options) */
  onCreateView: (data: {
    name: string;
    permission: SavedView["permission"];
    addToFavorites: boolean;
    filters: SavedViewFilter[];
  }) => void;
}

export function PageHeader({
  icon,
  pageName,
  pageKey: _pageKey,
  isModified,
  onSave,
  onCreateView,
}: PageHeaderProps) {
  const { selectedViewId, savedViews, getViewUrl } = useSavedViews();
  const selectedView = savedViews.find((v) => v.id === selectedViewId);

  const [copiedLink, setCopiedLink] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleCopyLink = async () => {
    const url = selectedView ? getViewUrl(selectedView.id) : window.location.href;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Label for the primary save button
  const saveLabel = selectedView
    ? isModified
      ? "Save changes"
      : "Saved"
    : "Save view";

  const saveDisabled = selectedView && !isModified;

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border shrink-0">
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">{pageName}</span>
            {selectedView && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium text-foreground">{selectedView.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5">
          {/* Copy link */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={handleCopyLink}
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <LinkIcon className="w-3.5 h-3.5" />
            )}
            <span className="text-xs">{copiedLink ? "Copied!" : "Copy link"}</span>
          </Button>

          {/* Save button + dropdown */}
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              disabled={!!saveDisabled}
              onClick={selectedView ? onSave : () => setSaveDialogOpen(true)}
              className={cn(
                "rounded-r-none border-r-0 text-xs gap-1.5 h-8",
                isModified && selectedView && "border-primary text-primary hover:bg-primary/5"
              )}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              {saveLabel}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-none px-1.5 h-8"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {selectedView && isModified && (
                  <>
                    <DropdownMenuItem onClick={onSave}>
                      Save changes to &quot;{selectedView.name}&quot;
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
                  Save as new view...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <SaveViewDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={(data) => {
          onCreateView(data);
          setSaveDialogOpen(false);
        }}
      />
    </>
  );
}
