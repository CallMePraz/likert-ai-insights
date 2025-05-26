import { useState, useEffect, useRef, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { getSurveyData } from "@/services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { SearchInput } from "@/components/SearchInput";

type ResponseData = {
  id: number;
  date: string;
  rating: number;
  comment: string;
  branch: string;
  sentiment: "positive" | "neutral" | "negative";
  teller_id: string;
};

export function DataTable() {
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"today" | "last7days" | "custom" | "all">("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ResponseData | null; direction: 'ascending' | 'descending' | null }>({
    key: null,
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalItems, setTotalItems] = useState(0);
  const [serverDate, setServerDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getStartDate = () => {
    if (dateFilter === "today") {
      return serverDate || format(new Date(), 'yyyy-MM-dd');
    }
    if (dateFilter === "last7days") {
      const lastWeek = new Date();
      lastWeek.setDate(new Date().getDate() - 7);
      return format(lastWeek, 'yyyy-MM-dd');
    }
    if (dateFilter === "custom" && customDateRange?.from) {
      return format(customDateRange.from, 'yyyy-MM-dd');
    }
    return undefined;
  };

  const getEndDate = () => {
    if (dateFilter === "today" || dateFilter === "last7days") {
      return serverDate || format(new Date(), 'yyyy-MM-dd');
    }
    if (dateFilter === "custom" && customDateRange?.to) {
      return format(customDateRange.to, 'yyyy-MM-dd');
    }
    return undefined;
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    fetchResponses();
  };

  const fetchResponses = async () => {
    try {
      setIsLoading(true);
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      
      const startDate = getStartDate();
      const endDate = getEndDate();
      
      console.log('Fetching data with:', {
        page: currentPage,
        dateFilter,
        startDate,
        endDate,
        offset,
        limit: itemsPerPage,
        searchTerm
      });
      
      const response = await getSurveyData(
        itemsPerPage, 
        offset,
        sortConfig.key,
        sortConfig.direction === 'ascending' ? 'asc' : 'desc',
        startDate,
        endDate,
        searchTerm
      );
      
      console.log('API Response:', {
        total: response.totalCount,
        dataLength: response.data.length,
        firstDate: response.data[0]?.date,
        lastDate: response.data[response.data.length - 1]?.date,
        serverDate: response.serverDate
      });
      
      setResponses(response.data);
      setTotalItems(response.totalCount);
      setServerDate(response.serverDate);
      setError(null);
      setIsLoading(false);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError('Failed to fetch survey data');
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleCustomDateChange = (range: DateRange | undefined) => {
    if (range) {
      // Ensure start date is not after end date
      if (range.from && range.to && range.from > range.to) {
        toast.error("Start date cannot be after end date");
        return;
      }
      setCustomDateRange(range);
      // Trigger data fetch when dates are selected
      fetchResponses();
    } else {
      setCustomDateRange(undefined);
    }
  };

  const handleSubmitCustomDate = async () => {
    if (!customDateRange?.from || !customDateRange.to) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      setIsSubmitting(true);
      // Fetch data with the selected date range
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await getSurveyData(
        itemsPerPage, 
        offset,
        sortConfig.key,
        sortConfig.direction === 'ascending' ? 'asc' : 'desc',
        format(customDateRange.from, 'yyyy-MM-dd'),
        format(customDateRange.to, 'yyyy-MM-dd')
      );

      setResponses(response.data);
      setTotalItems(response.totalCount);
      setError(null);
      setLoading(false);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error fetching custom date range:', error);
      toast.error('Failed to fetch data for selected date range');
      setIsSubmitting(false);
    }
  };

  const handleDateFilterChange = (value: "today" | "last7days" | "custom" | "all") => {
    setDateFilter(value);
    if (value !== "custom") {
      setCustomDateRange(undefined);
      setCurrentPage(1);
      setSortConfig({ key: null, direction: null });
    }
    // Trigger data fetch when filter changes
    fetchResponses();
  };

  useEffect(() => {
    fetchResponses();
  }, [currentPage, itemsPerPage, sortConfig.key, sortConfig.direction, dateFilter, totalItems, searchTerm]);

  useEffect(() => {
    if (dateFilter === "custom") {
      setCalendarOpen(true);
    } else {
      setCalendarOpen(false);
      setCustomDateRange(undefined);
    }
  }, [dateFilter]);

  useEffect(() => {
    console.log('State update:', {
      currentPage,
      totalItems,
      responsesLength: responses.length,
      firstResponseId: responses[0]?.id,
      lastResponseId: responses[responses.length - 1]?.id
    });
  }, [responses, currentPage, totalItems]);

  useEffect(() => {
    console.log('Sort config changed:', {
      key: sortConfig.key,
      direction: sortConfig.direction,
      currentPage,
      itemsPerPage
    });
  }, [sortConfig.key, sortConfig.direction, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalItems / itemsPerPage)) {
      setCurrentPage(newPage);
      console.log('Page changed to:', newPage);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  console.log('Pagination info:', { totalPages, currentPage, totalItems, itemsPerPage });

  const handleSort = (key: keyof ResponseData) => {
    console.log('Sorting by:', key);
    console.log('Current sort config:', sortConfig);
    
    // If clicking on the same column, toggle direction
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        setSortConfig({ key, direction: 'descending' });
      } else {
        setSortConfig({ key, direction: 'ascending' });
      }
    } else {
      // If clicking on a different column, set it to ascending
      setSortConfig({ key, direction: 'ascending' });
    }
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
    const headers = ["ID", "Teller ID", "Date", "Rating", "Comment", "Branch", "Sentiment"];
    const csvData = [
      headers.join(","),
      ...responses.map(item => [
        item.id,
        item.teller_id,
        item.date,
        item.rating,
        `"${item.comment.replace(/"/g, '""')}"`,
        item.branch,
        item.sentiment
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `responses_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return responses.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-likert-primary rounded-full"></div>
            <CardTitle className="text-2xl font-bold text-likert-primary">Recent Responses</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-likert-primary rounded-full"></div>
            <CardTitle className="text-2xl font-bold text-likert-primary">Recent Responses</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-likert-primary rounded-full"></div>
          <CardTitle className="text-2xl font-bold text-likert-primary">Recent Responses</CardTitle>
        </div>
        <div className="flex items-center space-x-4">
          <SearchInput 
            onSearch={handleSearch} 
            value={searchTerm}
            isLoading={isLoading}
          />
          <div className="flex items-center space-x-4">
            <Select
              value={dateFilter}
              onValueChange={handleDateFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="custom">Custom Date</SelectItem>
              </SelectContent>
            </Select>

            {calendarOpen && (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <CalendarComponent
                    mode="range"
                    selected={customDateRange}
                    onSelect={handleCustomDateChange}
                    initialFocus
                    className="rounded-md border"
                  />
                </div>
                
                {/* Show selected dates */}
                <div className="flex flex-col items-start space-y-1">
                  <span className="text-sm text-gray-500">Selected dates:</span>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">From:</span>
                      <span className="text-gray-600">
                        {customDateRange?.from 
                          ? format(customDateRange.from, "PPP")
                          : "Not selected"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">To:</span>
                      <span className="text-gray-600">
                        {customDateRange?.to 
                          ? format(customDateRange.to, "PPP")
                          : "Not selected"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add submit button */}
                <Button
                  onClick={handleSubmitCustomDate}
                  disabled={!customDateRange?.from || !customDateRange.to || isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Apply Filter"
                  )}
                </Button>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDateFilter("all");
              setCustomDateRange(undefined);
              setResponses([]);
              setCurrentPage(1);
            }}
          >
            Reset Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="w-[100px] cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  ID {getSortIcon('id')}
                </TableHead>
                <TableHead 
                  className="w-[150px] cursor-pointer"
                  onClick={() => handleSort('teller_id')}
                >
                  Teller ID {getSortIcon('teller_id')}
                </TableHead>
                <TableHead 
                  className="w-[150px] cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  Date {getSortIcon('date')}
                </TableHead>
                <TableHead 
                  className="w-[100px] cursor-pointer"
                  onClick={() => handleSort('rating')}
                >
                  Rating {getSortIcon('rating')}
                </TableHead>
                <TableHead className="max-w-[300px] truncate">Comment</TableHead>
                <TableHead 
                  className="w-[150px] cursor-pointer"
                  onClick={() => handleSort('branch')}
                >
                  Branch {getSortIcon('branch')}
                </TableHead>
                <TableHead 
                  className="w-[120px] cursor-pointer"
                  onClick={() => handleSort('sentiment')}
                >
                  Sentiment {getSortIcon('sentiment')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {loading ? 'Loading...' : 'No responses found'}
                  </TableCell>
                </TableRow>
              ) : (
                responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-mono">{response.id}</TableCell>
                    <TableCell>{response.teller_id}</TableCell>
                    <TableCell>{format(new Date(response.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className={`text-center ${getRatingColor(response.rating)}`}>
                      {response.rating}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {response.comment}
                    </TableCell>
                    <TableCell>{response.branch}</TableCell>
                    <TableCell>
                      <Badge className={getSentimentColor(response.sentiment)}>
                        {response.sentiment}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to 
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => {
                let pageNumber;
                if (totalPages <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage <= 2) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 1) {
                  pageNumber = totalPages - 2 + i;
                } else {
                  pageNumber = currentPage - 1 + i;
                }
                
                return (
                  <Button 
                    key={pageNumber}
                    variant="outline" 
                    size="sm"
                    className={currentPage === pageNumber ? "font-medium bg-primary text-primary-foreground" : ""}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
