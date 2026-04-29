"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

/* ============================================================
   CONSTANTS
   ============================================================ */

const PAGE_SIZE = 100;

type ColId =
  | "select"
  | "name"
  | "type"
  | "assetClass"
  | "issueCounts"
  | "riskScore"
  | "coverage"
  | "team"
  | "language"
  | "environment"
  | "lastScan"
  | "source"
  | "visibility"
  | "actions";

interface ColDef {
  id: ColId;
  label: string;
  width: number;
  sticky: boolean;
  visible: boolean;
  sortable: boolean;
}

const COLUMNS: ColDef[] = [
  { id: "select",      label: "",             width: 48,  sticky: true,  visible: true,  sortable: false },
  { id: "name",        label: "Asset name",   width: 260, sticky: true,  visible: true,  sortable: true  },
  { id: "type",        label: "Type",         width: 140, sticky: false, visible: true,  sortable: true  },
  { id: "assetClass",  label: "Class",        width: 80,  sticky: false, visible: true,  sortable: true  },
  { id: "issueCounts", label: "Issues",       width: 200, sticky: false, visible: true,  sortable: false },
  { id: "riskScore",   label: "Score",        width: 100, sticky: false, visible: true,  sortable: true  },
  { id: "coverage",    label: "Coverage",     width: 180, sticky: false, visible: true,  sortable: false },
  { id: "team",        label: "Team",         width: 200, sticky: false, visible: true,  sortable: true  },
  { id: "language",    label: "Language",     width: 110, sticky: false, visible: false, sortable: true  },
  { id: "environment", label: "Environment",  width: 110, sticky: false, visible: false, sortable: true  },
  { id: "lastScan",    label: "Last scan",    width: 120, sticky: false, visible: false, sortable: false },
  { id: "source",      label: "Source",       width: 130, sticky: false, visible: false, sortable: false },
  { id: "visibility",  label: "Visibility",   width: 100, sticky: false, visible: false, sortable: true  },
  { id: "actions",     label: "",             width: 56,  sticky: false, visible: true,  sortable: false },
];

/* ============================================================
   DATA GENERATOR
   ============================================================ */

type AssetType =
  | "API"
  | "Application"
  | "Container image"
  | "Package"
  | "Repository"
  | "SBOM"
  | "Service"
  | "Website";

type TeamName =
  | "Legendary Shack Shakers"
  | "Love and Rockets"
  | "Nouvelle Vague"
  | "Public Service Broadcasting"
  | "The Bad Seeds"
  | "Trimdon Grange Explosion";

type LanguageName =
  | "C#"
  | "Go"
  | "Java"
  | "Javascript"
  | "Python"
  | "Ruby"
  | "Typescript";

interface AssetItem {
  id: string;
  name: string;
  assetClass: string;
  type: AssetType;
  issues: { critical: number; high: number; medium: number; low: number };
  riskScore: number;
  coverage: string[];
  team: TeamName;
  language: LanguageName;
  source: string[];
  environment: string;
  firstSeen: string;
  lastScan: string;
  visibility: string;
  activityStatus: string;
}

const NAMES = [
  "auth-service","payment-api","user-service","notification-svc","reporting-api",
  "search-svc","ml-inference","data-pipeline","config-service","gateway-api",
  "frontend-app","admin-console","billing-svc","analytics-api","asset-manager",
  "secret-manager","cert-rotator","log-aggregator","event-bus","scheduler-svc",
  "cache-service","queue-worker","batch-processor","file-storage","image-resize",
  "email-service","sms-gateway","push-notification","webhook-relay","rate-limiter",
  "feature-flags","ab-testing","session-svc","token-service","audit-log",
  "compliance-checker","vuln-scanner","dep-tracker","sbom-generator","policy-engine",
  "k8s-operator","helm-chart","terraform-module","ansible-role","docker-base-img",
  "nginx-proxy","haproxy-lb","istio-config","envoy-filter","otel-collector",
];

const TEAMS: TeamName[] = [
  "Legendary Shack Shakers",
  "Love and Rockets",
  "Nouvelle Vague",
  "Public Service Broadcasting",
  "The Bad Seeds",
  "Trimdon Grange Explosion",
];

const LANGUAGES: LanguageName[] = [
  "C#", "Go", "Java", "Javascript", "Python", "Ruby", "Typescript",
];

const CLASS_CYCLE = ["A","B","C","C","D","B","C","D","B","C","A","C","D","B","C","D","C","B","D","C"];

const TYPES: AssetType[] = [
  "API","Application","Container image","Package","Repository","SBOM","Service","Website",
];

const ENVS = ["Production","Staging","Development","Testing"];
const VISIBILITIES = ["Public","Private","Internal"];
const COVERAGE_TYPES = ["SCM","SAST","Secrets","DAST","Container","IaC"];
const SOURCE_TYPES = ["SCM","CLI","CI/CD","Docker","Registry","API"];
const LAST_SCAN_LABELS = [
  "just now","15 min ago","1 hour ago","3 hours ago","6 hours ago","12 hours ago",
  "1 day ago","2 days ago","5 days ago","8 days ago","14 days ago","21 days ago","30+ days ago",
];
const NAME_SUFFIXES = ["","-v2","-prod","-staging","-svc","-api","-worker","-gateway",""];

const REFERENCE_DATE = new Date("2026-04-20");

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getBitmaskSubset(arr: string[], bitmask: number): string[] {
  const result: string[] = [];
  for (let j = 0; j < arr.length; j++) {
    if (bitmask & (1 << j)) result.push(arr[j]);
  }
  return result;
}

