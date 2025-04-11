
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Download, Filter, Search } from "lucide-react";

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

export function DataTable() {
  // Mock data for the table
  const responses: ResponseData[] = [
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
  ];

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
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Recent Responses</CardTitle>
            <CardDescription>Latest feedback from customers</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search responses..."
                className="w-full md:w-64 pl-8"
              />
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
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
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="w-[300px]">Comment</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Sentiment</TableHead>
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
            Showing <span className="font-medium">7</span> of{" "}
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
  );
}
