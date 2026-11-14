import API from "./api";

export const getRequests = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "ALL") params.append("status", filters.status);
  if (filters.bloodGroup && filters.bloodGroup !== "ALL") params.append("bloodGroup", filters.bloodGroup);
  if (filters.urgency && filters.urgency !== "ALL") params.append("urgency", filters.urgency);
  if (filters.city) params.append("city", filters.city);

  const query = params.toString();
  const url = query ? `/api/requests?${query}` : "/api/requests";
  const response = await API.get(url);
  return response.data;
};

export const createRequest = async (requestData) => {
  const response = await API.post("/api/requests", requestData);
  return response.data;
};

export const updateRequestStatus = async (id, status, clinicalNotes = "") => {
  const response = await API.put(`/api/requests/${id}/status`, { status, clinicalNotes });
  return response.data;
};

export const fulfillRequest = async (id, unitIds, bloodBankId) => {
  const response = await API.post(`/api/requests/${id}/fulfill`, { unitIds, bloodBankId });
  return response.data;
};