function getSecondaryLine(item: AssetItem): string {
  const name = item.name;
  switch (item.type) {
    case "Repository":      return `github.com/org/${name}`;
    case "Container image": return `docker.io/org/${name}`;
    case "Package":
      return item.language === "Java"
        ? `pkg:maven/${name}`
        : `pkg:npm/${name}`;
    case "API":             return `${name}.api.internal`;
    case "SBOM":            return item.id;
    case "Service":         return `${name}.svc.cluster.local`;
    case "Website":         return `https://${name}.io`;
    case "Application":     return `app:${name}`;
    default:                return name;
  }
}

function generateDataset(): AssetItem[] {
  const items: AssetItem[] = [];
  for (let i = 0; i < 10473; i++) {
    const assetClass = CLASS_CYCLE[i % CLASS_CYCLE.length];

    let riskBase: number;
    if (assetClass === "A") riskBase = 80;
    else if (assetClass === "B") riskBase = 55;
    else if (assetClass === "C") riskBase = 30;
    else riskBase = 10;

    const riskScore = Math.min(100, Math.max(0, riskBase + (i % 20)));

    let critIssues: number, highIssues: number, medIssues: number, lowIssues: number;
    if (assetClass === "A") {
      critIssues = (i % 7) + 2;
      highIssues = (i % 8) + 3;
      medIssues  = (i % 10) + 5;
      lowIssues  = (i % 15) + 8;
    } else if (assetClass === "B") {
      critIssues = i % 5;
      highIssues = (i % 6) + 1;
      medIssues  = (i % 9) + 2;
      lowIssues  = (i % 12) + 4;
    } else if (assetClass === "C") {
      critIssues = i % 3;
      highIssues = i % 4;
      medIssues  = (i % 7) + 1;
      lowIssues  = (i % 10) + 2;
    } else {
      critIssues = 0;
      highIssues = i % 2;
      medIssues  = i % 4;
      lowIssues  = (i % 8) + 1;
    }

    const nameBase = NAMES[i % NAMES.length];
    const cycle = Math.floor(i / NAMES.length);
    const suffix = NAME_SUFFIXES[i % NAME_SUFFIXES.length];
    const namePart = cycle > 0 ? String(cycle).padStart(2, "0") : "";
    const name = nameBase + (namePart ? "-" + namePart : "") + suffix;

    const coverageMask = i % 64;
    const coverage = getBitmaskSubset(COVERAGE_TYPES, coverageMask || 1);

    const sourceMask = (i * 7) % 64;
    const source = getBitmaskSubset(SOURCE_TYPES, sourceMask || 1);

    let activityStatus: string;
    const actMod = i % 10;
    if (actMod < 7) activityStatus = "Active";
    else if (actMod < 9) activityStatus = "Inactive";
    else activityStatus = "Stale";

    const daysAgo = 10473 - i;
    const firstSeenDate = new Date(REFERENCE_DATE);
    firstSeenDate.setDate(firstSeenDate.getDate() - daysAgo);
    const firstSeen = formatDate(firstSeenDate);

    const lastScan = LAST_SCAN_LABELS[i % LAST_SCAN_LABELS.length];
    const type = TYPES[i % TYPES.length];
    const team = TEAMS[i % TEAMS.length];
    const language = LANGUAGES[i % LANGUAGES.length];

    items.push({
      id: "asset-" + String(i + 1).padStart(5, "0"),
      name,
      assetClass,
      type,
      issues: { critical: critIssues, high: highIssues, medium: medIssues, low: lowIssues },
      riskScore,
      coverage,
      team,
      language,
      source,
      environment: ENVS[(i * 3) % ENVS.length],
      firstSeen,
      lastScan,
      visibility: VISIBILITIES[i % 3],
      activityStatus,
    });
  }
  return items;
}

// Generated at module level — fine for prototype
const DATASET = generateDataset();

/* ============================================================
   MOCK API
   ============================================================ */

interface PageResult {
  items: AssetItem[];
  nextCursor: number;
  hasMore: boolean;
}

interface GroupMeta {
  id: string;
  label: string;
  count: number;
  issues: { critical: number; high: number; medium: number; low: number };
}

function fetchPage(
  allItems: AssetItem[],
  cursor: number,
  signal?: AbortSignal
): Promise<PageResult> {
  return new Promise((resolve, reject) => {
    const delay = 200 + (cursor === 0 ? 100 : 0);
    const t = setTimeout(() => {
      const slice = allItems.slice(cursor, cursor + PAGE_SIZE);
      resolve({
        items: slice,
        nextCursor: cursor + slice.length,
        hasMore: cursor + slice.length < allItems.length,
      });
    }, delay);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }
  });
}

function computeGroups(allItems: AssetItem[], groupBy: string): GroupMeta[] {
  const map = new Map<string, GroupMeta>();
  for (const item of allItems) {
    const key = String((item as unknown as Record<string, unknown>)[groupBy]);
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        label: key,
        count: 0,
        issues: { critical: 0, high: 0, medium: 0, low: 0 },
      });
    }
    const g = map.get(key)!;
    g.count++;
    g.issues.critical += item.issues.critical;
    g.issues.high += item.issues.high;
    g.issues.medium += item.issues.medium;
    g.issues.low += item.issues.low;
  }
  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

function fetchGroupMetadata(
  allItems: AssetItem[],
  groupBy: string
): Promise<GroupMeta[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(computeGroups(allItems, groupBy));
    }, 300);
  });
}

