import { apiFetch } from './api';
import type {
  Category,
  DashboardStats,
  EscalationLog,
  MaintenanceRequest,
  Priority,
  RequestStatus,
} from '../types';

async function unwrap<T>(res: Response, key: string): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return (data[key] ?? data) as T;
}

// ---- Employee ----

export const createRequest = (payload: {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
}) =>
  apiFetch('/requests', { method: 'POST', body: JSON.stringify(payload) }).then((r) =>
    unwrap<MaintenanceRequest>(r, 'request')
  );

export const getMyRequests = () =>
  apiFetch('/requests/my').then((r) => unwrap<MaintenanceRequest[]>(r, 'requests'));

export const getMyRequestById = (id: string) =>
  apiFetch(`/requests/${id}`).then((r) => unwrap<MaintenanceRequest>(r, 'request'));

// ---- Admin ----

export const getAdminDashboardStats = () =>
  apiFetch('/admin/dashboard').then((r) => unwrap<DashboardStats>(r, 'stats'));

export const getAdminRequests = (status?: RequestStatus | 'ALL') =>
  apiFetch(`/admin/requests${status && status !== 'ALL' ? `?status=${status}` : ''}`).then((r) =>
    unwrap<MaintenanceRequest[]>(r, 'requests')
  );

export const getAdminRequestById = (id: string) =>
  apiFetch(`/admin/requests/${id}`).then((r) => unwrap<MaintenanceRequest>(r, 'request'));

export const assignTechnician = (id: string, technicianId: string) =>
  apiFetch(`/admin/requests/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ technicianId }),
  }).then((r) => unwrap<MaintenanceRequest>(r, 'request'));

export const updateRequestStatus = (id: string, status: RequestStatus) =>
  apiFetch(`/admin/requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }).then((r) => unwrap<MaintenanceRequest>(r, 'request'));

export const escalateRequest = (id: string, reason: string) =>
  apiFetch(`/admin/requests/${id}/escalate`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }).then((r) => unwrap<MaintenanceRequest>(r, 'request'));

export const getTechnicians = () =>
  apiFetch('/admin/technicians').then((r) => unwrap<{ id: string; name?: string; email: string }[]>(r, 'technicians'));

export const getEscalations = () =>
  apiFetch('/admin/escalations').then((r) => unwrap<EscalationLog[]>(r, 'escalations'));
