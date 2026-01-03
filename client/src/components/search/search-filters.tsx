import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

export function SearchFilters() {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="font-semibold mb-4">Filters</h3>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Category</Label>
          <div className="space-y-2">
            {["Documentation", "Guidelines", "Training", "Technical", "Client", "Security"].map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox id={category} />
                <label htmlFor={category} className="text-sm cursor-pointer">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Validation Status</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="validated" defaultChecked />
              <label htmlFor="validated" className="text-sm cursor-pointer">
                Validated Only
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="unvalidated" />
              <label htmlFor="unvalidated" className="text-sm cursor-pointer">
                Include Unvalidated
              </label>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="space-y-2">
            {["Last 7 days", "Last 30 days", "Last 90 days", "All time"].map((range) => (
              <div key={range} className="flex items-center space-x-2">
                <Checkbox id={range} />
                <label htmlFor={range} className="text-sm cursor-pointer">
                  {range}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Minimum Relevance</Label>
          <input type="range" min="50" max="100" defaultValue="80" className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
