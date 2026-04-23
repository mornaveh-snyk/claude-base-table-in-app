"use client";

import { useState, useEffect } from "react";
import { Globe, Lock, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  type SavedView,
  type SavedViewPermission,
  type SavedViewFilter,
  type RoleType,
  ROLE_LABELS,
} from "@/lib/saved-views-context";

interface SaveViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    permission: SavedViewPermission;
    addToFavorites: boolean;
    filters: SavedViewFilter[];
  }) => void;
  editingView?: SavedView | null;
  mode?: "create" | "edit";
}

const ALL_ROLES: RoleType[] = [
  "tenant_admin",
  "tenant_member",
  "group_admin",
  "group_member",
  "org_admin",
  "org_member",
  "org_contributor",
];

const ROLE_GROUPS = [
  { label: "Tenant", roles: ["tenant_admin", "tenant_member"] as RoleType[] },
  { label: "Group", roles: ["group_admin", "group_member"] as RoleType[] },
  { label: "Organization", roles: ["org_admin", "org_member", "org_contributor"] as RoleType[] },
];

type Step = "details";

export function SaveViewDialog({
  open,
  onOpenChange,
  onSave,
  editingView,
  mode = "create",
}: SaveViewDialogProps) {
  type AccessMode = "everyone" | "roles" | "private";

  const [name, setName] = useState("");
  const [accessMode, setAccessMode] = useState<AccessMode>("roles");
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([]);
  const [addToFavorites, setAddToFavorites] = useState(true);

  useEffect(() => {
    if (open) {
      if (editingView) {
        setName(editingView.name);
        if (editingView.permission.type === "private") {
          setAccessMode("private");
        } else if (!editingView.permission.roles || editingView.permission.roles.length === ALL_ROLES.length) {
          setAccessMode("everyone");
        } else {
          setAccessMode("roles");
        }
        setSelectedRoles(editingView.permission.roles ?? []);
        setAddToFavorites(editingView.isFavorite);
      } else {
        setName("");
        setAccessMode("roles");
        setSelectedRoles([]);
        setAddToFavorites(true);
      }
    }
  }, [open, editingView]);

  const toggleRole = (role: RoleType) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleGroupRoles = (roles: RoleType[]) => {
    const allSelected = roles.every((r) => selectedRoles.includes(r));
    if (allSelected) {
      setSelectedRoles((prev) => prev.filter((r) => !roles.includes(r)));
    } else {
      setSelectedRoles((prev) => [...new Set([...prev, ...roles])]);
    }
  };

  const handleSave = () => {
    let permission: SavedViewPermission;
    if (accessMode === "private") {
      permission = { type: "private" };
    } else if (accessMode === "everyone") {
      permission = { type: "roles", roles: ALL_ROLES };
    } else {
      permission = { type: "roles", roles: selectedRoles };
    }

    onSave({ name: name.trim(), permission, addToFavorites, filters: [] });
    onOpenChange(false);
  };

  const canProceed =
    name.trim().length > 0 &&
    (accessMode === "everyone" || accessMode === "private" || selectedRoles.length > 0);

    name.trim().length > 0 &&
    (accessMode === "everyone" || accessMode === "private" || selectedRoles.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Saved View" : "Save View"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the name and access permissions for this view."
              : "Name your view and choose who can access it."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="view-name" className="text-sm font-medium text-foreground">
              View name
            </label>
            <Input
              id="view-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Critical Repos — Q1"
              autoFocus
            />
          </div>

          {/* Permissions */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Who can access this view?</span>

              {/* Everyone */}
              <button
                type="button"
                onClick={() => setAccessMode("everyone")}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors w-full",
                  accessMode === "everyone"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/40"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                  accessMode === "everyone" ? "border-primary" : "border-muted-foreground/40"
                )}>
                  {accessMode === "everyone" && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">Everyone</span>
                  <span className="text-xs text-muted-foreground">All users with access to Snyk can view this</span>
                </div>
              </button>

              {/* Specific roles */}
              <div className={cn(
                "rounded-lg border transition-colors",
                accessMode === "roles" ? "border-primary" : "border-border"
              )}>
                <button
                  type="button"
                  onClick={() => setAccessMode("roles")}
                  className={cn(
                    "flex items-center gap-3 p-3 text-left w-full transition-colors",
                    accessMode === "roles" ? "bg-primary/5" : "hover:bg-muted/40",
                    "rounded-t-lg"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                    accessMode === "roles" ? "border-primary" : "border-muted-foreground/40"
                  )}>
                    {accessMode === "roles" && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">Specific roles</span>
                    <span className="text-xs text-muted-foreground">Only users with selected roles can view this</span>
                  </div>
                </button>

                {/* Role checkboxes — visible when "roles" is selected */}
                {accessMode === "roles" && (
                  <div className="flex flex-col gap-3 px-4 pb-3 pt-1 border-t border-border/60">
                    {ROLE_GROUPS.map((group) => {
                      const allSelected = group.roles.every((r) => selectedRoles.includes(r));
                      const someSelected = group.roles.some((r) => selectedRoles.includes(r));
                      return (
                        <div key={group.label} className="flex flex-col gap-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={allSelected}
                              data-state={someSelected && !allSelected ? "indeterminate" : undefined}
                              onCheckedChange={() => toggleGroupRoles(group.roles)}
                            />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {group.label}
                            </span>
                          </label>
                          <div className="flex flex-col gap-1 pl-6">
                            {group.roles.map((role) => (
                              <label key={role} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                  checked={selectedRoles.includes(role)}
                                  onCheckedChange={() => toggleRole(role)}
                                />
                                <span className="text-sm text-foreground">{ROLE_LABELS[role]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Only me */}
              <button
                type="button"
                onClick={() => setAccessMode("private")}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors w-full",
                  accessMode === "private"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/40"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                  accessMode === "private" ? "border-primary" : "border-muted-foreground/40"
                )}>
                  {accessMode === "private" && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">Only me (private)</span>
                  <span className="text-xs text-muted-foreground">This view is only visible to you</span>
                </div>
              </button>
            </div>

            {/* Favorites */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <Checkbox
                checked={addToFavorites}
                onCheckedChange={(v) => setAddToFavorites(v === true)}
              />
              <span className="text-sm text-foreground">Add to favorites</span>
            </label>
          </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canProceed}>
            {mode === "edit" ? "Update View" : "Save View"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
