import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";

interface Repository {
  id: string;
  name: string;
  description: string | null;
}

interface RepositorySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  required?: boolean;
}

export function RepositorySelect({
  value,
  onValueChange,
  required = false,
}: RepositorySelectProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const token = localStorage.getItem("dkn_token");
        
        const response = await fetch(`${API_BASE_URL}/repositories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch repositories");
        }

        const result = await response.json();
        setRepositories(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load repositories");
        console.error("Error fetching repositories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Repository</Label>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading repositories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label>Repository</Label>
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="repository">
        Repository {required && <span className="text-destructive">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange} required={required}>
        <SelectTrigger id="repository" className="bg-background">
          <SelectValue placeholder="Select a repository" />
        </SelectTrigger>
        <SelectContent>
          {repositories.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No repositories available
            </div>
          ) : (
            repositories.map((repo) => (
              <SelectItem key={repo.id} value={repo.id}>
                <div className="flex flex-col">
                  <span>{repo.name}</span>
                  {repo.description && (
                    <span className="text-xs text-muted-foreground">
                      {repo.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

