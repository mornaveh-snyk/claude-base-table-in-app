"use client";

import { useState } from "react";
import { X, Check, Plus } from "lucide-react";
import { cn, FILTER_FIELDS } from "@/lib/utils";
import type { FilterGroup, FilterItem, Filter, FilterOperator } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FilterPillsProps {
  filterGroup: FilterGroup;
  onRemoveFilter: (itemId: string, filterId: string) => void;
  onToggleBetweenGroupOperator: () => void;
  onToggleGroupOperator: (itemId: string) => void;
  onUpdateFilter: (itemId: string, filterId: string, changes: Partial<Pick<Filter, "value" | "operator">>) => void;
  onAddFilterToGroup: (itemId: string, filter: Filter) => void;
  onClearAll: () => void;
}

const OPERATOR_LABEL: Record<string, string> = {
  equals: "is",
  not_equals: "is not",
  contains: "contains",
  not_contains: "excludes",
  greater_than: ">",
  less_than: "<",
  before: "before",
  after: "after",
};

const OPERATOR_CYCLE: Record<string, FilterOperator> = {
  equals: "not_equals",
  not_equals: "equals",
  contains: "not_contains",
  not_contains: "contains",
};

const FIELD_LABEL: Record<string, string> = {
  status: "Status",
  risk: "Risk",
  type: "Type",
  owner: "Owner",
  lastSeen: "Last Seen",
};

const FIELD_KEYS = Object.keys(FILTER_FIELDS);

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function getFieldValues(field: string): string[] {
  return [...((FILTER_FIELDS as Record<string, { values: readonly string[] }>)[field]?.values ?? [])];
}

