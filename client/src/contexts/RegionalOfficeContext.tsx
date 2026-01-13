import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface RegionalOffice {
  id: string;
  name: string;
  region?: string;
  connectivityStatus?: "online" | "offline" | "limited";
  dataProtectionLaws?: string[];
}

interface RegionalOfficeContextType {
  selectedOffice: RegionalOffice | null;
  availableOffices: RegionalOffice[];
  isGlobalView: boolean;
  setSelectedOffice: (office: RegionalOffice | null) => void;
  setAvailableOffices: (offices: RegionalOffice[]) => void;
  toggleGlobalView: () => void;
  canAccessGlobalView: boolean;
}

const RegionalOfficeContext = createContext<RegionalOfficeContextType | undefined>(undefined);

interface RegionalOfficeProviderProps {
  children: ReactNode;
  user: any;
}

export function RegionalOfficeProvider({ children, user }: RegionalOfficeProviderProps) {
  const [selectedOffice, setSelectedOfficeState] = useState<RegionalOffice | null>(null);
  const [availableOffices, setAvailableOffices] = useState<RegionalOffice[]>([]);
  const [isGlobalView, setIsGlobalView] = useState(false);

  // Determine if user can access global view (admins and knowledge champions)
  const canAccessGlobalView = 
    user?.role === "administrator" || 
    user?.role === "knowledge_champion" ||
    user?.role === "executive_leadership";

  // Load selected office from localStorage on mount
  useEffect(() => {
    const savedOffice = localStorage.getItem("dkn_selected_office");
    if (savedOffice) {
      try {
        setSelectedOfficeState(JSON.parse(savedOffice));
      } catch (e) {
        console.error("Failed to parse saved office:", e);
      }
    }
  }, []);

  // Save selected office to localStorage
  const setSelectedOffice = (office: RegionalOffice | null) => {
    setSelectedOfficeState(office);
    if (office) {
      localStorage.setItem("dkn_selected_office", JSON.stringify(office));
    } else {
      localStorage.removeItem("dkn_selected_office");
    }
    // Reset global view when changing office
    setIsGlobalView(false);
  };

  const toggleGlobalView = () => {
    if (canAccessGlobalView) {
      setIsGlobalView((prev) => !prev);
    }
  };

  return (
    <RegionalOfficeContext.Provider
      value={{
        selectedOffice,
        availableOffices,
        isGlobalView,
        setSelectedOffice,
        setAvailableOffices,
        toggleGlobalView,
        canAccessGlobalView,
      }}
    >
      {children}
    </RegionalOfficeContext.Provider>
  );
}

export function useRegionalOffice() {
  const context = useContext(RegionalOfficeContext);
  if (context === undefined) {
    throw new Error("useRegionalOffice must be used within a RegionalOfficeProvider");
  }
  return context;
}

/**
 * Safe version of useRegionalOffice that returns defaults if context is not available
 * Use this when the component might be used outside RegionalOfficeProvider
 */
export function useRegionalOfficeSafe() {
  const context = useContext(RegionalOfficeContext);
  if (context === undefined) {
    // Return safe defaults instead of throwing
    return {
      selectedOffice: null,
      availableOffices: [],
      isGlobalView: false,
      setSelectedOffice: () => {},
      setAvailableOffices: () => {},
      toggleGlobalView: () => {},
      canAccessGlobalView: false,
    };
  }
  return context;
}
