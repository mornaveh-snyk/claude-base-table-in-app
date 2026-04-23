"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// Types
export type RoleType =
  | "tenant_admin"
  | "tenant_member"
  | "group_admin"
  | "group_member"
  | "org_admin"
  | "org_member"
  | "org_contributor"
  | "private";

export const ROLE_LABELS: Record<RoleType, string> = {
  tenant_admin: "Tenant Admin",
  tenant_member: "Tenant Member",
  group_admin: "Group Admin",
  group_member: "Group Member",
  org_admin: "Organization Admin",
  org_member: "Organization Member",
  org_contributor: "Organization Contributor",
  private: "Only me (private)",
};

// Keep PermissionType as an alias for backward compat
export type PermissionType = RoleType;

export interface SavedViewPermission {
  type: "roles" | "private";
  roles?: RoleType[];
}

export interface SavedViewFilter {
  label: string;
  color: string;
}

export interface SavedView {
  id: string;
  name: string;
  page: string;
  tab: string;
  isFavorite: boolean;
  permission: SavedViewPermission;
  filters: SavedViewFilter[];
  search: string;
  columns: string[];
  groupBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Initial saved views data
const INITIAL_SAVED_VIEWS: SavedView[] = [
  {
    id: "view-1",
    name: "Critical Repos",
    page: "Asset Management",
    tab: "Repositories",
    isFavorite: true,
    permission: { type: "roles", roles: ["org_admin", "org_member"] },
    filters: [{ label: "Risk: Critical", color: "border-red-300 bg-red-50 text-red-700" }],
    search: "",
    columns: ["name", "risk", "owner", "lastScan"],
    groupBy: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "view-2",
    name: "External APIs",
    page: "Asset Management",
    tab: "API",
    isFavorite: true,
    permission: { type: "roles", roles: ["group_admin", "group_member"] },
    filters: [{ label: "Type: External", color: "border-orange-300 bg-orange-50 text-orange-700" }],
    search: "",
    columns: ["name", "risk", "owner", "lastScan"],
    groupBy: null,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "view-3",
    name: "Unmonitored Services",
    page: "Coverage",
    tab: "All",
    isFavorite: true,
    permission: { type: "roles", roles: ["tenant_admin", "tenant_member"] },
    filters: [{ label: "Status: Unmonitored", color: "border-yellow-300 bg-yellow-50 text-yellow-700" }],
    search: "",
    columns: ["name", "status", "owner"],
    groupBy: null,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "view-4",
    name: "High-Risk Packages",
    page: "Asset Management",
    tab: "Packages",
    isFavorite: true,
    permission: { type: "private" },
    filters: [{ label: "Risk: High", color: "border-red-300 bg-red-50 text-red-700" }],
    search: "",
    columns: ["name", "risk", "version", "lastScan"],
    groupBy: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-08"),
  },
  {
    id: "view-5",
    name: "All Container Images",
    page: "Asset Management",
    tab: "Container images",
    isFavorite: false,
    permission: { type: "roles", roles: ["tenant_admin", "tenant_member", "group_admin", "group_member", "org_admin", "org_member", "org_contributor"] },
    filters: [],
    search: "",
    columns: ["name", "risk", "owner", "lastScan"],
    groupBy: null,
    createdAt: new Date("2023-12-20"),
    updatedAt: new Date("2023-12-25"),
  },
  {
    id: "view-6",
    name: "Web Apps by Owner",
    page: "Asset Management",
    tab: "Web applications",
    isFavorite: false,
    permission: { type: "roles", roles: ["org_admin", "org_contributor"] },
    filters: [],
    search: "",
    columns: ["name", "risk", "owner", "lastScan"],
    groupBy: "owner",
    createdAt: new Date("2023-12-15"),
    updatedAt: new Date("2023-12-18"),
  },
  {
    id: "view-7",
    name: "Recently Scanned",
    page: "Asset Management",
    tab: "Repositories",
    isFavorite: false,
    permission: { type: "roles", roles: ["org_admin", "org_member", "org_contributor"] },
    filters: [],
    search: "",
    columns: ["name", "risk", "owner", "lastScan"],
    groupBy: null,
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-19"),
  },
  {
    id: "view-8",
    name: "Medium Risk by Team",
    page: "Asset Management",
    tab: "Repositories",
    isFavorite: false,
    permission: { type: "roles", roles: ["group_admin", "group_member"] },
    filters: [{ label: "Risk: Medium", color: "border-yellow-300 bg-yellow-50 text-yellow-700" }],
    search: "",
    columns: ["name", "risk", "owner", "lastScan"],
    groupBy: "owner",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "view-9",
    name: "Database Assets",
    page: "Asset Management",
    tab: "Databases",
    isFavorite: false,
    permission: { type: "private" },
    filters: [],
    search: "db",
    columns: ["name", "risk", "owner", "lastScan"],
    groupBy: null,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "view-10",
    name: "Monitored Services",
    page: "Coverage",
    tab: "All",
    isFavorite: false,
    permission: { type: "roles", roles: ["org_admin", "org_member"] },
    filters: [{ label: "Status: Monitored", color: "border-green-300 bg-green-50 text-green-700" }],
    search: "",
    columns: ["name", "status", "owner", "lastScan"],
    groupBy: null,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "view-11",
    name: "Q1 Compliance Audit",
    page: "Asset Management",
    tab: "All assets",
    isFavorite: false,
    permission: { type: "roles", roles: ["tenant_admin", "group_admin"] },
    filters: [
      { label: "Risk: Critical", color: "border-red-300 bg-red-50 text-red-700" },
      { label: "Status: Unmonitored", color: "border-yellow-300 bg-yellow-50 text-yellow-700" },
    ],
    search: "",
    columns: ["name", "risk", "owner", "lastScan", "status"],
    groupBy: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-19"),
  },
  {
    id: "view-12",
    name: "Low Risk Assets",
    page: "Asset Management",
    tab: "All assets",
    isFavorite: false,
    permission: { type: "roles", roles: ["org_admin", "org_member", "org_contributor"] },
    filters: [{ label: "Risk: Low", color: "border-green-300 bg-green-50 text-green-700" }],
    search: "",
    columns: ["name", "risk", "owner"],
    groupBy: null,
    createdAt: new Date("2023-12-28"),
    updatedAt: new Date("2024-01-02"),
  },
];

// Context
interface SavedViewsContextType {
  savedViews: SavedView[];
  selectedViewId: string | null;
  defaultViewId: string | null;
  selectView: (id: string | null) => void;
  setDefaultView: (id: string | null) => void;
  createView: (view: Omit<SavedView, "id" | "createdAt" | "updatedAt">) => SavedView;
  updateView: (id: string, updates: Partial<SavedView>) => void;
  deleteView: (id: string) => void;
  duplicateView: (id: string) => SavedView;
  toggleFavorite: (id: string) => void;
  reorderFavorites: (viewIds: string[]) => void;
  getViewUrl: (id: string) => string;
}

const SavedViewsContext = createContext<SavedViewsContextType | null>(null);

export function SavedViewsProvider({ children }: { children: ReactNode }) {
  const [savedViews, setSavedViews] = useState<SavedView[]>(INITIAL_SAVED_VIEWS);
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const [defaultViewId, setDefaultViewId] = useState<string | null>(null);

  const selectView = useCallback((id: string | null) => {
    setSelectedViewId(id);
  }, []);

  const setDefaultView = useCallback((id: string | null) => {
    setDefaultViewId(id);
  }, []);

  const createView = useCallback((view: Omit<SavedView, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date();
    const newView: SavedView = {
      ...view,
      id: `view-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setSavedViews((prev) => [...prev, newView]);
    return newView;
  }, []);

  const updateView = useCallback((id: string, updates: Partial<SavedView>) => {
    setSavedViews((prev) =>
      prev.map((view) =>
        view.id === id
          ? { ...view, ...updates, updatedAt: new Date() }
          : view
      )
    );
  }, []);

  const deleteView = useCallback((id: string) => {
    setSavedViews((prev) => prev.filter((view) => view.id !== id));
    if (selectedViewId === id) {
      setSelectedViewId(null);
    }
  }, [selectedViewId]);

  const duplicateView = useCallback((id: string) => {
    const original = savedViews.find((v) => v.id === id);
    if (!original) throw new Error("View not found");
    const now = new Date();
    const newView: SavedView = {
      ...original,
      id: `view-${Date.now()}`,
      name: `${original.name} (Copy)`,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };
    setSavedViews((prev) => [...prev, newView]);
    return newView;
  }, [savedViews]);

  const toggleFavorite = useCallback((id: string) => {
    setSavedViews((prev) =>
      prev.map((view) =>
        view.id === id ? { ...view, isFavorite: !view.isFavorite, updatedAt: new Date() } : view
      )
    );
  }, []);

  const reorderFavorites = useCallback((viewIds: string[]) => {
    setSavedViews((prev) => {
      const favorited = viewIds.map((id) => prev.find((v) => v.id === id)!);
      const nonFavorited = prev.filter((v) => !v.isFavorite);
      return [...favorited, ...nonFavorited];
    });
  }, []);

  const getViewUrl = useCallback((id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/?view=${id}`;
  }, []);

  return (
    <SavedViewsContext.Provider
      value={{
        savedViews,
        selectedViewId,
        defaultViewId,
        selectView,
        setDefaultView,
        createView,
        updateView,
        deleteView,
        duplicateView,
        toggleFavorite,
        reorderFavorites,
        getViewUrl,
      }}
    >
      {children}
    </SavedViewsContext.Provider>
  );
}

export function useSavedViews() {
  const context = useContext(SavedViewsContext);
  if (!context) {
    throw new Error("useSavedViews must be used within a SavedViewsProvider");
  }
  return context;
}

export function useOptionalSavedViews() {
  return useContext(SavedViewsContext);
}
