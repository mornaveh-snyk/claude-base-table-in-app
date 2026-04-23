import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// AI Filter Parser Types and Functions
// ============================================

// Filter types and operators
export type FilterOperator = "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "before" | "after";
export type LogicalOperator = "and" | "or";

export interface Filter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
  displayLabel: string;
  color?: string;
}

// A group of filters connected by a single operator (all AND or all OR)
export interface FilterItem {
  id: string;
  filters: Filter[];
  groupOperator: LogicalOperator; // How filters within this group connect
}

// Multiple groups connected by a single operator
export interface FilterGroup {
  items: FilterItem[];
  betweenGroupOperator: LogicalOperator; // How groups connect to each other
}

// Field definitions for the Asset table
export const FILTER_FIELDS = {
  status: {
    label: "Status",
    values: ["active", "inactive", "pending", "archived"],
  },
  risk: {
    label: "Risk",
    values: ["critical", "high", "medium", "low"],
  },
  type: {
    label: "Type",
    values: ["repository", "container image", "package", "api", "service"],
  },
  owner: {
    label: "Owner",
    values: ["platform-team", "security-team", "frontend-team", "billing-team", "data-team", "backend-team", "infra-team", "product-team", "ml-team"],
  },
  lastSeen: {
    label: "Last Seen",
    values: ["today", "yesterday", "this week", "this month", "older"],
  },
} as const;

// Color mapping for filter pills
const FILTER_COLORS: Record<string, string> = {
  "risk:critical": "bg-red-100 text-red-700 border-red-200",
  "risk:high": "bg-orange-100 text-orange-700 border-orange-200",
  "risk:medium": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "risk:low": "bg-green-100 text-green-700 border-green-200",
  "default": "bg-secondary text-foreground border-border",
};

