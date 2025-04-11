import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Filter, 
  Search,
  ChevronUp,
  ChevronDown,
  Calendar
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { addDays, format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";

// Define types for our data
type ResponseData = {
  id: number;
  date: string;
  rating: number;
  comment: string;
  branch: string;
  channel: string;
  sentiment: "positive" | "neutral" | "negative";
};

const Reports = () => {
  // Mock data for the table - Using more data for the Reports page
  const initialResponses: ResponseData[] = [
    {
      id: 1001,
      date: "2025-04-10",
      rating: 5,
      comment: "Excellent service, the staff was very helpful and knowledgeable.",
      branch: "Downtown",
      channel: "in-person",
      sentiment: "positive",
    },
    {
      id: 1002,
      date: "2025-04-10",
      rating: 2,
      comment: "Had to wait for over 30 minutes to be served. Unacceptable.",
      branch: "Westside",
      channel: "in-person",
      sentiment: "negative",
    },
    {
      id: 1003,
      date: "2025-04-09",
      rating: 4,
      comment: "Mobile app works great, but could use more features.",
      branch: "Online",
      channel: "mobile",
      sentiment: "positive",
    },
    {
      id: 1004,
      date: "2025-04-09",
      rating: 3,
      comment: "Average experience. Nothing special to note.",
      branch: "Northgate",
      channel: "in-person",
      sentiment: "neutral",
    },
    {
      id: 1005,
      date: "2025-04-08",
      rating: 1,
      comment: "App keeps crashing when trying to make a transfer. Very frustrating!",
      branch: "Online",
      channel: "mobile",
      sentiment: "negative",
    },
    {
      id: 1006,
      date: "2025-04-08",
      rating: 5,
      comment: "The representative went above and beyond to help me resolve my issue.",
      branch: "Eastside",
      channel: "phone",
      sentiment: "positive",
    },
    {
      id: 1007,
      date: "2025-04-07",
      rating: 4,
      comment: "Quick and efficient service. Would recommend.",
      branch: "Downtown",
      channel: "in-person",
      sentiment: "positive",
    },
    {
      id: 1008,
      date: "2025-04-07",
      rating: 1,
      comment: "Terrible service. Will not be returning.",
      branch: "Westside",
      channel: "in-person",
      sentiment: "negative",
    },
    {
      id: 1009,
      date: "2025-04-06",
      rating: 3,
      comment: "Service was okay. Nothing special but got the job done.",
      branch: "Downtown",
      channel: "in-person",
      sentiment: "neutral",
    },
    {
      id: 1010,
      date: "2025-04-06",
      rating: 5,
      comment: "Great experience! The new self-service kiosks are amazing.",
      branch: "Eastside",
      channel: "in-person",
      sentiment: "positive",
    },
    {
      id: 1011,
      date: "2025-04-05",
      rating: 2,
      comment: "Website is confusing to navigate. Could not find what I needed.",
      branch: "Online",
      channel: "web",
      sentiment: "negative",
    },
    {
      id: 1012,
      date: "2025-04-05",
      rating: 4,
      comment: "Representative was very patient with all my questions.",
      branch: "Northgate",
      channel: "phone",
      sentiment: "positive",
    },
  ];

  // State management
  const [responses, setResponses] = useState<ResponseData[]>(initialResponses);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "last7days" | "custom" | "all">("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof ResponseData | null; direction: 'ascending' | 'descending' | null }>({
    key: null,
    direction: null,
  });

  // Apply search and filter
  useEffect(() => {
    let filteredData = [...initialResponses];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.id.toString().includes(query) ||
          item.date.toLowerCase().includes(query) ||
          item.rating.toString().includes(query) ||
          item.comment.toLowerCase().includes(query) ||
          item.branch.toLowerCase().includes(query) ||
          item.channel.toLowerCase().includes(query) ||
          item.sentiment.toLowerCase().includes(query)
      );
    }
    
    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === "today") {
        const todayStr = format(today, "yyyy-MM-dd");
        filteredData = filteredData.filter((item) => item.date === todayStr);
      } else if (dateFilter === "last7days") {
        const sevenDaysAgo = subDays(today, 7);
        filteredData = filteredData.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate >= sevenDaysAgo && itemDate <= today;
        });
      } else if (dateFilter === "custom" && customDateRange.from) {
        const fromDate = customDateRange.from;
        const toDate = customDateRange.to || fromDate;
        
        // Set time to end of day for the to date
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        
        filteredData = filteredData.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate >= fromDate && itemDate <= endDate;
        });
      }
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setResponses(filteredData);
  }, [searchQuery, dateFilter, customDateRange, sortConfig, initialResponses]);

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "neutral":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "";
    }
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4) return "text-likert-positive";
    if (rating >= 3) return "text-likert-neutral";
    return "text-likert-negative";
  };

  const handleSort = (key: keyof ResponseData) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = null;
      }
    }
    
    setSortConfig({ key: direction ? key : null, direction });
  };

  const getSortIcon = (key: keyof ResponseData) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? 
      <ChevronUp className="h-4 w-4 inline ml-1" /> : 
      <ChevronDown className="h-4 w-4 inline ml-1" />;
  };

  const handleExport = () => {
    // Convert the data to CSV
    const headers = ["ID", "Date", "Rating", "Comment", "Branch", "Channel", "Sentiment"];
    const csvData = [
      headers.join(","),
      ...responses.map(item => [
        item.id,
        item.date,
        item.rating,
        `"${item.comment.replace(/"/g, '""')}"`, // Escape quotes in comments
        item.branch,
        item.channel,
        item.sentiment
      ].join(","))
    ].join("\n");
    
    // Create a Blob with the CSV data
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element to download the CSV
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `responses_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Survey Response Reports</h1>
          <p className="text-muted-foreground">Complete survey response data</p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>All Responses</CardTitle>
                <CardDescription>Complete feedback dataset</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search responses..."
                    className="w-full md:w-64 pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filter by date</h4>
                      <Select
                        value={dateFilter}
                        onValueChange={(value: "today" | "last7days" | "custom" | "all") => setDateFilter(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All dates</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="last7days">Last 7 days</SelectItem>
                          <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {dateFilter === "custom" && (
                        <div className="border rounded-md p-3">
                          <div className="space-y-3">
                            <div className="flex items-center justify-center">
                              <CalendarComponent
                                mode="range"
                                selected={customDateRange}
                                onSelect={(range) => setCustomDateRange(range || { from: undefined, to: undefined })}
                                className="rounded-md border pointer-events-auto"
                              />
                            </div>
                            <div className="flex gap-2 justify-between text-sm">
                              <div>
                                <p className="font-medium">From</p>
                                <p>{customDateRange.from ? format(customDateRange.from, "PP") : "Pick a date"}</p>
                              </div>
                              <div>
                                <p className="font-medium">To</p>
                                <p>{customDateRange.to ? format(customDateRange.to, "PP") : "Pick a date"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
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
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      ID {getSortIcon("id")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      Date {getSortIcon("date")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("rating")}
                    >
                      Rating {getSortIcon("rating")}
                    </TableHead>
                    <TableHead className="w-[300px]">Comment</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("branch")}
                    >
                      Branch {getSortIcon("branch")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("channel")}
                    >
                      Channel {getSortIcon("channel")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("sentiment")}
                    >
                      Sentiment {getSortIcon("sentiment")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-medium">{response.id}</TableCell>
                      <TableCell>{response.date}</TableCell>
                      <TableCell className={getRatingColor(response.rating)}>
                        {response.rating} ★
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {response.comment}
                      </TableCell>
                      <TableCell>{response.branch}</TableCell>
                      <TableCell className="capitalize">{response.channel}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getSentimentColor(response.sentiment)} capitalize`}
                        >
                          {response.sentiment}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{responses.length}</span> of{" "}
                <span className="font-medium">3,842</span> responses
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="font-medium">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground">
        <p>© 2025 Likert.AI Insights Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Reports;
