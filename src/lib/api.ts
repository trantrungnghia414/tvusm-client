// src/lib/api.ts

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_URL = "http://localhost:3000";

export async function fetchApi(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  return response;
}