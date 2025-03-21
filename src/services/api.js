// services/api.js
import axios from "axios";

const API_BASE_URL = "https://4n6n2dwrla.execute-api.us-west-1.amazonaws.com/stg";

// Create a single Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear the token from localStorage
      localStorage.removeItem("cognito_access_token");
      // Redirect to /admin/login (or your login path)
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

/** 
 * Now define your API calls using api instance, 
 * so they all get the interceptor 
 */
export const scanQRCode = (data) => {
  return api.post("/scan", data);
};

export const submitWinnerDetails = (data) => {
  return api.post("/submit-winner", data);
};

export const createQRCode = (prize_type) => {
  return api.post("/generate-qrcodes", { prize_type });
};

export const updateQRCode = (qr_code_id, prize_type) => {
  return api.post("/update-prize", { qr_code_id, prize_type });
};

export const fetchWinnersList = (config = {}) => {
  return api.get("/admin/winners", config);
};

export const adminReports = (config = {}) => {
  return api.get("/admin/reports", config);
};

export const fetchQRCodesList = (config = {}) => {
  return api.get("/admin/qr-codes", config);
};

export const updateWinnersDeliveryDate = (data, config = {}) => {
  return api.post("/admin/winners/delivery-date", data, config);
};
