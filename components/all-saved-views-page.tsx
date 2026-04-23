"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Star,
  Globe,
  Lock,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Link as LinkIcon,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedViews, type SavedView, ROLE_LABELS } from "@/lib/saved-views-context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SaveViewDialog } from "@/components/save-view-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AllSavedViewsPageProps {
  onBack: () => void;
  onSelectView: (viewId: string) => void;
}

function getPermissionLabel(view: SavedView): string {
  if (view.permission.type === "private") return "Only me";
  if (!view.permission.roles || view.permission.roles.length === 0) return "No roles";
  if (view.permission.roles.length === 1) return ROLE_LABELS[view.permission.roles[0]];
  return `${view.permission.roles.length} roles`;
}

function getPermissionIcon(view: SavedView) {
  if (view.permission.type === "private") return Lock;
  return Globe;
}

export function AllSavedViewsPage({ onBack, onSelectView }: AllSavedViewsPageProps) {
  const {
    savedViews,
    updateView,
    deleteView,
    duplicateView,
    toggleFavorite,
    getViewUrl,
  } = useSavedViews();

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingView, setEditingView] = useState<SavedView | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewToDelete, setViewToDelete] = useState<SavedView | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const filteredViews = useMemo(() => {
    const searchLower = search.toLowerCase();
    return savedViews.filter(
      (view) =>
        view.name.toLowerCase().includes(searchLower) ||
        view.page.toLowerCase().includes(searchLower) ||
        view.tab.toLowerCase().includes(searchLower)
    );
  }, [savedViews, search]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredViews.map((v) => v.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleEdit = (view: SavedView) => {
    setEditingView(view);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (data: {
    name: string;
    permission: SavedView["permission"];
    addToFavorites: boolean;
    filters: SavedView["filters"];
  }) => {
    if (editingView) {
      updateView(editingView.id, {
        name: data.name,
        permission: data.permission,
        isFavorite: data.addToFavorites,
        filters: data.filters.length > 0 ? data.filters : editingView.filters,
      });
      setEditingView(null);
    }
  };

  const handleDuplicate = (view: SavedView) => {
    const newView = duplicateView(view.id);
    setEditingView(newView);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (view: SavedView) => {
    setViewToDelete(view);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (viewToDelete) {
      deleteView(viewToDelete.id);
      selectedIds.delete(viewToDelete.id);
      setSelectedIds(new Set(selectedIds));
      setViewToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteView(id));
    setSelectedIds(new Set());
    setBulkDeleteDialogOpen(false);
  };

  const handleBulkFavorite = () => {
    selectedIds.forEach((id) => {
      const view = savedViews.find((v) => v.id === id);
      if (view && !view.isFavorite) {
        toggleFavorite(id);
      }
    });
    setSelectedIds(new Set());
  };

  const handleCopyLink = async (view: SavedView) => {
    const url = getViewUrl(view.id);
    await navigator.clipboard.writeText(url);
    setCopiedLink(view.id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const allSelected = filteredViews.length > 0 && selectedIds.size === filteredViews.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredViews.length;

  return (
    <main className="flex flex-col flex-1 min-h-screen overflow-auto bg-background">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 h-14 bg-card border-b shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-base font-semibold text-foreground">All Saved Views</h1>
          <span className="text-sm text-muted-foreground">
            ({savedViews.length} views)
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-4 p-6 flex-1">
        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search views..."
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-foreground placeholder:text-muted-foreground"
              style={{ borderColor: "var(--border)" }}
            />
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
              <Button variant="outline" size="sm" onClick={handleBulkFavorite}>
                <Star className="w-3.5 h-3.5" />
                Add to favorites
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card" style={{ borderColor: "var(--border)" }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    className={someSelected ? "data-[state=checked]:bg-primary" : ""}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Page / Tab</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredViews.map((view) => {
                const PermIcon = getPermissionIcon(view);
                return (
                  <TableRow
                    key={view.id}
                    className={cn(
                      "cursor-pointer",
                      selectedIds.has(view.id) && "bg-accent/50"
                    )}
                    onClick={() => onSelectView(view.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(view.id)}
                        onCheckedChange={(checked) =>
                          handleSelectOne(view.id, checked === true)
                        }
                        aria-label={`Select ${view.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(view.id);
                          }}
                          className="shrink-0"
                          aria-label={view.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star
                            className={cn(
                              "w-4 h-4 transition-colors",
                              view.isFavorite
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-muted-foreground hover:text-yellow-500"
                            )}
                          />
                        </button>
                        <span className="font-medium text-foreground">{view.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {view.page} · {view.tab}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <PermIcon className="w-3.5 h-3.5" />
                        <span className="text-sm">{getPermissionLabel(view)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-sm">{formatDate(view.updatedAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded hover:bg-accent transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleEdit(view)}>
                            <Pencil className="w-4 h-4" />
                            Edit view
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(view)}>
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(view)}>
                            <LinkIcon className="w-4 h-4" />
                            {copiedLink === view.id ? "Copied!" : "Copy link"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFavorite(view.id)}>
                            <Star
                              className={cn(
                                "w-4 h-4",
                                view.isFavorite && "fill-yellow-500 text-yellow-500"
                              )}
                            />
                            {view.isFavorite ? "Remove from favorites" : "Add to favorites"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteClick(view)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredViews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {search ? "No views match your search." : "No saved views yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      <SaveViewDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveEdit}
        editingView={editingView}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved View</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{viewToDelete?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Saved Views</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} saved views? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
