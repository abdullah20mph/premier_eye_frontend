import api from "./client";

export async function fetchUserProfile() {
  const res = await api.get("/user/settings/profile");
  return res.data.data; // { display_name, email, username, ... }
}
