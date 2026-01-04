import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ArticleCard } from "@/components/explore/article-card"
import { FilterTabs } from "@/components/explore/filter-tabs"
import type { FilterType } from "@/components/explore/filter-tabs"

// Mock data for articles
const mockArticles = [
  {
    id: "1",
    title: "Getting Started with TypeScript: A Comprehensive Guide for Developers",
    author: "John Doe",
    tags: ["typescript", "programming", "web-development"],
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop",
    readTime: "8m",
    publishedAt: "Jan 02",
    upvotes: 142,
    comments: 23,
  },
  {
    id: "2",
    title: "Building Scalable React Applications with Modern Patterns",
    author: "Sarah Chen",
    tags: ["react", "javascript", "frontend"],
    readTime: "12m",
    publishedAt: "Jan 01",
    upvotes: 89,
    comments: 15,
  },
  {
    id: "3",
    title: "Understanding Async/Await in JavaScript: Best Practices",
    author: "Mike Johnson",
    tags: ["javascript", "async", "programming"],
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
    readTime: "6m",
    publishedAt: "Dec 30",
    upvotes: 67,
    comments: 12,
  },
  {
    id: "4",
    title: "Database Design Principles for Modern Applications",
    author: "Emily Davis",
    tags: ["database", "backend", "architecture"],
    readTime: "10m",
    publishedAt: "Dec 28",
    upvotes: 54,
    comments: 8,
  },
  {
    id: "5",
    title: "CSS Grid vs Flexbox: When to Use Which",
    author: "Alex Brown",
    tags: ["css", "frontend", "web-design"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    readTime: "5m",
    publishedAt: "Dec 27",
    upvotes: 43,
    comments: 7,
  },
  {
    id: "6",
    title: "Introduction to GraphQL: A Better Alternative to REST",
    author: "David Wilson",
    tags: ["graphql", "api", "backend"],
    readTime: "9m",
    publishedAt: "Dec 25",
    upvotes: 38,
    comments: 5,
  },
  {
    id: "7",
    title: "Docker Containerization: Simplifying Development Workflows",
    author: "Lisa Anderson",
    tags: ["docker", "devops", "containers"],
    image: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=400&fit=crop",
    readTime: "11m",
    publishedAt: "Dec 23",
    upvotes: 76,
    comments: 18,
  },
  {
    id: "8",
    title: "Python Best Practices: Writing Clean and Maintainable Code",
    author: "Chris Taylor",
    tags: ["python", "programming", "best-practices"],
    readTime: "7m",
    publishedAt: "Dec 21",
    upvotes: 61,
    comments: 14,
  },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>("popular")
  const [articles, setArticles] = useState(mockArticles)

  useEffect(() => {
    const userData = localStorage.getItem("dkn_user")
    if (!userData) {
      navigate("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [navigate])

  useEffect(() => {
    // Sort articles based on active filter
    const sorted = [...mockArticles].sort((a, b) => {
      switch (activeFilter) {
        case "popular":
          return (b.upvotes + b.comments) - (a.upvotes + a.comments)
        case "upvotes":
          return b.upvotes - a.upvotes
        case "comments":
          return b.comments - a.comments
        case "date":
          // Simple date comparison - assumes format like "Jan 02" or "Dec 30"
          // In a real app, you'd use proper date parsing
          return b.publishedAt.localeCompare(a.publishedAt)
        default:
          return 0
      }
    })
    setArticles(sorted)
  }, [activeFilter])

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
          <p className="text-muted-foreground mt-1">Discover knowledge repositories and trending topics</p>
        </div>

        {/* Filter Tabs */}
        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
