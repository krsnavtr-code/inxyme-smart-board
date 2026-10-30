export type RoleType =
  | "STUDENT"
  | "INSTRUCTOR"
  | "ADMIN"
  | "teacher"
  | "student"
  | "admin"
  | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  avatar?: string;
  headline?: string;
  isActive?: boolean;
  isApproved?: boolean;
  department?: string;
  originalRole?: string;
}

export interface InxymeWebsiteUser {
  _id: string;
  fullname: string;
  email: string;
  role: "teacher" | "student" | "admin" | "employee" | string;
  isActive: boolean;
  isApproved: boolean;
  department?: string;
  createdAt?: string;
  lastLogin?: string;
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
  isActive?: boolean;
  isApproved?: boolean;
}
