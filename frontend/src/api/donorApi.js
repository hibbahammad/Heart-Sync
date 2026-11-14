import API from "./api";

export const getAllDonors = async () => {
  const response = await API.get("/api/donors");
  return response.data;
};

export const searchDonors = async (city, bloodGroup) => {
  const cityParam = city ? `city=${encodeURIComponent(city.trim())}` : "";
  const bgParam = bloodGroup ? `bloodGroup=${encodeURIComponent(bloodGroup.trim())}` : "";
  const query = [cityParam, bgParam].filter(Boolean).join("&");
  const url = query ? `/api/donors/search?${query}` : "/api/donors";
  const response = await API.get(url);
  return response.data;
};

export const addDonor = async (donorData) => {
  const response = await API.post("/api/donors", donorData);
  return response.data;
};

export const deleteDonor = async (id) => {
  const response = await API.delete(`/api/donors/${id}`);
  return response.data;
};
