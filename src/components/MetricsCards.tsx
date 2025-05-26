import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, BarChart3, MessagesSquare, Star, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getSurveyData } from "@/services/api";

export function MetricsCards() {
  const [totalResponses, setTotalResponses] = useState<number | null>(null);
  const [commentsCount, setCommentsCount] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [averageSentiment, setAverageSentiment] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const response = await getSurveyData(10000, 0); // Fetch a large batch to get all ratings, comments, sentiments
        setTotalResponses(response.totalCount);
        // Count records with non-empty comment
        const comments = response.data.filter(item => item.comment && item.comment.trim() !== "");
        setCommentsCount(comments.length);
        // Calculate average rating
        const ratings = response.data.map(item => item.rating).filter(r => typeof r === "number");
        const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
        setAverageRating(avg);
        // Calculate average sentiment (positive=1, neutral=0.5, negative=0)
        const sentimentMap = { positive: 1, neutral: 0.5, negative: 0 };
        const sentimentScores = response.data
          .map(item => sentimentMap[item.sentiment])
          .filter(s => typeof s === "number");
        const avgSentiment = sentimentScores.length > 0 ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length : null;
        setAverageSentiment(avgSentiment);
        setError(null);
      } catch (err) {
        setError("Failed to fetch metrics");
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="rounded-lg border bg-card text-card-foreground shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-6 w-6 mr-2 text-yellow-500" />
              <span className="text-2xl font-bold">
                {loading ? "..." : error ? "-" : averageRating !== null ? averageRating.toFixed(1) : 0}
              </span>
              <span className="text-sm text-muted-foreground ml-1">/5</span>
            </div>
            <div className="flex items-center text-positive">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">3.2%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Compared to previous period</p>
        </CardContent>
      </Card>

      <Card className="rounded-lg border bg-card text-card-foreground shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-primary" />
              <span className="text-2xl font-bold">
                {loading ? "..." : error ? "-" : totalResponses?.toLocaleString() ?? 0}
              </span>
            </div>
            <div className="flex items-center text-positive">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">12.5%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total responses this period</p>
        </CardContent>
      </Card>

      <Card className="rounded-lg border bg-card text-card-foreground shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Sentiment Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-likert-positive" />
              <span className="text-2xl font-bold">
                {loading ? "..." : error ? "-" : averageSentiment !== null ? `${Math.round(averageSentiment * 100)}%` : "0%"}
              </span>
            </div>
            <div className="flex items-center text-negative">
              <ArrowDown className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">2.1%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Overall positive sentiment</p>
        </CardContent>
      </Card>

      <Card className="rounded-lg border bg-card text-card-foreground shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Comments Received</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessagesSquare className="h-6 w-6 mr-2 text-blue-500" />
              <span className="text-2xl font-bold">
                {loading ? "..." : error ? "-" : commentsCount?.toLocaleString() ?? 0}
              </span>
            </div>
            <div className="flex items-center text-positive">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">8.7%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Free-text responses analyzed</p>
        </CardContent>
      </Card>
    </div>
  );
}
