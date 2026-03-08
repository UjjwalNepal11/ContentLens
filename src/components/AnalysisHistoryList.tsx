import { AnalysisHistoryItem as HistoryItem } from "@/components/AnalysisHistoryItem";
import { AnalysisHistoryItem } from "@/lib/types";

interface AnalysisHistoryListProps {
  items: AnalysisHistoryItem[];
  onViewDetails: (item: AnalysisHistoryItem) => void;
  onRemove: (id: string) => void;
}

export function AnalysisHistoryList({
  items,
  onViewDetails,
  onRemove,
}: AnalysisHistoryListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <HistoryItem
          key={item.id}
          item={item}
          onViewDetails={onViewDetails}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
