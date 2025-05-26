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
  Calendar,
  Loader2
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
import { getSurveyData } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDebounce } from "../hooks/useDebounce";
import type { SurveyResponse } from "@/services/api";
import { SearchInput } from "@/components/SearchInput";
import { getBranchRespondentsPaginated, BranchRespondent, BranchRespondentParams } from "@/services/branchRespondent";
import { getBranchRespondentTeller } from '../services/branchRespondentTeller';

// Define types for our data
interface ResponseData extends SurveyResponse {
  teller_id: string;
}

export function Reports() {
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "last7days" | "custom" | "all">("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ResponseData | null; direction: 'ascending' | 'descending' | null }>({
    key: null,
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [serverDate, setServerDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [branchRespondents, setBranchRespondents] = useState<BranchRespondent[]>([]);
  const [loadingBranchRespondents, setLoadingBranchRespondents] = useState(false);
  const [branchRespondentPage, setBranchRespondentPage] = useState(1);
  const [branchRespondentTotal, setBranchRespondentTotal] = useState(0);
  const branchRespondentPageSize = 5;
  const [branchRespondentSort, setBranchRespondentSort] = useState<{col: 'branch' | 'total_surveys', order: 'asc' | 'desc'}>({col: 'branch', order: 'asc'});
  const [branchRespondentSearch, setBranchRespondentSearch] = useState('');
  const [branchRespondentDateFilter, setBranchRespondentDateFilter] = useState<'all' | 'today' | 'last7days' | 'custom'>('all');
  const [branchRespondentCustomRange, setBranchRespondentCustomRange] = useState<DateRange>();

  const handleSearchChange = (searchValue: string) => {
    setSearchTerm(searchValue);
    // Reset to first page when search changes
    setCurrentPage(1);
    // Reset sort when search changes
    setSortConfig({ key: null, direction: null });
    // Fetch data with new search term
    fetchResponses();
  };

  const handleDateFilterChange = (value: "today" | "last7days" | "custom" | "all") => {
    setDateFilter(value);
    if (value !== "custom") {
      setCustomDateRange(undefined);
      setCurrentPage(1);
      setSortConfig({ key: null, direction: null });
    }
    fetchResponses();
  };

  const getStartDate = () => {
    if (dateFilter === "today") {
      // Use serverDate if available, otherwise fall back to client time
      const date = serverDate ? new Date(serverDate) : new Date();
      // Set to start of the day
      date.setHours(0, 0, 0, 0);
      return format(date, 'yyyy-MM-dd');
    }
    if (dateFilter === "last7days") {
      // Get the current date in server's timezone
      const currentDate = serverDate ? new Date(serverDate) : new Date();
      // Calculate the date 7 days ago
      const lastWeek = new Date(currentDate);
      lastWeek.setDate(currentDate.getDate() - 7);
      // Set to start of the day
      lastWeek.setHours(0, 0, 0, 0);
      return format(lastWeek, 'yyyy-MM-dd');
    }
    if (dateFilter === "custom" && customDateRange?.from) {
      const date = customDateRange.from;
      date.setHours(0, 0, 0, 0);
      return format(date, 'yyyy-MM-dd');
    }
    return undefined;
  };

  const getEndDate = () => {
    if (dateFilter === "today" || dateFilter === "last7days") {
      // Use serverDate if available, otherwise fall back to client time
      const date = serverDate ? new Date(serverDate) : new Date();
      // Set to end of the day
      date.setHours(23, 59, 59, 999);
      return format(date, 'yyyy-MM-dd');
    }
    if (dateFilter === "custom" && customDateRange?.to) {
      const date = customDateRange.to;
      date.setHours(23, 59, 59, 999);
      return format(date, 'yyyy-MM-dd');
    }
    return undefined;
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
        searchTerm,
        sort: sortConfig.key,
        order: sortConfig.direction
      });
      
      const response = await getSurveyData(
        itemsPerPage, 
        offset,
        sortConfig.key || null,
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

  const handleSort = (key: keyof ResponseData) => {
    if (sortConfig.key === key) {
      // Cycle through ascending -> descending -> ascending
      if (sortConfig.direction === 'ascending') {
        setSortConfig({ key, direction: 'descending' });
      } else {
        setSortConfig({ key, direction: 'ascending' });
      }
    } else {
      // Start with ascending when switching columns
      setSortConfig({ key, direction: 'ascending' });
    }
    fetchResponses();
  };

  const getSortIcon = (key: keyof ResponseData) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ChevronUp /> : <ChevronDown />;
  };

  // Update server date every hour to ensure it stays current
  useEffect(() => {
    // Initial fetch to get the server date
    fetchResponses();
    
    const updateServerDate = async () => {
      try {
        const response = await getSurveyData(1, 0);
        setServerDate(response.serverDate);
      } catch (error) {
        console.error('Error updating server date:', error);
      }
    };
    
    const interval = setInterval(updateServerDate, 60 * 60 * 1000); // Update every hour
    return () => clearInterval(interval);
  }, []); // Empty dependency array means it only runs on mount

  // Re-fetch data when date filter changes
  useEffect(() => {
    fetchResponses();
  }, [dateFilter, customDateRange]);

  // Re-fetch data when search term changes
  useEffect(() => {
    fetchResponses();
  }, [searchTerm]);

  const getBranchRespondentDateParams = () => {
    if (branchRespondentDateFilter === 'custom' && branchRespondentCustomRange) {
      return {
        dateFilter: 'custom',
        from: branchRespondentCustomRange.from ? format(branchRespondentCustomRange.from, 'yyyy-MM-dd') : undefined,
        to: branchRespondentCustomRange.to ? format(branchRespondentCustomRange.to, 'yyyy-MM-dd') : undefined,
      };
    }
    if (branchRespondentDateFilter === 'today') {
      return { dateFilter: 'today' };
    }
    if (branchRespondentDateFilter === 'last7days') {
      return { dateFilter: 'last7days' };
    }
    return { dateFilter: 'all' };
  };

  useEffect(() => {
    setLoadingBranchRespondents(true);
    const offset = (branchRespondentPage - 1) * branchRespondentPageSize;
    const params: BranchRespondentParams = {
      limit: branchRespondentPageSize,
      offset,
      sort: branchRespondentSort.col,
      order: branchRespondentSort.order,
      search: branchRespondentSearch,
      ...getBranchRespondentDateParams(),
    };
    getBranchRespondentsPaginated(params)
      .then((res) => {
        setBranchRespondents(res.data);
        setBranchRespondentTotal(res.total);
      })
      .catch(() => {
        setBranchRespondents([]);
        setBranchRespondentTotal(0);
      })
      .finally(() => setLoadingBranchRespondents(false));
  }, [branchRespondentPage, branchRespondentSort, branchRespondentSearch, branchRespondentDateFilter, branchRespondentCustomRange]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalItems / itemsPerPage)) {
      setCurrentPage(newPage);
      fetchResponses();
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return format(date, 'MMM dd, yyyy');
  };

  const formatExportDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return format(date, 'yyyy-MM-dd');
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

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

  function TellerBreakdownRows({ branch, startDate, endDate }: { branch: string, startDate?: string, endDate?: string }) {
    const [tellerRows, setTellerRows] = useState<any[]>([]);
    useEffect(() => {
      if (branch && startDate && endDate) {
        getBranchRespondentTeller(branch, startDate, endDate).then(setTellerRows);
      } else {
        setTellerRows([]);
      }
    }, [branch, startDate, endDate]);
    return (
      <>
        {tellerRows.map((teller) => (
          <TableRow key={teller.teller_id + teller.date}>
            <TableCell className="px-2 py-2">{branch}</TableCell>
            <TableCell className="px-2 py-2">{teller.teller_id}</TableCell>
            <TableCell className="px-2 py-2 text-center">{teller.teller_id_count}</TableCell>
            <TableCell className="px-2 py-2 text-center">
              {teller.date ? new Date(teller.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-6">
        <Card className="rounded-lg border bg-card text-card-foreground shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-blue-100">
            <div className="flex items-center gap-3">
              {/* Bar Chart SVG Logo (original) */}
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-blue-100">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="13" width="4" height="11" rx="2" fill="#2563eb" />
                  <rect x="10" y="8" width="4" height="16" rx="2" fill="#2563eb" fillOpacity="0.7" />
                  <rect x="16" y="4" width="4" height="20" rx="2" fill="#2563eb" fillOpacity="0.5" />
                  <rect x="22" y="17" width="2" height="7" rx="1" fill="#2563eb" fillOpacity="0.3" />
                </svg>
              </span>
              <CardTitle className="text-2xl font-bold text-blue-700 tracking-tight leading-tight">Raw Survey Data</CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <SearchInput 
                onSearch={handleSearchChange} 
                value={searchTerm}
                isLoading={isLoading}
              />
              <div className="flex items-center space-x-4">
                <Select
                  value={dateFilter}
                  onValueChange={handleDateFilterChange}
                >
                  <SelectTrigger className="w-[180px] border-blue-200 bg-white focus:ring-2 focus:ring-blue-400">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-100">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="custom">Custom Date</SelectItem>
                  </SelectContent>
                </Select>

                {dateFilter === "custom" && (
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal border-blue-200 bg-white focus:ring-2 focus:ring-blue-400",
                          !customDateRange && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                        {customDateRange?.from ? (
                          customDateRange.to ? (
                            <>
                              {format(customDateRange.from, "LLL dd, y")} -
                              {" "}
                              {format(customDateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            <span>
                              From {format(customDateRange.from, "LLL dd, y")}
                            </span>
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border-blue-100" align="start">
                      <CalendarComponent
                        mode="range"
                        className="rounded-md border border-blue-100"
                        selected={customDateRange}
                        onSelect={(date) => {
                          setCustomDateRange(date);
                          setCalendarOpen(false);
                          setCurrentPage(1);
                          setSortConfig({ key: null, direction: null });
                          fetchResponses();
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <>
                <div className="relative w-full overflow-auto rounded-b-lg">
                  <Table className="w-full text-sm border-separate border-spacing-0">
                    <TableHeader>
                      <TableRow className="bg-blue-50 text-blue-700">
                        <TableHead className="px-4 py-3 font-semibold text-blue-700 bg-blue-50 border-b border-blue-100 sticky top-0 z-10">ID</TableHead>
                        <TableHead onClick={() => handleSort('date')} className="px-4 py-3 font-semibold text-blue-700 bg-blue-50 border-b border-blue-100 cursor-pointer hover:bg-blue-100 transition">Date {getSortIcon('date')}</TableHead>
                        <TableHead onClick={() => handleSort('branch')} className="px-4 py-3 font-semibold text-blue-700 bg-blue-50 border-b border-blue-100 cursor-pointer hover:bg-blue-100 transition">Branch {getSortIcon('branch')}</TableHead>
                        <TableHead onClick={() => handleSort('teller_id')} className="px-4 py-3 font-semibold text-blue-700 bg-blue-50 border-b border-blue-100 cursor-pointer hover:bg-blue-100 transition">Teller ID {getSortIcon('teller_id')}</TableHead>
                        <TableHead onClick={() => handleSort('rating')} className="px-4 py-3 font-semibold text-blue-700 bg-blue-50 border-b border-blue-100 cursor-pointer hover:bg-blue-100 transition">Rating {getSortIcon('rating')}</TableHead>
                        <TableHead onClick={() => handleSort('sentiment')} className="px-4 py-3 font-semibold text-blue-700 bg-blue-50 border-b border-blue-100 cursor-pointer hover:bg-blue-100 transition">Sentiment {getSortIcon('sentiment')}</TableHead>
                        <TableHead className="px-4 py-3 font-semibold text-blue-700 bg-blue-50 border-b border-blue-100">Comment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map((response) => (
                        <TableRow key={response.id} className="hover:bg-blue-50 transition">
                          <TableCell className="px-4 py-3">{response.id}</TableCell>
                          <TableCell className="px-4 py-3">{formatDate(response.date)}</TableCell>
                          <TableCell className="px-4 py-3">{response.branch}</TableCell>
                          <TableCell className="px-4 py-3">{response.teller_id}</TableCell>
                          <TableCell className="px-4 py-3">
                            <span className={getRatingColor(response.rating)}>
                              {response.rating}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge className={getSentimentColor(response.sentiment)}>
                              {response.sentiment}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3">{response.comment}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-lg border bg-card text-card-foreground shadow-lg mt-8">
          <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-blue-100">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-blue-100">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="9" r="5" fill="#2563eb" fillOpacity="0.8" />
                    <ellipse cx="14" cy="21" rx="9" ry="5" fill="#2563eb" fillOpacity="0.3" />
                    <circle cx="7" cy="13" r="2.2" fill="#2563eb" fillOpacity="0.6" />
                    <ellipse cx="7" cy="22" rx="3.5" ry="2" fill="#2563eb" fillOpacity="0.18" />
                    <circle cx="21" cy="13" r="2.2" fill="#2563eb" fillOpacity="0.6" />
                    <ellipse cx="21" cy="22" rx="3.5" ry="2" fill="#2563eb" fillOpacity="0.18" />
                  </svg>
                </span>
                <div>
                  <CardTitle className="text-2xl font-semibold leading-none tracking-tight text-blue-700">Total Respondent</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">Number of respondents per branch (from branchrespondent view)</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  className="w-48 text-sm py-1 px-2 h-8 border-blue-200"
                  placeholder="Search branch..."
                  value={branchRespondentSearch}
                  onChange={e => {
                    setBranchRespondentSearch(e.target.value);
                    setBranchRespondentPage(1);
                  }}
                />
                <Select
                  value={branchRespondentDateFilter}
                  onValueChange={v => {
                    setBranchRespondentDateFilter(v as any);
                    setBranchRespondentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px] text-xs h-8 border-blue-200 bg-white focus:ring-2 focus:ring-blue-400">
                    <SelectValue placeholder="Date Filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-100">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="custom">Custom Date</SelectItem>
                  </SelectContent>
                </Select>
                {branchRespondentDateFilter === 'custom' && (
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[200px] justify-start text-left font-normal text-xs h-8 px-2 py-1 border-blue-200 bg-white focus:ring-2 focus:ring-blue-400",
                          !branchRespondentCustomRange && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {branchRespondentCustomRange?.from ? (
                          branchRespondentCustomRange.to ? (
                            <>
                              {format(branchRespondentCustomRange.from, "LLL dd, y")} - {format(branchRespondentCustomRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            <span>
                              From {format(branchRespondentCustomRange.from, "LLL dd, y")}
                            </span>
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={branchRespondentCustomRange?.from}
                        selected={branchRespondentCustomRange}
                        onSelect={range => {
                          setBranchRespondentCustomRange(range);
                          setBranchRespondentPage(1);
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-gradient-to-br from-blue-50/70 to-white rounded-b-lg shadow-inner p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2"></div>
            <div className="overflow-x-auto rounded-lg border border-blue-100 shadow-sm bg-white/90">
              <div className="relative w-full overflow-auto">
                <Table className="w-full text-xs md:text-sm">
                  <TableHeader className="bg-blue-50/80">
                    <TableRow>
                      <TableHead className="cursor-pointer select-none px-2 py-2 text-blue-700 font-semibold tracking-wide">Branch</TableHead>
                      <TableHead className="cursor-pointer select-none px-2 py-2 text-blue-700 font-semibold tracking-wide">Total Respondent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchRespondents.map((row) => (
                      <TableRow key={row.branch}>
                        <TableCell className="px-2 py-2">{row.branch}</TableCell>
                        <TableCell className="px-2 py-2 text-center">{row.total_surveys}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBranchRespondentPage((p) => Math.max(1, p - 1))}
                  disabled={branchRespondentPage === 1}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-xs md:text-sm text-muted-foreground">
                  Page {branchRespondentPage} of {Math.max(1, Math.ceil(branchRespondentTotal / branchRespondentPageSize))}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBranchRespondentPage((p) => p + 1)}
                  disabled={branchRespondentPage >= Math.ceil(branchRespondentTotal / branchRespondentPageSize)}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {branchRespondents.length > 0 && branchRespondentCustomRange?.from && branchRespondentCustomRange?.to && (
          <div className="mt-6">
            <Table className="w-full text-xs md:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2 py-2">Branch</TableHead>
                  <TableHead className="px-2 py-2">Teller ID</TableHead>
                  <TableHead className="px-2 py-2 text-center">Total Submitted</TableHead>
                  <TableHead className="px-2 py-2 text-center">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchRespondents.map((row) => (
                  <TellerBreakdownRows
                    key={row.branch}
                    branch={row.branch}
                    startDate={format(branchRespondentCustomRange.from, 'yyyy-MM-dd')}
                    endDate={format(branchRespondentCustomRange.to, 'yyyy-MM-dd')}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}

export default Reports;
