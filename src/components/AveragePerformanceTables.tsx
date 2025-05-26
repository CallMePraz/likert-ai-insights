import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import axios from "axios";
import { Trophy, AlertTriangle } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const FILTERS = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last7" },
  { label: "All Time", value: "all" },
  { label: "Custom Date", value: "custom" },
];

function getDateRange(filter: string, customRange?: {from?: Date, to?: Date}) {
  const today = new Date();
  let startDate, endDate;
  if (filter === "today") {
    startDate = endDate = today.toISOString().slice(0, 10);
  } else if (filter === "last7") {
    const last7 = new Date(today);
    last7.setDate(today.getDate() - 6);
    startDate = last7.toISOString().slice(0, 10);
    endDate = today.toISOString().slice(0, 10);
  } else if (filter === "custom" && customRange) {
    startDate = customRange.from ? customRange.from.toISOString().slice(0,10) : undefined;
    endDate = customRange.to ? customRange.to.toISOString().slice(0,10) : undefined;
  } else {
    startDate = endDate = undefined;
  }
  return { startDate, endDate };
}

const Table = ({ title, api, filter, setFilter, data, loading, page, setPage, totalPages, description, sort, setSort, customRange, setCustomRange }: any) => (
  <Card className="rounded-lg border bg-card text-card-foreground shadow-lg mb-6">
    <CardHeader className="flex flex-col space-y-1.5 p-6 pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight">{title}</CardTitle>
        </div>
      </div>
      <CardDescription className="text-sm text-muted-foreground">
        {description}
      </CardDescription>
    </CardHeader>
    <CardContent className="p-6 pt-0">
      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead>
            <tr className="bg-muted">
              <th className="px-3 py-2 border font-medium">Branch</th>
              <th className="px-3 py-2 border font-medium cursor-pointer select-none" onClick={() => setSort({col: 'avg_rating', order: sort.col === 'avg_rating' && sort.order === 'desc' ? 'asc' : 'desc'})}>
                Average Rating {sort.col === 'avg_rating' ? (sort.order === 'desc' ? '↓' : '↑') : ''}
              </th>
              <th className="px-3 py-2 border font-medium cursor-pointer select-none" onClick={() => setSort({col: 'total_surveys', order: sort.col === 'total_surveys' && sort.order === 'desc' ? 'asc' : 'desc'})}>
                Total Respondent {sort.col === 'total_surveys' ? (sort.order === 'desc' ? '↓' : '↑') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-4">Loading...</td></tr>
            ) : data && data.length > 0 ? (
              data.map((row: any) => (
                <tr key={row.branch}>
                  <td className="px-3 py-2 border">{row.branch}</td>
                  <td className="px-3 py-2 border text-center font-semibold">{typeof row.avg_rating !== 'undefined' && row.avg_rating !== null ? Number(row.avg_rating).toFixed(2) : (typeof row.average_rating !== 'undefined' && row.average_rating !== null ? Number(row.average_rating).toFixed(2) : '')}</td>
                  <td className="px-3 py-2 border text-center font-semibold">{row.total_surveys ?? ''}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={3} className="text-center py-4">No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-muted-foreground">
          Halaman {page} dari {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Sebelumnya
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AveragePerformanceTables = () => {
  const [filter, setFilter] = useState<'today' | 'last7' | 'all' | 'custom'>('last7');
  const [customRange, setCustomRange] = useState<{from?: Date, to?: Date}>({});
  const [goodData, setGoodData] = useState<any[]>([]);
  const [badData, setBadData] = useState<any[]>([]);
  const [loadingGood, setLoadingGood] = useState(false);
  const [loadingBad, setLoadingBad] = useState(false);
  const [goodSort, setGoodSort] = useState<{col: string, order: 'asc' | 'desc'}>({col: 'avg_rating', order: 'desc'});
  const [badSort, setBadSort] = useState<{col: string, order: 'asc' | 'desc'}>({col: 'avg_rating', order: 'asc'});
  const PAGE_SIZE = 6;
  const [goodPage, setGoodPage] = useState(1);
  const [badPage, setBadPage] = useState(1);

  const goodTotalPages = Math.ceil(goodData.length / PAGE_SIZE) || 1;
  const badTotalPages = Math.ceil(badData.length / PAGE_SIZE) || 1;

  const goodPaginated = goodData.slice((goodPage - 1) * PAGE_SIZE, goodPage * PAGE_SIZE);
  const badPaginated = badData.slice((badPage - 1) * PAGE_SIZE, badPage * PAGE_SIZE);

  useEffect(() => {
    const fetchGood = async () => {
      setLoadingGood(true);
      try {
        const { startDate, endDate } = getDateRange(filter, customRange);
        let url = `/api/top-performance/branch-averages?filter=${filter}&sort=${goodSort.col}&order=${goodSort.order}`;
        if (filter === 'custom' && startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        setGoodData(Array.isArray(json) ? json : []);
      } catch (e) {
        setGoodData([]);
      }
      setLoadingGood(false);
    };
    fetchGood();
  }, [filter, goodSort, customRange]);

  useEffect(() => {
    const fetchBad = async () => {
      setLoadingBad(true);
      try {
        const { startDate, endDate } = getDateRange(filter, customRange);
        let url = `/api/bad-performance/branch-averages?filter=${filter}&sort=${badSort.col}&order=${badSort.order}`;
        if (filter === 'custom' && startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        setBadData(Array.isArray(json) ? json : []);
      } catch (e) {
        setBadData([]);
      }
      setLoadingBad(false);
    };
    fetchBad();
  }, [filter, badSort, customRange]);

  useEffect(() => {
    setGoodPage(1);
    setBadPage(1);
  }, [filter]);

  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-lg mb-8">
      <CardHeader className="flex flex-col space-y-1.5 p-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Engine/server performance themed logo */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="28" height="28" rx="6" fill="#2563eb"/>
              <rect x="10" y="10" width="16" height="6" rx="2" fill="#fff" stroke="#1e293b" strokeWidth="1.2"/>
              <rect x="10" y="20" width="16" height="6" rx="2" fill="#fff" stroke="#1e293b" strokeWidth="1.2"/>
              <circle cx="13.5" cy="13" r="1" fill="#22c55e"/>
              <circle cx="13.5" cy="23" r="1" fill="#fbbf24"/>
              <rect x="18" y="13" width="6" height="2" rx="1" fill="#2563eb"/>
              <rect x="18" y="23" width="6" height="2" rx="1" fill="#2563eb"/>
              <path d="M28 18v-2a2 2 0 0 0-2-2h-2" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 18v-2a2 2 0 0 1 2-2h2" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Performance Overview</CardTitle>
          </div>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Filter and compare the average good and bad performance of IT areas.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {/* Stylish Filter Toggle - inside card */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6 p-4 bg-muted rounded-lg shadow-inner border">
          <div className="flex gap-2 items-center">
            <Select value={filter} onValueChange={(value) => {
              if (["today", "last7", "all", "custom"].includes(value)) {
                setFilter(value as "today" | "last7" | "all" | "custom");
              }
            }} disabled={loadingGood || loadingBad}>
              <SelectTrigger className="w-[160px] text-xs h-9 border-2 border-primary focus:ring-2 focus:ring-primary/60">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                {FILTERS.map(f => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filter === 'custom' && (
              <input
                type="date"
                className="border-2 border-primary rounded px-2 py-1 text-xs mx-1 focus:ring-2 focus:ring-primary/60"
                value={customRange?.from ? customRange.from.toISOString().slice(0,10) : ''}
                onChange={e => setCustomRange((r: any) => ({...r, from: e.target.value ? new Date(e.target.value) : undefined}))}
                disabled={loadingGood || loadingBad}
              />
            )}
            {filter === 'custom' && (
              <span className="mx-1">to</span>
            )}
            {filter === 'custom' && (
              <input
                type="date"
                className="border-2 border-primary rounded px-2 py-1 text-xs mx-1 focus:ring-2 focus:ring-primary/60"
                value={customRange?.to ? customRange.to.toISOString().slice(0,10) : ''}
                onChange={e => setCustomRange((r: any) => ({...r, to: e.target.value ? new Date(e.target.value) : undefined}))}
                disabled={loadingGood || loadingBad}
              />
            )}
          </div>
        </div>
        {/* Two performance tables side by side */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <Table
              title={
                <div className="flex items-center gap-2">
                  <Trophy className="w-7 h-7 text-yellow-500" />
                  Average Good Performance
                </div>
              }
              api="/api/top-performance/branch-averages"
              filter={filter}
              setFilter={setFilter}
              data={goodPaginated}
              loading={loadingGood}
              page={goodPage}
              setPage={setGoodPage}
              totalPages={goodTotalPages}
              description="Well-performing IT areas (★ ≥ 3)"
              sort={goodSort}
              setSort={setGoodSort}
              customRange={customRange}
              setCustomRange={setCustomRange}
            />
          </div>
          <div className="w-full md:w-1/2">
            <Table
              title={
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                  Average Bad Performance
                </div>
              }
              api="/api/bad-performance/branch-averages"
              filter={filter}
              setFilter={setFilter}
              data={badPaginated}
              loading={loadingBad}
              page={badPage}
              setPage={setBadPage}
              totalPages={badTotalPages}
              description="Opportunities for IT improvement (★ < 3)"
              sort={badSort}
              setSort={setBadSort}
              customRange={customRange}
              setCustomRange={setCustomRange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AveragePerformanceTables;