function ValuePopover({
  filter,
  onUpdate,
}: {
  filter: Filter;
  onUpdate: (changes: Partial<Pick<Filter, "value" | "operator">>) => void;
}) {
  const [open, setOpen] = useState(false);
  const values = getFieldValues(filter.field);
  const valueLabel = filter.value.charAt(0).toUpperCase() + filter.value.slice(1);

  if (values.length === 0) {
    return (
      <span className="px-2 font-medium text-foreground border-l border-border h-full flex items-center">
        {valueLabel}
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "px-2 font-medium text-foreground border-l border-border h-full flex items-center",
            "hover:bg-secondary transition-colors",
            open && "bg-secondary"
          )}
        >
          {valueLabel}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1 w-40" align="start" sideOffset={4}>
        <div className="flex flex-col">
          {values.map((v) => {
            const isActive = filter.value === v;
            const label = v.charAt(0).toUpperCase() + v.slice(1);
            return (
              <button
                key={v}
                onClick={() => {
                  onUpdate({ value: v });
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors",
                  isActive
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {label}
                {isActive && <Check className="w-3 h-3 shrink-0" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Dropdown to add a filter within a group
function AddFilterToGroupPopover({
  onAddFilter,
}: {
  onAddFilter: (filter: Filter) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleSelectField = (fieldKey: string) => {
    const field = FILTER_FIELDS[fieldKey as keyof typeof FILTER_FIELDS];
    if (!field) return;

    const firstValue = field.values[0];
    const filter: Filter = {
      id: generateId(),
      field: fieldKey,
      operator: "equals",
      value: firstValue,
      displayLabel: `${field.label} = ${firstValue.charAt(0).toUpperCase() + firstValue.slice(1)}`,
    };
    onAddFilter(filter);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded border border-dashed border-border",
            "text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-solid transition-colors"
          )}
          title="Add filter to this group"
        >
          <Plus className="w-3 h-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1 w-44" align="start" sideOffset={4}>
        <div className="flex flex-col">
          {FIELD_KEYS.map((key) => {
            const label = FIELD_LABEL[key] ?? key;
            return (
              <button
                key={key}
                onClick={() => handleSelectField(key)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-left text-foreground hover:bg-secondary transition-colors"
              >
                {label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterItemGroup({
  item,
  onRemoveFilter,
  onToggleGroupOperator,
  onUpdateFilter,
  onAddFilter,
}: {
  item: FilterItem;
  onRemoveFilter: (filterId: string) => void;
  onToggleGroupOperator: () => void;
  onUpdateFilter: (filterId: string, changes: Partial<Pick<Filter, "value" | "operator">>) => void;
  onAddFilter: (filter: Filter) => void;
}) {
  const { filters, groupOperator } = item;

  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-border bg-card/50">
      {filters.map((filter, index) => {
        const fieldLabel = FIELD_LABEL[filter.field] ?? filter.field;
        const opLabel = OPERATOR_LABEL[filter.operator] ?? filter.operator;
        const nextOperator = OPERATOR_CYCLE[filter.operator];

        return (
          <div key={filter.id} className="flex items-center gap-1.5">
            {/* Group operator toggle between filters in the same group */}
            {index > 0 && (
              <button
                onClick={onToggleGroupOperator}
                title={`Click to switch to ${groupOperator === "and" ? "OR" : "AND"}`}
                className={cn(
                  "px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded transition-colors",
                  "border border-transparent hover:border-border hover:bg-secondary",
                  groupOperator === "or"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                )}
              >
                {groupOperator}
              </button>
            )}

            {/* Segmented filter pill */}
            <div className="flex items-center rounded border border-border bg-card text-xs h-7 overflow-hidden">
              {/* Field segment */}
              <span className="px-2 font-medium text-foreground border-r border-border bg-secondary/40 h-full flex items-center select-none">
                {fieldLabel}
              </span>

              {/* Operator segment */}
              <button
                onClick={() =>
                  nextOperator &&
                  onUpdateFilter(filter.id, { operator: nextOperator })
                }
                title="Click to toggle operator"
                className="px-2 text-muted-foreground h-full flex items-center hover:bg-secondary hover:text-foreground transition-colors"
              >
                {opLabel}
              </button>

              {/* Value segment */}
              <ValuePopover
                filter={filter}
                onUpdate={(changes) => onUpdateFilter(filter.id, changes)}
              />

              {/* Remove button */}
              <button
                onClick={() => onRemoveFilter(filter.id)}
                className="px-1.5 h-full flex items-center border-l border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label={`Remove ${fieldLabel} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}

      {/* "+" button to add another filter to this group */}
      <AddFilterToGroupPopover onAddFilter={onAddFilter} />
    </div>
  );
}

export function FilterPills({
  filterGroup,
  onRemoveFilter,
  onToggleBetweenGroupOperator,
  onToggleGroupOperator,
  onUpdateFilter,
  onAddFilterToGroup,
  onClearAll,
}: FilterPillsProps) {
  const { items, betweenGroupOperator } = filterGroup;

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          {/* Between-group operator badge */}
          {index > 0 && (
            <button
              onClick={onToggleBetweenGroupOperator}
              title={`Click to switch to ${betweenGroupOperator === "and" ? "OR" : "AND"}`}
              className={cn(
                "px-2 py-1 text-[10px] font-bold uppercase rounded transition-colors",
                "border border-dashed hover:border-solid hover:bg-secondary",
                betweenGroupOperator === "or"
                  ? "text-amber-600 dark:text-amber-400 border-amber-400/50"
                  : "text-muted-foreground border-border"
              )}
            >
              {betweenGroupOperator}
            </button>
          )}

          {/* Group of filters */}
          <FilterItemGroup
            item={item}
            onRemoveFilter={(filterId) => onRemoveFilter(item.id, filterId)}
            onToggleGroupOperator={() => onToggleGroupOperator(item.id)}
            onUpdateFilter={(filterId, changes) => onUpdateFilter(item.id, filterId, changes)}
            onAddFilter={(filter) => onAddFilterToGroup(item.id, filter)}
          />
        </div>
      ))}
    </div>
  );
}
