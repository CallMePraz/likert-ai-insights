
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function SentimentAnalysis() {
  // Mock data for sentiment distribution
  const sentimentData = [
    { rating: 5, count: 1250, percentage: 45, color: "bg-green-500" },
    { rating: 4, count: 850, percentage: 30, color: "bg-emerald-400" },
    { rating: 3, count: 420, percentage: 15, color: "bg-yellow-400" },
    { rating: 2, count: 180, percentage: 7, color: "bg-orange-400" },
    { rating: 1, count: 95, percentage: 3, color: "bg-red-500" },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
        <CardDescription>Rating breakdown across all responses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sentimentData.map((item) => (
            <div key={item.rating} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="font-medium">{item.rating} ★</span>
                  <span className="text-muted-foreground text-sm ml-2">({item.count})</span>
                </div>
                <span className="text-sm font-medium">{item.percentage}%</span>
              </div>
              <Progress value={item.percentage} className={item.color} />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">AI Sentiment Analysis</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
              <p className="text-xs text-muted-foreground">Positive</p>
              <p className="font-medium text-likert-positive">72%</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
              <p className="text-xs text-muted-foreground">Neutral</p>
              <p className="font-medium text-likert-neutral">19%</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded">
              <p className="text-xs text-muted-foreground">Negative</p>
              <p className="font-medium text-likert-negative">9%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
