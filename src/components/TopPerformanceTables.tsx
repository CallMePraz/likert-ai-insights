
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp, ChevronUp, ChevronDown, BarChart3, ListFilter } from "lucide-react";

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
  const [showPositiveTable, setShowPositiveTable] = useState(false);
  const [showNegativeTable, setShowNegativeTable] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Top positive performance card with flip functionality */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ThumbsUp className="w-5 h-5 mr-2 text-likert-positive" />
              <CardTitle>Top Positive Parameters</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowPositiveTable(!showPositiveTable)}
              className="h-8 w-8 p-0"
            >
              {showPositiveTable ? <ListFilter className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
            </Button>
          </div>
          <CardDescription>Areas where we're excelling (★ ≥ 3)</CardDescription>
        </CardHeader>
        <CardContent>
          {!showPositiveTable ? (
            // Card view - regular insights
            <div className="space-y-4">
              {positiveInsights.map((item, index) => (
                <div key={index} className="insight-card p-3 rounded-md border bg-card">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">{item.parameter}</h4>
                    <div className="flex items-center bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                      <span className="text-likert-positive font-medium">{item.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">/ 5</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">AI Insight:</span> {item.aiInsight}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            // Table view - performance data
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goodPerformanceData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.parameter}</TableCell>
                      <TableCell className="text-right">{item.rating}</TableCell>
                      <TableCell className="text-right text-likert-positive">
                        {item.change}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.trend === "up" ? (
                          <ChevronUp className="inline h-4 w-4 text-likert-positive" />
                        ) : (
                          <ChevronDown className="inline h-4 w-4 text-likert-negative" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top improvement areas card with flip functionality */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ThumbsDown className="w-5 h-5 mr-2 text-likert-negative" />
              <CardTitle>Top Improvement Areas</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowNegativeTable(!showNegativeTable)}
              className="h-8 w-8 p-0"
            >
              {showNegativeTable ? <ListFilter className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
            </Button>
          </div>
          <CardDescription>Areas needing attention (★ &lt; 3)</CardDescription>
        </CardHeader>
        <CardContent>
          {!showNegativeTable ? (
            // Card view - regular insights
            <div className="space-y-4">
              {improvementAreas.map((item, index) => (
                <div key={index} className="insight-card p-3 rounded-md border bg-card">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">{item.parameter}</h4>
                    <div className="flex items-center bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">
                      <span className="text-likert-negative font-medium">{item.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">/ 5</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">AI Suggestion:</span> {item.aiInsight}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            // Table view - performance data
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {badPerformanceData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.parameter}</TableCell>
                      <TableCell className="text-right">{item.rating}</TableCell>
                      <TableCell className="text-right text-likert-negative">
                        {item.change}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.trend === "up" ? (
                          <ChevronUp className="inline h-4 w-4 text-likert-positive" />
                        ) : (
                          <ChevronDown className="inline h-4 w-4 text-likert-negative" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
