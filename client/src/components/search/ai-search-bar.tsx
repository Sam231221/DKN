import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Sparkles, Mic } from "lucide-react"

interface AISearchBarProps {
  onSearch: (query: string) => void
}

export function AISearchBar({ onSearch }: AISearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  const exampleQueries = [
    "How do we onboard new clients?",
    "What are the security protocols?",
    "API integration best practices",
  ]

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Ask anything about your organization's knowledge..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-base bg-background border-2 border-border focus:border-primary"
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2">
              <Mic className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          </div>
          <Button type="submit" size="lg" className="h-14 px-8">
            <Sparkles className="mr-2 h-5 w-5" />
            Search
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Try:</span>
        {exampleQueries.map((example, index) => (
          <button
            key={index}
            onClick={() => {
              setQuery(example)
              onSearch(example)
            }}
            className="text-sm px-3 py-1 rounded-full border border-border hover:bg-muted transition-colors"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}
