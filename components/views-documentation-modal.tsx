"use client";

// Views documentation modal component
import { useState } from "react";
import { FileText, Globe, Users, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function ViewsDocumentationModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg z-50"
        size="icon"
        variant="default"
      >
        <FileText className="w-5 h-5" />
        <span className="sr-only">Open Views Documentation</span>
      </Button>

      {/* Documentation modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Views Feature Documentation</DialogTitle>
            <DialogDescription>
              Understanding the goal, purpose, and interaction model for Views
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Goal Section */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">Goal</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Views enable users to save and quickly access customized configurations of their data. 
                Instead of repeatedly applying the same filters, column arrangements, and groupings, users can 
                save these configurations as named Views and return to them instantly.
              </p>
            </section>

            {/* Scope Section */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">Navigation Structure</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Main Navigation</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Views are <strong>scoped to the main navigation item</strong> (e.g., Inventory, Projects, Issues, Policies). 
                    A view created within Inventory will only appear and be accessible within Inventory, ensuring views 
                    remain contextually relevant and organized.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Secondary Navigation</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The <strong>secondary navigation</strong> (e.g., Asset Management, Coverage, Dependencies, Components) 
                    represents the main jobs-to-be-done within each main navigation area. If these default items don&apos;t 
                    match your workflow, you can create custom views, favorite them, and they&apos;ll appear in the secondary 
                    navigation for quick access — effectively letting you <strong>organize your workbench</strong> as you wish.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Tabs (Asset Types)</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Within each secondary navigation item, <strong>tabs represent the asset types</strong> available for 
                    that specific use case. For example, Coverage shows tabs for Repositories, API, and Web applications; 
                    Dependencies shows Internal and External packages; Components shows Applications, Libraries, Plugins, 
                    and Metadata. This allows you to quickly filter by asset type within any view context.
                  </p>
                </div>
              </div>
            </section>

            {/* JTBD Section */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">Jobs-to-be-Done (JTBD)</h3>
              <div className="space-y-3">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground">1. Create views that solve specific use cases</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Build targeted views for your unique workflows — &quot;Coverage for new assets&quot;, &quot;AI in important assets&quot;, 
                    &quot;Onboarding status per team&quot;, &quot;Critical vulnerabilities in production&quot;. Save configurations once, 
                    access them instantly whenever needed.
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground">2. Quick access to the views you care about most</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mark views as favorites to pin them in the secondary navigation. Your most-used views are always 
                    one click away, eliminating repetitive navigation and filter configuration throughout your workday.
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground">3. For admins: Configure Snyk to display the right views to the right people</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set role-based permissions when creating views to ensure team members see relevant, curated data. 
                    Share views with specific roles (Tenant Admins, Group Members, Org Contributors) so each user 
                    gets a tailored experience without manual setup.
                  </p>
                </div>
              </div>
            </section>

            {/* Permissions Section */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">Permissions</h3>
              <p className="text-sm text-muted-foreground mb-3">
                When saving a view, users choose who can access it:
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <Globe className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Everyone</p>
                    <p className="text-xs text-muted-foreground">All users with access to Snyk can view this saved view.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <Users className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Specific Roles</p>
                    <p className="text-xs text-muted-foreground">Only users with selected roles (Tenant Admin, Group Member, Organization Contributor, etc.) can access this view.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Only Me (Private)</p>
                    <p className="text-xs text-muted-foreground">The view is only visible to the creator. Useful for personal workflows and experimentation.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Interaction Model Section */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">Interaction Model</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Creating a View</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Apply filters, adjust columns, set grouping</li>
                    <li>Click &quot;Save view&quot; in the page header</li>
                    <li>Name the view and set permissions</li>
                    <li>Optionally add to favorites for quick access</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Accessing Views</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Favorited views appear in the secondary sidebar</li>
                    <li>Click &quot;See all saved views&quot; for the full list</li>
                    <li>Views are filtered by the current navigation context</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Modifying Views</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Changes to an active view show &quot;Save changes&quot;</li>
                    <li>Update existing view or save as new</li>
                    <li>Breadcrumb shows current view name</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Sharing Views</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Copy view URL via the link button</li>
                    <li>Recipients see identical configuration</li>
                    <li>Permission settings control access</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* What Views Are NOT For */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                What Views Should NOT Be Used For
              </h3>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Views are designed for <strong>filtering and organizing data</strong>, not for changing 
                  how metrics are calculated or displayed globally. The following configurations should be 
                  managed in <strong>Settings</strong>, not in Views:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                  <li>Changing the default risk scoring methodology (e.g., CVSS Score vs. Risk Score)</li>
                  <li>Setting organization-wide column defaults for all tables</li>
                  <li>Configuring global severity thresholds or priority rules</li>
                  <li>Modifying how assets are classified or categorized system-wide</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  These global configurations affect all users and should be managed by administrators in the Settings area.
                </p>
              </div>
            </section>

            {/* Key Benefits */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">Key Benefits</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span><strong>Time Savings:</strong> Eliminate repetitive filter configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span><strong>Consistency:</strong> Team members see identical data presentations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span><strong>Context Switching:</strong> Quickly move between different workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span><strong>Collaboration:</strong> Share specific perspectives with stakeholders</span>
                </li>
              </ul>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
