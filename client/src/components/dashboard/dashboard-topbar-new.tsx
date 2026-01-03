import { ProfileDropdown } from "./profile-dropdown";

interface DashboardTopbarProps {
  user: any;
}

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center gap-4">
          <ProfileDropdown user={user} />
        </div>
      </div>
    </header>
  );
}

