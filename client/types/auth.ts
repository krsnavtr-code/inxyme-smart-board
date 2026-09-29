export type RoleType = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  avatar?: string;
  headline?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: RoleType;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  role: RoleType;
  headline?: string;
}

export interface DemoAccount {
  name: string;
  email: string;
  role: RoleType;
  headline: string;
  avatar?: string;
  tag: string;
}
