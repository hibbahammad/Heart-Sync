import API from "./api";

export const getAdminMetrics = async () => {
  const response = await API.get("/api/admin/metrics");
  return response.data;
};

export const getUsers = async () => {
  const response = await API.get("/api/admin/users");
  return response.data;
};

export const updateUserRole = async (userId, updateData) => {
  const response = await API.put(`/api/admin/users/${userId}`, updateData);
  return response.data;
};

export const getAuditLogs = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.action) params.append("action", filters.action);
  if (filters.entityType) params.append("entityType", filters.entityType);

  const query = params.toString();
  const url = query ? `/api/admin/audit-logs?${query}` : "/api/admin/audit-logs";
  const response = await API.get(url);
  return response.data;
};
