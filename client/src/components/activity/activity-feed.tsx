import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  MessageSquare,
  UserPlus,
  Edit,
  Loader2,
} from "lucide-react";
import { formatDate, type ActivityFeedItem, type WorkspaceActivity } from "@/lib/api";

interface ActivityFeedProps {
  activities: (ActivityFeedItem | WorkspaceActivity)[];
  loading?: boolean;
}

export function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "knowledge_created":
        return <FileText className="h-4 w-4" />;
      case "comment_added":
        return <MessageSquare className="h-4 w-4" />;
      case "member_added":
        return <UserPlus className="h-4 w-4" />;
      case "knowledge_updated":
        return <Edit className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "knowledge_created":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "comment_added":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "member_added":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "knowledge_updated":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="flex-shrink-0">
            <div
              className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}
            >
              {getActivityIcon(activity.type)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={activity.user?.avatar || activity.author?.avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {(activity.user?.name || activity.author?.name || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">
                  {activity.user?.name || activity.author?.name || "Unknown"}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${getActivityColor(activity.type)}`}
                >
                  {activity.type.replace("_", " ")}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(activity.createdAt)}
              </span>
            </div>
            <p className="text-sm font-medium mb-1">{activity.title}</p>
            {activity.description && (
              <p className="text-sm text-muted-foreground">
                {activity.description}
              </p>
            )}
            {activity.content && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {activity.content}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
