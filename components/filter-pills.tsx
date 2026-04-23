"use client";

import { useState } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FILTER_FIELDS,
  getOperatorsForFieldType,
  getDefaultOperator,
  generateId,
  type FilterCondition,
  type SimpleFilterState,
  type FilterOperator,
  type FieldDefinition,
} from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Input } from "@/components/ui/input";

interface SimpleFilterBarProps {
  filters: SimpleFilterState;
  onFiltersChange: (filters: SimpleFilterState) => void;
  onAdvancedClick: () => void;
  showAdvancedLink?: boolean;
}

// Field selector dropdown
function FieldSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (field: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const fieldDef = FILTER_FIELDS[value];
  const label = fieldDef?.label || value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-l border-r border-border",
            "bg-secondary/50 hover:bg-secondary transition-colors min-w-[80px]"
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start" sideOffset={4}>
        <div className="flex flex-col max-h-64 overflow-y-auto">
          {Object.entries(FILTER_FIELDS).map(([key, def]) => (
            <button
              key={key}
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              className={cn(
                "flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors",
                value === key
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <span>{def.label}</span>
              {value === key && <Check className="w-3 h-3 shrink-0" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Operator selector dropdown
function OperatorSelector({
  fieldType,
  value,
  onChange,
}: {
  fieldType: FieldDefinition["type"];
  value: FilterOperator;
  onChange: (operator: FilterOperator) => void;
}) {
  const [open, setOpen] = useState(false);
  const operators = getOperatorsForFieldType(fieldType);
  const currentOp = operators.find((o) => o.value === value);
  const label = currentOp?.label || value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground",
            "hover:bg-secondary hover:text-foreground transition-colors border-r border-border"
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="w-3 h-3 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start" sideOffset={4}>
        <div className="flex flex-col">
          {operators.map((op) => (
            <button
              key={op.value}
              onClick={() => {
                onChange(op.value);
                setOpen(false);
              }}
              className={cn(
                "flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors",
                value === op.value
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <span>{op.label}</span>
              {value === op.value && <Check className="w-3 h-3 shrink-0" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Value input/selector based on field type
function ValueInput({
  field,
  fieldDef,
  operator,
  value,
  onChange,
}: {
  field: string;
  fieldDef: FieldDefinition;
  operator: FilterOperator;
  value: string | string[] | number | number[] | null;
  onChange: (value: string | string[] | number | number[] | null) => void;
}) {
  const [open, setOpen] = useState(false);

  // Operators that don't need a value
  if (operator === "is_empty" || operator === "is_not_empty") {
    return null;
  }

  // Multi-select for "is any of", "is none of", "includes all of", "includes any of"
  const isMultiSelect = ["is_any_of", "is_none_of", "includes_all_of", "includes_any_of"].includes(operator);

  // Enum or multi-value fields with predefined values
  if (fieldDef.values && fieldDef.values.length > 0) {
    const currentValues = Array.isArray(value) ? value : value ? [String(value)] : [];
    const displayValue = currentValues.length > 0 
      ? currentValues.length === 1 
        ? String(currentValues[0]) 
        : `${currentValues.length} selected`
      : "Select...";

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs font-medium text-foreground",
              "hover:bg-secondary transition-colors min-w-[60px]"
            )}
          >
            <span className="truncate">{displayValue}</span>
            <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-1" align="start" sideOffset={4}>
          <div className="flex flex-col max-h-48 overflow-y-auto">
            {fieldDef.values.map((v) => {
              const isSelected = isMultiSelect 
                ? currentValues.includes(v)
                : String(value) === v;
              
              return (
                <button
                  key={v}
                  onClick={() => {
                    if (isMultiSelect) {
                      const newValues = isSelected
                        ? currentValues.filter((cv) => cv !== v)
                        : [...currentValues, v];
                      onChange(newValues.length > 0 ? newValues : null);
                    } else {
                      onChange(v);
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors",
                    isSelected
                      ? "bg-secondary font-medium text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <span>{v}</span>
                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                </button>
              );
            })}
          </div>
          {isMultiSelect && (
            <div className="border-t border-border mt-1 pt-1">
              <button
                onClick={() => setOpen(false)}
                className="w-full px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-secondary rounded transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  // Numeric input
  if (fieldDef.type === "numeric") {
    if (operator === "is_between") {
      const rangeValues = Array.isArray(value) ? value.map(Number) : [0, 100];
      return (
        <div className="flex items-center gap-1 px-1">
          <Input
            type="number"
            value={rangeValues[0] || ""}
            onChange={(e) => onChange([parseInt(e.target.value) || 0, rangeValues[1] || 100])}
            className="w-14 h-6 text-xs px-1.5 py-0"
            placeholder="Min"
          />
          <span className="text-xs text-muted-foreground">-</span>
          <Input
            type="number"
            value={rangeValues[1] || ""}
            onChange={(e) => onChange([rangeValues[0] || 0, parseInt(e.target.value) || 100])}
            className="w-14 h-6 text-xs px-1.5 py-0"
            placeholder="Max"
          />
        </div>
      );
    }
    return (
      <Input
        type="number"
        value={typeof value === "number" ? value : ""}
        onChange={(e) => onChange(parseInt(e.target.value) || null)}
        className="w-16 h-6 text-xs px-1.5 py-0 border-0 focus-visible:ring-0"
        placeholder="Value"
      />
    );
  }

  // Date input
  if (fieldDef.type === "date") {
    if (operator === "is_in_last_n_days") {
      return (
        <div className="flex items-center gap-1 px-1">
          <Input
            type="number"
            value={typeof value === "number" ? value : ""}
            onChange={(e) => onChange(parseInt(e.target.value) || null)}
            className="w-14 h-6 text-xs px-1.5 py-0"
            placeholder="N"
          />
          <span className="text-xs text-muted-foreground">days</span>
        </div>
      );
    }
    return (
      <Input
        type="date"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-28 h-6 text-xs px-1.5 py-0 border-0 focus-visible:ring-0"
      />
    );
  }

  // Text input (default)
  return (
    <Input
      type="text"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-24 h-6 text-xs px-1.5 py-0 border-0 focus-visible:ring-0"
      placeholder="Value"
    />
  );
}

// Single filter row
function FilterRow({
  condition,
  onUpdate,
  onRemove,
}: {
  condition: FilterCondition;
  onUpdate: (updates: Partial<FilterCondition>) => void;
  onRemove: () => void;
}) {
  const fieldDef = FILTER_FIELDS[condition.field];

  const handleFieldChange = (newField: string) => {
    const newFieldDef = FILTER_FIELDS[newField];
    const newOperator = getDefaultOperator(newFieldDef?.type || "text");
    onUpdate({ 
      field: newField, 
      operator: newOperator,
      value: null,
    });
  };

  const handleOperatorChange = (newOperator: FilterOperator) => {
    // Reset value if switching to/from operators that don't need values
    const needsValue = !["is_empty", "is_not_empty"].includes(newOperator);
    const hadValue = !["is_empty", "is_not_empty"].includes(condition.operator);
    
    if (needsValue !== hadValue) {
      onUpdate({ operator: newOperator, value: null });
    } else {
      onUpdate({ operator: newOperator });
    }
  };

  return (
    <div className="flex items-center rounded-md border border-border bg-card text-xs h-7 overflow-hidden">
      <FieldSelector value={condition.field} onChange={handleFieldChange} />
      <OperatorSelector
        fieldType={fieldDef?.type || "text"}
        value={condition.operator}
        onChange={handleOperatorChange}
      />
      <ValueInput
        field={condition.field}
        fieldDef={fieldDef || { label: condition.field, type: "text" }}
        operator={condition.operator}
        value={condition.value}
        onChange={(value) => onUpdate({ value })}
      />
      <button
        onClick={onRemove}
        className="px-1.5 h-full flex items-center border-l border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Remove filter"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export function SimpleFilterBar({
  filters = [],
  onFiltersChange,
}: Omit<SimpleFilterBarProps, 'onAdvancedClick' | 'showAdvancedLink'>) {
  const handleUpdateFilter = (id: string, updates: Partial<FilterCondition>) => {
    onFiltersChange(
      filters.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleRemoveFilter = (id: string) => {
    onFiltersChange(filters.filter((f) => f.id !== id));
  };

  // Only render if there are filters
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((condition) => (
        <FilterRow
          key={condition.id}
          condition={condition}
          onUpdate={(updates) => handleUpdateFilter(condition.id, updates)}
          onRemove={() => handleRemoveFilter(condition.id)}
        />
      ))}
    </div>
  );
}

// Query display component for when advanced filter is active
interface QueryDisplayProps {
  summary: string;
  onEdit: () => void;
  onClear: () => void;
}

export function QueryDisplay({ summary, onEdit, onClear }: QueryDisplayProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card text-xs">
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors min-w-0"
      >
        <span className="font-medium text-muted-foreground shrink-0">Query:</span>
        <span className="truncate">{summary}</span>
      </button>
      <button
        onClick={onClear}
        className="shrink-0 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Clear query"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// Legacy export for backwards compatibility
export { SimpleFilterBar as FilterPills };
