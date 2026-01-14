import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRegionalOfficeSafe } from "@/contexts/RegionalOfficeContext";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Briefcase, FileText, FolderOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import {
  fetchUnifiedSearch,
  type SearchResult,
  type UnifiedSearchResponse,
} from "@/lib/api";

interface UnifiedSearchDropdownProps {
  className?: string;
  onSearch?: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
}

export function UnifiedSearchDropdown({
  className,
  onSearch,
  onResultClick,
}: UnifiedSearchDropdownProps) {
  const navigate = useNavigate();
  const { selectedOffice, isGlobalView } = useRegionalOfficeSafe();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnifiedSearchResponse>({
    projects: [],
    knowledgeItems: [],
    repositories: [],
  });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get all results as a flat array for keyboard navigation
  const allResults: SearchResult[] = [
    ...results.projects,
    ...results.knowledgeItems,
    ...results.repositories,
  ];

  // Fetch search results
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setResults({ projects: [], knowledgeItems: [], repositories: [] });
        setIsOpen(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const regionId = isGlobalView ? "all" : selectedOffice?.id;
        const searchResults = await fetchUnifiedSearch(debouncedQuery, regionId);
        setResults(searchResults);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults({ projects: [], knowledgeItems: [], repositories: [] });
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, selectedOffice, isGlobalView]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || allResults.length === 0) {
        if (e.key === "Enter" && query.trim().length >= 2) {
          e.preventDefault();
          if (onSearch) {
            onSearch(query);
          }
          navigate(`/dashboard/search?q=${encodeURIComponent(query)}`);
          setIsOpen(false);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allResults.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < allResults.length) {
            handleResultClick(allResults[selectedIndex]);
          } else if (query.trim().length >= 2) {
            if (onSearch) {
              onSearch(query);
            }
            navigate(`/dashboard/search?q=${encodeURIComponent(query)}`);
            setIsOpen(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, allResults, selectedIndex, query, onSearch, navigate]
  );

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      navigate(result.url);
    }
    setIsOpen(false);
    setQuery("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length >= 2) {
      // Will trigger search via debouncedQuery
    } else {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "project":
        return <Briefcase className="h-4 w-4" />;
      case "knowledge":
        return <FileText className="h-4 w-4" />;
      case "repository":
        return <FolderOpen className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "project":
        return "Projects";
      case "knowledge":
        return "Knowledge Items";
      case "repository":
        return "Repositories";
    }
  };

  const hasResults =
    results.projects.length > 0 ||
    results.knowledgeItems.length > 0 ||
    results.repositories.length > 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Find..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (hasResults && query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          className={cn(
            "w-64 pl-9 h-9 text-sm",
            query ? "pr-9" : "pr-12"
          )}
        />
        {query ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">F</span>
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (loading || hasResults || error) && (
        <div className="absolute top-full left-0 mt-2 w-96 rounded-md border border-border bg-background shadow-lg z-50 max-h-[500px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-destructive">{error}</div>
          )}

          {!loading && !error && (
            <>
              {hasResults ? (
                <div className="p-2">
                  {/* Projects */}
                  {results.projects.length > 0 && (
                    <div className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                        {getTypeLabel("project")} ({results.projects.length})
                      </div>
                      {results.projects.map((result, index) => {
                        const flatIndex = index;
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left hover:bg-muted transition-colors",
                              selectedIndex === flatIndex && "bg-muted"
                            )}
                          >
                            <div className="text-muted-foreground">
                              {getResultIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {result.title}
                              </div>
                              {result.subtitle && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {result.subtitle}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Knowledge Items */}
                  {results.knowledgeItems.length > 0 && (
                    <div className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                        {getTypeLabel("knowledge")} ({results.knowledgeItems.length})
                      </div>
                      {results.knowledgeItems.map((result, index) => {
                        const flatIndex = results.projects.length + index;
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left hover:bg-muted transition-colors",
                              selectedIndex === flatIndex && "bg-muted"
                            )}
                          >
                            <div className="text-muted-foreground">
                              {getResultIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {result.title}
                              </div>
                              {result.subtitle && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {result.subtitle}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Repositories */}
                  {results.repositories.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                        {getTypeLabel("repository")} ({results.repositories.length})
                      </div>
                      {results.repositories.map((result, index) => {
                        const flatIndex =
                          results.projects.length +
                          results.knowledgeItems.length +
                          index;
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left hover:bg-muted transition-colors",
                              selectedIndex === flatIndex && "bg-muted"
                            )}
                          >
                            <div className="text-muted-foreground">
                              {getResultIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {result.title}
                              </div>
                              {result.subtitle && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {result.subtitle}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
