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

export const DUMMY_USERS: DummyUser[] = [];

export function authenticateUser(
  email: string,
  password: string
): DummyUser | null {
  const user = DUMMY_USERS.find(
    (u) => u.email === email && u.password === password
  );
  return user || null;
}
