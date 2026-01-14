import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import {
  fetchActivityFeed,
  type ActivityFeedItem,
} from "@/lib/api";
import { ActivityFeed } from "./activity-feed";

interface GlobalActivityFeedProps {
  projectId?: string;
  limit?: number;
}

export function GlobalActivityFeed({
  projectId,
  limit = 50,
}: GlobalActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [projectId, limit]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedActivities = await fetchActivityFeed({
        limit,
        projectId,
      });
      setActivities(fetchedActivities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity");
      console.error("Error fetching activity feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Activity Feed</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
      <ActivityFeed activities={activities} loading={loading} />
    </Card>
  );
}
