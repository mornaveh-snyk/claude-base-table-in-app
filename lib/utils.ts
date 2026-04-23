import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// Filter System Types and Functions
// ============================================

// Text operators
export type TextOperator = "is" | "is_not" | "contains" | "does_not_contain" | "starts_with" | "ends_with" | "is_empty" | "is_not_empty";

// Enum/single-select operators
export type EnumOperator = "is" | "is_not" | "is_any_of" | "is_none_of";

// Numeric operators
export type NumericOperator = "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "is_between";

// Multi-value operators
export type MultiValueOperator = "includes" | "does_not_include" | "includes_all_of" | "includes_any_of";

// Date operators
export type DateOperator = "is" | "is_before" | "is_after" | "is_between" | "is_in_last_n_days";

// Combined operator type
export type FilterOperator = TextOperator | EnumOperator | NumericOperator | MultiValueOperator | DateOperator;

// Logical operators
export type LogicalOperator = "and" | "or";

// Field types
export type FieldType = "text" | "enum" | "numeric" | "multi_value" | "date";

// Field definition
export interface FieldDefinition {
  label: string;
  type: FieldType;
  values?: readonly string[];
}

// Filter condition
export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | string[] | number | number[] | null;
}

// Filter group (for advanced mode)
export interface FilterGroup {
  id: string;
  combinator: LogicalOperator;
  conditions: FilterCondition[];
}

// Advanced filter query
export interface AdvancedFilterQuery {
  rootCombinator: LogicalOperator;
  groups: FilterGroup[];
}

// Simple filter state (flat list of conditions, implicitly ANDed)
export type SimpleFilterState = FilterCondition[];

// Combined filter state
export interface FilterState {
  mode: "simple" | "advanced";
  simple: SimpleFilterState;
  advanced: AdvancedFilterQuery | null;
}

// Field definitions for the Asset table
export const FILTER_FIELDS: Record<string, FieldDefinition> = {
  asset_name: {
    label: "Asset name",
    type: "text",
  },
  class: {
    label: "Class",
    type: "enum",
    values: ["A", "B", "C", "D"],
  },
  type: {
    label: "Type",
    type: "enum",
    values: ["Repository", "Container image", "Package", "API", "Service", "Web application"],
  },
  environment: {
    label: "Environment",
    type: "enum",
    values: ["Production", "Staging", "Development", "Testing"],
  },
  team: {
    label: "Team",
    type: "enum",
    values: ["Platform", "Security", "Frontend", "Billing", "Data", "Backend", "Infra", "Product", "ML"],
  },
  risk_score: {
    label: "Risk score",
    type: "numeric",
  },
  critical_issues: {
    label: "Critical issues",
    type: "numeric",
  },
  high_issues: {
    label: "High issues",
    type: "numeric",
  },
  medium_issues: {
    label: "Medium issues",
    type: "numeric",
  },
  low_issues: {
    label: "Low issues",
    type: "numeric",
  },
  coverage: {
    label: "Coverage",
    type: "multi_value",
    values: ["SAST", "DAST", "SCA", "Container", "IaC", "Secrets"],
  },
  source: {
    label: "Source",
    type: "multi_value",
    values: ["GitHub", "GitLab", "Bitbucket", "Azure DevOps", "AWS", "GCP", "Manual"],
  },
  visibility: {
    label: "Visibility",
    type: "enum",
    values: ["Public", "Private", "Internal"],
  },
  activity_status: {
    label: "Activity status",
    type: "enum",
    values: ["Active", "Inactive", "Archived"],
  },
  last_scan: {
    label: "Last scan",
    type: "date",
  },
  first_seen: {
    label: "First seen",
    type: "date",
  },
} as const;

