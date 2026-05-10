import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// For debugging: check if the URL is loaded correctly
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn("API URL is not defined! Check your .env.local file.");
}

export default api;
