"use client";

import { Download, FileJson, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAnalysisHistoryStore } from "@/lib/store";

export function ExportMenu() {
  const { history } = useAnalysisHistoryStore();
  const hasHistory = history.length > 0;

  const handleExportJSON = () => {
    if (!hasHistory) return;
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'analysis-history.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCSV = () => {
    if (!hasHistory) return;
    const headers = ["Date", "File Name", "Text", "Analysis", "Confidence", "Type"];
    const csvContent = [
      headers.join(","),
      ...history.map(item => {
        const row = [
          new Date(item.timestamp).toISOString(),
          `"${(item.fileName || "").replace(/"/g, '""')}"`,
          `"${(item.text || "").replace(/"/g, '""').substring(0, 100).replace(/\n/g, " ")}"`,
          `"${(item.analysis || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
          item.confidence,
          item.analysisType
        ];
        return row.join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "analysis_history.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
     if (!hasHistory) return;
     const printWindow = window.open('', '_blank');
     if (!printWindow) return;

     const html = `
       <html>
         <head>
           <title>Analysis History Export</title>
           <style>
             body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
             th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
             th { background-color: #f2f2f2; }
             h1 { font-size: 24px; margin-bottom: 10px; }
             .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
           </style>
         </head>
         <body>
           <h1>Analysis History Report</h1>
           <div class="meta">Generated on ${new Date().toLocaleString()}</div>
           <table>
             <thead>
               <tr>
                 <th>Date</th>
                 <th>File</th>
                 <th>Type</th>
                 <th>Confidence</th>
                 <th>Analysis</th>
               </tr>
             </thead>
             <tbody>
               ${history.map(item => `
                 <tr>
                   <td>${new Date(item.timestamp).toLocaleString()}</td>
                   <td>${item.fileName || '-'}</td>
                   <td>${item.analysisType || 'General'}</td>
                   <td>${(item.confidence * 100).toFixed(0)}%</td>
                   <td>${item.analysis}</td>
                 </tr>
               `).join('')}
             </tbody>
           </table>
           <script>
             window.onload = () => { window.print(); }
           </script>
         </body>
       </html>
     `;

     printWindow.document.write(html);
     printWindow.document.close();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Export results" disabled={!hasHistory}>
          <Download size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Export CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="mr-2 h-4 w-4" />
          <span>Export JSON</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrintPDF}>
          <Printer className="mr-2 h-4 w-4" />
          <span>Print / Save PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
