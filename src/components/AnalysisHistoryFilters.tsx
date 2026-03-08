"use client";

import { Filter, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalysisHistoryFilters } from "@/lib/types";

interface AnalysisHistoryFiltersProps {
  filters: AnalysisHistoryFilters;
  onUpdateFilters: (filters: Partial<AnalysisHistoryFilters>) => void;
}

export function AnalysisHistoryFiltersComponent({
  filters,
  onUpdateFilters,
}: AnalysisHistoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search analyses..."
          value={filters.search}
          onChange={(e) => onUpdateFilters({ search: e.target.value })}
          className="bg-background border-input transition-all duration-200 focus:ring-2 focus:ring-primary"
        />
      </div>

      <Select
        value={filters.category}
        onValueChange={(value) => onUpdateFilters({ category: value })}
      >
        <SelectTrigger className="w-full sm:w-48">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="general">General</SelectItem>
          <SelectItem value="sentiment">Sentiment</SelectItem>
          <SelectItem value="summary">Summary</SelectItem>
          <SelectItem value="keywords">Keywords</SelectItem>
          <SelectItem value="readability">Readability</SelectItem>
          <SelectItem value="grammar">Grammar</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={`${filters.sortBy}-${filters.sortOrder}`}
        onValueChange={(value) => {
          const [sortBy, sortOrder] = value.split("-") as [
            "timestamp" | "confidence",
            "asc" | "desc",
          ];
          onUpdateFilters({ sortBy, sortOrder });
        }}
      >
        <SelectTrigger className="w-full sm:w-48">
          {filters.sortOrder === "asc" ? (
            <SortAsc className="h-4 w-4 mr-2" />
          ) : (
            <SortDesc className="h-4 w-4 mr-2" />
          )}
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="timestamp-desc">Newest First</SelectItem>
          <SelectItem value="timestamp-asc">Oldest First</SelectItem>
          <SelectItem value="confidence-desc">Highest Confidence</SelectItem>
          <SelectItem value="confidence-asc">Lowest Confidence</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
