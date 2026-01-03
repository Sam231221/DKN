import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, MessageSquare, Star, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileDropdown } from "./profile-dropdown";

interface DailyDevTopbarProps {
  user: any;
}

export function DailyDevTopbar({ user }: DailyDevTopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 gap-4">
        {/* Left: Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">DKN</span>
          </div>
          <span className="text-lg font-semibold">Knowledge Network</span>
        </Link>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-20 bg-muted/50 border-0 focus-visible:ring-1 w-full"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>

        {/* Right: Icons and Profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
              0
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
              0
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Star className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
              10
            </span>
          </Button>
          <ProfileDropdown user={user} />
        </div>
      </div>
    </header>
  );
}