// Get operators for a field type
export function getOperatorsForFieldType(type: FieldType): { value: FilterOperator; label: string }[] {
  switch (type) {
    case "text":
      return [
        { value: "is", label: "is" },
        { value: "is_not", label: "is not" },
        { value: "contains", label: "contains" },
        { value: "does_not_contain", label: "does not contain" },
        { value: "starts_with", label: "starts with" },
        { value: "ends_with", label: "ends with" },
        { value: "is_empty", label: "is empty" },
        { value: "is_not_empty", label: "is not empty" },
      ];
    case "enum":
      return [
        { value: "is", label: "is" },
        { value: "is_not", label: "is not" },
        { value: "is_any_of", label: "is any of" },
        { value: "is_none_of", label: "is none of" },
      ];
    case "numeric":
      return [
        { value: "eq", label: "=" },
        { value: "neq", label: "≠" },
        { value: "gt", label: ">" },
        { value: "lt", label: "<" },
        { value: "gte", label: "≥" },
        { value: "lte", label: "≤" },
        { value: "is_between", label: "is between" },
      ];
    case "multi_value":
      return [
        { value: "includes", label: "includes" },
        { value: "does_not_include", label: "does not include" },
        { value: "includes_all_of", label: "includes all of" },
        { value: "includes_any_of", label: "includes any of" },
      ];
    case "date":
      return [
        { value: "is", label: "is" },
        { value: "is_before", label: "is before" },
        { value: "is_after", label: "is after" },
        { value: "is_between", label: "is between" },
        { value: "is_in_last_n_days", label: "is in the last N days" },
      ];
    default:
      return [];
  }
}

// Get default operator for a field type
export function getDefaultOperator(type: FieldType): FilterOperator {
  switch (type) {
    case "text":
      return "contains";
    case "enum":
      return "is";
    case "numeric":
      return "eq";
    case "multi_value":
      return "includes";
    case "date":
      return "is";
    default:
      return "is";
  }
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Create empty filter condition
export function createEmptyCondition(fieldKey?: string): FilterCondition {
  const field = fieldKey || Object.keys(FILTER_FIELDS)[0];
  const fieldDef = FILTER_FIELDS[field];
  const operator = getDefaultOperator(fieldDef?.type || "text");
  
  return {
    id: generateId(),
    field,
    operator,
    value: null,
  };
}

// Create empty filter group
export function createEmptyGroup(): FilterGroup {
  return {
    id: generateId(),
    combinator: "and",
    conditions: [createEmptyCondition()],
  };
}

// Create empty advanced query
export function createEmptyAdvancedQuery(): AdvancedFilterQuery {
  return {
    rootCombinator: "and",
    groups: [createEmptyGroup()],
  };
}

// Create initial filter state
export function createInitialFilterState(): FilterState {
  return {
    mode: "simple",
    simple: [],
    advanced: null,
  };
}

// Get operator display label
export function getOperatorLabel(operator: FilterOperator): string {
  const allOperators = [
    ...getOperatorsForFieldType("text"),
    ...getOperatorsForFieldType("enum"),
    ...getOperatorsForFieldType("numeric"),
    ...getOperatorsForFieldType("multi_value"),
    ...getOperatorsForFieldType("date"),
  ];
  return allOperators.find(o => o.value === operator)?.label || operator;
}

// Format value for display
export function formatValueForDisplay(value: string | string[] | number | number[] | null): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value.map(v => typeof v === "string" ? `"${v}"` : String(v)).join(", ");
  }
  if (typeof value === "string") return `"${value}"`;
  return String(value);
}

// Generate human-readable query summary for advanced mode
export function generateQuerySummary(query: AdvancedFilterQuery): string {
  if (query.groups.length === 0) return "";

  const groupSummaries = query.groups.map(group => {
    if (group.conditions.length === 0) return "";
    
    const conditionSummaries = group.conditions.map(condition => {
      const fieldDef = FILTER_FIELDS[condition.field];
      const fieldLabel = fieldDef?.label || condition.field;
      const opLabel = getOperatorLabel(condition.operator);
      
      // Handle operators that don't need a value
      if (condition.operator === "is_empty" || condition.operator === "is_not_empty") {
        return `${fieldLabel} ${opLabel}`;
      }
      
      const valueDisplay = formatValueForDisplay(condition.value);
      return `${fieldLabel} ${opLabel} ${valueDisplay}`;
    });

    if (conditionSummaries.length === 1) {
      return conditionSummaries[0];
    }
    
    return `(${conditionSummaries.join(` ${group.combinator.toUpperCase()} `)})`;
  });

  const validSummaries = groupSummaries.filter(s => s.length > 0);
  if (validSummaries.length === 0) return "";
  if (validSummaries.length === 1) return validSummaries[0];
  
  return validSummaries.join(` ${query.rootCombinator.toUpperCase()} `);
}

