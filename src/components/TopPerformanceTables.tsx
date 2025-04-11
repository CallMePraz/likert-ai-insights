
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp, ChevronUp, ChevronDown, BarChart3, ListFilter } from "lucide-react";

// Mock data
const goodPerformanceData = [
  { parameter: "Staff Friendliness", rating: 4.8, change: "+0.3", trend: "up" },
  { parameter: "Service Speed", rating: 4.6, change: "+0.5", trend: "up" },
  { parameter: "Mobile Experience", rating: 4.5, change: "+0.2", trend: "up" },
  { parameter: "Problem Resolution", rating: 4.3, change: "+0.1", trend: "up" },
  { parameter: "Product Knowledge", rating: 4.2, change: "+0.4", trend: "up" }
];

const badPerformanceData = [
  { parameter: "Wait Times", rating: 2.4, change: "-0.3", trend: "down" },
  { parameter: "App Reliability", rating: 2.6, change: "-0.4", trend: "down" },
  { parameter: "Fee Transparency", rating: 2.7, change: "-0.2", trend: "down" },
  { parameter: "Account Access", rating: 2.9, change: "-0.1", trend: "down" },
  { parameter: "Issue Escalation", rating: 3.0, change: "-0.3", trend: "down" }
];

// Positive insights for cards
const positiveInsights = [
  { 
    parameter: "Staff Friendliness", 
    rating: 4.8,
    aiInsight: "Consistently mentioned as exceptional across all branches."
  },
  { 
    parameter: "Service Speed", 
    rating: 4.6,
    aiInsight: "Improved 15% from previous quarter after new queue system."
  },
  { 
    parameter: "Mobile Experience", 
    rating: 4.5,
    aiInsight: "Recent app update received very positive feedback."
  },
  { 
    parameter: "Problem Resolution", 
    rating: 4.3,
    aiInsight: "First-contact resolution rate has increased significantly."
  },
  { 
    parameter: "Product Knowledge", 
    rating: 4.2,
    aiInsight: "Staff training program shows measurable results."
  }
];

// Improvement areas for cards
const improvementAreas = [
  { 
    parameter: "Wait Times", 
    rating: 2.4,
    aiInsight: "Consider adding more staff during peak hours (12-2pm)."
  },
  { 
    parameter: "App Reliability", 
    rating: 2.6,
    aiInsight: "Frequent crashes reported on Android devices."
  },
  { 
    parameter: "Fee Transparency", 
    rating: 2.7,
    aiInsight: "Customers request clearer explanation of service fees."
  },
  { 
    parameter: "Account Access", 
    rating: 2.9,
    aiInsight: "Login process considered too complex by many users."
  },
  { 
    parameter: "Issue Escalation", 
    rating: 3.0,
    aiInsight: "Need better process for handling complex complaints."
  }
];

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
