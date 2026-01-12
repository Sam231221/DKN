import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Plus } from "lucide-react";

interface Team {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isCurrent?: boolean;
}

interface TeamsDropdownProps {
  user: any;
  currentTeam?: Team;
  onTeamChange?: (team: Team) => void;
}

export function TeamsDropdown({ user, currentTeam, onTeamChange }: TeamsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default team based on user's organization or email
  const defaultTeam: Team = {
    id: "1",
    name: user.organizationName || user.name || user.email || "My Team",
    slug: user.organizationName?.toLowerCase().replace(/\s+/g, "-") || 
          user.email?.split("@")[0] || 
          "my-team",
    plan: "Hobby",
    isCurrent: true,
  };

  const selectedTeam = currentTeam || defaultTeam;

  // Mock teams - in production, this would come from an API
  const teams: Team[] = [
    selectedTeam,
    {
      id: "2",
      name: "Team Dimension",
      slug: "temdimension",
      plan: "Pro",
      isCurrent: false,
    },
  ];

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

  const handleTeamSelect = (team: Team) => {
    if (onTeamChange) {
      onTeamChange(team);
    }
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
            {selectedTeam.name}'s Team
          </p>
          <p className="text-xs text-muted-foreground truncate">{selectedTeam.plan}</p>
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
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left relative",
                  team.isCurrent && "bg-muted/50"
                )}
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">
                    {team.name[0]?.toUpperCase() || "T"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{team.name}</p>
                    {team.isCurrent && (
                      <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {team.plan} plan
                  </p>
                </div>
                {team.isCurrent && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Create Team Button */}
          <div className="p-2 border-t border-border">
            <button
              onClick={() => {
                // TODO: Implement create team functionality
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="font-medium">Create Team</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