function getFilterColor(field: string, value: string): string {
  const key = `${field.toLowerCase()}:${value.toLowerCase()}`;
  return FILTER_COLORS[key] || FILTER_COLORS.default;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Mock AI parser that uses pattern matching
export function parseNaturalLanguageFilter(input: string): FilterGroup {
  const filters: Filter[] = [];
  const normalizedInput = input.toLowerCase().trim();

  // Pattern matching rules
  const patterns: Array<{
    regex: RegExp;
    field: string;
    operator: FilterOperator;
    valueExtractor: (match: RegExpMatchArray) => string;
  }> = [
    // Risk patterns
    { regex: /\b(critical|high|medium|low)\s*risk/i, field: "risk", operator: "equals", valueExtractor: (m) => m[1] },
    { regex: /risk\s*(?:is|=|:)?\s*(critical|high|medium|low)/i, field: "risk", operator: "equals", valueExtractor: (m) => m[1] },
    { regex: /\b(critical|high|medium|low)\b(?!\s*risk)/i, field: "risk", operator: "equals", valueExtractor: (m) => m[1] },
    
    // Type patterns
    { regex: /type\s*(?:is|=|:)?\s*(repository|container\s*image|package|api|service)/i, field: "type", operator: "equals", valueExtractor: (m) => m[1] },
    { regex: /\b(repositor(?:y|ies)|container\s*images?|packages?|apis?|services?)\b/i, field: "type", operator: "equals", valueExtractor: (m) => m[1].replace(/ies$/, 'y').replace(/s$/, '') },
    
    // Owner patterns
    { regex: /(?:owned?\s*by|owner\s*(?:is|=|:)?)\s*([a-z]+-team)/i, field: "owner", operator: "equals", valueExtractor: (m) => m[1] },
    { regex: /\b([a-z]+-team)\b/i, field: "owner", operator: "equals", valueExtractor: (m) => m[1] },
    
    // Status patterns
    { regex: /status\s*(?:is|=|:)?\s*(active|inactive|pending|archived)/i, field: "status", operator: "equals", valueExtractor: (m) => m[1] },
    { regex: /\b(active|inactive|pending|archived)\s*(?:assets?|items?)?/i, field: "status", operator: "equals", valueExtractor: (m) => m[1] },
    
    // Last seen patterns
    { regex: /(?:last\s*)?seen\s*(?:in\s*the\s*)?(?:last\s*)?(today|yesterday|this\s*week|this\s*month|older)/i, field: "lastSeen", operator: "equals", valueExtractor: (m) => m[1] },
    { regex: /(?:updated|modified|changed)\s*(today|yesterday|this\s*week|this\s*month)/i, field: "lastSeen", operator: "equals", valueExtractor: (m) => m[1] },
    
    // Negation patterns
    { regex: /(?:not|no|exclude|without)\s*(critical|high|medium|low)\s*risk/i, field: "risk", operator: "not_equals", valueExtractor: (m) => m[1] },
    { regex: /(?:not|no|exclude|without)\s*(repositor(?:y|ies)|container\s*images?|packages?|apis?|services?)/i, field: "type", operator: "not_equals", valueExtractor: (m) => m[1].replace(/ies$/, 'y').replace(/s$/, '') },
  ];

  // Track which patterns matched to avoid duplicates
  const matchedFields = new Set<string>();
  
  for (const pattern of patterns) {
    const match = normalizedInput.match(pattern.regex);
    if (match) {
      const value = pattern.valueExtractor(match).toLowerCase().replace(/\s+/g, ' ').trim();
      const fieldKey = `${pattern.field}:${value}:${pattern.operator}`;
      
      if (!matchedFields.has(fieldKey)) {
        matchedFields.add(fieldKey);
        
        const fieldLabel = FILTER_FIELDS[pattern.field as keyof typeof FILTER_FIELDS]?.label || pattern.field;
        const displayValue = value.charAt(0).toUpperCase() + value.slice(1);
        const operatorSymbol = pattern.operator === "not_equals" ? "≠" : "=";
        
        filters.push({
          id: generateId(),
          field: pattern.field,
          operator: pattern.operator,
          value: value,
          displayLabel: `${fieldLabel} ${operatorSymbol} ${displayValue}`,
          color: getFilterColor(pattern.field, value),
        });
      }
    }
  }

  // Create a single FilterItem with all parsed filters connected by AND
  const item: FilterItem = {
    id: generateId(),
    filters,
    groupOperator: "and",
  };

  return { items: [item], betweenGroupOperator: "and" };
}

// Suggestions for the command palette
export interface FilterSuggestion {
  text: string;
  description: string;
}

export function getFilterSuggestions(input: string): FilterSuggestion[] {
  const normalizedInput = input.toLowerCase().trim();
  
  const suggestions: FilterSuggestion[] = [
    { text: "critical risk", description: "Show assets with critical risk level" },
    { text: "high risk repositories", description: "Show repositories with high risk" },
    { text: "owned by platform-team", description: "Show assets owned by platform-team" },
    { text: "container images with high risk", description: "Show high risk container images" },
    { text: "active packages", description: "Show active packages" },
    { text: "seen today", description: "Show assets seen today" },
    { text: "critical or high risk", description: "Show critical or high risk assets" },
    { text: "not low risk", description: "Exclude low risk assets" },
    { text: "APIs owned by billing-team", description: "Show APIs owned by billing team" },
    { text: "inactive services", description: "Show inactive services" },
  ];

  if (!normalizedInput) {
    return suggestions.slice(0, 5);
  }

  return suggestions
    .filter(s => s.text.toLowerCase().includes(normalizedInput) || s.description.toLowerCase().includes(normalizedInput))
    .slice(0, 5);
}

// Apply filters to data
export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filterGroup: FilterGroup
): T[] {
  if (filterGroup.items.length === 0) return data;

  return data.filter(item => {
    // Evaluate each group
    const groupResults = filterGroup.items.map(group => {
      if (group.filters.length === 0) return true;

      // Evaluate filters within the group
      const filterResults = group.filters.map(filter => {
        const fieldValue = String(item[filter.field] ?? "").toLowerCase();
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case "equals":
            return fieldValue === filterValue || fieldValue.includes(filterValue);
          case "not_equals":
            return fieldValue !== filterValue && !fieldValue.includes(filterValue);
          case "contains":
            return fieldValue.includes(filterValue);
          case "not_contains":
            return !fieldValue.includes(filterValue);
          default:
            return true;
        }
      });

      // Combine filter results within the group using groupOperator
      if (filterResults.length === 0) return true;
      if (filterResults.length === 1) return filterResults[0];

      if (group.groupOperator === "and") {
        return filterResults.every(r => r);
      } else {
        return filterResults.some(r => r);
      }
    });

    // Combine group results using betweenGroupOperator
    if (groupResults.length === 0) return true;
    if (groupResults.length === 1) return groupResults[0];

    if (filterGroup.betweenGroupOperator === "and") {
      return groupResults.every(r => r);
    } else {
      return groupResults.some(r => r);
    }
  });
}
