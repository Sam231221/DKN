import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface KnowledgeFiltersProps {
  onTypeChange?: (type: string) => void;
  onSearchChange?: (search: string) => void;
  type?: string;
  search?: string;
}

export function KnowledgeFilters({ onTypeChange, onSearchChange, type, search }: KnowledgeFiltersProps) {
  const [searchValue, setSearchValue] = useState(search || "");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search knowledge items..." 
          className="pl-10 bg-background"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      <Select value={type || "all"} onValueChange={(value) => {
        if (onTypeChange) {
          onTypeChange(value === "all" ? undefined : value);
        }
      }}>
        <SelectTrigger className="w-full sm:w-[180px] bg-background">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="documentation">Documentation</SelectItem>
          <SelectItem value="best_practices">Best Practices</SelectItem>
          <SelectItem value="procedure">Procedure</SelectItem>
          <SelectItem value="training">Training</SelectItem>
          <SelectItem value="project_knowledge">Project Knowledge</SelectItem>
          <SelectItem value="client_content">Client Content</SelectItem>
          <SelectItem value="technical">Technical</SelectItem>
          <SelectItem value="policy">Policy</SelectItem>
          <SelectItem value="guideline">Guideline</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
