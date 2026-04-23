"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  Activity,
  ShieldAlert,
  Layers,
  User,
  Clock,
  Plus,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  parseNaturalLanguageFilter,
  FILTER_FIELDS,
  type FilterGroup,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

const FIELD_META: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  status: {
    label: "Status",
    icon: <Activity className="w-4 h-4" />,
  },
  risk: {
    label: "Risk",
    icon: <ShieldAlert className="w-4 h-4" />,
  },
  type: {
    label: "Type",
    icon: <Layers className="w-4 h-4" />,
  },
  owner: {
    label: "Owner",
    icon: <User className="w-4 h-4" />,
  },
  lastSeen: {
    label: "Last Seen",
    icon: <Clock className="w-4 h-4" />,
  },
};

const FIELD_KEYS = Object.keys(FIELD_META);

// A "sentence" has at least one space — treat as natural language
function isNaturalLanguage(input: string): boolean {
  return input.trim().includes(" ");
}

// Returns {field, value} matches for a single token query
function getTokenMatches(token: string): Array<{ field: string; value: string; fieldLabel: string }> {
  if (!token) return [];
  const q = token.toLowerCase();
  const results: Array<{ field: string; value: string; fieldLabel: string }> = [];

  for (const [fieldKey, fieldDef] of Object.entries(FILTER_FIELDS)) {
    // Match field label itself
    if (fieldDef.label.toLowerCase().includes(q)) {
      // Show first value as a representative entry
      results.push({ field: fieldKey, value: fieldDef.values[0], fieldLabel: fieldDef.label });
      continue;
    }
    // Match any individual value
    for (const v of fieldDef.values) {
      if (v.toLowerCase().includes(q)) {
        results.push({ field: fieldKey, value: v, fieldLabel: fieldDef.label });
      }
    }
  }

  return results;
}

interface AIFilterDropdownProps {
  onApplyFilters: (filterGroup: FilterGroup) => void;
}

export function AIFilterCommand({ onApplyFilters }: AIFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isNL = isNaturalLanguage(input);
  const tokenMatches = !isNL ? getTokenMatches(input.trim()) : [];

  // Visible rows in the list (excluding the AI row which is always row 0):
  // - No input: show all fields
  // - Single token: show matching fields/values only
  // - Natural language (spaces): show nothing — only the AI Filter row
  const visibleFieldRows: Array<{ key: string; label: string; icon: React.ReactNode; value?: string }> =
    isNL
      ? []
      : !input.trim()
      ? FIELD_KEYS.map((key) => ({ key, label: FIELD_META[key].label, icon: FIELD_META[key].icon }))
      : tokenMatches.map(({ field, value, fieldLabel }) => ({
          key: field,
          label: fieldLabel,
          icon: FIELD_META[field]?.icon,
          value,
        }));

  // Total items: 1 AI row + N visible field rows
  const totalItems = 1 + visibleFieldRows.length;

  // Reset on close
  useEffect(() => {
    if (!open) {
      setInput("");
      setHighlightedIndex(0);
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const applyAIFilter = useCallback(
    (query: string) => {
      const parsed = parseNaturalLanguageFilter(query);
      if (parsed.items.length > 0 && parsed.items.some(item => item.filters.length > 0)) {
        onApplyFilters(parsed);
        setOpen(false);
      }
    },
    [onApplyFilters]
  );

  const applyFieldFilter = useCallback(
    (fieldKey: string, value?: string) => {
      // Build a single-filter group for the selected field with the given value (or first value)
      const field = FILTER_FIELDS[fieldKey as keyof typeof FILTER_FIELDS];
      if (!field) return;
      const targetValue = value ?? field.values[0];
      const parsed = parseNaturalLanguageFilter(`${fieldKey} ${targetValue}`);
      if (parsed.items.length > 0 && parsed.items.some(item => item.filters.length > 0)) {
        onApplyFilters(parsed);
        setOpen(false);
      }
    },
    [onApplyFilters]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, totalItems - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex === 0) {
          // AI filter row — only fires when there's a natural language query
          if (input.trim()) applyAIFilter(input.trim());
        } else {
          // Field / value row
          const row = visibleFieldRows[highlightedIndex - 1];
          if (row) applyFieldFilter(row.key, row.value);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [highlightedIndex, input, totalItems, applyAIFilter, applyFieldFilter]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors",
            "border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-secondary",
            open && "bg-secondary text-foreground border-solid border-border"
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          Filter
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 p-0 shadow-lg rounded-lg overflow-hidden"
        align="start"
        sideOffset={6}
      >
        {/* Text input */}
        <div className="flex items-center px-3 py-2.5 border-b border-border">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Filter..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* List */}
        <div className="py-1 max-h-72 overflow-y-auto">
          {/* AI Filter row — always first; only actionable when input is natural language */}
          <button
            onMouseEnter={() => setHighlightedIndex(0)}
            onClick={() => {
              if (input.trim()) applyAIFilter(input.trim());
            }}
            disabled={!input.trim()}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
              !input.trim() && "opacity-50 cursor-default",
              highlightedIndex === 0 && input.trim() ? "bg-secondary" : "hover:bg-secondary/60"
            )}
          >
            <span className="flex items-center justify-center w-5 h-5 text-indigo-500 shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-sm font-medium text-foreground">
              AI Filter
              {input.trim() && (
                <span className="ml-1.5 text-muted-foreground font-normal">
                  &quot;{input}&quot;
                </span>
              )}
            </span>
          </button>

          {/* Divider — only when field rows are visible */}
          {(visibleFieldRows.length > 0 || (!isNL && input.trim())) && (
            <div className="my-1 border-t border-border" />
          )}

          {/* Field / value rows — filtered when single-token, full list for NL */}
          {visibleFieldRows.length === 0 && input.trim() && !isNL ? (
            <p className="px-3 py-4 text-xs text-muted-foreground text-center">
              No matching filters. Press Enter to use AI Filter.
            </p>
          ) : (
            visibleFieldRows.map((row, idx) => {
              const rowIndex = idx + 1;
              return (
                <button
                  key={`${row.key}-${row.value ?? idx}`}
                  onMouseEnter={() => setHighlightedIndex(rowIndex)}
                  onClick={() => applyFieldFilter(row.key, row.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                    highlightedIndex === rowIndex
                      ? "bg-secondary"
                      : "hover:bg-secondary/60"
                  )}
                >
                  <span className="flex items-center justify-center w-5 h-5 text-muted-foreground shrink-0">
                    {row.icon}
                  </span>
                  <span className="text-sm text-foreground">
                    {row.label}
                    {row.value && !isNL && (
                      <span className="ml-1.5 text-muted-foreground font-normal">
                        = {row.value.charAt(0).toUpperCase() + row.value.slice(1)}
                      </span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
