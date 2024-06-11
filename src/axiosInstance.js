// axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "https://backend-9mwl.onrender.com/",
  baseURL: "http://localhost:3050/",
});

export default axiosInstance;

// export const weburl = "https://backend-9mwl.onrender.com/";
export const weburl = "http://localhost:3050/";
