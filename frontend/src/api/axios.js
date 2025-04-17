import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", // or your backend URL
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("401 Unauthorized detected"); // Debugging log
      localStorage.removeItem("token"); // Clear the token
      alert("Session expired. Please log in again."); // Show token expired warning
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"; // Redirect to login page
      }
    }
    return Promise.reject(error); // Reject the error to prevent further processing
  }
);

export default instance;
