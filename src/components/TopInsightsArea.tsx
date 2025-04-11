
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsDown, ThumbsUp } from "lucide-react";

export function TopInsightsArea() {
  // Mock data for positive insights
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

  // Mock data for improvement areas
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <ThumbsUp className="w-5 h-5 mr-2 text-likert-positive" />
            <CardTitle>Top Positive Parameters</CardTitle>
          </div>
          <CardDescription>Areas where we're excelling (★ ≥ 3)</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <ThumbsDown className="w-5 h-5 mr-2 text-likert-negative" />
            <CardTitle>Top Improvement Areas</CardTitle>
          </div>
          <CardDescription>Areas needing attention (★ &lt; 3)</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
