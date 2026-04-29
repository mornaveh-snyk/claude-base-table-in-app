"use client";

import { useState } from "react";
import { PrimarySidebar } from "@/components/primary-sidebar";
import { SecondarySidebar, type InventoryPage } from "@/components/secondary-sidebar";
import { AssetManagementPage } from "@/components/asset-management-page";
import { AllSavedViewsPage } from "@/components/all-saved-views-page";
import { CoveragePage } from "@/components/coverage-page";
import { DependenciesPage } from "@/components/dependencies-page";
import { ComponentsPage } from "@/components/components-page";
import { TopNavigationBar } from "@/components/top-navigation-bar";
import { ViewsDocumentationModal } from "@/components/views-documentation-modal";
import { useSavedViews } from "@/lib/saved-views-context";

type AppView = "inventory" | "all-saved-views";

export function AppContent() {
  const [appView, setAppView] = useState<AppView>("inventory");
  const [currentPage, setCurrentPage] = useState<InventoryPage>("asset-management");
  const { selectView, savedViews } = useSavedViews();

  const handleNavigateToAllViews = () => {
    setAppView("all-saved-views");
  };

  const handleBackToMain = () => {
    setAppView("inventory");
  };

  const handleSelectViewFromList = (viewId: string) => {
    const view = savedViews.find((v) => v.id === viewId);
    if (view) {
      const pageMap: Record<string, InventoryPage> = {
        "Coverage": "coverage",
        "Asset Management": "asset-management",
        "Dependencies": "dependencies",
        "Components": "components",
      };
      const targetPage = pageMap[view.page] || "asset-management";
      setCurrentPage(targetPage);
    }
    selectView(viewId);
    setAppView("inventory");
  };

  const handleNavigatePage = (page: InventoryPage) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <PrimarySidebar onSelectView={(viewId) => {
          if (viewId === "all-views") {
            handleNavigateToAllViews();
          } else {
            handleSelectViewFromList(viewId);
          }
        }} />
      <ViewsDocumentationModal />
      <div className="flex flex-col flex-1 min-w-0">
        <TopNavigationBar />
        <div className="flex flex-1 overflow-hidden min-w-0">
          {appView !== "all-saved-views" && (
            <SecondarySidebar 
              currentPage={currentPage}
              onNavigatePage={handleNavigatePage}
              onNavigateToAllViews={handleNavigateToAllViews} 
            />
          )}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {appView === "inventory" && (
              <>
                {currentPage === "asset-management" && <AssetManagementPage />}
                {currentPage === "coverage" && <CoveragePage />}
                {currentPage === "dependencies" && <DependenciesPage />}
                {currentPage === "components" && <ComponentsPage />}
              </>
            )}
            {appView === "all-saved-views" && (
              <AllSavedViewsPage
                onBack={handleBackToMain}
                onSelectView={handleSelectViewFromList}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
