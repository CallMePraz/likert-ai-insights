
import { Bell, HelpCircle, Search, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <nav className="border-b border-border px-4 py-3 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-xl font-bold text-primary mr-8">Likert.AI Insights</div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-sm font-medium hover:text-primary">Dashboard</a>
            <a href="#" className="text-sm font-medium hover:text-primary">Reports</a>
            <a href="#" className="text-sm font-medium hover:text-primary">Analytics</a>
            <a href="#" className="text-sm font-medium hover:text-primary">Management</a>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-64 pl-8"
            />
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon">
            <UserCircle className="h-5 w-5" />
          </Button>
        </div>

        <div className="md:hidden flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon">
            <UserCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
