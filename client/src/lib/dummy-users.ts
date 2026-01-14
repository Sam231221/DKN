export interface DummyUser {
  email: string;
  password: string;
  name: string;
  role:
    | "consultant"
    | "knowledge_champion"
    | "administrator"
    | "executive_leadership"
    | "knowledge_council_member";
  avatar?: string;
  points?: number;
  contributions?: number;
}

export const DUMMY_USERS: DummyUser[] = [
  {
    email: "sarah.johnson@velion.com",
    password: "password123",
    name: "Sarah Johnson",
    role: "administrator",
  },
  {
    email: "wei.chen@velion.com",
    password: "password123",
    name: "Wei Chen",
    role: "knowledge_champion",
  },
  {
    email: "anjali.patel@velion.com",
    password: "password123",
    name: "Anjali Patel",
    role: "consultant",
  },
  {
    email: "david.martinez@velion.com",
    password: "password123",
    name: "David Martinez",
    role: "executive_leadership",
  },
  {
    email: "sophie.nielsen@velion.com",
    password: "password123",
    name: "Sophie Nielsen",
    role: "knowledge_council_member",
  },
];

export function authenticateUser(
  email: string,
  password: string
): DummyUser | null {
  const user = DUMMY_USERS.find(
    (u) => u.email === email && u.password === password
  );
  return user || null;
}
