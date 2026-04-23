"use client";

import { useState } from "react";
import {
  Shield,
  Server,
  GitBranch,
  Puzzle,
  Star,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Link as LinkIcon,
  GripVertical,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedViews, type SavedView } from "@/lib/saved-views-context";
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

export type InventoryPage = "coverage" | "asset-management" | "dependencies" | "components";

const navLinks: { icon: typeof Shield; label: string; page: InventoryPage }[] = [
  { icon: Shield, label: "Coverage", page: "coverage" },
  { icon: Server, label: "Asset Management", page: "asset-management" },
  { icon: GitBranch, label: "Dependencies", page: "dependencies" },
  { icon: Puzzle, label: "Components", page: "components" },
];

interface SecondarySidebarProps {
  currentPage: InventoryPage;
  onNavigatePage: (page: InventoryPage) => void;
  onNavigateToAllViews?: () => void;
}

export function SecondarySidebar({ currentPage, onNavigatePage, onNavigateToAllViews }: SecondarySidebarProps) {
  const {
    savedViews,
    selectedViewId,
    defaultViewId,
    selectView,
    setDefaultView,
    updateView,
    deleteView,
    duplicateView,
    toggleFavorite,
    reorderFavorites,
    getViewUrl,
  } = useSavedViews();

  const [editingView, setEditingView] = useState<SavedView | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewToDelete, setViewToDelete] = useState<SavedView | null>(null);
  const [draggedViewId, setDraggedViewId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const favoritedViews = savedViews.filter((v) => v.isFavorite);

  const handleEdit = (view: SavedView) => {
    setEditingView(view);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (data: {
    name: string;
    permission: SavedView["permission"];
    addToFavorites: boolean;
  }) => {
    if (editingView) {
      updateView(editingView.id, {
        name: data.name,
        permission: data.permission,
        isFavorite: data.addToFavorites,
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
      setViewToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleCopyLink = async (view: SavedView) => {
    const url = getViewUrl(view.id);
    await navigator.clipboard.writeText(url);
    setCopiedLink(view.id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, viewId: string) => {
    setDraggedViewId(viewId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetViewId: string) => {
    e.preventDefault();
    if (!draggedViewId || draggedViewId === targetViewId) {
      setDraggedViewId(null);
      return;
    }

    const currentOrder = favoritedViews.map((v) => v.id);
    const draggedIndex = currentOrder.indexOf(draggedViewId);
    const targetIndex = currentOrder.indexOf(targetViewId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newOrder = [...currentOrder];
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedViewId);
      reorderFavorites(newOrder);
    }

    setDraggedViewId(null);
  };

  const handleDragEnd = () => {
    setDraggedViewId(null);
  };

  return (
    <>
      <aside
        className="flex flex-col w-56 shrink-0 h-full border-r bg-card overflow-hidden"
        style={{ borderColor: "var(--border)" }}
        aria-label="Secondary navigation"
      >
        {/* Primary nav */}
        <nav className="flex flex-col gap-0.5 px-2 pt-3 pb-2">
          {navLinks.map(({ icon: Icon, label, page }) => {
            const isActive = currentPage === page;
            return (
              <button
                key={label}
                onClick={() => onNavigatePage(page)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm transition-colors text-left",
                  isActive
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div
          className="mx-4 border-t my-1"
          style={{ borderColor: "var(--border)" }}
        />

        {/* Favorited views - scrollable section */}
        <div className="flex flex-col flex-1 min-h-0 px-2 pt-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 mb-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Favorited Views
            </span>
          </div>
          <div className="flex flex-col gap-0.5 overflow-y-auto">
            {favoritedViews.map((view) => {
              const pageMap: Record<string, InventoryPage> = {
                "Coverage": "coverage",
                "Asset Management": "asset-management",
                "Dependencies": "dependencies",
                "Components": "components",
              };
              const targetPage = pageMap[view.page] || "asset-management";
              return (
                <SavedViewItem
                  key={view.id}
                  view={view}
                  isSelected={selectedViewId === view.id}
                  isDefault={defaultViewId === view.id}
                  isDragging={draggedViewId === view.id}
                  copiedLink={copiedLink === view.id}
                  onSelect={() => { onNavigatePage(targetPage); selectView(view.id); }}
                  onEdit={() => handleEdit(view)}
                  onDuplicate={() => handleDuplicate(view)}
                  onDelete={() => handleDeleteClick(view)}
                  onToggleFavorite={() => toggleFavorite(view.id)}
                  onSetDefault={() => setDefaultView(defaultViewId === view.id ? null : view.id)}
                  onCopyLink={() => handleCopyLink(view)}
                  onDragStart={(e) => handleDragStart(e, view.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, view.id)}
                  onDragEnd={handleDragEnd}
                  draggable
                />
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onNavigateToAllViews}
            className="w-full text-left text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            See all saved views →
          </button>
        </div>
      </aside>

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
    </>
  );
}

interface SavedViewItemProps {
  view: SavedView;
  isSelected: boolean;
  isDefault: boolean;
  isDragging: boolean;
  copiedLink: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onSetDefault: () => void;
  onCopyLink: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  draggable: boolean;
}

function SavedViewItem({
  view,
  isSelected,
  isDefault,
  isDragging,
  copiedLink,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onSetDefault,
  onCopyLink,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  draggable,
}: SavedViewItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex items-center gap-1.5 w-full rounded-md text-sm transition-all",
        isSelected
          ? "bg-accent"
          : "hover:bg-accent/50",
        isDragging && "opacity-50"
      )}
    >
      {/* Drag handle */}
      <div className="pl-1 py-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>

      {/* View info button */}
      <button
        onClick={onSelect}
        className="flex flex-col items-start gap-0.5 flex-1 min-w-0 py-2 pr-1 text-left"
      >
        <div className="flex items-center gap-1 w-full min-w-0">
          <span
            className={cn(
              "truncate text-sm",
              isSelected ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {view.name}
          </span>
          {isDefault && (
            <span className="shrink-0 flex items-center gap-0.5 px-1 py-0.5 text-[9px] font-medium rounded-full bg-primary/10 text-primary border border-primary/20 leading-none">
              <Home className="w-2 h-2" />
              Default
            </span>
          )}
        </div>
        <span className="truncate w-full text-xs text-muted-foreground/70">
          {view.page} · {view.tab}
        </span>
      </button>

      {/* Context menu */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "p-1.5 mr-1 rounded hover:bg-accent transition-opacity",
              menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="w-4 h-4" />
            Edit view
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSetDefault}>
            <Home className={cn("w-4 h-4", isDefault && "text-primary")} />
            {isDefault ? "Remove default" : "Set as default"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="w-4 h-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopyLink}>
            <LinkIcon className="w-4 h-4" />
            {copiedLink ? "Copied!" : "Copy link"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleFavorite}>
            <Star className={cn("w-4 h-4", view.isFavorite && "fill-yellow-500 text-yellow-500")} />
            {view.isFavorite ? "Remove from favorites" : "Add to favorites"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
