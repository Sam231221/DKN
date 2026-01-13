import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface ContributorsFiltersProps {
  onFiltersChange?: (filters: { role?: string; status?: string; search?: string }) => void
}

export function ContributorsFilters({ onFiltersChange = () => {} }: ContributorsFiltersProps) {
  const [role, setRole] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")
  const [search, setSearch] = useState<string>("")

  useEffect(() => {
    const filters: { role?: string; status?: string; search?: string } = {}
    if (role && role !== "all") {
      filters.role = role
    }
    if (status && status !== "all") {
      filters.status = status
    }
    if (search.trim()) {
      filters.search = search.trim()
    }
    onFiltersChange(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, status, search])

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contributors..."
          className="pl-10 bg-background"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Select value={role} onValueChange={setRole}>
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
      <Select value={status} onValueChange={setStatus}>
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
