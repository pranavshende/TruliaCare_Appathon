export type Role = 'EMPLOYEE' | 'ADMIN' | 'TECHNICIAN';

export type Category = 'IT' | 'FACILITY' | 'ELECTRICAL' | 'PLUMBING' | 'HVAC' | 'OTHER';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED';

export type EscalationType = 'AUTOMATIC' | 'MANUAL';

export interface User {
  id: string;
  name?: string;
  email: string;
  role: Role;
}

export interface EscalationLog {
  id: string;
  requestId: string;
  previousStatus: RequestStatus;
  newStatus: RequestStatus;
  reason: string;
  escalatedTo?: string | null;
  escalationType: EscalationType;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: RequestStatus;
  employeeId: string;
  employee?: { id: string; name?: string; email: string };
  assignedTo?: string | null;
  assignedTechnician?: { id: string; name?: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
  escalatedAt?: string | null;
  escalationLogs?: EscalationLog[];
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  escalated: number;
  resolved: number;
}

export const CATEGORIES: Category[] = ['IT', 'FACILITY', 'ELECTRICAL', 'PLUMBING', 'HVAC', 'OTHER'];
export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const STATUSES: RequestStatus[] = ['PENDING', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'];
