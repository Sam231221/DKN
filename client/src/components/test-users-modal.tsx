import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minimize2, Maximize2, Users, Copy, Check } from "lucide-react";
import { DUMMY_USERS } from "@/lib/dummy-users";
import { getRoleBadgeColor, getRoleDisplayName } from "@/lib/permissions";
import type { UserRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function TestUsersModal() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Select 3 users with distinct roles: administrator, knowledge_champion, and employee
  const testUsers = [
    DUMMY_USERS.find(u => u.role === "administrator")!,
    DUMMY_USERS.find(u => u.role === "knowledge_champion")!,
    DUMMY_USERS.find(u => u.role === "employee")!,
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="shadow-lg rounded-lg"
          size="lg"
        >
          <Users className="mr-2 h-4 w-4" />
          Test Users
          <Maximize2 className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[400px] max-h-[600px] bg-background border rounded-lg shadow-2xl flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Test User Credentials
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(true)}
          className="h-8 w-8 p-0"
        >
          <Minimize2 className="h-4 w-4" />
          <span className="sr-only">Minimize</span>
        </Button>
      </div>

      <div className="overflow-y-auto p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Use these credentials to test the application with different user roles:
        </p>

        {testUsers.map((user, index) => (
          <Card key={user.email} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base mb-2">{user.name}</CardTitle>
                  <Badge 
                    className={cn("text-xs", getRoleBadgeColor(user.role as UserRole))}
                  >
                    {getRoleDisplayName(user.role as UserRole)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
                      {user.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(user.email, index * 2)}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    {copiedIndex === index * 2 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Password</p>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {user.password}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(user.password, index * 2 + 1)}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    {copiedIndex === index * 2 + 1 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
