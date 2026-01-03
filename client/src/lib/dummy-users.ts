export interface DummyUser {
  email: string
  password: string
  name: string
  role: "client" | "employee" | "consultant" | "knowledge_champion" | "administrator"
  avatar?: string
  points?: number
  contributions?: number
}

export const DUMMY_USERS: DummyUser[] = [
  {
    email: "admin@velion.com",
    password: "admin123",
    name: "Sarah Johnson",
    role: "administrator",
    points: 2500,
    contributions: 142,
  },
  {
    email: "champion@velion.com",
    password: "champion123",
    name: "Michael Chen",
    role: "knowledge_champion",
    points: 1850,
    contributions: 98,
  },
  {
    email: "employee@velion.com",
    password: "employee123",
    name: "Emma Wilson",
    role: "employee",
    points: 1200,
    contributions: 56,
  },
  {
    email: "consultant@velion.com",
    password: "consultant123",
    name: "David Martinez",
    role: "consultant",
    points: 950,
    contributions: 42,
  },
  {
    email: "client@velion.com",
    password: "client123",
    name: "Lisa Anderson",
    role: "client",
    points: 450,
    contributions: 18,
  },
]

export function authenticateUser(email: string, password: string): DummyUser | null {
  const user = DUMMY_USERS.find((u) => u.email === email && u.password === password)
  return user || null
}

