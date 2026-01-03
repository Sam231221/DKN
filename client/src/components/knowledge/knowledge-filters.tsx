import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function KnowledgeFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search knowledge items..." className="pl-10 bg-background" />
      </div>
      <Select defaultValue="all">
        <SelectTrigger className="w-full sm:w-[180px] bg-background">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="documentation">Documentation</SelectItem>
          <SelectItem value="guidelines">Guidelines</SelectItem>
          <SelectItem value="training">Training</SelectItem>
          <SelectItem value="client">Client</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="recent">
        <SelectTrigger className="w-full sm:w-[180px] bg-background">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="relevant">Most Relevant</SelectItem>
          <SelectItem value="alphabetical">Alphabetical</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
