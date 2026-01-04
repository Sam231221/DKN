import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type FilterType = "popular" | "upvotes" | "comments" | "date"

interface FilterTabsProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

const filters: { id: FilterType; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "upvotes", label: "By upvotes" },
  { id: "comments", label: "By comments" },
  { id: "date", label: "By date" },
]

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant="ghost"
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "rounded-none border-b-2 border-transparent px-4 py-3 -mb-px font-medium",
            activeFilter === filter.id
              ? "border-primary text-primary bg-transparent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}

