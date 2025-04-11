
import { useState } from "react";
import { CalendarDays, Download, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, subDays } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";

export function DashboardHeader() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const [dateRange, setDateRange] = useState<"last30days" | "last7days" | "today" | "custom">("last30days");
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  const getDateRangeText = () => {
    switch (dateRange) {
      case "last30days":
        return "Last 30 Days";
      case "last7days":
        return "Last 7 Days";
      case "today":
        return "Today";
      case "custom":
        if (customDateRange.from) {
          const fromFormatted = format(customDateRange.from, "MMM d");
          const toFormatted = customDateRange.to ? format(customDateRange.to, "MMM d") : fromFormatted;
          return `${fromFormatted} - ${toFormatted}`;
        }
        return "Custom Range";
    }
  };
  
  const handleDateFilterChange = (newRange: "last30days" | "last7days" | "today" | "custom") => {
    setDateRange(newRange);
    
    // If not custom, reset the custom date range
    if (newRange !== "custom") {
      setCustomDateRange({ from: undefined, to: undefined });
    }
    
    // Show toast notification when filter is applied
    toast({
      title: "Date filter applied",
      description: `Showing data for: ${newRange === "custom" ? "Custom range" : newRange}`,
    });
  };
  
  const handleRefresh = () => {
    toast({
      title: "Data refreshed",
      description: "Dashboard data has been updated with the latest information.",
    });
  };
  
  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your dashboard data is being prepared for export.",
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold">Likert Survey Dashboard</h1>
        <p className="text-muted-foreground">{formattedDate}</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>{getDateRangeText()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-2 border-b">
              <div className="grid grid-cols-2 gap-1">
                <Button 
                  variant={dateRange === "last30days" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleDateFilterChange("last30days")}
                >
                  Last 30 Days
                </Button>
                <Button 
                  variant={dateRange === "last7days" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleDateFilterChange("last7days")}
                >
                  Last 7 Days
                </Button>
                <Button 
                  variant={dateRange === "today" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleDateFilterChange("today")}
                >
                  Today
                </Button>
                <Button 
                  variant={dateRange === "custom" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleDateFilterChange("custom")}
                >
                  Custom
                </Button>
              </div>
            </div>
            
            {dateRange === "custom" && (
              <div className="p-2">
                <Calendar
                  mode="range"
                  selected={{
                    from: customDateRange.from,
                    to: customDateRange.to
                  }}
                  onSelect={(range) => setCustomDateRange(range || { from: undefined, to: undefined })}
                  className="rounded-md border p-3 pointer-events-auto"
                />
              </div>
            )}
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Filter options</h4>
                <p className="text-sm text-muted-foreground">
                  Apply filters to your dashboard data
                </p>
              </div>
              <div className="grid gap-2">
                <Button 
                  size="sm" 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Filter applied",
                      description: "Showing only positive feedback",
                    });
                  }}
                >
                  Positive feedback
                </Button>
                <Button 
                  size="sm" 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Filter applied",
                      description: "Showing only negative feedback",
                    });
                  }}
                >
                  Negative feedback
                </Button>
                <Button 
                  size="sm" 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Filter applied",
                      description: "Showing only in-person channel",
                    });
                  }}
                >
                  In-person channel
                </Button>
                <Button 
                  size="sm" 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Filter applied",
                      description: "Showing only mobile channel",
                    });
                  }}
                >
                  Mobile channel
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>
    </div>
  );
}
