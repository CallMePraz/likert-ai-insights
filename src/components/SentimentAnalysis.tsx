import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StarDistribution {
  star: number;
  count: number;
  percent: number;
}

export function SentimentAnalysis() {
  const [distribution, setDistribution] = useState<StarDistribution[]>([]);
  const [total, setTotal] = useState(0);
  const [aiSentiment, setAiSentiment] = useState({ positive: 0, neutral: 0, negative: 0 });

  useEffect(() => {
    axios.get("/api/sentiment-distribution").then(res => {
      setDistribution(res.data.distribution);
      setTotal(res.data.total);
    });
    axios.get("/api/ai-sentiment-analysis").then(res => {
      setAiSentiment({
        positive: res.data.positive,
        neutral: res.data.neutral,
        negative: res.data.negative
      });
    });
  }, []);

  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-lg h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold leading-tight">Sentiment Distribution</CardTitle>
        <CardDescription className="text-sm">Rating breakdown across all responses</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-3 px-6">
        <div className="space-y-3">
          {distribution.map((item) => (
            <div key={item.star} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="font-semibold text-base">{item.star} ★</span>
                  <span className="text-muted-foreground text-sm ml-2">({item.count})</span>
                </div>
                <span className="text-sm font-semibold">{item.percent}%</span>
              </div>
              <Progress value={item.percent} className={getColor(item.star) + " h-4"} />
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h4 className="text-sm font-semibold mb-2">AI Sentiment Analysis</h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
              <p className="text-xs text-muted-foreground">Positive</p>
              <p className="font-bold text-likert-positive text-base">{aiSentiment.positive}%</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
              <p className="text-xs text-muted-foreground">Neutral</p>
              <p className="font-bold text-likert-neutral text-base">{aiSentiment.neutral}%</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded">
              <p className="text-xs text-muted-foreground">Negative</p>
              <p className="font-bold text-likert-negative text-base">{aiSentiment.negative}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getColor(star: number) {
  switch (star) {
    case 5:
      return "bg-green-500";
    case 4:
      return "bg-emerald-400";
    case 3:
      return "bg-yellow-400";
    case 2:
      return "bg-orange-400";
    case 1:
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}