// Convert simple filters to advanced query
export function simpleToAdvanced(simple: SimpleFilterState): AdvancedFilterQuery {
  if (simple.length === 0) {
    return createEmptyAdvancedQuery();
  }
  
  return {
    rootCombinator: "and",
    groups: [{
      id: generateId(),
      combinator: "and",
      conditions: simple.map(c => ({ ...c })),
    }],
  };
}

// Check if a condition is valid (has required values)
export function isConditionValid(condition: FilterCondition): boolean {
  // Operators that don't need a value
  if (condition.operator === "is_empty" || condition.operator === "is_not_empty") {
    return true;
  }
  
  if (condition.value === null || condition.value === undefined) return false;
  if (typeof condition.value === "string" && condition.value.trim() === "") return false;
  if (Array.isArray(condition.value) && condition.value.length === 0) return false;
  
  return true;
}

// Check if advanced query has any valid conditions
export function hasValidConditions(query: AdvancedFilterQuery): boolean {
  return query.groups.some(group => 
    group.conditions.some(condition => isConditionValid(condition))
  );
}

// Apply filters to data
export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filterState: FilterState
): T[] {
  if (filterState.mode === "simple") {
    return applySimpleFilters(data, filterState.simple);
  } else if (filterState.advanced) {
    return applyAdvancedFilters(data, filterState.advanced);
  }
  return data;
}

function applySimpleFilters<T extends Record<string, unknown>>(
  data: T[],
  conditions: SimpleFilterState
): T[] {
  if (conditions.length === 0) return data;
  
  return data.filter(item => {
    // All conditions must match (implicit AND)
    return conditions.every(condition => evaluateCondition(item, condition));
  });
}

function applyAdvancedFilters<T extends Record<string, unknown>>(
  data: T[],
  query: AdvancedFilterQuery
): T[] {
  if (query.groups.length === 0) return data;
  
  return data.filter(item => {
    const groupResults = query.groups.map(group => {
      if (group.conditions.length === 0) return true;
      
      const conditionResults = group.conditions.map(condition => 
        evaluateCondition(item, condition)
      );
      
      if (group.combinator === "and") {
        return conditionResults.every(r => r);
      } else {
        return conditionResults.some(r => r);
      }
    });
    
    if (query.rootCombinator === "and") {
      return groupResults.every(r => r);
    } else {
      return groupResults.some(r => r);
    }
  });
}

