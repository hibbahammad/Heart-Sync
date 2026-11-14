import API from "./api";

export const getOrganizations = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== "ALL") params.append("type", filters.type);
  if (filters.city) params.append("city", filters.city);
  if (filters.search) params.append("search", filters.search);

  const query = params.toString();
  const url = query ? `/api/organizations?${query}` : "/api/organizations";
  const response = await API.get(url);
  return response.data;
};

export const createOrganization = async (orgData) => {
  const response = await API.post("/api/organizations", orgData);
  return response.data;
};

export const updateOrgStatus = async (id, verificationStatus) => {
  const response = await API.put(`/api/organizations/${id}/status`, { verificationStatus });
  return response.data;
};
