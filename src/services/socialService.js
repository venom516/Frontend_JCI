const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

export async function fetchSocialProfiles() {
  const res = await fetch(`${API_URL}/api/social/profiles`);
  if (!res.ok) throw new Error("Impossible de charger les données.");
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Impossible de charger les données.");

  const d = json.data;

  return {
    instagram: d.instagram
      ? {
          profileImage: d.instagram.profilePicture || "",
          username: d.instagram.username || "",
          fullName: d.instagram.name || "",
          followers: d.instagram.followers,
          posts: d.instagram.mediaCount,
          following: d.instagram.follows,
          url: d.instagram.url || "",
        }
      : null,
    linkedin: d.linkedin
      ? {
          profileImage: d.linkedin.logo || "",
          companyName: d.linkedin.name || "",
          followers: d.linkedin.followers,
          url: d.linkedin.url || "",
        }
      : null,
  };
}
