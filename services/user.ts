import api from "./client"; // your axios instance with token interceptor

export async function fetchUserProfile() {
  const res = await api.get("/user/settings/profile");
  return res.data.data; // contains: { display_name, email, username }
}
