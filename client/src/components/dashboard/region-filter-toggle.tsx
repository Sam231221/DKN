import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin } from "lucide-react";
import { useRegionalOffice } from "@/contexts/RegionalOfficeContext";
import { cn } from "@/lib/utils";

export function RegionFilterToggle() {
  const { selectedOffice, isGlobalView, toggleGlobalView, canAccessGlobalView } = useRegionalOffice();

  if (!canAccessGlobalView || !selectedOffice) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 text-xs",
          !isGlobalView && "bg-primary/10 border-primary/20 text-primary"
        )}
      >
        <MapPin className="h-3 w-3" />
        {selectedOffice.region 
          ? `${selectedOffice.name} - ${selectedOffice.region}`
          : selectedOffice.name}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleGlobalView}
        className="h-7 text-xs"
      >
        {isGlobalView ? (
          <>
            <MapPin className="h-3 w-3 mr-1" />
            Regional
          </>
        ) : (
          <>
            <Globe className="h-3 w-3 mr-1" />
            Global
          </>
        )}
      </Button>
    </div>
  );
}
