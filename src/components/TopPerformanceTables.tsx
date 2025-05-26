import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp, ChevronUp, ChevronDown, BarChart3, ListFilter } from "lucide-react";
import { getSurveyData, getTopPerformance, getBadPerformance } from "../services/api";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
}

const FILTERS = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last7" },
  { label: "All Time", value: "all" },
];

// Mock response data shared with Reports page
const responseData = [
  {
    id: 1001,
    date: "2025-04-10",
    rating: 5,
    comment: "Excellent service, the staff was very helpful and knowledgeable.",
    branch: "Downtown",
    channel: "in-person",
    sentiment: "positive",
    parameter: "Staff Friendliness"
  },
  {
    id: 1002,
    date: "2025-04-10",
    rating: 2,
    comment: "Had to wait for over 30 minutes to be served. Unacceptable.",
    branch: "Westside",
    channel: "in-person",
    sentiment: "negative",
    parameter: "Wait Times"
  },
  {
    id: 1003,
    date: "2025-04-09",
    rating: 4,
    comment: "Mobile app works great, but could use more features.",
    branch: "Online",
    channel: "mobile",
    sentiment: "positive",
    parameter: "Mobile Experience"
  },
  {
    id: 1004,
    date: "2025-04-09",
    rating: 3,
    comment: "Average experience. Nothing special to note.",
    branch: "Northgate",
    channel: "in-person",
    sentiment: "neutral",
    parameter: "Problem Resolution"
  },
  {
    id: 1005,
    date: "2025-04-08",
    rating: 1,
    comment: "App keeps crashing when trying to make a transfer. Very frustrating!",
    branch: "Online",
    channel: "mobile",
    sentiment: "negative",
    parameter: "App Reliability"
  },
  {
    id: 1006,
    date: "2025-04-08",
    rating: 5,
    comment: "The representative went above and beyond to help me resolve my issue.",
    branch: "Eastside",
    channel: "phone",
    sentiment: "positive",
    parameter: "Service Speed"
  },
  {
    id: 1007,
    date: "2025-04-07",
    rating: 4,
    comment: "Quick and efficient service. Would recommend.",
    branch: "Downtown",
    channel: "in-person",
    sentiment: "positive",
    parameter: "Service Speed"
  },
  {
    id: 1008,
    date: "2025-04-07",
    rating: 1,
    comment: "Terrible service. Will not be returning.",
    branch: "Westside",
    channel: "in-person",
    sentiment: "negative",
    parameter: "Fee Transparency"
  },
  {
    id: 1009,
    date: "2025-04-06",
    rating: 3,
    comment: "Service was okay. Nothing special but got the job done.",
    branch: "Downtown",
    channel: "in-person",
    sentiment: "neutral",
    parameter: "Account Access"
  },
  {
    id: 1010,
    date: "2025-04-06",
    rating: 5,
    comment: "Great experience! The new self-service kiosks are amazing.",
    branch: "Eastside",
    channel: "in-person",
    sentiment: "positive",
    parameter: "Product Knowledge"
  },
  {
    id: 1011,
    date: "2025-04-05",
    rating: 2,
    comment: "Website is confusing to navigate. Could not find what I needed.",
    branch: "Online",
    channel: "web",
    sentiment: "negative",
    parameter: "Issue Escalation"
  },
  {
    id: 1012,
    date: "2025-04-05",
    rating: 4,
    comment: "Representative was very patient with all my questions.",
    branch: "Northgate",
    channel: "phone",
    sentiment: "positive",
    parameter: "Product Knowledge"
  }
];

// Process data for good performance (rating >= 3)
const goodPerformanceData = responseData
  .filter(item => item.rating >= 3)
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 5)
  .map(item => ({
    parameter: item.parameter,
    rating: item.rating,
    change: "+0.3", // Placeholder for now
    trend: "up"
  }));

// Process data for bad performance (rating < 3)
const badPerformanceData = responseData
  .filter(item => item.rating < 3)
  .sort((a, b) => a.rating - b.rating)
  .slice(0, 5)
  .map(item => ({
    parameter: item.parameter,
    rating: item.rating,
    change: "-0.3", // Placeholder for now
    trend: "down"
  }));

// Positive insights for cards
const positiveInsights = goodPerformanceData.map(item => {
  // Get corresponding response for AI insight
  const relatedResponse = responseData.find(resp => resp.parameter === item.parameter && resp.rating >= 3);
  return {
    parameter: item.parameter,
    rating: item.rating,
    aiInsight: relatedResponse 
      ? `Customer feedback: "${relatedResponse.comment.substring(0, 60)}${relatedResponse.comment.length > 60 ? '...' : ''}"`
      : "Consistently rated highly by customers."
  };
});

// Improvement areas for cards
const improvementAreas = badPerformanceData.map(item => {
  // Get corresponding response for AI suggestion
  const relatedResponse = responseData.find(resp => resp.parameter === item.parameter && resp.rating < 3);
  return {
    parameter: item.parameter,
    rating: item.rating,
    aiInsight: relatedResponse
      ? `Based on feedback: "${relatedResponse.comment.substring(0, 60)}${relatedResponse.comment.length > 60 ? '...' : ''}"`
      : "Consider investigating reasons for low ratings."
  };
});

export function TopPerformanceTables() {
  const [filter, setFilter] = useState("today");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 5;

  const [negFilter, setNegFilter] = useState("today");
  const [negData, setNegData] = useState([]);
  const [negLoading, setNegLoading] = useState(false);
  const [negError, setNegError] = useState("");
  const [negPage, setNegPage] = useState(1);
  const [negTotalCount, setNegTotalCount] = useState(0);
  const NEG_PAGE_SIZE = 5;

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [negSortOrder, setNegSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      let startDate: string | undefined = undefined;
      let endDate: string | undefined = undefined;
      const today = new Date();
      if (filter === "today") {
        startDate = today.toISOString().slice(0, 10);
        endDate = startDate;
      } else if (filter === "last7") {
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 6);
        startDate = last7.toISOString().slice(0, 10);
        endDate = today.toISOString().slice(0, 10);
      }
      try {
        const response = await getTopPerformance(PAGE_SIZE, (page - 1) * PAGE_SIZE, "rating", sortOrder, startDate, endDate);
        setData(response.data);
        setTotalCount(response.totalCount);
      } catch (e) {
        setError("Gagal memuat data performa.");
      }
      setLoading(false);
    }
    fetchData();
  }, [filter, page, sortOrder]);

  useEffect(() => {
    async function fetchNegData() {
      setNegLoading(true);
      setNegError("");
      let startDate: string | undefined = undefined;
      let endDate: string | undefined = undefined;
      const today = new Date();
      if (negFilter === "today") {
        startDate = today.toISOString().slice(0, 10);
        endDate = startDate;
      } else if (negFilter === "last7") {
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 6);
        startDate = last7.toISOString().slice(0, 10);
        endDate = today.toISOString().slice(0, 10);
      }
      try {
        const response = await getBadPerformance(NEG_PAGE_SIZE, (negPage - 1) * NEG_PAGE_SIZE, "rating", negSortOrder, startDate, endDate);
        setNegData(response.data);
        setNegTotalCount(response.totalCount);
      } catch (e) {
        setNegError("Gagal memuat data performa.");
      }
      setNegLoading(false);
    }
    fetchNegData();
  }, [negFilter, negPage, negSortOrder]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const negTotalPages = Math.ceil(negTotalCount / NEG_PAGE_SIZE);

  return (
    <div>
    </div>
  );
}
