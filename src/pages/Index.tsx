
import { Navbar } from "@/components/Navbar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricsCards } from "@/components/MetricsCards";
import { SentimentAnalysis } from "@/components/SentimentAnalysis";
import { TopInsightsArea } from "@/components/TopInsightsArea";
import { DataTable } from "@/components/DataTable";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto p-4 md:p-6">
        <DashboardHeader />
        <MetricsCards />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SentimentAnalysis />
          <div className="md:col-span-2">
            <div className="h-full flex items-center justify-center p-6 border rounded-md bg-card card-shadow">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">AI-Powered Trend Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Historical data with predictive insights for future trends
                </p>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-md inline-block">
                  <p className="text-sm">Chart visualization will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <TopInsightsArea />
        <DataTable />
      </div>
      
      <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground">
        <p>© 2025 Likert.AI Insights Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
