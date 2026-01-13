import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Plus, Loader2 } from "lucide-react";
import { useRegionalOffice, type RegionalOffice } from "@/contexts/RegionalOfficeContext";
import { fetchAvailableRegionalOffices } from "@/lib/api";

interface TeamsDropdownProps {
  user: any;
}

export function TeamsDropdown({ user }: TeamsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    selectedOffice,
    availableOffices,
    setSelectedOffice,
    setAvailableOffices,
  } = useRegionalOffice();

  // Fetch available regional offices on mount
  useEffect(() => {
    // Only load if offices haven't been loaded yet
    if (availableOffices.length > 0) {
      setLoading(false);
      return;
    }

    const loadOffices = async () => {
      try {
        setLoading(true);
        const offices = await fetchAvailableRegionalOffices();
        setAvailableOffices(offices);

        // If no office is selected, select the first available or user's region
        // Check localStorage first to avoid overwriting user's selection
        const savedOffice = localStorage.getItem("dkn_selected_office");
        if (!savedOffice && offices.length > 0) {
          const userRegionId = (user as any)?.regionId;
          const matchingOffice = userRegionId 
            ? offices.find((o) => o.id === userRegionId) || offices[0]
            : offices[0];
          setSelectedOffice(matchingOffice);
        }
      } catch (error) {
        console.error("Failed to load regional offices:", error);
        // Fallback - just use first available office
        if (availableOffices.length > 0) {
          const savedOffice = localStorage.getItem("dkn_selected_office");
          if (!savedOffice) {
            setSelectedOffice(availableOffices[0]);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadOffices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const selectedTeam = selectedOffice || {
    id: "default",
    name: user.organizationName || "Velion Dynamics",
    region: "Global",
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleTeamSelect = (office: RegionalOffice) => {
    setSelectedOffice(office);
    setIsOpen(false);
  };

  const userInitial = selectedTeam.name[0]?.toUpperCase() || "T";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors min-w-0"
      >
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary">{userInitial}</span>
        </div>
        <div className="min-w-0 hidden sm:block">
          <p className="text-sm font-medium truncate max-w-[200px]">
            {selectedTeam.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{selectedTeam.region || "Organization"}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 rounded-lg border border-border bg-background shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {/* Teams Header */}
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-semibold px-2">Teams</h3>
          </div>

          {/* Teams List */}
          <div className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : availableOffices.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No regional offices available
              </div>
            ) : (
              availableOffices.map((office) => {
                const isSelected = selectedOffice?.id === office.id;
                return (
                  <button
                    key={office.id}
                    onClick={() => handleTeamSelect(office)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left relative",
                      isSelected && "bg-muted/50"
                    )}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {office.name[0]?.toUpperCase() || "R"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{office.name}</p>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                        )}
                        {office.connectivityStatus === "offline" && (
                          <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" title="Offline" />
                        )}
                        {office.connectivityStatus === "limited" && (
                          <div className="h-2 w-2 rounded-full bg-yellow-500 flex-shrink-0" title="Limited connectivity" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {office.region || office.name}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Note: Regional office management is handled by administrators */}
          {user?.role === "administrator" && (
            <div className="p-2 border-t border-border">
              <button
                onClick={() => {
                  // TODO: Implement add regional office functionality for admins
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="font-medium">Add Regional Office</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