function fetchGroupPage(
  allItems: AssetItem[],
  groupId: string,
  groupBy: string,
  cursor: number
): Promise<PageResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const groupItems = allItems.filter(
        (item) => String((item as unknown as Record<string, unknown>)[groupBy]) === groupId
      );
      const slice = groupItems.slice(cursor, cursor + PAGE_SIZE);
      resolve({
        items: slice,
        nextCursor: cursor + slice.length,
        hasMore: cursor + slice.length < groupItems.length,
      });
    }, 250);
  });
}

/* ============================================================
   TYPES
   ============================================================ */

type SelMode = "none" | "some" | "all";
type Density = "comfortable" | "compact";
type SortDir = "asc" | "desc";

interface GroupState extends GroupMeta {
  expanded: boolean;
  items: AssetItem[];
  cursor: number;
  hasMore: boolean;
  loading: boolean;
}

/* ============================================================
   COVERAGE ABBREV
   ============================================================ */

const COVERAGE_ABBREV: Record<string, string> = {
  SCM: "SCM",
  SAST: "SAT",
  Secrets: "SEC",
  DAST: "DST",
  Container: "CTR",
  IaC: "IaC",
};

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function IssueCounts({ issues }: { issues: AssetItem["issues"] }) {
  return (
    <div className="at-issue-counts">
      {(
        [
          { key: "critical" as const, label: "C", iconCls: "at-issue-icon--critical", cntCls: "at-issue-count--critical" },
          { key: "high"     as const, label: "H", iconCls: "at-issue-icon--high",     cntCls: "at-issue-count--high"     },
          { key: "medium"   as const, label: "M", iconCls: "at-issue-icon--medium",   cntCls: "at-issue-count--medium"   },
          { key: "low"      as const, label: "L", iconCls: "at-issue-icon--low",       cntCls: "at-issue-count--low"      },
        ] as const
      ).map(({ key, label, iconCls, cntCls }) => (
        <div key={key} className="at-issue-item">
          <div className={`at-issue-icon ${iconCls}`} aria-hidden="true">{label}</div>
          <span className={cntCls} aria-label={`${issues[key]} ${key}`}>
            {issues[key]}
          </span>
        </div>
      ))}
    </div>
  );
}

