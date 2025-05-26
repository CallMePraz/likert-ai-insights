import { Navbar } from "@/components/Navbar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricsCards } from "@/components/MetricsCards";
import { SentimentAnalysis } from "@/components/SentimentAnalysis";
import { TopInsightsArea } from "@/components/TopInsightsArea";
import { IndonesiaMap } from "@/components/IndonesiaMap";
import { TopPerformanceTables } from "@/components/TopPerformanceTables";
import AveragePerformanceTables from "@/components/AveragePerformanceTables";

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
            <IndonesiaMap />
          </div>
        </div>
        {/* Add Average Good/Bad Performance Tables Here */}
        <AveragePerformanceTables />
        <TopPerformanceTables />
      </div>
      <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground">
        <p> 2025 Likert.AI Insights Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
