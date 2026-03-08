import { AnalysisHistoryItem as AnalysisItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2 } from "lucide-react";

interface AnalysisHistoryItemProps {
  item: AnalysisItem;
  onViewDetails: (item: AnalysisItem) => void;
  onRemove: (id: string) => void;
}

export function AnalysisHistoryItem({
  item,
  onViewDetails,
  onRemove,
}: AnalysisHistoryItemProps) {
  const formatDate = (date: Date | string | number | undefined) => {
    if (!date && date !== 0) {
      return "Unknown date";
    }

    const validDate = new Date(date);

    if (isNaN(validDate.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(validDate);
  };

  const getDisplayText = (text: string, fileName?: string): string => {
        if (fileName) return fileName;
    if (!text) return "Untitled";
    return text;
  };

  const handleViewClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewDetails(item);
  };

  const handleRemoveClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(item.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
              {getDisplayText(item.text, item.fileName)}
            </CardTitle>
            <p className="text-sm text-gray-500 truncate">
              {formatDate(item.timestamp)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewClick}
              onTouchEnd={handleViewClick}
              className="flex items-center gap-1 h-8 w-8 md:h-8 md:w-auto p-0 md:p-2"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden md:inline">View</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveClick}
              onTouchEnd={handleRemoveClick}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 md:h-8 md:w-auto p-0 md:p-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden md:inline">Remove</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-gray-400 text-sm line-clamp-2">
              {item.analysis}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {item.categories.slice(0, 3).map((category, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
              {item.categories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{item.categories.length - 3} more
                </Badge>
              )}
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {(item.confidence * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Confidence</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
