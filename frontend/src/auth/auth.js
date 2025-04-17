import { jwtDecode } from "jwt-decode";

export const saveToken = (token) => {
  console.log("Saving token:", token); // Debug log
  localStorage.setItem("token", token);
};
export const getToken = () => localStorage.getItem("token");

export const getRole = () => {
  const token = localStorage.getItem("token");
  try {
    const decoded = jwtDecode(token);
    const subject = JSON.parse(decoded.sub); // Parse the stringified subject
    return subject.role; // Return the role
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
