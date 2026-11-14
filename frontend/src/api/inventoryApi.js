import API from "./api";

export const getInventory = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.bloodGroup && filters.bloodGroup !== "ALL") params.append("bloodGroup", filters.bloodGroup);
  if (filters.component && filters.component !== "ALL") params.append("component", filters.component);
  if (filters.status && filters.status !== "ALL") params.append("status", filters.status);

  const query = params.toString();
  const url = query ? `/api/inventory?${query}` : "/api/inventory";
  const response = await API.get(url);
  return response.data;
};

export const getInventorySummary = async () => {
  const response = await API.get("/api/inventory/summary");
  return response.data;
};

export const addBloodUnit = async (unitData) => {
  const response = await API.post("/api/inventory", unitData);
  return response.data;
};

export const updateBloodUnit = async (id, updateData) => {
  const response = await API.put(`/api/inventory/${id}`, updateData);
  return response.data;
};