function evaluateCondition<T extends Record<string, unknown>>(
  item: T,
  condition: FilterCondition
): boolean {
  const fieldValue = item[condition.field];
  const filterValue = condition.value;
  
  // Handle null/undefined field values
  if (fieldValue === null || fieldValue === undefined) {
    if (condition.operator === "is_empty") return true;
    if (condition.operator === "is_not_empty") return false;
    return false;
  }
  
  const fieldStr = String(fieldValue).toLowerCase();
  
  switch (condition.operator) {
    // Text operators
    case "is":
      if (typeof filterValue === "string") {
        return fieldStr === filterValue.toLowerCase();
      }
      return false;
    case "is_not":
      if (typeof filterValue === "string") {
        return fieldStr !== filterValue.toLowerCase();
      }
      return true;
    case "contains":
      if (typeof filterValue === "string") {
        return fieldStr.includes(filterValue.toLowerCase());
      }
      return false;
    case "does_not_contain":
      if (typeof filterValue === "string") {
        return !fieldStr.includes(filterValue.toLowerCase());
      }
      return true;
    case "starts_with":
      if (typeof filterValue === "string") {
        return fieldStr.startsWith(filterValue.toLowerCase());
      }
      return false;
    case "ends_with":
      if (typeof filterValue === "string") {
        return fieldStr.endsWith(filterValue.toLowerCase());
      }
      return false;
    case "is_empty":
      return fieldStr.trim() === "";
    case "is_not_empty":
      return fieldStr.trim() !== "";
    
    // Enum operators
    case "is_any_of":
      if (Array.isArray(filterValue)) {
        return filterValue.some(v => fieldStr === String(v).toLowerCase());
      }
      return false;
    case "is_none_of":
      if (Array.isArray(filterValue)) {
        return !filterValue.some(v => fieldStr === String(v).toLowerCase());
      }
      return true;
    
    // Numeric operators
    case "eq":
      return Number(fieldValue) === Number(filterValue);
    case "neq":
      return Number(fieldValue) !== Number(filterValue);
    case "gt":
      return Number(fieldValue) > Number(filterValue);
    case "lt":
      return Number(fieldValue) < Number(filterValue);
    case "gte":
      return Number(fieldValue) >= Number(filterValue);
    case "lte":
      return Number(fieldValue) <= Number(filterValue);
    case "is_between":
      if (Array.isArray(filterValue) && filterValue.length === 2) {
        const num = Number(fieldValue);
        return num >= Number(filterValue[0]) && num <= Number(filterValue[1]);
      }
      return false;
    
    // Multi-value operators
    case "includes":
      if (Array.isArray(fieldValue) && typeof filterValue === "string") {
        return fieldValue.some(v => String(v).toLowerCase() === filterValue.toLowerCase());
      }
      return fieldStr.includes(String(filterValue).toLowerCase());
    case "does_not_include":
      if (Array.isArray(fieldValue) && typeof filterValue === "string") {
        return !fieldValue.some(v => String(v).toLowerCase() === filterValue.toLowerCase());
      }
      return !fieldStr.includes(String(filterValue).toLowerCase());
    case "includes_all_of":
      if (Array.isArray(fieldValue) && Array.isArray(filterValue)) {
        return filterValue.every(fv => 
          fieldValue.some(v => String(v).toLowerCase() === String(fv).toLowerCase())
        );
      }
      return false;
    case "includes_any_of":
      if (Array.isArray(fieldValue) && Array.isArray(filterValue)) {
        return filterValue.some(fv => 
          fieldValue.some(v => String(v).toLowerCase() === String(fv).toLowerCase())
        );
      }
      return false;
    
    // Date operators - simplified for demo
    case "is_before":
    case "is_after":
    case "is_in_last_n_days":
      // These would need proper date parsing in a real implementation
      return true;
    
    default:
      return true;
  }
}

