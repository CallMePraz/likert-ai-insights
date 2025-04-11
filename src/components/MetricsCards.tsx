
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, BarChart3, MessagesSquare, Star, TrendingUp, Users } from "lucide-react";

export function MetricsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-6 w-6 mr-2 text-yellow-500" />
              <span className="text-2xl font-bold">4.2</span>
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-primary" />
              <span className="text-2xl font-bold">3,842</span>
            </div>
            <div className="flex items-center text-positive">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">12.5%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total responses this period</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Sentiment Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-likert-positive" />
              <span className="text-2xl font-bold">76%</span>
            </div>
            <div className="flex items-center text-negative">
              <ArrowDown className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">2.1%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Overall positive sentiment</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Comments Received</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessagesSquare className="h-6 w-6 mr-2 text-blue-500" />
              <span className="text-2xl font-bold">1,259</span>
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
