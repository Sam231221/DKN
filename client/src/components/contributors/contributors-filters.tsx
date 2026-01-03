import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function ContributorsFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search contributors..." className="pl-10 bg-background" />
      </div>
      <Select defaultValue="all">
        <SelectTrigger className="w-full sm:w-[180px] bg-background">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="client">Client</SelectItem>
          <SelectItem value="employee">Employee</SelectItem>
          <SelectItem value="consultant">Consultant</SelectItem>
          <SelectItem value="knowledge_champion">Knowledge Champion</SelectItem>
          <SelectItem value="administrator">Administrator</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="active">
        <SelectTrigger className="w-full sm:w-[180px] bg-background">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="all">All Status</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