// Parse natural language filter input
export function parseNaturalLanguageFilter(input: string): { 
  isComplex: boolean; 
  simple?: FilterCondition; 
  advanced?: AdvancedFilterQuery;
} {
  const normalizedInput = input.toLowerCase().trim();
  
  // Check for complex patterns (multiple conditions, AND/OR)
  const hasOr = /\bor\b/i.test(normalizedInput);
  const hasAnd = /\band\b/i.test(normalizedInput);
  const hasMultipleConditions = hasOr || (hasAnd && normalizedInput.split(/\band\b/i).length > 2);
  
  const conditions: FilterCondition[] = [];
  
  // Parse patterns
  const patterns: Array<{
    regex: RegExp;
    field: string;
    operator: FilterOperator;
    valueExtractor: (match: RegExpMatchArray) => string | string[] | number;
  }> = [
    // Team patterns
    { regex: /team\s*(?:is|=|:)?\s*["']?(\w+)["']?/i, field: "team", operator: "is", valueExtractor: (m) => m[1] },
    { regex: /(?:owned?\s*by|owner)\s*["']?(\w+)["']?/i, field: "team", operator: "is", valueExtractor: (m) => m[1] },
    
    // Risk score patterns
    { regex: /risk\s*(?:score)?\s*>\s*(\d+)/i, field: "risk_score", operator: "gt", valueExtractor: (m) => parseInt(m[1]) },
    { regex: /risk\s*(?:score)?\s*<\s*(\d+)/i, field: "risk_score", operator: "lt", valueExtractor: (m) => parseInt(m[1]) },
    { regex: /risk\s*(?:score)?\s*>=?\s*(\d+)/i, field: "risk_score", operator: "gte", valueExtractor: (m) => parseInt(m[1]) },
    { regex: /risk\s*(?:score)?\s*<=?\s*(\d+)/i, field: "risk_score", operator: "lte", valueExtractor: (m) => parseInt(m[1]) },
    { regex: /risk\s*(?:score)?\s*(?:is|=|:)?\s*(\d+)/i, field: "risk_score", operator: "eq", valueExtractor: (m) => parseInt(m[1]) },
    { regex: /(?:critical|high)\s*risk/i, field: "risk_score", operator: "gte", valueExtractor: () => 70 },
    
    // Class patterns
    { regex: /class\s*(?:is|=|:)?\s*["']?([A-D])["']?/i, field: "class", operator: "is", valueExtractor: (m) => m[1].toUpperCase() },
    
    // Type patterns
    { regex: /type\s*(?:is|=|:)?\s*["']?(repository|container\s*image|package|api|service|web\s*application)["']?/i, field: "type", operator: "is", valueExtractor: (m) => m[1] },
    { regex: /\b(repositor(?:y|ies)|container\s*images?|packages?|apis?|services?)(?:\s|$)/i, field: "type", operator: "is", valueExtractor: (m) => m[1].replace(/ies$/, 'y').replace(/s$/, '') },
    
    // Environment patterns
    { regex: /(?:env(?:ironment)?|in)\s*(?:is|=|:)?\s*["']?(production|staging|development|testing)["']?/i, field: "environment", operator: "is", valueExtractor: (m) => m[1] },
    { regex: /\b(production|staging|development|testing)\s*(?:env(?:ironment)?)?/i, field: "environment", operator: "is", valueExtractor: (m) => m[1] },
    
    // Coverage patterns
    { regex: /coverage\s*(?:includes|has)\s*["']?(SAST|DAST|SCA|Container|IaC|Secrets)["']?/i, field: "coverage", operator: "includes", valueExtractor: (m) => m[1].toUpperCase() },
    { regex: /(?:has|with)\s*["']?(SAST|DAST|SCA)["']?\s*coverage/i, field: "coverage", operator: "includes", valueExtractor: (m) => m[1].toUpperCase() },
    
    // Activity status patterns
    { regex: /(?:status|activity)\s*(?:is|=|:)?\s*["']?(active|inactive|archived)["']?/i, field: "activity_status", operator: "is", valueExtractor: (m) => m[1] },
    { regex: /\b(active|inactive|archived)\s*(?:assets?|items?)?/i, field: "activity_status", operator: "is", valueExtractor: (m) => m[1] },
    
    // Visibility patterns
    { regex: /visibility\s*(?:is|=|:)?\s*["']?(public|private|internal)["']?/i, field: "visibility", operator: "is", valueExtractor: (m) => m[1] },
    
    // Issue count patterns
    { regex: /critical\s*issues?\s*>\s*(\d+)/i, field: "critical_issues", operator: "gt", valueExtractor: (m) => parseInt(m[1]) },
    { regex: /high\s*issues?\s*>\s*(\d+)/i, field: "high_issues", operator: "gt", valueExtractor: (m) => parseInt(m[1]) },
    { regex: /(?:has|with)\s*critical\s*issues?/i, field: "critical_issues", operator: "gt", valueExtractor: () => 0 },
    
    // Asset name patterns
    { regex: /(?:name|asset)\s*(?:contains|like)\s*["']?([^"']+)["']?/i, field: "asset_name", operator: "contains", valueExtractor: (m) => m[1].trim() },
  ];
  
  const matchedFields = new Set<string>();
  
  for (const pattern of patterns) {
    const match = normalizedInput.match(pattern.regex);
    if (match && !matchedFields.has(pattern.field)) {
      matchedFields.add(pattern.field);
      const value = pattern.valueExtractor(match);
      
      conditions.push({
        id: generateId(),
        field: pattern.field,
        operator: pattern.operator,
        value: typeof value === "string" ? value.charAt(0).toUpperCase() + value.slice(1) : value,
      });
    }
  }
  
  if (conditions.length === 0) {
    return { isComplex: false };
  }
  
  if (conditions.length === 1 && !hasMultipleConditions) {
    return { isComplex: false, simple: conditions[0] };
  }
  
  // Multiple conditions - return as advanced query
  return {
    isComplex: true,
    advanced: {
      rootCombinator: hasOr ? "or" : "and",
      groups: [{
        id: generateId(),
        combinator: "and",
        conditions,
      }],
    },
  };
}

// Legacy support - old types for backward compatibility
export interface Filter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
  displayLabel: string;
  color?: string;
}

export interface FilterItem {
  id: string;
  filters: Filter[];
  groupOperator: LogicalOperator;
}

export interface LegacyFilterGroup {
  items: FilterItem[];
  betweenGroupOperator: LogicalOperator;
}