function ClassBadge({ cls }: { cls: string }) {
  return (
    <span className={`at-class-badge at-class-badge--${cls.toLowerCase()}`}>
      {cls}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  let variant: string;
  if (score >= 80) variant = "critical";
  else if (score >= 60) variant = "high";
  else if (score >= 40) variant = "medium";
  else variant = "low";
  return (
    <span className={`at-score-badge at-score-badge--${variant}`} aria-label={`Risk score: ${score}`}>
      {score}
    </span>
  );
}

function CoverageCell({ coverage }: { coverage: string[] }) {
  return (
    <div className="at-coverage-grid">
      {COVERAGE_TYPES.map((cov) => {
        const active = coverage.includes(cov);
        return (
          <div
            key={cov}
            className={`at-coverage-icon ${active ? "at-coverage-icon--active" : "at-coverage-icon--empty"}`}
            title={cov}
          >
            {COVERAGE_ABBREV[cov] ?? cov.slice(0, 3)}
          </div>
        );
      })}
    </div>
  );
}

function SourceCell({ source }: { source: string[] }) {
  const maxVisible = 3;
  const visible = source.slice(0, maxVisible);
  const overflow = source.length - visible.length;
  return (
    <div className="at-tags-list">
      {visible.map((s) => (
        <span key={s} className="at-tag-badge">{s}</span>
      ))}
      {overflow > 0 && (
        <span className="at-tags-overflow">+{overflow}</span>
      )}
    </div>
  );
}

function EnvBadge({ env }: { env: string }) {
  const cls = env.toLowerCase().replace(" ", "-");
  return (
    <span className={`at-env-badge at-env-badge--${cls}`}>{env}</span>
  );
}

/* GroupSentinel: own component so IntersectionObserver attaches cleanly */
function GroupSentinel({
  groupId,
  onIntersect,
}: {
  groupId: string;
  onIntersect: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect(groupId);
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [groupId, onIntersect]);

  return (
    <div
      ref={ref}
      className="at-sentinel"
      aria-hidden="true"
      data-group-sentinel={groupId}
    />
  );
}

/* ============================================================
   DETAIL PANEL
   ============================================================ */

function DetailPanel({
  item,
  onClose,
}: {
  item: AssetItem | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (item) {
      setTimeout(() => closeRef.current?.focus(), 50);
    }
  }, [item]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && item) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [item, onClose]);

  return (
    <>
      {item && (
        <div
          className="at-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className="at-detail-panel"
        aria-hidden={!item ? "true" : "false"}
        role="dialog"
        aria-label={item ? `Asset details: ${item.name}` : "Asset details"}
      >
        <div className="at-detail-panel-inner">
          <button
            ref={closeRef}
            className="at-detail-close"
            onClick={onClose}
            aria-label="Close details panel"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {item && (
            <>
              <h2>{item.name}</h2>
              <p className="at-detail-subtitle">{item.type} · {item.id}</p>

              <div className="at-detail-section">
                <h3>Risk Overview</h3>
                {[
                  { label: "Risk Score",      value: `${item.riskScore} / 100` },
                  { label: "Asset Class",     value: item.assetClass },
                  { label: "Critical Issues", value: String(item.issues.critical) },
                  { label: "High Issues",     value: String(item.issues.high) },
                  { label: "Medium Issues",   value: String(item.issues.medium) },
                  { label: "Low Issues",      value: String(item.issues.low) },
                ].map(({ label, value }) => (
                  <div key={label} className="at-detail-row">
                    <span className="at-detail-label">{label}</span>
                    <span className="at-detail-value">{value}</span>
                  </div>
                ))}
              </div>

              <div className="at-detail-section">
                <h3>Metadata</h3>
                {[
                  { label: "Team",            value: item.team },
                  { label: "Language",        value: item.language },
                  { label: "Environment",     value: item.environment },
                  { label: "Visibility",      value: item.visibility },
                  { label: "Activity Status", value: item.activityStatus },
                  { label: "First Seen",      value: item.firstSeen },
                  { label: "Last Scan",       value: item.lastScan },
                  { label: "Coverage",        value: item.coverage.join(", ") || "None" },
                  { label: "Source",          value: item.source.join(", ") || "None" },
                ].map(({ label, value }) => (
                  <div key={label} className="at-detail-row">
                    <span className="at-detail-label">{label}</span>
                    <span className="at-detail-value">{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   CELL RENDERER
   ============================================================ */

function CellContent({
  col,
  item,
  onOpen,
  isSelected,
  onToggle,
}: {
  col: ColDef;
  item: AssetItem;
  onOpen: (item: AssetItem) => void;
  isSelected: boolean;
  onToggle: (id: string) => void;
}) {
  switch (col.id) {
    case "select":
      return (
        <input
          type="checkbox"
          aria-label={`Select ${item.name}`}
          checked={isSelected}
          onChange={(e) => { e.stopPropagation(); onToggle(item.id); }}
        />
      );

    case "name":
      return (
        <div className="at-asset-name-cell">
          <button
            className="at-asset-name-primary"
            aria-label={`Open ${item.name}`}
            onClick={(e) => { e.stopPropagation(); onOpen(item); }}
          >
            {item.name}
          </button>
          <span className="at-asset-name-secondary">
            {getSecondaryLine(item)}
          </span>
        </div>
      );

    case "type":
      return (
        <span style={{ color: "var(--at-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.type}
        </span>
      );

    case "assetClass":
      return <ClassBadge cls={item.assetClass} />;

    case "issueCounts":
      return <IssueCounts issues={item.issues} />;

    case "riskScore":
      return <ScoreBadge score={item.riskScore} />;

    case "coverage":
      return <CoverageCell coverage={item.coverage} />;

    case "team":
      return (
        <span style={{ color: "var(--at-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.team}
        </span>
      );

    case "language":
      return (
        <span style={{ color: "var(--at-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.language}
        </span>
      );

    case "environment":
      return <EnvBadge env={item.environment} />;

    case "lastScan":
      return (
        <span style={{ fontSize: "12px", color: "var(--at-text-2)" }}>
          {item.lastScan}
        </span>
      );

    case "source":
      return <SourceCell source={item.source} />;

    case "visibility":
      return (
        <span style={{ fontSize: "12px", color: "var(--at-text-2)" }}>
          {item.visibility}
        </span>
      );

    case "actions":
      return (
        <button
          className="at-row-action-btn"
          aria-label={`More actions for ${item.name}`}
          aria-haspopup="menu"
          onClick={(e) => e.stopPropagation()}
        >
          ⋯
        </button>
      );

    default:
      return null;
  }
}

/* ============================================================
   DATA ROW
   ============================================================ */

function DataRow({
  item,
  rowIndex,
  visibleCols,
  isSelected,
  onToggle,
  onOpen,
}: {
  item: AssetItem;
  rowIndex: number;
  visibleCols: ColDef[];
  isSelected: boolean;
  onToggle: (id: string) => void;
  onOpen: (item: AssetItem) => void;
}) {
  return (
    <div
      role="row"
      aria-rowindex={rowIndex}
      aria-selected={isSelected}
      data-id={item.id}
      className="at-data-row"
      tabIndex={0}
    >
      {visibleCols.map((col) => (
        <div
          key={col.id}
          role="gridcell"
          data-col-id={col.id}
          className="at-cell"
        >
          <CellContent
            col={col}
            item={item}
            onOpen={onOpen}
            isSelected={isSelected}
            onToggle={onToggle}
          />
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   GROUP HEADER ROW
   ============================================================ */

function GroupHeaderRow({
  group,
  onToggleExpand,
  onToggleItems,
  someSelected,
  allSelected,
}: {
  group: GroupState;
  onToggleExpand: (id: string) => void;
  onToggleItems: (id: string) => void;
  someSelected: boolean;
  allSelected: boolean;
}) {
  const cbRef = useCallback(
    (el: HTMLInputElement | null) => {
      if (el) {
        el.indeterminate = someSelected && !allSelected;
      }
    },
    [someSelected, allSelected]
  );

  return (
    <div
      role="row"
      className="at-group-header-row"
      data-group-id={group.id}
      tabIndex={0}
      aria-expanded={group.expanded}
      onClick={() => onToggleExpand(group.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleExpand(group.id);
        }
      }}
    >
      <div role="gridcell" className="at-group-header-cell">
        <input
          type="checkbox"
          className="at-group-checkbox"
          aria-label={`Select all in ${group.label}`}
          aria-checked={allSelected ? "true" : someSelected ? "mixed" : "false"}
          checked={allSelected}
          ref={cbRef}
          onChange={(e) => { e.stopPropagation(); onToggleItems(group.id); }}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          className="at-group-toggle"
          aria-expanded={group.expanded}
          aria-label={`${group.expanded ? "Collapse" : "Expand"} group ${group.label}`}
          onClick={(e) => { e.stopPropagation(); onToggleExpand(group.id); }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="at-group-header-cell__left">
          <span className="at-group-header-cell__name">{group.label}</span>
          <span className="at-group-header-cell__count">({group.count} assets)</span>
        </div>
        <div className="at-group-header-cell__right">
          <span className="at-group-header-cell__metric" style={{ color: "var(--at-critical)" }}>
            {group.issues.critical}c critical
          </span>
          <span className="at-group-header-cell__metric">
            Issues: {group.issues.high}h {group.issues.medium}m
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FLOATING BULK BAR
   ============================================================ */

function FloatingBulkBar({
  count,
  description,
  onDeselect,
}: {
  count: number;
  description: string;
  onDeselect: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="at-floating-bulk-bar" role="region" aria-label="Bulk actions">
      <div className="at-floating-bulk-bar__inner">
        <div className="at-floating-bulk-bar__selection">
          <span className="at-floating-bulk-bar__count">{description}</span>
          <button
            className="at-floating-bulk-bar__clear"
            onClick={onDeselect}
            aria-label="Clear selection"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="at-floating-bulk-bar__sep" />
        <div className="at-floating-bulk-bar__actions">
          {["Tag","Ignore","Export"].map((action) => (
            <button
              key={action}
              className="at-floating-bulk-bar__btn"
              data-action={action}
            >
              {action}
            </button>
          ))}
          <button
            className="at-floating-bulk-bar__btn at-floating-bulk-bar__btn--danger"
            data-action="Delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COLUMN TOGGLE PANEL
   ============================================================ */

function ColTogglePanel({
  columns,
  onToggle,
  onClose,
}: {
  columns: ColDef[];
  onToggle: (id: ColId) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="at-dropdown-panel" role="dialog" aria-label="Column visibility">
      <h3 className="at-dropdown-panel__title">Columns</h3>
      {columns
        .filter((c) => !c.sticky && c.id !== "actions")
        .map((col) => (
          <label key={col.id} className="at-col-vis-item">
            <input
              type="checkbox"
              checked={col.visible}
              onChange={() => onToggle(col.id)}
            />
            {col.label}
          </label>
        ))}
    </div>
  );
}

/* ============================================================
   MAIN ASSET TABLE
   ============================================================ */

interface AssetTableProps {
  search?: string;
}

export function AssetTable({ search }: AssetTableProps) {
  /* ---- filtered dataset (search) ---- */
  const filteredDataset = useMemo<AssetItem[]>(() => {
    if (!search?.trim()) return DATASET;
    const q = search.toLowerCase();
    return DATASET.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.team.toLowerCase().includes(q) ||
        item.environment.toLowerCase().includes(q)
    );
  }, [search]);

  /* ---- column state ---- */
  const [columns, setColumns] = useState<ColDef[]>(() =>
    COLUMNS.map((c) => ({ ...c }))
  );

  /* ---- flat infinite scroll state ---- */
  const [flatItems, setFlatItems] = useState<AssetItem[]>([]);
  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  /* ---- grouping state ---- */
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupState[]>([]);
  const groupsRef = useRef<GroupState[]>([]);
  useEffect(() => { groupsRef.current = groups; }, [groups]);

  /* ---- selection ---- */
  const [selMode, setSelMode] = useState<SelMode>("none");
  const [selIncluded, setSelIncluded] = useState<Set<string>>(new Set());
  const [selExcluded, setSelExcluded] = useState<Set<string>>(new Set());

  /* ---- sort ---- */
  const [sortCol, setSortCol] = useState<ColId | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  /* ---- density ---- */
  const [density, setDensity] = useState<Density>("comfortable");

  /* ---- UI ---- */
  const [panelItem, setPanelItem] = useState<AssetItem | null>(null);
  const [colPanelOpen, setColPanelOpen] = useState(false);
  const [scrolledX, setScrolledX] = useState(false);
  const [loadStatus, setLoadStatus] = useState("");

  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const mainObsRef = useRef<IntersectionObserver | null>(null);

  /* ============================================================
     SELECTION HELPERS
     ============================================================ */

  const isSelected = useCallback(
    (id: string): boolean => {
      if (selMode === "none") return false;
      if (selMode === "all") return !selExcluded.has(id);
      return selIncluded.has(id);
    },
    [selMode, selIncluded, selExcluded]
  );

  const getSelectedCount = useCallback((): number => {
    if (selMode === "none") return 0;
    if (selMode === "all") return filteredDataset.length - selExcluded.size;
    return selIncluded.size;
  }, [selMode, selIncluded, selExcluded, filteredDataset.length]);

  const getSelectionDescription = useCallback((): string => {
    if (selMode === "none") return "0 items selected";
    if (selMode === "all") {
      const exc = selExcluded.size;
      return exc > 0
        ? `All items selected (${exc} excluded)`
        : "All items in this view selected";
    }
    return `${selIncluded.size} items selected`;
  }, [selMode, selIncluded, selExcluded]);

  const toggleItem = useCallback((id: string) => {
    setSelMode((mode) => {
      if (mode === "all") {
        setSelExcluded((prev) => {
          const next = new Set(prev);
          next.has(id) ? next.delete(id) : next.add(id);
          return next;
        });
        return "all";
      } else {
        setSelIncluded((prev) => {
          const next = new Set(prev);
          if (next.has(id)) {
            next.delete(id);
            if (next.size === 0) {
              // Will set mode to none after
            }
            return next;
          } else {
            next.add(id);
            return next;
          }
        });
        // Recompute mode after state update
        return mode; // will fix below
      }
    });

    setSelIncluded((prev) => {
      // If not in "all" mode
      if (selMode === "all") return prev;
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      setSelMode(next.size === 0 ? "none" : "some");
      return next;
    });
  }, [selMode]);

  const selectAll = useCallback(() => {
    setSelMode("all");
    setSelExcluded(new Set());
  }, []);

  const deselectAll = useCallback(() => {
    setSelMode("none");
    setSelIncluded(new Set());
    setSelExcluded(new Set());
  }, []);

  const toggleGroupItems = useCallback(
    (groupId: string) => {
      const group = groupsRef.current.find((g) => g.id === groupId);
      if (!group || group.items.length === 0) return;
      const allSel = group.items.every((item) => isSelected(item.id));
      if (allSel) {
        // Deselect group
        if (selMode === "all") {
          setSelExcluded((prev) => {
            const next = new Set(prev);
            group.items.forEach((item) => next.add(item.id));
            return next;
          });
        } else {
          setSelIncluded((prev) => {
            const next = new Set(prev);
            group.items.forEach((item) => next.delete(item.id));
            if (next.size === 0) setSelMode("none");
            return next;
          });
        }
      } else {
        // Select group
        if (selMode === "all") {
          setSelExcluded((prev) => {
            const next = new Set(prev);
            group.items.forEach((item) => next.delete(item.id));
            return next;
          });
        } else {
          setSelMode("some");
          setSelIncluded((prev) => {
            const next = new Set(prev);
            group.items.forEach((item) => next.add(item.id));
            return next;
          });
        }
      }
    },
    [selMode, isSelected]
  );

  /* ============================================================
     FLAT LOADING
     ============================================================ */

  const sortedFlatItems = useMemo<AssetItem[]>(() => {
    if (!sortCol) return flatItems;
    return [...flatItems].sort((a, b) => {
      let cmp = 0;
      const aVal = String((a as unknown as Record<string, unknown>)[sortCol] ?? "");
      const bVal = String((b as unknown as Record<string, unknown>)[sortCol] ?? "");
      if (sortCol === "riskScore") {
        cmp = (a.riskScore ?? 0) - (b.riskScore ?? 0);
      } else {
        cmp = aVal.localeCompare(bVal);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [flatItems, sortCol, sortDir]);

  const loadMoreFlat = useCallback(async () => {
    if (loading || !hasMore || groupBy) return;
    setLoading(true);
    abortRef.current = new AbortController();
    setLoadStatus("Loading assets…");
    try {
      const result = await fetchPage(
        filteredDataset,
        cursor,
        abortRef.current.signal
      );
      setFlatItems((prev) => [...prev, ...result.items]);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
      setLoadStatus(
        result.hasMore
          ? `Loaded ${result.nextCursor.toLocaleString()} of ${filteredDataset.length.toLocaleString()} assets`
          : `All ${filteredDataset.length.toLocaleString()} assets loaded`
      );
    } catch (err) {
      if ((err as DOMException).name !== "AbortError") {
        setLoadStatus("Error loading assets.");
        console.error(err);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [loading, hasMore, groupBy, cursor, filteredDataset]);

  /* ============================================================
     RESET ON SEARCH / GROUPBY CHANGE
     ============================================================ */

  useEffect(() => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    setFlatItems([]);
    setCursor(0);
    setHasMore(true);
    setLoading(false);
    setLoadStatus("");
    setGroups([]);
    // loadMoreFlat will be triggered by the sentinel observer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredDataset, groupBy]);

  /* ============================================================
     GROUP LOADING
     ============================================================ */

  const loadGroupMeta = useCallback(
    async (gBy: string) => {
      setLoadStatus("Loading groups…");
      const metas = await fetchGroupMetadata(filteredDataset, gBy);
      const newGroups: GroupState[] = metas.map((g) => ({
        ...g,
        expanded: false,
        items: [],
        cursor: 0,
        hasMore: true,
        loading: false,
      }));
      setGroups(newGroups);
      groupsRef.current = newGroups;
      setLoadStatus(`${metas.length} groups loaded`);
    },
    [filteredDataset]
  );

  const loadGroupItems = useCallback(
    async (groupId: string) => {
      const group = groupsRef.current.find((g) => g.id === groupId);
      if (!group || group.loading || !group.hasMore) return;

      // Mark loading
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, loading: true } : g))
      );

      try {
        const result = await fetchGroupPage(
          filteredDataset,
          groupId,
          groupBy!,
          group.cursor
        );
        setGroups((prev) => {
          const updated = prev.map((g) => {
            if (g.id !== groupId) return g;
            return {
              ...g,
              items: [...g.items, ...result.items],
              cursor: result.nextCursor,
              hasMore: result.hasMore,
              loading: false,
            };
          });
          groupsRef.current = updated;
          return updated;
        });
      } catch (err) {
        console.error("Group load error:", err);
        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? { ...g, loading: false } : g))
        );
      }
    },
    [filteredDataset, groupBy]
  );

  const toggleGroupExpand = useCallback(
    (groupId: string) => {
      setGroups((prev) => {
        const updated = prev.map((g) => {
          if (g.id !== groupId) return g;
          return { ...g, expanded: !g.expanded };
        });
        groupsRef.current = updated;
        return updated;
      });
      const group = groupsRef.current.find((g) => g.id === groupId);
      if (group && !group.expanded && group.items.length === 0) {
        // Load on first expand
        setTimeout(() => loadGroupItems(groupId), 0);
      }
    },
    [loadGroupItems]
  );

  const handleGroupSentinelIntersect = useCallback(
    (groupId: string) => {
      loadGroupItems(groupId);
    },
    [loadGroupItems]
  );

  /* ============================================================
     GROUP BY CHANGE
     ============================================================ */

  useEffect(() => {
    if (groupBy) {
      loadGroupMeta(groupBy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy, filteredDataset]);

  /* ============================================================
     MAIN INTERSECTION OBSERVER
     ============================================================ */

  useEffect(() => {
    mainObsRef.current?.disconnect();
    const el = sentinelRef.current;
    if (!el || groupBy) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Call loadMoreFlat via ref to avoid stale closure
          setLoading((l) => {
            if (!l) {
              // Trigger in next tick
              setTimeout(() => {
                setHasMore((hm) => {
                  if (hm) {
                    setCursor((cur) => {
                      setFlatItems((items) => {
                        fetchPage(filteredDataset, cur).then((result) => {
                          setFlatItems((prev) => [...prev, ...result.items]);
                          setCursor(result.nextCursor);
                          setHasMore(result.hasMore);
                          setLoadStatus(
                            result.hasMore
                              ? `Loaded ${result.nextCursor.toLocaleString()} of ${filteredDataset.length.toLocaleString()} assets`
                              : `All ${filteredDataset.length.toLocaleString()} assets loaded`
                          );
                        });
                        return items;
                      });
                      return cur;
                    });
                  }
                  return hm;
                });
              }, 0);
            }
            return l;
          });
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    mainObsRef.current = obs;
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy, filteredDataset]);

  /* Initial load trigger for flat mode */
  useEffect(() => {
    if (!groupBy) {
      loadMoreFlat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredDataset, groupBy]);

  /* ============================================================
     SORT
     ============================================================ */

  const handleSort = useCallback(
    (colId: ColId) => {
      if (sortCol === colId) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortCol(colId);
        setSortDir("asc");
      }
    },
    [sortCol]
  );

  /* ============================================================
     COLUMN VISIBILITY
     ============================================================ */

  const toggleColVisibility = useCallback((colId: ColId) => {
    setColumns((prev) =>
      prev.map((c) =>
        c.id === colId && !c.sticky ? { ...c, visible: !c.visible } : c
      )
    );
  }, []);

  /* ============================================================
     COMPUTED VALUES
     ============================================================ */

  const visibleCols = useMemo(
    () => columns.filter((c) => c.visible),
    [columns]
  );

  const colTemplate = useMemo(
    () => visibleCols.map((c) => c.width + "px").join(" "),
    [visibleCols]
  );

  const selectedCount = getSelectedCount();
  const selectionDesc = getSelectionDescription();
  const hasSelection = selectedCount > 0;

  /* Header checkbox state */
  const headerCbAllChecked = selMode === "all" && selExcluded.size === 0;
  const headerCbIndeterminate = !headerCbAllChecked && selMode !== "none";

  const headerCbRef = useCallback(
    (el: HTMLInputElement | null) => {
      if (el) el.indeterminate = headerCbIndeterminate;
    },
    [headerCbIndeterminate]
  );

  /* ============================================================
     RENDER
     ============================================================ */

  const gridStyle = {
    "--col-template": colTemplate,
  } as React.CSSProperties;

  return (
    <div className="at-table-container">
      {/* Table toolbar */}
      <div className="at-table-header">
        <div className="at-table-header__caption">
          <span className="at-table-header__title">Assets</span>
          <span className="at-table-header__divider">|</span>
          <span className="at-table-header__count" id="at-total-count">
            {filteredDataset.length.toLocaleString()} assets
          </span>
        </div>
        <div className="at-table-header__actions">
          {/* Group by */}
          <div className="at-segmented-control">
            <label htmlFor="at-group-select" className="at-segmented-control__label">
              Group by:
            </label>
            <select
              id="at-group-select"
              className="at-segmented-select"
              value={groupBy ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setGroupBy(val || null);
              }}
            >
              <option value="">None</option>
              <option value="assetClass">Class</option>
              <option value="team">Team</option>
              <option value="type">Type</option>
              <option value="environment">Environment</option>
            </select>
          </div>

          {/* Density toggle */}
          <div className="at-density-toggle" role="group" aria-label="Row density">
            <button
              className={`at-density-btn ${density === "comfortable" ? "active" : ""}`}
              aria-pressed={density === "comfortable"}
              title="Comfortable density"
              onClick={() => setDensity("comfortable")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="14" height="4" rx="1" fill="currentColor" opacity="0.7"/>
                <rect x="1" y="8" width="14" height="4" rx="1" fill="currentColor" opacity="0.4"/>
              </svg>
            </button>
            <button
              className={`at-density-btn ${density === "compact" ? "active" : ""}`}
              aria-pressed={density === "compact"}
              title="Compact density"
              onClick={() => setDensity("compact")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="14" height="2.5" rx="1" fill="currentColor" opacity="0.7"/>
                <rect x="1" y="6" width="14" height="2.5" rx="1" fill="currentColor" opacity="0.5"/>
                <rect x="1" y="10" width="14" height="2.5" rx="1" fill="currentColor" opacity="0.4"/>
              </svg>
            </button>
          </div>

          {/* Column toggle */}
          <div className="at-toolbar-item">
            <button
              className="at-icon-btn at-icon-btn--labeled"
              aria-expanded={colPanelOpen}
              aria-haspopup="dialog"
              onClick={(e) => { e.stopPropagation(); setColPanelOpen((v) => !v); }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="8" y="1" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Columns
            </button>
            {colPanelOpen && (
              <ColTogglePanel
                columns={columns}
                onToggle={toggleColVisibility}
                onClose={() => setColPanelOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Selection bar */}
      {hasSelection && (
        <div className="at-selection-bar" role="status">
          <span className="at-selection-bar__count">{selectionDesc}</span>
          {selMode !== "all" && (
            <button className="at-selection-bar__link" onClick={selectAll}>
              Select all {filteredDataset.length.toLocaleString()}
            </button>
          )}
          <button className="at-selection-bar__link" onClick={deselectAll}>
            Deselect all
          </button>
        </div>
      )}

      {/* Scroll wrapper */}
      <div
        ref={scrollWrapperRef}
        className={`at-grid-scroll-wrapper ${scrolledX ? "at-scrolled-x" : ""}`}
        onScroll={() => {
          setScrolledX((scrollWrapperRef.current?.scrollLeft ?? 0) > 0);
        }}
      >
        {/* Grid */}
        <div
          role="grid"
          className={`at-grid at-density-${density}`}
          style={gridStyle}
          aria-rowcount={filteredDataset.length}
          aria-colcount={visibleCols.length}
        >
          {/* Header */}
          <div className="at-grid-head">
            <div role="row" className="at-header-row">
              {visibleCols.map((col, colIndex) => {
                const ariaSort =
                  col.sortable
                    ? sortCol === col.id
                      ? sortDir === "asc"
                        ? ("ascending" as const)
                        : ("descending" as const)
                      : ("none" as const)
                    : undefined;

                if (col.id === "select") {
                  return (
                    <div
                      key="select"
                      role="columnheader"
                      data-col-id="select"
                      className="at-cell"
                      aria-colindex={colIndex + 1}
                    >
                      <input
                        type="checkbox"
                        id="at-header-checkbox"
                        aria-label="Select all visible rows"
                        checked={headerCbAllChecked}
                        ref={headerCbRef}
                        onChange={() => {
                          selMode === "all" ? deselectAll() : selectAll();
                        }}
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={col.id}
                    role="columnheader"
                    data-col-id={col.id}
                    className={`at-cell${col.sortable ? " at-sortable" : ""}`}
                    aria-colindex={colIndex + 1}
                    aria-sort={ariaSort}
                    tabIndex={col.sortable ? 0 : undefined}
                    onKeyDown={
                      col.sortable
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSort(col.id);
                            }
                          }
                        : undefined
                    }
                  >
                    {col.label ? (
                      col.sortable ? (
                        <button
                          className="at-col-sort-btn"
                          aria-label={`Sort by ${col.label}`}
                          onClick={() => handleSort(col.id)}
                        >
                          {col.label}
                          <span className="at-sort-indicator" aria-hidden="true" />
                        </button>
                      ) : (
                        col.label
                      )
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div id="at-grid-body">
            {groupBy ? (
              /* Grouped mode */
              groups.map((group) => (
                <div key={group.id}>
                  <GroupHeaderRow
                    group={group}
                    onToggleExpand={toggleGroupExpand}
                    onToggleItems={toggleGroupItems}
                    someSelected={
                      group.items.length > 0 &&
                      group.items.some((item) => isSelected(item.id))
                    }
                    allSelected={
                      group.items.length > 0 &&
                      group.items.every((item) => isSelected(item.id))
                    }
                  />
                  {group.expanded && (
                    <div data-group-body={group.id} className="at-group-body">
                      {group.loading && group.items.length === 0 && (
                        <div className="at-group-loading">Loading…</div>
                      )}
                      {group.items.map((item, idx) => (
                        <DataRow
                          key={item.id}
                          item={item}
                          rowIndex={idx + 1}
                          visibleCols={visibleCols}
                          isSelected={isSelected(item.id)}
                          onToggle={toggleItem}
                          onOpen={setPanelItem}
                        />
                      ))}
                      {group.hasMore && (
                        <GroupSentinel
                          groupId={group.id}
                          onIntersect={handleGroupSentinelIntersect}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              /* Flat mode */
              <>
                {sortedFlatItems.map((item, idx) => (
                  <DataRow
                    key={item.id}
                    item={item}
                    rowIndex={idx + 1}
                    visibleCols={visibleCols}
                    isSelected={isSelected(item.id)}
                    onToggle={toggleItem}
                    onOpen={setPanelItem}
                  />
                ))}
              </>
            )}

            {/* Main sentinel (flat mode) */}
            {!groupBy && (
              <div
                ref={sentinelRef}
                className="at-sentinel"
                aria-hidden="true"
                id="at-sentinel"
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="at-table-footer">
        <span className="at-load-status" aria-live="polite" id="at-load-status">
          {loadStatus}
        </span>
      </div>

      {/* Floating bulk bar */}
      <FloatingBulkBar
        count={selectedCount}
        description={selectionDesc}
        onDeselect={deselectAll}
      />

      {/* Detail panel */}
      <DetailPanel item={panelItem} onClose={() => setPanelItem(null)} />

      {/* SR announcer */}
      <div
        id="at-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="at-sr-only"
      />
    </div>
  );
}
