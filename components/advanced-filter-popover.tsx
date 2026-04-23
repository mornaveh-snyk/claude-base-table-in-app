"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, Check, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FILTER_FIELDS,
  getOperatorsForFieldType,
  getDefaultOperator,
  generateId,
  createEmptyGroup,
  type AdvancedFilterQuery,
  type FilterGroup,
  type FilterCondition,
  type FilterOperator,
  type LogicalOperator,
  type FieldDefinition,
} from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdvancedFilterPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: AdvancedFilterQuery;
  onApply: (query: AdvancedFilterQuery) => void;
  onCancel: () => void;
  trigger?: React.ReactNode;
}

// Combinator toggle (AND/OR)
function CombinatorToggle({
  value,
  onChange,
  size = "default",
}: {
  value: LogicalOperator;
  onChange: (value: LogicalOperator) => void;
  size?: "default" | "small";
}) {
  return (
    <div
      className={cn(
        "flex items-center rounded-md border border-border bg-card overflow-hidden",
        size === "small" ? "text-[10px]" : "text-xs"
      )}
    >
      <button
        onClick={() => onChange("and")}
        className={cn(
          "px-2 py-1 font-semibold uppercase transition-colors",
          value === "and"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        AND
      </button>
      <button
        onClick={() => onChange("or")}
        className={cn(
          "px-2 py-1 font-semibold uppercase transition-colors border-l border-border",
          value === "or"
            ? "bg-amber-500 text-white"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        OR
      </button>
    </div>
  );
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
            "flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md border border-border",
            "bg-card hover:bg-secondary transition-colors min-w-[100px]"
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
            "flex items-center gap-1 px-2 py-1.5 text-xs rounded-md border border-border",
            "bg-card hover:bg-secondary transition-colors min-w-[80px]"
          )}
        >
          <span className="truncate text-muted-foreground">{label}</span>
          <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start" sideOffset={4}>
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

// Value input component
function ValueInput({
  fieldDef,
  operator,
  value,
  onChange,
}: {
  fieldDef: FieldDefinition;
  operator: FilterOperator;
  value: string | string[] | number | number[] | null;
  onChange: (value: string | string[] | number | number[] | null) => void;
}) {
  const [open, setOpen] = useState(false);

  if (operator === "is_empty" || operator === "is_not_empty") {
    return null;
  }

  const isMultiSelect = ["is_any_of", "is_none_of", "includes_all_of", "includes_any_of"].includes(operator);

  if (fieldDef.values && fieldDef.values.length > 0) {
    const currentValues = Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];
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
              "flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md border border-border",
              "bg-card hover:bg-secondary transition-colors min-w-[80px]"
            )}
          >
            <span className="truncate">{displayValue}</span>
            <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="start" sideOffset={4}>
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

  if (fieldDef.type === "numeric") {
    if (operator === "is_between") {
      const rangeValues = Array.isArray(value) ? value.map(Number) : [0, 100];
      return (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={rangeValues[0] || ""}
            onChange={(e) => onChange([parseInt(e.target.value) || 0, rangeValues[1] || 100])}
            className="w-16 h-7 text-xs"
            placeholder="Min"
          />
          <span className="text-xs text-muted-foreground">-</span>
          <Input
            type="number"
            value={rangeValues[1] || ""}
            onChange={(e) => onChange([rangeValues[0] || 0, parseInt(e.target.value) || 100])}
            className="w-16 h-7 text-xs"
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
        className="w-20 h-7 text-xs"
        placeholder="Value"
      />
    );
  }

  if (fieldDef.type === "date") {
    if (operator === "is_in_last_n_days") {
      return (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={typeof value === "number" ? value : ""}
            onChange={(e) => onChange(parseInt(e.target.value) || null)}
            className="w-16 h-7 text-xs"
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
        className="w-32 h-7 text-xs"
      />
    );
  }

  return (
    <Input
      type="text"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-28 h-7 text-xs"
      placeholder="Value"
    />
  );
}

// Condition row
function ConditionRow({
  condition,
  onUpdate,
  onRemove,
  showRemove,
}: {
  condition: FilterCondition;
  onUpdate: (updates: Partial<FilterCondition>) => void;
  onRemove: () => void;
  showRemove: boolean;
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
    const needsValue = !["is_empty", "is_not_empty"].includes(newOperator);
    const hadValue = !["is_empty", "is_not_empty"].includes(condition.operator);
    
    if (needsValue !== hadValue) {
      onUpdate({ operator: newOperator, value: null });
    } else {
      onUpdate({ operator: newOperator });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <FieldSelector value={condition.field} onChange={handleFieldChange} />
      <OperatorSelector
        fieldType={fieldDef?.type || "text"}
        value={condition.operator}
        onChange={handleOperatorChange}
      />
      <ValueInput
        fieldDef={fieldDef || { label: condition.field, type: "text" }}
        operator={condition.operator}
        value={condition.value}
        onChange={(value) => onUpdate({ value })}
      />
      {showRemove && (
        <button
          onClick={onRemove}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Remove condition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// Filter group component
function FilterGroupComponent({
  group,
  onUpdate,
  onRemove,
  showRemove,
}: {
  group: FilterGroup;
  onUpdate: (updates: Partial<FilterGroup>) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const handleAddCondition = () => {
    const newCondition: FilterCondition = {
      id: generateId(),
      field: Object.keys(FILTER_FIELDS)[0],
      operator: getDefaultOperator(FILTER_FIELDS[Object.keys(FILTER_FIELDS)[0]].type),
      value: null,
    };
    onUpdate({ conditions: [...group.conditions, newCondition] });
  };

  const handleUpdateCondition = (id: string, updates: Partial<FilterCondition>) => {
    onUpdate({
      conditions: group.conditions.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const handleRemoveCondition = (id: string) => {
    const newConditions = group.conditions.filter((c) => c.id !== id);
    if (newConditions.length === 0) {
      onRemove();
    } else {
      onUpdate({ conditions: newConditions });
    }
  };

  return (
    <div className="p-3 rounded-lg border border-border bg-secondary/30">
      <div className="flex items-center justify-between mb-3">
        <CombinatorToggle
          value={group.combinator}
          onChange={(combinator) => onUpdate({ combinator })}
          size="small"
        />
        {showRemove && (
          <button
            onClick={onRemove}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Remove group
          </button>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        {group.conditions.map((condition, index) => (
          <div key={condition.id} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-[10px] font-semibold uppercase text-muted-foreground w-8 text-center">
                {group.combinator}
              </span>
            )}
            {index === 0 && <span className="w-8" />}
            <ConditionRow
              condition={condition}
              onUpdate={(updates) => handleUpdateCondition(condition.id, updates)}
              onRemove={() => handleRemoveCondition(condition.id)}
              showRemove={group.conditions.length > 1}
            />
          </div>
        ))}
      </div>
      
      <button
        onClick={handleAddCondition}
        className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add condition
      </button>
    </div>
  );
}

export function AdvancedFilterPopover({
  open,
  onOpenChange,
  query,
  onApply,
  onCancel,
  trigger,
}: AdvancedFilterPopoverProps) {
  const [localQuery, setLocalQuery] = useState<AdvancedFilterQuery>(query);

  // Sync local state when query prop changes
  useEffect(() => {
    if (open) {
      setLocalQuery(query);
    }
  }, [open, query]);

  const handleAddGroup = () => {
    setLocalQuery({
      ...localQuery,
      groups: [...localQuery.groups, createEmptyGroup()],
    });
  };

  const handleUpdateGroup = (id: string, updates: Partial<FilterGroup>) => {
    setLocalQuery({
      ...localQuery,
      groups: localQuery.groups.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    });
  };

  const handleRemoveGroup = (id: string) => {
    const newGroups = localQuery.groups.filter((g) => g.id !== id);
    if (newGroups.length === 0) {
      setLocalQuery({
        ...localQuery,
        groups: [createEmptyGroup()],
      });
    } else {
      setLocalQuery({
        ...localQuery,
        groups: newGroups,
      });
    }
  };

  const handleApply = () => {
    onApply(localQuery);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  // Content for the popover
  const popoverContent = (
    <div className="w-[520px] rounded-lg border border-border bg-popover shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Advanced Filter</h3>
          <CombinatorToggle
            value={localQuery.rootCombinator}
            onChange={(rootCombinator) => setLocalQuery({ ...localQuery, rootCombinator })}
          />
        </div>

        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
          {localQuery.groups.map((group, index) => (
            <div key={group.id}>
              {index > 0 && (
                <div className="flex items-center justify-center my-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground px-2 py-0.5 rounded bg-secondary">
                    {localQuery.rootCombinator}
                  </span>
                </div>
              )}
              <FilterGroupComponent
                group={group}
                onUpdate={(updates) => handleUpdateGroup(group.id, updates)}
                onRemove={() => handleRemoveGroup(group.id)}
                showRemove={localQuery.groups.length > 1}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleAddGroup}
          className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add group
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 p-3 border-t border-border bg-secondary/30 rounded-b-lg">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  );

  // If no trigger provided, render content directly when open (controlled mode)
  if (!trigger) {
    if (!open) return null;
    return popoverContent;
  }

  // With trigger, use Popover component
  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleCancel();
      } else {
        onOpenChange(true);
      }
    }}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent 
        className="w-[520px] p-0" 
        align="start" 
        sideOffset={8}
        onInteractOutside={(e) => {
          // Prevent closing when clicking inside nested popovers
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Advanced Filter</h3>
            <CombinatorToggle
              value={localQuery.rootCombinator}
              onChange={(rootCombinator) => setLocalQuery({ ...localQuery, rootCombinator })}
            />
          </div>

          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
            {localQuery.groups.map((group, index) => (
              <div key={group.id}>
                {index > 0 && (
                  <div className="flex items-center justify-center my-2">
                    <span className="text-xs font-semibold uppercase text-muted-foreground px-2 py-0.5 rounded bg-secondary">
                      {localQuery.rootCombinator}
                    </span>
                  </div>
                )}
                <FilterGroupComponent
                  group={group}
                  onUpdate={(updates) => handleUpdateGroup(group.id, updates)}
                  onRemove={() => handleRemoveGroup(group.id)}
                  showRemove={localQuery.groups.length > 1}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleAddGroup}
            className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add group
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 p-3 border-t border-border bg-secondary/30">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
