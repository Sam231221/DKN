export interface DummyUser {
  email: string;
  password: string;
  name: string;
  role:
    | "client"
    | "employee"
    | "consultant"
    | "knowledge_champion"
    | "administrator";
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
    email: "mei.zhang@velion.com",
    password: "password123",
    name: "Mei Zhang",
    role: "employee",
  },
  {
    email: "anjali.patel@velion.com",
    password: "password123",
    name: "Anjali Patel",
    role: "consultant",
  },
  {
    email: "contact@ecopowersystems.com",
    password: "password123",
    name: "Lisa Anderson",
    role: "client",
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
