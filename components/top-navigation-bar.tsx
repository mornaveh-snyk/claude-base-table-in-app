"use client";

import { Home, Building2, Users, Search, Bell, Plus } from "lucide-react";

export function TopNavigationBar() {
  return (
    <div className="flex items-center justify-between px-4 bg-card border-b border-border h-14 shrink-0">
      <div className="flex items-center gap-1">
        {/* Snyk Home pill */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-foreground">
          <Home className="w-4 h-4" />
          Snyk
        </button>
        <span className="text-muted-foreground mx-1">/</span>
        {/* All groups */}
        <button className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Building2 className="w-4 h-4" />
          All groups
        </button>
        <span className="text-muted-foreground mx-1">/</span>
        {/* All organizations */}
        <button className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Users className="w-4 h-4" />
          All organizations
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden ml-1">
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face" 
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-px h-6 bg-border mx-2" />
        <button className="w-8 h-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
