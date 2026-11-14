import API from "./api";

export const getCamps = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "ALL") params.append("status", filters.status);
  if (filters.city) params.append("city", filters.city);

  const query = params.toString();
  const url = query ? `/api/camps?${query}` : "/api/camps";
  const response = await API.get(url);
  return response.data;
};

export const createCamp = async (campData) => {
  const response = await API.post("/api/camps", campData);
  return response.data;
};

export const registerForCamp = async (id) => {
  const response = await API.post(`/api/camps/${id}/register`);
  return response.data;
};
