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
    email: "david.martinez@velion.com",
    password: "password123",
    name: "David Martinez",
    role: "administrator",
  },
  {
    email: "xiaoli.wu@velion.com",
    password: "password123",
    name: "Xiaoli Wu",
    role: "knowledge_champion",
  },
  {
    email: "oliver.jensen@velion.com",
    password: "password123",
    name: "Oliver Jensen",
    role: "consultant",
  },
  {
    email: "robert.thompson@velion.com",
    password: "password123",
    name: "Robert Thompson",
    role: "executive_leadership",
  },
  {
    email: "patricia.garcia@velion.com",
    password: "password123",
    name: "Patricia Garcia",
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
